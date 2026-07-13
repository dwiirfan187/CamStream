import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

// Proteksi semua route di bawah /dashboard
export default auth((req: NextRequest & { auth: unknown }) => {
  const { nextUrl } = req;
  const session = (req as { auth?: { user?: unknown } }).auth;

  // Jangan sentuh API auth routes sama sekali
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isLoggedIn  = !!session?.user;
  const isProtected = nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)"],
};
