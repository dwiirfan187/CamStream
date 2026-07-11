export default function ReceiverPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 gap-6">
      {/* Status badge */}
      <span className="cc-badge-standby">Em Construção / Coming Soon</span>

      <div className="cc-card max-w-md w-full flex flex-col gap-4 text-center">
        {/* Monitor icon */}
        <div className="flex justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="6" y="8" width="52" height="36" rx="4" stroke="#1A1D20" strokeWidth="3" fill="#E9ECEF" />
            <rect x="12" y="14" width="40" height="24" rx="2" fill="#1A1D20" />
            <path d="M26 20L40 26L26 32V20Z" fill="#F8F9FA" />
            <rect x="29" y="44" width="6" height="8" fill="#1A1D20" />
            <rect x="22" y="52" width="20" height="4" rx="2" fill="#1A1D20" />
          </svg>
        </div>

        <h1 className="cc-heading-2">Dashboard Receiver</h1>
        <p className="cc-label-caps text-[#E63946]">Laptop / Control Room</p>
        <p className="text-[#1A1D20]/60 text-sm leading-relaxed">
          Halaman ini akan menampilkan dashboard grid slot kamera, QR Code generator,
          dan panel kontrol OBS Browser Source.
        </p>
        <p className="cc-label-caps text-[#1A1D20]/40 text-xs">
          Phase 2 — Belum diimplementasi
        </p>
      </div>
    </div>
  );
}
