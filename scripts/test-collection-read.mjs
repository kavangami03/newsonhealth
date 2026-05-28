/**
 * Call getEmDashCollection the same way the running site does, against the
 * local data.db. Tells us if the failure is in the EmDash runtime or in our
 * page code.
 */
import BetterSqlite3 from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.db");

const sqlite = new BetterSqlite3(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = new Kysely({ dialect: new SqliteDialect({ database: sqlite }) });

// Set the DB on the EmDash module's internal context. EmDash usually pulls
// the DB from Astro locals; in a script we have to inject it.
process.env.EMDASH_DATABASE_URL = `file:${dbPath}`;

const emdash = await import("emdash");

console.log("emdash exports relevant to us:", Object.keys(emdash).filter((k) => k.toLowerCase().includes("collection") || k.includes("Db")));

// Try the raw query — what does getEmDashCollection do?
try {
	const res = await emdash.getEmDashCollection("footer_links", { orderBy: { sort_order: "asc" } });
	console.log("\nfooter_links via getEmDashCollection:", JSON.stringify(res, null, 2).slice(0, 1500));
} catch (e) {
	console.error("\n✗ footer_links call failed:", e?.message ?? e);
	console.error(e?.stack);
}

try {
	const res = await emdash.getEmDashCollection("social_links", { orderBy: { sort_order: "asc" } });
	console.log("\nsocial_links via getEmDashCollection:", JSON.stringify(res, null, 2).slice(0, 1500));
} catch (e) {
	console.error("\n✗ social_links call failed:", e?.message ?? e);
}

await db.destroy();
sqlite.close();
