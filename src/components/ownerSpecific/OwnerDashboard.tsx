"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, PackageSearch, Store, Trophy, Wallet, CalendarDays } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import OwnerKpiCard from "./OwnerKpiCard";
import RevenueChart from "./RevenueChart";
import LowStockAlerts from "./LowStockAlerts";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchOwnerDashboard } from "@/dummy/ownerDashboard";
import { RANGE_OPTIONS } from "@/config/admin";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { formatCurrency, percentChange } from "@/utils/formatCurrency";
import type { AdminErrorKind, GrowthRange } from "@/types/admin";
import type { OwnerDashboardData } from "@/types/owner";

const pulse = "animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none";

function OwnerDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <p role="status" className="sr-only">
        Loading your dashboard...
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
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 xl:col-span-2">
            <div className={`h-4 w-24 ${pulse}`} />
            <div className={`mt-2 h-3 w-56 ${pulse}`} />
            <div className={`mt-6 h-56 w-full ${pulse}`} />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className={`h-4 w-36 ${pulse}`} />
            <div className={`mt-2 h-3 w-48 ${pulse}`} />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`h-10 w-full ${pulse}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [range, setRange] = useState<GrowthRange>("30d");
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (r: GrowthRange) => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchOwnerDashboard(r);
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
    void load(range);
  }, [range, load]);

  const retry = () => void load(range);
  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Dashboard
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Sales and stock across all your stores.
          </p>
          {data?.updatedAt && (
            <p className="mt-1 text-xs text-gray-500">
              Last updated{" "}
              {new Date(data.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <label htmlFor="owner-range" className="sr-only">
              Time range
            </label>
            <select
              id="owner-range"
              value={range}
              onChange={(e) => setRange(e.target.value as GrowthRange)}
              className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
            >
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
          </div>
          <RefreshButton onClick={retry} refreshing={refreshing} />
        </div>
      </div>

      {/* Announces background refreshes without moving focus */}
      <p role="status" className="sr-only">
        {refreshing && data ? "Refreshing your dashboard..." : ""}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={retry} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data || !s ? (
        <OwnerDashboardSkeleton />
      ) : (
        <>
          {error && <AdminErrorState kind={error} onRetry={retry} messages={OWNER_ERROR_MESSAGES} compact />}

          {s.storeCount === 0 ? (
            <EmptyState
              icon={Store}
              title="No stores yet"
              description="Create your first store to start tracking sales and stock from here."
            >
              <Link
                href="/stores"
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
              >
                Add a store
              </Link>
            </EmptyState>
          ) : (
            <>
              <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <OwnerKpiCard
                  label="Sales today"
                  value={formatCurrency(s.salesToday)}
                  description="No sales to compare with yesterday"
                  change={percentChange(s.salesToday, s.salesYesterday)}
                  changeLabel="vs yesterday"
                  icon={Wallet}
                />
                <OwnerKpiCard
                  label="Sales this month"
                  value={formatCurrency(s.salesMonth)}
                  description="Month to date, all stores"
                  change={percentChange(s.salesMonth, s.salesPrevMonthToDate)}
                  changeLabel="vs same days last month"
                  icon={CalendarDays}
                />
                <OwnerKpiCard
                  label="Low-stock items"
                  value={String(s.lowStockCount)}
                  description={s.lowStockCount === 0 ? "Nothing needs reordering" : "Need reordering across stores"}
                  icon={PackageSearch}
                />
                <OwnerKpiCard
                  textValue
                  label="Top store this month"
                  value={data.topStore ? data.topStore.name : "No sales yet"}
                  description={
                    data.topStore
                      ? `${formatCurrency(data.topStore.salesMonth)}, ${data.topStore.sharePct}% of sales`
                      : "Appears once sales are recorded"
                  }
                  icon={Trophy}
                />
              </section>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <RevenueChart points={data.revenue} range={range} />
                </div>
                <LowStockAlerts items={data.lowStock} total={s.lowStockCount} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}