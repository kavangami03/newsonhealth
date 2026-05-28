const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "..", "data.db"));

console.log("── ec_footer_links rows ──");
const footers = db.prepare("SELECT slug, status, title, link, \"column\", sort_order FROM ec_footer_links ORDER BY \"column\", sort_order").all();
console.log(footers);
console.log("count:", footers.length);

console.log("\n── ec_social_links rows ──");
const socials = db.prepare("SELECT slug, status, title, link, sort_order FROM ec_social_links ORDER BY sort_order").all();
console.log(socials);
console.log("count:", socials.length);

console.log("\n── ec_brand_info rows ──");
const brand = db.prepare("SELECT * FROM ec_brand_info").all();
console.log(brand);

db.close();
