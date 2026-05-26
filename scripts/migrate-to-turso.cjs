#!/usr/bin/env node
/**
 * One-shot migration: local data.db  →  Turso (libSQL cloud).
 *
 * USAGE
 *   1. Have these env vars set in your shell (or a .env you `source` first):
 *      TURSO_URL          libsql://your-db.turso.io
 *      TURSO_AUTH_TOKEN   <token from `turso db tokens create your-db`>
 *   2. Run:   node scripts/migrate-to-turso.cjs
 *
 * What it does
 *   - Opens local ./data.db (read-only)
 *   - Connects to your Turso DB
 *   - For every table in the local DB, creates the same table on Turso (idempotent)
 *     and INSERT-OR-REPLACEs every row.
 *   - Skips SQLite internal tables (sqlite_*).
 *
 * Safe to re-run. Existing rows are replaced by primary key.
 */

const path = require("path");
const Database = require("better-sqlite3");
const { createClient } = require("@libsql/client");

const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
	console.error("Missing TURSO_URL or TURSO_AUTH_TOKEN env vars.");
	console.error("Get them from: https://app.turso.tech → your DB → Connect.");
	process.exit(1);
}

const localDbPath = path.join(__dirname, "..", "data.db");
console.log("Source :", localDbPath);
console.log("Target :", TURSO_URL);

const local = new Database(localDbPath, { readonly: true });
const remote = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

async function main() {
	// List user tables (skip SQLite internals)
	const tables = local
		.prepare(
			`SELECT name FROM sqlite_master
			 WHERE type='table'
			   AND name NOT LIKE 'sqlite_%'
			   AND name NOT LIKE '_emdash_fts_%'
			 ORDER BY name`
		)
		.all();

	console.log(`Found ${tables.length} tables to migrate.\n`);

	for (const { name } of tables) {
		// Re-create the table schema on the remote
		const createSql = local
			.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`)
			.get(name)?.sql;
		if (!createSql) continue;

		try {
			await remote.execute(createSql);
		} catch (e) {
			// Table already exists — that's fine
			if (!/already exists/i.test(String(e?.message))) throw e;
		}

		// Copy all rows
		const rows = local.prepare(`SELECT * FROM "${name}"`).all();
		if (rows.length === 0) {
			console.log(`  ${name.padEnd(40)} 0 rows (table created, no data)`);
			continue;
		}

		const cols = Object.keys(rows[0]);
		const placeholders = cols.map(() => "?").join(", ");
		const insertSql = `INSERT OR REPLACE INTO "${name}" (${cols
			.map((c) => `"${c}"`)
			.join(", ")}) VALUES (${placeholders})`;

		// Batch into chunks of 50 (Turso has request limits)
		const CHUNK = 50;
		for (let i = 0; i < rows.length; i += CHUNK) {
			const batch = rows.slice(i, i + CHUNK).map((row) => ({
				sql: insertSql,
				args: cols.map((c) => row[c]),
			}));
			await remote.batch(batch, "write");
		}
		console.log(`  ${name.padEnd(40)} ${rows.length} rows`);
	}

	local.close();
	remote.close();
	console.log("\nMigration complete.");
}

main().catch((e) => {
	console.error("\nMIGRATION FAILED:", e);
	process.exit(1);
});
