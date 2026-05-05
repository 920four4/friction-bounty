import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizations } from "@/db/schema";
import { corsPreflight, withCors } from "@/lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return withCors(NextResponse.json({ error: "Missing key" }, { status: 400 }));
  }

  const db = getDb();
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.apiKey, key),
  });

  if (!org || !org.isActive) {
    return withCors(NextResponse.json({ error: "Invalid or inactive key" }, { status: 404 }));
  }

  return withCors(NextResponse.json({
    orgName: org.name,
    primaryColor: org.widgetPrimaryColor,
    position: org.widgetPosition,
    welcomeMessage: org.widgetWelcomeMessage,
    bountyAmount: org.defaultBountyAmount,
    currency: org.bountyCurrency,
  }));
}
