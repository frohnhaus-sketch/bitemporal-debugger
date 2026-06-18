import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Relationship History",
  description:
    "Learn how to model relationships that change over time, such as customer assignments, brokers, managers and historical ownership.",
};

export default function Page() {
  return <ClientPage />;
}
