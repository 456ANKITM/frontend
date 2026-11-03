import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminErrorKind } from "@/types/admin";

export const OWNER_NAV: { heading: string; items: { label: string; href: string; icon: LucideIcon }[] }[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Business",
    items: [
      { label: "Stores", href: "/stores", icon: Store },
      { label: "Staff", href: "/staff", icon: Users },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Inventory", href: "/inventory", icon: Package },
      { label: "Purchases", href: "/purchases", icon: ClipboardList },
      { label: "Sales", href: "/sales", icon: Receipt },
      { label: "Suppliers", href: "/suppliers", icon: Truck },
    ],
  },
  {
    heading: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const OWNER_ERROR_MESSAGES: Record<AdminErrorKind, { title: string; text: string }> = {
  forbidden: {
    title: "Access denied",
    text: "You don't have permission to view this dashboard.",
  },
  session: {
    title: "Session expired",
    text: "Your session has expired. Please sign in again.",
  },
  network: {
    title: "Couldn't load your dashboard",
    text: "We couldn't load your sales and stock data. Try again.",
  },
};

export const LOW_STOCK_PREVIEW = 5;