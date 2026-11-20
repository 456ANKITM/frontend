import { formatCell } from "@/utils/reports";
import { todayLocal } from "@/utils/localDate";
import type { ReportCell, ReportResult } from "@/types/reports";

/* ---------- CSV (opens in Excel and Google Sheets) ---------- */

function csvCell(v: ReportCell): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  // Stop spreadsheet apps from running text such as "=SUM(...)" as a formula.
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCsv(r: ReportResult): string {
  const line = (cells: ReportCell[]) => cells.map(csvCell).join(",");
  const lines = [
    line([r.title]),
    line([r.scope]),
    line([`Generated ${todayLocal()}`]),
    "",
    line(r.columns.map((c) => c.label)),
    ...r.rows.map((row) => line(r.columns.map((c) => row[c.key] ?? null))),
  ];
  if (r.totals) {
    const totals = r.totals;
    lines.push(line(r.columns.map((c) => totals[c.key] ?? null)));
  }
  return `\uFEFF${lines.join("\r\n")}`; // BOM so Excel reads UTF-8 correctly
}

export function downloadCsv(r: ReportResult) {
  const blob = new Blob([buildCsv(r)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Print / save as PDF ---------- */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function printHtml(r: ReportResult): string {
  const align = (f: string) => (f === "text" ? "l" : "r");
  const head = r.columns.map((c) => `<th class="${align(c.format)}">${esc(c.label)}</th>`).join("");
  const body = r.rows
    .map(
      (row) =>
        `<tr>${r.columns.map((c) => `<td class="${align(c.format)}">${esc(formatCell(row[c.key] ?? null, c.format))}</td>`).join("")}</tr>`,
    )
    .join("");
  const totals = r.totals
    ? `<tfoot><tr>${r.columns
        .map((c) => `<td class="${align(c.format)}">${esc(formatCell(r.totals?.[c.key] ?? null, c.format))}</td>`)
        .join("")}</tr></tfoot>`
    : "";
  const kpis = r.kpis
    .map((k) => `<div class="kpi"><p class="kl">${esc(k.label)}</p><p class="kv">${esc(k.value)}</p><p class="kd">${esc(k.description)}</p></div>`)
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.title)}</title><style>
    body{font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#000;margin:32px;font-size:12px}
    h1{font-size:20px;margin:0}.sub{color:#555;margin:4px 0 20px}
    .kpis{display:flex;gap:12px;margin-bottom:20px}.kpi{flex:1;border:1px solid #ccc;border-radius:8px;padding:10px}
    .kl{margin:0;color:#555}.kv{margin:4px 0;font-size:16px;font-weight:600}.kd{margin:0;color:#777;font-size:11px}
    table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid #ddd}
    th{background:#f3f3f3;font-size:11px}.l{text-align:left}.r{text-align:right}
    tfoot td{font-weight:600;border-top:2px solid #000}.note{margin-top:16px;color:#555}
    tr{page-break-inside:avoid}
  </style></head><body>
    <h1>${esc(r.title)}</h1><p class="sub">${esc(r.scope)} &middot; Generated ${todayLocal()}</p>
    <div class="kpis">${kpis}</div>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${totals}</table>
    <p class="note">${esc(r.note)}</p>
  </body></html>`;
}

// Prints from a hidden frame, so the app's sidebar and header never end up in the PDF.
export function printReport(r: ReportResult) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
  frame.srcdoc = printHtml(r);
  frame.onload = () => {
    const win = frame.contentWindow;
    if (!win) return frame.remove();
    win.onafterprint = () => frame.remove();
    win.focus();
    win.print();
  };
  document.body.appendChild(frame);
  setTimeout(() => frame.remove(), 120_000); // safety net if the dialog never reports back
}