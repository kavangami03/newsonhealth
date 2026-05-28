#!/usr/bin/env node
/**
 * Patch: add the `content` text column to ec_page_intros and register it
 * in _emdash_fields. Only needed once — the next applySeed run will pick
 * it up automatically going forward.
 */
const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.join(__dirname, "..", "data.db");
const db = new Database(dbPath);

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid() {
	let time = Date.now();
	let t = "";
	for (let i = 9; i >= 0; i--) {
		const mod = time % 32;
		t = CROCKFORD[mod] + t;
		time = (time - mod) / 32;
	}
	const bytes = crypto.randomBytes(16);
	let r = "";
	for (let i = 0; i < 16; i++) r += CROCKFORD[bytes[i] % 32];
	return t + r;
}

const coll = db.prepare("SELECT id FROM _emdash_collections WHERE slug = 'page_intros'").get();
if (!coll) {
	console.error("page_intros collection not found — run apply-seed.mjs first");
	process.exit(1);
}

const existing = db.prepare("SELECT id FROM _emdash_fields WHERE collection_id = ? AND slug = 'content'").get(coll.id);
if (existing) {
	console.log("content field already registered, nothing to do");
	process.exit(0);
}

const tableInfo = db.prepare("PRAGMA table_info(ec_page_intros)").all();
const hasColumn = tableInfo.some((c) => c.name === "content");

const tx = db.transaction(() => {
	if (!hasColumn) {
		db.exec("ALTER TABLE ec_page_intros ADD COLUMN content TEXT");
		console.log("✓ added column ec_page_intros.content");
	}
	db.prepare(`
		INSERT INTO _emdash_fields (id, collection_id, slug, label, type, column_type, required, sort_order, created_at)
		VALUES (?, ?, 'content', 'Secondary Body (post-sidebar widget)', 'text', 'TEXT', 0, 99, datetime('now'))
	`).run(ulid(), coll.id);
	console.log("✓ registered _emdash_fields row for page_intros.content");
});

tx();
db.close();
console.log("Patch complete. Re-run scripts/apply-seed.mjs to insert remaining content.");
