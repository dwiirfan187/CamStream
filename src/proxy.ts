import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Proteksi semua route di bawah /dashboard
export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const isLoggedIn = !!session?.user;
  const isProtected = nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !isLoggedIn) {
    // Redirect ke /login dengan callbackUrl supaya user balik ke dashboard setelah login
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Jalankan middleware di semua route kecuali static files & NextAuth API
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
