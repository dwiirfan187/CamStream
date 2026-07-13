"use client";
/**
 * TransmitterStaticUI — WIRED version.
 *
 * ALL className / style values are IDENTICAL to the static version.
 * Logic added:
 *  - MediaDevices API for real camera + mic
 *  - Socket.io signaling (transmitter:ready, transmitter:disconnect)
 *  - WebRTC PeerConnection: create offer, handle answer, relay ICE
 *  - Screen Wake Lock
 *  - Flip camera / mute mic wired to real tracks
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import TransmitterScanner from "./TransmitterScanner";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

/* ─── Icons (identical SVGs) ─────────────────────────────────────────────── */
function IconFlipCamera() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
      <path d="M7 3L5 1 3 3" /><path d="M17 3l2-2 2 2" />
    </svg>
  );
}
function IconMicOn() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
function IconMicOff() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7 7 0 0 0 19 12M5 10a7 7 0 0 0 12.66 3.76" />
      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33M9 9v3a3 3 0 0 0 5.12 2.12" />
      <line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

/* ─── ActionBtn — IDENTICAL style to static version ─────────────────────── */
interface ActionBtnProps {
  onClick: () => void;
  label: string;
  sublabel?: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
function ActionBtn({ onClick, label, sublabel, active = true, disabled, children }: ActionBtnProps) {
  const bgColor     = active ? "#E63946" : "rgba(230,57,70,0.12)";
  const borderColor = "#E63946";
  const textColor   = active ? "#FFFFFF" : "#E63946";
  const shadow      = active ? "5px 5px 0px #b02030" : "5px 5px 0px rgba(230,57,70,0.35)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="
        flex flex-col items-center justify-center gap-2
        flex-1 min-w-0 py-5 rounded-2xl
        font-bold uppercase tracking-widest
        transition-all duration-100
        active:translate-x-[3px] active:translate-y-[3px]
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
      "
      style={{ backgroundColor: bgColor, border: `2px solid ${borderColor}`, boxShadow: shadow, color: textColor } as React.CSSProperties}
    >
      {children}
      <span className="text-[11px]">{label}</span>
      {sublabel && <span className="text-[9px] opacity-70 normal-case font-normal tracking-normal">{sublabel}</span>}
    </button>
  );
}

