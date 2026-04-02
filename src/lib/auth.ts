import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AUTH_COOKIE_NAME = "friction_bounty_auth";

// Lazy load the admin password from env
function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

// Generate auth token based on current password
function getAuthToken(): string {
  const password = getAdminPassword();
  return "fb_admin_" + Buffer.from(password).toString("base64");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  return authCookie?.value === getAuthToken();
}

export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function login(password: string): Promise<boolean> {
  if (password === getAdminPassword()) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, getAuthToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
