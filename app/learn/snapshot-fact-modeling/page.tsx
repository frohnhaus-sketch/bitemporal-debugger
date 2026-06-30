import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Snapshot Fact Modeling – Designing Time-Based Analytical Tables",

  description:
    "Learn snapshot fact modeling for month-end reporting, reproducible metrics and dimensional analysis over time.",

  keywords: ["snapshot fact", "data warehousing", "historical analytics"],
};

export default function Page() {
  return <ClientPage />;
}
