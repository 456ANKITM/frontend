import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import ShowcasePanel from "./ShowcasePanel";

type Props = {
  children: ReactNode;
  /** Wider card (used by /register). The form area scrolls internally on lg+ */
  wide?: boolean;
};

/**
 * On lg+ the page is locked to the viewport (fixed, no document scroll).
 * Only <main> scrolls, and it never chains scrolling to the page.
 */
export default function AuthLayout({ children, wide = false }: Props) {
  return (
    <div
      className={`grid min-h-dvh lg:fixed lg:inset-0 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden ${
        wide
          ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]"
      }`}
    >
      <div className="flex min-h-dvh flex-col px-5 sm:px-10 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <header className="flex shrink-0 items-center gap-4 py-4 lg:py-5">
          <Logo />
          <span className="hidden h-5 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <span className="hidden text-sm text-gray-600 sm:block">
            Business Management Platform
          </span>
        </header>

        {/* The only scrollable region on desktop */}
        <main className="flex flex-1 pb-4 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pb-6">
          <div
            className={`m-auto w-full ${
              wide ? "max-w-2xl" : "max-w-110"
            } sm:rounded-2xl sm:border sm:border-gray-200 sm:bg-white sm:p-8 sm:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.25)]`}
          >
            {children}
          </div>
        </main>

        {wide && (
          <footer className="flex shrink-0 items-center justify-center gap-6 pb-5 text-sm text-gray-600">
  <Link href="/privacy" className="transition-colors hover:text-black">
    Privacy Policy
  </Link>
  <Link href="/terms" className="transition-colors hover:text-black">
    Terms of Service
  </Link>
</footer>
        )}
      </div>

      <ShowcasePanel />
    </div>
  );
}