import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/HomePageSpecific/Reveal";

export default function CtaBanner() {
  return (
    <section className="bg-white px-4 py-6 sm:px-6 lg:px-8">
      <Reveal className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-black px-6 py-14 text-center shadow-2xl shadow-black/20 sm:px-12 sm:py-16">
          {/* Soft radial glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#ffffff26,transparent_60%)]"
          />
          {/* Faint grid, matching the hero background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[40px_40px] 
            mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to run your stores from one place?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
              Start your free trial today and see your inventory, sales and stores come together.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-black shadow-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-xl sm:w-auto"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <a
                href="#contact"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/25 px-7 text-base font-semibold text-white transition-colors duration-200 hover:bg-white/10 sm:w-auto"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}