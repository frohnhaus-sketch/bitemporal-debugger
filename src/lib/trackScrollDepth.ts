// lib/trackScrollDepth.ts

import { track } from "@/lib/analytics";

const DEFAULT_THRESHOLDS = [25, 50, 75, 100];

type ScrollDepthOptions = {
  page: string;
  pageType?: string;
  thresholds?: number[];
};

export function initializeScrollDepthTracking({
  page,
  pageType,
  thresholds = DEFAULT_THRESHOLDS,
}: ScrollDepthOptions) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const trackedDepths = new Set<number>();

  function getScrollPercent() {
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (documentHeight <= 0) return 100;

    return Math.round((window.scrollY / documentHeight) * 100);
  }

  function handleScroll() {
    const percent = getScrollPercent();

    thresholds.forEach((threshold) => {
      if (percent < threshold) return;
      if (trackedDepths.has(threshold)) return;

      trackedDepths.add(threshold);

      track("scroll_depth", {
        page,
        page_type: pageType,
        percent: threshold,
      });
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll);

  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleScroll);
  };
}