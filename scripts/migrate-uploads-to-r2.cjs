#!/usr/bin/env node
/**
 * One-shot migration: local ./uploads/  →  Cloudflare R2 (or any S3 bucket).
 *
 * USAGE
 *   1. Set env vars:
 *      S3_ENDPOINT          e.g. https://<account-id>.r2.cloudflarestorage.com
 *      S3_BUCKET            your bucket name
 *      S3_ACCESS_KEY_ID
 *      S3_SECRET_ACCESS_KEY
 *      S3_REGION            "auto" for R2, region name for AWS S3
 *   2. Run:   node scripts/migrate-uploads-to-r2.cjs
 *
 * Recursively uploads every file under ./uploads, preserving paths.
 * Idempotent — re-running re-uploads (overwriting) all files.
 */

const fs = require("fs");
const path = require("path");
const mime = require("mime/lite");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const required = ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
for (const k of required) {
	if (!process.env[k]) {
		console.error(`Missing env var: ${k}`);
		process.exit(1);
	}
}

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
	console.log("No ./uploads/ directory — nothing to migrate. Exit.");
	process.exit(0);
}

const s3 = new S3Client({
	endpoint: process.env.S3_ENDPOINT,
	region: process.env.S3_REGION ?? "auto",
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	},
});

function* walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walk(full);
		} else {
			yield full;
		}
	}
}

async function main() {
	let count = 0;
	let bytes = 0;
	for (const filePath of walk(UPLOADS_DIR)) {
		const key = path.relative(UPLOADS_DIR, filePath).replace(/\\/g, "/");
		const body = fs.readFileSync(filePath);
		const contentType = mime.getType(filePath) ?? "application/octet-stream";
		await s3.send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: key,
				Body: body,
				ContentType: contentType,
			})
		);
		count++;
		bytes += body.length;
		console.log(`  ${key.padEnd(60)} ${(body.length / 1024).toFixed(1)} KB`);
	}
	console.log(`\nUploaded ${count} files, ${(bytes / 1024 / 1024).toFixed(2)} MB total.`);
}

main().catch((e) => {
	console.error("UPLOAD FAILED:", e);
	process.exit(1);
});
