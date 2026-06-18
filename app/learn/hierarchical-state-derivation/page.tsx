import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Hierarchical State Derivation",
  description:
    "Learn how to derive historized parent states from child entities using business rules, effective dates and historical state timelines.",
};

export default function Page() {
  return <ClientPage />;
}
