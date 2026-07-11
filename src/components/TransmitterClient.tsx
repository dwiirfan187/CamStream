"use client";

/**
 * TransmitterClient — fullscreen camera UI for the mobile transmitter.
 *
 * Features:
 * - MediaDevices API: request camera + mic permissions
 * - Live camera preview (mirrored for front cam)
 * - Flip camera (front ↔ back)
 * - Mute / unmute microphone
 * - Screen Wake Lock (prevent phone screen from sleeping)
 * - Socket.io: emit "transmitter:ready" on stream start,
 *              emit "transmitter:disconnect" on stop/unmount
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type CameraFacing = "user" | "environment";
type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

interface TransmitterClientProps {
  slotId: string;
}

// ─── Icon components ──────────────────────────────────────────────────────────

function IconFlip() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h18M3 12h18M8 17l4 4 4-4" />
      <path d="M8 7l4-4 4 4" />
    </svg>
  );
}

function IconMicOn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8" />
    </svg>
  );
}

function IconMicOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M18.89 13.23A7 7 0 0 0 19 12M5 10a7 7 0 0 0 12.66 3.76M15 9.34V5a3 3 0 0 0-5.68-1.33M9 9v3a3 3 0 0 0 5.12 2.12M12 19v3M8 22h8" />
    </svg>
  );
}

function IconStop() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

// ─── Action button ─────────────────────────────────────────────────────────────

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;     // true = "on" state (e.g. mic is active)
  muted?: boolean;      // true = muted/warning state → yellow
  label: string;
  children: React.ReactNode;
}

function ActionButton({ onClick, disabled, active = true, muted, label, children }: ActionButtonProps) {
  const borderColor = muted ? "#FFC107" : active ? "#E63946" : "#E63946";
  const shadowColor = muted ? "#FFC107" : "#E63946";
  const bgColor     = muted ? "rgba(255,193,7,0.15)" : active ? "#E63946" : "rgba(230,57,70,0.15)";
  const textColor   = muted ? "#FFC107" : "#FFFFFF";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="
        flex flex-col items-center justify-center gap-1.5
        w-20 h-20 rounded-2xl
        font-bold text-[10px] tracking-widest uppercase
        transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px]
        disabled:opacity-40 disabled:cursor-not-allowed
        cursor-pointer select-none
      "
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: disabled ? "none" : `4px 4px 0px ${shadowColor}`,
        color: textColor,
      } as React.CSSProperties}
    >
      {children}
      <span>{label.split(" ")[0]}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TransmitterClient({ slotId }: TransmitterClientProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const socketRef   = useRef<Socket | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const [phase, setPhase]           = useState<"idle" | "streaming" | "stopped">("idle");
  const [facing, setFacing]         = useState<CameraFacing>("environment"); // default back cam
  const [isMuted, setIsMuted]       = useState(false);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("idle");
  const [error, setError]           = useState<string | null>(null);

  // ── Acquire Wake Lock ──────────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // Wake Lock denied — not critical, streaming still works
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }, []);

  // ── Stop stream + cleanup ─────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    releaseWakeLock();

    if (socketRef.current?.connected) {
      socketRef.current.emit("transmitter:disconnect", { slotId });
    }
    setPhase("stopped");
  }, [slotId, releaseWakeLock]);

  // ── Start stream ──────────────────────────────────────────────────────────
  const startStream = useCallback(async (facingMode: CameraFacing = facing) => {
    setError(null);
    try {
      // Stop any existing stream first
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // mute local preview to avoid echo
        await videoRef.current.play();
      }

      // Apply current mute state to new stream
      stream.getAudioTracks().forEach((t) => { t.enabled = !isMuted; });

      await acquireWakeLock();
      setPhase("streaming");

      // Signal socket
      if (socketRef.current?.connected) {
        socketRef.current.emit("transmitter:ready", { slotId });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengakses kamera.";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Izin kamera/mikrofon ditolak. Buka pengaturan browser dan izinkan akses kamera.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setError("Kamera tidak ditemukan di perangkat ini.");
      } else {
        setError(`Gagal mengakses kamera: ${msg}`);
      }
    }
  }, [facing, isMuted, slotId, acquireWakeLock]);

  // ── Flip camera ──────────────────────────────────────────────────────────
  const flipCamera = useCallback(async () => {
    const next: CameraFacing = facing === "environment" ? "user" : "environment";
    setFacing(next);
    if (phase === "streaming") await startStream(next);
  }, [facing, phase, startStream]);

  // ── Toggle mute ───────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !newMuted; });
  }, [isMuted]);

  // ── Socket.io connection ──────────────────────────────────────────────────
  useEffect(() => {
    setConnStatus("connecting");

    const socket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setConnStatus("connected");
      // If already streaming when socket reconnects, re-signal
      if (streamRef.current) {
        socket.emit("transmitter:ready", { slotId });
      }
    });

    socket.on("disconnect", () => setConnStatus("idle"));
    socket.on("connect_error", () => setConnStatus("error"));

    socketRef.current = socket;

    return () => {
      socket.emit("transmitter:disconnect", { slotId });
      socket.disconnect();
    };
  }, [slotId]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // ── Re-acquire wake lock on visibility change ─────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && phase === "streaming") {
        acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase, acquireWakeLock]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Connection status pill
  const connPill = {
    idle:       { label: "Menghubungkan...", color: "#FFC107" },
    connecting: { label: "Menghubungkan...", color: "#FFC107" },
    connected:  { label: "Terhubung",        color: "rgba(57,255,20,0.85)" },
    error:      { label: "Koneksi Gagal",    color: "#E63946" },
  }[connStatus];

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col select-none">

      {/* ── Camera preview ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          // Mirror front camera for natural selfie view
          transform: facing === "user" ? "scaleX(-1)" : "none",
        }}
        aria-label="Live camera preview"
      />

      {/* ── Dark vignette overlay (bottom) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2">
        {/* Slot info */}
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            CamCast · Transmitter
          </span>
          <span className="text-white font-bold text-sm">
            Slot: <span className="font-mono text-xs opacity-70">{slotId}</span>
          </span>
        </div>

        {/* Connection status pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
          style={{
            borderColor: connPill.color,
            backgroundColor: `${connPill.color}20`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: connPill.color,
              animation: connStatus === "connected" ? "pulse 2s infinite" : "none",
            }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: connPill.color }}
          >
            {connPill.label}
          </span>
        </div>
      </div>

      {/* ── IDLE state: Start button ── */}
      {phase === "idle" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-8">
          {error && (
            <div
              className="w-full max-w-sm rounded-2xl p-4 text-center border-2"
              style={{ borderColor: "#E63946", backgroundColor: "rgba(230,57,70,0.15)" }}
            >
              <p className="text-white text-sm font-bold leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => startStream()}
            className="flex flex-col items-center justify-center gap-3 w-40 h-40 rounded-full cursor-pointer active:scale-95 transition-transform duration-100"
            style={{
              backgroundColor: "#E63946",
              border: "3px solid #E63946",
              boxShadow: "0 0 0 8px rgba(230,57,70,0.2), 6px 6px 0px #c62f3b",
            }}
            aria-label="Mulai kamera"
          >
            <IconCamera />
            <span className="text-white font-bold text-sm tracking-wider uppercase">
              Mulai Kamera
            </span>
          </button>

          <p className="text-white/40 text-xs text-center max-w-xs leading-relaxed">
            Ketuk untuk meminta izin kamera & mikrofon, lalu mulai streaming ke dashboard.
          </p>
        </div>
      )}

      {/* ── STOPPED state ── */}
      {phase === "stopped" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-8">
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-center border-2"
            style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <p className="text-white font-bold text-base">Streaming Dihentikan</p>
            <p className="text-white/50 text-sm mt-2">Kamera dimatikan dan sinyal disconnect dikirim ke dashboard.</p>
          </div>
          <button
            type="button"
            onClick={() => { setPhase("idle"); startStream(); }}
            className="cc-btn-primary"
            aria-label="Mulai ulang kamera"
          >
            Mulai Ulang
          </button>
        </div>
      )}

      {/* ── STREAMING: Live indicator ── */}
      {phase === "streaming" && (
        <div className="relative z-10 px-5 pt-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: "rgba(57,255,20,0.9)", animation: "pulse 1.5s infinite" }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(57,255,20,0.9)" }}
            >
              Live
            </span>
            {isMuted && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                style={{ borderColor: "#FFC107", color: "#FFC107", backgroundColor: "rgba(255,193,7,0.15)" }}
              >
                Muted
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom controls (only while streaming) ── */}
      {phase === "streaming" && (
        <div className="relative z-10 mt-auto pb-10 pt-6 px-6">
          <div className="flex items-center justify-center gap-5">

            {/* Flip camera */}
            <ActionButton
              onClick={flipCamera}
              active={true}
              label="Ganti Kamera"
              aria-label={`Ganti ke kamera ${facing === "environment" ? "depan" : "belakang"}`}
            >
              <IconFlip />
            </ActionButton>

            {/* Stop */}
            <button
              type="button"
              onClick={stopStream}
              className="flex flex-col items-center justify-center gap-1.5 w-24 h-24 rounded-full cursor-pointer active:scale-95 transition-transform"
              style={{
                backgroundColor: "rgba(230,57,70,0.9)",
                border: "3px solid #E63946",
                boxShadow: "5px 5px 0px #c62f3b",
                color: "#FFFFFF",
              }}
              aria-label="Stop streaming"
            >
              <IconStop />
              <span className="text-[10px] font-bold uppercase tracking-widest">Stop</span>
            </button>

            {/* Mute */}
            <ActionButton
              onClick={toggleMute}
              active={!isMuted}
              muted={isMuted}
              label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <IconMicOff /> : <IconMicOn />}
            </ActionButton>

          </div>

          {/* Camera facing label */}
          <p className="text-center mt-4 text-white/30 text-[10px] uppercase tracking-widest">
            {facing === "user" ? "Kamera Depan" : "Kamera Belakang"}
          </p>
        </div>
      )}
    </div>
  );
}
