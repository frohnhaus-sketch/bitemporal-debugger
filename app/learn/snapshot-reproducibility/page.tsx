import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Snapshot Reproducibility – Ensuring Stable Historical Reports",

  description:
    "Learn how to ensure reproducible historical snapshots even when source data or logic changes over time.",

  keywords: [
    "snapshot reproducibility",
    "auditability",
    "historical reporting",
  ],
};

export default function Page() {
  return <ClientPage />;
}
