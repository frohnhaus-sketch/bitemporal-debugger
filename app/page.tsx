"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

import { AdvisorPanel } from "@/components/AdvisorPanel";
import { ModelReviewPanel } from "@/components/ModelReviewPanel";
import { TargetTableValidationPanel } from "@/components/TargetTableValidationPanel";
import { TwoSourceValidationWorkflow } from "@/components/TwoSourceValidationWorkflow";
import { Footer } from "@/components/Footer";

import { track } from "@/lib/analytics";

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
        background: "#0f172a",
        padding: isMobile ? "16px 10px" : "40px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <section style={{ marginBottom: -12 }}>
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                background: "#e0f2fe",
                color: "#075985",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              HISTORIZED DATA MODELING
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 32 : 42,
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                color: "#ffffff",
              }}
            >
              Build Historical Models.
              Validate Them.
              Deploy With Confidence.
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                maxWidth: 760,
                fontSize: 18,
                lineHeight: 1.45,
                color: "#cbd5e1",
              }}
            >
              Design, review and validate historical data models before they
              reach production.
            </p>

            <p
              style={{
                margin: "8px 0 18px",
                maxWidth: 820,
                fontSize: 15,
                lineHeight: 1.45,
                color: "#cbd5e1",
              }}
            >
              Built for Data Engineers working with SCD2 dimensions,
              historized tables, snapshot reporting and temporal joins.
            </p>
          </div>
        </section>

        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: "#e0f2fe",
            border: "1px solid #7dd3fc",
            color: "#075985",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Start with the Advisor, review existing SQL or notebooks, then
          validate the generated target table.
        </div>

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