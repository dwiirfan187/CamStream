"use client";
/**
 * useWebRTCReceiver
 * Manages the receiver (dashboard / OBS) side of one WebRTC slot.
 *
 * Flow:
 *  1. Connect Socket.io → join slot room as "receiver"
 *  2. Listen slot:status → expose isLive
 *  3. On webrtc:offer → create RTCPeerConnection, answer, relay ICE
 *  4. On track → expose remoteStream
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export type ReceiverStatus = "connecting" | "waiting" | "live" | "disconnected";

export function useWebRTCReceiver(slotId: string) {
  const socketRef = useRef<Socket | null>(null);
  const pcRef     = useRef<RTCPeerConnection | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus]             = useState<ReceiverStatus>("connecting");

  const closePc = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
  }, []);

  useEffect(() => {
    const socket = io({ path: "/api/socket", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("waiting");
      socket.emit("receiver:watch", { slotId });
    });

    // ── Slot status broadcast ─────────────────────────────────────────────
    socket.on("slot:status", ({ slotId: sid, status: s }: { slotId: string; status: string }) => {
      if (sid !== slotId) return;
      if (s === "live") setStatus("live");
      else { setStatus("disconnected"); closePc(); }
    });

    // ── Receive WebRTC offer from transmitter ─────────────────────────────
    socket.on(
      "webrtc:offer",
      async ({ offer, senderSocketId }: { slotId: string; offer: RTCSessionDescriptionInit; senderSocketId: string }) => {
        closePc();
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        const stream = new MediaStream();
        pc.ontrack = (e) => {
          e.streams[0]?.getTracks().forEach((t) => stream.addTrack(t));
          setRemoteStream(new MediaStream(stream.getTracks()));
          setStatus("live");
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("webrtc:ice-candidate", {
              slotId, candidate: e.candidate.toJSON(), targetSocketId: senderSocketId,
            });
          }
        };

        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { slotId, answer: pc.localDescription!, targetSocketId: senderSocketId });
      }
    );

    // ── Receive ICE candidate ─────────────────────────────────────────────
    socket.on("webrtc:ice-candidate", async ({ candidate }: { slotId: string; candidate: RTCIceCandidateInit }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* benign */ }
    });

    socket.on("disconnect", () => { setStatus("disconnected"); closePc(); });

    return () => { closePc(); socket.disconnect(); };
  }, [slotId, closePc]);

  return { remoteStream, status };
}
