#!/usr/bin/env node
/**
 * One-shot migration: convert all string-URL image fields into proper EmDash
 * media references with drag-and-drop support in the admin.
 *
 * What it does:
 *   1. Finds every entry whose image / secondary_image / etc. is a plain URL.
 *   2. Downloads the image once per unique URL (deduped by content hash).
 *   3. Writes the bytes into ./uploads/<storage_key>.
 *   4. Inserts a row in the `media` table.
 *   5. Rewrites the entry's field value to the JSON shape EmDash expects:
 *      {"id":"<media-id>","src":"/_emdash/api/media/file/<storage_key>","alt":"","width":...,"height":...}
 *   6. Updates `_emdash_fields.type` from "string" → "image" so the admin
 *      renders the upload widget on those fields.
 *
 * Safe to re-run. Already-migrated entries (whose value is already JSON) are
 * skipped. Failed downloads are reported but don't abort the run.
 */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const dbPath = path.join(ROOT, "data.db");
const uploadsDir = path.join(ROOT, "uploads");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── ULID generator (Crockford Base32) ─────────────────────────────────
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
function ulid() {
	let time = Date.now();
	let t = "";
	for (let i = 9; i >= 0; i--) {
		const mod = time % 32;
		t = CROCKFORD[mod] + t;
		time = (time - mod) / 32;
	}
	const bytes = crypto.randomBytes(16);
	let r = "";
	for (let i = 0; i < 16; i++) r += CROCKFORD[bytes[i] % 32];
	return t + r;
}

