# Genaan (جنان)

A bilingual (Arabic-first, English) plant store for Egypt with two services:

1. **Workplace bundles**: fixed-price bundles of indoor plants and palms chosen by the admin for offices, clinics, cafés, hotels and shops, sized by floor area. Pots and placement are included.
2. **Garden and land planting**: a priced catalogue of fruit and ornamental trees sold one by one, plus planting bundles sized by area (from home gardens to a full feddan). Customers can choose to have the trees planted.

Delivery fees (per delivery area) and planting fees (per tree, an optional per-order visit fee, and per-tree overrides) are set by the admin in the dashboard. Customers see every fee before they confirm. Orders are paid cash on delivery or by transfer after a confirmation call; there is no online payment.

## Stack

- Next.js 16 (App Router, server actions, `proxy.ts`), React 19, Tailwind CSS 4
- Own backend inside the Next.js app (no Supabase): Drizzle ORM on SQLite/libSQL
  - Local development: a SQLite file at `data/genaan.db`
  - Production: a [Turso](https://turso.tech) libSQL database (`DATABASE_URL=libsql://…` plus `DATABASE_AUTH_TOKEN`)
- Admin sign-in: scrypt password hashes and an HMAC-signed, httpOnly session cookie, checked against the database on every request. Changing a password signs out other sessions.
- Dashboard photo uploads are resized to WebP in the browser, stored in the database and served from `/media/<id>` with immutable caching.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:setup             # creates tables and the starter catalogue, zones and admin
npm run dev
```

Open http://localhost:3000 for the store and http://localhost:3000/admin for the dashboard.

| Script | What it does |
| --- | --- |
| `npm run db:generate` | Generates a SQL migration in `drizzle/` after you change `app/lib/db/schema.ts` |
| `npm run db:migrate` | Applies migrations to `DATABASE_URL` |
| `npm run db:seed` | Adds the starter catalogue, bundles, delivery zones and fee settings to an empty database, and creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| `npm run admin:create` | Creates that admin, or resets its password and signs out its sessions |
| `npm run typecheck`, `npm run lint`, `npm run build` | Checks |

The seed never overwrites existing rows, so it is safe to run again; prices and content changed in the dashboard are kept.

## Deploying (Vercel + Turso)

1. Create a Turso database and an auth token.
2. From your machine, run migrations and the seed against it:
   ```bash
   DATABASE_URL=libsql://<db>.turso.io DATABASE_AUTH_TOKEN=<token> ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:setup
   ```
3. In Vercel, set `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `SESSION_SECRET` and `SITE_URL` (for example `https://www.genaan.shop`) for production and preview, then deploy.

Pick a Turso region close to the Vercel function region; pages query the database on each request so admin changes show up immediately.

## Where things live

| Path | Contents |
| --- | --- |
| `app/(store)/` | Storefront: home, `/business`, `/planting`, `/bundles/[slug]`, `/checkout`, `/order/[token]`, `/track`, `/contact`, content pages |
| `app/admin/` | Dashboard: orders, bundles, plants and trees, delivery and planting fees, quote requests, settings |
| `app/actions/orders.ts` | Placing orders (prices recomputed on the server), tracking, quote requests |
| `app/admin/actions.ts` | Admin server actions; each one re-checks the session |
| `app/lib/pricing.ts` | The single pricing function used for the checkout preview and the saved order |
| `app/lib/db/schema.ts` | Database schema |
| `scripts/` | Migration, seed and admin scripts |

Old URLs from the previous site (`/packages`, `/shop`, `/journal`, `/care`, account pages) redirect to the new pages.

## Brand

The leaf mark (`public/assets/icon.png`), the Fugaz One wordmark and the forest-green palette carry over from the original site. Arabic uses Cairo; English body text uses Inter. Harvest gold marks the planting service. Photo credits are in `docs/plant-photo-credits.md`.
