import Link from "next/link";
import { ArrowUpRight, BarChart3, ClipboardList, Package, Receipt, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { OwnerStore } from "@/types/owner";

type LinkItem = { label: string; description: string; href: string; icon: LucideIcon };

// Each page reads `?store=<id>` to open already filtered to this store.
export default function StoreQuickLinks({ store }: { store: OwnerStore }) {
  const q = `?store=${encodeURIComponent(store.id)}`;
  const items: LinkItem[] = [
    {
      label: "Inventory",
      description:
        store.lowStockCount > 0
          ? `${store.lowStockCount} ${store.lowStockCount === 1 ? "stock alert" : "stock alerts"} to review`
          : "Products and stock levels",
      href: `/inventory${q}`,
      icon: Package,
    },
    {
      label: "Sales",
      description: `Today: ${formatCurrency(store.salesToday)}`,
      href: `/sales${q}`,
      icon: Receipt,
    },
    { label: "Purchases", description: "Stock received from suppliers", href: `/purchases${q}`, icon: ClipboardList },
    { label: "Reports", description: "Sales and stock reports", href: `/reports${q}`, icon: BarChart3 },
  ];

  return (
    <section aria-labelledby="quicklinks-title">
      <h2 id="quicklinks-title" className="text-[15px] font-semibold text-black">
        Quick links
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map(({ label, description, href, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="group flex items-start gap-3 rounded-xl border border-gray-300 bg-white p-4 outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-black">{label}</span>
                <span className="mt-0.5 block text-[13px] text-gray-600">{description}</span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:text-black"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}