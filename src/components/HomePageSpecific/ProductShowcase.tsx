import dashboardImg from "@/assets/images/showcase-dashboard.svg";
import posImg from "@/assets/images/showcase-pos.svg";
import inventoryImg from "@/assets//images/showcase-inventory.svg";
import reportsImg from "@/assets/images/showcase-reports.svg";
import Reveal from "./Reveal";
import ScreenshotTabs from "./ScreenShotTabs";
import type { ShowcaseTab } from "./ScreenShotTabs";

const TABS: ShowcaseTab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    image: dashboardImg,
    alt: "ERP dashboard showing today's sales, a sales chart, top products and recent transactions",
    caption: "Today's sales, low-stock alerts and recent activity at a glance.",
  },
  {
    id: "pos",
    label: "POS",
    image: posImg,
    alt: "Point of sale screen with a product grid, cart and payment options",
    caption: "Search or scan a product, apply discount and tax, and charge in seconds.",
  },
  {
    id: "inventory",
    label: "Inventory",
    image: inventoryImg,
    alt: "Inventory screen listing products with stock levels and low-stock status",
    caption: "Every product's stock level, with low-stock items flagged automatically.",
  },
  {
    id: "reports",
    label: "Reports",
    image: reportsImg,
    alt: "Reports screen comparing store revenue and showing profit and loss",
    caption: "Compare stores, track profit and loss, and export to PDF or Excel.",
  },
];

export default function ProductShowcase() {
  return (
    <section id="product-showcase" className="scroll-mt-20 bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            See it for yourself
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            A closer look at the interface
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Switch between tabs to see the dashboard, the point of sale, inventory and reports.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-14">
          <ScreenshotTabs tabs={TABS} />
        </Reveal>
      </div>
    </section>
  );
}