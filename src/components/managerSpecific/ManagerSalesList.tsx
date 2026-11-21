"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Hourglass, Receipt, RotateCcw, SearchX, Store, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "@/components/ownerSpecific/OwnerKpiCard";
import ManagerSalesToolbar from "./ManagerSalesToolbar";
import ManagerSalesTable, { ManagerSalesTableSkeleton } from "./ManagerSalesTable";
import ManagerSaleDetailsDialog from "./ManagerSaleDetailsDialog";
import RefundSaleDialog from "./RefundSaleDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerSales } from "@/dummy/managerSales";
import { OWNER_ERROR_MESSAGES, SALES_PAGE_SIZE } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { currentMonthLocal, dayOf, daysAgoLocal, todayLocal } from "@/utils/localDate";
import type { AdminErrorKind } from "@/types/admin";
import type { ManagerSale, ManagerSalesData, SaleStatusFilter } from "@/types/managerSales";
import type { PaymentFilter, PaymentMethodFilter, PeriodFilter } from "@/types/owner";

const PERIOD_DAYS: Record<Exclude<PeriodFilter, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };

const secondaryBtn =
  "mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black";

const total = (list: ManagerSale[]) => list.reduce((s, x) => s + x.totalAmount, 0);

export default function ManagerSalesList() {
  const [data, setData] = useState<ManagerSalesData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SaleStatusFilter>("all");
  const [method, setMethod] = useState<PaymentMethodFilter>("all");
  const [payment, setPayment] = useState<PaymentFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<ManagerSale | null>(null);
  const [refunding, setRefunding] = useState<ManagerSale | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchManagerSales();
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

  // Auto-dismiss the success message.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  // Back to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, status, method, payment, period]);

  const store = data?.store ?? null;
  const sales = data?.sales ?? [];

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || status !== "all" || method !== "all" || payment !== "all" || period !== "all";

  // Summary cards cover the whole store and leave refunded sales out of revenue.
  const today = todayLocal();
  const month = currentMonthLocal();
  const active = sales.filter((s) => !s.refund);
  const todaySales = active.filter((s) => dayOf(s.soldAt) === today);
  const monthSales = active.filter((s) => s.soldAt.startsWith(month));
  const refundsThisMonth = sales.filter((s) => s.refund && s.refund.refundedAt.startsWith(month));
  const refundedAmount = refundsThisMonth.reduce((sum, s) => sum + (s.refund?.amount ?? 0), 0);
  const pending = active.filter((s) => s.paymentStatus !== "paid");

  const cutoff = period === "all" ? null : daysAgoLocal(PERIOD_DAYS[period]);
  const filtered = sales
    .filter((s) => status === "all" || (status === "refunded" ? !!s.refund : !s.refund))
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
    setStatus("all");
    setMethod("all");
    setPayment("all");
    setPeriod("all");
  };

  const handleRefunded = (sale: ManagerSale) => {
    setRefunding(null);
    setNotice(`${sale.invoiceNo} was refunded. The items were returned to your stock.`);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">Sales</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store ? `Past invoices at ${store.name}, newest first.` : "Past invoices at your store."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
        </div>
      </div>

      {data && store && sales.length > 0 && (
        <>
          <section aria-label="Sales summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard
              label="Today's sales"
              value={formatCurrency(total(todaySales))}
              description={`${todaySales.length} ${todaySales.length === 1 ? "invoice" : "invoices"} today`}
              icon={Receipt}
            />
            <OwnerKpiCard
              label="Revenue this month"
              value={formatCurrency(total(monthSales))}
              description={`${monthSales.length} ${monthSales.length === 1 ? "sale" : "sales"}, refunds left out`}
              icon={Wallet}
            />
            <OwnerKpiCard
              label="Refunded this month"
              value={formatCurrency(refundedAmount)}
              description={`${refundsThisMonth.length} ${refundsThisMonth.length === 1 ? "refund" : "refunds"}`}
              icon={RotateCcw}
            />
            <OwnerKpiCard
              label="Payment pending"
              value={formatCurrency(total(pending))}
              description={`${pending.length} ${pending.length === 1 ? "sale" : "sales"} not fully paid`}
              icon={Hourglass}
            />
          </section>

          <ManagerSalesToolbar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
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

      {/* Announces action outcomes without moving focus */}
      <p
        role="status"
        className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}
      >
        {notice ?? (data && store && !loading ? `Showing ${filtered.length} of ${sales.length} sales.` : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <ManagerSalesTableSkeleton rows={SALES_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {!store ? (
            <EmptyState
              icon={Store}
              title="No store assigned yet"
              description="Your owner needs to assign you to a store before you can see its sales. Ask them to do it from the Staff page."
            />
          ) : sales.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No sales yet"
              description="Invoices you create at the point of sale will show up here."
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
                <ManagerSalesTable sales={rows} onView={setViewing} onRefund={setRefunding} />
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

      <ManagerSaleDetailsDialog
        sale={viewing}
        onClose={() => setViewing(null)}
        onRefund={(s) => {
          setViewing(null);
          setRefunding(s);
        }}
      />
      <RefundSaleDialog sale={refunding} onClose={() => setRefunding(null)} onRefunded={handleRefunded} />
    </div>
  );
}