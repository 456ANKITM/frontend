import type { Product, StockLevel } from "@/types/owner";

// Out of stock = 0. Low stock = at or below the reorder level (same rule as the
// "stock alerts" shown on the dashboard and Stores pages).
export function getStockLevel(p: Pick<Product, "quantityInStock" | "reorderLevel">): StockLevel {
  if (p.quantityInStock <= 0) return "out";
  return p.quantityInStock <= p.reorderLevel ? "low" : "in_stock";
}

export const STOCK_LABEL: Record<StockLevel, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out: "Out of stock",
};