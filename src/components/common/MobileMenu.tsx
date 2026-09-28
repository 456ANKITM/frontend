"use client"

import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import  Link  from "next/link";
import { ArrowRight, X } from "lucide-react";
import Logo from "./Logo";
import type { NavLinkItem } from "@/dummy/NavLinks";

interface MobileMenuProps {
  isOpen: boolean;
  links: NavLinkItem[];
  activeId: string | null;
  onClose: () => void;
  onSectionClick: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  onLogoClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function MobileMenu({
  isOpen,
  links,
  activeId,
  onClose,
  onSectionClick,
  onLogoClick,
}: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, lock body scroll and focus the close button while open
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className="lg:hidden">
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-60 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-70 flex h-dvh w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
          isOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Logo onClick={onLogoClick} />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-black transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {links.map((link, index) => {
              const isActive = activeId === link.id;
              return (
                <li
                  key={link.id}
                  style={{ transitionDelay: isOpen ? `${100 + index * 45}ms` : "0ms" }}
                  className={`transition-all duration-300 ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  }`}
                >
                  <a
                    href={`/#${link.id}`}
                    onClick={(event) => onSectionClick(event, link.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-lg font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-black"
                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    {link.label}
                    <ArrowRight
                      className={`h-4 w-4 transition-all ${
                        isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-gray-100 p-5">
          <Link
            href="/login"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-base font-semibold text-black transition-colors hover:bg-gray-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-base font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </aside>
    </div>
  );
}