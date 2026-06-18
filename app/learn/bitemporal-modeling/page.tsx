import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Bitemporal Modeling",
  description:
    "Learn how bitemporal modeling separates business-effective time from system-visible time for corrections, auditability and as-known reporting.",
};

export default function Page() {
  return <ClientPage />;
}
