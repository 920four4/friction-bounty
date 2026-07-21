# Launch checklist

Everything you need to take Friction Bounty from this repo to a live product. Work top to bottom.

**Canonical production URL:** `https://frictionbounty.app`  
**Vercel project:** `friction-bounty` (also aliases `https://friction-bounty.vercel.app`)

---

## 1. Provision services

| Service | Why | Free tier? |
| --- | --- | --- |
| **Neon** (Postgres) | Primary database | Yes |
| **Vercel** | Hosting (Next.js) | Yes |
| **Vercel Blob** | Bug-report screenshots (`@vercel/blob`) | Yes |
| **Resend** | Transactional email (notifications, receipts, reward emails) | Yes — needs a verified domain |
| **Stripe** | Merchants connect their **own** key in-app — you do **not** need a platform Stripe account | n/a |

> Screenshots use **Vercel Blob**, not R2/S3. Set `BLOB_READ_WRITE_TOKEN` (auto-created when you enable Blob on the Vercel project).

---

## 2. Environment variables (Vercel → Settings → Environment Variables)

Set these for **Production** (and Preview if you want previews to work end-to-end).

### Required
| Var | Value / notes |
| --- | --- |
| `DATABASE_URL` | Neon connection string (include `?sslmode=require`) |
| `SESSION_SECRET` | Long random string — **must be ≥ 32 characters**. Signs login cookies. Generate: `openssl rand -hex 32` |
| `SUPER_ADMIN_EMAIL` | Email for the env-bootstrapped super-admin console login |
| `SUPER_ADMIN_PASSWORD` | Super-admin password (also accepted by `/migrate` when `MIGRATE_ENABLED=1`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token (Store → Blob → create store / connect) |

### Email (strongly recommended — without it, no emails send, but reports still log)
| Var | Value / notes |
| --- | --- |
| `RESEND_API_KEY` | From the Resend dashboard |
| `RESEND_FROM_EMAIL` | e.g. `Friction Bounty <hi@frictionbounty.app>` — domain must be verified in Resend |

### URLs (set these so install snippets + email links point at production)
| Var | Value / notes |
| --- | --- |
| `APP_URL` | `https://frictionbounty.app` |
| `NEXT_PUBLIC_APP_URL` | Same as `APP_URL` |
| `NEXT_PUBLIC_WIDGET_URL` | Where `widget.js` is served — same origin in production: `https://frictionbounty.app` |

If unset, install snippets fall back to `https://frictionbounty.app` via `src/lib/url.ts`.

### Stripe platform (Connect + SaaS billing)
Merchants **never paste API keys**. They connect via Stripe-hosted Connect Express. You need a platform Stripe account.

| Var | Value / notes |
| --- | --- |
| `STRIPE_SECRET_KEY` | Platform secret key (`sk_live_…` / `sk_test_…`) — enables Connect onboarding + reward issuance on connected accounts |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret for `/api/stripe/webhook` (billing events) |
| `STRIPE_PRICE_PRO` | Price id for Pro plan (`price_…`) — used by Checkout upgrade |

In Stripe Dashboard → Connect: enable Express accounts.  
Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

### Optional / operational
| Var | Value / notes |
| --- | --- |
| `MIGRATE_ENABLED` | Set to `1` only when you need password-based migration via POST body. Super-admin **session** can always run migrations without this flag. Leave unset in normal production. |
| `ADMIN_PASSWORD` | Legacy fallback for `SUPER_ADMIN_PASSWORD` only — prefer the explicit vars above. **Does not** substitute for `SESSION_SECRET`. |

### Neon Marketplace extras
Vercel + Neon also injects `DATABASE_POSTGRES_*` / `DATABASE_PG*` aliases. The app only needs `DATABASE_URL`.

---

## 3. Deploy

1. Push to `main` (GitHub ↔ Vercel integration auto-deploys production).
2. Confirm Production deployment is **Ready** in the Vercel dashboard or via:
   ```bash
   vercel ls friction-bounty
   vercel inspect <deployment-url>
   ```
3. Domain: `frictionbounty.app` should be assigned to this project (apex + `www` if used).

---

## 4. Run the database migration (once per environment)

The app ships an idempotent migration runner. After the first deploy **and after any schema change** (e.g. `monthly_budget`):

1. Log in as super admin (`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`) at `/login`, **or**
2. Go to `https://frictionbounty.app/migrate` and enter `SUPER_ADMIN_PASSWORD` (requires `MIGRATE_ENABLED=1` for the password path only).
3. Click **Run migrations**.

Safe to re-run anytime. Creates/updates all tables and adds columns such as `monthly_budget`.

---

## 5. Create the first merchant account

1. Go to `/signup`, create an org owner account.
2. You land on the **Getting started** guide.
3. Copy the install snippet (one click) into the target site before `</body>`.
4. In **Settings**, paste a restricted Stripe key and (optionally) set a monthly budget.
5. Trigger a test report from the widget — it should appear in the inbox within a second, with email receipts sent.

---

## 6. Before you announce — sanity pass

- [ ] Production deploy is Ready on `frictionbounty.app`
- [ ] Migration ran successfully (`/migrate` shows ✓)
- [ ] Sign up → land on getting-started → snippet copies
- [ ] Widget badge appears on a real page; a submission lands in the inbox
- [ ] Owner notification email + reporter receipt both arrive (check Resend logs)
- [ ] Approve a test report with a Stripe **test** key → credit/coupon issued, reward email sent
- [ ] Set a low monthly budget, then try to approve past it → approval is blocked with the budget banner
- [ ] Screenshot uploads and renders in the submission view (Blob token correct)
- [ ] `/pricing`, `/terms`, `/privacy` render; OG image and favicon load

---

## Known gotchas

### Widget URL
Install snippets use `NEXT_PUBLIC_WIDGET_URL` / `APP_URL` (via `src/lib/url.ts`). The widget uses its own `<script src>` origin as the API base. Point these at production before handing snippets to merchants.

### Screenshot uploads
`POST /api/upload` requires a valid org API key (`X-Fb-Api-Key` or `apiKey` query param), max 5MB, PNG/JPEG/WEBP only. Stored under `screenshots/<orgId>/…` in Vercel Blob.

### Super-admin migrate password path
Password-body migration only works when `MIGRATE_ENABLED=1`. Prefer logging in as super admin and using the UI so you can leave that flag off.

### Money model
Friction Bounty **never touches payout money.** Each merchant supplies their own Stripe **restricted key** in Settings. On approval, the reward is issued on *their* Stripe account as either:

- **Customer credit** (balance transaction, auto-applied at the reporter's next checkout), or
- **Promo code** (single-use Stripe promotion code, 30-day expiry).

The **monthly budget** is a hard cap against rewards actually delivered (`status=rewarded`) in the current calendar month — approvals that would exceed it are blocked before any Stripe call.
