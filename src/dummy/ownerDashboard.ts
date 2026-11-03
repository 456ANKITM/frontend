import { AdminApiError } from "@/dummy/adminDashboard";
import type { GrowthRange } from "@/types/admin";
import type { OwnerDashboardData, RevenuePoint } from "@/types/owner";

type Scenario = "ok" | "empty" | "no-sales" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "no-sales" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildRevenue(range: GrowthRange): RevenuePoint[] {
  const now = new Date();

  if (range === "12m") {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { label: MONTHS[d.getMonth()], amount: 1_900_000 + ((i * 7 + 2) % 9) * 160_000 + i * 35_000 };
    });
  }

  const cfg = { "7d": { n: 7, step: 1 }, "30d": { n: 30, step: 1 }, "90d": { n: 13, step: 7 } }[range];
  return Array.from({ length: cfg.n }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (cfg.n - 1 - i) * cfg.step);
    return {
      label: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      amount: cfg.step === 7 ? 450_000 + ((i * 5 + 3) % 8) * 38_000 : 70_000 + ((i * 37 + 11) % 9) * 7_000,
    };
  });
}

// TODO(integration): build from GET /api/v1/reports/sales-summary, /reports/top-products,
// /reports/store-comparison and /products/low-stock (Owner scope: all stores of the business).
// A dedicated aggregate endpoint (e.g. GET /api/v1/dashboard/owner?range=) is better and must
// be added to the API docs first. Totals must be calculated by the backend.
export async function fetchOwnerDashboard(range: GrowthRange): Promise<OwnerDashboardData> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }

  const updatedAt = new Date().toISOString();

  if (SCENARIO === "empty") {
    return {
      summary: { storeCount: 0, salesToday: 0, salesYesterday: 0, salesMonth: 0, salesPrevMonthToDate: 0, lowStockCount: 0 },
      topStore: null,
      revenue: [],
      lowStock: [],
      updatedAt,
    };
  }

  if (SCENARIO === "no-sales") {
    return {
      summary: { storeCount: 2, salesToday: 0, salesYesterday: 0, salesMonth: 0, salesPrevMonthToDate: 0, lowStockCount: 0 },
      topStore: null,
      revenue: buildRevenue(range).map((p) => ({ ...p, amount: 0 })),
      lowStock: [],
      updatedAt,
    };
  }

  return {
    summary: {
      storeCount: 4,
      salesToday: 126_450,
      salesYesterday: 112_900,
      salesMonth: 3_284_900,
      salesPrevMonthToDate: 3_512_300,
      lowStockCount: 14,
    },
    topStore: { id: "s_1", name: "Kathmandu Main Store", salesMonth: 1_246_700, sharePct: 38 },
    revenue: buildRevenue(range),
    lowStock: [
      { id: "p_1", productName: "Basmati Rice 5kg", sku: "GR-0042", storeName: "Kathmandu Main Store", quantity: 0, reorderLevel: 20 },
      { id: "p_2", productName: "Sunflower Oil 1L", sku: "OL-0107", storeName: "Pokhara Branch", quantity: 3, reorderLevel: 15 },
      { id: "p_3", productName: "Detergent Powder 1kg", sku: "HH-0231", storeName: "Lalitpur Branch", quantity: 4, reorderLevel: 12 },
      { id: "p_4", productName: "Tea Leaves 250g", sku: "BV-0018", storeName: "Kathmandu Main Store", quantity: 6, reorderLevel: 18 },
      { id: "p_5", productName: "Notebook A5 (Pack of 5)", sku: "ST-0094", storeName: "Bhaktapur Branch", quantity: 7, reorderLevel: 10 },
    ],
    updatedAt,
  };
}