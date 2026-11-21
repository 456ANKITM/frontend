import type { Metadata } from "next";
import ManagerInventoryView from "@/components/managerSpecific/ManagerInventoryView";
import type { StockFilter } from "@/types/owner";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Products and stock levels for your store.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const STOCK_FILTERS: StockFilter[] = ["low", "out", "in_stock"];

// Supports /manager/inventory?stock=low|out|in_stock (used by the dashboard's low-stock card).
// The store is never read from the URL: a manager only ever sees their own store.
export default async function ManagerInventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { stock } = await searchParams;
  const value = Array.isArray(stock) ? stock[0] : stock;
  const initialStock = STOCK_FILTERS.find((s) => s === value) ?? "all";
  return <ManagerInventoryView initialStock={initialStock} />;
}