#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data.db'));

const r = db
	.prepare("UPDATE ec_home_sections SET image = NULL, secondary_image = NULL, updated_at = ? WHERE slug = 'founders'")
	.run(new Date().toISOString());

console.log('Cleared founders image fields. Rows updated:', r.changes);

// Also clear any draft revision that might be overriding the published row
const revs = db
	.prepare(
		"SELECT id FROM revisions WHERE collection = 'home_sections' AND content_id = (SELECT id FROM ec_home_sections WHERE slug = 'founders')"
	)
	.all();
console.log('Found', revs.length, 'revision rows for founders (informational; not modifying)');

db.close();
