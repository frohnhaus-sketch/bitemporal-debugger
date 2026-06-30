import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Snapshot Drift Explained – Why Historical Reports Change Over Time",

  description:
    "Learn snapshot drift and how rebuilt historical reports can differ due to corrections, logic changes or data updates.",

  keywords: ["snapshot drift", "historical reporting", "data consistency"],
};

export default function Page() {
  return <ClientPage />;
}
