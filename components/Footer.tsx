export function Footer() {
  return (
    <div
      style={{
        marginTop: 48,
        paddingTop: 24,
        borderTop: "1px solid rgba(148,163,184,0.2)",
        textAlign: "center",
        fontSize: 12,
        color: "#94a3b8",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        Built for historical source integration, temporal analysis and
        historical data modeling.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <a
          href="/patterns"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Pattern Catalog
        </a>

        <a
          href="/events"
          target="_blank"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          Analytics
        </a>

        <a
          href="https://www.linkedin.com/in/jakob-frohnhaus/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          LinkedIn
        </a>
      </div>

      <div>
        Created by{" "}
        <a
          href="https://www.linkedin.com/in/jakob-frohnhaus/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Jakob Frohnhaus
        </a>
      </div>

      <div style={{ marginTop: 6 }}>
        Feedback, ideas or collaboration welcome.
      </div>
    </div>
  );
}