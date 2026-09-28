import Link from "next/link";
import { ArrowRight, CalendarDays, CircleCheck } from "lucide-react";
import HeroVisual from "@/components/HomePageSpecific/HeroVisual";

const TRUST_POINTS: string[] = ["No credit card required", "Multi-store ready"];

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white">
      {/* Subtle grid background that fades out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-size-[48px_48px] mask-[radical-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-20">
        {/* Text column */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
            </span>
            Built for retail and multi-store businesses
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-black sm:text-5xl lg:text-6xl">
            Inventory, sales and stores{" "}
            <span className="bg-linear-to-r from-black via-gray-700 to-gray-400 bg-clip-text text-transparent">
              all in one app
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg lg:mx-0">
            Track stock, bill customers at the counter, record supplier purchases and manage every
            store from a single dashboard.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/register"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-7 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-gray-800 hover:shadow-xl sm:w-auto"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <a
              href="#contact"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-7 text-base font-semibold text-black transition-all duration-200 hover:border-black hover:bg-gray-50 sm:w-auto"
            >
              <CalendarDays className="h-4 w-4" />
              Book a Demo
            </a>
          </div>

          {/* Trust line */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600 lg:justify-start">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-black" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual column: stacks below the text on mobile */}
        <div className="lg:-mr-10 xl:-mr-16">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}