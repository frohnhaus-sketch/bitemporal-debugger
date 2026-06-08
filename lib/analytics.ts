export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  console.log("track called", event, window.location.hostname);

  const params = new URLSearchParams(window.location.search);

  if (params.get("ignoreAnalytics") === "true") {
    console.log("tracking skipped: ignoreAnalytics param");
    localStorage.setItem("ignoreAnalytics", "true");
    return;
  }

  if (localStorage.getItem("ignoreAnalytics") === "true") {
    console.log("tracking skipped: ignoreAnalytics localStorage");
    return;
  }

  if (window.location.hostname !== "bitemporal-debugger.vercel.app") {
    console.log("tracking skipped: wrong hostname", window.location.hostname);
    return;
  }

  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();

  if (
    ua.includes("HeadlessChrome") ||
    uaLower.includes("bot") ||
    uaLower.includes("crawler") ||
    uaLower.includes("spider")
  ) {
    console.log("tracking skipped: bot user agent", ua);
    return;
  }

  console.log("sending analytics event", event);

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
  })
    .then((response) => {
      console.log("analytics response", event, response.status);
    })
    .catch((error) => {
      console.error("Tracking failed", error);
    });
}