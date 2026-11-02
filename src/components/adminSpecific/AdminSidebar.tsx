"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Logo from "@/components/common/Logo";
import { ADMIN_NAV } from "@/config/admin";

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-6">
        <Logo variant="inverse" />
      </div>

      <p className="px-6 pt-6 text-[11px] font-semibold uppercase tracking-wider text-white/50">
        Platform
      </p>
      <nav aria-label="Admin" className="mt-3 flex-1 px-3">
        <ul className="space-y-1">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
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
      </nav>

      <div className="m-3 flex items-start gap-2.5 rounded-xl bg-white/10 p-3 text-[13px] leading-snug text-white/75">
        <ShieldCheck className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
        <p>You&apos;re in the platform console. Business data is managed by each Owner.</p>
      </div>
    </div>
  );
}