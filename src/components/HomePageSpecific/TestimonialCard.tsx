import Image from "next/image";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/config/testimonials";

export default function TestimonialCard({ quote, name, businessName, role, photoSrc }: Testimonial) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 sm:p-7">
      <Quote className="h-7 w-7 text-gray-200" aria-hidden="true" />

      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-gray-700 sm:text-base">
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3">
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={name}
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-black">{name}</p>
          <p className="truncate text-xs text-gray-500">
            {role ? `${role}, ` : ""}
            {businessName}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}