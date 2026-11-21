"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import RefreshButton from "@/components/adminSpecific/RefreshButton";
import EmptyState from "@/components/adminSpecific/EmptyState";
import AdminErrorState from "@/components/adminSpecific/AdminErrorState";
import PosProductPicker from "./PosProductPicker";
import PosCart, { type CartRow, type CheckoutForm } from "./PosCart";
import PosInvoice from "./PosInvoice";
import { AdminApiError } from "@/dummy/adminDashboard";
import { completeSale, fetchPosData, PosApiError } from "@/dummy/ownerPos";
import { OWNER_ERROR_MESSAGES } from "@/config/owner";
import { calculateTotals, discountError, toNumber } from "@/utils/pos";
import type { AdminErrorKind } from "@/types/admin";
import type { Product, Sale } from "@/types/owner";
import type { CartLine, PosData } from "@/types/pos";

const blankForm = (taxRate: number): CheckoutForm => ({
  customer: "",
  discountType: "amount",
  discountValue: "",
  taxRate: String(taxRate),
  paymentMethod: "cash",
  paymentStatus: "paid",
  amountReceived: "",
});

export default function PosTerminal() {
  const [data, setData] = useState<PosData | null>(null);
  const [error, setError] = useState<AdminErrorKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [form, setForm] = useState<CheckoutForm>(blankForm(13));
  const [busy, setBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<{ sale: Sale; taxRate: number; received: number | null } | null>(null);

  const requestId = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (resetForm = false) => {
    const id = ++requestId.current; // ignore stale responses
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchPosData();
      if (id !== requestId.current) return;
      setData(result);
      if (resetForm) setForm(blankForm(result.defaultTaxRate));
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
    void load(true);
  }, [load]);

  // Ready to scan: focus the search box once the terminal is on screen.
  useEffect(() => {
    if (data?.store && !completed) searchRef.current?.focus();
  }, [data?.store, completed]);

  const products = useMemo(() => data?.products ?? [], [data]);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const rows: CartRow[] = lines.flatMap((l) => {
    const product = byId.get(l.productId);
    return product ? [{ product, quantity: l.quantity }] : [];
  });
  const inCart = Object.fromEntries(lines.map((l) => [l.productId, l.quantity]));

  const subtotal = rows.reduce((sum, r) => sum + r.product.sellingPrice * r.quantity, 0);
  const discountValue = toNumber(form.discountValue);
  const taxRate = toNumber(form.taxRate);
  const discountMessage = discountError(subtotal, form.discountType, discountValue);
  const taxMessage = taxRate < 0 || taxRate > 100 ? "The tax rate must be between 0 and 100." : null;
  const { discount, tax, total } = calculateTotals(subtotal, form.discountType, discountValue, taxRate);

  const receivedText = form.amountReceived.trim();
  const received = receivedText === "" ? null : toNumber(receivedText);
  const cash = form.paymentMethod === "cash" && form.paymentStatus === "paid";
  const changeDue = cash && received !== null ? Math.max(0, received - total) : null;

  const term = search.trim().toLowerCase();
  const visible = term
    ? products.filter((p) => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term))
    : products;

  const addProduct = (p: Product) => {
    const current = lines.find((l) => l.productId === p.id)?.quantity ?? 0;
    if (p.quantityInStock <= 0) return setNote(`${p.name} is out of stock.`);
    if (current >= p.quantityInStock) return setNote(`Only ${p.quantityInStock} ${p.name} in stock.`);
    setLines((prev) =>
      current === 0
        ? [...prev, { productId: p.id, quantity: 1 }]
        : prev.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l)),
    );
    setNote(`Added ${p.name}.`);
    setCheckoutError(null);
  };

  // A scanner types the code and presses Enter: add the exact SKU match, or the only match left.
  const handleScan = () => {
    if (!term) return;
    const exact = products.find((p) => p.sku.toLowerCase() === term);
    const target = exact ?? (visible.length === 1 ? visible[0] : null);
    if (!target) {
      setNote(visible.length === 0 ? `No product found for "${search.trim()}".` : "More than one product matches. Pick one from the list.");
      return;
    }
    addProduct(target);
    setSearch("");
    searchRef.current?.focus();
  };

  const setQuantity = (productId: string, quantity: number) => {
    const p = byId.get(productId);
    if (!p || !Number.isFinite(quantity)) return;
    const q = Math.min(Math.max(Math.round(quantity), 1), p.quantityInStock);
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)));
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
    searchRef.current?.focus();
  };

  const clearSale = () => {
    setLines([]);
    setCheckoutError(null);
    setNote("Sale cleared.");
    searchRef.current?.focus();
  };

  const checkout = async () => {
    if (!data?.store || busy) return;
    setCheckoutError(null);

    if (rows.length === 0) return setCheckoutError("Add at least one product to the sale.");
    if (discountMessage) return setCheckoutError(discountMessage);
    if (taxMessage) return setCheckoutError(taxMessage);
    if (form.paymentStatus !== "paid" && form.customer.trim() === "") {
      return setCheckoutError("Add the customer's name for a sale that isn't paid in full.");
    }
    if (cash && received !== null && received < total) {
      return setCheckoutError("The cash received is less than the total. Change the payment status or the amount.");
    }

    setBusy(true);
    try {
      const sale = await completeSale({
        storeId: data.store.id,
        customerName: form.customer,
        items: lines,
        discountType: form.discountType,
        discountValue,
        taxRate,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
      });
      setCompleted({ sale, taxRate, received: cash ? received : null });
      void load(); // refresh stock levels for the next sale
    } catch (err) {
      setCheckoutError(
        err instanceof PosApiError ? err.message : "Couldn't record the sale. Check your connection and try again.",
      );
      if (err instanceof PosApiError) void load(); // stock may have changed
    } finally {
      setBusy(false);
    }
  };

  const newSale = () => {
    setCompleted(null);
    setLines([]);
    setSearch("");
    setNote("");
    setCheckoutError(null);
    setForm(blankForm(data?.defaultTaxRate ?? 13));
  };

  const store = data?.store;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-black">
            New sale
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            {store ? `Recording sales for ${store.name}.` : "Search or scan products, set payment and print the invoice."}
          </p>
        </div>
        {!completed && <RefreshButton onClick={() => void load()} refreshing={refreshing} />}
      </div>

      {/* Announces cart changes without moving focus */}
      <p role="status" className="sr-only">
        {note}
      </p>

      {error && !data ? (
        <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} />
      ) : loading || !data ? (
        <div className="grid gap-6 xl:grid-cols-3" role="status" aria-label="Loading the sales terminal">
          <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 motion-reduce:animate-none xl:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 motion-reduce:animate-none" />
        </div>
      ) : !store ? (
        <EmptyState
          icon={Store}
          title="No store assigned yet"
          description="Your owner needs to assign you to a store before you can record sales. Ask them to do it from the Staff page."
        />
      ) : completed ? (
        <PosInvoice
          sale={completed.sale}
          store={store}
          taxRate={completed.taxRate}
          amountReceived={completed.received}
          onNewSale={newSale}
        />
      ) : (
        <>
          {error && (
            <AdminErrorState kind={error} onRetry={() => void load()} messages={OWNER_ERROR_MESSAGES} compact />
          )}
          <div className="grid items-start gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <PosProductPicker
                products={visible}
                totalProducts={products.length}
                search={search}
                onSearchChange={(v) => {
                  setSearch(v);
                  setNote("");
                }}
                onScanEnter={handleScan}
                inputRef={searchRef}
                inCart={inCart}
                onAdd={addProduct}
                note={note}
              />
            </div>
            <PosCart
              rows={rows}
              form={form}
              onForm={(patch) => {
                setForm((f) => ({ ...f, ...patch }));
                setCheckoutError(null);
              }}
              customers={data.customers}
              subtotal={subtotal}
              discount={discount}
              tax={tax}
              total={total}
              changeDue={changeDue}
              discountMessage={discountMessage}
              error={checkoutError}
              busy={busy}
              onQuantity={setQuantity}
              onRemove={removeLine}
              onClear={clearSale}
              onCheckout={() => void checkout()}
            />
          </div>
        </>
      )}

      {!completed && store && (
        <p className="text-xs text-gray-500">
          Need to look up a past invoice? Open <Link href="/sales" className="font-medium text-black underline underline-offset-4">Sales</Link>.
        </p>
      )}
    </div>
  );
}