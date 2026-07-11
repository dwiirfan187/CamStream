import type { Metadata } from "next";
import OBSStreamClient from "@/components/OBSStreamClient";

export const metadata: Metadata = {
  title: "CamCast Stream",
};

interface OBSPageProps {
  params: Promise<{ slotId: string }>;
}

export default async function OBSStreamPage({ params }: OBSPageProps) {
  const { slotId } = await params;
  return <OBSStreamClient slotId={slotId} />;
}
