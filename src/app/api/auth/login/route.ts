import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { attemptLogin, setSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const session = await attemptLogin(parsed.data.email, parsed.data.password);
  if (!session) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await setSession({ uid: session.uid, role: session.role, oid: session.oid });

  const redirectTo = session.role === "super_admin" ? "/super-admin" : "/dashboard";
  return NextResponse.json({ ok: true, redirect: redirectTo });
}
