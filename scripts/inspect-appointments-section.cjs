#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'data.db'), { readonly: true });
const row = db.prepare("SELECT id, slug, image, secondary_image FROM ec_home_sections WHERE slug = 'appointments'").get();
console.log(row);
db.close();
