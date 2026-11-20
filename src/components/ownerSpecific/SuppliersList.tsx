"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, CalendarCheck, SearchX, Truck, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "./OwnerKpiCard";
import SuppliersToolbar from "./SuppliersToolbar";
import SuppliersTable, { SuppliersTableSkeleton } from "./SuppliersTable";
import SupplierDetailsDialog from "./SuppliersDetailsDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchSuppliers } from "@/dummy/ownerSuppliers";
import { OWNER_ERROR_MESSAGES, SUPPLIERS_PAGE_SIZE } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { currentMonthLocal, daysAgoLocal } from "@/utils/localDate";
import type { AdminErrorKind } from "@/types/admin";
import type { Purchase, SupplierBalanceFilter, SupplierRow, SuppliersListData } from "@/types/owner";

const secondaryBtn =
  "mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black";

const sumTotal = (list: Purchase[]) => list.reduce((s, p) => s + p.totalAmount, 0);

export default function SuppliersList() {
  const [data, setData] = useState<SuppliersListData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [store, setStore] = useState("all");
  const [balance, setBalance] = useState<SupplierBalanceFilter>("all");
  const [page, setPage] = useState(1);

  const [viewingId, setViewingId] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchSuppliers();
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
  }, [search, store, balance]);

  const suppliers = data?.suppliers ?? [];
  const stores = data?.stores ?? [];
  const storeFilter = store === "all" || stores.some((s) => s.id === store) ? store : "all";
  const scopeLabel = storeFilter === "all" ? null : (stores.find((s) => s.id === storeFilter)?.name ?? null);

  // Purchase figures follow the store filter; the directory itself always lists every supplier.
  const scoped = (data?.purchases ?? [])
    .filter((p) => storeFilter === "all" || p.storeId === storeFilter)
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate) || b.referenceNo.localeCompare(a.referenceNo));

  const bySupplier = new Map<string, Purchase[]>();
  for (const p of scoped) {
    const list = bySupplier.get(p.supplierId);
    if (list) list.push(p);
    else bySupplier.set(p.supplierId, [p]);
  }

  const supplierRows: SupplierRow[] = suppliers
    .map((s) => {
      const list = bySupplier.get(s.id) ?? [];
      return {
        ...s,
        purchaseCount: list.length,
        totalPurchased: sumTotal(list),
        amountDue: sumTotal(list.filter((p) => p.paymentStatus === "due")),
        lastPurchaseDate: list[0]?.purchaseDate ?? null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const month = currentMonthLocal();
  const spendThisMonth = sumTotal(scoped.filter((p) => p.purchaseDate.startsWith(month)));
  const totalDue = supplierRows.reduce((s, r) => s + r.amountDue, 0);
  const suppliersToPay = supplierRows.filter((r) => r.amountDue > 0).length;
  const cutoff = daysAgoLocal(90);
  const activeCount = supplierRows.filter((r) => r.lastPurchaseDate && r.lastPurchaseDate >= cutoff).length;

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || storeFilter !== "all" || balance !== "all";

  const filtered = supplierRows
    .filter((r) => balance === "all" || (balance === "due" ? r.amountDue > 0 : r.amountDue === 0))
    .filter(
      (r) =>
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.contactPerson.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.phone.toLowerCase().includes(term),
    );

  const pageCount = Math.max(1, Math.ceil(filtered.length / SUPPLIERS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * SUPPLIERS_PAGE_SIZE, currentPage * SUPPLIERS_PAGE_SIZE);

  const viewing = viewingId ? (supplierRows.find((r) => r.id === viewingId) ?? null) : null;
  const viewingPurchases = viewing ? (bySupplier.get(viewing.id) ?? []) : [];

  const clearFilters = () => {
    setSearch("");
    setStore("all");
    setBalance("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Suppliers
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            The people you buy stock from, with what you have bought and still owe.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
        </div>
      </div>

      {data && suppliers.length > 0 && (
        <>
          <section aria-label="Suppliers summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard
              label="Suppliers"
              value={String(suppliers.length)}
              description="In your directory"
              icon={Truck}
            />
            <OwnerKpiCard
              label="Spend this month"
              value={formatCurrency(spendThisMonth)}
              description="Bought from all suppliers"
              icon={Wallet}
            />
            <OwnerKpiCard
              label="Payment due"
              value={formatCurrency(totalDue)}
              description={`${suppliersToPay} ${suppliersToPay === 1 ? "supplier" : "suppliers"} to pay`}
              icon={Banknote}
            />
            <OwnerKpiCard
              label="Active suppliers"
              value={String(activeCount)}
              description="Bought from in the last 90 days"
              icon={CalendarCheck}
            />
          </section>

          <SuppliersToolbar
            search={search}
            onSearchChange={setSearch}
            store={storeFilter}
            onStoreChange={setStore}
            stores={stores}
            balance={balance}
            onBalanceChange={setBalance}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
        </>
      )}

      {/* Announces filter results without moving focus */}
      <p role="status" className="sr-only">
        {data && !loading ? `Showing ${filtered.length} of ${supplierRows.length} suppliers.` : ""}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <SuppliersTableSkeleton rows={SUPPLIERS_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {suppliers.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No suppliers yet"
              description="Suppliers you buy stock from will show up here, along with their purchase history."
            >
              <button type="button" onClick={() => void load()} className={secondaryBtn}>
                Refresh
              </button>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No suppliers match your filters"
              description="Try a different name or contact, or remove a filter."
            >
              <button type="button" onClick={clearFilters} className={secondaryBtn}>
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <>
              <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <SuppliersTable suppliers={rows} onView={(r) => setViewingId(r.id)} />
              </div>
              <Pagination
                page={currentPage}
                pageSize={SUPPLIERS_PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
                disabled={refreshing}
                noun={filtered.length === 1 ? "supplier" : "suppliers"}
              />
            </>
          )}
        </>
      )}

      <SupplierDetailsDialog
        supplier={viewing}
        purchases={viewingPurchases}
        scopeLabel={scopeLabel}
        onClose={() => setViewingId(null)}
      />
    </div>
  );
}