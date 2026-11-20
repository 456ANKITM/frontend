"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchX, UserPlus, Users } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import StaffTable, { StaffTableSkeleton } from "./StaffTable";
import StaffToolbar from "./StaffToolbar";
import InviteStaffDialog from "./InviteStaffDialog";
import ChangeStoreDialog from "./ChangeStoreDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchStaff, setStaffStatus } from "@/dummy/ownerStaff";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import type { AdminErrorKind } from "@/types/admin";
import type { StaffListData, StaffStatusFilter, StoreManager } from "@/types/owner";

const inviteBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

export default function StaffList() {
  const [data, setData] = useState<StaffListData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StaffStatusFilter>("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [changeTarget, setChangeTarget] = useState<StoreManager | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchStaff();
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

  // Auto-dismiss the message.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const staff = data?.staff ?? [];
  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || status !== "all";
  const visible = staff
    .filter((m) => status === "all" || m.status === status)
    .filter(
      (m) =>
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        (m.storeName ?? "").toLowerCase().includes(term),
    );

  const count = (s: StoreManager["status"]) => staff.filter((m) => m.status === s).length;

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const toggleAccess = async (m: StoreManager) => {
    const next = m.status === "active" ? "disabled" : "active";
    setTogglingId(m.id);
    try {
      await setStaffStatus(m.id, next);
      setNotice(`${m.name}'s access was ${next === "active" ? "enabled" : "disabled"}.`);
      await load();
    } catch {
      setNotice(`Couldn't update ${m.name}'s access. Please try again.`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleInvited = (m: StoreManager) => {
    setInviteOpen(false);
    clearFilters(); // make sure the new person is visible
    setNotice(`Invitation sent to ${m.email}.`);
    void load();
  };

  const handleStoreSaved = (m: StoreManager, storeId: string) => {
    setChangeTarget(null);
    const store = data?.stores.find((s) => s.id === storeId);
    setNotice(store ? `${m.name} now manages ${store.name}.` : `${m.name} is no longer assigned to a store.`);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Staff
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Invite Store Managers, assign them to stores and control who can sign in.
          </p>
          {data && staff.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {count("active")} active, {count("invited")} invited, {count("disabled")} disabled
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          <button type="button" onClick={() => setInviteOpen(true)} className={inviteBtn}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invite manager
          </button>
        </div>
      </div>

      {data && staff.length > 0 && (
        <StaffToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />
      )}

      {/* Announces action outcomes without moving focus */}
      <p
        role="status"
        className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}
      >
        {notice ?? (data && !loading ? `Showing ${visible.length} of ${staff.length} staff members.` : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <StaffTableSkeleton />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {staff.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Store Managers yet"
              description="Invite your first Store Manager so they can run a store day to day."
            >
              <button type="button" onClick={() => setInviteOpen(true)} className={`${inviteBtn} mt-5`}>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Invite manager
              </button>
            </EmptyState>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No staff match your filters"
              description="Try a different name, email or store, or remove a filter."
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
              <StaffTable
                staff={visible}
                togglingId={togglingId}
                onToggle={(m) => void toggleAccess(m)}
                onChangeStore={setChangeTarget}
              />
              <p className="mt-4 text-sm text-gray-600">
                Showing <span className="font-medium text-black">{visible.length}</span> of{" "}
                <span className="font-medium text-black">{staff.length}</span> staff{" "}
                {staff.length === 1 ? "member" : "members"}
              </p>
            </div>
          )}
        </>
      )}

      <InviteStaffDialog
        open={inviteOpen}
        stores={data?.stores ?? []}
        onClose={() => setInviteOpen(false)}
        onInvited={handleInvited}
      />
      <ChangeStoreDialog
        manager={changeTarget}
        stores={data?.stores ?? []}
        onClose={() => setChangeTarget(null)}
        onSaved={handleStoreSaved}
      />
    </div>
  );
}