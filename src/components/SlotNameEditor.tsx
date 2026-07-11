"use client";

import { useState, useRef, useTransition } from "react";
import { renameSlot, deleteSlot } from "@/lib/slot-actions";

interface SlotNameEditorProps {
  slotId: string;
  initialName: string;
}

export default function SlotNameEditor({ slotId, initialName }: SlotNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setIsEditing(true);
    setError(null);
    // Focus setelah render
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancelEdit() {
    setIsEditing(false);
    setName(initialName);
    setError(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await renameSlot(slotId, name);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        setError(null);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") cancelEdit();
  }

  function handleDelete() {
    if (!confirm(`Hapus slot "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    startDeleteTransition(async () => {
      await deleteSlot(slotId);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      {isEditing ? (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              disabled={isPending}
              className="
                flex-1 min-w-0 bg-[#F8F9FA] border-2 border-[#1A1D20] rounded-lg
                px-3 py-1.5 text-sm font-bold text-[#1A1D20]
                focus:outline-none focus:border-[#E63946]
                disabled:opacity-50
              "
              aria-label="Edit nama slot"
            />
            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              aria-label="Simpan nama slot"
              className="
                flex-shrink-0 w-8 h-8 flex items-center justify-center
                bg-[#1A1D20] border-2 border-[#1A1D20] rounded-lg
                text-white disabled:opacity-50
                hover:bg-[#E63946] hover:border-[#E63946]
                transition-colors duration-100
              "
            >
              {isPending ? (
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L6.5 12.5L14 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            {/* Cancel */}
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isPending}
              aria-label="Batal edit"
              className="
                flex-shrink-0 w-8 h-8 flex items-center justify-center
                bg-white border-2 border-[#1A1D20] rounded-lg
                text-[#1A1D20] disabled:opacity-50
                hover:bg-[#E9ECEF] transition-colors duration-100
              "
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {error && (
            <p className="text-xs text-[#E63946] font-bold" role="alert">{error}</p>
          )}
        </div>
      ) : (
        /* ── View mode ── */
        <div className="flex items-center gap-2 group/name">
          <h3 className="font-bold text-base leading-tight text-[#1A1D20] tracking-tight truncate">
            {name}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover/name:opacity-100 transition-opacity duration-100">
            {/* Edit button */}
            <button
              type="button"
              onClick={startEdit}
              aria-label={`Edit nama slot ${name}`}
              className="
                w-6 h-6 flex items-center justify-center rounded-md
                border border-[#1A1D20]/20 bg-white
                hover:border-[#1A1D20] hover:bg-[#E9ECEF]
                transition-colors duration-100
              "
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="#1A1D20" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </button>
            {/* Delete button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`Hapus slot ${name}`}
              className="
                w-6 h-6 flex items-center justify-center rounded-md
                border border-[#1A1D20]/20 bg-white
                hover:border-[#E63946] hover:bg-red-50
                transition-colors duration-100 disabled:opacity-40
              "
            >
              {isDeleting ? (
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#E63946" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/>
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <path d="M3 4H13M6 4V2H10V4M5 4L6 14H10L11 4" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
