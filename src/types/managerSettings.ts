import type { StaffStatus } from "@/types/owner";

export interface ManagerProfile {
  id: string;
  name: string;
  email: string; // login email, read-only here
  phone: string; // "" = not set
  status: StaffStatus;
  storeName: string | null;
}

// Maps to PATCH /api/v1/settings/store/:id (receipt footer, invoice prefix).
export interface ReceiptSettings {
  storeId: string;
  storeName: string;
  storeLocation: string;
  storePhone: string; // "" = not set
  invoicePrefix: string; // e.g. "INV"
  receiptFooter: string; // "" = no footer
}

export interface ManagerSettingsData {
  profile: ManagerProfile;
  receipt: ReceiptSettings | null; // null = the manager is not assigned to a store yet
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateReceiptPayload {
  invoicePrefix: string;
  receiptFooter: string;
}