// ── MIME / extension helpers ───────────────────────────────────────────
function mimeFromExt(ext) {
	const m = {
		jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
		gif: "image/gif", webp: "image/webp", avif: "image/avif",
		svg: "image/svg+xml",
	}[ext.toLowerCase().replace(/^\./, "")];
	return m || "application/octet-stream";
}
function extFromMime(mime) {
	const m = {
		"image/jpeg": "jpg", "image/png": "png", "image/gif": "gif",
		"image/webp": "webp", "image/avif": "avif", "image/svg+xml": "svg",
	}[mime];
	return m || "bin";
}
function extFromUrl(url) {
	try {
		const u = new URL(url);
		const last = u.pathname.split("/").pop() || "";
		const dotIdx = last.lastIndexOf(".");
		if (dotIdx > 0) return last.slice(dotIdx + 1).split(/[?#]/)[0];
	} catch {}
	return "jpg";
}
function filenameFromUrl(url) {
	try {
		const u = new URL(url);
		const last = decodeURIComponent(u.pathname.split("/").pop() || "");
		return last || "image";
	} catch {
		return "image";
	}
}

// ── Image fields to migrate ───────────────────────────────────────────
const TARGETS = [
	{ collection: "clinicians", field: "image" },
	{ collection: "clinics", field: "image" },
	{ collection: "home_sections", field: "image" },
	{ collection: "home_sections", field: "secondary_image" },
	{ collection: "page_intros", field: "image" },
	{ collection: "services", field: "image" },
];

// ── Detect what's already an image-shape JSON object ──────────────────
function isAlreadyMediaRef(value) {
	if (!value || typeof value !== "string") return false;
	const trimmed = value.trim();
	if (!trimmed.startsWith("{")) return false;
	try {
		const parsed = JSON.parse(trimmed);
		return parsed && typeof parsed === "object" && (parsed.id || parsed.src);
	} catch {
		return false;
	}
}

// ── Download URL → buffer ─────────────────────────────────────────────
async function downloadUrl(url) {
	const res = await fetch(url, { redirect: "follow" });
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
	const contentType = res.headers.get("content-type") || "";
	const buf = Buffer.from(await res.arrayBuffer());
	return { buf, contentType: contentType.split(";")[0].trim() };
}

// ── Cache of url → media-id (within this run) and content-hash → existing media ──
const urlCache = new Map();

function findExistingMediaByHash(hash) {
	return db.prepare("SELECT id, storage_key, width, height FROM media WHERE content_hash = ?").get(hash);
}

const insertMedia = db.prepare(`
	INSERT INTO media (id, filename, mime_type, size, width, height, alt, caption, storage_key, content_hash, created_at, status)
	VALUES (@id, @filename, @mime_type, @size, @width, @height, @alt, @caption, @storage_key, @content_hash, datetime('now'), 'ready')
`);

async function urlToMediaRef(url) {
	if (urlCache.has(url)) return urlCache.get(url);

	const { buf, contentType } = await downloadUrl(url);
	const mime = contentType.startsWith("image/") ? contentType : mimeFromExt(extFromUrl(url));
	const sha1 = crypto.createHash("sha1").update(buf).digest("hex");
	const contentHash = `sha1:${sha1}`;

	// Reuse existing media if we've already uploaded this exact file before
	const existing = findExistingMediaByHash(contentHash);
	if (existing) {
		const ref = {
			id: existing.id,
			src: `/_emdash/api/media/file/${existing.storage_key}`,
			alt: "",
			width: existing.width ?? undefined,
			height: existing.height ?? undefined,
		};
		urlCache.set(url, ref);
		return ref;
	}

	// Save the bytes
	const id = ulid();
	const ext = extFromMime(mime);
	const storageKey = `${id}.${ext}`;
	fs.writeFileSync(path.join(uploadsDir, storageKey), buf);

	insertMedia.run({
		id,
		filename: filenameFromUrl(url),
		mime_type: mime,
		size: buf.length,
		width: null,
		height: null,
		alt: null,
		caption: null,
		storage_key: storageKey,
		content_hash: contentHash,
	});

	const ref = { id, src: `/_emdash/api/media/file/${storageKey}`, alt: "" };
	urlCache.set(url, ref);
	return ref;
}

// ── Process each target field ──────────────────────────────────────────
const stats = { migrated: 0, skipped: 0, alreadyMigrated: 0, failed: 0, deduped: 0 };
const failedUrls = [];

async function migrateField(collection, field) {
	const rows = db.prepare(`SELECT id, slug, ${field} AS value FROM ec_${collection} WHERE ${field} IS NOT NULL AND ${field} != ''`).all();
	const update = db.prepare(`UPDATE ec_${collection} SET ${field} = ? WHERE id = ?`);

	for (const row of rows) {
		const value = row.value;
		if (isAlreadyMediaRef(value)) {
			stats.alreadyMigrated++;
			continue;
		}
		if (typeof value !== "string" || !value.startsWith("http")) {
			// Local path (already inside uploads) or empty — leave it
			stats.skipped++;
			continue;
		}
		try {
			const ref = await urlToMediaRef(value);
			update.run(JSON.stringify(ref), row.id);
			stats.migrated++;
			console.log(`  ✓ ${collection}/${row.slug || row.id} ${field}`);
		} catch (err) {
			stats.failed++;
			failedUrls.push({ collection, slug: row.slug, field, url: value, error: err.message });
			console.warn(`  ✗ ${collection}/${row.slug || row.id} ${field}: ${err.message}`);
		}
	}
}

(async () => {
	for (const t of TARGETS) {
		console.log(`\n◐ Migrating ${t.collection}.${t.field}...`);
		await migrateField(t.collection, t.field);
	}

	// Flip field types from "string" → "image" so the admin shows the upload widget
	const flip = db.prepare(`
		UPDATE _emdash_fields
		SET type = 'image'
		WHERE collection_id = (SELECT id FROM _emdash_collections WHERE slug = ?)
		  AND slug = ?
	`);
	console.log("\n◐ Switching field types string → image...");
	for (const t of TARGETS) {
		const r = flip.run(t.collection, t.field);
		console.log(`  ${t.collection}.${t.field}: ${r.changes ? "updated" : "no change (already image?)"}`);
	}

	console.log("\n────────────────────────────");
	console.log("✓ Migration complete");
	console.log("Stats:", stats);
	if (failedUrls.length) {
		console.log("\nFailed URLs (you can fix these in the admin by uploading manually):");
		failedUrls.forEach((f) => console.log(`  - ${f.collection}.${f.field} (${f.slug}): ${f.url}\n    → ${f.error}`));
	}
	db.close();
})().catch((err) => {
	console.error("Fatal:", err);
	db.close();
	process.exit(1);
});
