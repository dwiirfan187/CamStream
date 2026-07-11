import Link from "next/link";

export default function Navbar() {
  return (
    <header className="cc-navbar">
      {/* Logo */}
      <Link href="/" className="cc-logo">
        {/* Camera icon inline SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="6"
            width="15"
            height="12"
            rx="2"
            stroke="#1A1D20"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M17 9.5L22 7V17L17 14.5"
            stroke="#E63946"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="9.5" cy="12" r="2.5" fill="#1A1D20" />
        </svg>
        Cam<span className="accent">Cast</span>
      </Link>

      {/* Login button */}
      <Link href="/login" className="cc-btn-outline" aria-label="Login ke akun Anda">
        Login
      </Link>
    </header>
  );
}
