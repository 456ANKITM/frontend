import { AdminApiError } from "@/dummy/adminDashboard";
import { adjustProductStock, listProducts } from "@/dummy/ownerInventory";
import { findStore, getStoreOptions } from "@/dummy/ownerStores";
import { daysAgoLocal } from "@/utils/localDate";
import type {
  NewPurchasePayload,
  PaymentStatus,
  Purchase,
  PurchaseItem,
  PurchasesListData,
  SupplierOption,
} from "@/types/owner";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed "New purchase" request in the dialog.
const FAIL_CREATE = false;

export class PurchaseApiError extends Error {}

// TODO(integration): replace with GET /api/v1/suppliers (the Suppliers page is not built yet).
const SUPPLIERS: SupplierOption[] = [
  { id: "sup_1", name: "Himalayan Wholesale Traders" },
  { id: "sup_2", name: "Everest Agro Supplies" },
  { id: "sup_3", name: "Annapurna FMCG Distributors" },
  { id: "sup_4", name: "Lumbini Stationers" },
  { id: "sup_5", name: "Gandaki Beverages" },
  { id: "sup_6", name: "Terai Household Goods" },
];

const STATUSES: PaymentStatus[] = ["paid", "paid", "partial", "due", "paid"];

// Built once from the stores and products in the other dummy modules, so everything lines up.
let PURCHASES: Purchase[] | null = null;

function seed(): Purchase[] {
  const products = listProducts();
  const out: Purchase[] = [];

  getStoreOptions().forEach((store, si) => {
    const stocked = products.filter((p) => p.storeId === store.id);
    if (stocked.length === 0) return;

    for (let k = 0; k < 5; k++) {
      const supplier = SUPPLIERS[(si + k) % SUPPLIERS.length];
      const lineCount = 2 + ((si + k) % 3);
      const items: PurchaseItem[] = Array.from({ length: lineCount }, (_, i) => {
        const p = stocked[(k * 3 + i * 4 + si) % stocked.length];
        return {
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          unit: p.unit,
          quantity: 10 + ((k + i * 7 + si * 3) % 8) * 5,
          costPrice: p.costPrice,
        };
      });
      out.push({
        id: `pur_${store.id}_${k}`,
        referenceNo: "",
        storeId: store.id,
        storeName: store.name,
        supplierId: supplier.id,
        supplierName: supplier.name,
        items,
        totalAmount: items.reduce((sum, it) => sum + it.quantity * it.costPrice, 0),
        paymentStatus: STATUSES[(si * 2 + k) % STATUSES.length],
        purchaseDate: daysAgoLocal((si * 3 + k * 11 + 2) % 75),
        createdBy: store.managerName ?? "Business Owner",
      });
    }
  });

  // Oldest first so reference numbers grow with time, then newest first for display.
  out.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate) || a.id.localeCompare(b.id));
  out.forEach((p, i) => (p.referenceNo = `PUR-${String(i + 1).padStart(4, "0")}`));
  return out.reverse();
}

const db = () => (PURCHASES ??= seed());
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/purchases (filters: date, supplier, payment status,
// plus storeId/search/page/limit), GET /api/v1/suppliers, GET /api/v1/stores and the products
// needed by the form (GET /api/v1/products?storeId=). Filtering and pagination belong on the backend.
export async function fetchPurchases(): Promise<PurchasesListData> {
  await wait(700);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }
  return {
    purchases: SCENARIO === "empty" ? [] : db().map((p) => ({ ...p, items: p.items.map((i) => ({ ...i })) })),
    stores: getStoreOptions(),
    suppliers: SUPPLIERS,
    products: listProducts().map(({ id, storeId, name, sku, unit, costPrice }) => ({ id, storeId, name, sku, unit, costPrice })),
  };
}

// TODO(integration): replace with POST /api/v1/purchases { storeId, supplierId, items[], paymentStatus,
// purchaseDate }. The backend must verify the store and supplier belong to the Owner's business, compute
// totalAmount itself, and increase each product's stock and write stockMovements in one transaction.
export async function createPurchase(input: NewPurchasePayload): Promise<Purchase> {
  await wait(800);
  if (FAIL_CREATE) throw new PurchaseApiError("Create failed");

  const store = findStore(input.storeId);
  const supplier = SUPPLIERS.find((s) => s.id === input.supplierId);
  if (!store || !supplier || input.items.length === 0) throw new PurchaseApiError("Invalid purchase");

  const catalog = listProducts();
  const items: PurchaseItem[] = input.items.map((line) => {
    const p = catalog.find((x) => x.id === line.productId && x.storeId === store.id);
    if (!p) throw new PurchaseApiError("Product not found");
    return {
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      unit: p.unit,
      quantity: line.quantity,
      costPrice: line.costPrice,
    };
  });

  const all = db();
  const purchase: Purchase = {
    id: `pur_${Date.now()}`,
    referenceNo: `PUR-${String(all.length + 1).padStart(4, "0")}`,
    storeId: store.id,
    storeName: store.name,
    supplierId: supplier.id,
    supplierName: supplier.name,
    items,
    totalAmount: items.reduce((sum, it) => sum + it.quantity * it.costPrice, 0),
    paymentStatus: input.paymentStatus,
    purchaseDate: input.purchaseDate,
    createdBy: "Business Owner",
  };

  items.forEach((it) => adjustProductStock(it.productId, it.quantity)); // stock in
  all.unshift(purchase);
  return { ...purchase };
}