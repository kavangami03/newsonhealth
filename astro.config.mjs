import node from "@astrojs/node";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import emdash, { local, s3 } from "emdash/astro";
import { libsql, sqlite } from "emdash/db";

/**
 * Environment-driven adapter & storage selection.
 *
 *   VERCEL=1 (set automatically by Vercel)  → vercel adapter + Turso DB + optional S3
 *   otherwise                                → node standalone + local SQLite + local uploads
 *
 * Required env vars in production (set in Vercel dashboard):
 *   TURSO_URL                 e.g. libsql://your-db.turso.io
 *   TURSO_AUTH_TOKEN          from `turso db tokens create <db>`
 *   EMDASH_ENCRYPTION_KEY     same value as your local .env
 *
 * Optional (for cloud media storage — falls back to local if missing):
 *   S3_ENDPOINT  S3_BUCKET  S3_ACCESS_KEY_ID  S3_SECRET_ACCESS_KEY
 *   S3_REGION (defaults to "auto")  S3_PUBLIC_URL
 */

const isProduction = !!process.env.VERCEL;
const hasS3Storage = !!(
	process.env.S3_ENDPOINT &&
	process.env.S3_BUCKET &&
	process.env.S3_ACCESS_KEY_ID &&
	process.env.S3_SECRET_ACCESS_KEY
);

const database = isProduction
	? libsql({
			url: process.env.TURSO_URL,
			authToken: process.env.TURSO_AUTH_TOKEN,
		})
	: sqlite({ url: "file:./data.db" });

const storage = hasS3Storage
	? s3({
			endpoint: process.env.S3_ENDPOINT,
			bucket: process.env.S3_BUCKET,
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			region: process.env.S3_REGION ?? "auto",
			publicUrl: process.env.S3_PUBLIC_URL,
		})
	: local({
			directory: "./uploads",
			baseUrl: "/_emdash/api/media/file",
		});

export default defineConfig({
	output: "server",
	adapter: isProduction
		? vercel({
				webAnalytics: { enabled: true },
				imageService: true,
			})
		: node({ mode: "standalone" }),

	vite: {
		plugins: [tailwindcss()],
		// Prevent Vercel from trying to bundle better-sqlite3 (used only by the
		// local sqlite() driver — never called in production). Without this,
		// the serverless function tries to load the .node binary at cold-start
		// and crashes.
		ssr: {
			external: ["better-sqlite3"],
			noExternal: isProduction ? [] : undefined,
		},
		build: {
			rollupOptions: {
				external: isProduction ? ["better-sqlite3"] : [],
			},
		},
	},

	image: {
		layout: "constrained",
		responsiveStyles: true,
	},

	integrations: [
		react(),
		emdash({ database, storage }),
	],

	devToolbar: { enabled: false },
});
