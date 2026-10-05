import type { MouseEvent } from "react";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { BRAND_NAME } from "@/dummy/NavLinks";

interface LogoProps {
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  variant ? : "default" | "inverse"
}

export default function Logo({ onClick, variant="default" }: LogoProps) {
  const inverse = variant === "inverse"
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${BRAND_NAME} home`}
      className="group inline-flex items-center gap-2.5 rounded-lg"
    >
      <span className= {`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${
          inverse ? "bg-white text-[#2438C9]" : "bg-black text-white"
        }`}>
        <Boxes className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-bold tracking-tight text-black">{BRAND_NAME}</span>
    </Link>
  );
}