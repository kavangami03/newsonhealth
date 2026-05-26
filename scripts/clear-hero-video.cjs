#!/usr/bin/env node
/**
 * Clear the hero section's video_url field so the page falls back to the
 * code default '/hero-banner-video.mp4' (served from /public).
 *
 * Updates BOTH local data.db AND Turso (if TURSO env vars are set).
 *
 * Usage:
 *   node scripts/clear-hero-video.cjs                     # local only
 *   TURSO_URL=… TURSO_AUTH_TOKEN=… node scripts/clear-hero-video.cjs  # both
 */
const path = require("path");
const fs = require("fs");

const localDbPath = path.join(__dirname, "..", "data.db");

// Local
if (fs.existsSync(localDbPath)) {
	const Database = require("better-sqlite3");
	const local = new Database(localDbPath);
	const r = local
		.prepare("UPDATE ec_home_sections SET video_url = NULL, updated_at = ? WHERE slug = 'hero'")
		.run(new Date().toISOString());
	console.log("Local data.db  : cleared hero video_url (rows affected:", r.changes + ")");
	local.close();
} else {
	console.log("Local data.db  : not found, skipping");
}

// Turso
(async () => {
	if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
		console.log("Turso          : env vars not set, skipping");
		return;
	}
	const { createClient } = require("@libsql/client");
	const remote = createClient({
		url: process.env.TURSO_URL,
		authToken: process.env.TURSO_AUTH_TOKEN,
	});
	const r = await remote.execute({
		sql: "UPDATE ec_home_sections SET video_url = NULL, updated_at = ? WHERE slug = 'hero'",
		args: [new Date().toISOString()],
	});
	console.log("Turso          : cleared hero video_url (rows affected:", r.rowsAffected + ")");
	remote.close();
})();
