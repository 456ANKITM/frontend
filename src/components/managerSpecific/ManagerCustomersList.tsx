"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, CalendarCheck, Plus, SearchX, Store, UserPlus, Users } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "@/components/ownerSpecific/OwnerKpiCard";
import ManagerCustomersToolbar from "./ManagerCustomersToolbar";
import ManagerCustomersTable, { ManagerCustomersTableSkeleton } from "./ManagerCustomersTable";
import AddCustomerDialog from "./AddCustomersDialog";
import CustomerDetailsDialog from "./CustomersDetailsDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerCustomers } from "@/dummy/managerCustomers";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { CUSTOMERS_PAGE_SIZE } from "@/config/managerCustomers";
import { customerKey, groupSalesByCustomer, toCustomerRow } from "@/utils/customers";
import { formatCurrency } from "@/utils/formatCurrency";
import { currentMonthLocal, daysAgoLocal } from "@/utils/localDate";
import type { AdminErrorKind } from "@/types/admin";
import type { Customer, CustomerBalanceFilter, CustomerRow, ManagerCustomersData } from "@/types/managerCustomers";

const addBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

export default function ManagerCustomersList() {
  const [data, setData] = useState<ManagerCustomersData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [balance, setBalance] = useState<CustomerBalanceFilter>("all");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchManagerCustomers();
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
  }, [search, balance]);

  const store = data?.store ?? null;
  const customers = data?.customers ?? [];

  const byCustomer = groupSalesByCustomer(data?.sales ?? []);
  const allRows: CustomerRow[] = customers
    .map((c) => toCustomerRow(c, byCustomer.get(customerKey(c.name)) ?? []))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Summary cards cover the whole store, so they stay meaningful while filtering.
  const month = currentMonthLocal();
  const cutoff = daysAgoLocal(90);
  const newThisMonth = customers.filter((c) => c.createdAt.startsWith(month)).length;
  const activeCount = allRows.filter((r) => r.lastPurchaseDate && r.lastPurchaseDate >= cutoff).length;
  const pendingTotal = allRows.reduce((s, r) => s + r.amountPending, 0);
  const owing = allRows.filter((r) => r.amountPending > 0).length;

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || balance !== "all";

  const filtered = allRows
    .filter((r) => balance === "all" || (balance === "pending" ? r.amountPending > 0 : r.amountPending === 0))
    .filter(
      (r) =>
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.phone.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term),
    );

  const pageCount = Math.max(1, Math.ceil(filtered.length / CUSTOMERS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * CUSTOMERS_PAGE_SIZE, currentPage * CUSTOMERS_PAGE_SIZE);

  const viewing = viewingId ? (allRows.find((r) => r.id === viewingId) ?? null) : null;
  const viewingSales = viewing ? (byCustomer.get(customerKey(viewing.name)) ?? []) : [];

  const clearFilters = () => {
    setSearch("");
    setBalance("all");
  };

  const handleCreated = (customer: Customer) => {
    setDialogOpen(false);
    clearFilters(); // make sure the new customer is visible
    setNotice(`${customer.name} was added to your customers.`);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Customers
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store ? `People who buy from ${store.name}, with their purchase history.` : "People who buy from your store."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          {(!data || store) && (
            <button type="button" onClick={() => setDialogOpen(true)} className={addBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add customer
            </button>
          )}
        </div>
      </div>

      {data && store && customers.length > 0 && (
        <>
          <section aria-label="Customers summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard label="Customers" value={String(customers.length)} description={`At ${store.name}`} icon={Users} />
            <OwnerKpiCard
              label="New this month"
              value={String(newThisMonth)}
              description="Added in the current month"
              icon={UserPlus}
            />
            <OwnerKpiCard
              label="Active customers"
              value={String(activeCount)}
              description="Bought in the last 90 days"
              icon={CalendarCheck}
            />
            <OwnerKpiCard
              label="Payment to collect"
              value={formatCurrency(pendingTotal)}
              description={`${owing} ${owing === 1 ? "customer" : "customers"} with unpaid sales`}
              icon={Banknote}
            />
          </section>

          <ManagerCustomersToolbar
            search={search}
            onSearchChange={setSearch}
            balance={balance}
            onBalanceChange={setBalance}
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
        {notice ?? (data && store && !loading ? `Showing ${filtered.length} of ${customers.length} customers.` : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <ManagerCustomersTableSkeleton rows={CUSTOMERS_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {!store ? (
            <EmptyState
              icon={Store}
              title="No store assigned yet"
              description="Your owner needs to assign you to a store before you can manage its customers. Ask them to do it from the Staff page."
            />
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add your first customer to keep their contact details and see what they buy."
            >
              <button type="button" onClick={() => setDialogOpen(true)} className={`${addBtn} mt-5`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add customer
              </button>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No customers match your filters"
              description="Try a different name, phone number or email, or remove a filter."
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
                <ManagerCustomersTable customers={rows} onView={(r) => setViewingId(r.id)} />
              </div>
              <Pagination
                page={currentPage}
                pageSize={CUSTOMERS_PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
                disabled={refreshing}
                noun={filtered.length === 1 ? "customer" : "customers"}
              />
            </>
          )}
        </>
      )}

      <AddCustomerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} />
      <CustomerDetailsDialog customer={viewing} sales={viewingSales} onClose={() => setViewingId(null)} />
    </div>
  );
}