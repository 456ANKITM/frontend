import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

// Store Manager navigation. Routes are shared with the Owner panel (see the ERP docs, 6.4).
// /pos and /customers are not built yet.
export const MANAGER_NAV: { heading: string; items: { label: string; href: string; icon: LucideIcon }[] }[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Selling",
    items: [
      { label: "New sale (POS)", href: "/manager/pos", icon: ShoppingCart },
      { label: "Sales", href: "/manager/sales", icon: Receipt },
      { label: "Customers", href: "/manager/customers", icon: Users },
    ],
  },
  {
    heading: "Stock",
    items: [
      { label: "Inventory", href: "/manager/inventory", icon: Package },
      { label: "Purchases", href: "/manager/purchases", icon: ClipboardList },
    ],
  },
  {
    heading: "Insights",
    items: [
      { label: "Reports", href: "/manager/reports", icon: BarChart3 },
      { label: "Settings", href: "/manager/settings", icon: Settings },
    ],
  },
];

export const RECENT_TRANSACTIONS_LIMIT = 6;