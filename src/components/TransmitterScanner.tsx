"use client";

import { useEffect, useState, useRef } from "react";

export default function TransmitterScanner() {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    // Load html5-qrcode dynamically to avoid SSR errors
    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        if (!active) return;

        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        html5QrCode
          .start(
            { facingMode: "environment" }, // Target back camera
            {
              fps: 10,
              qrbox: (width, height) => {
                // Responsive scanning box
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size };
              },
            },
            (decodedText) => {
              // On success
              try {
                // Parse if it's a URL
                if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
                  const url = new URL(decodedText);
                  const slotId = url.searchParams.get("slot") || url.searchParams.get("slot_id");
                  if (slotId) {
                    window.location.href = `/transmitter?slot=${slotId}`;
                  } else {
                    // Fallback to routing directly if no query param but same host
                    window.location.href = url.pathname + url.search;
                  }
                } else {
                  // If it's a raw slot id
                  const cleanId = decodedText.trim();
                  if (cleanId.length > 0 && cleanId.length < 50) {
                    window.location.href = `/transmitter?slot=${cleanId}`;
                  } else {
                    setScannerError("Format QR Code tidak valid.");
                  }
                }
              } catch (err) {
                console.error("Redirect error:", err);
                setScannerError("Gagal memproses QR Code.");
              }
            },
            () => {
              // Silent failure on raw frame scan mismatch
            }
          )
          .then(() => {
            if (active) {
              setIsInitializing(false);
            }
          })
          .catch((err) => {
            console.error("Html5Qrcode start error:", err);
            if (active) {
              setScannerError(
                "Gagal mengakses kamera belakang. Pastikan Anda mengizinkan akses kamera di browser."
              );
              setIsInitializing(false);
            }
          });
      })
      .catch((err) => {
        console.error("Dynamic import error:", err);
        if (active) {
          setScannerError("Gagal memuat modul scanner.");
          setIsInitializing(false);
        }
      });

    return () => {
      active = false;
      const scanner = scannerRef.current;
      if (scanner && scanner.isScanning) {
        scanner.stop()
          .then(() => {
            scanner.clear();
          })
          .catch((e: any) => console.error("Error stopping scanner on unmount:", e));
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] w-full px-6 text-center gap-6">
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0px); opacity: 0.8; }
          50% { transform: translateY(220px); opacity: 1; }
          100% { transform: translateY(0px); opacity: 0.8; }
        }
        .qr-scan-line {
          animation: scanline 3s ease-in-out infinite;
        }
        /* Override default html5-qrcode styling to look clean and premium */
        #qr-reader {
          border: none !important;
        }
        #qr-reader video {
          object-fit: cover !important;
          border-radius: 1rem;
        }
      `}</style>

      {/* Header Info */}
      <div className="flex flex-col gap-2 max-w-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E63946] animate-pulse">
          Transmitter Mode
        </span>
        <h2 className="text-xl font-extrabold text-white uppercase tracking-wide">
          Hubungkan Kamera Anda
        </h2>
        <p className="text-xs text-white/40 leading-relaxed px-4">
          Arahkan kamera belakang HP Anda ke QR Code yang ditampilkan di Dashboard laptop/PC untuk memulai stream WebRTC.
        </p>
      </div>

      {/* Scanner Container */}
      <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-2xl">
        <div id="qr-reader" className="absolute inset-0 w-full h-full" />

        {/* Overlay styling for scanning feedback */}
        {!scannerError && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Pulsing red scanner line */}
            <div className="absolute left-6 right-6 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] qr-scan-line top-6" />

            {/* Corner brackets */}
            <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-red-500 rounded-tl-md" />
            <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-red-500 rounded-tr-md" />
            <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-red-500 rounded-bl-md" />
            <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-red-500 rounded-br-md" />
          </div>
        )}

        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 gap-3">
            <svg className="animate-spin text-red-500" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
            </svg>
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">
              Menyiapkan Kamera...
            </span>
          </div>
        )}
      </div>

      {/* Error / Status Bar */}
      {scannerError && (
        <div className="max-w-xs p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-medium leading-relaxed">
          {scannerError}
        </div>
      )}
    </div>
  );
}
