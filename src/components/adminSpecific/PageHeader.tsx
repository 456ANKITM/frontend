import { ChevronDown } from "lucide-react";
import RefreshButton from "./RefreshButton";
import { RANGE_OPTIONS } from "@/config/admin";
import type { GrowthRange } from "@/types/admin";

type Props = {
  range: GrowthRange;
  onRangeChange: (range: GrowthRange) => void;
  onRefresh: () => void;
  refreshing: boolean;
  updatedAt: string | null;
};

export default function PageHeader({ range, onRangeChange, onRefresh, refreshing, updatedAt }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
          Platform Overview
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
          Monitor businesses, platform growth and account activity.
        </p>
        {updatedAt && (
          <p className="mt-1 text-xs text-gray-500">
            Last updated{" "}
            {new Date(updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative">
          <label htmlFor="range" className="sr-only">
            Time range
          </label>
          <select
            id="range"
            value={range}
            onChange={(e) => onRangeChange(e.target.value as GrowthRange)}
            className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
        </div>
        <RefreshButton onClick={onRefresh} refreshing={refreshing} />
      </div>
    </div>
  );
}