import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Conformance – Aligning Temporal Data Across Systems",

  description:
    "Learn how historical conformance ensures consistency across multiple source systems and detects temporal mismatches in data history.",

  keywords: [
    "historical conformance",
    "data consistency",
    "temporal alignment",
    "data quality",
  ],
};

export default function Page() {
  return <ClientPage />;
}
