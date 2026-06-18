import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Snapshot Reproducibility",
  description:
    "Learn why historical reports can change when rerun and how snapshot reproducibility protects reporting, auditability and bitemporal models.",
};

export default function Page() {
  return <ClientPage />;
}
