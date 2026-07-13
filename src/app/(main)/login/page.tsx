import type { Metadata } from "next";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login — CamCast",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

/* ── Error messages map ───────────────────────────────────────── */
const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Gagal memulai login Google. Coba lagi.",
  OAuthCallback: "Gagal verifikasi dari Google. Coba lagi.",
  OAuthCreateAccount: "Gagal membuat akun baru via Google.",
  EmailCreateAccount: "Gagal membuat akun baru via email.",
  EmailSignin: "Gagal mengirim magic link. Periksa alamat email kamu.",
  Verification: "Link verifikasi kadaluarsa atau sudah digunakan. Minta link baru.",
  Default: "Terjadi kesalahan. Silakan coba lagi.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  // Jika sudah login, langsung ke dashboard
  if (session?.user) redirect(callbackUrl ?? "/dashboard");

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default) : null;
  const redirectTo = callbackUrl ?? "/dashboard";

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="cc-heading-2">Masuk ke CamCast</h1>
          <p className="text-sm text-[#1A1D20]/60">
            Login untuk mulai menggunakan Receiver Mode
          </p>
        </div>

        {/* ── Error Banner ── */}
        {errorMessage && (
          <div
            role="alert"
            className="cc-card-accent flex items-start gap-3 py-3 px-4"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="#E63946" strokeWidth="1.5"/>
              <path d="M8 5V8.5M8 11H8.01" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-sm font-bold text-[#E63946]">{errorMessage}</p>
          </div>
        )}

        {/* ── Card ── */}
        <div className="cc-card flex flex-col gap-5">

          {/* Google OAuth Button */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo });
            }}
          >
            <button
              type="submit"
              className="
                w-full flex items-center justify-center gap-3
                bg-white border-2 border-[#1A1D20] rounded-xl
                px-5 py-3 font-bold text-sm text-[#1A1D20]
                box-shadow-[4px_4px_0px_#1A1D20]
                hover:translate-x-[2px] hover:translate-y-[2px]
                transition-all duration-100 cursor-pointer
              "
              style={{ boxShadow: "4px 4px 0px #1A1D20" }}
            >
              {/* Google icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 h-0.5 bg-[#1A1D20]/15" />
            <span className="cc-label-caps text-[#1A1D20]/30 text-[10px]">atau</span>
            <div className="flex-1 h-0.5 bg-[#1A1D20]/15" />
          </div>

          {/* Email Magic Link */}
          <form
            action={async (formData: FormData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("nodemailer", { email, redirectTo });
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="cc-label-caps text-[10px] text-[#1A1D20]/60">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="kamu@email.com"
                autoComplete="email"
                className="
                  w-full bg-[#F8F9FA] border-2 border-[#1A1D20] rounded-xl
                  px-4 py-3 text-sm font-medium text-[#1A1D20]
                  placeholder:text-[#1A1D20]/30
                  focus:outline-none focus:border-[#E63946]
                  transition-colors duration-100
                "
              />
            </div>
            <button type="submit" className="cc-btn-primary w-full">
              Kirim Magic Link
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="text-xs text-[#1A1D20]/40 text-center leading-relaxed">
              Kami akan kirim link login ke emailmu. Tidak perlu password.
            </p>
          </form>
        </div>

        {/* Back to home */}
        <p className="text-center text-xs text-[#1A1D20]/40">
          <a href="/" className="font-bold text-[#1A1D20]/60 hover:text-[#1A1D20] transition-colors">
            ← Kembali ke halaman utama
          </a>
        </p>
      </div>
    </div>
  );
}
