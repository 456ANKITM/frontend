import Image from "next/image";
import heroDashboard from "@/assets/images/hero-dashboard.svg";

export default function HeroVisual() {
  return (
    <div className="relative">
      {/* Soft glow behind the dashboard */}
      <div
        aria-hidden="true"
        className="absolute inset-x-8 top-10 -z-10 h-3/4 rounded-full bg-gray-200/70 blur-3xl"
      />

      {/*
        Above the fold: `priority` disables lazy-loading and preloads the image.
        Width and height reserve the space so the layout does not shift.
      */}
      <Image
        src={heroDashboard}
        alt="ERP dashboard showing today's sales, a sales chart, top products and recent transactions"
        width={1200}
        height={840}
        priority
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="h-auto w-full select-none motion-safe:animate-float"
      />
    </div>
  );
}