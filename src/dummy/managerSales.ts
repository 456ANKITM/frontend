import { AdminApiError } from "@/dummy/adminDashboard";
import { getCurrentManager } from "@/dummy/currentManager";
import { adjustProductStock } from "@/dummy/ownerInventory";
import { fetchSales } from "@/dummy/ownerSales";
import { findStore } from "@/dummy/ownerStores";
import { REFUND_NOTE_MAX } from "@/config/managerSales";
import { toLocalDay } from "@/utils/localDate";
import type { ManagerSale, ManagerSalesData, Refund, RefundSalePayload } from "@/types/managerSales";

type Scenario = "ok" | "no-store" | "forbidden" | "session" | "network";
// Change this to preview each state: "ok" | "no-store" | "forbidden" | "session" | "network"
const SCENARIO = "ok" as Scenario;
// Set to true to preview a failed refund in its dialog.
const FAIL_REFUND = false;

// Field errors are shown under the matching input; the message is shown for other failures.
export class ManagerSalesApiError extends Error {
  fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pad = (n: number) => String(n).padStart(2, "0");

// In-memory refunds so "Refund" visibly works while we are UI-only (resets on reload).
// TODO(integration): refunds belong on the sale itself (a refund record linked to the sale).
const REFUNDS = new Map<string, Refund>();

function ownStore() {
  const me = getCurrentManager();
  const store = me?.storeId ? findStore(me.storeId) : null;
  if (!me || !store) throw new ManagerSalesApiError("You are not assigned to a store yet.");
  return { me, store };
}

// TODO(integration): replace with GET /api/v1/sales (the backend takes the storeId from the token,
// so a manager only receives their own store's invoices). Search, payment method, payment status,
// date filters and pagination must happen on the backend.
// GET /api/v1/sales/:id gives the detail view, GET /api/v1/sales/:id/invoice the PDF invoice.
export async function fetchManagerSales(): Promise<ManagerSalesData> {
  if (SCENARIO === "forbidden" || SCENARIO === "session" || SCENARIO === "network") {
    await wait(600);
    throw new AdminApiError(SCENARIO);
  }

  const me = getCurrentManager();
  const store = SCENARIO === "no-store" || !me?.storeId ? null : findStore(me.storeId);
  if (!store) {
    await wait(600);
    return { store: null, sales: [] };
  }

  // Sales are read live, so a sale recorded in POS shows up here after the list reloads.
  const base = await fetchSales();
  return {
    store: { id: store.id, name: store.name, location: store.location },
    sales: base.sales
      .filter((s) => s.storeId === store.id)
      .map((s): ManagerSale => ({ ...s, refund: REFUNDS.get(s.id) ?? null })),
  };
}

// TODO(integration): replace with POST /api/v1/sales/:id/refund { reason, note }. The backend must
// check the sale belongs to the manager's store, refuse a second refund, work out the refund amount
// itself, and put the stock back, write the stockMovements entries and mark the sale refunded in
// one transaction. Decide whether refunds should have a time limit or need the Owner's approval.
export async function refundManagerSale(input: RefundSalePayload): Promise<ManagerSale> {
  await wait(800);
  if (FAIL_REFUND) throw new Error("Refund failed");

  const { me, store } = ownStore();
  const { sales } = await fetchSales();
  const sale = sales.find((s) => s.id === input.saleId && s.storeId === store.id);
  if (!sale) throw new ManagerSalesApiError("This sale is no longer in your store. Refresh and try again.");
  if (REFUNDS.has(sale.id)) throw new ManagerSalesApiError("This sale was already refunded.");

  const note = input.note.trim();
  if (input.reason === "other" && !note) {
    throw new ManagerSalesApiError("Note required", { note: "Add a short note to explain this refund." });
  }
  if (note.length > REFUND_NOTE_MAX) {
    throw new ManagerSalesApiError("Note too long", { note: `The note can be up to ${REFUND_NOTE_MAX} characters.` });
  }

  const now = new Date();
  const refund: Refund = {
    reason: input.reason,
    note,
    refundedBy: me.name,
    refundedAt: `${toLocalDay(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
    amount: sale.totalAmount,
  };

  sale.items.forEach((it) => adjustProductStock(it.productId, it.quantity)); // stock back in
  REFUNDS.set(sale.id, refund);
  return { ...sale, refund };
}