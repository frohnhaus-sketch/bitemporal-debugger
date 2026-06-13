"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";

export default function RectangleDecompositionPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "rectangle_decomposition",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <a href="/patterns" style={backLinkStyle}>
            ← Back to Pattern Catalog
          </a>

          <div>
            <div style={badgeStyle}>Advanced Modeling Pattern</div>
          </div>

          <h1 style={h1Style}>Rectangle Decomposition</h1>

          <p style={heroTextStyle}>
            Rectangle Decomposition creates stable reporting intervals from
            multiple independently historized attributes.
          </p>
        </header>

        <section style={{ display: "grid", gap: 24, minWidth: 0 }}>
          <WhiteCard
            eyebrow="Problem"
            title="Multiple bitemporal attributes cannot be safely projected into one row without alignment."
          >
            <p style={paragraphStyle}>
              An entity can have many independently historized attributes stored
              as attribute rows. Each attribute can have its own valid-time and
              visible-time history.
            </p>

            <p style={paragraphStyle}>
              This pattern is commonly used when multiple bitemporal attributes
              must be projected into a single reporting entity.
            </p>

            <p style={paragraphStyle}>
              When those attributes are projected into one reporting row, the
              result needs one shared bitemporal interval. Without
              decomposition, the output can contain overlapping or ambiguous
              historical states.
            </p>

            <ChipRow
              chips={[
                "Bitemporal overlaps",
                "Invalid projections",
                "Duplicate reporting rows",
                "Ambiguous historical states",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <WhiteCard
            eyebrow="Why it happens"
            title="Each attribute creates its own valid-time and visible-time boundaries."
          >
            <p style={paragraphStyle}>
              Attributes can evolve independently. The reason for different
              histories is often source-specific and not obvious. Rectangle
              Decomposition does not explain why the histories differ — it makes
              them safely reportable.
            </p>

            <p style={paragraphStyle}>
              The pattern preserves the covered bitemporal area, decomposes it
              into atomic regions with stable attribute combinations, and can
              then compact neighbouring regions with identical resolved values.
            </p>

            <ChipRow
              chips={[
                "Independent attribute history",
                "Attribute projection",
                "Bitemporal dimensions",
                "Source-specific history",
                "Stable reporting rows",
                "State reduction",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical solutions"
            title="Decompose first, resolve attributes, then compact if possible."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Collect boundaries"
                text="Gather every valid_from, valid_to, visible_from and visible_to boundary from all relevant attribute rows."
              />
              <MiniCard
                title="Build atomic rectangles"
                text="Split the valid × visible plane only at real source boundaries, not at arbitrary time buckets."
              />
              <MiniCard
                title="Resolve combinations"
                text="For each atomic rectangle, determine which attributes are active and visible."
              />
              <MiniCard
                title="Compact stable states"
                text="Merge neighbouring rectangles along valid time when the resolved attribute combination is identical."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Validate that the projected output is bitemporally stable."
          >
            <CheckChipRow
              checks={[
                "No bitemporal overlaps after decomposition",
                "One resolved combination per rectangle",
                "Covered source area is preserved",
                "Empty regions are not materialized as facts",
                "Adjacent identical states can be compacted safely",
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Rectangle Decomposition turns independent attribute history into one reportable history."
          >
            <p style={paragraphStyle}>
              Without Rectangle Decomposition, the same entity and reporting
              date can produce multiple possible attribute combinations.
            </p>

            <p style={paragraphStyle}>
              With decomposition, each output row represents one entity, one
              bitemporal rectangle and one stable historical truth.
            </p>
          </WhiteCard>
        </section>

        <RelatedPatterns current="rectangle_decomposition" />

        <TryItCard />
      </div>
    </main>
  );
}

function DarkExampleCard() {
  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Example</div>

      <h2 style={darkTitleStyle}>
        Two independently historized attributes are decomposed into stable
        bitemporal rectangles.
      </h2>

      <RectangleDecompositionGraphic />

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Key rule</div>

        <p style={exampleNoteTextStyle}>
          Rectangle Decomposition does not create arbitrary time buckets. It
          splits only at real source boundaries and resolves the active attribute
          combination per atomic rectangle. After decomposition, neighbouring
          rectangles can be compacted along valid time when the resolved attribute
          combination stays identical.
        </p>
      </div>
    </section>
  );
}

function RectangleDecompositionGraphic() {
  return (
    <div style={graphicCardStyle}>
      <div style={graphicTitleStyle}>Bitemporal rectangle decomposition</div>

      <svg
        viewBox="0 0 920 560"
        role="img"
        aria-label="Four-step bitemporal rectangle decomposition"
        style={svgStyle}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="#93c5fd" />
          </marker>
        </defs>

        <StepTitle x={42} y={34} label="1. Source rectangles" />
        <StepTitle x={492} y={34} label="2. Boundary extraction" />
        <StepTitle x={42} y={300} label="3. Atomic rectangles" />
        <StepTitle x={492} y={300} label="4. Compacted result" />

        <Plane x={42} y={58} mode="sources" />
        <Plane x={492} y={58} mode="boundaries" />
        <Plane x={42} y={324} mode="atomic" />
        <Plane x={492} y={324} mode="compacted" />

        <Arrow x1={350} y1={170} x2={450} y2={170} />
        <Arrow x1={350} y1={436} x2={450} y2={436} />

        <text x="42" y="268" fill="#cbd5e1" fontSize="13" fontWeight="800">
          Attributes have different valid and visible intervals.
        </text>
        <text x="492" y="268" fill="#cbd5e1" fontSize="13" fontWeight="800">
          Project every real source edge onto the valid and visible axes.
        </text>
        <text x="42" y="534" fill="#cbd5e1" fontSize="13" fontWeight="800">
          Fill only regions covered by A, B, or both.
        </text>
        <text x="492" y="534" fill="#cbd5e1" fontSize="13" fontWeight="800">
          Compact only along valid time where
        </text>
        <text x="492" y="552" fill="#cbd5e1" fontSize="13" fontWeight="800">
          the resolved values stay identical.
        </text>
      </svg>
    </div>
  );
}

function StepTitle({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text x={x} y={y} fill="#bfdbfe" fontSize="16" fontWeight="900">
      {label}
    </text>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#93c5fd"
      strokeWidth="3"
      markerEnd="url(#arrow)"
    />
  );
}

function Plane({
  x,
  y,
  mode,
}: {
  x: number;
  y: number;
  mode: "sources" | "boundaries" | "atomic" | "compacted";
}) {
  const verticals = [46, 122, 178, 244];
  const horizontals = [42, 82, 106, 166];

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x="0"
        y="0"
        width="310"
        height="190"
        rx="14"
        fill="#020617"
        stroke="rgba(148, 163, 184, 0.55)"
      />

      <text x="18" y="26" fill="#93c5fd" fontSize="12" fontWeight="900">
        visible ↑
      </text>

      <text x="246" y="172" fill="#93c5fd" fontSize="12" fontWeight="900">
        valid →
      </text>

      {(mode === "boundaries" || mode === "atomic") &&
        verticals.map((lineX) => (
          <line
            key={`v-${lineX}`}
            x1={lineX}
            y1="20"
            x2={lineX}
            y2="166"
            stroke="#fbbf24"
            strokeWidth="1.2"
            opacity="0.78"
          />
        ))}

      {(mode === "boundaries" || mode === "atomic") &&
        horizontals.map((lineY) => (
          <line
            key={`h-${lineY}`}
            x1="28"
            y1={lineY}
            x2="282"
            y2={lineY}
            stroke="#fbbf24"
            strokeWidth="1.2"
            opacity="0.78"
          />
        ))}

      {mode === "sources" && <SourceRectangles />}
      {mode === "boundaries" && <SourceRectangles />}
      {mode === "atomic" && <AtomicRectangles />}
      {mode === "compacted" && <CompactedRectangles />}
    </g>
  );
}

function SourceRectangles() {
  return (
    <>
      <rect
        x="46"
        y="42"
        width="132"
        height="64"
        rx="8"
        fill="rgba(59, 130, 246, 0.58)"
        stroke="rgba(191, 219, 254, 0.8)"
      />
      <text
        x="108"
        y="79"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="900"
      >
        A
      </text>

      <rect
        x="122"
        y="82"
        width="122"
        height="84"
        rx="8"
        fill="rgba(20, 184, 166, 0.5)"
        stroke="rgba(153, 246, 228, 0.8)"
      />
      <text
        x="183"
        y="128"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="900"
      >
        B
      </text>
    </>
  );
}

function AtomicRectangles() {
  return (
    <>
      <Cell x={46} y={42} width={76} height={40} label="A" />
      <Cell x={122} y={42} width={56} height={40} label="A" />

      <Cell x={46} y={82} width={76} height={24} label="A" />
      <Cell x={122} y={82} width={56} height={24} label="A+B" highlight />
      <Cell x={178} y={82} width={66} height={24} label="B" />

      <Cell x={122} y={106} width={56} height={60} label="B" />
      <Cell x={178} y={106} width={66} height={60} label="B" />
    </>
  );
}

function CompactedRectangles() {
  return (
    <>
      <Cell x={46} y={42} width={132} height={40} label="A" />
      <Cell x={46} y={82} width={76} height={24} label="A" />

      <Cell x={122} y={82} width={56} height={24} label="A+B" highlight />

      <Cell x={178} y={82} width={66} height={24} label="B" />
      <Cell x={122} y={106} width={122} height={60} label="B" />
    </>
  );
}

function Cell({
  x,
  y,
  width,
  height,
  label,
  highlight,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={highlight ? "rgba(14, 165, 233, 0.28)" : "rgba(148, 163, 184, 0.35)"}
        stroke="rgba(226, 232, 240, 0.82)"
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontWeight="900"
      >
        {label}
      </text>
    </g>
  );
}

function WhiteCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={whiteCardStyle}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <h2 style={cardTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={miniCardStyle}>
      <div style={miniCardTitleStyle}>{title}</div>
      <div style={miniCardTextStyle}>{text}</div>
    </div>
  );
}

function ChipRow({ chips }: { chips: string[] }) {
  return (
    <div style={chipRowStyle}>
      {chips.map((chip) => (
        <span key={chip} style={riskChipStyle}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function CheckChipRow({ checks }: { checks: string[] }) {
  return (
    <div style={checkRowStyle}>
      {checks.map((check) => (
        <span key={check} style={checkChipStyle}>
          ✓ {check}
        </span>
      ))}
    </div>
  );
}

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Explore bitemporal alignment problems in the Workbench.
      </h2>

      <p style={tryItTextStyle}>
        Use the Historical Modeling Workbench to reason about bitemporal
        overlaps, temporal joins, coverage gaps and stable reporting intervals.
      </p>

      <a
        href="/"
        onClick={() => {
          track("learn_cta_clicked", {
            page: "rectangle_decomposition",
            cta: "open_workbench",
          });
        }}
        style={tryItButtonStyle}
      >
        Open Historical Modeling Workbench →
      </a>
    </section>
  );
}

function RelatedPatterns({ current }: { current: string }) {
  const patterns = [
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
    },
    {
      title: "Historical Conformance",
      href: "/learn/historical-conformance",
      key: "historical_conformance",
    },
    {
      title: "Historical Overlap",
      href: "/learn/historical-overlap",
      key: "historical_overlap",
    },
    {
      title: "State Reduction",
      href: "/learn/state-reduction",
      key: "state_reduction",
    },
    {
      title: "Snapshot Reproducibility",
      href: "/learn/snapshot-reproducibility",
      key: "snapshot_reproducibility",
    },
  ];

  return (
    <section style={relatedSectionStyle}>
      <div style={relatedTitleStyle}>Related Patterns</div>

      <div style={relatedGridStyle}>
        {patterns
          .filter((pattern) => pattern.key !== current)
          .map((pattern) => (
            <a
              key={pattern.key}
              href={pattern.href}
              onClick={() => {
                track("related_pattern_clicked", {
                  from: current,
                  to: pattern.key,
                });
              }}
              style={relatedLinkStyle}
            >
              {pattern.title}
            </a>
          ))}
      </div>
    </section>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  overflowX: "hidden",
  background:
    "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
  padding: "clamp(24px, 5vw, 48px) clamp(14px, 4vw, 24px)",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#e2e8f0",
  boxSizing: "border-box",
};

const pageStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  marginLeft: "auto",
  marginRight: "auto",
  minWidth: 0,
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  color: "#bfdbfe",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
  marginBottom: 22,
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#075985",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.6,
  textTransform: "uppercase",
};

const h1Style: CSSProperties = {
  marginTop: 22,
  marginBottom: 16,
  fontSize: "clamp(34px, 8vw, 56px)",
  lineHeight: 1,
  color: "#ffffff",
  letterSpacing: "-0.05em",
};

const heroTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
  maxWidth: 760,
  fontSize: 20,
  lineHeight: 1.6,
  color: "#dbeafe",
};

const whiteCardStyle: CSSProperties = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background: "rgba(255, 255, 255, 0.96)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  color: "#0f172a",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
};

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#0f172a",
  letterSpacing: "-0.03em",
};

const paragraphStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#334155",
  overflowWrap: "anywhere",
  wordBreak: "normal",
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 18,
};

const riskChipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 11px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #bfdbfe",
};

const darkCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "hidden",
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  boxShadow: "0 24px 70px rgba(2, 6, 23, 0.35)",
  boxSizing: "border-box",
};

const darkEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const darkTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: "clamp(24px, 6vw, 28px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const graphicCardStyle: CSSProperties = {
  marginTop: 20,
  padding: 16,
  borderRadius: 18,
  background: "rgba(2, 6, 23, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.32)",
  overflowX: "hidden",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

const graphicTitleStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 10,
};

const svgStyle: CSSProperties = {
  display: "block",
  width: "100%",
  maxWidth: "100%",
  height: "auto",
};

const exampleNoteStyle: CSSProperties = {
  marginTop: 18,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #334155",
};

const exampleNoteLabelStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  fontSize: 13,
};

const exampleNoteTextStyle: CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  color: "#cbd5e1",
  fontSize: 15,
  lineHeight: 1.55,
};

const solutionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginTop: 18,
};

const miniCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const miniCardTitleStyle: CSSProperties = {
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: 8,
};

const miniCardTextStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
};

const checkRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 8,
};

const checkChipStyle: CSSProperties = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 999,
  background: "#ecfdf5",
  color: "#047857",
  fontSize: 13,
  fontWeight: 900,
  border: "1px solid #a7f3d0",
};

const relatedSectionStyle: CSSProperties = {
  marginTop: 30,
  padding: 24,
  borderRadius: 22,
  background: "rgba(15, 23, 42, 0.72)",
  border: "1px solid rgba(148, 163, 184, 0.32)",
};

const relatedTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#93c5fd",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const relatedGridStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const relatedLinkStyle: CSSProperties = {
  display: "inline-flex",
  padding: "9px 12px",
  borderRadius: 999,
  background: "#ffffff",
  color: "#1d4ed8",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};

const tryItCardStyle: CSSProperties = {
  marginTop: 30,
  padding: 28,
  borderRadius: 24,
  background: "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)",
  border: "1px solid rgba(147, 197, 253, 0.8)",
  color: "#0f172a",
};

const tryItEyebrowStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#2563eb",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 10,
};

const tryItTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 10,
  fontSize: 26,
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  color: "#0f172a",
};

const tryItTextStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 20,
  fontSize: 16,
  lineHeight: 1.7,
  color: "#334155",
  maxWidth: 720,
};

const tryItButtonStyle: CSSProperties = {
  display: "inline-flex",
  padding: "12px 18px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
};