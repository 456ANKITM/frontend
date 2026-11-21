import { AdminApiError } from "@/dummy/adminDashboard";
import { listProducts } from "@/dummy/ownerInventory";
import { findStore, getStoreOptions } from "@/dummy/ownerStores";
import { daysAgoLocal } from "@/utils/localDate";
import type { PaymentMethod, PaymentStatus, Sale, SaleItem, SalesListData } from "@/types/owner";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const HISTORY_DAYS = 75;
const TAX_RATE = 0.13; // TODO(integration): read the tax rate from GET /settings/business

// TODO(integration): replace with customers from GET /api/v1/customers (the Customers page is not built yet).
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

const pad = (n: number) => String(n).padStart(2, "0");

// Small seeded random generator so the dummy history is stable between reloads.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let SALES: Sale[] | null = null;

// Built once from the stores and products already in the dummy data.
// Stores without products (e.g. the inactive outlet) have no sales.
function seed(): Sale[] {
  const rand = rng(20260);
  const products = listProducts();
  const drafts: Omit<Sale, "id" | "invoiceNo">[] = [];
  const nowHour = new Date().getHours();

  getStoreOptions().forEach((opt) => {
    const store = findStore(opt.id);
    const storeProducts = products.filter((p) => p.storeId === opt.id);
    if (!store || storeProducts.length === 0) return;

    for (let day = HISTORY_DAYS; day >= 0; day--) {
      const roll = rand();
      const count = roll < 0.35 ? 0 : roll < 0.85 ? 1 : 2;

      for (let n = 0; n < count; n++) {
        const pool = [...storeProducts];
        const itemCount = 1 + Math.floor(rand() * 4);
        const items: SaleItem[] = [];
        for (let i = 0; i < itemCount && pool.length > 0; i++) {
          const p = pool.splice(Math.floor(rand() * pool.length), 1)[0];
          items.push({
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            unit: p.unit,
            quantity: 1 + Math.floor(rand() * 6),
            sellingPrice: p.sellingPrice,
          });
        }

        const subtotal = items.reduce((sum, it) => sum + it.quantity * it.sellingPrice, 0);
        const discount = rand() < 0.2 ? Math.round(subtotal * 0.05) : 0;
        const tax = Math.round((subtotal - discount) * TAX_RATE);

        const methodRoll = rand();
        const paymentMethod: PaymentMethod = methodRoll < 0.5 ? "cash" : methodRoll < 0.8 ? "online" : "card";

        // Only recent sales can still be unpaid.
        const statusRoll = rand();
        let paymentStatus: PaymentStatus = "paid";
        if (day <= 14 && statusRoll > 0.88) paymentStatus = statusRoll > 0.95 ? "due" : "partial";

        // Unpaid sales always belong to a known customer.
        const customerName = paymentStatus !== "paid" || rand() < 0.45 ? CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)] : null;

        const maxHour = day === 0 ? Math.max(9, nowHour) : 20;
        const hour = 9 + Math.floor(rand() * (maxHour - 9 + 1));
        const minute = Math.floor(rand() * 60);

        drafts.push({
          storeId: store.id,
          storeName: store.name,
          customerName,
          items,
          subtotal,
          discount,
          tax,
          totalAmount: subtotal - discount + tax,
          paymentMethod,
          paymentStatus,
          soldAt: `${daysAgoLocal(day)}T${pad(hour)}:${pad(minute)}`,
          soldBy: store.managerName ?? "Owner",
        });
      }
    }
  });

  return drafts
    .sort((a, b) => a.soldAt.localeCompare(b.soldAt))
    .map((d, i) => ({ ...d, id: `sale_${1001 + i}`, invoiceNo: `INV-${1001 + i}` }));
}

const db = () => (SALES ??= seed());

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/sales (Owner: across all stores of the business)
// with query params for search, storeId, paymentMethod, paymentStatus, from/to dates and page/limit.
// Filtering, sorting, pagination and the summary figures must be computed on the backend, and every
// query must be scoped by the businessId from the token.
// Later: GET /api/v1/sales/:id for the detail view, POST /api/v1/sales/:id/refund for refunds.
export async function fetchSales(): Promise<SalesListData> {
  await wait(700);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }
  const sales = SCENARIO === "empty" ? [] : db().map((s) => ({ ...s, items: s.items.map((it) => ({ ...it })) }));
  return { sales, stores: getStoreOptions() };
}

// Used by the POS page (/pos) to add a completed sale to the dummy history.
export function recordSale(draft: Omit<Sale, "id" | "invoiceNo">): Sale {
  const all = db();
  const next = all.reduce((max, s) => Math.max(max, Number(s.invoiceNo.replace(/\D/g, ""))), 1000) + 1;
  const sale: Sale = { ...draft, id: `sale_${next}`, invoiceNo: `INV-${next}` };
  all.push(sale);
  return { ...sale, items: sale.items.map((it) => ({ ...it })) };
}