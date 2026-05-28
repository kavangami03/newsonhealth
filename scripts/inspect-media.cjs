const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "..", "data.db"));

console.log("All tables:");
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map((r) => r.name));

const mediaTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%media%'").all();
console.log("\nMedia-related tables:", mediaTable);

for (const t of mediaTable) {
	console.log(`\n${t.name} schema:`);
	console.log(db.prepare(`SELECT sql FROM sqlite_master WHERE name = '${t.name}'`).get().sql);
	const sample = db.prepare(`SELECT * FROM ${t.name} LIMIT 2`).all();
	console.log(`sample rows:`, sample);
}

console.log("\nAll image-ish fields:");
const fields = db.prepare(`
	SELECT c.slug AS collection, f.slug AS field, f.type, f.column_type, f.options
	FROM _emdash_fields f
	JOIN _emdash_collections c ON c.id = f.collection_id
	WHERE f.type IN ('image','file') OR f.slug LIKE '%image%' OR f.slug = 'photo' OR f.slug = 'logo'
	ORDER BY c.slug, f.slug
`).all();
console.log(fields);

console.log("\nSample row from clinicians (current image format):");
const cli = db.prepare("SELECT slug, image FROM ec_clinicians LIMIT 3").all();
console.log(cli);

db.close();
