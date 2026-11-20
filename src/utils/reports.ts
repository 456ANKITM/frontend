import {
  Boxes,
  Calculator,
  Coins,
  Hourglass,
  Package,
  Percent,
  Receipt,
  Store,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { REPORT_CHART_LIMIT, MAX_RANGE_DAYS } from "@/config/reports";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatNumber } from "@/utils/formatDate";
import { currentMonthLocal, dayOf, daysAgoLocal, formatDay, todayLocal, toLocalDay } from "@/utils/localDate";
import { getStockLevel } from "@/utils/stock";
import type { Product, Purchase, Sale, StoreOption } from "@/types/owner";
import type {
  FilterErrors,
  GroupBy,
  RangePreset,
  ReportCell,
  ReportFilters,
  ReportResult,
  ReportRow,
  ReportSource,
  ValueFormat,
} from "@/types/reports";

/* ---------- Display ---------- */

export function formatCell(value: ReportCell, format: ValueFormat): string {
  if (value === null || value === undefined || value === "") return "\u2014";
  if (typeof value === "string") return value;
  if (format === "currency") return formatCurrency(value);
  if (format === "percent") return `${value.toFixed(1)}%`;
  return formatNumber(value);
}

/* ---------- Dates (plain calendar days, no timezone shifting) ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const fromUtc = (dt: Date) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;

function addDays(day: string, n: number): string {
  const dt = parseDay(day);
  dt.setUTCDate(dt.getUTCDate() + n);
  return fromUtc(dt);
}

const daysBetween = (from: string, to: string) => Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000);

export function rangeForPreset(preset: Exclude<RangePreset, "custom">): { from: string; to: string } {
  const to = todayLocal();
  if (preset === "7d") return { from: daysAgoLocal(7), to };
  if (preset === "30d") return { from: daysAgoLocal(30), to };
  if (preset === "90d") return { from: daysAgoLocal(90), to };
  if (preset === "this_month") return { from: `${currentMonthLocal()}-01`, to };
  const now = new Date();
  return {
    from: toLocalDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    to: toLocalDay(new Date(now.getFullYear(), now.getMonth(), 0)),
  };
}

export function validateFilters(f: ReportFilters): FilterErrors {
  const errors: FilterErrors = {};
  if (f.type === "inventory_valuation") return errors; // not date based
  if (!f.from) errors.from = "Choose a start date.";
  if (!f.to) errors.to = "Choose an end date.";
  if (f.from && f.to) {
    if (f.from > f.to) errors.to = "The end date must be on or after the start date.";
    else if (f.to > todayLocal()) errors.to = "The end date can't be in the future.";
    else if (daysBetween(f.from, f.to) > MAX_RANGE_DAYS) errors.to = "Choose a range of up to one year.";
  }
  return errors;
}

function shortDay(day: string): string {
  return parseDay(day).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function bucketKey(day: string, g: GroupBy): string {
  if (g === "day") return day;
  if (g === "month") return day.slice(0, 7);
  const dow = (parseDay(day).getUTCDay() + 6) % 7; // weeks start on Monday
  return addDays(day, -dow);
}

function nextKey(key: string, g: GroupBy): string {
  if (g === "day") return addDays(key, 1);
  if (g === "week") return addDays(key, 7);
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m, 1)); // m is 1-based, so this is the next month
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}`;
}

function bucketLabel(key: string, g: GroupBy): string {
  if (g === "day") return shortDay(key);
  if (g === "week") return `Week of ${shortDay(key)}`;
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/* ---------- Helpers ---------- */

type Ctx = {
  source: ReportSource;
  f: ReportFilters;
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  scope: string;
  file: string;
};

const inScope = (ids: string[], storeId: string) => ids.length === 0 || ids.includes(storeId);
const sum = <T>(list: T[], pick: (t: T) => number) => list.reduce((s, t) => s + pick(t), 0);
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);
const avg = (total: number, count: number) => (count > 0 ? Math.round(total / count) : 0);

// Stores to list in per-store reports: the selected ones, or every store that had activity.
function storesInScope(stores: StoreOption[], ids: string[], active: Set<string>) {
  return stores.filter((s) => (ids.length > 0 ? ids.includes(s.id) : active.has(s.id)));
}

function scopeText(source: ReportSource, f: ReportFilters): string {
  const names =
    f.storeIds.length === 0
      ? "All stores"
      : f.storeIds.length === 1
        ? (source.stores.find((s) => s.id === f.storeIds[0])?.name ?? "1 store")
        : `${f.storeIds.length} stores`;
  const when = f.type === "inventory_valuation" ? "Stock levels as of today" : `${formatDay(f.from)} to ${formatDay(f.to)}`;
  return `${names} \u00b7 ${when}`;
}

