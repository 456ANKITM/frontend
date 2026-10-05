import type { CSSProperties } from "react";
import Logo from "@/components/common/Logo";

const BARS = [42, 58, 36, 66, 52, 78, 100];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const LOW_STOCK = [
  { name: "Basmati rice 5 kg", left: 6, fill: 30 },
  { name: "Olive oil 1 L", left: 9, fill: 45 },
  { name: "Notebook A5", left: 4, fill: 20 },
];

export default function ShowcasePanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden h-dvh overflow-hidden bg-black text-white lg:flex lg:flex-col lg:justify-between lg:px-10 lg:py-10 xl:px-14"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="max-w-md">
        <Logo variant="inverse" />
        <h2 className="font-display mt-6 text-[34px] font-semibold leading-[1.1] tracking-tight xl:text-[40px]">
          Every store, every shelf, one clear picture.
        </h2>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">
          Track inventory, record sales and see how each store is performing from one workspace.
        </p>
      </div>

      <div className="my-6 w-full max-w-135">
        {/* Orders card */}
        <div className="relative z-10 rounded-2xl bg-white p-5 text-black shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Orders today</p>
              <p className="font-display mt-1 text-3xl font-semibold tracking-tight">128</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black">
              All stores
            </span>
          </div>

          <div className="mt-4 flex h-24 items-end gap-2.5">
            {BARS.map((h, i) => (
              <div key={i} className="flex h-full flex-1 items-end">
                <div
                  className="erp-grow w-full rounded-t-md"
                  style={
                    {
                      height: `${h}%`,
                      "--i": i,
                      backgroundColor: i === BARS.length - 1 ? "#000000" : "#E5E7EB",
                    } as CSSProperties
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2.5 text-center text-[11px] text-gray-600">
            {DAYS.map((d, i) => (
              <span key={i} className={i === DAYS.length - 1 ? "font-semibold text-black" : ""}>
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Low stock card (hidden on short screens) */}
        <div className="relative z-20 -mt-5 ml-auto w-[80%] rounded-2xl bg-white p-4 text-black shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] [@media(max-height:760px)]:hidden">
          <p className="text-sm font-medium">Low stock</p>
          <ul className="mt-2.5 space-y-2.5">
            {LOW_STOCK.map((item) => (
              <li key={item.name}>
                <div className="flex items-center justify-between text-[13px]">
                  <span>{item.name}</span>
                  <span className="text-gray-600">{item.left} left</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{ width: `${item.fill}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="max-w-sm text-sm text-white/75">
        Built for owners running one store or many, and the managers who run each floor.
      </p>
    </aside>
  );
}