"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, SearchX, Store } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import StoreCard, { StoreCardSkeleton } from "./StoresCard";
import StoresTable from "./StoresTable";
import StoresToolbar, { type StoresView } from "./StoresToolbar";
import AddStoreDialog from "./AddStoreDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchOwnerStores } from "@/dummy/ownerStores";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import type { AdminErrorKind } from "@/types/admin";
import type { OwnerStore, StoreStatusFilter } from "@/types/owner";

const addBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

export default function StoresList() {
  const [stores, setStores] = useState<OwnerStore[] | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StoreStatusFilter>("all");
  const [view, setView] = useState<StoresView>("cards");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchOwnerStores();
      if (id !== requestId.current) return;
      setStores(result);
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
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || status !== "all";
  const visible = (stores ?? [])
    .filter((s) => status === "all" || s.status === status)
    .filter(
      (s) =>
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.location.toLowerCase().includes(term) ||
        (s.managerName ?? "").toLowerCase().includes(term),
    );

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const handleCreated = (store: OwnerStore) => {
    setDialogOpen(false);
    clearFilters(); // make sure the new store is visible
    setNotice(`${store.name} was added.`);
    void load();
  };

  const openDialog = () => setDialogOpen(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Stores
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            See today&apos;s sales and stock alerts for every store in your business.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          <button type="button" onClick={openDialog} className={addBtn}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add store
          </button>
        </div>
      </div>

      {stores && stores.length > 0 && (
        <StoresToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          view={view}
          onViewChange={setView}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />
      )}

      {/* Announces results and action outcomes without moving focus */}
      <p
        role="status"
        className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}
      >
        {notice ??
          (stores && !loading ? `Showing ${visible.length} of ${stores.length} stores.` : "")}
      </p>

      {error && !stores ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !stores ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading stores">
          {Array.from({ length: 6 }, (_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {stores.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No stores yet"
              description="Add your first store to start recording sales and managing stock."
            >
              <button type="button" onClick={openDialog} className={`${addBtn} mt-5`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add store
              </button>
            </EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No stores match your filters"
              description="Try a different name, location or manager, or remove a filter."
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
            <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {view === "cards" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((s) => (
                    <StoreCard key={s.id} store={s} />
                  ))}
                </div>
              ) : (
                <StoresTable stores={visible} />
              )}
              <p className="mt-4 text-sm text-gray-600">
                Showing <span className="font-medium text-black">{visible.length}</span> of{" "}
                <span className="font-medium text-black">{stores.length}</span>{" "}
                {stores.length === 1 ? "store" : "stores"}
              </p>
            </div>
          )}
        </>
      )}

      <AddStoreDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} />
    </div>
  );
}