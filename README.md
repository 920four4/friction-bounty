# Friction Bounty

A hosted widget + dashboard that lets your end-users submit bug reports from
your site and lets you reward them with Stripe customer credit or promo codes.

**Stack**: Next.js 16 App Router · React 19 · Drizzle ORM · Neon Postgres ·
Stripe (per-org, restricted keys) · Resend · Vercel Blob · Tailwind 4.

## Local dev

```bash
npm install
vercel link               # one-time, links to the friction-bounty project
vercel env pull .env.local
npm run dev               # http://localhost:3000
```

First-run migrations:

1. Sign in as super-admin (`SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD`) and
   POST `/api/admin/migrate`, or
2. Temporarily set `MIGRATE_ENABLED=1` and use the password form at
   `/migrate`. Turn the flag off when done.

## Required env vars

| Var | Where | Purpose |
|---|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon (auto) | Postgres |
| `SESSION_SECRET` | manual | ≥32 random bytes, HMAC session signer |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | manual | Bootstrap super-admin |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | manual | Transactional email |
| `APP_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WIDGET_URL` | manual | Canonical URLs in emails + install snippets |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (auto) | Screenshot storage |
| `MIGRATE_ENABLED` | manual, optional | Allow password-based `/migrate` access |

## Deploy

`git push` to `main` deploys to production via Vercel.

## License

Proprietary — © 920four.
