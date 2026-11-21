"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Store } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import ReportView, { ReportsSkeleton } from "@/components/ownerSpecific/ReportView";
import ManagerReportBuilderForm from "./ManagerReportBuilderForm";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerReports } from "@/dummy/managerReports";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { downloadCsv, printReport } from "@/utils/exportReport";
import { buildReport, rangeForPreset, validateFilters } from "@/utils/reports";
import type { AdminErrorKind } from "@/types/admin";
import type { ManagerReportsData } from "@/types/managerReports";
import type { FilterErrors, ReportFilters } from "@/types/reports";

// storeIds stays empty here: the store is added when the report is built, from the manager's own store.
function defaultFilters(): ReportFilters {
  return {
    type: "sales_summary",
    storeIds: [],
    preset: "30d",
    ...rangeForPreset("30d"),
    groupBy: "day",
    topBy: "revenue",
  };
}

export default function ManagerReportsBuilder() {
  const [data, setData] = useState<ManagerReportsData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // `draft` is what the form shows; `applied` is what the report on screen was built from.
  const [initial] = useState(defaultFilters);
  const [draft, setDraft] = useState<ReportFilters>(initial);
  const [applied, setApplied] = useState<ReportFilters>(initial);
  const [errors, setErrors] = useState<FilterErrors>({});
  const [notice, setNotice] = useState("");

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchManagerReports();
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

  const store = data?.store ?? null;

  const result = useMemo(
    () => (data && store ? buildReport(data.source, { ...applied, storeIds: [store.id] }) : null),
    [data, store, applied],
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const src = data?.source;
  const hasData = !!src && src.sales.length + src.purchases.length + src.products.length > 0;

  const handleChange = (patch: Partial<ReportFilters>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors({});
  };

  const handleGenerate = () => {
    const found = validateFilters(draft);
    setErrors(found);
    if (found.from || found.to) return;
    setApplied(draft);
    setNotice("Report updated.");
  };

  const handleCsv = () => {
    if (!result) return;
    downloadCsv(result);
    setNotice(`${result.fileName}.csv was downloaded.`);
  };

  const handlePrint = () => {
    if (!result) return;
    printReport(result);
    setNotice("Print dialog opened. Choose Save as PDF to keep a copy.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">Reports</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store
              ? `Sales and stock reports for ${store.name}. Pick a report and the dates, then export it.`
              : "Sales and stock reports for your store."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
        </div>
      </div>

      {/* Announces outcomes without moving focus */}
      <p role="status" className="sr-only">
        {notice}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <ReportsSkeleton />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {!store ? (
            <EmptyState
              icon={Store}
              title="No store assigned yet"
              description="Your owner needs to assign you to a store before you can build its reports. Ask them to do it from the Staff page."
            />
          ) : !hasData ? (
            <EmptyState
              icon={BarChart3}
              title="Nothing to report yet"
              description="Reports are built from your store's sales, purchases and stock. Record some activity and they will show up here."
            >
              <button
                type="button"
                onClick={() => void load()}
                className="mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
              >
                Refresh
              </button>
            </EmptyState>
          ) : (
            <>
              <ManagerReportBuilderForm
                value={draft}
                storeName={store.name}
                errors={errors}
                dirty={dirty}
                onChange={handleChange}
                onSubmit={handleGenerate}
              />
              {result && (
                <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
                  <ReportView result={result} onExportCsv={handleCsv} onPrint={handlePrint} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}