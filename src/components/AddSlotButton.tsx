"use client";

import { useTransition } from "react";
import { addSlot } from "@/lib/slot-actions";

export default function AddSlotButton() {
  const [isPending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Tambah slot kamera baru"
      onClick={() => start(async () => {
        const res = await addSlot();
        if (res.error) alert(res.error);
      })}
      /* cc-btn-primary — IDENTICAL to dashboard page inline button */
      className="cc-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {isPending ? "Menambahkan..." : "Tambah Slot Baru"}
    </button>
  );
}
