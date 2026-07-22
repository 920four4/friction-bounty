import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { appBaseUrlFromRequest } from "@/lib/url";

/**
 * Form POSTs navigate the browser to this URL. Always redirect after clearing
 * the cookie so users never land on a raw JSON API page.
 */
export async function POST(request: NextRequest) {
  await clearSession();
  const base = appBaseUrlFromRequest(request);
  // 303: convert POST → GET so the browser loads /login cleanly
  return NextResponse.redirect(`${base}/login`, 303);
}

/** Accidental GET (bookmark / refresh) — clear session and send home. */
export async function GET(request: NextRequest) {
  await clearSession();
  const base = appBaseUrlFromRequest(request);
  return NextResponse.redirect(`${base}/login`, 303);
}
