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
import type { ProductUnit } from "@/types/owner";

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

export const PRODUCT_UNITS: { value: ProductUnit; label: string }[] = [
  { value: "pcs", label: "Pieces" },
  { value: "pack", label: "Pack" },
  { value: "box", label: "Box" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "litre", label: "Litre" },
  { value: "ml", label: "Millilitre (ml)" },
];

export const INVENTORY_PAGE_SIZE = 10;

export const PURCHASES_PAGE_SIZE = 10;

export const SALES_PAGE_SIZE = 10;

export const SUPPLIERS_PAGE_SIZE = 10;

// Purchases shown in a supplier's history before pointing to the Purchases page.
export const SUPPLIER_HISTORY_LIMIT = 20;