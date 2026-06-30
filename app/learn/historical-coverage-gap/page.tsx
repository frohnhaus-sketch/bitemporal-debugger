import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Coverage Gap – Missing Time Ranges in Data Models",

  description:
    "Learn how missing valid-time coverage creates gaps in historical reporting and breaks temporal joins and analytics.",

  keywords: ["coverage gap", "temporal completeness", "data quality", "SCD2"],
};

export default function Page() {
  return <ClientPage />;
}
