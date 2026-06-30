import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Learn Event Prioritization – Historical Data Modeling Guide",
  description:
    "Learn how to select the reporting-relevant event when multiple historical events compete to represent the same business outcome.",
};

export default function Page() {
  return <ClientPage />;
}
