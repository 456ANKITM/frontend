import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import { fetchManagerSales } from "@/dummy/managerSales";
import { findStore } from "@/dummy/ownerStores";
import { customerKey } from "@/utils/customers";
import { daysAgoLocal, todayLocal } from "@/utils/localDate";
import type { Customer, ManagerCustomersData, NewCustomerPayload } from "@/types/managerCustomers";

type Scenario = "ok" | "empty" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed "Add customer" request in the dialog.
const FAIL_CREATE = false;

// Field errors are shown under the matching input; the message is shown for other failures.
export class ManagerCustomersApiError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The same names the dummy sales and POS already use, so their purchase history is not empty.
const SEED: Pick<Customer, "name" | "phone" | "email" | "address">[] = [
  { name: "Ramesh Shrestha", phone: "+977 9841000101", email: "ramesh.shrestha@example.com", address: "Baneshwor, Kathmandu" },
  { name: "Sunita Gurung", phone: "+977 9841000102", email: "sunita.gurung@example.com", address: "Lakeside, Pokhara" },
  { name: "Bikash Thapa", phone: "+977 9841000103", email: "", address: "Jawalakhel, Lalitpur" },
  { name: "Anita Rai", phone: "+977 9841000104", email: "anita.rai@example.com", address: "Suryabinayak, Bhaktapur" },
  { name: "Dipak Karki", phone: "+977 9841000105", email: "", address: "Koteshwor, Kathmandu" },
  { name: "Mina Joshi", phone: "+977 9841000106", email: "mina.joshi@example.com", address: "Patan Dhoka, Lalitpur" },
  { name: "Suresh Maharjan", phone: "+977 9841000107", email: "", address: "Thimi, Bhaktapur" },
  { name: "Laxmi Pandey", phone: "+977 9841000108", email: "laxmi.pandey@example.com", address: "Chabahil, Kathmandu" },
];

// In-memory customers per store, so "Add customer" visibly works while we are UI-only.
const DB = new Map<string, Customer[]>();

function customersOf(storeId: string): Customer[] {
  let list = DB.get(storeId);
  if (!list) {
    list = SEED.map((c, i) => ({
      id: `c_${storeId}_${i}`,
      storeId,
      ...c,
      createdAt: daysAgoLocal(200 - i * 20),
    }));
    DB.set(storeId, list);
  }
  return list;
}

function ownStore() {
  const me = getCurrentManager();
  const store = me?.storeId ? findStore(me.storeId) : null;
  if (!me || !store) throw new ManagerCustomersApiError("You are not assigned to a store yet.");
  return { me, store };
}

// TODO(integration): replace with GET /api/v1/customers (the backend takes the storeId from the
// token, so a manager only receives their own store's customers). Search and pagination must happen
// on the backend, and each customer's purchase count, total spent, pending amount, last purchase and
// loyalty points must be aggregated from `sales`.
// GET /api/v1/customers/:id gives the detail view with the purchase history.
export async function fetchManagerCustomers(): Promise<ManagerCustomersData> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(600);
    throw new AdminApiError(SCENARIO);
  }
  if (SCENARIO === "no-store") {
    await wait(600);
    return { store: null, customers: [], sales: [] };
  }

  // Sales are read live, so a sale recorded in POS shows up here after the list reloads.
  const base = await fetchManagerSales();
  if (!base.store) return { store: null, customers: [], sales: [] };

  return {
    store: base.store,
    customers: SCENARIO === "empty" ? [] : customersOf(base.store.id).map((c) => ({ ...c })),
    sales: base.sales,
  };
}

// TODO(integration): replace with POST /api/v1/customers { name, phone, email, address }. The backend
// must take storeId from the token (never from the body), validate every field, and keep phone
// numbers unique per store.
export async function createManagerCustomer(input: NewCustomerPayload): Promise<Customer> {
  await wait(700);
  if (FAIL_CREATE) throw new Error("Create failed");

  const { store } = ownStore();
  const name = input.name.trim();
  const phone = input.phone.trim();
  const list = customersOf(store.id);

  const errors: Record<string, string> = {};
  if (list.some((c) => customerKey(c.name) === customerKey(name))) {
    errors.name = "You already have a customer with this name.";
  }
  if (list.some((c) => c.phone.replace(/\s/g, "") === phone.replace(/\s/g, ""))) {
    errors.phone = "You already have a customer with this phone number.";
  }
  if (Object.keys(errors).length > 0) throw new ManagerCustomersApiError("Duplicate customer", errors);

  const customer: Customer = {
    id: `c_${Date.now()}`,
    storeId: store.id,
    name,
    phone,
    email: input.email.trim(),
    address: input.address.trim(),
    createdAt: todayLocal(),
  };
  list.push(customer);
  return { ...customer };
}