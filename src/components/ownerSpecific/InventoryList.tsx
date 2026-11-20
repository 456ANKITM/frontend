"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Package, PackageSearch, PackageX, Plus, SearchX, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "./OwnerKpiCard";
import InventoryToolbar from "./InventoryToolbar";
import InventoryTable, { InventoryTableSkeleton } from "./InventoryTable";
import AddProductDialog from "./AddProductDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchInventory } from "@/dummy/ownerInventory";
import { INVENTORY_PAGE_SIZE, OWNER_ERROR_MESSAGES } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { getStockLevel } from "@/utils/stock";
import type { AdminErrorKind } from "@/types/admin";
import type { InventoryListData, Product, StockFilter } from "@/types/owner";

const addBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

type Props = {
  /** From `?store=<id>`; "all" when absent. Unknown ids fall back to "all". */
  initialStore?: string;
  /** From `?stock=low|out|in_stock`; "all" when absent. */
  initialStock?: StockFilter;
};

export default function InventoryList({ initialStore = "all", initialStock = "all" }: Props) {
  const [data, setData] = useState<InventoryListData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [store, setStore] = useState(initialStore);
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<StockFilter>(initialStock);
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchInventory();
      if (id !== requestId.current) return;
      setData(result);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof AdminApiError ? err.kind : "network");
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-dismiss the success message.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Back to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, store, category, stock]);

  const products = data?.products ?? [];
  // An unknown ?store= id (or a store that no longer exists) behaves like "all".
  const storeFilter = store === "all" || data?.stores.some((s) => s.id === store) ? store : "all";

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || storeFilter !== "all" || category !== "all" || stock !== "all";

  // Summary cards follow the store filter only, so they stay meaningful while searching.
  const scoped = products.filter((p) => storeFilter === "all" || p.storeId === storeFilter);
  const lowCount = scoped.filter((p) => getStockLevel(p) === "low").length;
  const outCount = scoped.filter((p) => getStockLevel(p) === "out").length;
  const stockValue = scoped.reduce((sum, p) => sum + p.costPrice * p.quantityInStock, 0);

  const filtered = scoped
    .filter((p) => category === "all" || p.category === category)
    .filter((p) => stock === "all" || getStockLevel(p) === stock)
    .filter((p) => !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));

  const pageCount = Math.max(1, Math.ceil(filtered.length / INVENTORY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * INVENTORY_PAGE_SIZE, currentPage * INVENTORY_PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setStore("all");
    setCategory("all");
    setStock("all");
  };

  const handleCreated = (product: Product) => {
    setDialogOpen(false);
    clearFilters(); // make sure the new product is visible
    setNotice(`${product.name} was added to ${product.storeName}.`);
    void load();
  };

  const scopeLabel = storeFilter === "all" ? "all stores" : (data?.stores.find((s) => s.id === storeFilter)?.name ?? "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Inventory
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            Products and stock levels across all your stores.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          <button type="button" onClick={() => setDialogOpen(true)} className={addBtn}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </button>
        </div>
      </div>

      {data && products.length > 0 && (
        <>
          <section aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard label="Products" value={String(scoped.length)} description={`In ${scopeLabel}`} icon={Package} />
            <OwnerKpiCard
              label="Low stock"
              value={String(lowCount)}
              description="At or below reorder level"
              icon={PackageSearch}
            />
            <OwnerKpiCard label="Out of stock" value={String(outCount)} description="Needs restocking now" icon={PackageX} />
            <OwnerKpiCard
              label="Stock value"
              value={formatCurrency(stockValue)}
              description="At cost price"
              icon={Wallet}
            />
          </section>

          <InventoryToolbar
            search={search}
            onSearchChange={setSearch}
            store={storeFilter}
            onStoreChange={setStore}
            stores={data.stores}
            category={category}
            onCategoryChange={setCategory}
            categories={data.categories}
            stock={stock}
            onStockChange={setStock}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
        </>
      )}

      {/* Announces action outcomes without moving focus */}
      <p
        role="status"
        className={notice ? "rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-black" : "sr-only"}
      >
        {notice ?? (data && !loading ? `Showing ${filtered.length} of ${scoped.length} products.` : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <InventoryTableSkeleton rows={INVENTORY_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add your first product to start tracking stock across your stores."
            >
              <button type="button" onClick={() => setDialogOpen(true)} className={`${addBtn} mt-5`}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add product
              </button>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No products match your filters"
              description="Try a different name or SKU, or remove a filter."
            >
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 h-10 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-black transition hover:border-black"
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <>
              <div aria-busy={refreshing} className={refreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <InventoryTable products={rows} />
              </div>
              <Pagination
                page={currentPage}
                pageSize={INVENTORY_PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
                disabled={refreshing}
                noun={filtered.length === 1 ? "product" : "products"}
              />
            </>
          )}
        </>
      )}

      <AddProductDialog
        open={dialogOpen}
        stores={data?.stores ?? []}
        categories={data?.categories ?? []}
        defaultStoreId={storeFilter === "all" ? "" : storeFilter}
        onClose={() => setDialogOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}