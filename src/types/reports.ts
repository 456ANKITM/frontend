import type { LucideIcon } from "lucide-react";
import type { Product, Purchase, Sale, StoreOption } from "@/types/owner";

export type ReportType =
  | "sales_summary"
  | "inventory_valuation"
  | "profit_loss"
  | "top_products"
  | "store_comparison"
  | "staff_performance";

export type RangePreset = "7d" | "30d" | "90d" | "this_month" | "last_month" | "custom";
export type GroupBy = "day" | "week" | "month";
export type TopBy = "revenue" | "quantity";
export type ValueFormat = "currency" | "number" | "percent" | "text";

// Everything a report is calculated from.
export interface ReportSource {
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  stores: StoreOption[];
}

export interface ReportFilters {
  type: ReportType;
  storeIds: string[]; // empty = all stores
  preset: RangePreset;
  from: string; // ISO date (YYYY-MM-DD)
  to: string; // ISO date (YYYY-MM-DD)
  groupBy: GroupBy; // sales summary only
  topBy: TopBy; // top products only
}

export interface FilterErrors {
  from?: string;
  to?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  format: ValueFormat; // "text" columns are left aligned, the rest right aligned
}

export type ReportCell = string | number | null;
export type ReportRow = Record<string, ReportCell>;

export interface ReportKpi {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  textValue?: boolean; // long text such as a store name
}

export type ReportChart =
  | { kind: "columns"; title: string; format: ValueFormat; points: { label: string; value: number }[] }
  | { kind: "bars"; title: string; format: ValueFormat; items: { label: string; value: number; detail?: string }[] };

export interface ReportResult {
  type: ReportType;
  title: string;
  scope: string; // e.g. "All stores · Nov 1, 2026 to Nov 20, 2026"
  fileName: string; // base name for exported files
  kpis: ReportKpi[];
  chart: ReportChart | null;
  columns: ReportColumn[];
  rows: ReportRow[];
  totals: ReportRow | null;
  note: string;
}