import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED = ["/"];

// Routes that are always public
const PUBLIC = ["/login", "/signup", "/reset-password", "/pricing", "/api"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  // Check for Quantra session cookie (set by client after Firebase login)
  const session = req.cookies.get("quantra_session");
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
