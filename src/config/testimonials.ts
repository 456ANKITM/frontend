export interface Testimonial {
  /** Exact words from the customer — never invented or paraphrased */
  quote: string;
  name: string;
  businessName: string;
  /** Optional role/title, e.g. "Owner" or "Store Manager" */
  role?: string;
  /** Optional path under src/assets, e.g. "/testimonials/aarav.jpg" */
  photoSrc?: string;
}

/**
 * EMPTY ON PURPOSE.
 *
 * Do not add placeholder, example, or AI-generated quotes here — the
 * Testimonials section only renders once this array has real entries, and it
 * must only ever contain real customers who agreed to be quoted.
 *
 * To publish the section: add real testimonial objects below. The section
 * will start rendering automatically once this array is non-empty.
 */
export const TESTIMONIALS: Testimonial[] = [
    {
    quote: "Exact words the customer said or wrote.",
    name: "Their real name",
    businessName: "Their real business",
    role: "Owner",
  },
];