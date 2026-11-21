import { ChevronDown, Search, X } from "lucide-react";
import type { SaleStatusFilter } from "@/types/managerSales";
import type { PaymentFilter, PaymentMethodFilter, PeriodFilter } from "@/types/owner";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  status: SaleStatusFilter;
  onStatusChange: (v: SaleStatusFilter) => void;
  method: PaymentMethodFilter;
  onMethodChange: (v: PaymentMethodFilter) => void;
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

export default function ManagerSalesToolbar(p: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="manager-sale-search" className="sr-only">
          Search sales
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="manager-sale-search"
          type="search"
          value={p.search}
          onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="Search by invoice number or customer"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap xl:items-center">
        <FilterSelect
          id="manager-sale-status"
          label="Filter by sale status"
          value={p.status}
          onChange={(v) => p.onStatusChange(v as SaleStatusFilter)}
        >
          <option value="all">All sales</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
        </FilterSelect>

        <FilterSelect
          id="manager-sale-method"
          label="Filter by payment method"
          value={p.method}
          onChange={(v) => p.onMethodChange(v as PaymentMethodFilter)}
        >
          <option value="all">All payment methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
        </FilterSelect>

        <FilterSelect
          id="manager-sale-payment"
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
          id="manager-sale-period"
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