/* ─── Camera Preview Area ────────────────────────────────────────────────── */
function CameraPreview({
  videoRef,
  facing,
  hasStream,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  facing: "front" | "back";
  hasStream: boolean;
}) {
  return (
    <div
      className="w-full max-w-sm aspect-[9/16] max-h-[55dvh] rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
        border: "2px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      aria-label={hasStream ? "Pratinjau kamera langsung" : "Pratinjau kamera (loading)"}
    >
      {/* Scanline texture — identical */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.015) 3px, rgba(255,255,255,0.015) 4px)" }} aria-hidden="true" />

      {/* Corner brackets — identical */}
      {["top-3 left-3 border-t-2 border-l-2 rounded-tl-lg","top-3 right-3 border-t-2 border-r-2 rounded-tr-lg","bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg","bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg"].map((cls, i) => (
        <span key={i} className={`absolute w-6 h-6 border-[#E63946]/60 ${cls}`} aria-hidden="true" />
      ))}

      {/* Real camera <video> — hidden until stream, overlaid on placeholder */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover rounded-2xl"
        style={{
          opacity: hasStream ? 1 : 0,
          transform: facing === "front" ? "scaleX(-1)" : "none",
        }}
        aria-label="Live camera preview"
      />

      {/* Placeholder icon — fades out when stream starts */}
      {!hasStream && (
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(230,57,70,0.12)", border: "2px solid rgba(230,57,70,0.35)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(230,57,70,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1 text-center px-6">
            <p className="text-white/80 font-bold text-sm tracking-wide">Pratinjau Kamera</p>
            <div className="flex items-center gap-1.5 mt-1" aria-label="Memuat...">
              {[0,1,2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#E63946]/70" style={{ animation: `pulse 1.4s ease-in-out ${i*0.2}s infinite` }} aria-hidden="true" />
              ))}
            </div>
            <p className="text-white/30 text-[10px] mt-1 uppercase tracking-widest font-bold">Loading...</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)" }}>
            {facing === "front" ? "Kamera Depan" : "Kamera Belakang"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
interface TransmitterStaticUIProps {
  slotId?: string;
}

export default function TransmitterStaticUI({ slotId }: TransmitterStaticUIProps) {
  // Kondisi A: Tanpa Slot ID -> Tampilkan QR Code Scanner
  if (!slotId) {
    return (
      <div
        className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden select-none"
        style={{ background: "#0a0a0a" }}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between px-5 pt-6 pb-4 flex-shrink-0 absolute top-0 left-0 right-0 z-30">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              CamCast · Transmitter
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,193,7,0.12)", border: "1.5px solid rgba(255,193,7,0.4)" }}
            role="status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107]" aria-hidden="true" />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#FFC107" }}>
              Tanpa Slot
            </span>
          </div>
        </div>

        <TransmitterScanner />
      </div>
    );
  }

  const [facing, setFacing]     = useState<"front" | "back">("back");
  const [isMuted, setIsMuted]   = useState(false);
  const [hasStream, setHasStream] = useState(false);
  const [connStatus, setConnStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [camError, setCamError] = useState<string | null>(null);

  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const socketRef   = useRef<Socket | null>(null);
  const pcRef       = useRef<RTCPeerConnection | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  /* ── Acquire Wake Lock ──────────────────────────────────────────────── */
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try { wakeLockRef.current = await navigator.wakeLock.request("screen"); } catch { /* non-critical */ }
  }, []);

  /* ── Start camera ───────────────────────────────────────────────────── */
  const startCamera = useCallback(async (facingMode: "front" | "back") => {
    setCamError(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode === "front" ? "user" : "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true,
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach((t) => { t.enabled = !isMuted; });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setHasStream(true);
      await acquireWakeLock();

      // Add tracks to existing PC if already connected
      if (pcRef.current) {
        const senders = pcRef.current.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) sender.replaceTrack(track).catch(() => {});
          else pcRef.current?.addTrack(track, stream);
        });
      }

      // Signal ready if socket connected
      if (socketRef.current?.connected && slotId) {
        socketRef.current.emit("transmitter:ready", { slotId });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        setCamError("Izin kamera ditolak. Buka pengaturan browser dan izinkan kamera.");
      } else if (msg.includes("NotFound")) {
        setCamError("Kamera tidak ditemukan.");
      } else {
        setCamError(`Gagal membuka kamera: ${msg}`);
      }
      setHasStream(false);
    }
  }, [isMuted, slotId, acquireWakeLock]);

  /* ── Socket.io + WebRTC signaling ───────────────────────────────────── */
  useEffect(() => {
    if (!slotId) return; // No slot ID = no WebRTC needed

    const socket = io({ path: "/api/socket", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnStatus("connected");
      if (streamRef.current) socket.emit("transmitter:ready", { slotId });
    });
    socket.on("connect_error", () => setConnStatus("error"));
    socket.on("disconnect", () => setConnStatus("connecting"));

    // Receiver joined → create offer
    socket.on("webrtc:request-offer", async ({ receiverSocketId }: { slotId: string; receiverSocketId: string }) => {
      if (!streamRef.current) return;

      pcRef.current?.close();
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc:ice-candidate", { slotId, candidate: e.candidate.toJSON(), targetSocketId: receiverSocketId });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { slotId, offer: pc.localDescription!, targetSocketId: receiverSocketId });
    });

    // Answer received from receiver
    socket.on("webrtc:answer", async ({ answer }: { slotId: string; answer: RTCSessionDescriptionInit }) => {
      try { await pcRef.current?.setRemoteDescription(answer); } catch { /* benign */ }
    });

    // ICE candidate from receiver
    socket.on("webrtc:ice-candidate", async ({ candidate }: { slotId: string; candidate: RTCIceCandidateInit }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* benign */ }
    });

    // Auto-start camera on mount
    startCamera(facing);

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      wakeLockRef.current?.release().catch(() => {});
      if (slotId) socket.emit("transmitter:disconnect", { slotId });
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

  /* ── Flip camera handler ────────────────────────────────────────────── */
  const handleFlip = useCallback(async () => {
    const next: "front" | "back" = facing === "back" ? "front" : "back";
    setFacing(next);
    await startCamera(next);
  }, [facing, startCamera]);

  /* ── Mute toggle ────────────────────────────────────────────────────── */
  const handleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !newMuted; });
  }, [isMuted]);

  /* ── Status pill data ───────────────────────────────────────────────── */
  const pillData = slotId
    ? {
        connecting: { label: "Menghubungkan...", bg: "rgba(255,193,7,0.12)", border: "rgba(255,193,7,0.4)", dot: "#FFC107", text: "#FFC107" },
        connected:  { label: "Terhubung",        bg: "rgba(57,255,20,0.12)",  border: "rgba(57,255,20,0.4)",  dot: "rgba(57,255,20,0.9)", text: "rgba(57,255,20,0.9)" },
        error:      { label: "Koneksi Gagal",     bg: "rgba(230,57,70,0.12)", border: "rgba(230,57,70,0.4)",  dot: "#E63946", text: "#E63946" },
      }[connStatus]
    : { label: "Tanpa Slot", bg: "rgba(255,193,7,0.12)", border: "rgba(255,193,7,0.4)", dot: "#FFC107", text: "#FFC107" };

  /* ─── RENDER — IDENTICAL structure & all classNames to static version ─── */
  return (
    <div
      className="relative w-full h-[100dvh] flex flex-col items-center overflow-hidden select-none"
      style={{ background: "#0a0a0a" }}
    >
      {/* ── Top bar ── */}
      <div className="w-full flex items-center justify-between px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
            CamCast · Transmitter
          </span>
          {slotId && (
            <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
              Slot: <span className="font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{slotId}</span>
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: pillData.bg, border: `1.5px solid ${pillData.border}` }}
          role="status"
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: pillData.dot }} aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: pillData.text }}>
            {pillData.label}
          </span>
        </div>
      </div>

      {/* ── Camera preview ── */}
      <div className="flex-1 flex items-center justify-center w-full px-5 min-h-0">
        <CameraPreview videoRef={videoRef} facing={facing} hasStream={hasStream} />
      </div>

      {/* ── Camera error ── */}
      {camError && (
        <div className="w-full px-5 pb-2">
          <p className="text-center text-[10px] font-bold" style={{ color: "#E63946" }}>{camError}</p>
        </div>
      )}

      {/* ── Bottom controls ── */}
      <div className="w-full flex-shrink-0 px-5 pb-10 pt-4 flex flex-col gap-3">
        {/* Muted indicator — identical to static */}
        {isMuted && (
          <div className="flex justify-center">
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(255,193,7,0.15)", border: "1.5px solid #FFC107", color: "#FFC107" }}
              role="status" aria-live="polite"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
              </svg>
              Mikrofon Mati
            </span>
          </div>
        )}

        {/* Two action buttons — identical structure & styles */}
        <div className="flex gap-4" role="group" aria-label="Kontrol kamera">
          <ActionBtn
            onClick={handleFlip}
            label="Ganti Kamera"
            sublabel={facing === "back" ? "→ Depan" : "→ Belakang"}
            active={true}
          >
            <IconFlipCamera />
          </ActionBtn>
          <ActionBtn
            onClick={handleMute}
            label={isMuted ? "Unmute Mic" : "Mute Mic"}
            sublabel={isMuted ? "Mic mati" : "Mic aktif"}
            active={!isMuted}
          >
            {isMuted ? <IconMicOff /> : <IconMicOn />}
          </ActionBtn>
        </div>

        <p className="text-center text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.15)" }}>
          {slotId ? "Streaming aktif — jangan tutup layar ini" : "Scan QR dari dashboard untuk memulai"}
        </p>
      </div>
    </div>
  );
}
