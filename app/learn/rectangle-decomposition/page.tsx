import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Rectangle Decomposition",
  description:
    "Learn how rectangle decomposition projects multiple temporal attributes onto a common timeline for complete historical reporting.",
};

export default function Page() {
  return <ClientPage />;
}
