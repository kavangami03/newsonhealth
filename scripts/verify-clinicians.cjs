#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });
const rows = db.prepare('SELECT slug, name, credentials, substr(image, -50) AS img FROM ec_clinicians ORDER BY created_at').all();
console.log('Total clinicians:', rows.length, '\n');
rows.forEach((r) => console.log(' -', r.slug.padEnd(20), '|', r.name.padEnd(25), '|', r.img));
db.close();
