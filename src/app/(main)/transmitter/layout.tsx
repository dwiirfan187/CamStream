/**
 * Transmitter layout — overrides root layout.
 * No Navbar, no padding, pure fullscreen black canvas.
 * Optimized for mobile use.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CamCast Transmitter",
  description: "Mobile camera transmitter — scan QR code dari dashboard untuk memulai.",
  // Penting untuk mobile: disable zoom, fullscreen viewport
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function TransmitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Tidak pakai root layout (Navbar dll) — transmitter adalah fullscreen app
    <div className="w-full h-[100dvh] overflow-hidden bg-black">
      {children}
    </div>
  );
}
