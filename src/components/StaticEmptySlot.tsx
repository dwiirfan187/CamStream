"use client";

import { useTransition } from "react";
import { addSlot } from "@/lib/slot-actions";

/**
 * StaticEmptySlot — empty camera slot placeholder card.
 * Clickable to create a new slot directly.
 */

interface StaticEmptySlotProps {
  slotNumber: number;
}

export default function StaticEmptySlot({ slotNumber }: StaticEmptySlotProps) {
  const [isPending, start] = useTransition();

  const handleClick = () => {
    if (isPending) return;
    start(async () => {
      const res = await addSlot();
      if (res.error) alert(res.error);
    });
  };

  return (
    <article
      onClick={handleClick}
      className={`cc-card-empty flex flex-col items-center justify-center gap-4 min-h-[320px] cursor-pointer hover:border-red-500 transition-all ${
        isPending ? "opacity-60 pointer-events-none" : ""
      }`}
      aria-label={`Slot ${slotNumber}: ${isPending ? "Sedang menambahkan slot..." : "Kosong"}`}
    >
      {/* Plus circle icon / Spinner */}
      <div
        className="w-16 h-16 rounded-full border-2 border-dashed border-[#1A1D20]/25 flex items-center justify-center"
        aria-hidden="true"
      >
        {isPending ? (
          <svg className="animate-spin text-[#1A1D20]/50" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40" strokeDashoffset="10" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="#1A1D20"
              strokeOpacity="0.3"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="cc-label-caps text-[#1A1D20]/40 text-[11px]">
          Slot {slotNumber}
        </p>
        <p className="cc-label-caps text-[#1A1D20]/25 text-[10px]">
          {isPending ? "Menambahkan Kamera..." : "Belum ada kamera"}
        </p>
      </div>

      {/* Subtle hint */}
      <p className="text-xs text-[#1A1D20]/30 text-center max-w-[160px] leading-relaxed">
        {isPending ? "Mohon tunggu..." : "Klik area ini atau tombol di atas untuk mengisi slot ini."}
      </p>
    </article>
  );
}
