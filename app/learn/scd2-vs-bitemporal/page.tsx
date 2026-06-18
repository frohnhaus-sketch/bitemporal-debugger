import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "SCD2 vs Bitemporal",
  description:
    "Understand the difference between SCD2 and bitemporal modeling for historical corrections, as-known reporting and reproducible snapshots.",
};

export default function Page() {
  return <ClientPage />;
}
