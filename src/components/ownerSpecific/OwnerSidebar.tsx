"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/Logo";
import { OWNER_NAV } from "@/config/owner";

export default function OwnerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
        <Logo variant="inverse" />
      </div>

      <nav aria-label="Owner" className="flex-1 overflow-y-auto px-3 pb-6">
        {OWNER_NAV.map((group) => (
          <div key={group.heading}>
            <p className="px-3 pt-6 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {group.heading}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-4 focus-visible:ring-white/30 ${
                        active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}