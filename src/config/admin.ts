import { Building2, LayoutDashboard, type LucideIcon } from "lucide-react";
import type { BusinessPlan, BusinessStatus, GrowthRange } from "@/types/admin";

export const ADMIN_NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Businesses", href: "/admin/businesses", icon: Building2 },
];

export const RANGE_OPTIONS: { value: GrowthRange; label: string; period: string }[] = [
  { value: "7d", label: "Last 7 days", period: "the last 7 days" },
  { value: "30d", label: "Last 30 days", period: "the last 30 days" },
  { value: "90d", label: "Last 90 days", period: "the last 90 days" },
  { value: "12m", label: "Last 12 months", period: "the last 12 months" },
];

// Single source of truth for status labels. Must mirror the backend enum.
export const STATUS_ORDER: BusinessStatus[] = ["active", "trial", "suspended"];
export const STATUS_LABEL: Record<BusinessStatus, string> = {
  active: "Active",
  trial: "Trial",
  suspended: "Suspended",
};

// Subscription plans. Rename/extend to match your real plans (config/plans.ts)
// and the backend `subscriptionPlan` values.
export const PLAN_ORDER: BusinessPlan[] = ["starter", "growth", "enterprise"];
export const PLAN_LABEL: Record<BusinessPlan, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export const BUSINESSES_PAGE_SIZE = 8;