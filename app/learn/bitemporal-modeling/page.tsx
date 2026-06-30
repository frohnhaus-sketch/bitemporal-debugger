import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "Bitemporal Modeling Explained – Valid Time vs Visible Time | Historical Data Modeling",

  description:
    "Learn bitemporal modeling with valid time and visible time separation. Understand corrections, temporal consistency, snapshot reproducibility and historical reporting behavior.",

  keywords: [
    "bitemporal modeling",
    "valid time",
    "visible time",
    "temporal data",
    "historical modeling",
    "SCD2",
  ],
};

export default function Page() {
  return <ClientPage />;
}
