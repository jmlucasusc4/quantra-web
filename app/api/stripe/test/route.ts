// TODO: remove this endpoint before shipping — for env var debugging only
import { NextResponse } from "next/server";

export async function GET() {
  const projectId  = process.env.FIREBASE_ADMIN_PROJECT_ID ?? "(undefined)";
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "(undefined)";

  return NextResponse.json({
    FIREBASE_ADMIN_PROJECT_ID:       projectId,
    FIREBASE_ADMIN_PRIVATE_KEY_head: privateKey.slice(0, 10),
  });
}
