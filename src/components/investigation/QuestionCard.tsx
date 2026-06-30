export function QuestionCard() {
  return (
    <section style={cardStyle}>
      <div style={eyebrowStyle}>Historical Investigation</div>

      <h2 style={{ margin: "6px 0 8px", fontSize: 28 }}>
        Can this table reliably reproduce historical reports?
      </h2>

      <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
        We investigate whether this target table contains enough historical
        context to reproduce previously published reporting results.
      </p>
    </section>
  );
}

const cardStyle = {
  padding: 22,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase" as const,
  letterSpacing: 0.7,
};
