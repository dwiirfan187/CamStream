/* ─────────────────────────────────────────────────────────────────
   CameraSlotCard — displays one camera slot in the Receiver dashboard.

   Variants:
   • "disconnect" → cc-card  (black border/shadow)
   • "live"       → cc-card-live (green border/shadow)
   • "empty"      → cc-card-empty (dashed border) — used for Add Slot placeholder
   ───────────────────────────────────────────────────────────────── */

import type { SlotData } from "@/lib/slot-actions";
import SlotNameEditor from "@/components/SlotNameEditor";
import QrCodeDisplay from "@/components/QrCodeDisplay";

/* ── Status Badge ──────────────────────────────────────────────── */
function StatusBadge({ status }: { status: SlotData["status"] }) {
  if (status === "live") {
    return (
      <span className="cc-badge-live flex-shrink-0" role="status" aria-label="Status: Live">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[rgba(57,255,20,0.9)] animate-pulse" aria-hidden="true" />
        Live
      </span>
    );
  }
  return (
    <span className="cc-badge-disconnect flex-shrink-0" role="status" aria-label="Status: Disconnect">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1A1D20]/50" aria-hidden="true" />
      Disconnect
    </span>
  );
}

/* ── Live Video Placeholder ────────────────────────────────────── */
function LiveVideoPlaceholder() {
  return (
    <div
      className="w-full aspect-video rounded-lg bg-[#1A1D20] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
      aria-label="Live video feed placeholder"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)",
        }}
        aria-hidden="true"
      />
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="6" width="15" height="12" rx="2" stroke="rgba(57,255,20,0.7)" strokeWidth="2" fill="none" />
        <path d="M17 9.5L22 7V17L17 14.5" stroke="rgba(57,255,20,0.7)" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <circle cx="9.5" cy="12" r="2.5" fill="rgba(57,255,20,0.7)" />
      </svg>
      <span className="cc-label-caps text-[rgba(57,255,20,0.7)] text-[10px] z-10">Feed Aktif</span>
    </div>
  );
}

/* ── Copy URL Button ───────────────────────────────────────────── */
function CopyUrlButton({ isLive }: { isLive: boolean }) {
  const color = isLive ? "rgba(57, 255, 20, 0.7)" : "#1A1D20";
  return (
    <button
      type="button"
      aria-label="Salin URL OBS Browser Source"
      style={{ border: `2px solid ${color}`, boxShadow: `4px 4px 0px ${color}` }}
      className="
        w-full flex items-center justify-center gap-2
        bg-white rounded-xl px-4 py-2.5
        font-bold text-xs tracking-widest uppercase text-[#1A1D20]
        transition-all duration-100
        hover:translate-x-[2px] hover:translate-y-[2px]
        cursor-pointer
      "
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6.5 9.5L9.5 6.5M7 4L7.879 3.121A3 3 0 0 1 12.12 7.364L11.5 8M9 12l-.879.879A3 3 0 0 1 3.88 8.636L4.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      Salin URL OBS
    </button>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function CameraSlotCard({ slot }: { slot: SlotData }) {
  const isLive = slot.status === "live";
  const cardClass = isLive ? "cc-card-live" : "cc-card";

  return (
    <article className={`${cardClass} flex flex-col gap-4`} aria-label={`Slot kamera: ${slot.name}`}>
      {/* ── Card Header ── */}
      <div className="flex items-start justify-between gap-2">
        <SlotNameEditor slotId={slot.id} initialName={slot.name} />
        <StatusBadge status={slot.status} />
      </div>

      {/* ── Media Area ── */}
      <div className="flex-1 flex flex-col justify-center">
        {isLive ? (
          <LiveVideoPlaceholder />
        ) : (
          <QrCodeDisplay slotId={slot.id} slotName={slot.name} />
        )}
      </div>

      {/* ── Footer action ── */}
      <CopyUrlButton isLive={isLive} />
    </article>
  );
}
