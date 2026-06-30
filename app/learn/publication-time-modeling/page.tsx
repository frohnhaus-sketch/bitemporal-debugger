import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "Publication-Time Modeling (Tritemporal) – Valid, Visible & Published Time",

  description:
    "Learn tritemporal modeling with valid, visible and publication time for fully reproducible historical reporting systems.",

  keywords: [
    "publication time",
    "tritemporal modeling",
    "valid time",
    "visible time",
  ],
};

export default function Page() {
  return <ClientPage />;
}
