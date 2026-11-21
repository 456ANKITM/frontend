import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import {
  adjustProductStock,
  createProduct,
  listProducts,
  ProductApiError,
  updateProductRecord,
} from "@/dummy/ownerInventory";
import { findStore } from "@/dummy/ownerStores";
import { ADJUST_NOTE_MAX } from "@/config/managerInventory";
import type {
  AdjustStockPayload,
  ManagerInventoryData,
  ManagerProductPayload,
  StockMovement,
  UpdateProductPayload,
} from "@/types/managerInventory";
import type { Product } from "@/types/owner";

type Scenario = "ok" | "empty" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "empty" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set any of these to true to preview a failed request in its dialog.
const FAIL_CREATE = false;
const FAIL_UPDATE = false;
const FAIL_ADJUST = false;

// Field errors are shown under the matching input; the message is shown for other failures.
export class ManagerInventoryApiError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// In-memory audit trail so adjustments are recorded while we are UI-only.
const MOVEMENTS: StockMovement[] = [];
export const listStockMovements = (productId?: string) =>
  MOVEMENTS.filter((m) => !productId || m.productId === productId).map((m) => ({ ...m }));

function ownStore() {
  const me = getCurrentManager();
  const store = me?.storeId ? findStore(me.storeId) : null;
  if (!me || !store) throw new ManagerInventoryApiError("You are not assigned to a store yet.");
  return { me, store };
}

function ownProduct(productId: string): Product {
  const { store } = ownStore();
  const product = listProducts().find((p) => p.id === productId && p.storeId === store.id);
  if (!product) throw new ManagerInventoryApiError("This product is no longer in your store. Refresh and try again.");
  return product;
}

// TODO(integration): replace with GET /api/v1/products (the backend takes the storeId from the
// token, so a manager only receives their own store's products) and GET /api/v1/categories.
// Search, category and stock-level filtering and pagination must happen on the backend.
export async function fetchManagerInventory(): Promise<ManagerInventoryData> {
  await wait(600);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }

  const me = getCurrentManager();
  const store = SCENARIO === "no-store" || !me?.storeId ? null : findStore(me.storeId);
  if (!store) return { store: null, products: [], categories: [] };

  const all = listProducts().filter((p) => p.storeId === store.id);
  return {
    store: { id: store.id, name: store.name, location: store.location },
    products: SCENARIO === "empty" ? [] : all.sort((a, b) => a.name.localeCompare(b.name)),
    categories: [...new Set(all.map((p) => p.category).filter(Boolean))].sort(),
  };
}

// TODO(integration): replace with POST /api/v1/products { name, sku, category, unit, costPrice,
// sellingPrice, quantityInStock, reorderLevel }. The backend must take storeId from the token (never
// from the body), keep SKUs unique per store, and write a stockMovements entry for the opening stock.
export async function createManagerProduct(input: ManagerProductPayload): Promise<Product> {
  await wait(700);
  if (FAIL_CREATE) throw new Error("Create failed");
  const { store } = ownStore();
  try {
    return await createProduct({ ...input, storeId: store.id });
  } catch (err) {
    if (err instanceof ProductApiError) {
      throw new ManagerInventoryApiError(err.message, err.fieldErrors as Record<string, string> | undefined);
    }
    throw err;
  }
}

// TODO(integration): replace with PATCH /api/v1/products/:id { name, category, unit, costPrice,
// sellingPrice, reorderLevel }. The backend must check the product belongs to the manager's store.
// The quantity is not part of this request; it only changes through adjust-stock, sales and purchases.
export async function updateManagerProduct(productId: string, input: UpdateProductPayload): Promise<Product> {
  await wait(700);
  if (FAIL_UPDATE) throw new Error("Update failed");
  ownProduct(productId);
  const updated = updateProductRecord(productId, {
    name: input.name.trim(),
    category: input.category.trim(),
    unit: input.unit,
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    reorderLevel: input.reorderLevel,
  });
  if (!updated) throw new ManagerInventoryApiError("This product is no longer in your store. Refresh and try again.");
  return updated;
}

// TODO(integration): replace with PATCH /api/v1/products/:id/adjust-stock { direction, quantity,
// reason, note }. The backend must check the product belongs to the manager's store, refuse to take
// stock below 0, and change the quantity and write the stockMovements entry in one transaction.
export async function adjustManagerStock(input: AdjustStockPayload): Promise<Product> {
  await wait(700);
  if (FAIL_ADJUST) throw new Error("Adjust failed");

  const { me } = ownStore();
  const product = ownProduct(input.productId);
  const note = input.note.trim();

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new ManagerInventoryApiError("Invalid quantity", { quantity: "Enter a whole number greater than 0." });
  }
  if (input.direction === "remove" && input.quantity > product.quantityInStock) {
    throw new ManagerInventoryApiError("Not enough stock", {
      quantity: `You only have ${product.quantityInStock} ${product.unit} in stock.`,
    });
  }
  if (input.reason === "other" && !note) {
    throw new ManagerInventoryApiError("Note required", { note: "Add a short note to explain this adjustment." });
  }
  if (note.length > ADJUST_NOTE_MAX) {
    throw new ManagerInventoryApiError("Note too long", { note: `The note can be up to ${ADJUST_NOTE_MAX} characters.` });
  }

  const signed = input.direction === "add" ? input.quantity : -input.quantity;
  adjustProductStock(product.id, signed);
  MOVEMENTS.unshift({
    id: `mv_${Date.now()}`,
    productId: product.id,
    productName: product.name,
    type: "adjustment",
    quantity: signed,
    reason: input.reason,
    note,
    createdBy: me.name,
    createdAt: new Date().toISOString(),
  });

  return ownProduct(product.id);
}