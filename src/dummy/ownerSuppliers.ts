import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchPurchases } from "@/dummy/ownerPurchases";
import type { Supplier, SupplierOption, SuppliersListData } from "@/types/owner";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;

const PEOPLE = [
  "Rajan Adhikari",
  "Binita Lama",
  "Prakash Neupane",
  "Sarita Bhandari",
  "Nabin Dahal",
  "Kabita Sharma",
  "Gopal Acharya",
  "Rina Magar",
];

const AREAS = [
  "Balaju Industrial District, Kathmandu",
  "Birgunj-Parsa Road, Birgunj",
  "Butwal Bypass Road, Butwal",
  "Main Road, Biratnagar",
  "Patan Industrial Estate, Lalitpur",
  "Bhaktapur Industrial Area, Bhaktapur",
];

// Small stable hash so each supplier always gets the same dummy contact details.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) || "supplier";

// TODO(integration): contact details come from GET /api/v1/suppliers
// ({ _id, businessId, name, contactPerson, phone, email, address }). Until then they are
// generated from the supplier list that the Purchases page already uses.
function withContact(option: SupplierOption): Supplier {
  const h = hash(`${option.id}:${option.name}`);
  const digits = String(h % 100_000_000).padStart(8, "0");
  return {
    id: option.id,
    name: option.name,
    contactPerson: PEOPLE[h % PEOPLE.length],
    phone: `+977 98${digits}`,
    email: `sales@${slug(option.name)}.com.np`,
    address: AREAS[(h >>> 8) % AREAS.length],
  };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/suppliers for the directory (search and pagination
// on the backend, with each supplier's purchase count, total purchased, amount due and last purchase
// date aggregated from `purchases`), and GET /api/v1/suppliers/:id for the detail view with its
// purchase history. Every query must be scoped by the businessId from the token.
// Later: POST /suppliers, PATCH /suppliers/:id and DELETE /suppliers/:id.
export async function fetchSuppliers(): Promise<SuppliersListData> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(700);
    throw new AdminApiError(SCENARIO);
  }
  // Purchases are read live, so a purchase recorded on /purchases shows up here after a refresh.
  const base = await fetchPurchases();
  return {
    suppliers: SCENARIO === "empty" ? [] : base.suppliers.map(withContact),
    purchases: base.purchases,
    stores: base.stores,
  };
}