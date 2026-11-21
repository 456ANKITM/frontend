import type { ManagerStoreInfo } from "@/types/manager";
import type { NewProductPayload, Product } from "@/types/owner";

// The store is never sent by the browser; the backend takes it from the token.
export type ManagerProductPayload = Omit<NewProductPayload, "storeId">;

// Stock quantity is not editable here. It only changes through "Adjust stock".
export interface UpdateProductPayload {
  name: string;
  category: string; // "" = uncategorized
  unit: Product["unit"];
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
}

export type AdjustDirection = "add" | "remove";
export type AdjustReason = "damaged" | "expired" | "lost" | "found" | "correction" | "other";

export interface AdjustStockPayload {
  productId: string;
  direction: AdjustDirection;
  quantity: number; // always positive; the direction decides the sign
  reason: AdjustReason;
  note: string; // required when reason is "other"
}

// One row of the audit trail (`stockMovements` in the docs).
export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "adjustment";
  quantity: number; // signed: negative = stock removed
  reason: AdjustReason;
  note: string;
  createdBy: string;
  createdAt: string; // ISO date-time
}

export interface ManagerInventoryData {
  store: ManagerStoreInfo | null; // null = the manager is not assigned to a store yet
  products: Product[];
  categories: string[];
}