import StatusBadge from "./StatusBadge";
import { STATUS_LABEL, STATUS_ORDER } from "@/config/admin";
import { formatNumber } from "@/utils/formatDate";
import type { BusinessStatus, PlatformSummary } from "@/types/admin";

const SEGMENT: Record<BusinessStatus, string> = {
  active: "bg-black",
  trial: "bg-gray-500",
  suspended: "bg-gray-300",
};

export default function BusinessStatusOverview({ summary }: { summary: PlatformSummary }) {
  const percent = (n: number) => (summary.total ? Math.round((n / summary.total) * 100) : 0);
  const description = STATUS_ORDER.map(
    (s) => `${STATUS_LABEL[s]} ${formatNumber(summary[s])} (${percent(summary[s])}%)`,
  ).join(", ");

  return (
    <section aria-labelledby="status-title" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 id="status-title" className="text-[15px] font-semibold text-black">
        Business status
      </h2>
      <p className="mt-0.5 text-[13px] text-gray-600">How tenants are distributed right now.</p>

      <div
        role="img"
        aria-label={`Business status distribution: ${description}`}
        className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-gray-100"
      >
        {STATUS_ORDER.map((s) => (
          <div
            key={s}
            className={SEGMENT[s]}
            style={{ width: `${summary.total ? (summary[s] / summary.total) * 100 : 0}%` }}
          />
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${SEGMENT[s]}`} />
              <StatusBadge status={s} />
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold tabular-nums text-black">{formatNumber(summary[s])}</span>
              <span className="ml-2 tabular-nums">{percent(summary[s])}%</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}