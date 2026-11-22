import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import { findStore } from "@/dummy/ownerStores";
import { PASSWORD_RULES, validateProfile, validateReceipt } from "@/utils/managerSettings";
import type {
  ChangePasswordPayload,
  ManagerProfile,
  ManagerSettingsData,
  ReceiptSettings,
  UpdateProfilePayload,
  UpdateReceiptPayload,
} from "@/types/managerSettings";

type Scenario = "ok" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set any of these to true to preview a failed save.
const FAIL_PROFILE = false;
const FAIL_PASSWORD = false;
const FAIL_RECEIPT = false;

// Field errors are shown under the matching input; the message is shown for other failures.
export class ManagerSettingsApiError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory values so saving visibly works while we are UI-only (they reset on reload).
// TODO(integration): the real password is never known to the browser. The backend checks the
// current password against the stored hash.
let PASSWORD = "Manager@123";
const PROFILE = new Map<string, { name: string; phone: string }>();
const RECEIPT = new Map<string, { invoicePrefix: string; receiptFooter: string }>();

function me() {
  const m = getCurrentManager();
  if (!m) throw new ManagerSettingsApiError("Your account could not be found. Sign in again.");
  return m;
}

function buildProfile(): ManagerProfile {
  const m = me();
  const o = PROFILE.get(m.id);
  return { id: m.id, name: o?.name ?? m.name, email: m.email, phone: o?.phone ?? m.phone, status: m.status, storeName: m.storeName };
}

function buildReceipt(storeId: string | null): ReceiptSettings | null {
  const store = storeId ? findStore(storeId) : null;
  if (!store) return null;
  const saved = RECEIPT.get(store.id);
  return {
    storeId: store.id,
    storeName: store.name,
    storeLocation: store.location,
    storePhone: store.contactPhone,
    invoicePrefix: saved?.invoicePrefix ?? "INV",
    receiptFooter: saved?.receiptFooter ?? "Thank you for shopping with us!",
  };
}

// TODO(integration): replace with GET /api/v1/auth/me (profile) and GET /api/v1/settings/store/:id
// (receipt settings). The backend takes the user and storeId from the token.
export async function fetchManagerSettings(): Promise<ManagerSettingsData> {
  await wait(600);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }
  const m = me();
  return { profile: buildProfile(), receipt: SCENARIO === "no-store" ? null : buildReceipt(m.storeId) };
}

// TODO(integration): replace with PATCH /api/v1/users/:id or a "update my profile" endpoint. The docs
// only let the Owner PATCH /users/:id, so a Manager editing their own name and phone needs an endpoint
// that takes the user id from the token. The email must not be changeable here.
export async function updateManagerProfile(input: UpdateProfilePayload): Promise<ManagerProfile> {
  await wait(700);
  if (FAIL_PROFILE) throw new Error("Save failed");
  const values = { name: input.name.trim(), phone: input.phone.trim() };
  const errors = validateProfile(values);
  if (Object.keys(errors).length > 0) throw new ManagerSettingsApiError("Validation failed", errors as Record<string, string>);
  PROFILE.set(me().id, values);
  return buildProfile();
}

// TODO(integration): replace with POST /api/v1/auth/change-password { currentPassword, newPassword }.
// The backend must verify the current password, apply the password rules, hash the new one (bcrypt)
// and ideally end the user's other sessions.
export async function changeManagerPassword(input: ChangePasswordPayload): Promise<void> {
  await wait(800);
  if (FAIL_PASSWORD) throw new Error("Change failed");
  if (input.currentPassword !== PASSWORD) {
    throw new ManagerSettingsApiError("Wrong password", { currentPassword: "That isn't your current password." });
  }
  if (!PASSWORD_RULES.every((r) => r.test(input.newPassword))) {
    throw new ManagerSettingsApiError("Weak password", { newPassword: "Your new password doesn't meet every requirement." });
  }
  if (input.newPassword === input.currentPassword) {
    throw new ManagerSettingsApiError("Same password", { newPassword: "Choose a password different from your current one." });
  }
  PASSWORD = input.newPassword;
}

// TODO(integration): replace with PATCH /api/v1/settings/store/:id { invoicePrefix, receiptFooter }.
// The backend must check the store is the one in the token, and keep invoice numbers unique per store.
// Invoices already issued keep the prefix they were created with.
export async function updateReceiptSettings(input: UpdateReceiptPayload): Promise<ReceiptSettings> {
  await wait(700);
  if (FAIL_RECEIPT) throw new Error("Save failed");
  const m = me();
  const receipt = buildReceipt(m.storeId);
  if (!receipt) throw new ManagerSettingsApiError("You are not assigned to a store yet.");

  const values = { invoicePrefix: input.invoicePrefix.trim().toUpperCase(), receiptFooter: input.receiptFooter.trim() };
  const errors = validateReceipt(values);
  if (Object.keys(errors).length > 0) throw new ManagerSettingsApiError("Validation failed", errors as Record<string, string>);

  RECEIPT.set(receipt.storeId, values);
  return { ...receipt, ...values };
}