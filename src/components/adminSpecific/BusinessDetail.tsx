"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, PauseCircle, SearchX } from "lucide-react";
import RefreshButton from "./RefreshButton";
import EmptyState from "./EmptyState";
import AdminErrorState from "./AdminErrorState";
import StatusBadge from "./StatusBadge";
import ConfirmStatusDialog from "./ConfirmStatusDialog";
import BusinessStoresCard from "./BusinessStoresCard";
import BusinessActivityLog from "./BusinessActivityLogs";
import { BusinessInfoCard, OwnerCard } from "./BusinessInfoPanels";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchBusinessDetail } from "@/dummy/adminBusinessDetail";
import { updateBusinessStatus } from "@/dummy/adminBusinesses";
import type { AdminErrorKind, BusinessDetailData } from "@/types/admin";

const BackLink = () => (
  <Link
    href="/admin/businesses"
    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 transition hover:text-black"
  >
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    Back to businesses
  </Link>
);

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" role="status" aria-label="Loading business details">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="h-64 rounded-xl border border-gray-300 bg-gray-100" />
          <div className="h-80 rounded-xl border border-gray-300 bg-gray-100" />
        </div>
        <div className="space-y-6">
          <div className="h-72 rounded-xl border border-gray-300 bg-gray-100" />
          <div className="h-52 rounded-xl border border-gray-300 bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function BusinessDetail({ id }: { id: string }) {
  const [data, setData] = useState<BusinessDetailData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const reqId = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchBusinessDetail(id);
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

  const closeDialog = () => {
    if (acting) return;
    setDialogOpen(false);
    setActionError(null);
  };

  const confirmToggle = async () => {
    if (!data) return;
    const { business } = data;
    const next = business.status === "suspended" ? "active" : "suspended";
    setActing(true);
    setActionError(null);
    try {
      await updateBusinessStatus(business.id, next);
      setNotice(`${business.name} was ${next === "active" ? "activated" : "suspended"}.`);
      setDialogOpen(false);
      await load();
    } catch {
      setActionError("Couldn't update this business. Check your connection and try again.");
    } finally {
      setActing(false);
    }
  };

  if (notFound) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState
          icon={SearchX}
          title="Business not found"
          description="This business may have been removed, or the link is incorrect."
        >
          <Link
            href="/admin/businesses"
            className="mt-5 inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
          >
            View all businesses
          </Link>
        </EmptyState>
      </div>
    );
  }

  const suspended = data?.business.status === "suspended";

  return (
    <div className="space-y-6">
      <BackLink />

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} />
      ) : loading || !data ? (
        <DetailSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
                  {data.business.name}
                </h1>
                <StatusBadge status={data.business.status} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                Owned by {data.business.ownerName}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <RefreshButton onClick={() => void load()} refreshing={refreshing} />
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setDialogOpen(true);
                }}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
                  suspended
                    ? "border-black bg-black text-white hover:bg-gray-800"
                    : "border-gray-300 bg-white text-black hover:border-black"
                }`}
              >
                {suspended ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PauseCircle className="h-4 w-4" aria-hidden="true" />
                )}
                {suspended ? "Activate business" : "Suspend business"}
              </button>
            </div>
          </div>

          {/* Announces action results and refreshes without moving focus */}
          <p
            role="status"
            className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}
          >
            {notice ?? (refreshing ? "Refreshing business details..." : "")}
          </p>

          {error && <AdminErrorState kind={error} onRetry={() => void load()} compact />}

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <BusinessStoresCard stores={data.stores} />
              <BusinessActivityLog entries={data.activity} />
            </div>
            <div className="space-y-6">
              <BusinessInfoCard data={data} />
              <OwnerCard data={data} />
            </div>
          </div>

          <ConfirmStatusDialog
            business={dialogOpen ? data.business : null}
            busy={acting}
            error={actionError}
            onConfirm={() => void confirmToggle()}
            onCancel={closeDialog}
          />
        </>
      )}
    </div>
  );
}