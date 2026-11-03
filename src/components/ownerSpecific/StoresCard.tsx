import Link from "next/link";
import { ArrowRight, MapPin, UserRound } from "lucide-react";
import { StockAlertBadge, StoreStatusPill } from "./StoreBadges";
import { formatCurrency, percentChange } from "@/utils/formatCurrency";
import type { OwnerStore } from "@/types/owner";

export function SalesChange({ today, yesterday }: { today: number; yesterday: number }) {
  const change = percentChange(today, yesterday);
  if (change === null) return <span className="text-xs text-gray-500">No sales yesterday</span>;
  return (
    <span className="text-xs text-gray-600">
      <span className="font-medium text-black">
        {change > 0 ? "+" : ""}
        {change.toFixed(1)}%
      </span>{" "}
      vs yesterday
    </span>
  );
}

export default function StoreCard({ store }: { store: OwnerStore }) {
  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-400">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-black">
            <Link
              href={`/stores/${store.id}`}
              className="underline-offset-4 outline-none hover:underline focus-visible:underline"
            >
              {store.name}
            </Link>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-600">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{store.location}</span>
          </p>
        </div>
        <StoreStatusPill status={store.status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
        <div>
          <dt className="text-xs text-gray-500">Today&apos;s sales</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-black">{formatCurrency(store.salesToday)}</dd>
          <dd className="mt-0.5">
            <SalesChange today={store.salesToday} yesterday={store.salesYesterday} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Stock alerts</dt>
          <dd className="mt-2">
            <StockAlertBadge count={store.lowStockCount} />
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
        <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-gray-700">
          <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{store.managerName ?? "No manager assigned"}</span>
        </p>
        <Link
          href={`/stores/${store.id}`}
          aria-label={`View ${store.name}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-black underline-offset-4 hover:underline"
        >
          View
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function StoreCardSkeleton() {
  const bar = "animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div>
          <div className={`h-4 w-40 ${bar}`} />
          <div className={`mt-2 h-3 w-32 ${bar}`} />
        </div>
        <div className={`h-6 w-16 rounded-full ${bar}`} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
        <div>
          <div className={`h-3 w-20 ${bar}`} />
          <div className={`mt-2 h-6 w-28 ${bar}`} />
        </div>
        <div>
          <div className={`h-3 w-20 ${bar}`} />
          <div className={`mt-2 h-6 w-16 ${bar}`} />
        </div>
      </div>
      <div className={`mt-5 h-4 w-36 ${bar}`} />
    </div>
  );
}