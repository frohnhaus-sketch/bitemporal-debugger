import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Snapshot Fact Modeling",
  description:
    "Learn how to model snapshot fact tables for historical reporting, month-end views, reproducible metrics and dimensional analysis.",
};

export default function Page() {
  return <ClientPage />;
}
