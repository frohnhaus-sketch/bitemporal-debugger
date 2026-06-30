import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Backfill Explained – Reconstructing Missing History",

  description:
    "Learn how historical backfills reconstruct missing data and how they impact reproducibility, corrections and reporting trust.",

  keywords: [
    "historical backfill",
    "data repair",
    "temporal correction",
    "SCD2",
  ],
};

export default function Page() {
  return <ClientPage />;
}
