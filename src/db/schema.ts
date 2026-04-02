import { pgTable, uuid, varchar, text, timestamp, decimal, inet, jsonb, integer } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  
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
  
  // Bounty status
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, rewarded
  bountyAmount: decimal("bounty_amount", { precision: 10, scale: 2 }).notNull().default("10.00"),
  rewardType: varchar("reward_type", { length: 50 }).default("stripe_credit"), // stripe_credit, stripe_discount, manual
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  
  // Review tracking
  reviewerNotes: text("reviewer_notes"),
  reviewedAt: timestamp("reviewed_at"),
  
  // Reward delivery tracking
  rewardDeliveredAt: timestamp("reward_delivered_at"),
  rewardError: text("reward_error"),
  
  // Rate limiting
  ipAddress: inet("ip_address"),
  fingerprint: varchar("fingerprint", { length: 255 }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().default(1),
  
  // Bounty settings
  defaultBountyAmount: decimal("default_bounty_amount", { precision: 10, scale: 2 }).default("10.00"),
  bountyCurrency: varchar("bounty_currency", { length: 3 }).default("USD"),
  
  // Stripe settings (store encrypted in production)
  stripeSecretKey: text("stripe_secret_key"),
  stripeWebhookSecret: text("stripe_webhook_secret"),
  
  // Widget settings
  widgetPrimaryColor: varchar("widget_primary_color", { length: 7 }).default("#FFE100"),
  widgetPosition: varchar("widget_position", { length: 20 }).default("bottom-right"),
  widgetWelcomeMessage: text("widget_welcome_message").default("Found an issue? Report it and earn rewards!"),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rateLimitLog = pgTable("rate_limit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipAddress: inet("ip_address").notNull(),
  email: varchar("email", { length: 255 }),
  fingerprint: varchar("fingerprint", { length: 255 }),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});
