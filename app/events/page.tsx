import type React from "react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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

function getDataValue(event: EventRow, key: string) {
  const value = event.data?.[key];

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);

  return null;
}

function getEventReferrer(event: EventRow) {
  return getDataValue(event, "referrer") ?? event.referrer ?? event.referer ?? null;
}

function getTrafficSource(referer?: string | null) {
  if (!referer) return "Direct / unknown";

  try {
    const host = new URL(referer).hostname.replace("www.", "");

    if (host === "bitemporal-debugger.vercel.app") return "Internal";
    if (host.includes("news.ycombinator.com")) return "Hacker News";
    if (host.includes("hacker-news.firebaseio.com")) return "Hacker News";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("google")) return "Google";
    if (host.includes("vercel")) return "Internal";
    if (host.includes("localhost")) return "Localhost";

    return host;
  } catch {
    return "Direct / unknown";
  }
}

function isBotEvent(event: EventRow) {
  const ua = event.user_agent?.toLowerCase() ?? "";

  return (
    ua.includes("google-inspectiontool") ||
    ua.includes("inspectiontool") ||
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("crawler") ||
    ua.includes("spider") ||
    ua.includes("bot") ||
    ua.includes("lighthouse") ||
    ua.includes("pagespeed") ||
    ua.includes("slurp") ||
    ua.includes("duckduckbot") ||
    ua.includes("baiduspider")
  );
}

