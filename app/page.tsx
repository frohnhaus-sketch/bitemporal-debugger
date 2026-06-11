"use client";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { AdvisorPanel } from "@/components/AdvisorPanel";
import { ModelReviewPanel } from "@/components/ModelReviewPanel";
import { TargetTableValidationPanel } from "@/components/TargetTableValidationPanel";
import { TwoSourceValidationWorkflow } from "@/components/TwoSourceValidationWorkflow";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";

const TOPIC_TAGS = [
  "SCD2",
  "Snapshots",
  "Temporal Joins",
  "Late Arriving Dimensions",
  "Historical Validation",
];

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 900);

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    track("page_view", {
      path: window.location.pathname,
      referrer: document.referrer,
      url: window.location.href,
    });
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 24% 8%, #2563eb 0, #1e3a8a 22%, #0f172a 54%, #020617 100%)",
        padding: isMobile ? "18px 10px" : "44px 40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1320,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <section style={{ marginBottom: isMobile ? 22 : 34 }}>
          <div
            style={{
              maxWidth: 920,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  color: "#075985",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  marginBottom: 16,
                }}
              >
                HISTORICAL DATA MODELING WORKBENCH
              </div>

              <h1
                style={{
                  margin: 0,
                  maxWidth: 880,
                  fontSize: isMobile ? 32 : 60,
                  lineHeight: 1.02,
                  letterSpacing: isMobile ? "-0.045em" : "-0.06em",
                  color: "#ffffff",
                }}
              >
                Design, review and validate historical data models.
              </h1>

              <p
                style={{
                  margin: "18px 0 0",
                  maxWidth: 780,
                  fontSize: isMobile ? 17 : 21,
                  lineHeight: 1.5,
                  color: "#dbeafe",
                }}
              >
                A practical workbench for Data Engineers working with SCD2
                dimensions, bitemporal history, snapshot reporting,
                late-arriving data and temporal joins.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginTop: 22,
                }}
              >
                {TOPIC_TAGS.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(219, 234, 254, 0.14)",
                      border: "1px solid rgba(191, 219, 254, 0.28)",
                      color: "#dbeafe",
                      fontSize: 12,
                      fontWeight: 900,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <AdvisorPanel />

        <ModelReviewPanel />

        <TargetTableValidationPanel />

        <TwoSourceValidationWorkflow />

        <Footer />
      </div>

      <Analytics />
    </main>
  );
}