import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Tritemporal Modeling",
  description:
    "Learn how tritemporal modeling separates valid time, visibility time and publication time for reproducible historical reporting, auditability and published reports.",
};

export default function Page() {
  return <ClientPage />;
}
