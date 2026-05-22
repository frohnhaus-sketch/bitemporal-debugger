export function Footer() {
  return (
    <div
      style={{
        marginTop: 40,
        textAlign: "center",
        fontSize: 12,
        color: "#94a3b8",
      }}
    >
      Built by{" "}
      <a
        href="https://www.linkedin.com/in/jakob-frohnhaus/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#60a5fa",
          marginLeft: 4,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        Jakob Frohnhaus
      </a>

      <div style={{ marginTop: 6 }}>
        Want this for your team? →{" "}
        <a
          href="https://www.linkedin.com/in/jakob-frohnhaus/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#60a5fa",
            textDecoration: "none",
          }}
        >
          Contact me
        </a>
      </div>
    </div>
  );
}