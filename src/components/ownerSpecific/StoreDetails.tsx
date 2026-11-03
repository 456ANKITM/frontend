"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, PackageSearch, Package, SearchX, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import OwnerKpiCard from "./OwnerKpiCard";
import LowStockAlerts from "./LowStockAlerts";
import { StoreStatusPill } from "./StoreBadges";
import { ManagerCard, StoreInfoCard } from "./StoreInfoCards";
import StoreQuickLinks from "./StoreQuickLinks";
import StoreRecentSales from "./StoreRecentSales";
import AssignManagerDialog from "./AssignManagerDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchStoreDetail } from "@/dummy/ownerStoreDetails";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { formatCurrency, percentChange } from "@/utils/formatCurrency";
import type { AdminErrorKind } from "@/types/admin";
import type { StoreDetailData, StoreManager } from "@/types/owner";

const BackLink = () => (
  <Link
    href="/stores"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition hover:text-black"
  >
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    Back to stores
  </Link>
);

const pulse = "animate-pulse rounded-md bg-gray-200 motion-reduce:animate-none";

function DetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading store details">
      <div aria-hidden="true" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className={`h-4 w-28 ${pulse}`} />
              <div className={`mt-4 h-9 w-32 ${pulse}`} />
              <div className={`mt-3 h-3 w-36 ${pulse}`} />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-44 rounded-xl border border-gray-200 bg-gray-100" />
            <div className="h-72 rounded-2xl border border-gray-200 bg-gray-100" />
          </div>
          <div className="space-y-6">
            <div className="h-64 rounded-xl border border-gray-200 bg-gray-100" />
            <div className="h-44 rounded-xl border border-gray-200 bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreDetail({ id }: { id: string }) {
  const [data, setData] = useState<StoreDetailData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const reqId = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchStoreDetail(id);
      if (reqId !== requestId.current) return;
      setNotFound(result === null);
      setData(result);
    } catch (err) {
      if (reqId !== requestId.current) return;
      setError(err instanceof AdminApiError ? err.kind : "network");
    } finally {
      if (reqId === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const handleAssigned = (manager: StoreManager) => {
    setDialogOpen(false);
    setNotice(`${manager.name} is now the manager of ${data?.store.name ?? "this store"}.`);
    void load();
  };

  if (notFound) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={SearchX}
          title="Store not found"
          description="This store may have been removed, or the link is incorrect."
        >
          <Link
            href="/stores"
            className="mt-5 inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
          >
            View all stores
          </Link>
        </EmptyState>
      </div>
    );
  }

  const store = data?.store;

  return (
    <div className="space-y-6">
      <BackLink />

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data || !store ? (
        <DetailSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
                  {store.name}
                </h1>
                <StoreStatusPill status={store.status} />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {store.location}
              </p>
            </div>
            <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          </div>

          {/* Announces action results and refreshes without moving focus */}
          <p
            role="status"
            className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}
          >
            {notice ?? (refreshing ? "Refreshing store details..." : "")}
          </p>

          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          <section aria-label="Store metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard
              label="Sales today"
              value={formatCurrency(store.salesToday)}
              description="No sales to compare with yesterday"
              change={percentChange(store.salesToday, store.salesYesterday)}
              changeLabel="vs yesterday"
              icon={Wallet}
            />
            <OwnerKpiCard
              label="Sales this month"
              value={formatCurrency(data.salesMonth)}
              description="Month to date"
              icon={CalendarDays}
            />
            <OwnerKpiCard
              label="Stock alerts"
              value={String(store.lowStockCount)}
              description={store.lowStockCount === 0 ? "Nothing needs reordering" : "Products at or below reorder level"}
              icon={PackageSearch}
            />
            <OwnerKpiCard
              label="Products"
              value={String(data.productCount)}
              description="Active products in this store"
              icon={Package}
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <StoreQuickLinks store={store} />
              <LowStockAlerts
                items={data.lowStock}
                total={store.lowStockCount}
                href={`/inventory?store=${encodeURIComponent(store.id)}`}
              />
              <StoreRecentSales sales={data.recentSales} href={`/sales?store=${encodeURIComponent(store.id)}`} />
            </div>
            <div className="space-y-6">
              <ManagerCard manager={data.manager} onAssign={() => setDialogOpen(true)} />
              <StoreInfoCard store={store} />
            </div>
          </div>

          <AssignManagerDialog
            open={dialogOpen}
            storeId={store.id}
            storeName={store.name}
            currentManagerId={data.manager?.id ?? null}
            managers={data.managers}
            onClose={() => setDialogOpen(false)}
            onAssigned={handleAssigned}
          />
        </>
      )}
    </div>
  );
}