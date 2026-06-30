import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Winner Selection – Choosing the Correct Record in Time",

  description:
    "Learn how to resolve competing historical records using priority rules, visibility time and deterministic selection logic.",

  keywords: [
    "winner selection",
    "data conflict resolution",
    "temporal priority",
    "bitemporal",
  ],
};

export default function Page() {
  return <ClientPage />;
}
