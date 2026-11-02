"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, CheckCircle2, Clock, PauseCircle } from "lucide-react";
import PageHeader from "./PageHeader";
import KpiCard from "./KpiCard";
import PlatformGrowthChart from "./PlatformGrowthCart";
import BusinessStatusOverview from "./BusinessStatusOverview";
import RecentBusinesses from "./RecentBusinesses";
import QuickActions from "./QuickActions";
import EmptyState from "./EmptyState";
import AdminErrorState from "./AdminErrorState";
import DashboardSkeleton from "./LoadingSkeleton";
import { AdminApiError, fetchAdminDashboard } from "@/dummy/adminDashboard";
import type { AdminErrorKind, DashboardData, GrowthRange } from "@/types/admin";

export default function AdminDashboard() {
  const [range, setRange] = useState<GrowthRange>("30d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (r: GrowthRange) => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchAdminDashboard(r);
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
    void load(range);
  }, [range, load]);

  const retry = () => void load(range);

  return (
    <div className="space-y-6">
      <PageHeader
        range={range}
        onRangeChange={setRange}
        onRefresh={retry}
        refreshing={refreshing}
        updatedAt={data?.updatedAt ?? null}
      />

      {/* Announces background refreshes without moving focus */}
      <p role="status" className="sr-only">
        {refreshing && data ? "Refreshing platform data..." : ""}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={retry} />
      ) : loading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          {error && <AdminErrorState kind={error} onRetry={retry} compact />}

          <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total businesses"
              value={data.summary.total}
              description="All registered tenants"
              icon={Building2}
            />
            <KpiCard
              label="Active businesses"
              value={data.summary.active}
              description="Currently active"
              icon={CheckCircle2}
            />
            <KpiCard
              label="Suspended businesses"
              value={data.summary.suspended}
              description="Access paused"
              icon={PauseCircle}
            />
            <KpiCard
              label="Trial businesses"
              value={data.summary.trial}
              description="Currently on trial"
              icon={Clock}
            />
          </section>

          {data.summary.total === 0 ? (
            <EmptyState
              icon={Building2}
              title="No businesses yet"
              description="Registered businesses will appear here once tenants join the platform."
            />
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <PlatformGrowthChart points={data.growth} range={range} />
                </div>
                <BusinessStatusOverview summary={data.summary} />
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <RecentBusinesses businesses={data.recent} />
                </div>
                <QuickActions />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}