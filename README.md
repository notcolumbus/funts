# Funts

A font explorer built with the Next.js App Router and deployed as one Cloudflare Worker. The UI and the read-only `/api/fonts` route are in this repository; the route reads the existing D1 catalog through a Worker binding. Cloudflare's vinext runtime provides the Next.js API on Workers.

## Local development

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run seed:local
npm run dev
```

The seed creates a small **local-only** D1 database with two sample fonts. It does not create or alter the remote database. Open the address printed by the dev server. The production catalog is not copied locally.

## Checks and deployment

```sh
npm run typecheck
npm run build
npx wrangler deploy --dry-run --config dist/server/wrangler.json
npm run deploy
```

`wrangler.jsonc` binds `DB` to the existing D1 database ID and targets the existing Git-connected Worker (`funts`). Confirm your Cloudflare account, database binding, domain, and deployment target before deploying. The application only reads the catalog; the old API is a separate deployment and must be secured or retired separately. The checked-in local seed is not a production schema migration or backup.

The browser loads selected fonts from Google Fonts. Font recommendations and catalog administration are not implemented yet.
