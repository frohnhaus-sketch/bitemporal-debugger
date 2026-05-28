export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);

    if (params.get("ignoreAnalytics") === "true") {
      localStorage.setItem("ignoreAnalytics", "true");
      return;
    }

    if (localStorage.getItem("ignoreAnalytics") === "true") {
      return;
    }
  }

  fetch("/api/track", {
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