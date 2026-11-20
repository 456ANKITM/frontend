import { ChevronDown, Search, X } from "lucide-react";
import type { PaymentFilter, PeriodFilter, StoreOption, SupplierOption } from "@/types/owner";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  store: string;
  onStoreChange: (v: string) => void;
  stores: StoreOption[];
  supplier: string;
  onSupplierChange: (v: string) => void;
  suppliers: SupplierOption[];
  payment: PaymentFilter;
  onPaymentChange: (v: PaymentFilter) => void;
  period: PeriodFilter;
  onPeriodChange: (v: PeriodFilter) => void;
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

export default function PurchasesToolbar(p: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="purchase-search" className="sr-only">
          Search purchases
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="purchase-search"
          type="search"
          value={p.search}
          onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="Search by reference or supplier"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
        <FilterSelect id="purchase-store" label="Filter by store" value={p.store} onChange={p.onStoreChange}>
          <option value="all">All stores</option>
          {p.stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect id="purchase-supplier" label="Filter by supplier" value={p.supplier} onChange={p.onSupplierChange}>
          <option value="all">All suppliers</option>
          {p.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="purchase-payment"
          label="Filter by payment status"
          value={p.payment}
          onChange={(v) => p.onPaymentChange(v as PaymentFilter)}
        >
          <option value="all">All payment statuses</option>
          <option value="paid">Paid</option>
          <option value="partial">Partially paid</option>
          <option value="due">Payment due</option>
        </FilterSelect>

        <FilterSelect
          id="purchase-period"
          label="Filter by date"
          value={p.period}
          onChange={(v) => p.onPeriodChange(v as PeriodFilter)}
        >
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
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