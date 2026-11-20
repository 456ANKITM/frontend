import { ChevronDown, Search, X } from "lucide-react";
import type { StaffStatusFilter } from "@/types/owner";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: StaffStatusFilter;
  onStatusChange: (v: StaffStatusFilter) => void;
  hasFilters: boolean;
  onClear: () => void;
};

export default function StaffToolbar({ search, onSearchChange, status, onStatusChange, hasFilters, onClear }: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="staff-search" className="sr-only">
          Search staff
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="staff-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email or store"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <label htmlFor="staff-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="staff-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StaffStatusFilter)}
            className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="disabled">Disabled</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}