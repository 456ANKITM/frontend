"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Mail } from "lucide-react";
import { scrollToSection } from "@/utils/scrollToSection";
import { BRAND_NAME } from "@/dummy/NavLinks";

interface FooterLink {
  label: string;
  href: string;
  /** True for in-page section links that should smooth-scroll instead of navigate */
  isSection?: boolean;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

const CONTACT_EMAIL = "hello@erpsuite.com";

const FOOTER_GROUPS: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features", isSection: true },
      { label: "Pricing", href: "/#pricing", isSection: true },
    ],
  },
  {
    title: "Company",
    links: [{ label: "Contact", href: "/#contact", isSection: true }],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
    ],
  },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/") return; // let it navigate to "/" then land on the hash
    event.preventDefault();
    scrollToSection(href.replace("/#", ""));
  };

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          {/* Logo + description */}
          <div>
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                <Boxes className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-bold tracking-tight text-black">{BRAND_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              Inventory, sales and stores — all in one app for growing retail businesses.
            </p>
          </div>

          {/* Link groups */}
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold text-black">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={link.isSection ? (event) => handleSectionClick(event, link.href) : undefined}
                      className="text-sm text-gray-600 transition-colors duration-200 hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar: legal links, contact email, copyright */}
        <div className="mt-12 flex flex-col items-center gap-6 border-t border-gray-200 pt-8 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 transition-colors duration-200 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors duration-200 hover:text-black"
            >
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <p className="text-sm text-gray-500">
            &copy; {year} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}