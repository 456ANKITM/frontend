import { AdminApiError } from "@/dummy/adminDashboard";
import type { NewStoreInput, OwnerStore } from "@/types/owner";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed "Add store" request in the dialog.
const FAIL_CREATE = false;

export class StoreApiError extends Error {
  fieldErrors?: Partial<Record<keyof NewStoreInput, string>>;
  constructor(message: string, fieldErrors?: Partial<Record<keyof NewStoreInput, string>>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

// In-memory store so "Add store" visibly works while we are UI-only.
const DB: OwnerStore[] = [
  { id: "s_1", name: "Kathmandu Main Store", location: "New Road, Kathmandu", contactPhone: "+977 1 4221100", managerName: "Hari Basnet", status: "active", salesToday: 48_200, salesYesterday: 41_300, lowStockCount: 5, createdAt: "2025-11-12" },
  { id: "s_2", name: "Pokhara Branch", location: "Lakeside, Pokhara", contactPhone: "+977 61 460210", managerName: "Sabina Tamang", status: "active", salesToday: 31_750, salesYesterday: 33_100, lowStockCount: 4, createdAt: "2026-01-20" },
  { id: "s_3", name: "Lalitpur Branch", location: "Jawalakhel, Lalitpur", contactPhone: "+977 1 5521377", managerName: "Krishna Oli", status: "active", salesToday: 27_300, salesYesterday: 24_800, lowStockCount: 3, createdAt: "2026-03-08" },
  { id: "s_4", name: "Bhaktapur Branch", location: "Suryabinayak, Bhaktapur", contactPhone: "+977 1 6612045", managerName: null, status: "active", salesToday: 19_200, salesYesterday: 13_700, lowStockCount: 2, createdAt: "2026-06-02" },
  { id: "s_5", name: "Dhulikhel Outlet", location: "Dhulikhel, Kavrepalanchok", contactPhone: "", managerName: "Pooja Khadka", status: "inactive", salesToday: 0, salesYesterday: 0, lowStockCount: 0, createdAt: "2026-08-15" },
];

export const findStore = (id: string) => DB.find((s) => s.id === id) ?? null;

export function setStoreManager(storeId: string, managerName: string | null) {
  const store = DB.find((s) => s.id === storeId);
  if (store) store.managerName = managerName;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/stores (Owner: all stores of the business).
// Today's sales and stock alerts are not in the store document, so the backend must
// aggregate them (from `sales` and `products`) and return them with each store.
export async function fetchOwnerStores(): Promise<OwnerStore[]> {
  await wait(700);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }
  return SCENARIO === "empty" ? [] : DB.map((s) => ({ ...s }));
}

// TODO(integration): replace with POST /api/v1/stores  { name, location, contactPhone }
// The backend must validate and scope by the Owner's businessId from the token.
export async function createStore(input: NewStoreInput): Promise<OwnerStore> {
  await wait(700);
  if (FAIL_CREATE) throw new StoreApiError("Create failed");

  const name = input.name.trim();
  if (DB.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    throw new StoreApiError("Duplicate store name", { name: "You already have a store with this name." });
  }

  const store: OwnerStore = {
    id: `s_${Date.now()}`,
    name,
    location: input.location.trim(),
    contactPhone: input.contactPhone.trim(),
    managerName: null,
    status: "active",
    salesToday: 0,
    salesYesterday: 0,
    lowStockCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  DB.unshift(store);
  return { ...store };
}