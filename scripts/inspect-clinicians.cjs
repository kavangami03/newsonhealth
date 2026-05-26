#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });
const cols = db.prepare('PRAGMA table_info(ec_clinicians)').all().map(c => c.name);
console.log('columns:', cols.join(', '), '\n');
const rows = db.prepare('SELECT id, slug, status, name, role, credentials FROM ec_clinicians ORDER BY id').all();
rows.forEach((r) => console.log(r.id, '|', r.slug, '|', r.status, '|', r.name, '|', r.role, '|', r.credentials));
db.close();
