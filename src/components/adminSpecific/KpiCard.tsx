import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/utils/formatDate";

type Props = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

export default function KpiCard({ label, value, description, icon: Icon }: Props) {
  return (
    <article
      aria-label={`${label}: ${formatNumber(value)}`}
      className="rounded-2xl border border-gray-200 bg-white p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-600">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-black">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="font-display mt-3 text-4xl font-semibold tracking-tight text-black tabular-nums">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-[13px] text-gray-500">{description}</p>
    </article>
  );
}