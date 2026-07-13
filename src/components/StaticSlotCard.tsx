"use client";
/**
 * StaticSlotCard — WIRED version.
 * All className / style values are IDENTICAL to the static version.
 * Only logic changed:
 *  - DeleteButton → calls deleteSlot() Server Action
 *  - CopyUrlButton → real clipboard write
 *  - LiveVideoArea → replaced by <video> tag when remoteStream arrives
 *  - useWebRTCReceiver hook manages P2P stream & live status
 */

import { useRef, useEffect, useTransition } from "react";
import QrCodeDisplay from "@/components/QrCodeDisplay";
import { deleteSlot } from "@/lib/slot-actions";
import { useWebRTCReceiver } from "@/hooks/useWebRTCReceiver";

type SlotStatus = "disconnect" | "live";

interface StaticSlotCardProps {
  id: string;
  name: string;
  /** DB status — used as initial value; live status overridden by WebRTC hook */
  status: SlotStatus;
}

/* ── Status Badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: "live" | "waiting" | "disconnect" | "connecting" }) {
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

/* ── Live Video — real <video> element when stream exists ─────────────────── */
function LiveVideoArea({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, [stream]);

  return (
    <div
      className="w-full aspect-video rounded-xl bg-[#1A1D20] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
      aria-label="Live video feed"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true}
        className="absolute inset-0 w-full h-full object-cover rounded-xl"
        aria-label="Stream kamera langsung"
      />
      {/* Live dot overlay — identical style */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        <span className="w-2 h-2 rounded-full bg-[rgba(57,255,20,0.9)] animate-pulse" aria-hidden="true" />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(57,255,20,0.8)" }}>
          Live
        </span>
      </div>
      {!stream && (
        <div className="flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="6" width="15" height="12" rx="2" stroke="rgba(57,255,20,0.7)" strokeWidth="2" fill="none" />
            <path d="M17 9.5L22 7V17L17 14.5" stroke="rgba(57,255,20,0.7)" strokeWidth="2" strokeLinejoin="round" fill="none" />
            <circle cx="9.5" cy="12" r="2.5" fill="rgba(57,255,20,0.7)" />
          </svg>
          <span className="cc-label-caps text-[rgba(57,255,20,0.8)] text-[10px]">Menunggu Stream...</span>
        </div>
      )}
    </div>
  );
}

/* ── Copy OBS URL Button ──────────────────────────────────────────────────── */
function CopyUrlButton({ isLive, slotId }: { isLive: boolean; slotId: string }) {
  const color = isLive ? "rgba(57, 255, 20, 0.7)" : "#1A1D20";
  return (
    <button
      type="button"
      aria-label="Salin URL OBS Browser Source"
      onClick={() => {
        const url = `${window.location.origin}/stream/obs/${slotId}`;
        navigator.clipboard?.writeText(url).catch(() => {});
      }}
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
        <path d="M6.5 9.5L9.5 6.5M7 4L7.879 3.121A3 3 0 0 1 12.12 7.364L11.5 8M9 12l-.879.879A3 3 0 0 1 3.88 8.636L4.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Salin URL OBS
    </button>
  );
}

/* ── Delete Button ────────────────────────────────────────────────────────── */
function DeleteButton({ slotId, name }: { slotId: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={`Hapus slot ${name}`}
      onClick={() => {
        if (!confirm(`Hapus slot "${name}"?`)) return;
        startTransition(async () => {
          const res = await deleteSlot(slotId);
          if (res.error) alert(res.error);
        });
      }}
      style={{ border: "2px solid #E63946", boxShadow: isPending ? "none" : "3px 3px 0px #E63946", color: "#E63946" }}
      className="
        flex-shrink-0 flex items-center gap-1.5
        bg-white rounded-lg px-2.5 py-1.5
        font-bold text-[10px] tracking-widest uppercase
        transition-all duration-100
        hover:translate-x-[2px] hover:translate-y-[2px]
        hover:bg-[#fff0f1]
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
      "
    >
      {isPending ? (
        <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 4h10M6 4V2.5h4V4M5 4l.75 9.5h4.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {isPending ? "..." : "Hapus"}
    </button>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function StaticSlotCard({ id, name, status }: StaticSlotCardProps) {
  // WebRTC hook — only active for "live" or "disconnect" slots
  const { remoteStream, status: rtcStatus } = useWebRTCReceiver(id);

  // Determine visual status: prefer real-time WebRTC over DB value
  const isLive = rtcStatus === "live" || (status === "live" && rtcStatus !== "disconnected");
  const cardClass = isLive ? "cc-card-live" : "cc-card";
  const badgeStatus = isLive ? "live" : "disconnect";

  return (
    <article className={`${cardClass} flex flex-col gap-4`} aria-label={`Slot kamera: ${name}`}>
      {/* ── Header — identical structure & classes ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="cc-label-caps text-[#1A1D20]/40 text-[9px]">Slot Kamera</span>
          <h3 className="font-bold text-base leading-tight text-[#1A1D20] tracking-tight truncate">{name}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={badgeStatus} />
          <DeleteButton slotId={id} name={name} />
        </div>
      </div>

      {/* ── Media Area — identical wrapper ── */}
      <div className="flex-1 flex flex-col justify-center">
        {isLive ? (
          <LiveVideoArea stream={remoteStream} />
        ) : (
          <QrCodeDisplay slotId={id} slotName={name} />
        )}
      </div>

      {/* ── Footer — identical ── */}
      <CopyUrlButton isLive={isLive} slotId={id} />
    </article>
  );
}
