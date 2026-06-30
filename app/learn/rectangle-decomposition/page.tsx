import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Rectangle Decomposition – Multi-Dimensional Temporal Modeling",

  description:
    "Learn how rectangle decomposition transforms multiple temporal attributes into unified historical structures for analytics.",

  keywords: [
    "rectangle decomposition",
    "temporal modeling",
    "multi-dimensional history",
  ],
};

export default function Page() {
  return <ClientPage />;
}
