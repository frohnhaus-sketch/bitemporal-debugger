import type { MetadataRoute } from "next";

const baseUrl = "https://bitemporal-debugger.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/patterns",
    "/learn/state-modeling",
    "/learn/event-modeling",
    "/learn/state-state-alignment",
    "/learn/state-event-alignment",
    "/learn/event-to-state-projection",
    "/learn/event-prioritization",
    "/learn/dimension-completion",
    "/learn/snapshot-reproducibility",
    "/learn/relationship-history",
    "/learn/historical-conformance",
    "/learn/historical-coverage-gap",
    "/learn/historical-overlap",
    "/learn/historical-match-ambiguity",
    "/learn/state-reduction",
    "/learn/rectangle-decomposition",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/patterns" ? 0.9 : 0.8,
  }));
}