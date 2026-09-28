import type { ComponentType, ReactNode } from "react";
import Reveal from "./Reveal";

export interface StepItemProps {
  number: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** Last step: hides the mobile connector line and the bottom spacing */
  isLast?: boolean;
  /** Fade-in delay in milliseconds */
  delay?: number;
  /** Extra content under the description, e.g. a call-to-action button */
  children?: ReactNode;
}

export default function StepItem({
  number,
  title,
  description,
  icon: Icon,
  isLast = false,
  delay = 0,
  children,
}: StepItemProps) {
  return (
    <li className="relative">
      {/* Vertical connector (mobile only) */}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-7 top-14 w-0.5 -translate-x-1/2 bg-gray-200 lg:hidden"
        />
      )}

      <Reveal delay={delay}>
        <div className="flex gap-5 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
          {/* Icon circle with step number badge */}
          <div className="relative shrink-0">
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg shadow-black/20 ring-8 ring-white">
              <Icon className="h-6 w-6" />
            </span>
            <span className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold text-black">
              {number}
            </span>
          </div>

          {/* Text */}
          <div className={`min-w-0 flex-1 lg:mt-6 lg:flex-none ${isLast ? "" : "pb-10 lg:pb-0"}`}>
            <h3 className="text-lg font-bold tracking-tight text-black">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
            {children}
          </div>
        </div>
      </Reveal>
    </li>
  );
}