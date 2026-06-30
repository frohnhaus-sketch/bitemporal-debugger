export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Inter, sans-serif",
        color: "#0f172a",
      }}
    >
      <h1>Bitemporal Debugger</h1>

      <p>Choose what you want to do</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <a href="/advisor">🧠 Design a model</a>
        <a href="/model-review">🔍 Review a model</a>
        <a href="/validate">📊 Validate data</a>
        <a href="/compare">⚖️ Compare data</a>
      </div>
    </main>
  );
}