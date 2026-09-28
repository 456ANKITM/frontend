import { useEffect, useState } from "react";
import { HEADER_OFFSET } from "@/dummy/NavLinks";

/**
 * Returns the id of the section currently in view.
 * The active section is the last one whose top has passed just under the navbar.
 */
export function useScrollSpy(ids: string[], offset: number = HEADER_OFFSET + 8): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;

      const scrollBottom = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;

      // Near the bottom of the page, the last section is always the active one
      if (scrollBottom >= pageHeight - 2) {
        setActiveId(ids[ids.length - 1] ?? null);
        return;
      }

      let current: string | null = null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= offset) current = id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, offset]);

  return activeId;
}