/* ---------- Report builders ---------- */

function salesSummary(c: Ctx): ReportResult {
  const { sales, f } = c;
  type Bucket = { sales: number; revenue: number; discounts: number; tax: number };
  const buckets = new Map<string, Bucket>();

  // Every period in the range is listed, even the ones without sales.
  let key = bucketKey(f.from, f.groupBy);
  const last = bucketKey(f.to, f.groupBy);
  for (let i = 0; key <= last && i < 800; i++) {
    buckets.set(key, { sales: 0, revenue: 0, discounts: 0, tax: 0 });
    key = nextKey(key, f.groupBy);
  }
  for (const s of sales) {
    const b = buckets.get(bucketKey(dayOf(s.soldAt), f.groupBy));
    if (!b) continue;
    b.sales += 1;
    b.revenue += s.totalAmount;
    b.discounts += s.discount;
    b.tax += s.tax;
  }

  const entries = [...buckets.entries()];
  const revenue = sum(sales, (s) => s.totalAmount);
  const pending = sales.filter((s) => s.paymentStatus !== "paid");
  const unit = f.groupBy === "day" ? "day" : f.groupBy === "week" ? "week" : "month";

  return {
    type: "sales_summary",
    title: "Sales summary",
    scope: c.scope,
    fileName: `sales-summary-${c.file}`,
    kpis: [
      { label: "Revenue", value: formatCurrency(revenue), description: "Total of all invoices, tax included", icon: Wallet },
      { label: "Sales", value: formatNumber(sales.length), description: "Invoices in this period", icon: Receipt },
      { label: "Average sale", value: formatCurrency(avg(revenue, sales.length)), description: "Per invoice", icon: Calculator },
      {
        label: "Payment pending",
        value: formatCurrency(sum(pending, (s) => s.totalAmount)),
        description: `${pending.length} ${pending.length === 1 ? "sale" : "sales"} not fully paid`,
        icon: Hourglass,
      },
    ],
    chart: {
      kind: "columns",
      title: `Revenue per ${unit}`,
      format: "currency",
      points: entries.map(([k, b]) => ({ label: bucketLabel(k, f.groupBy), value: b.revenue })),
    },
    columns: [
      { key: "period", label: "Period", format: "text" },
      { key: "sales", label: "Sales", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "average", label: "Average sale", format: "currency" },
      { key: "discounts", label: "Discounts", format: "currency" },
      { key: "tax", label: "Tax", format: "currency" },
    ],
    rows: entries
      .map(([k, b]) => ({
        period: bucketLabel(k, f.groupBy),
        sales: b.sales,
        revenue: b.revenue,
        average: avg(b.revenue, b.sales),
        discounts: b.discounts,
        tax: b.tax,
      }))
      .reverse(), // newest first
    totals: {
      period: "Total",
      sales: sales.length,
      revenue,
      average: avg(revenue, sales.length),
      discounts: sum(sales, (s) => s.discount),
      tax: sum(sales, (s) => s.tax),
    },
    note: "Revenue includes tax. Sales are grouped by the day they were recorded. Weeks start on Monday.",
  };
}

