"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Image, { type StaticImageData } from "next/image";
import { Expand } from "lucide-react";
import Lightbox from "./Lightbox";

export interface ShowcaseTab {
  id: string;
  label: string;
  image: StaticImageData;
  alt: string;
  caption: string;
}

interface ScreenshotTabsProps {
  tabs: ShowcaseTab[];
}

export default function ScreenshotTabs({ tabs }: ScreenshotTabsProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeTab = tabs[activeIndex];

  const focusTab = (index: number) => {
    const nextIndex = (index + tabs.length) % tabs.length;
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  // Roving-tabindex keyboard navigation per the WAI-ARIA tabs pattern
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Product screenshots"
        className="mx-auto flex w-full max-w-md flex-wrap justify-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 p-1.5 sm:max-w-none sm:flex-nowrap"
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`showcase-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`showcase-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 sm:flex-none sm:px-6 ${
                isActive ? "bg-black text-white shadow-md" : "text-gray-600 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        id={`showcase-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`showcase-tab-${activeTab.id}`}
        tabIndex={0}
        className="mt-10"
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Enlarge screenshot: ${activeTab.caption}`}
          className="group relative block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/5 transition-shadow duration-300 hover:shadow-2xl"
        >
          <Image
            src={activeTab.image}
            alt={activeTab.alt}
            sizes="(min-width: 1024px) 896px, 100vw"
            className="h-auto w-full"
          />

          {/* Hover overlay with expand icon */}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/10 group-hover:opacity-100"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg">
              <Expand className="h-5 w-5" />
            </span>
          </span>
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">{activeTab.caption}</p>
      </div>

      <Lightbox
        isOpen={lightboxOpen}
        src={activeTab.image}
        alt={activeTab.alt}
        caption={activeTab.caption}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}