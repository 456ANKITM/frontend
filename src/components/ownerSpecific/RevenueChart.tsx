import { BarChart3 } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import { RANGE_OPTIONS } from "@/config/admin";
import { formatCompact, formatCompactCurrency, formatCurrency } from "@/utils/formatCurrency";
import type { GrowthRange } from "@/types/admin";
import type { RevenuePoint } from "@/types/owner";

type Props = { points: RevenuePoint[]; range: GrowthRange };

// Rounds up to a "nice" axis step (1, 2, 2.5, 5, 10 x 10^n) so ticks read cleanly.
function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * pow;
}

export default function RevenueChart({ points, range }: Props) {
  const period = RANGE_OPTIONS.find((o) => o.value === range)?.period ?? "this period";
  const total = points.reduce((sum, p) => sum + p.amount, 0);

  return (
    <section aria-labelledby="revenue-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="revenue-title" className="text-[15px] font-semibold text-black">
        Revenue
      </h2>
      <p className="mt-0.5 text-[13px] text-gray-600">Sales across all your stores over time.</p>

      {total === 0 ? (
        <div className="mt-4">
          <EmptyState
            compact
            icon={BarChart3}
            title="No sales in this period"
            description="Revenue from your stores will appear here once sales are recorded."
          />
        </div>
      ) : (
        <Chart points={points} total={total} period={period} />
      )}
    </section>
  );
}

function Chart({ points, total, period }: { points: RevenuePoint[]; total: number; period: string }) {
  const max = Math.max(...points.map((p) => p.amount), 1);
  const step = niceStep(max / 4);
  const niceMax = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => step * i);
  const labelStep = points.length >= 24 ? 4 : points.length >= 13 ? 2 : 1;
  const peak = points.reduce((a, b) => (b.amount > a.amount ? b : a), points[0]);

  return (
    <div>
      {/* Visible text summary (also read by screen readers) */}
      <p className="mt-4 text-sm text-gray-700">
        <span className="font-semibold text-black">{formatCurrency(total)}</span> in sales over {period}. Best
        period: {peak.label} ({formatCompactCurrency(peak.amount)}).
      </p>

      <div className="mt-5 flex gap-3">
        <div
          className="flex h-56 flex-col-reverse justify-between text-[11px] tabular-nums text-gray-500"
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <span key={t}>{formatCompact(t)}</span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-56">
            <div className="absolute inset-0 flex flex-col-reverse justify-between" aria-hidden="true">
              {ticks.map((t) => (
                <div key={t} className="border-t border-gray-100" />
              ))}
            </div>

            <ul className="relative flex h-full items-end gap-1 sm:gap-1.5">
              {points.map((p, i) => {
                const isLast = i === points.length - 1;
                return (
                  <li key={`${p.label}-${i}`} className="group relative flex h-full flex-1 items-end">
                    <div
                      tabIndex={0}
                      role="img"
                      aria-label={`${p.label}: ${formatCurrency(p.amount)}`}
                      style={{ height: `${(p.amount / niceMax) * 100}%`, minHeight: p.amount > 0 ? 3 : 0 }}
                      className={`peer w-full rounded-t-md outline-none transition-colors hover:bg-black focus-visible:bg-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                        isLast ? "bg-black" : "bg-gray-300"
                      }`}
                    />
                    <span
                      role="presentation"
                      className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2.5 py-1.5 text-xs text-white group-hover:visible peer-focus-visible:visible"
                    >
                      {p.label}: <span className="font-semibold">{formatCurrency(p.amount)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <ol className="mt-2 flex gap-1 sm:gap-1.5" aria-hidden="true">
            {points.map((p, i) => (
              <li key={`${p.label}-${i}`} className="min-w-0 flex-1 text-center text-[11px] text-gray-500">
                <span className="whitespace-nowrap">{i % labelStep === 0 ? p.label : ""}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Textual alternative for assistive tech */}
      <table className="sr-only">
        <caption>Sales over {period}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Sales</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={`${p.label}-${i}`}>
              <th scope="row">{p.label}</th>
              <td>{formatCurrency(p.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}