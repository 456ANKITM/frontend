import { ChevronDown, Search, X } from "lucide-react";
import type { StoreOption, SupplierBalanceFilter } from "@/types/owner";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  store: string;
  onStoreChange: (v: string) => void;
  stores: StoreOption[];
  balance: SupplierBalanceFilter;
  onBalanceChange: (v: SupplierBalanceFilter) => void;
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
  onChange: (v: string) => void;
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

export default function SuppliersToolbar(p: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="supplier-search" className="sr-only">
          Search suppliers
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="supplier-search"
          type="search"
          value={p.search}
          onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="Search by supplier, contact person, phone or email"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
        <FilterSelect
          id="supplier-store"
          label="Show purchases from store"
          value={p.store}
          onChange={p.onStoreChange}
        >
          <option value="all">Purchases from all stores</option>
          {p.stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="supplier-balance"
          label="Filter by payment due"
          value={p.balance}
          onChange={(v) => p.onBalanceChange(v as SupplierBalanceFilter)}
        >
          <option value="all">All suppliers</option>
          <option value="due">With payment due</option>
          <option value="clear">No payment due</option>
        </FilterSelect>

        {p.hasFilters && (
          <button
            type="button"
            onClick={p.onClear}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-black"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}