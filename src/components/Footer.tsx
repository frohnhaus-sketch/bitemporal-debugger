export function Footer() {
  const linkStyle = {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: 600,
  };

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
        Built for historical data modeling, temporal joins,
        snapshot reporting and historized data validation.
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
        <a href="/patterns" style={linkStyle}>
          Pattern Catalog
        </a>

        <a
          href="https://www.linkedin.com/in/jakob-frohnhaus/"
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
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
          style={linkStyle}
        >
          Jakob Frohnhaus
        </a>
        {" · "}
        <a href="/imprint" style={linkStyle}>
          Imprint
        </a>
        {" · "}
        <a href="/privacy" style={linkStyle}>
          Privacy
        </a>
      </div>

      <div style={{ marginTop: 6 }}>
        Feedback, ideas or collaboration welcome.
      </div>
    </div>
  );
}