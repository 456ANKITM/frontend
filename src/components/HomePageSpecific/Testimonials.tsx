import { TESTIMONIALS } from "@/config/testimonials";
import Reveal from "./Reveal";
import TestimonialCard from "./TestimonialCard";

export default function Testimonials() {
  // Hidden on purpose until TESTIMONIALS has real, approved customer quotes.
  // See src/config/testimonials.ts — do not add placeholder data there.
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section id="testimonials" className="scroll-mt-20 bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700">
            Testimonials
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Trusted by growing businesses
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            Hear from owners and managers already running their stores on the platform.
          </p>
        </Reveal>

        {/* Grid: 1 column mobile, 2 tablet, 3 desktop */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={`${testimonial.name}-${testimonial.businessName}`} delay={(index % 3) * 100} className="h-full">
              <TestimonialCard {...testimonial} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}