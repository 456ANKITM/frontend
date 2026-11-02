"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, SearchX } from "lucide-react";
import RefreshButton from "./RefreshButton";
import EmptyState from "./EmptyState";
import AdminErrorState from "./AdminErrorState";
import BusinessFilters from "./BusinessFilters";
import BusinessesTable, { BusinessesTableSkeleton } from "./BusinessTable";
import Pagination from "@/components/common/Pagination";
import ConfirmStatusDialog from "./ConfirmStatusDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchBusinesses, updateBusinessStatus } from "@/dummy/adminBusinesses";
import { BUSINESSES_PAGE_SIZE } from "@/config/admin";
import type {
  AdminErrorKind,
  Business,
  BusinessListData,
  PlanFilter,
  StatusFilter,
} from "@/types/admin";

export default function BusinessesList() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value used for fetching
  const [status, setStatus] = useState<StatusFilter>("all");
  const [plan, setPlan] = useState<PlanFilter>("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<BusinessListData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [target, setTarget] = useState<Business | null>(null);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchBusinesses({ search, status, plan, page, pageSize: BUSINESSES_PAGE_SIZE });
      if (id !== requestId.current) return;
      // Current page became empty (e.g. last row moved out of the filter): step back.
      if (result.items.length === 0 && result.total > 0 && page > 1) {
        setPage(page - 1);
        return;
      }
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
  }, [search, status, plan, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Debounce the search box and go back to page 1 when the term changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Auto-dismiss the success message.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const hasFilters = search !== "" || searchInput !== "" || status !== "all" || plan !== "all";

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setPlan("all");
    setPage(1);
  };

  const openDialog = (business: Business) => {
    setActionError(null);
    setTarget(business);
  };

  const closeDialog = () => {
    if (acting) return;
    setTarget(null);
    setActionError(null);
  };

  const confirmToggle = async () => {
    if (!target) return;
    const next = target.status === "suspended" ? "active" : "suspended";
    setActing(true);
    setActionError(null);
    try {
      await updateBusinessStatus(target.id, next);
      setNotice(`${target.name} was ${next === "active" ? "activated" : "suspended"}.`);
      setTarget(null);
      await load();
    } catch {
      setActionError("Couldn't update this business. Check your connection and try again.");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Businesses
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Review every business on the platform and suspend or activate accounts.
          </p>
        </div>
        <RefreshButton onClick={() => void load()} refreshing={refreshing} />
      </div>

      <BusinessFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        plan={plan}
        onPlanChange={(v) => {
          setPlan(v);
          setPage(1);
        }}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {/* Announces results and action outcomes without moving focus */}
      <p role="status" className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}>
        {notice ?? (refreshing && data ? "Updating businesses..." : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} />
      ) : loading || !data ? (
        <BusinessesTableSkeleton rows={BUSINESSES_PAGE_SIZE} />
      ) : (
        <>
          {error && <AdminErrorState kind={error} onRetry={() => void load()} compact />}

          {data.items.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No businesses match your filters"
                description="Try a different name, owner or email, or remove a filter."
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
              <EmptyState
                icon={Building2}
                title="No businesses yet"
                description="Registered businesses will appear here once tenants join the platform."
              />
            )
          ) : (
            <>
              <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <BusinessesTable items={data.items} onToggleStatus={openDialog} />
              </div>
              <Pagination
                page={data.page}
                pageSize={data.pageSize}
                total={data.total}
                onPageChange={setPage}
                disabled={refreshing}
              />
            </>
          )}
        </>
      )}

      <ConfirmStatusDialog
        business={target}
        busy={acting}
        error={actionError}
        onConfirm={() => void confirmToggle()}
        onCancel={closeDialog}
      />
    </div>
  );
}