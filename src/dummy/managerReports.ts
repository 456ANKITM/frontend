import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import { listProducts } from "@/dummy/ownerInventory";
import { fetchPurchases } from "@/dummy/ownerPurchases";
import { fetchManagerSales } from "@/dummy/managerSales";
import { findStore } from "@/dummy/ownerStores";
import type { ManagerReportsData } from "@/types/managerReports";
import type { ReportSource } from "@/types/reports";

type Scenario = "ok" | "empty" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EMPTY: ReportSource = { sales: [], purchases: [], products: [], stores: [] };

// TODO(integration): replace with the report endpoints. The backend takes the storeId from the token
// (never from the query string), so a manager only ever receives their own store's figures:
//   GET /api/v1/reports/sales-summary?from=&to=&groupBy=day|week|month
//   GET /api/v1/reports/inventory-valuation
//   GET /api/v1/reports/top-products?from=&to=&sortBy=revenue|quantity
// Exports map to GET /api/v1/reports/export?type=&format=pdf|excel plus the same filters.
// For now the store's raw sales, purchases and products are loaded and the figures are worked out
// in the browser.
export async function fetchManagerReports(): Promise<ManagerReportsData> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(600);
    throw new AdminApiError(SCENARIO);
  }

  const me = getCurrentManager();
  const store = SCENARIO === "no-store" || !me?.storeId ? null : findStore(me.storeId);
  if (!store) {
    await wait(600);
    return { store: null, source: EMPTY };
  }

  const info = { id: store.id, name: store.name, location: store.location };
  const stores = [{ id: store.id, name: store.name, status: store.status, managerName: store.managerName }];
  if (SCENARIO === "empty") {
    await wait(600);
    return { store: info, source: { ...EMPTY, stores } };
  }

  // Read live, so sales, purchases and refunds made elsewhere show up after a refresh.
  const [salesData, purchaseData] = await Promise.all([fetchManagerSales(), fetchPurchases()]);
  return {
    store: info,
    source: {
      // Refunded sales are not revenue, so they are left out of every report.
      sales: salesData.sales.filter((s) => !s.refund),
      purchases: purchaseData.purchases.filter((p) => p.storeId === store.id),
      products: listProducts().filter((p) => p.storeId === store.id),
      stores,
    },
  };
}