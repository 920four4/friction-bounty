# Launch checklist

Everything you need to take Friction Bounty from this repo to a live product. Work top to bottom.

---

## 1. Provision services

| Service | Why | Free tier? |
| --- | --- | --- |
| **Neon** (Postgres) | Primary database | Yes |
| **Vercel** | Hosting (Next.js) | Yes |
| **Resend** | Transactional email (notifications, receipts, reward emails) | Yes, needs a verified domain |
| **Cloudflare R2** *or* any **S3**-compatible bucket | Stores bug-report screenshots | R2 has a free tier |
| **Stripe** | Merchants connect their **own** key in-app — you do **not** need a platform Stripe account | n/a |

---

## 2. Environment variables (Vercel → Settings → Environment Variables)

### Required
| Var | Value / notes |
| --- | --- |
| `DATABASE_URL` | Neon connection string (include `?sslmode=require`) |
| `SESSION_SECRET` | Long random string — signs login cookies. Generate: `openssl rand -hex 32` |
| `SUPER_ADMIN_EMAIL` | The email you'll use to log into the super-admin console |
| `SUPER_ADMIN_PASSWORD` | Super-admin password **and** the key that authorizes `/migrate` |

> `ADMIN_PASSWORD` is accepted as a fallback for both `SESSION_SECRET` and `SUPER_ADMIN_PASSWORD`, but set the explicit vars above for clarity.

### Email (strongly recommended — without it, no emails send, but reports still log)
| Var | Value / notes |
| --- | --- |
| `RESEND_API_KEY` | From the Resend dashboard |
| `RESEND_FROM_EMAIL` | e.g. `Friction Bounty <noreply@yourdomain.com>` — the domain must be verified in Resend |

### Screenshot storage (required for the widget's screenshot feature)
Use the `R2_` **or** the `S3_` prefix — the code checks both.
| Var | Value / notes |
| --- | --- |
| `R2_ENDPOINT` | e.g. `https://<account>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Bucket access key |
| `R2_SECRET_ACCESS_KEY` | Bucket secret |
| `R2_BUCKET_NAME` | Bucket name (default `friction-bounty`) |
| `R2_PUBLIC_URL` | Public base URL for the bucket, e.g. `https://cdn.yourdomain.com`. The screenshot must be publicly readable so it renders in the dashboard. |

> The bucket needs a **CORS policy** allowing `PUT` from the sites where your widget runs (the browser uploads the screenshot directly via a presigned URL), and public read on the `screenshots/` prefix.

### Optional
| Var | Value / notes |
| --- | --- |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | Base URL used in email links. If unset, falls back to the request's own origin (fine on Vercel). |

---

## 3. Deploy

1. Import the repo into Vercel (framework auto-detected as Next.js).
2. Add the env vars above.
3. Deploy.

---

## 4. Run the database migration (once per environment)

The app ships an idempotent migration runner. After the first deploy **and after any schema change** (e.g. this PR adds `monthly_budget`):

- Go to `https://<your-domain>/migrate`
- Enter `SUPER_ADMIN_PASSWORD`
- Click **Run migrations**

It's safe to re-run anytime. This creates/updates all tables and adds the monthly-budget column.

---

## 5. Create the first merchant account

1. Go to `/signup`, create an org owner account.
2. You land on the **Getting started** guide.
3. Copy the install snippet (one click) into the target site before `</body>`.
4. In **Settings**, paste a restricted Stripe key and (optionally) set a monthly budget.
5. Trigger a test report from the widget — it should appear in the inbox within a second, with email receipts sent.

---

## 6. Before you announce — sanity pass

- [ ] Migration ran successfully (`/migrate` shows ✓).
- [ ] Sign up → land on getting-started → snippet copies.
- [ ] Widget badge appears on a real page; a submission lands in the inbox.
- [ ] Owner notification email + reporter receipt both arrive (check Resend logs).
- [ ] Approve a test report with a Stripe **test** key → credit/coupon issued, reward email sent.
- [ ] Set a low monthly budget, then try to approve past it → approval is blocked with the budget banner.
- [ ] Screenshot uploads and renders in the submission view (R2/S3 + CORS correct).

---

## Known gotcha: the widget URL is hard-coded

The install snippets and the served `widget.js` reference **`https://friction-bounty.vercel.app`**. The widget uses its own `<script src>` origin as the API base, so:

- If you deploy to a **different** production domain, update the hard-coded URL in:
  - `src/app/dashboard/getting-started/page.tsx`
  - `src/app/dashboard/settings/page.tsx`
  - `src/app/page.tsx` (the marketing install snippet)
- Or add a `CNAME`/alias so `friction-bounty.vercel.app` is your canonical widget host.

Point this at your real domain before sending merchants their snippet, or their reports won't reach your API.

---

## Reference: how the money works

Friction Bounty **never touches payout money.** Each merchant supplies their own Stripe **restricted key** in Settings. On approval, the reward is issued on *their* Stripe account as either:
- **Customer credit** (balance transaction, auto-applied at the reporter's next checkout), or
- **Promo code** (single-use Stripe promotion code, 30-day expiry).

The **monthly budget** is a hard cap enforced against rewards actually delivered in the current calendar month — approvals that would exceed it are blocked before any Stripe call.
