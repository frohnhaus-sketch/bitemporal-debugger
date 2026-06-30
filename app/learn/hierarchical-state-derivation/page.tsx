import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "Hierarchical State Derivation – Building Parent States from Child History",

  description:
    "Learn how to derive historical parent states from child entities using business rules and temporal aggregation logic.",

  keywords: [
    "hierarchical modeling",
    "state derivation",
    "temporal hierarchy",
    "historical aggregation",
  ],
};

export default function Page() {
  return <ClientPage />;
}
