import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import { adjustProductStock, listProducts } from "@/dummy/ownerInventory";
import { recordSale } from "@/dummy/ownerSales";
import { findStore } from "@/dummy/ownerStores";
import { calculateTotals } from "@/utils/pos";
import type { Sale, SaleItem } from "@/types/owner";
import type { CompleteSalePayload, PosData } from "@/types/pos";

type Scenario = "ok" | "empty" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed "Complete sale" request.
const FAIL_SALE = false;

// TODO(integration): read the tax rate from GET /api/v1/settings/business.
const DEFAULT_TAX_RATE = 13;

// TODO(integration): replace with customers from GET /api/v1/customers (Customers page not built yet).
const CUSTOMERS = [
  "Ramesh Shrestha",
  "Sunita Gurung",
  "Bikash Thapa",
  "Anita Rai",
  "Dipak Karki",
  "Mina Joshi",
  "Suresh Maharjan",
  "Laxmi Pandey",
];

// Its message is shown to the cashier, so keep it short and actionable.
export class PosApiError extends Error {}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, "0");

// TODO(integration): replace with GET /api/v1/products (the manager's own store; the backend
// takes the storeId from the token) and GET /api/v1/customers.
export async function fetchPosData(): Promise<PosData> {
  await wait(600);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }

  const me = getCurrentManager();
  const store = SCENARIO === "no-store" || !me?.storeId ? null : findStore(me.storeId);
  const base = { cashierName: me?.name ?? "Store Manager", customers: CUSTOMERS, defaultTaxRate: DEFAULT_TAX_RATE };
  if (!store) return { ...base, store: null, products: [] };

  return {
    ...base,
    store: { id: store.id, name: store.name, location: store.location },
    products: SCENARIO === "empty" ? [] : listProducts().filter((p) => p.storeId === store.id).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// TODO(integration): replace with POST /api/v1/sales { items, customerId?, discount, paymentMethod,
// paymentStatus }. The backend must: take storeId and soldBy from the token, re-price every item from
// the database, recompute subtotal/discount/tax/total itself, check stock availability and decrease
// stock + write stockMovements + create the invoice in one transaction (see "Sales / POS Module").
export async function completeSale(input: CompleteSalePayload): Promise<Sale> {
  await wait(900);
  if (FAIL_SALE) throw new Error("Sale failed");

  const me = getCurrentManager();
  const store = findStore(input.storeId);
  if (!store || !me || me.storeId !== store.id) throw new PosApiError("You can only record sales for your own store.");
  if (input.items.length === 0) throw new PosApiError("The cart is empty.");

  const catalog = listProducts().filter((p) => p.storeId === store.id);
  const items: SaleItem[] = input.items.map((line) => {
    const p = catalog.find((x) => x.id === line.productId);
    if (!p) throw new PosApiError("A product in the cart is no longer available. Remove it and try again.");
    if (line.quantity > p.quantityInStock) {
      throw new PosApiError(`Only ${p.quantityInStock} of ${p.name} left in stock. Update the cart and try again.`);
    }
    return {
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      unit: p.unit,
      quantity: line.quantity,
      sellingPrice: p.sellingPrice,
    };
  });

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.sellingPrice, 0);
  const { discount, tax, total } = calculateTotals(subtotal, input.discountType, input.discountValue, input.taxRate);

  const now = new Date();
  const sale = recordSale({
    storeId: store.id,
    storeName: store.name,
    customerName: input.customerName.trim() || null,
    items,
    subtotal,
    discount,
    tax,
    totalAmount: total,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    soldAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
    soldBy: me.name,
  });

  items.forEach((it) => adjustProductStock(it.productId, -it.quantity)); // stock out
  return sale;
}