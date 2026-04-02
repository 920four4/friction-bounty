import { NextResponse } from "next/server";

export async function GET() {
  // Check if env var is set (don't expose the actual value)
  const hasPassword = !!process.env.ADMIN_PASSWORD;
  const passwordLength = process.env.ADMIN_PASSWORD?.length || 0;
  
  return NextResponse.json({
    hasPassword,
    passwordLength,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
