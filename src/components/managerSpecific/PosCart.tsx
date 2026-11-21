import { AlertCircle, Banknote, CreditCard, Loader2, Minus, Plus, ShoppingCart, Smartphone, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { PaymentMethod, PaymentStatus, Product } from "@/types/owner";
import type { DiscountType } from "@/types/pos";

export type CheckoutForm = {
  customer: string;
  discountType: DiscountType;
  discountValue: string;
  taxRate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountReceived: string;
};

export type CartRow = { product: Product; quantity: number };

type Props = {
  rows: CartRow[];
  form: CheckoutForm;
  onForm: (patch: Partial<CheckoutForm>) => void;
  customers: string[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  changeDue: number | null; // only for cash payments received above the total
  discountMessage: string | null;
  error: string | null;
  busy: boolean;
  onQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
};

const field =
  "h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-500 focus:border-black focus:ring-4 focus:ring-black/10";

const METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "online", label: "Online", icon: Smartphone },
];

export default function PosCart({
  rows, form, onForm, customers, subtotal, discount, tax, total, changeDue, discountMessage, error, busy,
  onQuantity, onRemove, onClear, onCheckout,
}: Props) {
  const itemCount = rows.reduce((n, r) => n + r.quantity, 0);
  const empty = rows.length === 0;
  const cash = form.paymentMethod === "cash" && form.paymentStatus === "paid";

  return (
    <section aria-labelledby="cart-title" className="rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-24">
      <div className="flex items-center justify-between gap-3">
        <h2 id="cart-title" className="text-[15px] font-semibold text-black">
          Current sale {itemCount > 0 && <span className="font-normal text-gray-600">({itemCount} {itemCount === 1 ? "item" : "items"})</span>}
        </h2>
        {!empty && (
          <button
            type="button"
            onClick={onClear}
            disabled={busy}
            className="text-sm font-medium text-gray-700 underline-offset-4 hover:text-black hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {empty ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
          <ShoppingCart className="h-6 w-6 text-gray-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-black">The cart is empty</p>
          <p className="mt-0.5 text-[13px] text-gray-600">Search or scan a product to start a sale.</p>
        </div>
      ) : (
        <ul className="mt-3 max-h-80 divide-y divide-gray-200 overflow-y-auto pr-1">
          {rows.map(({ product: p, quantity }) => (
            <li key={p.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black">{p.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(p.sellingPrice)} each</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-black">{formatCurrency(p.sellingPrice * quantity)}</p>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1" role="group" aria-label={`Quantity of ${p.name}`}>
                  <button
                    type="button"
                    onClick={() => onQuantity(p.id, quantity - 1)}
                    disabled={busy || quantity <= 1}
                    aria-label={`Decrease quantity of ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={p.quantityInStock}
                    value={quantity}
                    onChange={(e) => onQuantity(p.id, Number(e.target.value))}
                    disabled={busy}
                    aria-label={`Quantity of ${p.name}`}
                    className="h-8 w-14 rounded-lg border border-gray-300 text-center text-sm tabular-nums text-black outline-none focus:border-black focus:ring-4 focus:ring-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => onQuantity(p.id, quantity + 1)}
                    disabled={busy || quantity >= p.quantityInStock}
                    aria-label={`Increase quantity of ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-black outline-none transition hover:border-black focus-visible:ring-4 focus-visible:ring-black/20"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {quantity >= p.quantityInStock && <span className="text-xs text-gray-600">Max in stock</span>}
                  <button
                    type="button"
                    onClick={() => onRemove(p.id)}
                    disabled={busy}
                    aria-label={`Remove ${p.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 outline-none transition hover:bg-gray-100 hover:text-black focus-visible:ring-4 focus-visible:ring-black/20"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
        <div>
          <label htmlFor="pos-customer" className="mb-1.5 block text-sm font-medium text-black">
            Customer <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="pos-customer"
            list="pos-customers"
            value={form.customer}
            onChange={(e) => onForm({ customer: e.target.value })}
            placeholder="Walk-in customer"
            autoComplete="off"
            className={field}
          />
          <datalist id="pos-customers">
            {customers.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pos-discount" className="mb-1.5 block text-sm font-medium text-black">Discount</label>
            <div className="flex gap-2">
              <select
                aria-label="Discount type"
                value={form.discountType}
                onChange={(e) => onForm({ discountType: e.target.value as DiscountType })}
                className="h-10 w-16 shrink-0 rounded-xl border border-gray-300 bg-white px-2 text-sm text-black outline-none focus:border-black focus:ring-4 focus:ring-black/10"
              >
                <option value="amount">Rs</option>
                <option value="percent">%</option>
              </select>
              <input
                id="pos-discount"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={form.discountValue}
                onChange={(e) => onForm({ discountValue: e.target.value })}
                placeholder="0"
                aria-invalid={discountMessage ? true : undefined}
                aria-describedby={discountMessage ? "pos-discount-error" : undefined}
                className={`${field} min-w-0 ${discountMessage ? "border-black" : ""}`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="pos-tax" className="mb-1.5 block text-sm font-medium text-black">Tax rate (%)</label>
            <input
              id="pos-tax"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={form.taxRate}
              onChange={(e) => onForm({ taxRate: e.target.value })}
              className={field}
            />
          </div>
        </div>
        {discountMessage && (
          <p id="pos-discount-error" className="flex items-start gap-1.5 text-[13px] font-medium text-black">
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {discountMessage}
          </p>
        )}
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-gray-600">Subtotal</dt><dd className="tabular-nums text-black">{formatCurrency(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-gray-600">Discount</dt><dd className="tabular-nums text-black">{discount > 0 ? `- ${formatCurrency(discount)}` : formatCurrency(0)}</dd></div>
        <div className="flex justify-between"><dt className="text-gray-600">Tax</dt><dd className="tabular-nums text-black">{formatCurrency(tax)}</dd></div>
        <div className="flex items-baseline justify-between border-t border-gray-200 pt-2.5">
          <dt className="text-base font-semibold text-black">Total</dt>
          <dd className="text-xl font-semibold tabular-nums text-black" aria-live="polite">{formatCurrency(total)}</dd>
        </div>
      </dl>

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-sm font-medium text-black">Payment method</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
          {METHODS.map(({ value, label, icon: Icon }) => {
            const on = form.paymentMethod === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onForm({ paymentMethod: value })}
                disabled={busy}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border text-sm font-medium outline-none transition focus-visible:ring-4 focus-visible:ring-black/20 ${
                  on ? "border-black bg-black text-white" : "border-gray-300 bg-white text-black hover:border-black"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-3">
        <label htmlFor="pos-status" className="mb-1.5 block text-sm font-medium text-black">Payment status</label>
        <select
          id="pos-status"
          value={form.paymentStatus}
          onChange={(e) => onForm({ paymentStatus: e.target.value as PaymentStatus })}
          className={field}
        >
          <option value="paid">Paid in full</option>
          <option value="partial">Partially paid</option>
          <option value="due">Payment due</option>
        </select>
      </div>

      {cash && (
        <div className="mt-3">
          <label htmlFor="pos-received" className="mb-1.5 block text-sm font-medium text-black">
            Cash received <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="pos-received"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={form.amountReceived}
            onChange={(e) => onForm({ amountReceived: e.target.value })}
            placeholder={total > 0 ? String(total) : "0"}
            className={field}
          />
          {changeDue !== null && changeDue > 0 && (
            <p className="mt-1.5 text-sm font-medium text-black" aria-live="polite">
              Change to give back: {formatCurrency(changeDue)}
            </p>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-dashed border-gray-400 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onCheckout}
        disabled={busy || empty}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white outline-none transition-colors hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-black/20 focus-visible:ring-offset-2"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? "Recording sale..." : `Complete sale${empty ? "" : `, ${formatCurrency(total)}`}`}
      </button>
    </section>
  );
}