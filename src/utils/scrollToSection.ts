import { HEADER_OFFSET } from "@/dummy/NavLinks";

const getBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/** Smooth-scrolls to a section by id, leaving room for the sticky navbar */
export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET + 1;
  window.scrollTo({ top, behavior: getBehavior() });

  // Keep router state intact while updating the hash
  window.history.replaceState(window.history.state, "", `#${id}`);
}

/** Smooth-scrolls to the top of the page and clears the hash */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: getBehavior() });
  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname + window.location.search
  );
}