import { useEffect, useState } from "react";

interface NavbarScrollState {
  /** True once the page is scrolled past the threshold */
  scrolled: boolean;
  /** Page scroll progress from 0 to 1 */
  progress: number;
}

export function useNavbarScroll(threshold: number = 8): NavbarScrollState {
  const [state, setState] = useState<NavbarScrollState>({ scrolled: false, progress: 0 });

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      setState({ scrolled: y > threshold, progress });
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
  }, [threshold]);

  return state;
}