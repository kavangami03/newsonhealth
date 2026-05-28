#!/usr/bin/env node
/**
 * Apply seed/seed.json to the local database WITHOUT touching existing content.
 *
 * EmDash only auto-seeds when the DB is empty. Once you've populated it, adding
 * new collections to seed.json requires running this script to push the new
 * schema (and starter content) into the DB. Existing collections / fields /
 * entries are skipped — only new ones are inserted.
 *
 * Uses Kysely + better-sqlite3 directly (the same stack EmDash uses internally)
 * because emdash/db's `sqlite()` returns a config descriptor, not a live
 * connection.
 *
 * Auto-injects ULIDs onto content entries that don't have one.
 *
 * Usage:
 *   node scripts/apply-seed.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import BetterSqlite3 from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, "..", "seed", "seed.json");
const dbPath = join(__dirname, "..", "data.db");

// ── ULID generator (Crockford Base32) ─────────────────────────────────
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function encodeTime(time) {
	let str = "";
	for (let i = 9; i >= 0; i--) {
		const mod = time % 32;
		str = CROCKFORD[mod] + str;
		time = (time - mod) / 32;
	}
	return str;
}
function encodeRandom(len) {
	let str = "";
	const bytes = randomBytes(len);
	for (let i = 0; i < len; i++) str += CROCKFORD[bytes[i] % 32];
	return str;
}
function ulid() {
	return encodeTime(Date.now()) + encodeRandom(16);
}

// ── Load seed + inject missing ids ────────────────────────────────────
const seedData = JSON.parse(readFileSync(seedPath, "utf8"));
let injected = 0;
if (seedData.content && typeof seedData.content === "object") {
	for (const collection of Object.keys(seedData.content)) {
		const list = seedData.content[collection];
		if (!Array.isArray(list)) continue;
		for (const entry of list) {
			if (entry && typeof entry === "object" && !entry.id) {
				entry.id = ulid();
				injected++;
			}
		}
	}
}
if (injected) console.log(`◐ Injected ${injected} auto-generated ULIDs into content entries.`);

// ── Open a Kysely connection straight to data.db ──────────────────────
const sqlite = new BetterSqlite3(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
const db = new Kysely({ dialect: new SqliteDialect({ database: sqlite }) });

const { applySeed, validateSeed } = await import("emdash/seed");

const { valid, errors, warnings } = validateSeed(seedData);
if (warnings?.length) warnings.forEach((w) => console.warn("⚠ ", w));
if (!valid) {
	console.error("✗ Seed file is invalid:");
	errors?.forEach((e) => console.error("  -", e));
	process.exit(1);
}

console.log(`◐ Applying seed to local SQLite (idempotent — existing entries are skipped)...`);

try {
	const result = await applySeed(db, seedData, {
		includeContent: true,
		onConflict: "skip",
	});
	console.log("✓ Done.");
	console.log(JSON.stringify(result, null, 2));
} catch (err) {
	console.error("✗ applySeed failed:", err);
	process.exit(1);
} finally {
	await db.destroy().catch(() => {});
	sqlite.close();
}
