import { AdminApiError } from "@/dummy/adminDashboard";
import { findStore } from "@/dummy/ownerStores";
import { getManagers, moveManager } from "@/dummy/ownerStaff";
import { countProductsForStore } from "@/dummy/ownerInventory";
import type { LowStockItem, PaymentMethod, RecentSale, StoreDetailData } from "@/types/owner";

type Scenario = "ok" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed "Assign manager" request in the dialog.
const FAIL_ASSIGN = false;

const PRODUCTS: Omit<LowStockItem, "id" | "storeName" | "quantity">[] = [
  { productName: "Basmati Rice 5kg", sku: "GR-0042", reorderLevel: 20 },
  { productName: "Sunflower Oil 1L", sku: "OL-0107", reorderLevel: 15 },
  { productName: "Detergent Powder 1kg", sku: "HH-0231", reorderLevel: 12 },
  { productName: "Tea Leaves 250g", sku: "BV-0018", reorderLevel: 18 },
  { productName: "Notebook A5 (Pack of 5)", sku: "ST-0094", reorderLevel: 10 },
  { productName: "Toothpaste 150g", sku: "PC-0066", reorderLevel: 24 },
  { productName: "Iodized Salt 1kg", sku: "GR-0011", reorderLevel: 30 },
  { productName: "Hand Soap 250ml", sku: "PC-0072", reorderLevel: 16 },
];

const METHODS: PaymentMethod[] = ["cash", "online", "card", "cash", "online"];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/stores/:id (store + assigned manager) plus
//   GET /api/v1/reports/sales-summary?storeId=   (today / month totals)
//   GET /api/v1/products/low-stock?storeId=      (stock alerts)
//   GET /api/v1/sales?storeId=&limit=5           (recent sales)
//   GET /api/v1/users?role=store_manager         (managers for the assign dialog)
// Return null (or a 404) for unknown ids and for stores of another business.
export async function fetchStoreDetail(id: string): Promise<StoreDetailData | null> {
  await wait(700);
  if (SCENARIO !== "ok") throw new AdminApiError(SCENARIO);

  const store = findStore(id);
  if (!store) return null;

  const n = Number(id.replace(/\D/g, "")) || 1;
  const trading = store.salesToday > 0;

  const lowStock: LowStockItem[] = PRODUCTS.slice(0, Math.min(store.lowStockCount, PRODUCTS.length)).map((p, i) => ({
    ...p,
    id: `p_${n}_${i}`,
    storeName: store.name,
    quantity: i === 0 && n % 2 === 1 ? 0 : (i * 2 + n) % 8 + 1,
  }));

  const weights = [0.22, 0.14, 0.31, 0.09, 0.24];
  const minutesAgo = [20, 95, 160, 245, 330];
  const recentSales: RecentSale[] = trading
    ? weights.map((w, i) => ({
        id: `sale_${n}_${i}`,
        invoiceNo: `INV-${String(2100 + n * 7 - i).padStart(5, "0")}`,
        soldAt: new Date(Date.now() - minutesAgo[i] * 60_000).toISOString(),
        itemCount: ((i * 3 + n) % 8) + 2,
        total: Math.round((store.salesToday * w) / 10) * 10,
        paymentMethod: METHODS[i],
      }))
    : [];

  const managers = getManagers();
  const manager = managers.find((m) => m.storeId === id) ?? null;

  return {
    store: { ...store },
    manager,
    managers,
    salesMonth: trading ? store.salesToday * (24 + (n % 5)) : 0,
    productCount: countProductsForStore(id),
    lowStock,
    recentSales,
    updatedAt: new Date().toISOString(),
  };
}

// TODO(integration): replace with PATCH /api/v1/stores/:id/assign-manager  { managerId }
// The backend must check the manager belongs to the Owner's business and move them off
// their previous store.
export async function assignManager(storeId: string, managerId: string): Promise<void> {
  await wait(600);
  if (FAIL_ASSIGN) throw new Error("Assign failed");

  moveManager(managerId, storeId);
}