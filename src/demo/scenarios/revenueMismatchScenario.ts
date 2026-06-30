export type DemoChoice = {
  id: string;
  label: string;
  correct?: boolean;
  feedback: string;
};

export type DemoScene = {
  id: string;
  eyebrow: string;
  title: string;
  narrative: string;
  focus: "report" | "tables" | "join" | "timeline" | "impact";
  primaryInsight?: string;
  choices?: DemoChoice[];
};

export const revenueMismatchScenario: DemoScene[] = [
  {
    id: "business-alarm",
    eyebrow: "Business alarm",
    title: "Revenue looks too high",
    narrative:
      "The 2024 customer revenue dashboard reports EUR 1.20M. Finance expected EUR 1.05M based on the order system.",
    focus: "report",
    primaryInsight:
      "The KPI is off by EUR 150k, but the pipeline is green.",
  },
  {
    id: "data-looks-clean",
    eyebrow: "Initial checks",
    title: "Everything looks technically correct",
    narrative:
      "Schema checks pass. Primary keys are unique. Foreign keys are valid. No nulls. No failed pipeline runs.",
    focus: "tables",
    primaryInsight:
      "This is not a classic data quality failure.",
  },
  {
    id: "wrong-result",
    eyebrow: "Mismatch confirmed",
    title: "The reported result cannot be explained by orders alone",
    narrative:
      "The order table contains EUR 1.05M for 2024, but the joined customer revenue report shows EUR 1.20M.",
    focus: "report",
    primaryInsight:
      "The mismatch appears after joining historical customer attributes.",
  },
  {
    id: "first-hypotheses",
    eyebrow: "Investigation choice",
    title: "What would you inspect first?",
    narrative:
      "The tables look clean. The mismatch only appears after combining orders with customer history.",
    focus: "tables",
    choices: [
      {
        id: "aggregation",
        label: "Check aggregation logic",
        feedback:
          "Aggregation is correct. The same order amounts are summed consistently.",
      },
      {
        id: "keys",
        label: "Check primary and foreign keys",
        feedback:
          "Keys are valid. Every order has exactly one customer_id.",
      },
      {
        id: "temporal-join",
        label: "Inspect historical join logic",
        correct: true,
        feedback:
          "Correct. The issue is not whether rows match, but which historical version they match.",
      },
    ],
  },
  {
    id: "temporal-join",
    eyebrow: "Temporal join",
    title: "The join ignores historical validity",
    narrative:
      "Orders are matched to the latest customer state instead of the customer state that was valid when the order happened.",
    focus: "join",
    primaryInsight:
      "The join is technically valid, but temporally wrong.",
  },
  {
    id: "root-cause",
    eyebrow: "Root cause",
    title: "Old orders inherit the new customer state",
    narrative:
      "Customer C1 changed segment in 2024. Older orders are now reported using the newer customer state because the join only uses customer_id.",
    focus: "timeline",
    primaryInsight:
      "The missing condition is: order_date must fall between valid_from and valid_to.",
  },
  {
    id: "business-impact",
    eyebrow: "Business impact",
    title: "A clean model produced a wrong business answer",
    narrative:
      "The dashboard overstated 2024 customer revenue by EUR 150k. Pricing and customer value decisions would be based on the wrong historical interpretation.",
    focus: "impact",
    primaryInsight:
      "Fix: join on customer_id and historical validity interval.",
  },
];