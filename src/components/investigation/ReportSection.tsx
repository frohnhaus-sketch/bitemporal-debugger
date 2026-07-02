import type { ReactNode } from "react";

export function ReportSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        padding: "42px 0",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#64748b",
          marginBottom: 22,
        }}
      >
        {title}
      </div>

      {children}
    </section>
  );
}