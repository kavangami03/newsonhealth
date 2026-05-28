const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "..", "data.db"));

console.log("── All collections registered in EmDash ──");
const colls = db.prepare("SELECT slug, label, source, supports FROM _emdash_collections ORDER BY slug").all();
colls.forEach((c) => console.log(`  ${c.slug.padEnd(20)} label="${c.label}" source=${c.source} supports=${c.supports}`));

console.log("\n── Fields on footer_links ──");
const coll = db.prepare("SELECT id FROM _emdash_collections WHERE slug='footer_links'").get();
if (coll) {
	const fields = db.prepare("SELECT slug, label, type, column_type, required FROM _emdash_fields WHERE collection_id=? ORDER BY sort_order").all(coll.id);
	console.log(fields);
} else {
	console.log("  ✗ footer_links collection NOT FOUND in _emdash_collections");
}

console.log("\n── Fields on social_links ──");
const sl = db.prepare("SELECT id FROM _emdash_collections WHERE slug='social_links'").get();
if (sl) {
	const fields = db.prepare("SELECT slug, label, type, column_type, required FROM _emdash_fields WHERE collection_id=? ORDER BY sort_order").all(sl.id);
	console.log(fields);
} else {
	console.log("  ✗ social_links collection NOT FOUND");
}

console.log("\n── Direct query: footer_links published rows ──");
console.log(db.prepare("SELECT slug, title, link, \"column\" FROM ec_footer_links WHERE status='published'").all());

console.log("\n── Direct query: social_links published rows ──");
console.log(db.prepare("SELECT slug, title, link FROM ec_social_links WHERE status='published'").all());

db.close();
