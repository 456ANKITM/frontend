"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Package, PackageSearch, PackageX, Plus, SearchX, Store, Wallet } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import Pagination from "@/components/common/Pagination";
import OwnerKpiCard from "@/components/ownerSpecific/OwnerKpiCard";
import ManagerInventoryToolbar from "./ManagerInventoryToolbar";
import ManagerInventoryTable, { ManagerInventoryTableSkeleton } from "./ManagerInventoryTable";
import ProductFormDialog, { type ProductDialogTarget } from "./ProductFormDialog";
import AdjustStockDialog from "./AdjustStockDialog";
import { AdminApiError } from "@/dummy/adminDashboard";
import { fetchManagerInventory } from "@/dummy/managerInventory";
import { INVENTORY_PAGE_SIZE, OWNER_ERROR_MESSAGES } from "@/config/owner";
import { formatCurrency } from "@/utils/formatCurrency";
import { getStockLevel } from "@/utils/stock";
import type { AdminErrorKind } from "@/types/admin";
import type { ManagerInventoryData } from "@/types/managerInventory";
import type { Product, StockFilter } from "@/types/owner";

const addBtn =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2";

type Props = {
  /** From `?stock=low|out|in_stock`; "all" when absent. */
  initialStock?: StockFilter;
};

export default function ManagerInventoryList({ initialStock = "all" }: Props) {
  const [data, setData] = useState<ManagerInventoryData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState<StockFilter>(initialStock);
  const [page, setPage] = useState(1);

  const [productDialog, setProductDialog] = useState<ProductDialogTarget | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchManagerInventory();
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
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // Back to the first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, category, stock]);

  const store = data?.store ?? null;
  const products = data?.products ?? [];

  const lowCount = products.filter((p) => getStockLevel(p) === "low").length;
  const outCount = products.filter((p) => getStockLevel(p) === "out").length;
  const stockValue = products.reduce((sum, p) => sum + p.costPrice * p.quantityInStock, 0);

  const term = search.trim().toLowerCase();
  const hasFilters = term !== "" || category !== "all" || stock !== "all";

  const filtered = products
    .filter((p) => category === "all" || p.category === category)
    .filter((p) => stock === "all" || getStockLevel(p) === stock)
    .filter((p) => !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));

  const pageCount = Math.max(1, Math.ceil(filtered.length / INVENTORY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * INVENTORY_PAGE_SIZE, currentPage * INVENTORY_PAGE_SIZE);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStock("all");
  };

  const handleSaved = (product: Product, mode: "add" | "edit") => {
    setProductDialog(null);
    if (mode === "add") clearFilters(); // make sure the new product is visible
    setNotice(mode === "add" ? `${product.name} was added to your store.` : `${product.name} was updated.`);
    void load();
  };

  const handleAdjusted = (product: Product) => {
    setAdjusting(null);
    setNotice(`${product.name}: stock is now ${product.quantityInStock} ${product.unit}.`);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            Inventory
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store ? `Products and stock levels at ${store.name}.` : "Products and stock levels for your store."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshButton onClick={() => void load()} refreshing={refreshing} />
          {(!data || store) && (
            <button type="button" onClick={() => setProductDialog({ mode: "add" })} className={addBtn}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add product
            </button>
          )}
        </div>
      </div>

      {data && store && products.length > 0 && (
        <>
          <section aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OwnerKpiCard label="Products" value={String(products.length)} description={`In ${store.name}`} icon={Package} />
            <OwnerKpiCard label="Low stock" value={String(lowCount)} description="At or below reorder level" icon={PackageSearch} />
            <OwnerKpiCard label="Out of stock" value={String(outCount)} description="Needs restocking now" icon={PackageX} />
            <OwnerKpiCard label="Stock value" value={formatCurrency(stockValue)} description="At cost price" icon={Wallet} />
          </section>

          <ManagerInventoryToolbar
            search={search}
            onSearchChange={setSearch}
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
        {notice ?? (data && store && !loading ? `Showing ${filtered.length} of ${products.length} products.` : "")}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <ManagerInventoryTableSkeleton rows={INVENTORY_PAGE_SIZE} />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}

          {!store ? (
            <EmptyState
              icon={Store}
              title="No store assigned yet"
              description="Your owner needs to assign you to a store before you can manage its inventory. Ask them to do it from the Staff page."
            />
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Add your first product to start tracking stock at your store."
            >
              <button type="button" onClick={() => setProductDialog({ mode: "add" })} className={`${addBtn} mt-5`}>
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
                <ManagerInventoryTable
                  products={rows}
                  onEdit={(p) => setProductDialog({ mode: "edit", product: p })}
                  onAdjust={setAdjusting}
                />
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

      <ProductFormDialog
        target={productDialog}
        categories={data?.categories ?? []}
        onClose={() => setProductDialog(null)}
        onSaved={handleSaved}
      />
      <AdjustStockDialog product={adjusting} onClose={() => setAdjusting(null)} onAdjusted={handleAdjusted} />
    </div>
  );
}