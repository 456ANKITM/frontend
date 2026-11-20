import type { Metadata } from "next";
import InventoryList from "@/components/ownerSpecific/InventoryList";
import type { StockFilter } from "@/types/owner";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Products and stock levels across all your stores.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Supports links like /inventory?store=<id> and /inventory?store=<id>&stock=low
// (used by the Stores pages and the dashboard's low-stock panel).
export default async function OwnerInventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const store = first(params.store) || "all";
  const stockParam = first(params.stock);
  const stock: StockFilter = stockParam === "low" || stockParam === "out" || stockParam === "in_stock" ? stockParam : "all";

  return <InventoryList initialStore={store} initialStock={stock} />;
}