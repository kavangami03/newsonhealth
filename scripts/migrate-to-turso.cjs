#!/usr/bin/env node
/**
 * One-shot migration: local data.db  →  Turso (libSQL cloud).
 *
 * Two-pass approach so foreign-key constraints don't blow up:
 *   pass 1 → recreate every table schema on Turso (PRAGMA foreign_keys=OFF)
 *   pass 2 → INSERT OR REPLACE every row, still with FKs off
 *   end    → PRAGMA foreign_keys=ON
 */

const path = require("path");
const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
	console.error("Missing TURSO_URL or TURSO_AUTH_TOKEN env vars.");
	process.exit(1);
}

const localDbPath = path.join(__dirname, "..", "data.db");
console.log("Source :", localDbPath);
console.log("Target :", TURSO_URL);

const local = new Database(localDbPath, { readonly: true });
const remote = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

async function main() {
	const tables = local
		.prepare(
			`SELECT name, sql FROM sqlite_master
			 WHERE type='table'
			   AND name NOT LIKE 'sqlite_%'
			   AND name NOT LIKE '_emdash_fts_%'
			 ORDER BY name`
		)
		.all();

	console.log(`Found ${tables.length} tables to migrate.\n`);

	// Disable FK enforcement on Turso for the whole migration
	await remote.execute("PRAGMA foreign_keys = OFF");

	// PASS 1 — create every table schema first
	console.log("PASS 1 — creating tables");
	for (const { name, sql } of tables) {
		if (!sql) continue;
		try {
			await remote.execute(sql);
			process.stdout.write(`  ✓ ${name}\n`);
		} catch (e) {
			if (/already exists/i.test(String(e?.message))) {
				process.stdout.write(`  · ${name} (already exists)\n`);
			} else {
				console.error(`  ✗ ${name}: ${e?.message}`);
				throw e;
			}
		}
	}

	// PASS 2 — insert rows for every table
	console.log("\nPASS 2 — inserting rows");
	for (const { name } of tables) {
		const rows = local.prepare(`SELECT * FROM "${name}"`).all();
		if (rows.length === 0) {
			console.log(`  ${name.padEnd(40)} 0 rows`);
			continue;
		}

		const cols = Object.keys(rows[0]);
		const placeholders = cols.map(() => "?").join(", ");
		const insertSql = `INSERT OR REPLACE INTO "${name}" (${cols
			.map((c) => `"${c}"`)
			.join(", ")}) VALUES (${placeholders})`;

		const CHUNK = 50;
		for (let i = 0; i < rows.length; i += CHUNK) {
			// Prepend PRAGMA to each batch — libSQL is stateless over HTTP,
			// so connection-scoped PRAGMAs don't persist between calls.
			const batch = [
				{ sql: "PRAGMA defer_foreign_keys = ON" },
				...rows.slice(i, i + CHUNK).map((row) => ({
					sql: insertSql,
					args: cols.map((c) => {
						const v = row[c];
						return v === undefined ? null : v;
					}),
				})),
			];
			await remote.batch(batch, "write");
		}
		console.log(`  ${name.padEnd(40)} ${rows.length} rows`);
	}

	// Re-enable FKs
	await remote.execute("PRAGMA foreign_keys = ON");

	local.close();
	remote.close();
	console.log("\nMigration complete.");
}

main().catch((e) => {
	console.error("\nMIGRATION FAILED:", e);
	process.exit(1);
});
