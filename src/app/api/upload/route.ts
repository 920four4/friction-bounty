import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { corsPreflight, withCors } from "@/lib/cors";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MiB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: NextRequest) {
  // Auth: require a valid (active) org API key in the form so this endpoint
  // can't be used as a free unauthenticated R2/Blob bucket.
  const apiKey = request.headers.get("x-fb-api-key") || new URL(request.url).searchParams.get("apiKey");
  if (!apiKey) {
    return withCors(NextResponse.json({ error: "Missing API key" }, { status: 401 }));
  }

  const db = getDb();
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.apiKey, apiKey),
    columns: { id: true, isActive: true },
  });
  if (!org || !org.isActive) {
    return withCors(NextResponse.json({ error: "Invalid or inactive API key" }, { status: 401 }));
  }

  // Accept either raw bytes (Content-Type: image/png) or multipart/form-data
  // with a "file" field. Widget uses multipart for simplicity.
  let buffer: Buffer | null = null;
  let contentType: string | null = null;

  const ct = request.headers.get("content-type") || "";
  if (ct.startsWith("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return withCors(NextResponse.json({ error: "Missing 'file' field" }, { status: 400 }));
    }
    contentType = file.type || null;
    if (file.size > MAX_BYTES) {
      return withCors(NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 }));
    }
    buffer = Buffer.from(await file.arrayBuffer());
  } else if (ALLOWED_TYPES.has(ct)) {
    contentType = ct;
    const ab = await request.arrayBuffer();
    if (ab.byteLength > MAX_BYTES) {
      return withCors(NextResponse.json({ error: "Body too large (max 5 MB)" }, { status: 413 }));
    }
    buffer = Buffer.from(ab);
  } else {
    return withCors(NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 }));
  }

  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return withCors(NextResponse.json({ error: "Unsupported file type" }, { status: 415 }));
  }
  if (!buffer || buffer.byteLength === 0) {
    return withCors(NextResponse.json({ error: "Empty body" }, { status: 400 }));
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `screenshots/${org.id}/${randomUUID()}.${ext}`;

  try {
    const blob = await put(path, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return withCors(NextResponse.json({ url: blob.url }));
  } catch (error) {
    console.error("Blob upload failed:", error);
    return withCors(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
  }
}
