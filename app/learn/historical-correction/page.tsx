import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Correction Explained – Retroactive Data Fixes in Time",

  description:
    "Learn how historical corrections affect bitemporal models, snapshot reporting and reproducibility of past analytical results.",

  keywords: [
    "historical correction",
    "retroactive change",
    "bitemporal modeling",
    "snapshot drift",
  ],
};

export default function Page() {
  return <ClientPage />;
}
