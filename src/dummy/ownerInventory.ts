import { AdminApiError } from "@/dummy/adminDashboard";
import { findStore, getStoreOptions } from "@/dummy/ownerStores";
import type { InventoryListData, NewProductPayload, Product, ProductUnit } from "@/types/owner";

type Scenario = "ok" | "empty" | "forbidden" | "session" | "network";
// Change this to preview each list state: "ok" | "empty" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed "Add product" request in the dialog.
const FAIL_CREATE = false;

export class ProductApiError extends Error {
  fieldErrors?: Partial<Record<keyof NewProductPayload, string>>;
  constructor(message: string, fieldErrors?: Partial<Record<keyof NewProductPayload, string>>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

type CatalogItem = { name: string; sku: string; category: string; unit: ProductUnit; cost: number; price: number; reorder: number };

const CATALOG: CatalogItem[] = [
  { name: "Basmati Rice 5kg", sku: "GR-0042", category: "Grocery", unit: "pack", cost: 780, price: 890, reorder: 20 },
  { name: "Sunflower Oil 1L", sku: "OL-0107", category: "Grocery", unit: "pcs", cost: 215, price: 245, reorder: 15 },
  { name: "Detergent Powder 1kg", sku: "HH-0231", category: "Household", unit: "pack", cost: 190, price: 225, reorder: 12 },
  { name: "Tea Leaves 250g", sku: "BV-0018", category: "Beverages", unit: "pack", cost: 150, price: 185, reorder: 18 },
  { name: "Notebook A5 (Pack of 5)", sku: "ST-0094", category: "Stationery", unit: "pack", cost: 260, price: 320, reorder: 10 },
  { name: "Toothpaste 150g", sku: "PC-0066", category: "Personal care", unit: "pcs", cost: 95, price: 120, reorder: 24 },
  { name: "Iodized Salt 1kg", sku: "GR-0011", category: "Grocery", unit: "kg", cost: 18, price: 25, reorder: 30 },
  { name: "Hand Soap 250ml", sku: "PC-0072", category: "Personal care", unit: "pcs", cost: 110, price: 145, reorder: 16 },
  { name: "Sugar 1kg", sku: "GR-0015", category: "Grocery", unit: "kg", cost: 92, price: 110, reorder: 40 },
  { name: "Instant Noodles (Pack of 5)", sku: "FD-0120", category: "Food", unit: "pack", cost: 95, price: 125, reorder: 36 },
  { name: "Mineral Water 1L", sku: "BV-0031", category: "Beverages", unit: "pcs", cost: 14, price: 20, reorder: 60 },
  { name: "Ballpoint Pens (Box of 10)", sku: "ST-0040", category: "Stationery", unit: "box", cost: 70, price: 100, reorder: 14 },
  { name: "Dishwashing Liquid 500ml", sku: "HH-0188", category: "Household", unit: "pcs", cost: 120, price: 155, reorder: 15 },
  { name: "Biscuits Family Pack", sku: "FD-0077", category: "Food", unit: "pack", cost: 60, price: 85, reorder: 30 },
];

// Built once from the stores in dummy/ownerStores.ts, so each store's number of
// low-stock products matches the "stock alerts" shown on the dashboard and Stores pages.
// Stores without sales (e.g. the inactive outlet) start with no products.
let PRODUCTS: Product[] | null = null;

function seed(): Product[] {
  const out: Product[] = [];
  getStoreOptions().forEach((opt, si) => {
    const store = findStore(opt.id);
    if (!store || store.salesToday === 0) return;
    const start = (si * 3) % CATALOG.length;
    const lowIdx = new Set(Array.from({ length: store.lowStockCount }, (_, k) => (start + k) % CATALOG.length));
    let k = 0;
    CATALOG.forEach((c, ci) => {
      let qty: number;
      if (lowIdx.has(ci)) {
        qty = k === 0 && si % 2 === 0 ? 0 : Math.max(1, Math.floor(c.reorder * 0.35) + k);
        k++;
      } else {
        qty = c.reorder + 12 + ((ci * 7 + si * 5) % 60);
      }
      out.push({
        id: `p_${store.id}_${ci}`,
        storeId: store.id,
        storeName: store.name,
        name: c.name,
        sku: c.sku,
        category: c.category,
        unit: c.unit,
        costPrice: c.cost,
        sellingPrice: c.price,
        quantityInStock: qty,
        reorderLevel: c.reorder,
      });
    });
  });
  return out;
}

const db = () => (PRODUCTS ??= seed());

export const listProducts = (): Product[] => db().map((p) => ({ ...p }));

// Used by purchases (stock in). Positive delta adds stock.
export function adjustProductStock(productId: string, delta: number) {
  const product = db().find((p) => p.id === productId);
  if (product) product.quantityInStock = Math.max(0, product.quantityInStock + delta);
}

export const countProductsForStore = (storeId: string) => db().filter((p) => p.storeId === storeId).length;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// TODO(integration): replace with GET /api/v1/products (Owner: across all stores of the business)
// with query params for search, storeId, category, stock level and page/limit. Filtering,
// sorting and pagination must happen on the backend; categories come from GET /api/v1/categories.
export async function fetchInventory(): Promise<InventoryListData> {
  await wait(700);
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    throw new AdminApiError(SCENARIO);
  }
  const products = SCENARIO === "empty" ? [] : db().map((p) => ({ ...p }));
  return {
    products: products.sort((a, b) => a.name.localeCompare(b.name) || a.storeName.localeCompare(b.storeName)),
    stores: getStoreOptions(),
    categories: [...new Set(db().map((p) => p.category).filter(Boolean))].sort(),
  };
}

// TODO(integration): replace with POST /api/v1/products  { storeId, name, sku, category, unit,
// costPrice, sellingPrice, quantityInStock, reorderLevel }. The backend must check the store belongs
// to the Owner's business, keep SKUs unique per store, and write a stockMovements entry for the
// opening stock.
export async function createProduct(input: NewProductPayload): Promise<Product> {
  await wait(700);
  if (FAIL_CREATE) throw new ProductApiError("Create failed");

  const store = findStore(input.storeId);
  if (!store) throw new ProductApiError("Store not found", { storeId: "Choose a store." });

  const sku = input.sku.trim();
  if (db().some((p) => p.storeId === input.storeId && p.sku.toLowerCase() === sku.toLowerCase())) {
    throw new ProductApiError("Duplicate SKU", { sku: "This store already has a product with this SKU." });
  }

  const product: Product = {
    id: `p_${Date.now()}`,
    storeId: store.id,
    storeName: store.name,
    name: input.name.trim(),
    sku,
    category: input.category.trim(),
    unit: input.unit,
    costPrice: input.costPrice,
    sellingPrice: input.sellingPrice,
    quantityInStock: input.quantityInStock,
    reorderLevel: input.reorderLevel,
  };
  db().push(product);
  return { ...product };
}

// Used by the Store Manager's Edit product. Quantity is not editable here: stock only changes through
// adjustProductStock (adjustments, sales and purchases).
export function updateProductRecord(
  id: string,
  patch: Partial<Pick<Product, "name" | "category" | "unit" | "costPrice" | "sellingPrice" | "reorderLevel">>,
): Product | null {
  const product = db().find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  return { ...product };
}