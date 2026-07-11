"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ─── Type ─────────────────────────────────────────────────────────────────────
export type SlotStatus = "disconnect" | "live";

export interface SlotData {
  id: string;
  name: string;
  status: SlotStatus;
  createdAt: Date;
}

// ─── Fetch slots for current user ─────────────────────────────────────────────
export async function getSlots(): Promise<SlotData[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const slots = await prisma.cameraSlot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, status: true, createdAt: true },
  });

  return slots.map((s) => ({
    ...s,
    status: s.status as SlotStatus,
  }));
}

// ─── Add new slot ─────────────────────────────────────────────────────────────
export async function addSlot(): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const count = await prisma.cameraSlot.count({
    where: { userId: session.user.id },
  });

  // Batasi maksimal 9 slot per user
  if (count >= 9) return { error: "Maksimal 9 slot per akun." };

  await prisma.cameraSlot.create({
    data: {
      name: `Kamera ${count + 1}`,
      status: "disconnect",
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return {};
}

// ─── Rename slot ──────────────────────────────────────────────────────────────
export async function renameSlot(
  slotId: string,
  newName: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const trimmed = newName.trim();
  if (!trimmed) return { error: "Nama tidak boleh kosong." };
  if (trimmed.length > 30) return { error: "Nama maksimal 30 karakter." };

  // Pastikan slot milik user ini
  const slot = await prisma.cameraSlot.findFirst({
    where: { id: slotId, userId: session.user.id },
  });
  if (!slot) return { error: "Slot tidak ditemukan." };

  await prisma.cameraSlot.update({
    where: { id: slotId },
    data: { name: trimmed },
  });

  revalidatePath("/dashboard");
  return {};
}

// ─── Delete slot ──────────────────────────────────────────────────────────────
export async function deleteSlot(slotId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const slot = await prisma.cameraSlot.findFirst({
    where: { id: slotId, userId: session.user.id },
  });
  if (!slot) return { error: "Slot tidak ditemukan." };

  await prisma.cameraSlot.delete({ where: { id: slotId } });

  revalidatePath("/dashboard");
  return {};
}
