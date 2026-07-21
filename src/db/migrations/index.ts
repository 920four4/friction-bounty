// Multi-tenant migration. Idempotent — safe to re-run.
// Works on a fresh DB or upgrades the old single-tenant schema.
// Source of truth for /api/admin/migrate.

export const migration_0001_multitenant = /* sql */ `
BEGIN;

-- 1. organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  website_url TEXT,
  api_key VARCHAR(64) NOT NULL,
  stripe_secret_key TEXT,
  notification_email VARCHAR(255),
  notify_on_submission BOOLEAN NOT NULL DEFAULT TRUE,
  default_bounty_amount NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  bounty_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  monthly_budget NUMERIC(10, 2),
  widget_primary_color VARCHAR(7) NOT NULL DEFAULT '#FFE100',
  widget_position VARCHAR(20) NOT NULL DEFAULT 'bottom-right',
  widget_welcome_message TEXT NOT NULL DEFAULT 'Found an issue? Report it and earn rewards!',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug);
CREATE UNIQUE INDEX IF NOT EXISTS organizations_api_key_idx ON organizations(api_key);

-- 2. users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'org_owner',
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_org_idx ON users(org_id);

-- 3. submissions: create if missing (fresh DB), then add columns / indexes for upgrades
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  user_id VARCHAR(255),
  issue_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT NOT NULL,
  screenshot_url TEXT,
  browser VARCHAR(100),
  os VARCHAR(100),
  viewport_width INTEGER,
  viewport_height INTEGER,
  referrer TEXT,
  session_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  bounty_amount NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
  reward_type VARCHAR(50) DEFAULT 'stripe_credit',
  stripe_customer_id VARCHAR(255),
  reward_code VARCHAR(64),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP,
  reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reward_delivered_at TIMESTAMP,
  reward_error TEXT,
  ip_address INET,
  fingerprint VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Backfill / column-add for existing single-tenant submissions tables
DO $$
DECLARE
  default_org UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'org_id') THEN
    ALTER TABLE submissions ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'reviewed_by_user_id') THEN
    ALTER TABLE submissions ADD COLUMN reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'reward_code') THEN
    ALTER TABLE submissions ADD COLUMN reward_code VARCHAR(64);
  END IF;

  -- If there are submissions without an org, create a default org and assign them
  IF EXISTS (SELECT 1 FROM submissions WHERE org_id IS NULL LIMIT 1) THEN
    INSERT INTO organizations (name, slug, api_key)
    VALUES ('Default', 'default', 'fb_pk_default_' || substring(md5(random()::text), 1, 16))
    ON CONFLICT (slug) DO NOTHING;

    SELECT id INTO default_org FROM organizations WHERE slug = 'default';
    IF default_org IS NOT NULL THEN
      UPDATE submissions SET org_id = default_org WHERE org_id IS NULL;
    END IF;
  END IF;

  -- Enforce NOT NULL once everything is backfilled
  IF NOT EXISTS (SELECT 1 FROM submissions WHERE org_id IS NULL) THEN
    BEGIN
      ALTER TABLE submissions ALTER COLUMN org_id SET NOT NULL;
    EXCEPTION WHEN others THEN NULL; -- already NOT NULL is fine
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS submissions_org_idx ON submissions(org_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status);
CREATE INDEX IF NOT EXISTS submissions_created_idx ON submissions(created_at);

-- 4. submission_messages
CREATE TABLE IF NOT EXISTS submission_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL,
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_email VARCHAR(255),
  body TEXT NOT NULL,
  emailed_at TIMESTAMP,
  email_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS submission_messages_submission_idx ON submission_messages(submission_id);

-- 5. rate_limit_log: create or upgrade
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  email VARCHAR(255),
  fingerprint VARCHAR(255),
  attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rate_limit_log' AND column_name = 'org_id') THEN
    ALTER TABLE rate_limit_log ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS rate_limit_org_ip_idx ON rate_limit_log(org_id, ip_address, attempted_at);

-- 6. Drop legacy app_settings — config now lives on organizations
DROP TABLE IF EXISTS app_settings;

COMMIT;
`;

// Adds the monthly spend cap to existing organizations tables.
// Idempotent — ADD COLUMN IF NOT EXISTS is a no-op once applied.
export const migration_0002_monthly_budget = /* sql */ `
BEGIN;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS monthly_budget NUMERIC(10, 2);
COMMIT;
`;

// Older production DBs created submissions before the full multi-tenant
// schema. CREATE TABLE IF NOT EXISTS does not add missing columns, so
// Drizzle SELECTs that expect the full schema fail at runtime.
export const migration_0003_submissions_columns = /* sql */ `
BEGIN;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50) DEFAULT 'stripe_credit';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
COMMIT;
`;

// Stripe Connect + SaaS billing fields. Idempotent.
export const migration_0004_connect_billing = /* sql */ `
BEGIN;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_status VARCHAR(30) NOT NULL DEFAULT 'none';
COMMIT;
`;

export const migrations: Array<{ name: string; sql: string }> = [
  { name: "0001_multitenant", sql: migration_0001_multitenant },
  { name: "0002_monthly_budget", sql: migration_0002_monthly_budget },
  { name: "0003_submissions_columns", sql: migration_0003_submissions_columns },
  { name: "0004_connect_billing", sql: migration_0004_connect_billing },
];
