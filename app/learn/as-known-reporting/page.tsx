import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "As-Known Reporting",
  description:
    "Learn how as-known reporting reconstructs what was visible or believed at a specific point in time using visible-time history.",
};

export default function Page() {
  return <ClientPage />;
}
