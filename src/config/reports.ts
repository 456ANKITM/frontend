import { Boxes, Building2, Scale, TrendingUp, Trophy, UserCheck, type LucideIcon } from "lucide-react";
import type { GroupBy, RangePreset, ReportType, TopBy } from "@/types/reports";

export const REPORT_TYPES: {
  value: ReportType;
  label: string;
  description: string;
  icon: LucideIcon;
  usesDates: boolean;
}[] = [
  {
    value: "sales_summary",
    label: "Sales summary",
    description: "Revenue and number of sales over time",
    icon: TrendingUp,
    usesDates: true,
  },
  {
    value: "inventory_valuation",
    label: "Inventory valuation",
    description: "What your current stock is worth",
    icon: Boxes,
    usesDates: false,
  },
  {
    value: "profit_loss",
    label: "Profit and loss",
    description: "Revenue, cost of goods and gross profit",
    icon: Scale,
    usesDates: true,
  },
  {
    value: "top_products",
    label: "Top products",
    description: "Best sellers by revenue or quantity",
    icon: Trophy,
    usesDates: true,
  },
  {
    value: "store_comparison",
    label: "Store comparison",
    description: "How your stores perform side by side",
    icon: Building2,
    usesDates: true,
  },
  {
    value: "staff_performance",
    label: "Staff performance",
    description: "Sales recorded by each Store Manager",
    icon: UserCheck,
    usesDates: true,
  },
];

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

export const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

export const TOP_BY_OPTIONS: { value: TopBy; label: string }[] = [
  { value: "revenue", label: "Revenue" },
  { value: "quantity", label: "Quantity sold" },
];

// Table rows shown on screen. Exports always contain every row.
export const REPORT_TABLE_LIMIT = 25;
// Items drawn in ranking charts.
export const REPORT_CHART_LIMIT = 10;
export const MAX_RANGE_DAYS = 366;