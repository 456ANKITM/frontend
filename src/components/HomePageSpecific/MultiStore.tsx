import { ArrowRight, BarChart3, Boxes, UserCog } from "lucide-react";
import type { ComponentType } from "react";
import MultiStoreIllustration from "./MultiStoreIllustration";
import Reveal from "./Reveal";

interface BulletItem {
  icon: ComponentType<{ className?: string }>;
  text: string;
}

const BULLETS: BulletItem[] = [
  { icon: Boxes, text: "Per-store inventory, kept separate from every other store" },
  { icon: BarChart3, text: "Compare store performance side by side from one dashboard" },
  { icon: UserCog, text: "Assign a Store Manager to each store, with access limited to it" },
];

export default function MultiStore() {
  return (
    <section id="multi-store" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text column */}
          <Reveal>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700">
              Multi-store, one business
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Run every store on its own, see your whole business at a glance
            </h2>

            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              Each store keeps its own inventory, sales and staff, fully isolated from every other
              location. As the Owner, you still get one consolidated view across all of them,
              without logging in and out of separate accounts.
            </p>

            <ul className="mt-8 space-y-4">
              {BULLETS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-2 text-sm font-medium leading-relaxed text-gray-800 sm:text-base">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#how-it-works"
              className="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-black underline-offset-4 hover:underline"
            >
              See how it works
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </Reveal>

          {/* Illustration column */}
          <Reveal delay={150}>
            <div className="relative rounded-3xl border border-gray-200 bg-gray-50 p-6 sm:p-10">
              <div
                aria-hidden="true"
                className="absolute inset-x-10 top-10 -z-10 h-2/3 rounded-full bg-gray-200/70 blur-3xl"
              />
              <MultiStoreIllustration />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}