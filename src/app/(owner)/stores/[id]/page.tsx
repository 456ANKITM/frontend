import type { Metadata } from "next";
import StoreDetail from "@/components/ownerSpecific/StoreDetails";

export const metadata: Metadata = {
  title: "Store details",
  description: "Store overview, assigned manager and quick links to inventory and sales.",
};

// Next.js 15+/16: `params` is a Promise in App Router pages.
export default async function OwnerStoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreDetail id={id} />;
}