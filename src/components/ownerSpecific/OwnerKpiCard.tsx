import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  /** Percent change vs the comparison period; null = nothing to compare against. */
  change?: number | null;
  changeLabel?: string;
  /** Long text values (e.g. a store name) use a smaller size so they fit. */
  textValue?: boolean;
};

export default function OwnerKpiCard({ label, value, description, icon: Icon, change, changeLabel, textValue }: Props) {
  const showChange = change !== undefined && change !== null;
  const TrendIcon = !showChange ? Minus : change > 0.05 ? TrendingUp : change < -0.05 ? TrendingDown : Minus;

  return (
    <article aria-label={`${label}: ${value}`} className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-600">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-black">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>

      <p
        className={`font-display mt-3 font-semibold tracking-tight text-black tabular-nums ${
          textValue ? "truncate text-2xl leading-[2.25rem]" : "text-3xl leading-[2.25rem] xl:text-4xl"
        }`}
        title={textValue ? value : undefined}
      >
        {value}
      </p>

      {showChange ? (
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-700">
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-black">
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          {changeLabel}
        </p>
      ) : (
        <p className="mt-1 text-[13px] text-gray-500">{description}</p>
      )}
    </article>
  );
}