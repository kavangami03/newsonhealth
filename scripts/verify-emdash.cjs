#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });

const colls = db.prepare('SELECT slug, label FROM _emdash_collections ORDER BY slug').all();
console.log('Collections registered:');
colls.forEach((c) => console.log(' ', c.slug, '->', c.label));

const pageColl = db.prepare("SELECT id FROM _emdash_collections WHERE slug='pages'").get();
const pageFields = db
	.prepare('SELECT slug, label FROM _emdash_fields WHERE collection_id = ? ORDER BY sort_order')
	.all(pageColl.id);
console.log('\npages fields:');
pageFields.forEach((f) => console.log(' ', f.slug, '->', f.label));

db.close();
