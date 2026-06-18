import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Dimension Completion",
  description:
    "Learn how Dimension Completion solves historical coverage gaps, late arriving dimensions and missing temporal matches in historized data models.",
};

export default function Page() {
  return <ClientPage />;
}