"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { initializeScrollDepthTracking } from "@/lib/trackScrollDepth";

const CHILD_CONTRACT_ROWS = [
  ["Contract A", "Jan → Apr", "Active"],
  ["Contract A", "Apr → ∞", "Annulled"],
  ["Contract B", "Jan → Jun", "Active"],
  ["Contract B", "Jun → ∞", "Annulled"],
];

const DERIVED_ROWS = [
  ["Jan → Apr", "Active", "A and B active"],
  ["Apr → Jun", "Active", "B still active"],
  ["Jun → ∞", "Annulled", "All contracts annulled"],
];

const VALIDATION_CHECKS = [
  "All child state boundaries are represented",
  "Every parent interval has a deterministic derived value",
  "Priority rules are explicit and testable",
  "No child status change is hidden by a parent interval",
  "Bitemporal visibility is preserved if corrections arrive",
  "Derived attributes can be explained from source evidence",
];

const SOLUTIONS = [
  {
    title: "Build common child intervals",
    text: "Collect all relevant valid_from and valid_to boundaries from child entities and build non-overlapping parent-level intervals.",
  },
  {
    title: "Probe child states per interval",
    text: "For each parent interval, evaluate which child states are valid inside that time slice.",
  },
  {
    title: "Apply business rules",
    text: "Derive the parent attribute from child states using explicit priority or aggregation rules.",
  },
  {
    title: "Persist derived evidence",
    text: "Store the rule, source entities or derivation method so the parent state can be explained later.",
  },
];

