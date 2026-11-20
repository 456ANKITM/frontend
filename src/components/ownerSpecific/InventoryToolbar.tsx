import { ChevronDown, Search, X } from "lucide-react";
import { STOCK_LABEL } from "@/utils/stock";
import type { StockFilter, StoreOption } from "@/types/owner";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  store: string; // "all" or a store id
  onStoreChange: (v: string) => void;
  stores: StoreOption[];
  category: string; // "all" or a category name
  onCategoryChange: (v: string) => void;
  categories: string[];
  stock: StockFilter;
  onStockChange: (v: StockFilter) => void;
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

export default function InventoryToolbar({
  search,
  onSearchChange,
  store,
  onStoreChange,
  stores,
  category,
  onCategoryChange,
  categories,
  stock,
  onStockChange,
  hasFilters,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative flex-1">
        <label htmlFor="inventory-search" className="sr-only">
          Search products
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="inventory-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by product name or SKU"
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:items-center">
        <FilterSelect id="inventory-store" label="Filter by store" value={store} onChange={onStoreChange}>
          <option value="all">All stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect id="inventory-category" label="Filter by category" value={category} onChange={onCategoryChange}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="inventory-stock"
          label="Filter by stock level"
          value={stock}
          onChange={(v) => onStockChange(v as StockFilter)}
        >
          <option value="all">All stock levels</option>
          {(Object.keys(STOCK_LABEL) as (keyof typeof STOCK_LABEL)[]).map((k) => (
            <option key={k} value={k}>
              {STOCK_LABEL[k]}
            </option>
          ))}
        </FilterSelect>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
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