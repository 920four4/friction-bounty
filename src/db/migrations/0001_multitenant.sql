-- Multi-tenant migration: organizations + users + submission_messages.
-- Backfills existing submissions to a default org so nothing is orphaned.
-- Run once against your Neon DB, e.g. via `psql $DATABASE_URL -f 0001_multitenant.sql`.

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

-- 3. submissions: add org_id, reviewer_user_id; backfill org_id for existing rows.
DO $$
DECLARE
  default_org UUID;
BEGIN
  -- Create a default org if any submissions exist without one
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'org_id') = FALSE THEN
    -- Add nullable org_id first
    ALTER TABLE submissions ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    ALTER TABLE submissions ADD COLUMN reviewed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

    -- If there are any submissions, create a default org and assign them
    IF EXISTS (SELECT 1 FROM submissions LIMIT 1) THEN
      INSERT INTO organizations (name, slug, api_key)
      VALUES ('Default', 'default', 'fb_pk_default_' || substring(md5(random()::text), 1, 16))
      ON CONFLICT (slug) DO NOTHING
      RETURNING id INTO default_org;

      IF default_org IS NULL THEN
        SELECT id INTO default_org FROM organizations WHERE slug = 'default';
      END IF;

      UPDATE submissions SET org_id = default_org WHERE org_id IS NULL;
    END IF;

    -- Now make org_id NOT NULL (only safe after backfill)
    -- If table was empty, this just enforces the constraint going forward.
    IF NOT EXISTS (SELECT 1 FROM submissions WHERE org_id IS NULL) THEN
      ALTER TABLE submissions ALTER COLUMN org_id SET NOT NULL;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS submissions_org_idx ON submissions(org_id);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions(status);
CREATE INDEX IF NOT EXISTS submissions_created_idx ON submissions(created_at);

-- 4. submission_messages: thread between admin/owner and reporter
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

-- 5. rate_limit_log: scope to org
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rate_limit_log' AND column_name = 'org_id') = FALSE THEN
    ALTER TABLE rate_limit_log ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS rate_limit_org_ip_idx ON rate_limit_log(org_id, ip_address, attempted_at);

-- 6. Drop the old single-tenant app_settings table — settings now live on organizations.
DROP TABLE IF EXISTS app_settings;

-- 7. Idempotent column adds for re-runs of an older 0001
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'notification_email') = FALSE THEN
    ALTER TABLE organizations ADD COLUMN notification_email VARCHAR(255);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'notify_on_submission') = FALSE THEN
    ALTER TABLE organizations ADD COLUMN notify_on_submission BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'reward_code') = FALSE THEN
    ALTER TABLE submissions ADD COLUMN reward_code VARCHAR(64);
  END IF;
END $$;

COMMIT;
