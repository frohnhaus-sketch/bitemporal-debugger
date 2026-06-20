import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Snapshot Drift",
  description:
    "Understand snapshot drift: when historical reports change because old reporting periods are rebuilt with newer data, corrections or different logic.",
};

export default function Page() {
  return <ClientPage />;
}
