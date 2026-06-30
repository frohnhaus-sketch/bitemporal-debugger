import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "State Modeling Explained – Representing Business State Over Time",

  description:
    "Learn how state modeling represents entities over time using validity intervals and temporal consistency rules.",

  keywords: ["state modeling", "temporal state", "SCD2", "historical data"],
};

export default function Page() {
  return <ClientPage />;
}
