import type { Metadata } from "next";
import PurchasesList from "@/components/ownerSpecific/PurchasesList";

export const metadata: Metadata = {
  title: "Purchases",
  description: "Stock bought from suppliers across all your stores.",
};

type SearchParams = Record<string, string | string[] | undefined>;

// Supports /purchases?store=<id> (used by the Store detail quick links).
export default async function OwnerPurchasesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { store } = await searchParams;
  const storeId = (Array.isArray(store) ? store[0] : store) || "all";
  return <PurchasesList initialStore={storeId} />;
}