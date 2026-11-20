"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart3 } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import ReportBuilderForm from "./ReportBuilderForm";
import ReportView, { ReportsSkeleton } from "./ReportView";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchReportSource } from "@/dummy/ownerReports";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { downloadCsv, printReport } from "@/utils/exportReport";
import { buildReport, rangeForPreset, validateFilters } from "@/utils/reports";
import type { AdminErrorKind } from "@/types/admin";
import type { FilterErrors, ReportFilters, ReportSource } from "@/types/reports";

function defaultFilters(initialStore: string): ReportFilters {
  return {
    type: "sales_summary",
    storeIds: initialStore === "all" ? [] : [initialStore],
    preset: "30d",
    ...rangeForPreset("30d"),
    groupBy: "day",
    topBy: "revenue",
  };
}

type Props = {
  /** From `?store=<id>`; "all" when absent. Unknown ids are ignored. */
  initialStore?: string;
};

export default function ReportsBuilder({ initialStore = "all" }: Props) {
  const [data, setData] = useState<ReportSource | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // `draft` is what the form shows; `applied` is what the report on screen was built from.
  const [initial] = useState(() => defaultFilters(initialStore));
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
      const result = await fetchReportSource();
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

  const stores = data?.stores ?? [];
  const validIds = useMemo(() => new Set(stores.map((s) => s.id)), [stores]);

  const result = useMemo(
    () =>
      data ? buildReport(data, { ...applied, storeIds: applied.storeIds.filter((id) => validIds.has(id)) }) : null,
    [data, applied, validIds],
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);
  const hasData = !!data && data.sales.length + data.purchases.length + data.products.length > 0;

  const handleChange = (patch: Partial<ReportFilters>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors({});
  };

  const handleGenerate = () => {
    const found = validateFilters(draft);
    setErrors(found);
    if (found.from || found.to) return;
    const next = { ...draft, storeIds: draft.storeIds.filter((id) => validIds.has(id)) };
    setDraft(next);
    setApplied(next);
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
            Pick a report, the stores and the dates, then generate charts and figures you can export.
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

          {!hasData ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-black">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-black">Nothing to report yet</h2>
              <p className="mt-1.5 max-w-sm text-sm text-gray-600">
                Reports are built from your sales, purchases and stock. Record some activity and they will show up here.
              </p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              <ReportBuilderForm
                value={draft}
                stores={stores}
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