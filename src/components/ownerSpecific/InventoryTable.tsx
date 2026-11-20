import { CheckCircle2, PackageX, TriangleAlert } from "lucide-react";
import { STOCK_LABEL, getStockLevel } from "@/utils/stock";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Product, StockLevel } from "@/types/owner";

const TH = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

// Text + icon, never color alone.
export function StockBadge({ level }: { level: StockLevel }) {
  const cfg = {
    in_stock: { icon: CheckCircle2, cls: "border-gray-300 bg-white text-gray-900" },
    low: { icon: TriangleAlert, cls: "border-black bg-white text-black" },
    out: { icon: PackageX, cls: "border-black bg-black text-white" },
  }[level];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {STOCK_LABEL[level]}
    </span>
  );
}

export default function InventoryTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
      <table className="w-full min-w-[980px] text-sm">
        <caption className="sr-only">Products across your stores</caption>
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            <th scope="col" className={TH}>Product</th>
            <th scope="col" className={TH}>Store</th>
            <th scope="col" className={TH}>Category</th>
            <th scope="col" className={`${TH} text-right`}>In stock</th>
            <th scope="col" className={TH}>Stock level</th>
            <th scope="col" className={`${TH} text-right`}>Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-gray-50">
              <td className={TD}>
                <p className="font-medium text-black">{p.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">SKU {p.sku}</p>
              </td>
              <td className={`${TD} text-gray-900`}>{p.storeName}</td>
              <td className={`${TD} text-gray-700`}>{p.category || <span className="text-gray-500">Uncategorized</span>}</td>
              <td className={`${TD} text-right`}>
                <p className="font-medium tabular-nums text-black">
                  {p.quantityInStock} <span className="font-normal text-gray-600">{p.unit}</span>
                </p>
                <p className="mt-0.5 text-xs text-gray-500">Reorder at {p.reorderLevel}</p>
              </td>
              <td className={TD}>
                <StockBadge level={getStockLevel(p)} />
              </td>
              <td className={`${TD} text-right`}>
                <p className="font-medium tabular-nums text-black">{formatCurrency(p.sellingPrice)}</p>
                <p className="mt-0.5 text-xs text-gray-500">Cost {formatCurrency(p.costPrice)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InventoryTableSkeleton({ rows = 8 }: { rows?: number }) {
  const bar = "animate-pulse rounded bg-gray-200 motion-reduce:animate-none";
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white" role="status" aria-label="Loading products">
      <table className="w-full min-w-[980px] text-sm" aria-hidden="true">
        <thead className="border-b border-gray-300 bg-gray-50">
          <tr>
            {["Product", "Store", "Category", "In stock", "Stock level", "Price"].map((h) => (
              <th key={h} className={TH}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }, (_, i) => (
            <tr key={i}>
              <td className={TD}>
                <div className={`h-3.5 w-44 ${bar}`} />
                <div className={`mt-2 h-3 w-20 ${bar}`} />
              </td>
              <td className={TD}><div className={`h-3.5 w-32 ${bar}`} /></td>
              <td className={TD}><div className={`h-3.5 w-24 ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-16 ${bar}`} /></td>
              <td className={TD}><div className={`h-6 w-24 rounded-full ${bar}`} /></td>
              <td className={TD}><div className={`ml-auto h-3.5 w-20 ${bar}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}