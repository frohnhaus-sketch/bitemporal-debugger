import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "State-to-State Alignment – Matching Temporal States Across Systems",

  description:
    "Learn how to align two historical state tables and detect gaps, overlaps and mismatched temporal intervals.",

  keywords: ["state alignment", "temporal join", "data consistency", "SCD2"],
};

export default function Page() {
  return <ClientPage />;
}
