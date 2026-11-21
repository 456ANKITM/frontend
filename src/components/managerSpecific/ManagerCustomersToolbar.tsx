import { ChevronDown, Search, X } from "lucide-react";
import type { CustomerBalanceFilter } from "@/types/managerCustomers";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  balance: CustomerBalanceFilter;
  onBalanceChange: (v: CustomerBalanceFilter) => void;
  hasFilters: boolean;
  onClear: () => void;
};

export default function ManagerCustomersToolbar(p: Props) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative flex-1">
        <label htmlFor="manager-customer-search" className="sr-only">
          Search customers
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="manager-customer-search"
          type="search"
          value={p.search}
          onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="Search by name, phone or email"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center">
        <div className="relative">
          <label htmlFor="manager-customer-balance" className="sr-only">
            Filter by payment pending
          </label>
          <select
            id="manager-customer-balance"
            value={p.balance}
            onChange={(e) => p.onBalanceChange(e.target.value as CustomerBalanceFilter)}
            className="h-10 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/10"
          >
            <option value="all">All customers</option>
            <option value="pending">With payment pending</option>
            <option value="clear">No payment pending</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden="true"
          />
        </div>

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