#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });

// Just show home_sections entry IDs/slugs so we know what's already there
const sections = db.prepare('SELECT id, slug, title FROM ec_home_sections ORDER BY id').all();
console.log('home_sections entries:');
sections.forEach((s) => console.log(' ', s.id || '(no id)', '|', s.slug, '|', s.title));

db.close();
