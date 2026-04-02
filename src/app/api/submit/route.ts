import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { submissions, rateLimitLog } from "../../../db/schema";
import { z } from "zod";
import { UAParser } from "ua-parser-js";

const submissionSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  issueType: z.enum(["bug", "ux_confusion", "feature_request"]),
  title: z.string().min(1).max(255),
  description: z.string().min(10),
  pageUrl: z.string().url(),
  screenshotUrl: z.string().url().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  viewportWidth: z.number().optional(),
  viewportHeight: z.number().optional(),
  referrer: z.string().optional(),
  fingerprint: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    
    // Validate input
    const result = submissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    
    // Get IP address
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";
    
    // Rate limiting check: max 3 submissions per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentAttempts = await db.query.rateLimitLog.findMany({
      where: (log, { and, eq, gte }) => and(
        eq(log.ipAddress, ipAddress as string),
        gte(log.attemptedAt, oneHourAgo)
      ),
    });
    
    if (recentAttempts.length >= 3) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    
    // Log attempt
    await db.insert(rateLimitLog).values({
      ipAddress: ipAddress as string,
      email: data.email,
      fingerprint: data.fingerprint,
    });
    
    // Parse User-Agent if not provided
    let browser = data.browser;
    let os = data.os;
    
    if (!browser || !os) {
      const userAgent = request.headers.get("user-agent") || "";
      const parser = new UAParser(userAgent);
      browser = browser || parser.getBrowser().name || "Unknown";
      os = os || parser.getOS().name || "Unknown";
    }
    
    // Create submission
    const submission = await db.insert(submissions).values({
      email: data.email,
      name: data.name,
      issueType: data.issueType,
      title: data.title,
      description: data.description,
      pageUrl: data.pageUrl,
      screenshotUrl: data.screenshotUrl,
      browser,
      os,
      viewportWidth: data.viewportWidth,
      viewportHeight: data.viewportHeight,
      referrer: data.referrer,
      ipAddress: ipAddress as string,
      fingerprint: data.fingerprint,
      status: "pending",
    }).returning();
    
    return NextResponse.json(
      { 
        success: true, 
        id: submission[0].id,
        message: "Submission received. We'll review and notify you via email."
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}