import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import { fetchPurchases } from "@/dummy/ownerPurchases";
import { findStore } from "@/dummy/ownerStores";
import type { ManagerPurchasesData } from "@/types/managerPurchases";

type Scenario = "ok" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/purchases (the backend takes the storeId from the
// token, so a manager only receives their own store's purchases), GET /api/v1/suppliers and
// GET /api/v1/products for the form. Search, supplier, payment and date filters and pagination
// must happen on the backend.
// Recording a purchase maps to POST /api/v1/purchases (see the New purchase dialog).
export async function fetchManagerPurchases(): Promise<ManagerPurchasesData> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(600);
    throw new AdminApiError(SCENARIO);
  }

  const me = getCurrentManager();
  const store = SCENARIO === "no-store" || !me?.storeId ? null : findStore(me.storeId);
  if (!store) {
    await wait(600);
    return { store: null, purchases: [], suppliers: [], products: [], stores: [] };
  }

  // Purchases are read live, so a purchase recorded here shows up after the list reloads.
  const base = await fetchPurchases();
  return {
    store: { id: store.id, name: store.name, location: store.location },
    stores: [{ id: store.id, name: store.name, status: store.status, managerName: store.managerName }],
    suppliers: base.suppliers,
    purchases: base.purchases.filter((p) => p.storeId === store.id),
    products: base.products.filter((p) => p.storeId === store.id),
  };
}