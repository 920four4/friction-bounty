import { pgTable, uuid, varchar, text, timestamp, decimal, inet, integer, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  websiteUrl: text("website_url"),

  // Public widget key — appears in <script> tags. Anyone can submit using it.
  apiKey: varchar("api_key", { length: 64 }).notNull(),

  // Legacy: raw restricted key (deprecated — prefer Connect). Never collect in UI.
  stripeSecretKey: text("stripe_secret_key"),

  // Stripe Connect (preferred): merchant connects via Stripe-hosted onboarding.
  // We store only the account id (acct_…), never their secret keys.
  stripeAccountId: text("stripe_account_id"),
  stripeChargesEnabled: boolean("stripe_charges_enabled").notNull().default(false),
  stripeDetailsSubmitted: boolean("stripe_details_submitted").notNull().default(false),

  // SaaS billing (they pay *us* for Friction Bounty)
  plan: varchar("plan", { length: 20 }).notNull().default("free"), // free | pro
  billingCustomerId: text("billing_customer_id"),
  billingSubscriptionId: text("billing_subscription_id"),
  billingStatus: varchar("billing_status", { length: 30 }).notNull().default("none"), // none | active | trialing | past_due | canceled

  // Where to send "new submission" notifications. Falls back to owner's email.
  notificationEmail: varchar("notification_email", { length: 255 }),
  notifyOnSubmission: boolean("notify_on_submission").notNull().default(true),

  // Reward defaults
  defaultBountyAmount: decimal("default_bounty_amount", { precision: 10, scale: 2 }).notNull().default("10.00"),
  bountyCurrency: varchar("bounty_currency", { length: 3 }).notNull().default("USD"),

  // Monthly spend cap. NULL = no limit. Enforced against rewards delivered
  // in the current calendar month; approvals that would exceed it are blocked.
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),

  // Widget look-and-feel
  widgetPrimaryColor: varchar("widget_primary_color", { length: 7 }).notNull().default("#FFE100"),
  widgetPosition: varchar("widget_position", { length: 20 }).notNull().default("bottom-right"),
  widgetWelcomeMessage: text("widget_welcome_message").notNull().default("Found an issue? Report it and earn rewards!"),
  // brutal | soft | pill — how the launcher/panel edges look on the merchant site
  widgetStyle: varchar("widget_style", { length: 20 }).notNull().default("brutal"),
  // Empty = icon-only launcher; set e.g. "Report a bug" for a labeled pill
  widgetButtonLabel: varchar("widget_button_label", { length: 40 }).notNull().default(""),
  // Pixels from bottom — raise to sit above Intercom/Zendesk/etc.
  widgetOffsetBottom: integer("widget_offset_bottom").notNull().default(20),

  // Lifecycle
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("organizations_slug_idx").on(table.slug),
  apiKeyIdx: uniqueIndex("organizations_api_key_idx").on(table.apiKey),
}));

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),

  // role: "org_owner" — only super_admins are bootstrapped via env, no user row.
  role: varchar("role", { length: 20 }).notNull().default("org_owner"),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  orgIdx: index("users_org_idx").on(table.orgId),
}));

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),

  // Reporter info
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  userId: varchar("user_id", { length: 255 }), // tenant's internal user ID if logged in

  // Issue details
  issueType: varchar("issue_type", { length: 50 }).notNull(), // bug, ux_confusion, feature_request
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  pageUrl: text("page_url").notNull(),
  screenshotUrl: text("screenshot_url"),

  // Context
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  viewportWidth: integer("viewport_width"),
  viewportHeight: integer("viewport_height"),
  referrer: text("referrer"),
  sessionId: varchar("session_id", { length: 255 }),

  // Bounty status: pending, approved, rejected, rewarded, needs_info
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  bountyAmount: decimal("bounty_amount", { precision: 10, scale: 2 }).notNull().default("10.00"),
  rewardType: varchar("reward_type", { length: 50 }).default("stripe_credit"), // stripe_credit | stripe_coupon
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  rewardCode: varchar("reward_code", { length: 64 }), // promo code if rewardType=stripe_coupon

  // Review tracking
  reviewerNotes: text("reviewer_notes"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedByUserId: uuid("reviewed_by_user_id").references(() => users.id, { onDelete: "set null" }),

  // Reward delivery tracking
  rewardDeliveredAt: timestamp("reward_delivered_at"),
  rewardError: text("reward_error"),

  // Rate limiting / spam
  ipAddress: inet("ip_address"),
  fingerprint: varchar("fingerprint", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("submissions_org_idx").on(table.orgId),
  statusIdx: index("submissions_status_idx").on(table.status),
  createdIdx: index("submissions_created_idx").on(table.createdAt),
}));

