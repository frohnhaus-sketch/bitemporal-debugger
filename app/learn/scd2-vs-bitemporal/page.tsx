import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "SCD2 vs Bitemporal Modeling – Key Differences in Historical Data",

  description:
    "Understand differences between SCD2 and bitemporal modeling for corrections, auditability and reproducible snapshots.",

  keywords: [
    "SCD2",
    "bitemporal modeling",
    "temporal data",
    "data warehousing",
  ],
};

export default function Page() {
  return <ClientPage />;
}
