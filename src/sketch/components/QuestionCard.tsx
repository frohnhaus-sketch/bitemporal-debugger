export function QuestionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#93c5fd",
          marginBottom: 14,
        }}
      >
        {eyebrow}
      </div>

      <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: 0 }}>{title}</h1>

      <div style={{ marginTop: 28 }}>{children}</div>
    </div>
  );
}