export const submissionMessages = pgTable("submission_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "cascade" }).notNull(),

  // Who sent it
  senderType: varchar("sender_type", { length: 20 }).notNull(), // "admin" | "owner" | "reporter" | "system"
  senderUserId: uuid("sender_user_id").references(() => users.id, { onDelete: "set null" }),
  senderEmail: varchar("sender_email", { length: 255 }),

  body: text("body").notNull(),

  // Was an outbound email actually delivered?
  emailedAt: timestamp("emailed_at"),
  emailError: text("email_error"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  submissionIdx: index("submission_messages_submission_idx").on(table.submissionId),
}));

export const rateLimitLog = pgTable("rate_limit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  ipAddress: inet("ip_address").notNull(),
  email: varchar("email", { length: 255 }),
  fingerprint: varchar("fingerprint", { length: 255 }),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
}, (table) => ({
  orgIpIdx: index("rate_limit_org_ip_idx").on(table.orgId, table.ipAddress, table.attemptedAt),
}));

/** SaaS billing events for Friction Bounty only (never other products on the same Stripe account). */
export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "set null" }),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull(),
  stripeObjectId: varchar("stripe_object_id", { length: 255 }),
  type: varchar("type", { length: 80 }).notNull(), // checkout.session.completed | invoice.paid | subscription.updated | ...
  app: varchar("app", { length: 40 }).notNull().default("friction_bounty"),
  priceId: varchar("price_id", { length: 255 }),
  amountCents: integer("amount_cents"),
  currency: varchar("currency", { length: 10 }),
  status: varchar("status", { length: 40 }),
  customerId: varchar("customer_id", { length: 255 }),
  subscriptionId: varchar("subscription_id", { length: 255 }),
  description: text("description"),
  metadataJson: text("metadata_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  eventIdx: uniqueIndex("payment_events_stripe_event_idx").on(table.stripeEventId),
  orgIdx: index("payment_events_org_idx").on(table.orgId),
  createdIdx: index("payment_events_created_idx").on(table.createdAt),
}));

/** Marketing blog posts with built-in SEO scoring. */
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 160 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""), // Markdown
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | published
  category: varchar("category", { length: 80 }).notNull().default("guides"),
  tags: text("tags").notNull().default("[]"), // JSON string[]
  primaryKeyword: varchar("primary_keyword", { length: 120 }).notNull().default(""),
  secondaryKeywords: text("secondary_keywords").notNull().default("[]"), // JSON string[]
  metaTitle: varchar("meta_title", { length: 70 }).notNull().default(""),
  metaDescription: varchar("meta_description", { length: 170 }).notNull().default(""),
  ogImageUrl: text("og_image_url"),
  canonicalPath: varchar("canonical_path", { length: 200 }),
  authorName: varchar("author_name", { length: 120 }).notNull().default("Friction Bounty"),
  ctaLabel: varchar("cta_label", { length: 80 }).notNull().default("Start free"),
  ctaHref: varchar("cta_href", { length: 200 }).notNull().default("/signup"),
  relatedSlugs: text("related_slugs").notNull().default("[]"), // JSON string[]
  wordCount: integer("word_count").notNull().default(0),
  seoScore: integer("seo_score").notNull().default(0), // 0–100
  seoReport: text("seo_report").notNull().default("{}"), // JSON SeoReport
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("blog_posts_slug_idx").on(table.slug),
  statusIdx: index("blog_posts_status_idx").on(table.status),
  publishedIdx: index("blog_posts_published_idx").on(table.publishedAt),
}));

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  submissions: many(submissions),
  paymentEvents: many(paymentEvents),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [submissions.orgId],
    references: [organizations.id],
  }),
  reviewedBy: one(users, {
    fields: [submissions.reviewedByUserId],
    references: [users.id],
  }),
  messages: many(submissionMessages),
}));

export const submissionMessagesRelations = relations(submissionMessages, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionMessages.submissionId],
    references: [submissions.id],
  }),
  sender: one(users, {
    fields: [submissionMessages.senderUserId],
    references: [users.id],
  }),
}));

export const paymentEventsRelations = relations(paymentEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [paymentEvents.orgId],
    references: [organizations.id],
  }),
}));
