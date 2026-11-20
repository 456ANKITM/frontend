import { FileSpreadsheet, Printer, SearchX } from "lucide-react";
import OwnerKpiCard from "./OwnerKpiCard";
import ReportChartCard from "./ReportCharts";
import ReportTable from "./ReportTable";
import type { ReportResult } from "@/types/reports";

const outlineBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300";

type Props = { result: ReportResult; onExportCsv: () => void; onPrint: () => void };

export default function ReportView({ result, onExportCsv, onPrint }: Props) {
  const empty = result.rows.length === 0;

  return (
    <section aria-labelledby="report-title" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="report-title" className="text-lg font-semibold text-black">
            {result.title}
          </h2>
          <p className="mt-1 text-sm text-gray-600">{result.scope}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={onExportCsv} disabled={empty} className={outlineBtn}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
          <button type="button" onClick={onPrint} disabled={empty} className={outlineBtn}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print / save as PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {result.kpis.map((k) => (
          <OwnerKpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            description={k.description}
            icon={k.icon}
            textValue={k.textValue}
          />
        ))}
      </div>

      {empty ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-black">
            <SearchX className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-base font-semibold text-black">No data for this report</h3>
          <p className="mt-1.5 max-w-sm text-sm text-gray-600">
            There is nothing to show for these stores and dates. Try a longer date range or include more stores.
          </p>
        </div>
      ) : (
        <>
          {result.chart && <ReportChartCard chart={result.chart} />}
          <ReportTable result={result} />
        </>
      )}

      <p className="text-[13px] leading-relaxed text-gray-600">{result.note}</p>
    </section>
  );
}

export function ReportsSkeleton() {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div role="status" aria-label="Loading reports" className="space-y-6">
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5">
        <div className={`h-4 w-28 ${bar}`} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`h-20 rounded-xl ${bar}`} />
          ))}
        </div>
        <div className={`h-10 w-40 rounded-xl ${bar}`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`h-32 rounded-2xl ${bar}`} />
        ))}
      </div>
      <div className={`h-72 rounded-2xl ${bar}`} />
    </div>
  );
}