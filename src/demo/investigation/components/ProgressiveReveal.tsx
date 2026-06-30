"use client";

import { useEffect, useState, type ReactNode } from "react";

export function ProgressiveReveal({
  children,
  delay = 0,
  revealKey,
}: {
  children: ReactNode;
  delay?: number;
  revealKey: string;
}) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const isVisible = visibleKeys.has(revealKey);

  useEffect(() => {
    if (isVisible) return;

    const t = setTimeout(() => {
      setVisibleKeys((prev) => {
        const next = new Set(prev);
        next.add(revealKey);
        return next;
      });
    }, delay);

    return () => clearTimeout(t);
  }, [delay, isVisible, revealKey]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : "translateY(14px)",
        filter: isVisible ? "blur(0px)" : "blur(3px)",
        transition:
          "opacity 520ms ease, transform 520ms ease, filter 520ms ease",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  );
}