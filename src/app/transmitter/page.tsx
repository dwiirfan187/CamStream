export default function TransmitterPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 gap-6">
      {/* Status badge */}
      <span className="cc-badge-standby">Em Construção / Coming Soon</span>

      <div className="cc-card max-w-md w-full flex flex-col gap-4 text-center">
        {/* Phone icon */}
        <div className="flex justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="18" y="4" width="28" height="56" rx="5" stroke="#1A1D20" strokeWidth="3" fill="#E9ECEF" />
            <circle cx="32" cy="12" r="2.5" fill="#1A1D20" />
            <rect x="22" y="18" width="20" height="28" rx="2" fill="#1A1D20" />
            <circle cx="32" cy="32" r="7" stroke="#E63946" strokeWidth="2.5" fill="none" />
            <circle cx="32" cy="32" r="3" fill="#E63946" />
            <rect x="27" y="52" width="10" height="2.5" rx="1.25" fill="#1A1D20" />
          </svg>
        </div>

        <h1 className="cc-heading-2">Mode Transmitter</h1>
        <p className="cc-label-caps text-[#E63946]">HP / Kamera / Mobile</p>
        <p className="text-[#1A1D20]/60 text-sm leading-relaxed">
          Halaman ini akan menampilkan QR Scanner, kontrol kamera depan/belakang,
          toggle mikrofon, dan Screen Wake Lock untuk live streaming.
        </p>
        <p className="cc-label-caps text-[#1A1D20]/40 text-xs">
          Phase 2 — Belum diimplementasi
        </p>
      </div>
    </div>
  );
}
