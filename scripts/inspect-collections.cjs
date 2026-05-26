#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });
const rows = db
	.prepare('SELECT slug, label, label_singular, icon, source, created_at FROM _emdash_collections ORDER BY created_at')
	.all();

console.log('Current collections (created_at order):\n');
rows.forEach((r) => {
	console.log(
		'  slug:', r.slug.padEnd(15),
		'| label:', String(r.label).padEnd(20),
		'| icon:', String(r.icon || '(none)').padEnd(15),
		'| source:', r.source
	);
});

db.close();
