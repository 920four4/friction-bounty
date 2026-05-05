import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { corsPreflight, withCors } from "@/lib/cors";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || "friction-bounty";
const PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.S3_PUBLIC_URL || "";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST() {
  try {
    const key = `screenshots/${randomUUID()}.png`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: "image/png",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const publicUrl = PUBLIC_URL
      ? `${PUBLIC_URL}/${key}`
      : `${process.env.R2_ENDPOINT}/${BUCKET_NAME}/${key}`;

    return withCors(NextResponse.json({ uploadUrl, publicUrl, key }));
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    return withCors(NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    ));
  }
}
