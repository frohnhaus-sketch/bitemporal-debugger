import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Dimension Completion Explained – Fixing Historical Coverage Gaps",

  description:
    "Learn dimension completion and how to resolve missing historical coverage, late-arriving dimensions and incomplete temporal joins in data models.",

  keywords: [
    "dimension completion",
    "historical coverage gap",
    "temporal joins",
    "SCD2",
    "data quality",
  ],
};

export default function Page() {
  return <ClientPage />;
}