function inventoryValuation(c: Ctx): ReportResult {
  const products = [...c.products].sort(
    (a, b) => b.quantityInStock * b.costPrice - a.quantityInStock * a.costPrice || a.name.localeCompare(b.name),
  );
  const cost = sum(products, (p) => p.quantityInStock * p.costPrice);
  const retail = sum(products, (p) => p.quantityInStock * p.sellingPrice);
  const low = products.filter((p) => getStockLevel(p) === "low").length;
  const out = products.filter((p) => getStockLevel(p) === "out").length;

  const byCategory = new Map<string, { cost: number; retail: number }>();
  for (const p of products) {
    const name = p.category || "Uncategorized";
    const entry = byCategory.get(name) ?? { cost: 0, retail: 0 };
    entry.cost += p.quantityInStock * p.costPrice;
    entry.retail += p.quantityInStock * p.sellingPrice;
    byCategory.set(name, entry);
  }

  return {
    type: "inventory_valuation",
    title: "Inventory valuation",
    scope: c.scope,
    fileName: `inventory-valuation-${todayLocal()}`,
    kpis: [
      { label: "Stock value (cost)", value: formatCurrency(cost), description: "Quantity in stock x cost price", icon: Boxes },
      { label: "Stock value (retail)", value: formatCurrency(retail), description: "Quantity in stock x selling price", icon: Coins },
      {
        label: "Potential margin",
        value: formatCurrency(retail - cost),
        description: `${pct(retail - cost, retail).toFixed(1)}% of retail value`,
        icon: Percent,
      },
      {
        label: "Products",
        value: formatNumber(products.length),
        description: `${low} low, ${out} out of stock`,
        icon: Package,
      },
    ],
    chart: {
      kind: "bars",
      title: "Stock value by category (cost)",
      format: "currency",
      items: [...byCategory.entries()]
        .sort((a, b) => b[1].cost - a[1].cost)
        .slice(0, REPORT_CHART_LIMIT)
        .map(([label, v]) => ({ label, value: v.cost, detail: `Retail value ${formatCurrency(v.retail)}` })),
    },
    columns: [
      { key: "product", label: "Product", format: "text" },
      { key: "sku", label: "SKU", format: "text" },
      { key: "store", label: "Store", format: "text" },
      { key: "category", label: "Category", format: "text" },
      { key: "stock", label: "In stock", format: "number" },
      { key: "unit", label: "Unit", format: "text" },
      { key: "costValue", label: "Value at cost", format: "currency" },
      { key: "retailValue", label: "Value at retail", format: "currency" },
    ],
    rows: products.map((p) => ({
      product: p.name,
      sku: p.sku,
      store: p.storeName,
      category: p.category || "Uncategorized",
      stock: p.quantityInStock,
      unit: p.unit,
      costValue: p.quantityInStock * p.costPrice,
      retailValue: p.quantityInStock * p.sellingPrice,
    })),
    totals: { product: "Total", sku: null, store: null, category: null, stock: null, unit: null, costValue: cost, retailValue: retail },
    note: "This report shows the stock you have today, so the date range doesn't apply. Products are sorted by value at cost.",
  };
}

function profitLoss(c: Ctx): ReportResult {
  const { sales, purchases, source, f } = c;
  const costOf = new Map(source.products.map((p) => [p.id, p.costPrice]));
  const active = new Set([...sales.map((s) => s.storeId), ...purchases.map((p) => p.storeId)]);

  const figures = (list: Sale[]) => {
    const revenue = sum(list, (s) => s.subtotal - s.discount);
    const cogs = sum(list, (s) => sum(s.items, (it) => it.quantity * (costOf.get(it.productId) ?? 0)));
    return { revenue, cogs, profit: revenue - cogs };
  };

  const rows = storesInScope(source.stores, f.storeIds, active).map((st) => {
    const x = figures(sales.filter((s) => s.storeId === st.id));
    return {
      store: st.name,
      revenue: x.revenue,
      cogs: x.cogs,
      profit: x.profit,
      margin: pct(x.profit, x.revenue),
      purchases: sum(purchases.filter((p) => p.storeId === st.id), (p) => p.totalAmount),
    };
  });

  const total = figures(sales);
  const stockBought = sum(purchases, (p) => p.totalAmount);

  return {
    type: "profit_loss",
    title: "Profit and loss",
    scope: c.scope,
    fileName: `profit-and-loss-${c.file}`,
    kpis: [
      { label: "Revenue", value: formatCurrency(total.revenue), description: "After discounts, before tax", icon: Wallet },
      { label: "Cost of goods sold", value: formatCurrency(total.cogs), description: "At current cost prices", icon: Package },
      { label: "Gross profit", value: formatCurrency(total.profit), description: "Revenue minus cost of goods", icon: TrendingUp },
      { label: "Gross margin", value: `${pct(total.profit, total.revenue).toFixed(1)}%`, description: "Share of revenue kept as profit", icon: Percent },
    ],
    chart: {
      kind: "bars",
      title: "Gross profit by store",
      format: "currency",
      items: [...rows]
        .sort((a, b) => b.profit - a.profit)
        .slice(0, REPORT_CHART_LIMIT)
        .map((r) => ({ label: r.store, value: r.profit, detail: `${r.margin.toFixed(1)}% margin` })),
    },
    columns: [
      { key: "store", label: "Store", format: "text" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "cogs", label: "Cost of goods", format: "currency" },
      { key: "profit", label: "Gross profit", format: "currency" },
      { key: "margin", label: "Margin", format: "percent" },
      { key: "purchases", label: "Stock purchased", format: "currency" },
    ],
    rows,
    totals: {
      store: "All selected stores",
      revenue: total.revenue,
      cogs: total.cogs,
      profit: total.profit,
      margin: pct(total.profit, total.revenue),
      purchases: stockBought,
    },
    note: "Gross profit only: running costs such as rent and salaries aren't tracked. Cost of goods uses each product's current cost price. Stock purchased is shown for reference and isn't subtracted.",
  };
}

