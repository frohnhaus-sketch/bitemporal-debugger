export function track(event: string, data?: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ event, data }),
  }).catch(() => {
    // ignore tracking errors
  });
}