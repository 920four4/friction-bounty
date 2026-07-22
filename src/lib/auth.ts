import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getDb } from "@/db";
import { users, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "fb_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Hard allowlist — platform admin is ONLY this email, forever.
 * Env SUPER_ADMIN_EMAIL is ignored if it is anything else.
 */
export const ALLOWED_SUPER_ADMIN_EMAILS = ["z@920four.com"] as const;

export function isAllowedSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ALLOWED_SUPER_ADMIN_EMAILS as readonly string[]).includes(normalized);
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return secret;
}

/** Always the hard-coded owner email when allowlisted; never a random env value. */
function getSuperAdminEmail(): string | null {
  const envEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || null;
  // Prefer env only if it is on the allowlist; otherwise fall back to the sole owner.
  if (envEmail && isAllowedSuperAdminEmail(envEmail)) return envEmail;
  return ALLOWED_SUPER_ADMIN_EMAILS[0];
}

function getSuperAdminPassword(): string | null {
  return process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || null;
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Still do a compare to avoid an early-return timing side-channel.
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

// ---------- password hashing (scrypt, no extra deps) ----------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== candidate.length) return false;
  return timingSafeEqual(expected, candidate);
}

// ---------- session cookie (HMAC-signed) ----------

export type SessionPayload = {
  uid: string; // user id, or "super" for env-bootstrapped super admin
  role: "super_admin" | "org_owner";
  oid?: string; // org id (org_owner only)
  exp: number;
};

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodeSession(data: Omit<SessionPayload, "exp">): string {
  const payload: SessionPayload = { ...data, exp: Date.now() + SESSION_TTL_MS };
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  return `${b64}.${sign(b64)}`;
}

function decodeSession(cookie: string): SessionPayload | null {
  const [b64, sig] = cookie.split(".");
  if (!b64 || !sig) return null;
  const expected = sign(b64);
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  try {
    const data = JSON.parse(Buffer.from(b64, "base64url").toString()) as SessionPayload;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE);
  if (!c) return null;
  return decodeSession(c.value);
}

export async function setSession(data: Omit<SessionPayload, "exp">) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// ---------- login flows ----------

/**
 * Attempt login.
 * Super admin: ONLY allowlisted emails (z@920four.com) + SUPER_ADMIN_PASSWORD.
 * Org owners come from the users table (never elevated to super_admin unless allowlisted).
 */
export async function attemptLogin(email: string, password: string): Promise<SessionPayload | null> {
  const normalized = email.trim().toLowerCase();

  const superPass = getSuperAdminPassword();
  if (
    isAllowedSuperAdminEmail(normalized) &&
    superPass &&
    constantTimeEqual(password, superPass)
  ) {
    return { uid: "super", role: "super_admin", exp: 0 };
  }

  // Even with the right password, non-allowlisted emails never get super_admin.
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  // DB role "super_admin" is only honored for the hard allowlist email.
  if (user.role === "super_admin" && isAllowedSuperAdminEmail(user.email)) {
    return { uid: user.id, role: "super_admin", exp: 0 };
  }

  // Never treat arbitrary org users as platform admin.
  return { uid: user.id, role: "org_owner", oid: user.orgId ?? undefined, exp: 0 };
}

// ---------- guards ----------

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

/**
 * Platform admin only — role must be super_admin AND email must be on the
 * hard allowlist (z@920four.com). Anyone else is bounced to /dashboard.
 */
export async function requireSuperAdmin(): Promise<SessionPayload> {
  const s = await requireSession();
  if (s.role !== "super_admin") redirect("/dashboard");

  const user = await getCurrentUser();
  if (!user || !isAllowedSuperAdminEmail(user.email)) {
    // Stale or forged session — kill path to app surface, not admin.
    redirect("/dashboard");
  }
  return s;
}

export async function requireOrgOwner(): Promise<{ session: SessionPayload; orgId: string }> {
  const s = await requireSession();
  if (s.role !== "org_owner" || !s.oid) {
    if (s.role === "super_admin" && isAllowedSuperAdminEmail((await getCurrentUser())?.email)) {
      redirect("/admin");
    }
    redirect("/login");
  }
  return { session: s, orgId: s.oid! };
}

export async function getCurrentUser() {
  const s = await getSession();
  if (!s) return null;
  if (s.role === "super_admin" && s.uid === "super") {
    const email = getSuperAdminEmail() ?? ALLOWED_SUPER_ADMIN_EMAILS[0];
    // Never surface super_admin identity for non-allowlisted emails.
    if (!isAllowedSuperAdminEmail(email)) return null;
    return { id: "super", email, role: "super_admin" as const, name: "Super Admin", orgId: null };
  }
  const db = getDb();
  const u = await db.query.users.findFirst({ where: eq(users.id, s.uid) });
  if (!u) return null;

  // Strip elevated role if somehow stored for a non-allowlisted account.
  if (u.role === "super_admin" && !isAllowedSuperAdminEmail(u.email)) {
    return { id: u.id, email: u.email, role: "org_owner" as const, name: u.name, orgId: u.orgId };
  }
  return { id: u.id, email: u.email, role: u.role, name: u.name, orgId: u.orgId };
}

export async function getCurrentOrg() {
  const s = await getSession();
  if (!s || s.role !== "org_owner" || !s.oid) return null;
  const db = getDb();
  return db.query.organizations.findFirst({ where: eq(organizations.id, s.oid) });
}

// ---------- API key generation ----------

export function generateApiKey(): string {
  return "fb_pk_" + randomBytes(18).toString("base64url");
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "org";
  return `${base}-${randomBytes(3).toString("hex")}`;
}
