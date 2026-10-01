export default function ReportsChart() {
  return (
    <svg
      viewBox="0 0 600 440"
      role="img"
      aria-label="Illustrative sales trend chart with a list of top-selling products"
      className="h-auto w-full"
    >
      <title>Sales trend and top products</title>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.16" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Card */}
      <rect x="1" y="1" width="598" height="438" rx="20" fill="#fff" stroke="#e5e7eb" />

      {/* Header */}
      <text x="28" y="40" fontSize="14" fontWeight="700" fill="#111827" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">
        Sales trend
      </text>
      <text x="572" y="40" fontSize="11" fill="#9ca3af" textAnchor="end" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">
        Last 6 months
      </text>

      {/* Gridlines */}
      <g stroke="#f1f2f4">
        <line x1="28" y1="70" x2="572" y2="70" />
        <line x1="28" y1="105" x2="572" y2="105" />
        <line x1="28" y1="140" x2="572" y2="140" />
        <line x1="28" y1="175" x2="572" y2="175" />
      </g>
      <line x1="28" y1="190" x2="572" y2="190" stroke="#e5e7eb" />

      {/* Trend area + line, drawn in on load */}
      <path
        d="M28 150 L120 130 L212 155 L304 100 L396 118 L488 70 L572 60 L572 190 L28 190 Z"
        fill="url(#trendFill)"
      />
      <path
        d="M28 150 L120 130 L212 155 L304 100 L396 118 L488 70 L572 60"
        fill="none"
        stroke="#000"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset="1"
      >
        <animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.6s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1" />
      </path>

      {/* Point + value callout on the last data point */}
      <circle cx="572" cy="60" r="5" fill="#fff" stroke="#000" strokeWidth="3">
        <animate attributeName="opacity" values="0;1" dur="0.4s" begin="1.4s" fill="freeze" />
      </circle>
      <g opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.4s" begin="1.5s" fill="freeze" />
        <rect x="486" y="24" width="86" height="26" rx="8" fill="#000" />
        <text x="529" y="41" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">
          +18.4%
        </text>
      </g>

      {/* Month labels */}
      <g fontSize="10" fill="#9ca3af" textAnchor="middle" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">
        <text x="28" y="206">Apr</text>
        <text x="120" y="206">May</text>
        <text x="212" y="206">Jun</text>
        <text x="304" y="206">Jul</text>
        <text x="396" y="206">Aug</text>
        <text x="488" y="206">Sep</text>
      </g>

      {/* Divider */}
      <line x1="28" y1="232" x2="572" y2="232" stroke="#f1f2f4" />

      {/* Top products */}
      <text x="28" y="260" fontSize="14" fontWeight="700" fill="#111827" fontFamily="Inter, 'Segoe UI', Arial, sans-serif">
        Top products
      </text>

      {[
        { name: "Basmati Rice 5kg", value: "$2,108", w: 300, fill: "#000", y: 288 },
        { name: "Olive Oil 1L", value: "$1,215", w: 210, fill: "#374151", y: 330 },
        { name: "Sugar 2kg", value: "$468", w: 110, fill: "#6b7280", y: 372 },
      ].map((row) => (
        <g key={row.name} fontFamily="Inter, 'Segoe UI', Arial, sans-serif">
          <text x="28" y={row.y - 8} fontSize="12" fill="#374151">
            {row.name}
          </text>
          <text x="572" y={row.y - 8} fontSize="12" fontWeight="700" fill="#111827" textAnchor="end">
            {row.value}
          </text>
          <rect x="28" y={row.y} width="544" height="8" rx="4" fill="#f3f4f6" />
          <rect x="28" y={row.y} width="0" height="8" rx="4" fill={row.fill}>
            <animate attributeName="width" from="0" to={row.w} dur="1s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1" />
          </rect>
        </g>
      ))}
    </svg>
  );
}