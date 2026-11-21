"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, ClipboardList, Hourglass, Plus, SearchX, Store, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "@/components/ownerSpecific/OwnerKpiCard";
import NewPurchaseDialog from "@/components/ownerSpecific/NewPurchaseDialog";
import PurchaseDetailsDialog from "@/components/ownerSpecific/PurchaseDetailsDialog";
import ManagerPurchasesToolbar from "./ManagerPurchasesToolbar";
import ManagerPurchasesTable, { ManagerPurchasesTableSkeleton } from "./ManagerPurchasesTable";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerPurchases } from "@/dummy/managerPurchases";
import { OWNER_ERROR_MESSAGES, PURCHASES_PAGE_SIZE } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { currentMonthLocal, daysAgoLocal } from "@/utils/localDate";
import type { AdminErrorKind } from "@/types/admin";
import type { ManagerPurchasesData } from "@/types/managerPurchases";
import type { PaymentFilter, PeriodFilter, Purchase } from "@/types/owner";

const newBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

const PERIOD_DAYS: Record<Exclude<PeriodFilter, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };

const sum = (list: Purchase[]) => list.reduce((s, p) => s + p.totalAmount, 0);

export default function ManagerPurchasesList() {
  const [data, setData] = useState<ManagerPurchasesData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("all");
  const [payment, setPayment] = useState<PaymentFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<Purchase | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchManagerPurchases();
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
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // Back to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, supplier, payment, period]);

  const store = data?.store ?? null;
  const purchases = data?.purchases ?? [];

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || supplier !== "all" || payment !== "all" || period !== "all";

  // Summary cards cover the whole store, so they stay meaningful while filtering.
  const month = currentMonthLocal();
  const spendThisMonth = sum(purchases.filter((p) => p.purchaseDate.startsWith(month)));
  const due = purchases.filter((p) => p.paymentStatus === "due");
  const partial = purchases.filter((p) => p.paymentStatus === "partial");

  const cutoff = period === "all" ? null : daysAgoLocal(PERIOD_DAYS[period]);
  const filtered = purchases
    .filter((p) => supplier === "all" || p.supplierId === supplier)
    .filter((p) => payment === "all" || p.paymentStatus === payment)
    .filter((p) => !cutoff || p.purchaseDate >= cutoff)
    .filter((p) => !term || p.referenceNo.toLowerCase().includes(term) || p.supplierName.toLowerCase().includes(term))
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate) || b.referenceNo.localeCompare(a.referenceNo));

  const pageCount = Math.max(1, Math.ceil(filtered.length / PURCHASES_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PURCHASES_PAGE_SIZE, currentPage * PURCHASES_PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setSupplier("all");
    setPayment("all");
    setPeriod("all");
  };

  const handleCreated = (purchase: Purchase) => {
    setDialogOpen(false);
    clearFilters(); // make sure the new purchase is visible
    setNotice(`${purchase.referenceNo} was recorded. Stock was added at ${purchase.storeName}.`);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Purchases
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store ? `Stock received from suppliers at ${store.name}.` : "Stock received from suppliers at your store."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          {(!data || store) && (
            <button type="button" onClick={() => setDialogOpen(true)} className={newBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New purchase
            </button>
          )}
        </div>
      </div>

      {data && store && purchases.length > 0 && (
        <>
          <section aria-label="Purchases summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard
              label="Purchases"
              value={String(purchases.length)}
              description="Recorded at your store"
              icon={ClipboardList}
            />
            <OwnerKpiCard
              label="Spend this month"
              value={formatCurrency(spendThisMonth)}
              description="Total cost of stock received"
              icon={Wallet}
            />
            <OwnerKpiCard
              label="Payment due"
              value={formatCurrency(sum(due))}
              description={`${due.length} unpaid ${due.length === 1 ? "purchase" : "purchases"}`}
              icon={Banknote}
            />
            <OwnerKpiCard
              label="Partially paid"
              value={String(partial.length)}
              description={`${formatCurrency(sum(partial))} total value`}
              icon={Hourglass}
            />
          </section>

          <ManagerPurchasesToolbar
            search={search}
            onSearchChange={setSearch}
            supplier={supplier}
            onSupplierChange={setSupplier}
            suppliers={data.suppliers}
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
        {notice ?? (data && store && !loading ? `Showing ${filtered.length} of ${purchases.length} purchases.` : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <ManagerPurchasesTableSkeleton rows={PURCHASES_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {!store ? (
            <EmptyState
              icon={Store}
              title="No store assigned yet"
              description="Your owner needs to assign you to a store before you can record purchases. Ask them to do it from the Staff page."
            />
          ) : purchases.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No purchases yet"
              description="Record your first purchase to add the stock you received from a supplier."
            >
              <button type="button" onClick={() => setDialogOpen(true)} className={`${newBtn} mt-5`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New purchase
              </button>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No purchases match your filters"
              description="Try a different reference or supplier, or remove a filter."
            >
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <>
              <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <ManagerPurchasesTable purchases={rows} onView={setViewing} />
              </div>
              <Pagination
                page={currentPage}
                pageSize={PURCHASES_PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
                disabled={refreshing}
                noun={filtered.length === 1 ? "purchase" : "purchases"}
              />
            </>
          )}
        </>
      )}

      {/* The Owner's dialog, limited to this manager's one store. */}
      <NewPurchaseDialog
        open={dialogOpen}
        stores={data?.stores ?? []}
        suppliers={data?.suppliers ?? []}
        products={data?.products ?? []}
        defaultStoreId={store?.id ?? ""}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
      <PurchaseDetailsDialog purchase={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}