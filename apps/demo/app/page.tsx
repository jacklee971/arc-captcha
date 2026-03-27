import Link from "next/link";

const ENVIRONMENTS = [
  { id: "1s20", name: "Environment 1s20", description: "Multi-mechanic puzzle with 3-life system" },
  { id: "ft09", name: "Environment ft09", description: "Spatial reasoning challenge" },
  { id: "vc33", name: "Environment vc33", description: "Pattern discovery environment" },
];

export default function Home() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>ARC-CAPTCHA</h1>
      <p style={{ color: "#8b949e", fontSize: 16, marginBottom: 32 }}>
        ARC-AGI-3 interactive environments as CAPTCHA.
        AI scores &lt;1%. Humans solve 100%.
        We collect behavioral data to close the gap.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {ENVIRONMENTS.map((env) => (
          <Link
            key={env.id}
            href={`/play/${env.id}`}
            style={{
              display: "block", background: "#161b22", border: "1px solid #30363d",
              borderRadius: 8, padding: 20, flex: "1 1 200px",
              textDecoration: "none", color: "inherit",
            }}
          >
            <h3 style={{ margin: "0 0 8px", color: "#58a6ff" }}>{env.name}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#8b949e" }}>{env.description}</p>
          </Link>
        ))}
      </div>
      <footer style={{ marginTop: 48, borderTop: "1px solid #30363d", paddingTop: 16, fontSize: 14, color: "#8b949e" }}>
        <p>
          Open source research project for{" "}
          <a href="https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-3" style={{ color: "#58a6ff" }}>ARC Prize 2026</a>
          {" | "}
          <a href="https://github.com" style={{ color: "#58a6ff" }}>GitHub</a>
        </p>
      </footer>
    </main>
  );
}
