#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });

const row = db.prepare("SELECT id, slug, status, title, image, secondary_image FROM ec_home_sections WHERE slug = 'founders'").get();
console.log('founders home_section row:');
console.log(row);
db.close();
