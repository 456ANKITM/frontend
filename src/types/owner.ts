import type { StoreStatus } from "@/types/admin";

export interface OwnerSummary {
  storeCount: number;
  salesToday: number;
  salesYesterday: number;
  salesMonth: number; // month to date
  salesPrevMonthToDate: number; // same number of days last month
  lowStockCount: number;
}

export interface TopStore {
  id: string;
  name: string;
  salesMonth: number;
  sharePct: number; // share of total sales this month, 0-100
}

export interface RevenuePoint {
  label: string;
  amount: number;
}

export interface LowStockItem {
  id: string;
  productName: string;
  sku: string;
  storeName: string;
  quantity: number;
  reorderLevel: number;
}

export interface OwnerDashboardData {
  summary: OwnerSummary;
  topStore: TopStore | null;
  revenue: RevenuePoint[];
  lowStock: LowStockItem[]; // the most urgent few; lowStockCount has the full total
  updatedAt: string; // ISO date-time
}

/* ---------- Stores list (/stores) ---------- */

export type StoreStatusFilter = StoreStatus | "all";

export interface OwnerStore {
  id: string;
  name: string;
  location: string;
  contactPhone: string;
  managerName: string | null; // null = no Store Manager assigned yet
  status: StoreStatus;
  salesToday: number;
  salesYesterday: number;
  lowStockCount: number; // stock alerts: products at or below reorder level
  createdAt: string; // ISO date
}

export interface NewStoreInput {
  name: string;
  location: string;
  contactPhone: string; // optional, may be ""
}

/* ---------- Store detail (/stores/:id) ---------- */

export type StaffStatus = "active" | "invited" | "disabled";
export type StaffStatusFilter = StaffStatus | "all";

export interface StoreManager {
  id: string;
  name: string;
  email: string;
  phone: string; // "" until the invited person fills in their profile
  status: StaffStatus;
  storeId: string | null; // a Store Manager belongs to at most one store
  storeName: string | null;
}

export type PaymentMethod = "cash" | "card" | "online";

export interface RecentSale {
  id: string;
  invoiceNo: string;
  soldAt: string; // ISO date-time
  itemCount: number;
  total: number;
  paymentMethod: PaymentMethod;
}

export interface StoreDetailData {
  store: OwnerStore;
  manager: StoreManager | null;
  managers: StoreManager[]; // every Store Manager of the business (for the assign dialog)
  salesMonth: number;
  productCount: number;
  lowStock: LowStockItem[];
  recentSales: RecentSale[];
  updatedAt: string; // ISO date-time
}

/* ---------- Staff management (/staff) ---------- */

export interface StoreOption {
  id: string;
  name: string;
  status: StoreStatus;
  managerName: string | null; // current manager, used for "will be unassigned" hints
}

export interface StaffListData {
  staff: StoreManager[];
  stores: StoreOption[];
}

export interface InviteStaffInput {
  name: string;
  email: string;
  storeId: string; // "" = assign a store later
}

/* ---------- Inventory (/inventory) ---------- */

export type StockLevel = "in_stock" | "low" | "out";
export type StockFilter = StockLevel | "all";
export type ProductUnit = "pcs" | "kg" | "g" | "litre" | "ml" | "pack" | "box";

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  sku: string;
  category: string;
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  reorderLevel: number;
}

export interface NewProductPayload {
  name: string;
  sku: string;
  storeId: string;
  category: string; // "" = uncategorized
  unit: ProductUnit;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number; // opening stock
  reorderLevel: number;
}

export interface InventoryListData {
  products: Product[];
  stores: StoreOption[];
  categories: string[];
}

/* ---------- Purchases (/purchases) ---------- */

export type PaymentStatus = "paid" | "partial" | "due";
export type PaymentFilter = PaymentStatus | "all";
export type PeriodFilter = "all" | "7d" | "30d" | "90d";

export interface SupplierOption {
  id: string;
  name: string;
}

export interface ProductOption {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  unit: ProductUnit;
  costPrice: number; // last known cost, used to prefill the form
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  unit: ProductUnit;
  quantity: number;
  costPrice: number;
}

export interface Purchase {
  id: string;
  referenceNo: string;
  storeId: string;
  storeName: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  purchaseDate: string; // ISO date (YYYY-MM-DD)
  createdBy: string;
}

export interface NewPurchasePayload {
  storeId: string;
  supplierId: string;
  purchaseDate: string;
  paymentStatus: PaymentStatus;
  items: { productId: string; quantity: number; costPrice: number }[];
}

export interface PurchasesListData {
  purchases: Purchase[];
  stores: StoreOption[];
  suppliers: SupplierOption[];
  products: ProductOption[];
}