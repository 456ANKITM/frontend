import type { ComponentType } from "react";
import { Check } from "lucide-react";

export interface RoleCardProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  /** Short label for the role's reach, e.g. "All stores" */
  scope: string;
  description: string;
  /** 4 to 6 capabilities, each shown with a check icon */
  capabilities: string[];
  variant?: "dark" | "light";
}

const STYLES = {
  dark: {
    card: "bg-black text-white shadow-2xl shadow-black/20",
    iconBox: "bg-white text-black",
    scope: "bg-white/10 text-white ring-1 ring-white/20",
    description: "text-gray-300",
    divider: "border-white/15",
    item: "text-gray-100",
    check: "bg-white text-black",
  },
  light: {
    card: "border border-gray-200 bg-white text-black shadow-sm",
    iconBox: "bg-black text-white",
    scope: "bg-gray-100 text-gray-700",
    description: "text-gray-600",
    divider: "border-gray-200",
    item: "text-gray-700",
    check: "bg-black text-white",
  },
} as const;

export default function RoleCard({
  icon: Icon,
  title,
  scope,
  description,
  capabilities,
  variant = "light",
}: RoleCardProps) {
  const styles = STYLES[variant];

  return (
    <article
      className={`relative h-full overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8 ${styles.card}`}
    >
      {variant === "dark" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff26,transparent_55%)]"
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md ${styles.iconBox}`}
          >
            <Icon className="h-7 w-7" />
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles.scope}`}
          >
            {scope}
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight">{title}</h3>
        <p className={`mt-2 text-sm leading-relaxed sm:text-base ${styles.description}`}>
          {description}
        </p>

        <hr className={`my-6 ${styles.divider}`} />

        {/* Capabilities */}
        <ul className="space-y-3.5">
          {capabilities.map((capability) => (
            <li key={capability} className={`flex items-start gap-3 text-sm sm:text-base ${styles.item}`}>
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.check}`}
              >
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}