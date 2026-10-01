export default function MultiStoreIllustration() {
  return (
    <svg
      viewBox="0 0 560 480"
      role="img"
      aria-label="One business owner connected to four stores, each with its own inventory"
      className="h-auto w-full"
    >
      <title>Owner connected to multiple stores</title>

      {/* Connector lines: owner (center) to each store */}
      <g stroke="#d1d5db" strokeWidth="2" strokeDasharray="5 6">
        <line x1="280" y1="150" x2="120" y2="90" />
        <line x1="280" y1="150" x2="440" y2="90" />
        <line x1="280" y1="150" x2="120" y2="380" />
        <line x1="280" y1="150" x2="440" y2="380" />
      </g>

      {/* Animated pulse traveling along each connector */}
      <g fill="#000">
        <circle r="4">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M280,150 L120,90" />
        </circle>
        <circle r="4">
          <animateMotion dur="3.6s" repeatCount="indefinite" path="M280,150 L440,90" />
        </circle>
        <circle r="4">
          <animateMotion dur="4s" repeatCount="indefinite" path="M280,150 L120,380" />
        </circle>
        <circle r="4">
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M280,150 L440,380" />
        </circle>
      </g>

      {/* Store node template, repeated 4 times */}
      {[
        { x: 120, y: 90, label: "Main Street" },
        { x: 440, y: 90, label: "Airport Road" },
        { x: 120, y: 380, label: "Riverside" },
        { x: 440, y: 380, label: "Uptown" },
      ].map((store) => (
        <g key={store.label}>
          <circle cx={store.x} cy={store.y} r="38" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          {/* storefront icon */}
          <g transform={`translate(${store.x - 14} ${store.y - 14})`} stroke="#111827" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10 L2 24 L26 24 L26 10" />
            <path d="M0 10 L4 2 L24 2 L28 10 Z" />
            <path d="M11 24 L11 16 L17 16 L17 24" />
          </g>
          <text
            x={store.x}
            y={store.y + 56}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#374151"
          >
            {store.label}
          </text>
          <circle cx={store.x + 26} cy={store.y - 26} r="6" fill="#000" />
          <circle cx={store.x + 26} cy={store.y - 26} r="6" fill="#000" opacity="0.4">
            <animate attributeName="r" values="6;11;6" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Owner node (center, larger) */}
      <circle cx="280" cy="150" r="56" fill="#000" />
      <g transform="translate(260 128)" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="11" r="9" />
        <path d="M2 42 C2 28 10 22 20 22 C30 22 38 28 38 42" />
      </g>
      <text x="280" y="226" textAnchor="middle" fontSize="15" fontWeight="700" fill="#000">
        Owner
      </text>
      <text x="280" y="246" textAnchor="middle" fontSize="12" fill="#9ca3af">
        Consolidated view
      </text>
    </svg>
  );
}