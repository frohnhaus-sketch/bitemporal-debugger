import type { Goal, Source } from "./useSketch";

export const goalOptions: { id: Goal; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "historical-report", label: "Historical Report", icon: "🕒" },
  { id: "target-table", label: "Target Table", icon: "📦" },
  { id: "data-product", label: "Data Product", icon: "🔄" },
];

export const sourceOptions: Source[] = [
  { id: "orders", label: "Orders", historical: false },
  { id: "customers", label: "Customers", historical: false },
  { id: "products", label: "Products", historical: false },
  { id: "contracts", label: "Contracts", historical: false },
  { id: "accounts", label: "Accounts", historical: false },
];

export function goalLabel(goal: Goal | null) {
  if (goal === "dashboard") return "Dashboard";
  if (goal === "historical-report") return "Historical Report";
  if (goal === "target-table") return "Target Table";
  if (goal === "data-product") return "Data Product";
  return "Report";
}
