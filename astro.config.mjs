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
 *   VERCEL=1 (or any truthy)  → Vercel serverless adapter + Turso DB + S3/R2 storage
 *   otherwise                 → Node standalone + local SQLite + local uploads
 *
 * Required env vars in production (set in Vercel dashboard):
 *   TURSO_URL                 e.g. libsql://your-db.turso.io
 *   TURSO_AUTH_TOKEN          from `turso db tokens create <db>`
 *   S3_ENDPOINT               e.g. https://<account-id>.r2.cloudflarestorage.com
 *   S3_BUCKET                 your R2 bucket name
 *   S3_ACCESS_KEY_ID
 *   S3_SECRET_ACCESS_KEY
 *   S3_REGION                 "auto" for R2, the region name for AWS S3
 *   S3_PUBLIC_URL             public origin where bucket contents are served
 *   EMDASH_ENCRYPTION_KEY     same value as your local .env
 */

const isProduction = !!process.env.VERCEL;

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
	},

	image: {
		layout: "constrained",
		responsiveStyles: true,
	},

	integrations: [
		react(),
		emdash({
			database: isProduction
				? libsql({
						url: process.env.TURSO_URL,
						authToken: process.env.TURSO_AUTH_TOKEN,
					})
				: sqlite({ url: "file:./data.db" }),
			storage: isProduction
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
					}),
		}),
	],

	devToolbar: { enabled: false },
});
