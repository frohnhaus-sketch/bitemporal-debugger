import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "Event Modeling Explained – Turning Business Events into Historical State",

  description:
    "Learn event modeling and how business events are used to reconstruct historical state, temporal timelines and analytically consistent data models.",

  keywords: [
    "event modeling",
    "event sourcing",
    "temporal data",
    "historical state",
    "data modeling",
  ],
};

export default function Page() {
  return <ClientPage />;
}
