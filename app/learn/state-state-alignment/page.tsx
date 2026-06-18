import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "State-to-State Alignment",
  description:
    "Learn how to align two historized state tables across valid time and detect gaps, overlaps and ambiguous historical matches.",
};

export default function Page() {
  return <ClientPage />;
}
