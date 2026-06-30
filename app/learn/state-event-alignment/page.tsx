import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "State-to-Event Alignment – Matching Historical States with Event Streams | Temporal Data Modeling",
  description:
    "Learn state-to-event alignment and how to map historized state tables to event streams for correct attribution, temporal consistency and reliable historical reconstruction.",

  keywords: [
    "state to event alignment",
    "temporal alignment",
    "event sourcing",
    "historical state",
    "temporal data modeling",
    "data consistency",
  ],
};

export default function Page() {
  return <ClientPage />;
}
