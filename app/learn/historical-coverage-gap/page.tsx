import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Coverage Gap",
  description:
    "Learn how missing valid-time coverage creates reporting gaps, failed temporal joins and incomplete historical dimensions.",
};

export default function Page() {
  return <ClientPage />;
}
