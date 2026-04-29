import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string; email?: string; org?: string;
      team_size?: string; message?: string;
    };

    const { name, email, org, team_size, message } = body;
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    await adminDb().collection("inquiries").add({
      name:      name.trim(),
      email:     email.trim(),
      org:       org?.trim() ?? "",
      team_size: team_size ?? "",
      message:   message?.trim() ?? "",
      source:    "enterprise",
      createdAt: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json({ error: "Server error — please try again." }, { status: 500 });
  }
}
