import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "State-to-Event Alignment",
  description:
    "Learn how to align point-in-time events with historized states for correct attribution, reporting and temporal joins.",
};

export default function Page() {
  return <ClientPage />;
}
