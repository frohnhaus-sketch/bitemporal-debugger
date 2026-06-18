import type { Metadata } from "next";
import PatternsClient from "./PatternsClient";

export const metadata: Metadata = {
  title:
    "Historical Data Modeling Patterns | Historical Data Modeling Workbench",
  description:
    "Browse historical data modeling patterns including SCD2, bitemporal modeling, temporal joins, snapshot reporting, dimension completion, historical conformance and validation patterns.",
};

export default function PatternsPage() {
  return <PatternsClient />;
}
