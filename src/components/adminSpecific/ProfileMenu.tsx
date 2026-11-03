"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

type MenuUser = { name: string; email: string };

// TODO(integration): read from the authenticated session (GET /auth/me).
const ADMIN_USER: MenuUser = { name: "Platform Admin", email: "admin@erpsuite.com" };

export default function ProfileMenu({ user = ADMIN_USER }: { user?: MenuUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = () => {
    // TODO(integration): POST /api/v1/auth/logout, then clear client auth state.
    router.replace("/login");
  };

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 outline-none transition-colors hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-black/20"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-xs font-semibold text-white"
        >
          {initials}
        </span>
        <span className="hidden text-sm font-medium text-black sm:block">{user.name}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)]"
        >
          <div className="px-3 py-2.5">
            <p className="text-sm font-semibold text-black">{user.name}</p>
            <p className="truncate text-[13px] text-gray-600">{user.email}</p>
          </div>
          <hr className="my-1 border-gray-200" />
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-black outline-none transition-colors hover:bg-gray-50 focus-visible:bg-gray-100"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}