export default function HierarchicalStateDerivationPage() {
  useEffect(() => {
    track("learn_page_opened", {
      page: "hierarchical_state_derivation",
      page_type: "interactive_example",
      example: "hierarchical_state_derivation",
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  useEffect(() => {
    return initializeScrollDepthTracking({
      page: "hierarchical-state-derivation",
      pageType: "learn_page",
    });
  }, []);

  return (
    <main style={mainStyle}>
      <div style={pageStyle}>
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
            <a href="/patterns" style={backLinkStyle}>
              ← Back to Pattern Catalog
            </a>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={badgeStyle}>Engineering Pattern</div>

              <div
                style={{
                  ...badgeStyle,
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                }}
              >
                Interactive Example
              </div>
            </div>
          </div>

          <h1 style={h1Style}>Hierarchical State Derivation</h1>

          <p style={heroTextStyle}>
            A policy has multiple historized contracts. The policy status is not
            stored directly. It must be derived from the contract states over
            time.
          </p>

          <p style={paragraphStyle}>
            Hierarchical state derivation models how parent entities are
            reconstructed from changing child-level history over time.
          </p>

          <p style={paragraphStyle}>
            It ensures that derived business states remain consistent even when
            underlying relationships evolve.
          </p>

          <ul
  style={{
    marginTop: 14,
    paddingLeft: 18,
    display: "grid",
    gap: 6,
    color: "#0f172a",
    fontWeight: 600,
  }}
>
            <li>Hierarchical temporal aggregation</li>
            <li>Parent-child state reconstruction</li>
            <li>Time-aware rollups</li>
            <li>Derived historical consistency</li>
          </ul>
        </header>

        <section style={{ display: "grid", gap: 24 }}>
          <WhiteCard
            eyebrow="Problem"
            title="The parent entity has no direct historical state."
          >
            <p style={paragraphStyle}>
              In many source systems, business state exists at a lower level
              than the reporting entity. Contracts have status history, but the
              policy status must be derived from all contracts belonging to the
              policy.
            </p>

            <p style={paragraphStyle}>
              This is not a simple aggregation. The parent timeline must be
              rebuilt from child timelines, and business rules decide which
              derived state is valid in each interval.
            </p>

            <ChipRow
              chips={[
                "Child → parent derivation",
                "Status priority rules",
                "Generated parent intervals",
                "Bitemporal state projection",
              ]}
            />
          </WhiteCard>

          <DarkExampleCard />

          <section style={{ marginTop: 20 }}>
            <h2>How this works in real-world data systems</h2>

            <p>
              Many enterprise systems need to roll up historical data across
              changing hierarchies.
            </p>

            <p>
              Without hierarchical derivation, reporting becomes inconsistent
              across time periods.
            </p>
          </section>

          <NaiveVsCorrectCard />

          <InteractiveDecisionCard />

          <WhiteCard
            eyebrow="Key idea"
            title="Derive parent states by probing historized child states."
          >
            <p style={paragraphStyle}>
              Hierarchical State Derivation creates a historized parent
              attribute from multiple historized child entities. The child
              records define the timeline boundaries. The business rules define
              the derived parent value.
            </p>

            <p style={paragraphStyle}>
              In your internal implementation this may look like a function such
              as <strong>probe_by_attribute</strong>: generate time slices,
              probe child values in each slice, apply rules, and output new
              parent intervals.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Example rule"
            title="If at least one contract is active, the policy is active."
          >
            <ResultTable
              rows={[
                ["Rule 1", "Any active contract → Policy active"],
                ["Rule 2", "All contracts annulled → Policy annulled"],
                ["Output", "Bitemporal policy status intervals"],
              ]}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Child state input"
            title="Contract states define the parent timeline."
          >
            <SimpleTable
              headers={["Child entity", "Valid period", "Status"]}
              rows={CHILD_CONTRACT_ROWS}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Derived parent state"
            title="The policy status changes only when the derived rule result changes."
          >
            <SimpleTable
              headers={["Policy interval", "Policy status", "Reason"]}
              rows={DERIVED_ROWS}
            />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it happens"
            title="Source systems often store operational detail below the reporting grain."
          >
            <div style={solutionGridStyle}>
              <MiniCard
                title="Insurance"
                text="Policy status is derived from multiple contract, coverage or risk-object states."
              />
              <MiniCard
                title="Orders"
                text="Order state is derived from line-item, shipment or cancellation states."
              />
              <MiniCard
                title="Subscriptions"
                text="Customer subscription state is derived from multiple products or service components."
              />
              <MiniCard
                title="Claims"
                text="Case status is derived from multiple claim parts, decisions or processing steps."
              />
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Typical approach"
            title="Generate parent intervals before applying business rules."
          >
            <div style={solutionGridStyle}>
              {SOLUTIONS.map((solution) => (
                <MiniCard
                  key={solution.title}
                  title={solution.title}
                  text={solution.text}
                />
              ))}
            </div>
          </WhiteCard>

          <WhiteCard
            eyebrow="Validation checks"
            title="Before publishing the derived state, validate the derivation."
          >
            <CheckChipRow checks={VALIDATION_CHECKS} />
          </WhiteCard>

          <WhiteCard
            eyebrow="Why it matters"
            title="Without explicit derivation, parent state becomes unstable or unexplainable."
          >
            <p style={paragraphStyle}>
              A policy may look active, cancelled or suspended depending on
              which contract row was joined first, which status was prioritized,
              or which child history was visible at the time of publication.
            </p>

            <p style={paragraphStyle}>
              Hierarchical State Derivation makes the business rule explicit.
              The parent state is no longer an accidental side effect of joins,
              but a reproducible historical data product.
            </p>
          </WhiteCard>

          <WhiteCard
            eyebrow="Related Concepts"
            title="This pattern connects several historical modeling problems."
          >
            <div style={solutionGridStyle}>
              <RelatedConcept
                href="/learn/rectangle-decomposition"
                title="Rectangle Decomposition"
                text="Child state boundaries often need to be decomposed into common non-overlapping intervals."
              />
              <RelatedConcept
                href="/learn/state-reduction"
                title="State Reduction"
                text="Multiple lower-level states are reduced into one parent-level state."
              />
              <RelatedConcept
                href="/learn/relationship-history"
                title="Relationship History"
                text="The relationship between parent and child entities must itself be valid over time."
              />
              <RelatedConcept
                href="/learn/bitemporal-modeling"
                title="Bitemporal Modeling"
                text="Derived parent states may need valid-time and visible-time semantics."
              />
            </div>
          </WhiteCard>
        </section>

        <section style={{ marginTop: 30 }}>
          <h2>
            How this pattern connects to other historical modeling concepts
          </h2>

          <p>
            This pattern is essential when hierarchical structures change over
            time.
          </p>

          <ul>
            <li>Relationship History</li>
            <li>State Modeling</li>
            <li>Event-to-State Projection</li>
            <li>Historical Conformance</li>
          </ul>

          <p>It is commonly used in organizational and product hierarchies.</p>
        </section>
        <RelatedPatterns current="hierarchical_state_derivation" />

        <TryItCard />
      </div>

      <Analytics />
    </main>
  );
}

function DarkExampleCard() {
  return (
    <section style={darkCardStyle}>
      <div style={darkEyebrowStyle}>Example</div>

      <h2 style={darkTitleStyle}>
        Contract states are historized. Policy status is derived.
      </h2>

      <div style={timelineGridStyle}>
        <TimelineRow
          label="Contract A"
          segments={[
            { label: "Active", left: "0%", width: "33%", tone: "good" },
            { label: "Annulled", left: "33%", width: "67%", tone: "bad" },
          ]}
        />

        <TimelineRow
          label="Contract B"
          segments={[
            { label: "Active", left: "0%", width: "50%", tone: "good" },
            { label: "Annulled", left: "50%", width: "50%", tone: "bad" },
          ]}
        />

        <TimelineRow
          label="Derived Policy"
          segments={[
            { label: "Active", left: "0%", width: "50%", tone: "good" },
            { label: "Annulled", left: "50%", width: "50%", tone: "bad" },
          ]}
          strong
        />
      </div>

      <div style={exampleNoteStyle}>
        <div style={exampleNoteLabelStyle}>Derivation rule</div>
        <p style={exampleNoteTextStyle}>
          The policy remains active until all related contracts are annulled.
          The parent state changes in June, not in April, because Contract B is
          still active.
        </p>
      </div>
    </section>
  );
}

function NaiveVsCorrectCard() {
  return (
    <section style={whiteCardStyle}>
      <div style={eyebrowStyle}>Common mistake</div>

      <h2 style={cardTitleStyle}>
        Do not derive the parent state from only one child row.
      </h2>

      <div style={decisionGridStyle}>
        <div
          style={{
            ...decisionInputStyle,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <div style={decisionTitleStyle}>Naive derivation</div>

          <ResultTable
            rows={[
              ["Input", "Contract A becomes annulled in April"],
              ["Assumption", "Policy becomes annulled in April"],
              ["Problem", "Contract B is still active"],
            ]}
          />

          <div
            style={{
              ...decisionResultStyle,
              background: "#fff1f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            }}
          >
            <strong>Wrong.</strong>
            <div style={{ marginTop: 6 }}>
              This copies one child status to the parent and hides the remaining
              active child state.
            </div>
          </div>
        </div>

        <div
          style={{
            ...decisionInputStyle,
            background: "#f0fdf4",
            border: "1px solid #86efac",
          }}
        >
          <div style={decisionTitleStyle}>Correct derivation</div>

          <ResultTable
            rows={[
              ["Rule", "Any active contract → Policy active"],
              ["May state", "Contract B is still active"],
              ["Result", "Policy remains active until June"],
            ]}
          />

          <div
            style={{
              ...decisionResultStyle,
              background: "#ecfdf5",
              border: "1px solid #86efac",
              color: "#166534",
            }}
          >
            <strong>Correct.</strong>
            <div style={{ marginTop: 6 }}>
              The parent state changes only when the rule result changes across
              all relevant child states.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineRow({
  label,
  segments,
  strong = false,
}: {
  label: string;
  segments: {
    label: string;
    left: string;
    width: string;
    tone: "good" | "bad";
  }[];
  strong?: boolean;
}) {
  return (
    <div style={timelineRowStyle}>
      <div style={timelineLabelStyle}>{label}</div>
      <div style={timelineTrackStyle}>
        {segments.map((segment) => (
          <div
            key={`${label}-${segment.label}-${segment.left}`}
            style={{
              ...timelineSegmentStyle,
              left: segment.left,
              width: segment.width,
              background: segment.tone === "good" ? "#bfdbfe" : "#fecaca",
              border:
                segment.tone === "good"
                  ? "1px solid #93c5fd"
                  : "1px solid #fca5a5",
              fontWeight: strong ? 950 : 850,
            }}
          >
            {segment.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractiveDecisionCard() {
  const [selectedAnswer, setSelectedAnswer] = useState<
    "active" | "annulled" | null
  >(null);

  const isCorrect = selectedAnswer === "active";

  function chooseAnswer(answer: "active" | "annulled") {
    setSelectedAnswer(answer);

    track("interactive_example_answered", {
      example: "hierarchical_state_derivation",
      question: "policy_status_may_2024",
      answer,
      correct: answer === "active",
    });
  }

  return (
    <section style={whiteCardStyle}>
      <div style={eyebrowStyle}>Interactive decision</div>

      <h2 style={cardTitleStyle}>What should the policy status be in May?</h2>

      <p style={paragraphStyle}>
        Contract A is already annulled in May. Contract B is still active until
        June. Apply the rule: the policy is active if at least one contract is
        active.
      </p>

      <div style={decisionGridStyle}>
        <div style={decisionInputStyle}>
          <div style={decisionTitleStyle}>Child states in May</div>

          <ResultTable
            rows={[
              ["Contract A", "Annulled"],
              ["Contract B", "Active"],
              ["Rule", "Any active contract → Policy active"],
            ]}
          />
        </div>

        <div style={decisionInputStyle}>
          <div style={decisionTitleStyle}>Choose derived parent state</div>

          <div style={decisionButtonRowStyle}>
            <button
              type="button"
              onClick={() => chooseAnswer("active")}
              style={{
                ...decisionButtonStyle,
                background: selectedAnswer === "active" ? "#15803d" : "#ffffff",
                color: selectedAnswer === "active" ? "#ffffff" : "#15803d",
                border: "1px solid #86efac",
              }}
            >
              Policy = Active
            </button>

            <button
              type="button"
              onClick={() => chooseAnswer("annulled")}
              style={{
                ...decisionButtonStyle,
                background:
                  selectedAnswer === "annulled" ? "#b91c1c" : "#ffffff",
                color: selectedAnswer === "annulled" ? "#ffffff" : "#b91c1c",
                border: "1px solid #fecaca",
              }}
            >
              Policy = Annulled
            </button>
          </div>

          {!selectedAnswer && (
            <p style={decisionHintStyle}>
              Pick the status that should be generated for the parent policy
              interval.
            </p>
          )}

          {selectedAnswer && (
            <div
              style={{
                ...decisionResultStyle,
                background: isCorrect ? "#f0fdf4" : "#fef2f2",
                border: isCorrect ? "1px solid #86efac" : "1px solid #fecaca",
                color: isCorrect ? "#166534" : "#991b1b",
              }}
            >
              <strong>{isCorrect ? "Correct." : "Not quite."}</strong>
              <div style={{ marginTop: 6 }}>
                {isCorrect
                  ? "The policy remains active in May because Contract B is still active. The parent state only becomes annulled once all child contracts are annulled."
                  : "The policy should not be annulled yet. Contract A is annulled, but Contract B is still active until June."}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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
    <div style={chipRowStyle}>
      {checks.map((check) => (
        <span key={check} style={checkChipStyle}>
          ✓ {check}
        </span>
      ))}
    </div>
  );
}

function ResultTable({ rows }: { rows: string[][] }) {
  return (
    <div style={resultTableStyle}>
      {rows.map(([label, value]) => (
        <div key={label} style={resultRowStyle}>
          <div style={resultLabelStyle}>{label}</div>
          <div style={resultValueStyle}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={thStyle}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td key={cell} style={tdStyle}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatedConcept({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <a href={href} style={relatedConceptStyle}>
      <strong>{title}</strong>
      <div>{text}</div>
    </a>
  );
}

function RelatedPatterns({ current }: { current: string }) {
  const patterns = [
    {
      title: "Rectangle Decomposition",
      href: "/learn/rectangle-decomposition",
      key: "rectangle_decomposition",
    },
    {
      title: "State Reduction",
      href: "/learn/state-reduction",
      key: "state_reduction",
    },
    {
      title: "Relationship History",
      href: "/learn/relationship-history",
      key: "relationship_history",
    },
    {
      title: "Bitemporal Modeling",
      href: "/learn/bitemporal-modeling",
      key: "bitemporal_modeling",
    },
    {
      title: "State ↔ State Alignment",
      href: "/learn/state-state-alignment",
      key: "state_state_alignment",
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

function TryItCard() {
  return (
    <section style={tryItCardStyle}>
      <div style={tryItEyebrowStyle}>Try it</div>

      <h2 style={tryItTitleStyle}>
        Review your own model for derived state risks.
      </h2>

      <p style={tryItTextStyle}>
        Paste SQL, PySpark, dbt model logic or an architecture description and
        check whether derived parent states are explicit, explainable and
        historically reproducible.
      </p>

      <a
        href="/#model-review-section"
        onClick={() => {
          track("example_model_cta_clicked", {
            example: "hierarchical_state_derivation",
            cta: "review_my_model",
            source: "bottom_cta",
            page_type: "interactive_example",
          });
        }}
        style={buttonStyle}
      >
        Review My Model →
      </a>
    </section>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
  padding: "clamp(24px, 5vw, 48px) clamp(14px, 4vw, 24px)",
  fontFamily: "Inter, Arial, sans-serif",
  color: "#e2e8f0",
};

const pageStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
};

const backLinkStyle: CSSProperties = {
  display: "inline-flex",
  color: "#bfdbfe",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
  marginBottom: 0,
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
  color: "#0f172a",
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

const darkCardStyle: CSSProperties = {
  padding: "clamp(20px, 5vw, 28px)",
  borderRadius: 24,
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.92))",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  boxShadow: "0 24px 70px rgba(2, 6, 23, 0.35)",
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
  fontSize: "clamp(22px, 5vw, 34px)",
  lineHeight: 1.15,
  color: "#ffffff",
  letterSpacing: "-0.03em",
};

const timelineGridStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 24,
};

const timelineRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "150px 1fr",
  gap: 16,
  alignItems: "center",
};

const timelineLabelStyle: CSSProperties = {
  color: "#e2e8f0",
  fontSize: 14,
  fontWeight: 900,
};

const timelineTrackStyle: CSSProperties = {
  position: "relative",
  height: 54,
  borderRadius: 18,
  background: "rgba(15, 23, 42, 0.56)",
  overflow: "hidden",
};

const timelineSegmentStyle: CSSProperties = {
  position: "absolute",
  top: 9,
  height: 36,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  color: "#0f172a",
  fontSize: 13,
  boxSizing: "border-box",
};

const exampleNoteStyle: CSSProperties = {
  marginTop: 22,
  padding: 18,
  borderRadius: 16,
  background: "#020617",
  border: "1px solid #0f172a",
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

const resultTableStyle: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 16,
};

const resultRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px solid #e2e8f0",
};

const resultLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
};

const resultValueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  color: "#0f172a",
  textAlign: "right",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: "1px solid #cbd5e1",
  color: "#475569",
};

const tdStyle: CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#0f172a",
  fontWeight: 700,
};

const preStyle: CSSProperties = {
  maxHeight: 180,
  overflow: "auto",
  padding: 12,
  borderRadius: 12,
  background: "#020617",
  color: "#e2e8f0",
  fontSize: 12,
  lineHeight: 1.5,
  whiteSpace: "pre",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  marginTop: 18,
  padding: "12px 18px",
  borderRadius: 14,
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
  cursor: "pointer",
};

const relatedConceptStyle: CSSProperties = {
  display: "block",
  padding: 18,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  textDecoration: "none",
  color: "#0f172a",
  lineHeight: 1.6,
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
  color: "#0f172a",
  maxWidth: 720,
};

const decisionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginTop: 18,
};

const decisionInputStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const decisionTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const decisionButtonRowStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const decisionButtonStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  fontSize: 14,
};

const decisionHintStyle: CSSProperties = {
  margin: "12px 0 0",
  color: "#0f172a",
  fontSize: 13,
  lineHeight: 1.5,
};

const decisionResultStyle: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 14,
  fontSize: 14,
  lineHeight: 1.55,
};
