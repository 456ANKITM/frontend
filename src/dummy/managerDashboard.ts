import { AdminApiError } from "@/dummy/adminDashboard";
import { listProducts } from "@/dummy/ownerInventory";
import { fetchSales } from "@/dummy/ownerSales";
import { getCurrentManager } from "@/dummy/currentManager";
import { findStore } from "@/dummy/ownerStores";
import { RECENT_TRANSACTIONS_LIMIT } from "@/config/manager";
import { daysAgoLocal, todayLocal } from "@/utils/localDate";
import { getStockLevel } from "@/utils/stock";
import type { ManagerDashboardData } from "@/types/manager";
import type { LowStockItem } from "@/types/owner";

type Scenario = "ok" | "empty" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;


const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with the Store Manager's scoped endpoints. Everything must be
// limited to the storeId from the token, never a client-supplied id:
//   GET /api/v1/reports/sales-summary   (today / yesterday totals)
//   GET /api/v1/sales?limit=6           (recent transactions)
//   GET /api/v1/products/low-stock      (stock alerts)
// A single aggregate endpoint (e.g. GET /api/v1/dashboard/store) is better and must be added
// to the API docs first.
export async function fetchManagerDashboard(): Promise<ManagerDashboardData> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(700);
    throw new AdminApiError(SCENARIO);
  }

  const updatedAt = new Date().toISOString();
  const me = getCurrentManager();
  const store = SCENARIO === "no-store" || !me?.storeId ? null : findStore(me.storeId);

  const zero = { salesToday: 0, salesYesterday: 0, transactionsToday: 0, lowStockCount: 0, outOfStockCount: 0, unpaidCount: 0, unpaidAmount: 0 };
  if (!store) {
    await wait(700);
    return { store: null, summary: zero, lowStock: [], recent: [], updatedAt };
  }

  const storeInfo = { id: store.id, name: store.name, location: store.location };
  if (SCENARIO === "empty") {
    await wait(700);
    return { store: storeInfo, summary: zero, lowStock: [], recent: [], updatedAt };
  }

  const { sales } = await fetchSales(); // already includes the simulated delay
  const mine = sales.filter((s) => s.storeId === store.id);
  const today = todayLocal();
  const yesterday = daysAgoLocal(1);

  const todays = mine.filter((s) => s.soldAt.startsWith(today));
  const salesToday = todays.reduce((sum, s) => sum + s.totalAmount, 0);
  const salesYesterday = mine.filter((s) => s.soldAt.startsWith(yesterday)).reduce((sum, s) => sum + s.totalAmount, 0);
  const unpaid = mine.filter((s) => s.paymentStatus !== "paid");

  const lowStock: LowStockItem[] = listProducts()
    .filter((p) => p.storeId === store.id && getStockLevel(p) !== "in_stock")
    .sort((a, b) => a.quantityInStock / (a.reorderLevel || 1) - b.quantityInStock / (b.reorderLevel || 1))
    .map((p) => ({
      id: p.id,
      productName: p.name,
      sku: p.sku,
      storeName: p.storeName,
      quantity: p.quantityInStock,
      reorderLevel: p.reorderLevel,
    }));

  const recent = [...mine]
    .sort((a, b) => b.soldAt.localeCompare(a.soldAt))
    .slice(0, RECENT_TRANSACTIONS_LIMIT)
    .map((s) => ({
      id: s.id,
      invoiceNo: s.invoiceNo,
      soldAt: s.soldAt,
      customerName: s.customerName,
      itemCount: s.items.length,
      totalAmount: s.totalAmount,
      paymentMethod: s.paymentMethod,
      paymentStatus: s.paymentStatus,
    }));

  return {
    store: storeInfo,
    summary: {
      salesToday,
      salesYesterday,
      transactionsToday: todays.length,
      lowStockCount: lowStock.length,
      outOfStockCount: lowStock.filter((i) => i.quantity === 0).length,
      unpaidCount: unpaid.length,
      unpaidAmount: unpaid.reduce((sum, s) => sum + s.totalAmount, 0),
    },
    lowStock,
    recent,
    updatedAt,
  };
}