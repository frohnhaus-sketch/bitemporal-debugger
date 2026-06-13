export default function PrivacyPage() {
  return (
    <main style={mainStyle}>
      <article style={cardStyle}>
        <a href="/" style={backLinkStyle}>
          ← Back to Workbench
        </a>

        <h1 style={h1Style}>Privacy Policy</h1>

        <p style={introStyle}>
          This privacy policy explains how personal data is processed when using
          the Historical Data Modeling Workbench.
        </p>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Controller</h2>
          <p style={pStyle}>
            Jakob Frohnhaus
            <br />
            Basel-Stadt, Switzerland
            <br />
            Email:{" "}
            <a href="mailto:frohnhaus@hotmail.de" style={linkStyle}>
              frohnhaus@hotmail.de
            </a>
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Hosting</h2>
          <p style={pStyle}>
            This website is hosted on Vercel. When you visit the website,
            technical information such as browser type, operating system,
            request metadata and IP-related information may be processed for
            security, delivery and operational purposes.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Analytics</h2>
          <p style={pStyle}>
            This website uses lightweight analytics to understand how the
            website is used and to improve the product. Events may include page
            views, opened learn pages, clicked pattern links, advisor
            interactions and copied recommendations.
          </p>

          <p style={{ ...pStyle, marginTop: 12 }}>
            The analytics implementation stores technical metadata such as
            timestamp, page path, referrer, user agent and a hashed IP value.
            The purpose is product improvement, debugging and understanding
            which historical data modeling topics are useful to visitors.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Uploaded datasets</h2>
          <p style={pStyle}>
            Uploaded datasets are processed locally in the user's browser and
            are not stored on the project's servers.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Vercel Analytics</h2>
          <p style={pStyle}>
            This website may use Vercel Analytics to measure page views and
            basic usage patterns. The data is used to understand traffic and
            improve the website.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Supabase</h2>
          <p style={pStyle}>
            This website may use Supabase to store internal analytics events.
            These events are used to understand which pages, educational content
            and features are most useful to visitors.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Contact by email</h2>
          <p style={pStyle}>
            If you contact the operator by email, the information you provide
            will be processed to respond to your request.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Your rights</h2>
          <p style={pStyle}>
            Depending on applicable law, you may have the right to request
            access, correction, deletion or restriction of your personal data.
            You can contact the operator using the email address above.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Changes</h2>
          <p style={pStyle}>
            This privacy policy may be updated as the project evolves.
          </p>
        </section>

        <p style={updatedStyle}>Last updated: June 2026</p>
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
  margin: "0 0 18px",
  fontSize: 40,
  fontWeight: 900,
  letterSpacing: "-0.04em",
  color: "#0f172a",
};

const introStyle = {
  margin: "0 0 32px",
  fontSize: 17,
  lineHeight: 1.75,
  color: "#475569",
};

const sectionStyle = {
  marginTop: 28,
};

const h2Style = {
  margin: "0 0 10px",
  fontSize: 13,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const pStyle = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#334155",
};

const updatedStyle = {
  marginTop: 36,
  fontSize: 13,
  color: "#64748b",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 700,
};