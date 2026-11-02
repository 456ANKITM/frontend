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