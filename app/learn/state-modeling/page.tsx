import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "State Modeling",
  description:
    "Learn how state modeling represents business entities over time using validity intervals, historized records and historical reporting semantics.",
};

export default function Page() {
  return <ClientPage />;
}
