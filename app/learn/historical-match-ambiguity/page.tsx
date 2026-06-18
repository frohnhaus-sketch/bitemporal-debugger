import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Match Ambiguity",
  description:
    "Learn why temporal joins can produce multiple valid matches and how to detect ambiguous historical relationships before reporting.",
};

export default function Page() {
  return <ClientPage />;
}
