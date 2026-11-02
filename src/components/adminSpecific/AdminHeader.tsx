"use client";

import { Menu } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-black outline-none transition-colors hover:bg-gray-50 focus-visible:ring-4 focus-visible:ring-black/20 lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black sm:inline">
          Super Admin
        </span>
      </div>

      <ProfileMenu />
    </header>
  );
}