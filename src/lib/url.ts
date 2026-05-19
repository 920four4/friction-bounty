/**
 * Single source of truth for the app's canonical URLs.
 *
 * - APP_URL / NEXT_PUBLIC_APP_URL — the dashboard / login / signup origin
 * - NEXT_PUBLIC_WIDGET_URL — where widget.js lives (typically same as APP_URL)
 *
 * Falls back to the request host on Vercel, and lastly to the canonical
 * production domain so install snippets always look right in dev.
 */

import type { NextRequest } from "next/server";

const FALLBACK = "https://frictionbounty.app";

export function appBaseUrl(): string {
  const explicit = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  return (explicit || FALLBACK).replace(/\/$/, "");
}

export function widgetBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WIDGET_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  return (explicit || FALLBACK).replace(/\/$/, "");
}

export function appBaseUrlFromRequest(request: NextRequest): string {
  const explicit = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  return host ? `${proto}://${host}` : FALLBACK;
}
