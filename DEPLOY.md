# Deploying to Vercel + Turso + Cloudflare R2

The local dev setup (SQLite + `./uploads/`) won't work on Vercel because Vercel
functions run on an ephemeral, read-only filesystem. This guide migrates you to
the production stack with the same code, switched on/off by a single env var
(`VERCEL`, which Vercel sets automatically).

| Concern  | Local dev               | Production                                   |
| -------- | ----------------------- | -------------------------------------------- |
| Host     | `astro dev`             | Vercel (serverless)                          |
| DB       | `./data.db` (SQLite)    | **Turso** (libSQL cloud, 500 MB free)        |
| Uploads  | `./uploads/` directory  | **Cloudflare R2** (S3-compatible, 10 GB free) |
| Adapter  | `@astrojs/node`         | `@astrojs/vercel`                            |

Estimated time: **30–60 min**, mostly waiting on signups. Cost at low traffic: **£0/month**.

---

## Step 1 — Create a Turso database (~5 min)

1. Go to <https://turso.tech> → Sign up (GitHub login is fastest).
2. Install the CLI:
   ```bash
   # Windows (PowerShell)
   irm get.tur.so/install.ps1 | iex
   # macOS / Linux
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Log in:
   ```bash
   turso auth login
   ```
4. Create the database (pick a region near your users; `lhr` = London):
   ```bash
   turso db create newsonhealth --location lhr
   ```
5. Grab the connection details:
   ```bash
   turso db show newsonhealth --url
   turso db tokens create newsonhealth
   ```
   Keep both values handy — they're `TURSO_URL` and `TURSO_AUTH_TOKEN`.

## Step 2 — Migrate your local data to Turso (~2 min)

```bash
# Set the env vars (PowerShell)
$env:TURSO_URL = "libsql://newsonhealth-yourorg.turso.io"
$env:TURSO_AUTH_TOKEN = "eyJhbGciOi..."

# Run the migration
node scripts/migrate-to-turso.cjs
```

You'll see every table copied row-by-row. **All your CMS content (10 clinicians,
9 services, 6 clinics, 8 FAQs, etc.) is now in Turso.**

## Step 3 — Create a Cloudflare R2 bucket (~10 min)

1. Sign up at <https://dash.cloudflare.com> → R2 in the sidebar.
2. **Enable R2** (requires adding a payment method, but the 10 GB tier is free).
3. **Create bucket** → name it `newsonhealth-media` (or whatever) → "Automatic"
   region.
4. **Settings → Public access → Allow access** → enable `r2.dev`. Copy the public
   `https://pub-xxxxxxxxxxxx.r2.dev` URL — that's `S3_PUBLIC_URL`.
5. Go to **R2 → Manage R2 API Tokens** → **Create API Token**:
   - Permissions: **Object Read & Write**
   - Bucket: the one you created
6. Save the **Access Key ID**, **Secret Access Key**, and **jurisdictional
   endpoint** (looks like `https://<account-id>.r2.cloudflarestorage.com`).

## Step 4 — Migrate local uploads to R2 (~1 min)

If your `./uploads/` is empty (you haven't uploaded any media via the admin),
**skip this step**.

```bash
$env:S3_ENDPOINT = "https://<account-id>.r2.cloudflarestorage.com"
$env:S3_BUCKET = "newsonhealth-media"
$env:S3_ACCESS_KEY_ID = "..."
$env:S3_SECRET_ACCESS_KEY = "..."
$env:S3_REGION = "auto"

node scripts/migrate-uploads-to-r2.cjs
```

## Step 5 — Deploy on Vercel (~10 min)

1. <https://vercel.com> → Sign up with GitHub.
2. **Import Project** → pick `kavangami03/newsonhealth`.
3. **Framework Preset**: Astro (auto-detected). **Build Command**, **Output
   Directory**: leave defaults.
4. **Environment Variables** — add all of these:

   | Variable                | Value                                                              |
   | ----------------------- | ------------------------------------------------------------------ |
   | `TURSO_URL`             | from Step 1                                                        |
   | `TURSO_AUTH_TOKEN`      | from Step 1                                                        |
   | `S3_ENDPOINT`           | from Step 3 (Cloudflare's jurisdictional endpoint URL)             |
   | `S3_BUCKET`             | the bucket name                                                    |
   | `S3_ACCESS_KEY_ID`      | from Step 3                                                        |
   | `S3_SECRET_ACCESS_KEY`  | from Step 3                                                        |
   | `S3_REGION`             | `auto`                                                             |
   | `S3_PUBLIC_URL`         | from Step 3 (the `r2.dev` URL — note: no trailing slash)            |
   | `EMDASH_ENCRYPTION_KEY` | **same value as your local `.env`** (otherwise old encrypted records become unreadable) |

5. Click **Deploy**. First build takes ~2 min.
6. Visit the URL Vercel gives you. The site should render with all your CMS
   content. The admin (`/_emdash/admin`) should work too.

## Step 6 — (optional) Custom domain

Vercel → your project → **Settings → Domains** → add `newsonhealth.co.uk`
(or whatever). Vercel walks you through the DNS records.

---

## Common issues

**Empty pages / 500 errors after first deploy.**
Check Vercel **Logs**. Most common: a missing or misspelled env var. Vercel
build vs runtime env vars are configured separately — make sure each one is
checked for "Production".

**Old uploaded images don't appear.**
You skipped Step 4, or `S3_PUBLIC_URL` is wrong. The URL must be the public
read-only origin where the bucket is served, with no trailing slash.

**Encrypted CMS fields are empty.**
You changed `EMDASH_ENCRYPTION_KEY` between local and production. Set it back
to the same value as your local `.env`.

**Admin login doesn't persist.**
This is expected — Vercel functions are stateless. Emdash sessions are stored
in the DB (Turso), so this should "just work" as long as Turso is reachable.

## Reverting

To roll back to local dev, you don't need to change anything: leave
`process.env.VERCEL` unset (it's only set by Vercel) and `astro dev` keeps
using local SQLite and `./uploads/`. Both stacks coexist in `astro.config.mjs`.
