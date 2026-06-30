import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title:
    "State Reduction – Simplifying Historical Data into Business-Relevant States",

  description:
    "Learn how to reduce technical history into meaningful business states for analytics and reporting.",

  keywords: ["state reduction", "data simplification", "historical modeling"],
};

export default function Page() {
  return <ClientPage />;
}
