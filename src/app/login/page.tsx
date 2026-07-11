export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 gap-6">
      <span className="cc-badge-standby">Em Construção / Coming Soon</span>

      <div className="cc-card max-w-sm w-full flex flex-col gap-4 text-center">
        <h1 className="cc-heading-2">Login</h1>
        <p className="cc-label-caps text-[#E63946]">Authentication</p>
        <p className="text-[#1A1D20]/60 text-sm leading-relaxed">
          Google OAuth dan Email login akan tersedia di fase berikutnya.
        </p>
        <p className="cc-label-caps text-[#1A1D20]/40 text-xs">
          Phase 1 — Belum diimplementasi
        </p>
      </div>
    </div>
  );
}
