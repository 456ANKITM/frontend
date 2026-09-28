export interface NavLinkItem {
  /** Must match the `id` attribute of the section on the landing page */
  id: string;
  label: string;
}

/** Placeholder brand name: change to your product name */
export const BRAND_NAME = "ERP";

export const NAV_LINKS: NavLinkItem[] = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

/** Stable array reference used by the scroll-spy hook */
export const SECTION_IDS: string[] = NAV_LINKS.map((link) => link.id);

/** Height (px) of the sticky navbar; used to offset smooth-scroll and scroll-spy */
export const HEADER_OFFSET = 80;