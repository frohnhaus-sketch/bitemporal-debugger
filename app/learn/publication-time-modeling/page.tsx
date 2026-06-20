import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Publication-Time Modeling",
  description:
    "Understand publication-time modeling, also known as tritemporal modeling: valid time, visible time and publication time for reproducible historical reporting.",
};

export default function Page() {
  return <ClientPage />;
}
