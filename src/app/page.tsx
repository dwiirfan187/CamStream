import Link from "next/link";

/* ─── Icon: Monitor (Receiver) ─────────────────────────────────────────── */
function IconMonitor() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Screen body */}
      <rect
        x="6"
        y="8"
        width="52"
        height="36"
        rx="4"
        stroke="#1A1D20"
        strokeWidth="3"
        fill="#E9ECEF"
      />
      {/* Screen inner */}
      <rect x="12" y="14" width="40" height="24" rx="2" fill="#1A1D20" />
      {/* Play triangle on screen */}
      <path d="M26 20L40 26L26 32V20Z" fill="#F8F9FA" />
      {/* Stand neck */}
      <rect x="29" y="44" width="6" height="8" fill="#1A1D20" />
      {/* Stand base */}
      <rect x="22" y="52" width="20" height="4" rx="2" fill="#1A1D20" />
    </svg>
  );
}

/* ─── Icon: Smartphone (Transmitter) ───────────────────────────────────── */
function IconPhone() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Phone body */}
      <rect
        x="18"
        y="4"
        width="28"
        height="56"
        rx="5"
        stroke="#1A1D20"
        strokeWidth="3"
        fill="#E9ECEF"
      />
      {/* Camera dot */}
      <circle cx="32" cy="12" r="2.5" fill="#1A1D20" />
      {/* Screen area */}
      <rect x="22" y="18" width="20" height="28" rx="2" fill="#1A1D20" />
      {/* Camera lens on screen */}
      <circle cx="32" cy="32" r="7" stroke="#E63946" strokeWidth="2.5" fill="none" />
      <circle cx="32" cy="32" r="3" fill="#E63946" />
      {/* Home indicator */}
      <rect x="27" y="52" width="10" height="2.5" rx="1.25" fill="#1A1D20" />
    </svg>
  );
}

/* ─── Mode Card ──────────────────────────────────────────────────────────── */
interface ModeCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  description: string;
  features: string[];
  ctaText: string;
  tag: string;
}

function ModeCard({
  href,
  icon,
  label,
  subtitle,
  description,
  features,
  ctaText,
  tag,
}: ModeCardProps) {
  return (
    <Link
      href={href}
      className="cc-card cc-card-link group flex flex-col gap-6 flex-1 min-w-0"
      aria-label={`Masuk ke ${label}`}
    >
      {/* Tag pill */}
      <div className="self-start">
        <span className="cc-label-caps px-3 py-1 border-2 border-[#1A1D20] rounded-full bg-[#E9ECEF]">
          {tag}
        </span>
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center w-24 h-24 rounded-xl bg-[#E9ECEF] border-2 border-[#1A1D20] self-center">
        {icon}
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-2">
        <h2 className="cc-heading-2">{label}</h2>
        <p className="cc-label-caps text-[#E63946]">{subtitle}</p>
        <p className="text-[#1A1D20]/70 text-sm leading-relaxed mt-1">{description}</p>
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-2 flex-1" role="list">
        {features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-sm text-[#1A1D20]">
            {/* Bullet checkmark */}
            <span
              className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 border-[#1A1D20] flex items-center justify-center bg-[#1A1D20]"
              aria-hidden="true"
            >
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path
                  d="M1 3.5L3.5 6L8 1"
                  stroke="#F8F9FA"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div
        className="cc-btn-primary w-full text-center mt-auto"
        aria-hidden="true" /* outer Link is the real action */
      >
        {ctaText}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 8H13M9 4L13 8L9 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}

/* ─── Landing Page ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 px-6 py-12 md:px-12 lg:px-16 xl:px-24">
      {/* ── Hero heading ── */}
      <section className="flex flex-col items-center text-center gap-4 mb-14">
        <span className="cc-label-caps px-4 py-1.5 border-2 border-[#1A1D20] rounded-full bg-white inline-block">
          Web Wireless Camera Mirroring
        </span>
        <h1 className="cc-heading-1 max-w-2xl">
          Pilih Mode Perangkat Anda
          <br />
          <span className="text-[#E63946]">Select Your Mode</span>
        </h1>
        <p className="text-[#1A1D20]/60 text-base max-w-lg leading-relaxed">
          CamCast menghubungkan smartphone kamu ke OBS / vMix sebagai wireless
          external camera — tanpa kabel, tanpa delay berarti.
        </p>
      </section>

      {/* ── Two-column mode selector ── */}
      <section
        className="flex flex-col lg:flex-row gap-8 lg:gap-10 w-full max-w-5xl mx-auto flex-1"
        aria-label="Pilih mode perangkat"
      >
        {/* Receiver Card */}
        <ModeCard
          href="/receiver"
          icon={<IconMonitor />}
          tag="01 — RECEIVER"
          label="Mode Receiver"
          subtitle="Laptop / Monitor / Control Room"
          description="Buka di laptop atau komputer streaming kamu. Terima feed kamera dari perangkat mobile dan tampilkan sebagai Browser Source di OBS atau vMix."
          features={[
            "Dashboard grid slot kamera aktif & non-aktif",
            "QR Code otomatis per slot kamera",
            "Copy link langsung untuk OBS Browser Source",
            "Rename slot sesuka hati (Main Cam, Side Cam, dll.)",
          ]}
          ctaText="Buka Receiver"
        />

        {/* Divider — visible only on large screens */}
        <div
          className="hidden lg:flex flex-col items-center gap-3 self-stretch"
          aria-hidden="true"
        >
          <div className="w-0.5 flex-1 bg-[#1A1D20]/20" />
          <span className="cc-label-caps text-[#1A1D20]/40 rotate-0">atau</span>
          <div className="w-0.5 flex-1 bg-[#1A1D20]/20" />
        </div>

        {/* Horizontal divider on mobile */}
        <div
          className="flex lg:hidden items-center gap-4"
          aria-hidden="true"
        >
          <div className="flex-1 h-0.5 bg-[#1A1D20]/20" />
          <span className="cc-label-caps text-[#1A1D20]/40">atau</span>
          <div className="flex-1 h-0.5 bg-[#1A1D20]/20" />
        </div>

        {/* Transmitter Card */}
        <ModeCard
          href="/transmitter"
          icon={<IconPhone />}
          tag="02 — TRANSMITTER"
          label="Mode Transmitter"
          subtitle="HP / Kamera / Perangkat Mobile"
          description="Buka di smartphone kamu. Scan QR Code dari Receiver lalu langsung stream kamera HP-mu sebagai input kamera ke laptop secara wireless."
          features={[
            "QR Scanner built-in langsung di browser",
            "Toggle kamera depan / belakang",
            "Mute / Unmute mikrofon dengan satu klik",
            "Screen Wake Lock — layar tidak mati saat live",
          ]}
          ctaText="Buka Transmitter"
        />
      </section>

      {/* ── Footer note ── */}
      <footer className="mt-14 flex justify-center">
        <p className="text-[#1A1D20]/40 text-xs text-center max-w-sm leading-relaxed">
          Pastikan kedua perangkat terhubung ke jaringan yang sama untuk hasil terbaik.
          CamCast menggunakan WebRTC P2P — tidak ada data yang melewati server kami.
        </p>
      </footer>
    </div>
  );
}
