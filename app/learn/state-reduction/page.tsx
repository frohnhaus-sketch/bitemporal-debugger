import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "State Reduction",
  description:
    "Learn how to reduce technical history into reporting-relevant business states for simpler, explainable historical models.",
};

export default function Page() {
  return <ClientPage />;
}
