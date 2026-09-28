"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS, SECTION_IDS } from "@/dummy/NavLinks";
import { useScrollSpy } from "@/hooks/userScrollSpy";
import { useNavbarScroll } from "@/hooks/useNavbarScroll";
import { scrollToSection, scrollToTop } from "@/utils/scrollToSection";

/** Ignore clicks that should open in a new tab/window */
const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const  pathname  = usePathname();
  const { scrolled, progress } = useNavbarScroll();
  const activeId = useScrollSpy(SECTION_IDS);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef<boolean>(false);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  // Return focus to the hamburger button after the drawer closes
  useEffect(() => {
    if (wasOpen.current && !isOpen) toggleRef.current?.focus();
    wasOpen.current = isOpen;
  }, [isOpen]);

  // Close the drawer if the screen grows to desktop size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const handleSectionClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, id: string) => {
      setIsOpen(false);
      if (isModifiedClick(event) || pathname !== "/") return; // normal navigation to /#id
      event.preventDefault();
      scrollToSection(id);
    },
    [pathname]
  );

  const handleLogoClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      setIsOpen(false);
      if (isModifiedClick(event) || pathname !== "/") return;
      event.preventDefault();
      scrollToTop();
    },
    [pathname]
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-gray-200/70 bg-white/85 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            : "border-transparent bg-white"
        }`}
      >
        <div
          className={`mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-4 transition-[height] duration-300 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Logo */}
          <div className="justify-self-start">
            <Logo onClick={handleLogoClick} />
          </div>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = activeId === link.id;
                return (
                  <li key={link.id}>
                    <a
                      href={`/#${link.id}`}
                      onClick={(event) => handleSectionClick(event, link.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? "bg-gray-100 text-black"
                          : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={`absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black transition-all duration-300 ${
                          isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 justify-self-end lg:flex">
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-black transition-all duration-200 hover:border-black hover:bg-gray-50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="group inline-flex h-10 items-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-gray-200 text-black transition-colors hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Scroll progress line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-black transition-opacity duration-300"
          style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
        />
      </header>

      {/* Rendered outside <header> so the blur on the header does not affect fixed positioning */}
      <MobileMenu
        isOpen={isOpen}
        links={NAV_LINKS}
        activeId={activeId}
        onClose={closeMenu}
        onSectionClick={handleSectionClick}
        onLogoClick={handleLogoClick}
      />
    </>
  );
}