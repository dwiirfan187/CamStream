"use client";
/**
 * OBSStreamClient
 * Pure fullscreen <video> element — no UI, no padding, transparent background.
 * Used as OBS Browser Source.
 *
 * Connects to Socket.io as a receiver, waits for WebRTC offer,
 * then renders the remote stream fullscreen.
 */

import { useRef, useEffect } from "react";
import { useWebRTCReceiver } from "@/hooks/useWebRTCReceiver";

interface OBSStreamClientProps {
  slotId: string;
}

export default function OBSStreamClient({ slotId }: OBSStreamClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { remoteStream } = useWebRTCReceiver(slotId);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        background: "transparent",
        display: "block",
      }}
      aria-label="OBS Browser Source stream"
    />
  );
}
