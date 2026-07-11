import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  // Wrapped in try/catch — if auth() throws (e.g. missing secret in dev),
  // the navbar still renders with the Login button instead of crashing.
  let isLoggedIn = false;
  let userName: string | null = null;
  try {
    const session = await auth();
    isLoggedIn = !!session?.user;
    userName = session?.user?.name ?? session?.user?.email ?? null;
  } catch {
    // AUTH_SECRET not yet set or session invalid — treat as logged out
    isLoggedIn = false;
  }

  return (
    <header className="cc-navbar">
      {/* Logo */}
      <Link href="/" className="cc-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="6" width="15" height="12" rx="2" stroke="#1A1D20" strokeWidth="2" fill="none" />
          <path d="M17 9.5L22 7V17L17 14.5" stroke="#E63946" strokeWidth="2" strokeLinejoin="round" fill="none" />
          <circle cx="9.5" cy="12" r="2.5" fill="#1A1D20" />
        </svg>
        Cam<span className="accent">Cast</span>
      </Link>

      {/* Auth actions */}
      <nav className="flex items-center gap-3" aria-label="Navigasi akun">
        {isLoggedIn ? (
          <>
            {/* User name chip */}
            {userName && (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E9ECEF] border-2 border-[#1A1D20]/10">
                <span className="w-2 h-2 rounded-full bg-[rgba(57,255,20,0.8)]" aria-hidden="true" />
                <span className="cc-label-caps text-[10px] text-[#1A1D20]/70 max-w-[120px] truncate">
                  {userName}
                </span>
              </span>
            )}

            {/* Sign Out */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="
                  flex items-center gap-2 px-4 py-2 rounded-xl
                  text-xs font-bold uppercase tracking-widest
                  text-[#1A1D20]/60 border-2 border-transparent
                  hover:border-[#1A1D20]/20 hover:bg-[#E9ECEF]
                  transition-all duration-100 cursor-pointer
                "
                aria-label="Logout dari akun"
              >
                Logout
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="cc-btn-outline" aria-label="Login ke akun Anda">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
