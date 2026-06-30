import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Relationship History – Modeling Time-Varying Business Relationships",

  description:
    "Learn how to model relationships over time such as ownership, assignments and hierarchical dependencies.",

  keywords: [
    "relationship history",
    "temporal relationships",
    "SCD2",
    "historical modeling",
  ],
};

export default function Page() {
  return <ClientPage />;
}
