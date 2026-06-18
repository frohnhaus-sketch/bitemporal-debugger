import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Identity Resolution",
  description:
    "Learn how to resolve multiple identifiers for the same business entity across systems, migrations and historical data models.",
};

export default function Page() {
  return <ClientPage />;
}
