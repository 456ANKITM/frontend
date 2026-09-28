import type { ComponentType } from "react";

export interface FeatureCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-2xl hover:shadow-black/10">
      {/* Soft glow that appears on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gray-100 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
          <Icon className="h-6 w-6" />
        </span>

        <h3 className="mt-5 text-lg font-bold tracking-tight text-black">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>

      {/* Bottom accent line that grows on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-black transition-transform duration-300 group-hover:scale-x-100"
      />
    </article>
  );
}