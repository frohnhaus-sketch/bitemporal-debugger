export default function ImprintPage() {
  return (
    <main style={mainStyle}>
      <article style={cardStyle}>
        <a href="/" style={backLinkStyle}>
          ← Back to Workbench
        </a>

        <h1 style={h1Style}>Imprint</h1>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Website Operator</h2>

          <p style={pStyle}>
            <strong>Jakob Frohnhaus</strong>
            <br />
            Basel-Stadt, Switzerland
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Contact</h2>

          <p style={pStyle}>
            Email:{" "}
            <a href="mailto:frohnhaus@hotmail.de" style={linkStyle}>
              frohnhaus@hotmail.de
            </a>
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Project</h2>

          <p style={pStyle}>
            Historical Data Modeling Workbench is an independent software
            project focused on historical data modeling, temporal joins,
            SCD2 dimensions, snapshot reporting and historized data validation.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Disclaimer</h2>

          <p style={pStyle}>
            The content on this website is provided for informational and
            educational purposes only. No guarantee is given regarding
            correctness, completeness, suitability or availability.
          </p>

          <p style={{ ...pStyle, marginTop: 12 }}>
            Uploaded datasets are processed locally in the user's browser
            and are not stored on the project's servers.
          </p>
        </section>
      </article>
    </main>
  );
}

const mainStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
  padding: "56px 20px",
  fontFamily: "Inter, Arial, sans-serif",
};

const cardStyle = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px",
  borderRadius: 28,
  background: "#ffffff",
  color: "#0f172a",
  boxShadow: "0 24px 80px rgba(2,6,23,0.25)",
};

const backLinkStyle = {
  display: "inline-flex",
  marginBottom: 32,
  color: "#2563eb",
  fontWeight: 800,
  textDecoration: "none",
};

const h1Style = {
  margin: "0 0 32px",
  fontSize: 40,
  fontWeight: 900,
  letterSpacing: "-0.04em",
  color: "#0f172a",
};

const sectionStyle = {
  marginTop: 28,
};

const h2Style = {
  margin: "0 0 10px",
  fontSize: 13,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const pStyle = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#334155",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 700,
};