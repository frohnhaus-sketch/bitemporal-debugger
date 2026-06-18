import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Overlap",
  description:
    "Learn how overlapping historical intervals create ambiguous states, duplicate records and unreliable temporal joins.",
};

export default function Page() {
  return <ClientPage />;
}
