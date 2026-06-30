import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Overlap Explained – Fixing Conflicting Time Intervals",

  description:
    "Learn how overlapping historical intervals create inconsistencies and how to detect and resolve temporal overlaps in data.",

  keywords: [
    "temporal overlap",
    "interval consistency",
    "data quality",
    "SCD2",
  ],
};

export default function Page() {
  return <ClientPage />;
}
