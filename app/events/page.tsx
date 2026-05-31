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
}: {
  label: string;
  value: string | number;
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
    </div>
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
    .limit(250);

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

  const analyzeClicks =
    (counts["analysis_completed"] ?? 0) +
    (counts["analyze_clicked"] ?? 0);

  const examplesLoaded =
    (counts["example_loaded"] ?? 0) +
    (counts["temporal_join_demo_loaded"] ?? 0);

  const sqlGenerated =
    (counts["sql_generated"] ?? 0) +
    (counts["query_generated"] ?? 0);

  const reportsCopied =
    (counts["modeling_report_copied"] ?? 0) +
    (counts["debug_report_copied"] ?? 0) +
    (counts["Debug Report Copied"] ?? 0);

  const interactions = events.filter((e) => e.event !== "page_view").length;

  const uniqueVisitors = new Set(
    events.map((e) => e.ip_hash).filter(Boolean)
  ).size;

  const copyRate = analyzeClicks
    ? Math.round((reportsCopied / analyzeClicks) * 100)
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
            Track page views, interactions, demo loads, analysis runs, SQL
            generation, and copied reports.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            marginBottom: 28,
          }}
        >
          <MetricCard label="All events" value={events.length} />
          <MetricCard label="Unique visitors" value={uniqueVisitors} />
          <MetricCard label="Page views" value={pageViews} />
          <MetricCard label="Interactions" value={interactions} />
          <MetricCard label="Analysis runs" value={analyzeClicks} />
          <MetricCard label="Examples loaded" value={examplesLoaded} />
          <MetricCard label="SQL generated" value={sqlGenerated} />
          <MetricCard label="Reports copied" value={reportsCopied} />
          <MetricCard label="Copy rate" value={`${copyRate}%`} />
        </div>

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
            Event types
          </h2>

          {eventTypeRows.length === 0 ? (
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
              No events yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {eventTypeRows.map(([eventName, count]) => (
                <div
                  key={eventName}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr 48px",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#cbd5e1", fontSize: 13 }}>
                    {formatEventName(eventName)}
                  </div>

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
                        width: `${Math.max(
                          8,
                          (count /
                            Math.max(...eventTypeRows.map(([, c]) => c))) *
                            100
                        )}%`,
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
          )}
        </section>

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
            Top sources
          </h2>

          {topSources.length === 0 ? (
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
              No source data yet.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {topSources.map(([source, count]) => (
                <div
                  key={source}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr 48px",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#cbd5e1", fontSize: 13 }}>{source}</div>

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
                        width: `${Math.max(
                          8,
                          (count / Math.max(...topSources.map(([, c]) => c))) *
                            100
                        )}%`,
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
          )}
        </section>

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
              Recent events
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
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Data</th>
                </tr>
              </thead>

              <tbody>
                {events.slice(0, 80).map((event, index) => (
                  <tr
                    key={event.id ?? index}
                    style={{
                      borderTop: "1px solid #1e293b",
                    }}
                  >
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {new Date(event.created_at).toLocaleString()}
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