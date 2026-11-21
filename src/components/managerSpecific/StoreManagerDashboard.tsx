"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Banknote, PackageSearch, Plus, Receipt, Store, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import OwnerKpiCard from "@/components/ownerSpecific/OwnerKpiCard";
import LowStockAlerts from "@/components/ownerSpecific/LowStockAlerts";
import RecentTransactions from "./RecentTransactions";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerDashboard } from "@/dummy/managerDashboard";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { formatCurrency, percentChange } from "@/utils/formatCurrency";
import type { AdminErrorKind } from "@/types/admin";
import type { ManagerDashboardData } from "@/types/manager";

const pulse = "animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none";

const newSaleBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <p role="status" className="sr-only">
        Loading your store dashboard...
      </p>
      <div aria-hidden="true" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className={`h-4 w-28 ${pulse}`} />
                <div className={`h-9 w-9 rounded-xl ${pulse}`} />
              </div>
              <div className={`mt-4 h-9 w-32 ${pulse}`} />
              <div className={`mt-3 h-3 w-36 ${pulse}`} />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {[2, 1].map((span) => (
            <div
              key={span}
              className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 ${span === 2 ? "xl:col-span-2" : ""}`}
            >
              <div className={`h-4 w-40 ${pulse}`} />
              <div className={`mt-2 h-3 w-56 ${pulse}`} />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className={`h-10 w-full ${pulse}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StoreManagerDashboard() {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchManagerDashboard();
      if (id !== requestId.current) return;
      setData(result);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof AdminApiError ? err.kind : "network");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const s = data?.summary;
  const store = data?.store;
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store ? `${store.name}, ${dateLabel}` : dateLabel}
          </p>
          {data?.updatedAt && (
            <p className="mt-1 text-xs text-gray-500">
              Last updated{" "}
              {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          {(!data || store) && (
            <Link href="/pos" className={newSaleBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New sale
            </Link>
          )}
        </div>
      </div>

      {/* Announces background refreshes without moving focus */}
      <p role="status" className="sr-only">
        {refreshing && data ? "Refreshing your store dashboard..." : ""}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data || !s ? (
        <DashboardSkeleton />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {!store ? (
            <EmptyState
              icon={Store}
              title="No store assigned yet"
              description="Your owner needs to assign you to a store before you can record sales. Ask them to do it from the Staff page."
            />
          ) : (
            <>
              <section aria-label="Today at your store" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <OwnerKpiCard
                  label="Today's sales"
                  value={formatCurrency(s.salesToday)}
                  description="No sales to compare with yesterday"
                  change={percentChange(s.salesToday, s.salesYesterday)}
                  changeLabel="vs yesterday"
                  icon={Wallet}
                />
                <OwnerKpiCard
                  label="Transactions today"
                  value={String(s.transactionsToday)}
                  description={
                    s.transactionsToday > 0
                      ? `Average sale ${formatCurrency(s.salesToday / s.transactionsToday)}`
                      : "No sales recorded yet today"
                  }
                  icon={Receipt}
                />
                <OwnerKpiCard
                  label="Low-stock items"
                  value={String(s.lowStockCount)}
                  description={
                    s.lowStockCount === 0
                      ? "Nothing needs reordering"
                      : s.outOfStockCount > 0
                        ? `${s.outOfStockCount} out of stock`
                        : "At or below reorder level"
                  }
                  icon={PackageSearch}
                />
                <OwnerKpiCard
                  label="Payments to collect"
                  value={String(s.unpaidCount)}
                  description={
                    s.unpaidCount === 0 ? "Every recent sale is paid" : `${formatCurrency(s.unpaidAmount)} total value`
                  }
                  icon={Banknote}
                />
              </section>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <RecentTransactions items={data.recent} />
                </div>
                <LowStockAlerts items={data.lowStock} total={s.lowStockCount} href="/manager/inventory?stock=low" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}