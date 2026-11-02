export type BusinessStatus = "active" | "suspended" | "trial";
export type GrowthRange = "7d" | "30d" | "90d" | "12m";
export type AdminErrorKind = "forbidden" | "session" | "network";

export interface PlatformSummary {
  total: number;
  active: number;
  suspended: number;
  trial: number;
}

export interface GrowthPoint {
  label: string;
  count: number;
}

export interface RecentBusiness {
  id: string;
  name: string;
  ownerName: string;
  status: BusinessStatus;
  createdAt: string; // ISO date
}

export interface DashboardData {
  summary: PlatformSummary;
  growth: GrowthPoint[];
  recent: RecentBusiness[];
  updatedAt: string; // ISO date-time
}

/* ---------- Businesses list (/admin/businesses) ---------- */

export type BusinessPlan = "starter" | "growth" | "enterprise";
export type StatusFilter = BusinessStatus | "all";
export type PlanFilter = BusinessPlan | "all";

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  plan: BusinessPlan;
  status: BusinessStatus;
  storeCount: number;
  createdAt: string; // ISO date
}

export interface BusinessListQuery {
  search: string;
  status: StatusFilter;
  plan: PlanFilter;
  page: number; // 1-based
  pageSize: number;
}

export interface BusinessListData {
  items: Business[];
  total: number; // total rows matching the filters (not just this page)
  page: number;
  pageSize: number;
}

/* ---------- Business detail (/admin/businesses/:id) ---------- */

export type StoreStatus = "active" | "inactive";

export interface StoreSummary {
  id: string;
  name: string;
  location: string;
  managerName: string | null; // null = no Store Manager assigned yet
  status: StoreStatus;
  createdAt: string; // ISO date
}

export type ActivityType =
  | "registered"
  | "store_created"
  | "manager_invited"
  | "plan_changed"
  | "suspended"
  | "activated";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  actor: string;
  at: string; // ISO date-time
}

export interface BusinessDetailData {
  business: Business;
  contactEmail: string;
  contactPhone: string;
  address: string;
  ownerPhone: string;
  ownerLastLoginAt: string | null; // ISO date-time
  stores: StoreSummary[];
  activity: ActivityEntry[]; // newest first
  updatedAt: string; // ISO date-time
}