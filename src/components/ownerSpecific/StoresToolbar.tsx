import { ChevronDown, LayoutGrid, List, Search, X } from "lucide-react";
import type { StoreStatusFilter } from "@/types/owner";

export type StoresView = "cards" | "table";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: StoreStatusFilter;
  onStatusChange: (v: StoreStatusFilter) => void;
  view: StoresView;
  onViewChange: (v: StoresView) => void;
  hasFilters: boolean;
  onClear: () => void;
};

const viewBtn = (active: boolean) =>
  `inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium outline-none transition focus-visible:ring-4 focus-visible:ring-black/20 ${
    active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100 hover:text-black"
  }`;

export default function StoresToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  view,
  onViewChange,
  hasFilters,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <label htmlFor="store-search" className="sr-only">
          Search stores
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="store-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by store name, location or manager"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <label htmlFor="store-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="store-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StoreStatusFilter)}
            className="h-10 appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
        </div>

        <div role="group" aria-label="Layout" className="flex items-center gap-1 rounded-xl border border-gray-300 bg-white p-1">
          <button type="button" aria-pressed={view === "cards"} onClick={() => onViewChange("cards")} className={viewBtn(view === "cards")}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Cards
          </button>
          <button type="button" aria-pressed={view === "table"} onClick={() => onViewChange("table")} className={viewBtn(view === "table")}>
            <List className="h-4 w-4" aria-hidden="true" />
            Table
          </button>
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