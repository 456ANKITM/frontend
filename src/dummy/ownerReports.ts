import { AdminApiError } from "@/dummy/adminDashboard";
import { listProducts } from "@/dummy/ownerInventory";
import { fetchPurchases } from "@/dummy/ownerPurchases";
import { fetchSales } from "@/dummy/ownerSales";
import type { ReportSource } from "@/types/reports";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with the report endpoints. Each report is calculated on the backend and
// scoped by the businessId from the token (never trust client-supplied store ids):
//   GET /api/v1/reports/sales-summary?storeIds=&from=&to=&groupBy=day|week|month
//   GET /api/v1/reports/inventory-valuation?storeIds=
//   GET /api/v1/reports/profit-loss?storeIds=&from=&to=
//   GET /api/v1/reports/top-products?storeIds=&from=&to=&sortBy=revenue|quantity
//   GET /api/v1/reports/store-comparison?from=&to=
//   GET /api/v1/reports/staff-performance?from=&to=
// Exports map to GET /api/v1/reports/export?type=&format=pdf|excel plus the same filters.
// For now the raw sales, purchases and products are loaded and the figures are worked out in the browser.
export async function fetchReportSource(): Promise<ReportSource> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(700);
    throw new AdminApiError(SCENARIO);
  }
  const [salesData, purchaseData] = await Promise.all([fetchSales(), fetchPurchases()]);
  if (SCENARIO === "empty") return { sales: [], purchases: [], products: [], stores: salesData.stores };
  return {
    sales: salesData.sales,
    purchases: purchaseData.purchases,
    products: listProducts(),
    stores: salesData.stores,
  };
}