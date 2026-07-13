import type { Metadata } from "next";
import TransmitterStaticUI from "@/components/TransmitterStaticUI";

export const metadata: Metadata = {
  title: "CamCast Transmitter",
};

interface TransmitterPageProps {
  searchParams: Promise<{ slot?: string; slot_id?: string }>;
}

export default async function TransmitterPage({ searchParams }: TransmitterPageProps) {
  const { slot, slot_id } = await searchParams;
  const slotId = slot?.trim() || slot_id?.trim() || undefined;

  // Tampilkan fullscreen UI statis — dengan atau tanpa slot ID
  // slotId akan ditampilkan di top bar jika ada (datang dari scan QR)
  return <TransmitterStaticUI slotId={slotId} />;
}
