import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSlots } from "@/lib/slot-actions";
import StaticSlotCard from "@/components/StaticSlotCard";
import StaticEmptySlot from "@/components/StaticEmptySlot";
import AddSlotButton from "@/components/AddSlotButton";

export const metadata: Metadata = {
  title: "Dashboard Receiver — CamCast",
  description: "Ruang Kontrol Utama. Kelola slot kamera dan stream langsung ke OBS / vMix.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user) redirect("/login");

  // ── Real DB fetch ─────────────────────────────────────────────────────────
  const slots = await getSlots();
  const liveCount       = slots.filter((s) => s.status === "live").length;
  const disconnectCount = slots.filter((s) => s.status === "disconnect").length;

  // ── Layout is IDENTICAL to static version — only data source changed ──────
  return (
    <div className="flex flex-col flex-1 px-6 py-8 md:px-10 lg:px-14 gap-8">

      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="cc-label-caps text-[#1A1D20]/40 text-[10px]">Receiver Mode</p>
          <h1 className="cc-heading-2">Ruang Kontrol Utama</h1>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-1" aria-label="Ringkasan status slot">
            {liveCount > 0 && (
              <span className="cc-badge-live">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[rgba(57,255,20,0.9)] animate-pulse" aria-hidden="true" />
                {liveCount} Live
              </span>
            )}
            {disconnectCount > 0 && (
              <span className="cc-badge-disconnect">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1A1D20]/50" aria-hidden="true" />
                {disconnectCount} Disconnect
              </span>
            )}
            {slots.length === 0 && (
              <span className="cc-badge-standby">Belum ada slot</span>
            )}
          </div>
        </div>

        {/* Tombol Tambah — wired AddSlotButton, same className cc-btn-primary */}
        <AddSlotButton />
      </header>

      {/* ── Divider ── */}
      <div className="h-0.5 bg-[#1A1D20]/10 w-full" aria-hidden="true" />

      {/* ── Camera Grid ── */}
      {slots.length === 0 ? (
        <section className="flex flex-col flex-1 items-center justify-center gap-6 py-16">
          <StaticEmptySlot slotNumber={1} />
        </section>
      ) : (
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-label="Grid slot kamera"
        >
          {slots.map((slot) => (
            <StaticSlotCard
              key={slot.id}
              id={slot.id}
              name={slot.name}
              status={slot.status}
            />
          ))}
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="mt-auto pt-6 border-t-2 border-dashed border-[#1A1D20]/10">
        <p className="cc-label-caps text-[#1A1D20]/30 text-[10px] text-center">
          {slots.length} / 9 slot digunakan
        </p>
      </footer>
    </div>
  );
}
