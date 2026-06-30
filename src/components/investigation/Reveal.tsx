"use client";

import { useEffect, useState, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        filter: visible ? "blur(0)" : "blur(3px)",
        transition: "opacity 520ms ease, transform 520ms ease, filter 520ms ease",
      }}
    >
      {children}
    </div>
  );
}