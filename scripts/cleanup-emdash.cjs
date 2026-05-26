#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');
const db = new Database(DB_PATH);

const homepageColl = db.prepare("SELECT id FROM _emdash_collections WHERE slug='homepage'").get();
const pagesColl = db.prepare("SELECT id FROM _emdash_collections WHERE slug='pages'").get();

if (!homepageColl) {
	console.log('No homepage collection — already clean');
	process.exit(0);
}
if (!pagesColl) {
	console.log('ERROR: pages collection missing');
	process.exit(1);
}

const STRAY_PAGES_FIELDS = [
	'hero_subtitle', 'hero_title', 'hero_description',
	'clinicians_title', 'clinicians_description',
	'advice_title', 'advice_description',
	'founders_subtitle', 'founders_title', 'founders_quote',
	'founders_body', 'founders_button_text', 'founders_button_url',
];

const tx = db.transaction(() => {
	db.prepare('DELETE FROM _emdash_fields WHERE collection_id = ?').run(homepageColl.id);
	db.prepare('DELETE FROM _emdash_collections WHERE id = ?').run(homepageColl.id);
	db.exec('DROP TABLE IF EXISTS ec_homepage');

	const delField = db.prepare('DELETE FROM _emdash_fields WHERE collection_id = ? AND slug = ?');
	let removed = 0;
	for (const slug of STRAY_PAGES_FIELDS) {
		const r = delField.run(pagesColl.id, slug);
		if (r.changes) removed++;
	}
	console.log('Removed homepage collection (id:', homepageColl.id + ')');
	console.log('Removed', removed, 'stray fields from pages collection');
});

tx();
db.close();
console.log('Cleanup complete.');
