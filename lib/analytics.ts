export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  if (params.get("ignoreAnalytics") === "true") {
    localStorage.setItem("ignoreAnalytics", "true");
    return;
  }

  if (localStorage.getItem("ignoreAnalytics") === "true") {
    return;
  }

  // Only track production traffic
  if (window.location.hostname !== "bitemporal-debugger.vercel.app") {
    return;
  }

  // Ignore common bots / preview checks
  const ua = navigator.userAgent;

  if (
    ua.includes("HeadlessChrome") ||
    ua.toLowerCase().includes("bot") ||
    ua.toLowerCase().includes("crawler") ||
    ua.toLowerCase().includes("spider")
  ) {
    return;
  }

  fetch("/api/capture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event,
      data,
      page: window.location.pathname,
      referrer: document.referrer,
    }),
  }).catch(() => {
    // ignore tracking errors
  });
}