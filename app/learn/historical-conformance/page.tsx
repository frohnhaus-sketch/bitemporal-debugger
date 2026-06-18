import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Conformance",
  description:
    "Learn how to align historical timelines across multiple source systems and detect conformance risks in historized data models.",
};

export default function Page() {
  return <ClientPage />;
}
