import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
title: "As-Known Reporting Explained – Reconstruct Historical Visibility",

description:
"Learn as-known reporting and how historical visibility is reconstructed using visible-time modeling, auditability and reproducible reporting snapshots.",

keywords:
["as-known reporting","visible time","historical visibility","snapshot reproducibility","temporal reporting"]};

export default function Page() {
  return <ClientPage />;
}
