import type { MetadataRoute } from "next";

const baseUrl = "https://bitemporal-debugger.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/patterns",

    "/learn/state-modeling",
    "/learn/event-modeling",
    "/learn/bitemporal-modeling",
    "/learn/publication-time-modeling",
    "/learn/scd2-vs-bitemporal",

    "/learn/state-state-alignment",
    "/learn/state-event-alignment",
    "/learn/historical-conformance",

    "/learn/dimension-completion",
    "/learn/relationship-history",
    "/learn/identity-resolution",

    "/learn/snapshot-fact-modeling",
    "/learn/snapshot-reproducibility",
    "/learn/snapshot-drift",
    "/learn/as-known-reporting",

    "/learn/historical-correction",
    "/learn/historical-coverage-gap",
    "/learn/historical-overlap",
    "/learn/historical-match-ambiguity",

    "/learn/rectangle-decomposition",
    "/learn/hierarchical-state-derivation",
    "/learn/event-prioritization",
    "/learn/historical-winner-selection",
    "/learn/state-reduction",
    "/learn/event-to-state-projection",
    "/learn/historical-backfill",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" ? "weekly" : route === "/patterns" ? "weekly" : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/patterns"
          ? 0.95
          : route.includes("state-modeling") ||
              route.includes("event-modeling") ||
              route.includes("bitemporal-modeling") ||
              route.includes("dimension-completion") ||
              route.includes("historical-conformance") ||
              route.includes("snapshot-reproducibility")
            ? 0.9
            : 0.8,
  }));
}
