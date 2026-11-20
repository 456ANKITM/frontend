import { AdminApiError } from "@/dummy/adminDashboard";
import { findStore, getStoreOptions, setStoreManager } from "@/dummy/ownerStores";
import type { InviteStaffInput, StaffListData, StaffStatus, StoreManager } from "@/types/owner";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview failed invite / enable-disable / store-change requests.
const FAIL_INVITE = false;
const FAIL_UPDATE = false;

export class StaffApiError extends Error {
  fieldErrors?: Partial<Record<keyof InviteStaffInput, string>>;
  constructor(message: string, fieldErrors?: Partial<Record<keyof InviteStaffInput, string>>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

type Row = Omit<StoreManager, "storeName">;

// Single in-memory source of staff, shared with the Store detail page, so assigning a
// manager on either page shows up on the other. Keep consistent with dummy/ownerStores.ts.
const STAFF: Row[] = [
  { id: "u_1", name: "Hari Basnet", email: "hari.basnet@yourbusiness.com", phone: "+977 9841000011", status: "active", storeId: "s_1" },
  { id: "u_2", name: "Sabina Tamang", email: "sabina.tamang@yourbusiness.com", phone: "+977 9841000022", status: "active", storeId: "s_2" },
  { id: "u_3", name: "Krishna Oli", email: "krishna.oli@yourbusiness.com", phone: "+977 9841000033", status: "active", storeId: "s_3" },
  { id: "u_4", name: "Pooja Khadka", email: "pooja.khadka@yourbusiness.com", phone: "+977 9841000044", status: "disabled", storeId: "s_5" },
  { id: "u_5", name: "Narayan Acharya", email: "narayan.acharya@yourbusiness.com", phone: "+977 9841000055", status: "active", storeId: null },
  { id: "u_6", name: "Laxmi Dahal", email: "laxmi.dahal@yourbusiness.com", phone: "", status: "invited", storeId: null },
];

const toManager = (r: Row): StoreManager => ({
  ...r,
  storeName: r.storeId ? (findStore(r.storeId)?.name ?? null) : null,
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getManagers = (): StoreManager[] => STAFF.map(toManager);

// A Store Manager runs at most one store and a store has at most one manager.
// Moving someone onto a store therefore unassigns that store's previous manager.
export function moveManager(managerId: string, storeId: string | null) {
  const manager = STAFF.find((m) => m.id === managerId);
  if (!manager) throw new Error("Manager not found");

  const previousStoreId = manager.storeId;
  if (previousStoreId && previousStoreId !== storeId) setStoreManager(previousStoreId, null);

  if (storeId) {
    STAFF.forEach((m) => {
      if (m.storeId === storeId && m.id !== managerId) m.storeId = null;
    });
    setStoreManager(storeId, manager.name);
  }
  manager.storeId = storeId;
}

// TODO(integration): replace with GET /api/v1/users (Owner: all staff of the business) and
// GET /api/v1/stores (for the store dropdowns).
export async function fetchStaff(): Promise<StaffListData> {
  await wait(700);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }
  return {
    staff: SCENARIO === "empty" ? [] : getManagers().sort((a, b) => a.name.localeCompare(b.name)),
    stores: getStoreOptions(),
  };
}

// TODO(integration): replace with POST /api/v1/users/invite  { name, email, storeId? }
// The backend sends the invite email, creates the user with status "invited" and role
// store_manager, and scopes everything by the Owner's businessId.
export async function inviteStaff(input: InviteStaffInput): Promise<StoreManager> {
  await wait(800);
  if (FAIL_INVITE) throw new StaffApiError("Invite failed");

  const email = input.email.trim().toLowerCase();
  if (STAFF.some((m) => m.email.toLowerCase() === email)) {
    throw new StaffApiError("Duplicate email", { email: "Someone with this email is already on your team." });
  }

  const row: Row = {
    id: `u_${Date.now()}`,
    name: input.name.trim(),
    email,
    phone: "",
    status: "invited",
    storeId: null,
  };
  STAFF.push(row);
  if (input.storeId) moveManager(row.id, input.storeId);
  return toManager(row);
}

// TODO(integration): replace with PATCH /api/v1/users/:id/status  { status: "active" | "disabled" }
export async function setStaffStatus(id: string, status: Extract<StaffStatus, "active" | "disabled">): Promise<void> {
  await wait(500);
  if (FAIL_UPDATE) throw new StaffApiError("Update failed");
  const row = STAFF.find((m) => m.id === id);
  if (!row) throw new StaffApiError("Not found");
  if (row.status !== "invited") row.status = status;
}

// TODO(integration): replace with PATCH /api/v1/users/:id  { storeId }  (or
// PATCH /stores/:id/assign-manager). storeId null/"" = unassign.
export async function updateStaffStore(id: string, storeId: string | null): Promise<void> {
  await wait(600);
  if (FAIL_UPDATE) throw new StaffApiError("Update failed");
  moveManager(id, storeId);
}