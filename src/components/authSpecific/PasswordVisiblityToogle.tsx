"use client";

import { Eye, EyeOff } from "lucide-react";

type Props = { visible: boolean; onToggle: () => void; controls: string };

export default function PasswordVisibilityToggle({ visible, onToggle, controls }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-controls={controls}
      className="absolute right-1.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#5B6475] outline-none transition-colors hover:bg-[#EEF0F6] hover:text-foreground focus-visible:ring-4 focus-visible:ring-[#2438C9]/25"
    >
      {visible ? (
        <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Eye className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
}