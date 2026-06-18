import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Winner Selection",
  description:
    "Learn how historical winner selection resolves competing valid records using priority rules, source precedence, visibility time and deterministic tie-breakers.",
};

export default function Page() {
  return <ClientPage />;
}
