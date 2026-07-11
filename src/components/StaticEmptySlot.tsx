/**
 * StaticEmptySlot — empty camera slot placeholder card.
 * Murni UI statis, tidak ada interaksi database.
 */

interface StaticEmptySlotProps {
  slotNumber: number;
}

export default function StaticEmptySlot({ slotNumber }: StaticEmptySlotProps) {
  return (
    <article
      className="cc-card-empty flex flex-col items-center justify-center gap-4 min-h-[320px]"
      aria-label={`Slot ${slotNumber}: Kosong`}
    >
      {/* Plus circle icon */}
      <div
        className="w-16 h-16 rounded-full border-2 border-dashed border-[#1A1D20]/25 flex items-center justify-center"
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="#1A1D20"
            strokeOpacity="0.3"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="cc-label-caps text-[#1A1D20]/40 text-[11px]">
          Slot {slotNumber}
        </p>
        <p className="cc-label-caps text-[#1A1D20]/25 text-[10px]">
          Belum ada kamera
        </p>
      </div>

      {/* Subtle hint */}
      <p className="text-xs text-[#1A1D20]/30 text-center max-w-[160px] leading-relaxed">
        Klik &ldquo;Tambah Slot Baru&rdquo; di atas untuk mengisi slot ini.
      </p>
    </article>
  );
}
