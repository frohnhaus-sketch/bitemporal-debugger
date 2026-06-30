import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "Event-to-State Projection – Converting Events into Temporal State Models",

  description:
    "Learn how event streams are transformed into historized state intervals for reporting, analytics and temporal queries.",

  keywords: [
    "event to state",
    "event sourcing",
    "temporal state",
    "historical modeling",
  ],
};

export default function Page() {
  return <ClientPage />;
}
