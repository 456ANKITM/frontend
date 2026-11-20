"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Calculator, Hourglass, Receipt, SearchX, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "./OwnerKpiCard";
import SalesToolbar from "./SalesToolbar";
import SalesTable, { SalesTableSkeleton } from "./SalesTable";
import SaleDetailsDialog from "./SaleDetailsDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchSales } from "@/dummy/ownerSales";
import { OWNER_ERROR_MESSAGES, SALES_PAGE_SIZE } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { currentMonthLocal, dayOf, daysAgoLocal } from "@/utils/localDate";
import type { AdminErrorKind } from "@/types/admin";
import type { PaymentFilter, PaymentMethodFilter, PeriodFilter, Sale, SalesListData } from "@/types/owner";

const PERIOD_DAYS: Record<Exclude<PeriodFilter, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };

const secondaryBtn =
  "mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black";

type Props = {
  /** From `?store=<id>`; "all" when absent. Unknown ids fall back to "all". */
  initialStore?: string;
};

export default function SalesList({ initialStore = "all" }: Props) {
  const [data, setData] = useState<SalesListData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [store, setStore] = useState(initialStore);
  const [method, setMethod] = useState<PaymentMethodFilter>("all");
  const [payment, setPayment] = useState<PaymentFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<Sale | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchSales();
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

  // Back to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, store, method, payment, period]);

  const sales = data?.sales ?? [];
  // An unknown ?store= id behaves like "all".
  const storeFilter = store === "all" || data?.stores.some((s) => s.id === store) ? store : "all";

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || storeFilter !== "all" || method !== "all" || payment !== "all" || period !== "all";

  // Summary cards follow the store filter only.
  const scoped = sales.filter((s) => storeFilter === "all" || s.storeId === storeFilter);
  const month = currentMonthLocal();
  const monthSales = scoped.filter((s) => s.soldAt.startsWith(month));
  const revenueThisMonth = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const averageSale = monthSales.length > 0 ? revenueThisMonth / monthSales.length : 0;
  const pending = scoped.filter((s) => s.paymentStatus !== "paid");
  const pendingTotal = pending.reduce((sum, s) => sum + s.totalAmount, 0);

  const cutoff = period === "all" ? null : daysAgoLocal(PERIOD_DAYS[period]);
  const filtered = scoped
    .filter((s) => method === "all" || s.paymentMethod === method)
    .filter((s) => payment === "all" || s.paymentStatus === payment)
    .filter((s) => !cutoff || dayOf(s.soldAt) >= cutoff)
    .filter(
      (s) =>
        !term ||
        s.invoiceNo.toLowerCase().includes(term) ||
        (s.customerName ?? "walk-in customer").toLowerCase().includes(term),
    )
    .sort((a, b) => b.soldAt.localeCompare(a.soldAt) || b.invoiceNo.localeCompare(a.invoiceNo));

  const pageCount = Math.max(1, Math.ceil(filtered.length / SALES_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * SALES_PAGE_SIZE, currentPage * SALES_PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setStore("all");
    setMethod("all");
    setPayment("all");
    setPeriod("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">Sales</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Invoices from every store, newest first.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
        </div>
      </div>

      {data && sales.length > 0 && (
        <>
          <section aria-label="Sales summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard
              label="Sales"
              value={String(scoped.length)}
              description="Invoices recorded"
              icon={Receipt}
            />
            <OwnerKpiCard
              label="Revenue this month"
              value={formatCurrency(revenueThisMonth)}
              description={`${monthSales.length} ${monthSales.length === 1 ? "sale" : "sales"} this month`}
              icon={Wallet}
            />
            <OwnerKpiCard
              label="Average sale"
              value={formatCurrency(averageSale)}
              description="Per invoice this month"
              icon={Calculator}
            />
            <OwnerKpiCard
              label="Payment pending"
              value={formatCurrency(pendingTotal)}
              description={`${pending.length} ${pending.length === 1 ? "sale" : "sales"} not fully paid`}
              icon={Hourglass}
            />
          </section>

          <SalesToolbar
            search={search}
            onSearchChange={setSearch}
            store={storeFilter}
            onStoreChange={setStore}
            stores={data.stores}
            method={method}
            onMethodChange={setMethod}
            payment={payment}
            onPaymentChange={setPayment}
            period={period}
            onPeriodChange={setPeriod}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
        </>
      )}

      {/* Announces filter results without moving focus */}
      <p role="status" className="sr-only">
        {data && !loading ? `Showing ${filtered.length} of ${scoped.length} sales.` : ""}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <SalesTableSkeleton rows={SALES_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {sales.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No sales yet"
              description="Invoices created at the point of sale in any of your stores will show up here."
            >
              <button type="button" onClick={() => void load()} className={secondaryBtn}>
                Refresh
              </button>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No sales match your filters"
              description="Try a different invoice number or customer, or remove a filter."
            >
              <button type="button" onClick={clearFilters} className={secondaryBtn}>
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <>
              <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <SalesTable sales={rows} onView={setViewing} />
              </div>
              <Pagination
                page={currentPage}
                pageSize={SALES_PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
                disabled={refreshing}
                noun={filtered.length === 1 ? "sale" : "sales"}
              />
            </>
          )}
        </>
      )}

      <SaleDetailsDialog sale={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}