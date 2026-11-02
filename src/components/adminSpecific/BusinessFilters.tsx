import { ChevronDown, Search, X } from "lucide-react";
import { PLAN_LABEL, PLAN_ORDER, STATUS_LABEL, STATUS_ORDER } from "@/config/admin";
import type { PlanFilter, StatusFilter } from "@/types/admin";

type Props = {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  plan: PlanFilter;
  onPlanChange: (value: PlanFilter) => void;
  hasFilters: boolean;
  onClear: () => void;
};

const selectClass =
  "h-10 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10";

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        aria-hidden="true"
      />
    </div>
  );
}

export default function BusinessFilters({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  plan,
  onPlanChange,
  hasFilters,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="business-search" className="sr-only">
          Search businesses
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="business-search"
          type="search"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by business, owner or email"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
        <FilterSelect
          id="status-filter"
          label="Filter by status"
          value={status}
          onChange={(v) => onStatusChange(v as StatusFilter)}
        >
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="plan-filter"
          label="Filter by plan"
          value={plan}
          onChange={(v) => onPlanChange(v as PlanFilter)}
        >
          <option value="all">All plans</option>
          {PLAN_ORDER.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABEL[p]}
            </option>
          ))}
        </FilterSelect>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="col-span-2 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black sm:col-span-1"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}