function countBy(
  events: EventRow[],
  getKey: (event: EventRow) => string | null,
) {
  return events.reduce<Record<string, number>>((acc, event) => {
    const key = getKey(event);
    if (!key) return acc;

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function countEvents(events: EventRow[]) {
  return events.reduce<Record<string, number>>((acc, event) => {
    acc[event.event] = (acc[event.event] ?? 0) + 1;
    return acc;
  }, {});
}

function rate(numerator: number, denominator: number) {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function formatEventName(event: string) {
  return event.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeScrollPage(page: string | null) {
  if (!page) return "unknown";

  return page
    .replace(/^learn\//, "")
    .replaceAll("_", "-")
    .replaceAll("alignement", "alignment");
}

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
    <div style={metricCardStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
      {hint && <div style={metricHintStyle}>{hint}</div>}
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
      <h2 style={sectionTitleStyle}>{title}</h2>
      <div style={metricGridStyle}>{children}</div>
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
    <section style={panelStyle}>
      <h2 style={panelTitleStyle}>{title}</h2>
      {children}
    </section>
  );
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
    return <p style={emptyStyle}>{emptyText}</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map(([label, count]) => (
        <div key={label} style={topListRowStyle}>
          <div style={topListLabelStyle}>{label}</div>

          <div style={barOuterStyle}>
            <div
              style={{
                ...barInnerStyle,
                width: `${Math.max(8, (count / max) * 100)}%`,
              }}
            />
          </div>

          <div style={topListCountStyle}>{count}</div>
        </div>
      ))}
    </div>
  );
}

function FunnelTable({
  rows,
}: {
  rows: {
    step: string;
    count: number;
    conversionFromPrevious: string;
    conversionFromLanding: string;
  }[];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={tableHeadRowStyle}>
            <th style={thStyle}>Step</th>
            <th style={thStyle}>Events</th>
            <th style={thStyle}>From Previous</th>
            <th style={thStyle}>From Landing</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.step} style={tableBodyRowStyle}>
              <td style={tdStyle}>{row.step}</td>
              <td style={tdStyle}>{row.count}</td>
              <td style={tdStyle}>{row.conversionFromPrevious}</td>
              <td style={tdStyle}>{row.conversionFromLanding}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EngagementTable({
  rows,
  emptyText,
}: {
  rows: {
    page: string;
    visitors: number;
    avgMaxScroll: number;
    reached75Rate: number;
    reached100Rate: number;
  }[];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <p style={emptyStyle}>{emptyText}</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={tableHeadRowStyle}>
            <th style={thStyle}>Page</th>
            <th style={thStyle}>Visitors</th>
            <th style={thStyle}>Avg Max Scroll</th>
            <th style={thStyle}>Reached 75%</th>
            <th style={thStyle}>Reached 100%</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.page} style={tableBodyRowStyle}>
              <td style={tdStyle}>{row.page}</td>
              <td style={tdStyle}>{row.visitors}</td>
              <td style={tdStyle}>{row.avgMaxScroll}%</td>
              <td style={tdStyle}>{row.reached75Rate}%</td>
              <td style={tdStyle}>{row.reached100Rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

  const { data, error, count } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return (
      <main style={errorPageStyle}>
        <pre>{error.message}</pre>
      </main>
    );
  }

  const events = (data ?? []) as EventRow[];
  const humanEvents = events.filter((event) => !isBotEvent(event));
  const botEvents = events.filter(isBotEvent);

  const counts = countEvents(humanEvents);

  const totalEvents = count ?? events.length;
  const loadedEvents = events.length;
  const humanEventCount = humanEvents.length;

  const entryEvents = humanEvents.filter((event) =>
    ["page_view", "learn_page_opened", "patterns_page_opened"].includes(
      event.event,
    ),
  );

  const pageViews = entryEvents.length;

  const uniqueVisitors = new Set(
    humanEvents.map((event) => event.ip_hash).filter(Boolean),
  ).size;

  const interactions = humanEvents.filter(
    (event) =>
      !["page_view", "learn_page_opened", "patterns_page_opened"].includes(
        event.event,
      ),
  ).length;

  const guidedStarted =
    (counts["guided_sample_investigation_started"] ?? 0) +
    (counts["guided_investigation_started"] ?? 0);

  const scenarioSelected = counts["sample_scenario_selected"] ?? 0;
  const guidedCompleted = counts["guided_investigation_completed"] ?? 0;
  const sampleReportGenerated = counts["sample_investigation_completed"] ?? 0;

  const ownTableSelected = counts["target_validation_own_table_selected"] ?? 0;

  const ownCsvUploaded =
    (counts["target_validation_file_uploaded"] ?? 0) +
    (counts["target_validation_own_table_pasted"] ?? 0);

  const targetReportsGenerated = counts["target_validation_completed"] ?? 0;

  const pdfSaved =
    (counts["investigation_report_pdf_download_clicked"] ?? 0) +
    (counts["report_pdf_saved"] ?? 0);

  const runAnother = counts["another_investigation_started"] ?? 0;

  const revenueScenario =
    humanEvents.filter(
      (event) =>
        event.event === "sample_scenario_selected" &&
        getDataValue(event, "scenario") === "revenue_rebuild",
    ).length ?? 0;

  const customerScenario =
    humanEvents.filter(
      (event) =>
        event.event === "sample_scenario_selected" &&
        getDataValue(event, "scenario") === "customer_missing",
    ).length ?? 0;

  const duplicateScenario =
    humanEvents.filter(
      (event) =>
        event.event === "sample_scenario_selected" &&
        getDataValue(event, "scenario") === "duplicate_snapshot",
    ).length ?? 0;

  const sourceCounts = entryEvents.reduce<Record<string, number>>(
    (acc, event) => {
      const source = getTrafficSource(getEventReferrer(event));
      acc[source] = (acc[source] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const topSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const eventTypeRows = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const scenarioRows = Object.entries(
    countBy(humanEvents, (event) =>
      event.event === "sample_scenario_selected"
        ? getDataValue(event, "scenario")
        : null,
    ),
  ).sort((a, b) => b[1] - a[1]);

  const reportDecisionRows = Object.entries(
    countBy(humanEvents, (event) =>
      event.event === "target_validation_completed"
        ? getDataValue(event, "decision") ??
          getDataValue(event, "severity") ??
          getDataValue(event, "flowState")
        : null,
    ),
  ).sort((a, b) => b[1] - a[1]);

  const scrollByVisitorAndPage = humanEvents.reduce<Record<string, number>>(
    (acc, event) => {
      if (event.event !== "scroll_depth") return acc;

      const page = normalizeScrollPage(getDataValue(event, "page"));
      const visitor = event.ip_hash ? String(event.ip_hash) : "unknown";
      const percent = Number(getDataValue(event, "percent") ?? 0);

      if (!page || !visitor || !percent) return acc;

      const key = `${page}|||${visitor}`;
      acc[key] = Math.max(acc[key] ?? 0, percent);

      return acc;
    },
    {},
  );

  const scrollEngagementByPage = Object.entries(scrollByVisitorAndPage).reduce<
    Record<
      string,
      {
        visitors: number;
        totalMaxScroll: number;
        reached75: number;
        reached100: number;
      }
    >
  >((acc, [key, maxScroll]) => {
    const [page] = key.split("|||");

    if (!acc[page]) {
      acc[page] = {
        visitors: 0,
        totalMaxScroll: 0,
        reached75: 0,
        reached100: 0,
      };
    }

    acc[page].visitors += 1;
    acc[page].totalMaxScroll += maxScroll;

    if (maxScroll >= 75) acc[page].reached75 += 1;
    if (maxScroll >= 100) acc[page].reached100 += 1;

    return acc;
  }, {});

  const scrollEngagementRows = Object.entries(scrollEngagementByPage)
    .map(([page, stats]) => ({
      page,
      visitors: stats.visitors,
      avgMaxScroll: Math.round(stats.totalMaxScroll / stats.visitors),
      reached75Rate: Math.round((stats.reached75 / stats.visitors) * 100),
      reached100Rate: Math.round((stats.reached100 / stats.visitors) * 100),
    }))
    .sort((a, b) => b.avgMaxScroll - a.avgMaxScroll);

  const funnelRows = [
    {
      step: "Landing / Entry page viewed",
      count: pageViews,
      conversionFromPrevious: "100%",
      conversionFromLanding: "100%",
    },
    {
      step: "Guided investigation started",
      count: guidedStarted,
      conversionFromPrevious: rate(guidedStarted, pageViews),
      conversionFromLanding: rate(guidedStarted, pageViews),
    },
    {
      step: "Scenario selected",
      count: scenarioSelected,
      conversionFromPrevious: rate(scenarioSelected, guidedStarted),
      conversionFromLanding: rate(scenarioSelected, pageViews),
    },
    {
      step: "Guided investigation completed",
      count: guidedCompleted,
      conversionFromPrevious: rate(guidedCompleted, scenarioSelected),
      conversionFromLanding: rate(guidedCompleted, pageViews),
    },
    {
      step: "Sample report generated",
      count: sampleReportGenerated,
      conversionFromPrevious: rate(sampleReportGenerated, guidedCompleted),
      conversionFromLanding: rate(sampleReportGenerated, pageViews),
    },
    {
      step: "Own table selected",
      count: ownTableSelected,
      conversionFromPrevious: rate(ownTableSelected, sampleReportGenerated),
      conversionFromLanding: rate(ownTableSelected, pageViews),
    },
    {
      step: "Own CSV pasted / uploaded",
      count: ownCsvUploaded,
      conversionFromPrevious: rate(ownCsvUploaded, ownTableSelected),
      conversionFromLanding: rate(ownCsvUploaded, pageViews),
    },
    {
      step: "Target report generated",
      count: targetReportsGenerated,
      conversionFromPrevious: rate(targetReportsGenerated, ownCsvUploaded),
      conversionFromLanding: rate(targetReportsGenerated, pageViews),
    },
    {
      step: "Report saved as PDF",
      count: pdfSaved,
      conversionFromPrevious: rate(pdfSaved, targetReportsGenerated),
      conversionFromLanding: rate(pdfSaved, pageViews),
    },
    {
      step: "Run another investigation",
      count: runAnother,
      conversionFromPrevious: rate(runAnother, targetReportsGenerated),
      conversionFromLanding: rate(runAnother, pageViews),
    },
  ];

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={badgeStyle}>Product Analytics</div>

          <h1 style={titleStyle}>Show HN Event Dashboard</h1>

          <p style={subtitleStyle}>
            Focused on acquisition, guided investigation activation, own-data
            conversion, report export and repeat usage.
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <MetricSection title="Acquisition">
            <MetricCard label="Unique Visitors" value={uniqueVisitors} />
            <MetricCard label="Entry Page Views" value={pageViews} />
            <MetricCard label="Interactions" value={interactions} />
            <MetricCard label="Human Events" value={humanEventCount} />
            <MetricCard label="Bot Events" value={botEvents.length} />
          </MetricSection>

          <MetricSection title="Investigation Funnel">
            <MetricCard
              label="Guided Started"
              value={guidedStarted}
              hint={rate(guidedStarted, pageViews)}
            />
            <MetricCard
              label="Scenario Selected"
              value={scenarioSelected}
              hint={rate(scenarioSelected, guidedStarted)}
            />
            <MetricCard
              label="Guided Completed"
              value={guidedCompleted}
              hint={rate(guidedCompleted, scenarioSelected)}
            />
            <MetricCard
              label="Sample Reports"
              value={sampleReportGenerated}
              hint={rate(sampleReportGenerated, guidedCompleted)}
            />
            <MetricCard
              label="Own Data Selected"
              value={ownTableSelected}
              hint={rate(ownTableSelected, sampleReportGenerated)}
            />
            <MetricCard
              label="Own CSV Uploaded"
              value={ownCsvUploaded}
              hint={rate(ownCsvUploaded, ownTableSelected)}
            />
            <MetricCard
              label="Reports Generated"
              value={targetReportsGenerated}
              hint={rate(targetReportsGenerated, ownCsvUploaded)}
            />
            <MetricCard
              label="PDF Saved"
              value={pdfSaved}
              hint={rate(pdfSaved, targetReportsGenerated)}
            />
            <MetricCard
              label="Second Investigation"
              value={runAnother}
              hint={rate(runAnother, targetReportsGenerated)}
            />
          </MetricSection>

          <MetricSection title="Scenario Mix">
            <MetricCard label="Revenue Rebuild" value={revenueScenario} />
            <MetricCard label="Customer Missing" value={customerScenario} />
            <MetricCard label="Duplicate Snapshot" value={duplicateScenario} />
          </MetricSection>

          <MetricSection title="Diagnostics">
            <MetricCard label="Total Events" value={totalEvents} />
            <MetricCard label="Loaded Events" value={loadedEvents} />
            <MetricCard label="Event Types" value={eventTypeRows.length} />
          </MetricSection>
        </div>

        <Panel title="Historical Investigation Funnel">
          <FunnelTable rows={funnelRows} />
        </Panel>

        <Panel title="Scenario Selection">
          <TopList rows={scenarioRows} emptyText="No scenario data yet." />
        </Panel>

        <Panel title="Report Outcomes">
          <TopList
            rows={reportDecisionRows}
            emptyText="No report outcome data yet."
          />
        </Panel>

        <Panel title="Learn Page Scroll Engagement">
          <EngagementTable
            rows={scrollEngagementRows}
            emptyText="No scroll depth data yet."
          />
        </Panel>

        <Panel title="Event Types">
          <TopList rows={eventTypeRows} emptyText="No events yet." />
        </Panel>

        <Panel title="Top Sources">
          <TopList rows={topSources} emptyText="No source data yet." />
        </Panel>

        <section style={recentEventsPanelStyle}>
          <div style={recentEventsHeaderStyle}>
            <h2 style={panelTitleStyle}>Recent Events</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeadRowStyle}>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Event</th>
                  <th style={thStyle}>Visitor</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Data</th>
                </tr>
              </thead>

              <tbody>
                {humanEvents.slice(0, 120).map((event, index) => (
                  <tr key={event.id ?? index} style={tableBodyRowStyle}>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {new Date(event.created_at).toLocaleString("de-CH")}
                    </td>

                    <td style={tdStyle}>
                      <span style={eventPillStyle}>
                        {formatEventName(event.event)}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span style={visitorStyle}>
                        {event.ip_hash
                          ? String(event.ip_hash).slice(0, 10)
                          : "unknown"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {getTrafficSource(getEventReferrer(event))}
                    </td>

                    <td style={tdStyle}>
                      <pre style={jsonStyle}>
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

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "#e2e8f0",
  padding: 40,
  fontFamily: "Inter, Arial, sans-serif",
};

const errorPageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "#fecaca",
  padding: 40,
  fontFamily: "Inter, Arial, sans-serif",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#020617",
  border: "1px solid #1e293b",
  color: "#93c5fd",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 12,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  color: "#ffffff",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#94a3b8",
  fontSize: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#ffffff",
  fontSize: 16,
};

const metricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 8,
};

const metricCardStyle: React.CSSProperties = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 16,
};

const metricLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  marginBottom: 8,
};

const metricValueStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 28,
  fontWeight: 800,
};

const metricHintStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  marginTop: 6,
};

const panelStyle: React.CSSProperties = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 18,
  marginBottom: 28,
};

const panelTitleStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: 18,
  color: "#ffffff",
};

const emptyStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 13,
};

const topListRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  alignItems: "center",
};

const topListLabelStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
};

const topListCountStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 700,
  textAlign: "right",
};

const barOuterStyle: React.CSSProperties = {
  height: 8,
  borderRadius: 999,
  background: "#1e293b",
  overflow: "hidden",
};

const barInnerStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "#3b82f6",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const tableHeadRowStyle: React.CSSProperties = {
  background: "#0f172a",
  color: "#94a3b8",
  borderBottom: "1px solid #1e293b",
};

const tableBodyRowStyle: React.CSSProperties = {
  borderTop: "1px solid #1e293b",
};

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

const recentEventsPanelStyle: React.CSSProperties = {
  background: "#020617",
  border: "1px solid #1e293b",
  borderRadius: 14,
  overflow: "hidden",
};

const recentEventsHeaderStyle: React.CSSProperties = {
  padding: "16px 18px",
  borderBottom: "1px solid #1e293b",
};

const eventPillStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "4px 8px",
  borderRadius: 999,
  background: "#1e293b",
  color: "#bfdbfe",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const visitorStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
};

const jsonStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: 12,
  whiteSpace: "pre-wrap",
  fontFamily: "monospace",
};