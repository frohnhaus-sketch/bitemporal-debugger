import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Historical Backfill",
  description:
    "Learn how historical backfills reconstruct missing history and why they can affect reproducibility, corrections and reporting trust.",
};

export default function Page() {
  return <ClientPage />;
}
