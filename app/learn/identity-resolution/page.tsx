import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Identity Resolution – Linking Entities Across Time and Systems",

  description:
    "Learn how identity resolution links multiple identifiers for the same entity across systems and historical timelines.",

  keywords: [
    "identity resolution",
    "entity matching",
    "master data",
    "temporal identity",
  ],
};

export default function Page() {
  return <ClientPage />;
}
