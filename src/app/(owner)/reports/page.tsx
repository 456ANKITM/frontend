import type { Metadata } from "next";
import ReportsBuilder from "@/components/ownerSpecific/ReportsBuilder";

export const metadata: Metadata = {
  title: "Reports",
  description: "Build sales, stock and profit reports for your stores.",
};

type SearchParams = Record<string, string | string[] | undefined>;

// Supports /reports?store=<id> (used by the Store detail quick links).
export default async function OwnerReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { store } = await searchParams;
  const storeId = (Array.isArray(store) ? store[0] : store) || "all";
  return <ReportsBuilder initialStore={storeId} />;
}