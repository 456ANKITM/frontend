export function fieldInput(hasError: boolean, hasTrailingControl = false): string {
  return [
    "h-12 w-full rounded-xl border bg-white pl-11 text-[15px] text-[#0F172A]",
    hasTrailingControl ? "pr-12" : "pr-4",
    "placeholder:text-[#8A93A6] outline-none transition-[border-color,box-shadow]",
    "focus:ring-4",
    hasError
      ? "border-[#D92D20] focus:border-[#D92D20] focus:ring-[#D92D20]/15"
      : "border-[#CBD2E0] hover:border-[#9AA5BB] focus:border-[#2438C9] focus:ring-[#2438C9]/15",
  ].join(" ");
}