import type { Metadata } from "next";
import PatternsClient from "./PatternsClient";

export const metadata: Metadata = {
  title:
    "Explore Historical Data Modeling Patterns – SCD2, Bitemporal, Snapshots & Temporal Models",
  description:
    "Browse historical data modeling patterns including SCD2, bitemporal modeling, temporal joins, snapshot reporting, dimension completion, historical conformance and validation patterns.",
};

export default function PatternsPage() {
  return <PatternsClient />;
}
