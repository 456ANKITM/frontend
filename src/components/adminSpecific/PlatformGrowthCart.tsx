import { BarChart3 } from "lucide-react";
import EmptyState from "./EmptyState";
import { RANGE_OPTIONS } from "@/config/admin";
import { formatNumber } from "@/utils/formatDate";
import type { GrowthPoint, GrowthRange } from "@/types/admin";

type Props = { points: GrowthPoint[]; range: GrowthRange };

export default function PlatformGrowthChart({ points, range }: Props) {
  const period = RANGE_OPTIONS.find((o) => o.value === range)?.period ?? "this period";
  const total = points.reduce((sum, p) => sum + p.count, 0);

  return (
    <section aria-labelledby="growth-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="growth-title" className="text-[15px] font-semibold text-black">
        Platform growth
      </h2>
      <p className="mt-0.5 text-[13px] text-gray-600">New businesses registered over time.</p>

      {total === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={BarChart3}
            title="No growth data yet"
            description="New registrations in this period will appear here."
            compact
          />
        </div>
      ) : (
        <Chart points={points} total={total} period={period} />
      )}
    </section>
  );
}

function Chart({ points, total, period }: { points: GrowthPoint[]; total: number; period: string }) {
  const max = Math.max(...points.map((p) => p.count), 1);
  const niceMax = Math.ceil(max / 4) * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => (niceMax / 4) * i);
  const labelStep = points.length >= 24 ? 4 : points.length >= 13 ? 2 : 1;
  const peak = points.reduce((a, b) => (b.count > a.count ? b : a), points[0]);

  return (
    <div>
      {/* Visible text summary (also read by screen readers) */}
      <p className="mt-4 text-sm text-gray-700">
        <span className="font-semibold text-black">{formatNumber(total)}</span> businesses registered in{" "}
        {period}. Busiest period: {peak.label} ({formatNumber(peak.count)}).
      </p>

      <div className="mt-5 flex gap-3">
        <div
          className="flex h-56 flex-col-reverse justify-between text-[11px] tabular-nums text-gray-500"
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <span key={t}>{t}</span>
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
                const noun = p.count === 1 ? "business" : "businesses";
                return (
                  <li key={`${p.label}-${i}`} className="group relative flex h-full flex-1 items-end">
                    <div
                      tabIndex={0}
                      role="img"
                      aria-label={`${p.label}: ${p.count} new ${noun}`}
                      style={{ height: `${(p.count / niceMax) * 100}%`, minHeight: p.count > 0 ? 3 : 0 }}
                      className={`peer w-full rounded-t-md outline-none transition-colors hover:bg-black focus-visible:bg-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                        isLast ? "bg-black" : "bg-gray-300"
                      }`}
                    />
                    <span
                      role="presentation"
                      className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black px-2.5 py-1.5 text-xs text-white group-hover:visible peer-focus-visible:visible"
                    >
                      {p.label}: <span className="font-semibold">{p.count}</span>
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
        <caption>New businesses registered over {period}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">New businesses</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p, i) => (
            <tr key={`${p.label}-${i}`}>
              <th scope="row">{p.label}</th>
              <td>{p.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}