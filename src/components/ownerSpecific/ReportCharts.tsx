import { formatCompactCurrency, formatCurrency } from "@/utils/formatCurrency";
import { formatNumber } from "@/utils/formatDate";
import type { ReportChart, ValueFormat } from "@/types/reports";

const full = (n: number, f: ValueFormat) => (f === "currency" ? formatCurrency(n) : formatNumber(n));
const compact = (n: number, f: ValueFormat) => (f === "currency" ? formatCompactCurrency(n) : formatNumber(n));

// Plain HTML and CSS, so no chart library is needed. The table below is the accessible version of the data.
function ColumnChart({ chart }: { chart: Extract<ReportChart, { kind: "columns" }> }) {
  const { points, format } = chart;
  const max = Math.max(0, ...points.map((p) => p.value));
  const total = points.reduce((s, p) => s + p.value, 0);
  const first = points[0]?.label;
  const middle = points.length > 2 ? points[Math.floor((points.length - 1) / 2)].label : null;
  const last = points.length > 1 ? points[points.length - 1].label : null;

  return (
    <div>
      <p className="text-[13px] text-gray-600">
        Highest: <span className="font-medium text-black">{compact(max, format)}</span> &middot; Total:{" "}
        <span className="font-medium text-black">{compact(total, format)}</span>
      </p>
      <div
        role="img"
        aria-label={`${chart.title}. ${points.length} periods, highest ${full(max, format)}. The table below has every figure.`}
        className="mt-3"
      >
        <div className="flex h-56 items-end gap-px border-b border-gray-300">
          {points.map((p, i) => (
            <div key={`${p.label}-${i}`} className="flex h-full min-w-0 flex-1 items-end">
              <div
                title={`${p.label}: ${full(p.value, format)}`}
                className="w-full rounded-t-sm bg-black"
                style={{ height: `${max > 0 && p.value > 0 ? Math.max((p.value / max) * 100, 2) : 0}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between gap-2 text-xs text-gray-500" aria-hidden="true">
          <span>{first}</span>
          {middle && <span>{middle}</span>}
          {last && <span>{last}</span>}
        </div>
      </div>
    </div>
  );
}

function BarList({ chart }: { chart: Extract<ReportChart, { kind: "bars" }> }) {
  const { items, format } = chart;
  const max = Math.max(0, ...items.map((i) => i.value));

  return (
    <ul className="space-y-4">
      {items.map((it, i) => (
        <li key={`${it.label}-${i}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-black">{it.label}</span>
            <span className="shrink-0 tabular-nums text-gray-900">{full(it.value, format)}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-gray-100" aria-hidden="true">
            <div
              className="h-2 rounded-full bg-black"
              style={{ width: `${max > 0 && it.value > 0 ? Math.max((it.value / max) * 100, 1.5) : 0}%` }}
            />
          </div>
          {it.detail && <p className="mt-1 text-xs text-gray-500">{it.detail}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function ReportChartCard({ chart }: { chart: ReportChart }) {
  return (
    <section aria-label={chart.title} className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-black">{chart.title}</h3>
      {chart.kind === "columns" ? <ColumnChart chart={chart} /> : <BarList chart={chart} />}
    </section>
  );
}