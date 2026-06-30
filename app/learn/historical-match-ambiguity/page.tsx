import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Match Ambiguity – Resolving Temporal Join Conflicts",

  description:
    "Learn why temporal joins can return multiple matches and how to detect and resolve historical ambiguity in data models.",

  keywords: [
    "temporal joins",
    "match ambiguity",
    "data conflicts",
    "historical modeling",
  ],
};

export default function Page() {
  return <ClientPage />;
}
