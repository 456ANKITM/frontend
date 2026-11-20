import { REPORT_TABLE_LIMIT } from "@/config/reports";
import { formatCell } from "@/utils/reports";
import type { ReportResult } from "@/types/reports";

const TH = "whitespace-nowrap px-4 py-3 text-xs font-semibold text-gray-600";
const TD = "px-4 py-3.5 align-middle";

export default function ReportTable({ result }: { result: ReportResult }) {
  const { columns, rows, totals } = result;
  const shown = rows.slice(0, REPORT_TABLE_LIMIT);
  const align = (format: string) => (format === "text" ? "text-left" : "text-right tabular-nums");

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-gray-300 bg-white">
        <table className="w-full text-sm" style={{ minWidth: columns.length * 130 }}>
          <caption className="sr-only">{result.title} data</caption>
          <thead className="border-b border-gray-300 bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`${TH} ${c.format === "text" ? "text-left" : "text-right"}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shown.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-gray-50">
                {columns.map((c, ci) => (
                  <td key={c.key} className={`${TD} ${align(c.format)} ${ci === 0 ? "font-medium text-black" : "text-gray-900"}`}>
                    {formatCell(row[c.key] ?? null, c.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot className="border-t border-gray-300 bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <td key={c.key} className={`${TD} font-semibold text-black ${align(c.format)}`}>
                    {formatCell(totals[c.key] ?? null, c.format)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length > shown.length && (
        <p className="text-[13px] text-gray-600">
          Showing the first {shown.length} of {rows.length} rows. Export the report to get every row.
        </p>
      )}
    </div>
  );
}