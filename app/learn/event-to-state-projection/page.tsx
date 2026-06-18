import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Event-to-State Projection",
  description:
    "Learn how to convert point-in-time events into historized state intervals for reporting, temporal joins and state reconstruction.",
};

export default function Page() {
  return <ClientPage />;
}
