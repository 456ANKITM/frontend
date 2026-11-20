import type { Metadata } from "next";
import SalesList from "@/components/ownerSpecific/SalesList";

export const metadata: Metadata = {
  title: "Sales",
  description: "Sales history across all your stores.",
};

type SearchParams = Record<string, string | string[] | undefined>;

// Supports /sales?store=<id> (used by the Store detail quick links).
export default async function OwnerSalesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { store } = await searchParams;
  const storeId = (Array.isArray(store) ? store[0] : store) || "all";
  return <SalesList initialStore={storeId} />;
}