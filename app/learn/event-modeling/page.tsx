import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Event Modeling",
  description:
    "Learn how event modeling represents business occurrences at a point in time and how events are used to reconstruct historical states.",
};

export default function Page() {
  return <ClientPage />;
}
