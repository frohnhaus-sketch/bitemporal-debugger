import type React from "react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type EventRow = {
  id?: string | number;
  event: string;
  data?: Record<string, unknown> | null;
  created_at: string;
  referer?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip_hash?: string | null;
};

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      style={{
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
        {label}
      </div>

      <div style={{ color: "#ffffff", fontSize: 28, fontWeight: 800 }}>
        {value}
      </div>

      {hint && (
        <div style={{ color: "#64748b", fontSize: 11, marginTop: 6 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function MetricSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2
        style={{
          margin: "0 0 10px",
          color: "#ffffff",
          fontSize: 16,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 8,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: 14,
        padding: 18,
        marginBottom: 28,
      }}
    >
      <h2 style={{ margin: "0 0 14px", fontSize: 18, color: "#ffffff" }}>
        {title}
      </h2>

      {children}
    </section>
  );
}

function formatEventName(event: string) {
  return event
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTrafficSource(referer?: string | null) {
  if (!referer) return "Direct / unknown";

  try {
    const host = new URL(referer).hostname.replace("www.", "");

    if (host.includes("reddit")) return "Reddit";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("google")) return "Google";
    if (host.includes("vercel")) return "Vercel";
    if (host.includes("localhost")) return "Localhost";

    return host;
  } catch {
    return "Direct / unknown";
  }
}

function getDataValue(event: EventRow, key: string) {
  const value = event.data?.[key];

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);

  return null;
}

function countBy<T extends string>(
  items: EventRow[],
  getKey: (event: EventRow) => T | null
) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item);
    if (!key) return acc;

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function TopList({
  rows,
  emptyText,
}: {
  rows: [string, number][];
  emptyText: string;
}) {
  const max = Math.max(1, ...rows.map(([, count]) => count));

  if (rows.length === 0) {
    return <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>{emptyText}</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map(([label, count]) => (
        <div
          key={label}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ color: "#cbd5e1", fontSize: 13 }}>{label}</div>

          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: "#1e293b",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(8, (count / max) * 100)}%`,
                height: "100%",
                borderRadius: 999,
                background: "#3b82f6",
              }}
            />
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            {count}
          </div>
        </div>
      ))}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  verticalAlign: "top",
  color: "#cbd5e1",
};

export default async function EventsPage() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Event Dashboard</h1>
        <p>Missing Supabase environment variables.</p>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#fecaca",
          padding: 40,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <pre>{error.message}</pre>
      </main>
    );
  }

  const events = (data ?? []) as EventRow[];

  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event] = (acc[e.event] ?? 0) + 1;
    return acc;
  }, {});

  const pageViews = counts["page_view"] ?? 0;
  const uniqueVisitors = new Set(events.map((e) => e.ip_hash).filter(Boolean)).size;
  const interactions = events.filter((e) => e.event !== "page_view").length;

  const advisorViewed = counts["advisor_viewed"] ?? 0;
  const advisorToggled = counts["advisor_toggled"] ?? 0;

  const advisorExpanded = events.filter(
    (event) =>
      event.event === "advisor_toggled" &&
      event.data?.open === true
  ).length;

  const advisorCollapsed = events.filter(
    (event) =>
      event.event === "advisor_toggled" &&
      event.data?.open === false
  ).length;
  const advisorQuestionChanges = counts["advisor_question_changed"] ?? 0;
  const advisorCompleted = counts["advisor_completed"] ?? 0;
  const advisorRecommendations = counts["advisor_recommendation_generated"] ?? 0;
  const advisorBlueprintsCopied = counts["advisor_blueprint_copied"] ?? 0;

  const patternsPageOpened = counts["patterns_page_opened"] ?? 0;
  const patternCardClicks = counts["pattern_card_clicked"] ?? 0;
  const patternLearnMoreClicks = counts["pattern_learn_more_clicked"] ?? 0;
  const patternCategoryViews = counts["pattern_category_viewed"] ?? 0;
  const scrollDepthEvents = counts["scroll_depth"] ?? 0;

  const exampleModelOpened = counts["example_model_opened"] ?? 0;
  const activationCtaClicks = counts["activation_cta_clicked"] ?? 0;
  const exampleModelCtaClicks = counts["example_model_cta_clicked"] ?? 0;

  const reviewMyModelClicks = events.filter(
    (event) =>
      (event.event === "activation_cta_clicked" ||
        event.event === "example_model_cta_clicked") &&
      event.data?.cta === "review_my_model"
  ).length;

  const exploreMorePatternsClicks = events.filter(
    (event) =>
      event.event === "example_model_cta_clicked" &&
      event.data?.cta === "explore_more_patterns"
  ).length;

  const exampleOpenRate = advisorViewed
    ? Math.round((exampleModelOpened / advisorViewed) * 100)
    : 0;

  const reviewClickRate = exampleModelOpened
    ? Math.round((reviewMyModelClicks / exampleModelOpened) * 100)
    : 0;

  const modelReviewsCompleted = counts["model_review_completed"] ?? 0;
  const modelReviewReportsCopied = counts["model_review_report_copied"] ?? 0;

  const targetValidationsCompleted = counts["target_validation_completed"] ?? 0;

  const analysisRuns = counts["analysis_completed"] ?? 0;

  const examplesLoaded =
    (counts["example_loaded"] ?? 0) +
    (counts["temporal_join_demo_loaded"] ?? 0);

  const csvUploads = counts["csv_uploaded"] ?? 0;

  const sqlGenerated =
    (counts["sql_generated"] ?? 0) +
    (counts["query_generated"] ?? 0);

  const issueSelections =
    (counts["issue_selected"] ?? 0) +
    (counts["join_issue_selected"] ?? 0);

  const timelineIssueClicks = counts["timeline_issue_selected"] ?? 0;
  const timelineGapClicks = counts["timeline_gap_selected"] ?? 0;
  const timelineOverlapClicks = counts["timeline_overlap_selected"] ?? 0;

  const timelineInteractions =
    timelineIssueClicks + timelineGapClicks + timelineOverlapClicks;

  const reportsCopied =
    (counts["modeling_report_copied"] ?? 0) +
    (counts["debug_report_copied"] ?? 0) +
    (counts["Debug Report Copied"] ?? 0);

  const totalReportsCopied =
    reportsCopied + advisorBlueprintsCopied + modelReviewReportsCopied;

  const workflowActions =
    advisorCompleted +
    advisorRecommendations +
    advisorBlueprintsCopied +
    modelReviewsCompleted +
    targetValidationsCompleted +
    analysisRuns;

  const advisorStartRate = pageViews
    ? Math.round((advisorViewed / pageViews) * 100)
    : 0;

  const advisorCopyRate = advisorViewed
    ? Math.round((advisorBlueprintsCopied / advisorViewed) * 100)
    : 0;

  const patternCatalogRate = pageViews
    ? Math.round((patternsPageOpened / pageViews) * 100)
    : 0;

  const patternOpenRate = patternsPageOpened
    ? Math.round((patternLearnMoreClicks / patternsPageOpened) * 100)
    : 0;

  const workflowRate = pageViews
    ? Math.round((workflowActions / pageViews) * 100)
    : 0;

  const analyzeRate = pageViews
    ? Math.round((analysisRuns / pageViews) * 100)
    : 0;

  const uploadRate = pageViews
    ? Math.round((csvUploads / pageViews) * 100)
    : 0;

  const copyRate = workflowActions
    ? Math.round((totalReportsCopied / workflowActions) * 100)
    : 0;

  const sourceCounts = events.reduce<Record<string, number>>((acc, event) => {
    const source = getTrafficSource(event.referer ?? event.referrer);
    acc[source] = (acc[source] ?? 0) + 1;
    return acc;
  }, {});

  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const eventTypeRows = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const topAdvisorQuestions = Object.entries(
    countBy(events, (event) =>
      event.event === "advisor_question_changed"
        ? getDataValue(event, "question")
        : null
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topAdvisorValues = Object.entries(
    countBy(events, (event) =>
      event.event === "advisor_question_changed"
        ? `${getDataValue(event, "question")}: ${getDataValue(event, "value")}`
        : null
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topPatterns = Object.entries(
    countBy(events, (event) =>
      event.event === "pattern_learn_more_clicked" ||
      event.event === "pattern_card_clicked"
        ? getDataValue(event, "pattern")
        : null
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topPatternGroups = Object.entries(
    countBy(events, (event) =>
      event.event === "pattern_learn_more_clicked" ||
      event.event === "pattern_card_clicked"
        ? getDataValue(event, "group")
        : null
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const scrollDepthRows = Object.entries(
    countBy(events, (event) =>
      event.event === "scroll_depth"
        ? `${getDataValue(event, "page") ?? "unknown"}: ${getDataValue(
            event,
            "percent"
          )}%`
        : null
    )
  )
    .sort((a, b) => {
      const aNum = Number(a[0].match(/(\d+)%/)?.[1] ?? 0);
      const bNum = Number(b[0].match(/(\d+)%/)?.[1] ?? 0);
      return aNum - bNum;
    });

  const activationCtaRows = Object.entries(
    countBy(events, (event) =>
      event.event === "activation_cta_clicked" ||
      event.event === "example_model_cta_clicked"
        ? `${event.event}: ${getDataValue(event, "cta")}`
        : null
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topAdvisorRecommendations = Object.entries(
    countBy(events, (event) =>
      event.event === "advisor_recommendation_generated"
        ? getDataValue(event, "recommendation")
        : null
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#e2e8f0",
        padding: 40,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              padding: "6px 10px",
              borderRadius: 999,
              background: "#020617",
              border: "1px solid #1e293b",
              color: "#93c5fd",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Product Analytics
          </div>

          <h1 style={{ margin: 0, fontSize: 34, color: "#ffffff" }}>
            Event Dashboard
          </h1>

          <p style={{ marginTop: 8, color: "#94a3b8", fontSize: 14 }}>
            Tracks acquisition, Advisor usage, Pattern Catalog interest,
            validation workflows and high-intent copy actions.
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <MetricSection title="Acquisition">
            <MetricCard label="Unique Visitors" value={uniqueVisitors} />
            <MetricCard label="Page Views" value={pageViews} />
            <MetricCard label="Interactions" value={interactions} />
          </MetricSection>

          <MetricSection title="Advisor Funnel">
            <MetricCard label="Advisor Viewed" value={advisorViewed} />
            <MetricCard label="Advisor Toggles" value={advisorToggled} />
            <MetricCard label="Expanded" value={advisorExpanded} />
            <MetricCard label="Collapsed" value={advisorCollapsed} />
            <MetricCard label="Question Changes" value={advisorQuestionChanges} />
            <MetricCard label="Blueprint Copies" value={advisorBlueprintsCopied} />
            <MetricCard label="Advisor Start Rate" value={`${advisorStartRate}%`} />
            <MetricCard label="Advisor Copy Rate" value={`${advisorCopyRate}%`} />
            <MetricCard label="Completed" value={advisorCompleted} />
            <MetricCard label="Recommendations" value={advisorRecommendations} />
          </MetricSection>

          <MetricSection title="Activation Funnel">
            <MetricCard label="Example Models Opened" value={exampleModelOpened} />
            <MetricCard label="Activation CTA Clicks" value={activationCtaClicks} />
            <MetricCard label="Example CTA Clicks" value={exampleModelCtaClicks} />
            <MetricCard label="Review My Model Clicks" value={reviewMyModelClicks} />
            <MetricCard label="Explore Pattern Clicks" value={exploreMorePatternsClicks} />
            <MetricCard label="Example Open Rate" value={`${exampleOpenRate}%`} />
            <MetricCard label="Review Click Rate" value={`${reviewClickRate}%`} />
          </MetricSection>

          <MetricSection title="Pattern Catalog">
            <MetricCard label="Catalog Opens" value={patternsPageOpened} />
            <MetricCard label="Category Views" value={patternCategoryViews} />
            <MetricCard label="Card Clicks" value={patternCardClicks} />
            <MetricCard label="Learn More Clicks" value={patternLearnMoreClicks} />
            <MetricCard label="Scroll Events" value={scrollDepthEvents} />
            <MetricCard label="Catalog Rate" value={`${patternCatalogRate}%`} />
            <MetricCard label="Pattern Open Rate" value={`${patternOpenRate}%`} />
          </MetricSection>

          <MetricSection title="Product Workflows">
            <MetricCard label="Model Reviews" value={modelReviewsCompleted} />
            <MetricCard label="Target Validations" value={targetValidationsCompleted} />
            <MetricCard label="Analysis Runs" value={analysisRuns} />
            <MetricCard label="Workflow Actions" value={workflowActions} />
            <MetricCard label="Workflow Rate" value={`${workflowRate}%`} />
          </MetricSection>

          <MetricSection title="Historical Validation">
            <MetricCard label="Examples Loaded" value={examplesLoaded} />
            <MetricCard label="CSV Uploads" value={csvUploads} />
            <MetricCard label="Analyze Rate" value={`${analyzeRate}%`} />
            <MetricCard label="Upload Rate" value={`${uploadRate}%`} />
          </MetricSection>

          <MetricSection title="High Intent">
            <MetricCard label="Reports Copied" value={reportsCopied} />
            <MetricCard label="Total Copies" value={totalReportsCopied} />
            <MetricCard label="Copy Rate" value={`${copyRate}%`} />
            <MetricCard label="SQL Generated" value={sqlGenerated} />
          </MetricSection>

          <MetricSection title="Diagnostics">
            <MetricCard label="Issues Opened" value={issueSelections} />
            <MetricCard label="Timeline Clicks" value={timelineInteractions} />
            <MetricCard label="Timeline Issues" value={timelineIssueClicks} />
            <MetricCard label="Timeline Gaps" value={timelineGapClicks} />
            <MetricCard label="Timeline Overlaps" value={timelineOverlapClicks} />
            <MetricCard label="All Events" value={events.length} />
          </MetricSection>
        </div>

        <Panel title="Top Advisor Questions">
          <TopList rows={topAdvisorQuestions} emptyText="No Advisor question data yet." />
        </Panel>

        <Panel title="Top Advisor Answers">
          <TopList rows={topAdvisorValues} emptyText="No Advisor answer data yet." />
        </Panel>

        <Panel title="Top Advisor Recommendations">
          <TopList
            rows={topAdvisorRecommendations}
            emptyText="No Advisor recommendation data yet."
          />
        </Panel>

        <Panel title="Top Patterns">
          <TopList rows={topPatterns} emptyText="No pattern data yet." />
        </Panel>

        <Panel title="Top Pattern Groups">
          <TopList rows={topPatternGroups} emptyText="No pattern group data yet." />
        </Panel>

        <Panel title="Scroll Depth">
          <TopList rows={scrollDepthRows} emptyText="No scroll depth data yet." />
        </Panel>

        <Panel title="Activation CTAs">
          <TopList rows={activationCtaRows} emptyText="No activation CTA data yet." />
        </Panel>

        <Panel title="Event Types">
          <TopList rows={eventTypeRows} emptyText="No events yet." />
        </Panel>

        <Panel title="Top Sources">
          <TopList rows={topSources} emptyText="No source data yet." />
        </Panel>

        <section
          style={{
            background: "#020617",
            border: "1px solid #1e293b",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid #1e293b",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, color: "#ffffff" }}>
              Recent Events
            </h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#0f172a", color: "#94a3b8" }}>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Visitor</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Data</th>
                </tr>
              </thead>

              <tbody>
                {events.slice(0, 100).map((event, index) => (
                  <tr
                    key={event.id ?? index}
                    style={{
                      borderTop: "1px solid #1e293b",
                    }}
                  >
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {new Date(event.created_at).toLocaleString("de-CH")}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "#1e293b",
                          color: "#bfdbfe",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatEventName(event.event)}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>
                        {event.ip_hash ? String(event.ip_hash).slice(0, 10) : "unknown"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {getTrafficSource(event.referer ?? event.referrer)}
                    </td>

                    <td style={tdStyle}>
                      <pre
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: 12,
                          whiteSpace: "pre-wrap",
                          fontFamily: "monospace",
                        }}
                      >
                        {JSON.stringify(event.data ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}