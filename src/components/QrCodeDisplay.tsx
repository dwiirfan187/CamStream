"use client";

/**
 * QrCodeDisplay — renders a real scannable QR code for a camera slot.
 *
 * The QR value is the full transmitter URL:
 *   http(s)://<host>/transmitter?slot=<slotId>
 *
 * We read window.location.origin at runtime so the URL works correctly
 * whether the user is on localhost, LAN IP, or a production domain —
 * without needing to hardcode anything in env vars.
 */

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

interface QrCodeDisplayProps {
  slotId: string;
  slotName: string;
}

export default function QrCodeDisplay({ slotId, slotName }: QrCodeDisplayProps) {
  // Build the full URL client-side so it always reflects the actual host
  // (localhost in dev, LAN IP when accessed from phone on same WiFi)
  const [transmitterUrl, setTransmitterUrl] = useState<string>("");

  useEffect(() => {
    const origin = window.location.origin;
    setTransmitterUrl(`${origin}/transmitter?slot=${slotId}`);
  }, [slotId]);

  // SSR placeholder — same size as QR to avoid layout shift
  if (!transmitterUrl) {
    return (
      <div
        className="w-full flex flex-col items-center gap-3"
        aria-label="Memuat QR Code..."
      >
        <div className="w-[200px] h-[200px] rounded-xl bg-[#E9ECEF] border-2 border-dashed border-[#1A1D20]/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* QR Code — diperbesar supaya mudah di-scan dari HP */}
      <div
        className="p-3 bg-white border-2 border-[#1A1D20] rounded-xl"
        style={{ boxShadow: "4px 4px 0px #1A1D20" }}
        role="img"
        aria-label={`QR Code untuk slot ${slotName}. Scan untuk membuka halaman transmitter.`}
      >
        <QRCodeSVG
          value={transmitterUrl}
          size={200}
          level="M"           /* Medium error correction — balance antara ukuran & keterbacaan */
          marginSize={1}
          fgColor="#1A1D20"   /* Warna hitam sesuai design system */
          bgColor="#FFFFFF"
        />
      </div>

      {/* URL hint — membantu user tahu apa yang di-scan */}
      <div className="flex flex-col items-center gap-1 w-full">
        <p className="cc-label-caps text-[#1A1D20]/40 text-[9px]">Scan dengan kamera HP</p>
        <p
          className="text-[10px] text-[#1A1D20]/30 font-mono truncate max-w-full px-2 text-center"
          title={transmitterUrl}
        >
          {transmitterUrl}
        </p>
      </div>
    </div>
  );
}