function topProducts(c: Ctx): ReportResult {
  const { sales, f } = c;
  type Entry = { name: string; sku: string; unit: string; quantity: number; revenue: number; invoices: number };
  const map = new Map<string, Entry>();
  for (const s of sales) {
    const seen = new Set<string>();
    for (const it of s.items) {
      const entry = map.get(it.sku) ?? { name: it.productName, sku: it.sku, unit: it.unit, quantity: 0, revenue: 0, invoices: 0 };
      entry.quantity += it.quantity;
      entry.revenue += it.quantity * it.sellingPrice;
      if (!seen.has(it.sku)) {
        entry.invoices += 1;
        seen.add(it.sku);
      }
      map.set(it.sku, entry);
    }
  }

  const byRevenue = f.topBy === "revenue";
  const list = [...map.values()].sort(
    (a, b) => (byRevenue ? b.revenue - a.revenue : b.quantity - a.quantity) || a.name.localeCompare(b.name),
  );
  const top = list[0];

  return {
    type: "top_products",
    title: `Top products by ${byRevenue ? "revenue" : "quantity sold"}`,
    scope: c.scope,
    fileName: `top-products-${c.file}`,
    kpis: [
      { label: "Products sold", value: formatNumber(list.length), description: "Different products", icon: Package },
      { label: "Units sold", value: formatNumber(sum(list, (p) => p.quantity)), description: "Across all products", icon: Boxes },
      { label: "Product revenue", value: formatCurrency(sum(list, (p) => p.revenue)), description: "Before discounts and tax", icon: Wallet },
      {
        label: "Best seller",
        value: top ? top.name : "None",
        description: top ? (byRevenue ? formatCurrency(top.revenue) : `${formatNumber(top.quantity)} ${top.unit} sold`) : "No sales in this period",
        icon: Trophy,
        textValue: true,
      },
    ],
    chart: {
      kind: "bars",
      title: `Top ${Math.min(REPORT_CHART_LIMIT, list.length)} by ${byRevenue ? "revenue" : "quantity sold"}`,
      format: byRevenue ? "currency" : "number",
      items: list.slice(0, REPORT_CHART_LIMIT).map((p) => ({
        label: p.name,
        value: byRevenue ? p.revenue : p.quantity,
        detail: byRevenue ? `${formatNumber(p.quantity)} ${p.unit} sold` : `${formatCurrency(p.revenue)} revenue`,
      })),
    },
    columns: [
      { key: "rank", label: "Rank", format: "number" },
      { key: "product", label: "Product", format: "text" },
      { key: "sku", label: "SKU", format: "text" },
      { key: "quantity", label: "Quantity sold", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "sales", label: "Sales", format: "number" },
    ],
    rows: list.map((p, i) => ({ rank: i + 1, product: p.name, sku: p.sku, quantity: p.quantity, revenue: p.revenue, sales: p.invoices })),
    totals: null,
    note: "The same product sold in several stores is counted together. Revenue is quantity x selling price, before discounts and tax.",
  };
}

function storeComparison(c: Ctx): ReportResult {
  const { sales, purchases, source, f } = c;
  const active = new Set([...sales.map((s) => s.storeId), ...purchases.map((p) => p.storeId)]);
  const totalRevenue = sum(sales, (s) => s.totalAmount);

  const rows = storesInScope(source.stores, f.storeIds, active)
    .map((st) => {
      const list = sales.filter((s) => s.storeId === st.id);
      const revenue = sum(list, (s) => s.totalAmount);
      return {
        store: st.name,
        sales: list.length,
        revenue,
        average: avg(revenue, list.length),
        share: pct(revenue, totalRevenue),
        purchases: sum(purchases.filter((p) => p.storeId === st.id), (p) => p.totalAmount),
      };
    })
    .sort((a, b) => b.revenue - a.revenue || a.store.localeCompare(b.store));

  const top = rows[0];

  return {
    type: "store_comparison",
    title: "Store comparison",
    scope: c.scope,
    fileName: `store-comparison-${c.file}`,
    kpis: [
      { label: "Stores compared", value: String(rows.length), description: "Stores in this report", icon: Store },
      { label: "Total revenue", value: formatCurrency(totalRevenue), description: "Tax included", icon: Wallet },
      {
        label: "Top store",
        value: top && top.revenue > 0 ? top.store : "None",
        description: top && top.revenue > 0 ? `${top.share.toFixed(1)}% of revenue` : "No sales in this period",
        icon: Trophy,
        textValue: true,
      },
      { label: "Average per store", value: formatCurrency(avg(totalRevenue, rows.length)), description: "Revenue per store", icon: Calculator },
    ],
    chart: {
      kind: "bars",
      title: "Revenue by store",
      format: "currency",
      items: rows.slice(0, REPORT_CHART_LIMIT).map((r) => ({
        label: r.store,
        value: r.revenue,
        detail: `${r.share.toFixed(1)}% of revenue \u00b7 ${formatNumber(r.sales)} sales`,
      })),
    },
    columns: [
      { key: "store", label: "Store", format: "text" },
      { key: "sales", label: "Sales", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "average", label: "Average sale", format: "currency" },
      { key: "share", label: "Share of revenue", format: "percent" },
      { key: "purchases", label: "Stock purchased", format: "currency" },
    ],
    rows,
    totals: {
      store: "Total",
      sales: sales.length,
      revenue: totalRevenue,
      average: avg(totalRevenue, sales.length),
      share: totalRevenue > 0 ? 100 : 0,
      purchases: sum(purchases, (p) => p.totalAmount),
    },
    note: "Revenue includes tax. Stock purchased is the cost of purchases recorded in the same period.",
  };
}

