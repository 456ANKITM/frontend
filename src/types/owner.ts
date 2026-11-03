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

export interface StoreManager {
  id: string;
  name: string;
  email: string;
  phone: string;
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