import type { KeyboardEvent, RefObject } from "react";
import { PackageSearch, ScanLine, SearchX } from "lucide-react";
import EmptyState from "@/components/adminSpecific/EmptyState";
import { formatCurrency } from "@/utils/formatCurrency";
import { getStockLevel } from "@/utils/stock";
import type { Product } from "@/types/owner";

type Props = {
  products: Product[]; // already filtered by the search text
  totalProducts: number;
  search: string;
  onSearchChange: (v: string) => void;
  onScanEnter: () => void; // Enter pressed in the search box (barcode scanners send Enter)
  inputRef: RefObject<HTMLInputElement | null>;
  inCart: Record<string, number>;
  onAdd: (p: Product) => void;
  note: string;
};

export default function PosProductPicker({
  products,
  totalProducts,
  search,
  onSearchChange,
  onScanEnter,
  inputRef,
  inCart,
  onAdd,
  note,
}: Props) {
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onScanEnter();
    }
    if (e.key === "Escape") onSearchChange("");
  };

  return (
    <section aria-label="Products">
      <div className="relative">
        <label htmlFor="pos-search" className="sr-only">
          Search products or scan a barcode
        </label>
        <ScanLine
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          id="pos-search"
          ref={inputRef}
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search by name or SKU, or scan a barcode"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10"
        />
      </div>
      <p className="mt-2 min-h-5 text-[13px] text-gray-600">
        {note || "Press Enter to add the matching product. Scanners type the code and press Enter for you."}
      </p>

      {totalProducts === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={PackageSearch}
            title="No products in your store yet"
            description="Add products to your store's inventory before you can sell them."
          />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={SearchX}
            title="No products match"
            description="Check the spelling or the code, or clear the search to see everything."
          >
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
            >
              Clear search
            </button>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const level = getStockLevel(p);
            const qty = inCart[p.id] ?? 0;
            const out = level === "out";
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onAdd(p)}
                  disabled={out}
                  aria-label={`Add ${p.name} to the sale. ${out ? "Out of stock." : `${p.quantityInStock} in stock.`}`}
                  className="flex h-full w-full flex-col rounded-xl border border-gray-300 bg-white p-4 text-left outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20 disabled:hover:border-gray-300"
                >
                  <span className="text-sm font-semibold text-black">{p.name}</span>
                  <span className="mt-0.5 text-xs text-gray-500">SKU {p.sku}</span>
                  <span className="mt-3 text-base font-semibold tabular-nums text-black">{formatCurrency(p.sellingPrice)}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span>{out ? "Out of stock" : level === "low" ? `Low: ${p.quantityInStock} ${p.unit} left` : `${p.quantityInStock} ${p.unit} in stock`}</span>
                    {qty > 0 && <span className="font-medium text-black">In sale: {qty}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}