function staffPerformance(c: Ctx): ReportResult {
  const { sales } = c;
  type Entry = { name: string; store: string; sales: number; items: number; revenue: number };
  const map = new Map<string, Entry>();
  for (const s of sales) {
    const key = `${s.soldBy}|${s.storeId}`;
    const entry = map.get(key) ?? { name: s.soldBy, store: s.storeName, sales: 0, items: 0, revenue: 0 };
    entry.sales += 1;
    entry.items += sum(s.items, (it) => it.quantity);
    entry.revenue += s.totalAmount;
    map.set(key, entry);
  }

  const list = [...map.values()].sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
  const revenue = sum(list, (e) => e.revenue);
  const top = list[0];

  return {
    type: "staff_performance",
    title: "Staff performance",
    scope: c.scope,
    fileName: `staff-performance-${c.file}`,
    kpis: [
      { label: "Staff with sales", value: String(list.length), description: "People who recorded sales", icon: Users },
      { label: "Total revenue", value: formatCurrency(revenue), description: "Tax included", icon: Wallet },
      {
        label: "Top performer",
        value: top ? top.name : "None",
        description: top ? `${formatCurrency(top.revenue)} at ${top.store}` : "No sales in this period",
        icon: Trophy,
        textValue: true,
      },
      { label: "Average per person", value: formatCurrency(avg(revenue, list.length)), description: "Revenue per person", icon: Calculator },
    ],
    chart: {
      kind: "bars",
      title: "Revenue by person",
      format: "currency",
      items: list.slice(0, REPORT_CHART_LIMIT).map((e) => ({
        label: e.name,
        value: e.revenue,
        detail: `${e.store} \u00b7 ${formatNumber(e.sales)} sales`,
      })),
    },
    columns: [
      { key: "staff", label: "Staff", format: "text" },
      { key: "store", label: "Store", format: "text" },
      { key: "sales", label: "Sales", format: "number" },
      { key: "items", label: "Items sold", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "average", label: "Average sale", format: "currency" },
    ],
    rows: list.map((e) => ({
      staff: e.name,
      store: e.store,
      sales: e.sales,
      items: e.items,
      revenue: e.revenue,
      average: avg(e.revenue, e.sales),
    })),
    totals: {
      staff: "Total",
      store: null,
      sales: sales.length,
      items: sum(list, (e) => e.items),
      revenue,
      average: avg(revenue, sales.length),
    },
    note: "Each sale is credited to the person who recorded it. Stores without a Store Manager show the Owner.",
  };
}

/* ---------- Entry point ---------- */

export function buildReport(source: ReportSource, f: ReportFilters): ReportResult {
  const inRange = (day: string) => day >= f.from && day <= f.to;
  const ctx: Ctx = {
    source,
    f,
    sales: source.sales.filter((s) => inScope(f.storeIds, s.storeId) && inRange(dayOf(s.soldAt))),
    purchases: source.purchases.filter((p) => inScope(f.storeIds, p.storeId) && inRange(p.purchaseDate)),
    products: source.products.filter((p) => inScope(f.storeIds, p.storeId)),
    scope: scopeText(source, f),
    file: `${f.from}_to_${f.to}`,
  };

  switch (f.type) {
    case "inventory_valuation":
      return inventoryValuation(ctx);
    case "profit_loss":
      return profitLoss(ctx);
    case "top_products":
      return topProducts(ctx);
    case "store_comparison":
      return storeComparison(ctx);
    case "staff_performance":
      return staffPerformance(ctx);
    default:
      return salesSummary(ctx);
  }
}

export type { ReportRow };