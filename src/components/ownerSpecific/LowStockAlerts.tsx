import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageX, TriangleAlert } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import { LOW_STOCK_PREVIEW } from "@/config/owner";
import type { LowStockItem } from "@/types/owner";

type Props = { items: LowStockItem[]; total: number; href?: string };

export default function LowStockAlerts({ items, total, href = "/inventory" }: Props) {
  const shown = items.slice(0, LOW_STOCK_PREVIEW);

  return (
    <section aria-labelledby="lowstock-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="lowstock-title" className="text-[15px] font-semibold text-black">
            Low-stock alerts
          </h2>
          <p className="mt-0.5 text-[13px] text-gray-600">Products at or below their reorder level.</p>
        </div>
        {total > 0 && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-black">
            {total} {total === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={CheckCircle2}
            title="Stock levels look good"
            description="No product is below its reorder level in any of your stores."
          />
        </div>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-gray-200">
            {shown.map((item) => {
              const out = item.quantity === 0;
              const Icon = out ? PackageX : TriangleAlert;
              return (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-black">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">{item.productName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {item.storeName} &middot; {item.sku}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                        out ? "border-black bg-black text-white" : "border-gray-300 bg-white text-black"
                      }`}
                    >
                      {out ? "Out of stock" : `${item.quantity} left`}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">Reorder at {item.reorderLevel}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href={href}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-black underline-offset-4 hover:underline"
          >
            View all low-stock items
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </>
      )}
    </section>
  );
}