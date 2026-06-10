type AnalyticsData = Record<string, unknown>;

const PRODUCTION_HOST = "bitemporal-debugger.vercel.app";
const IGNORE_ANALYTICS_KEY = "ignoreAnalytics";
const DEBUG_ANALYTICS_KEY = "debugAnalytics";

function isBrowser() {
  return typeof window !== "undefined";
}

function isDebugEnabled() {
  if (!isBrowser()) return false;

  const params = new URLSearchParams(window.location.search);

  return (
    params.get("debugAnalytics") === "true" ||
    localStorage.getItem(DEBUG_ANALYTICS_KEY) === "true"
  );
}

function debugLog(...args: unknown[]) {
  if (!isDebugEnabled()) return;
  console.log("[analytics]", ...args);
}

function shouldIgnoreAnalytics() {
  if (!isBrowser()) return true;

  const params = new URLSearchParams(window.location.search);

  if (params.get("ignoreAnalytics") === "true") {
    localStorage.setItem(IGNORE_ANALYTICS_KEY, "true");
    debugLog("skipped: ignoreAnalytics query param");
    return true;
  }

  if (localStorage.getItem(IGNORE_ANALYTICS_KEY) === "true") {
    debugLog("skipped: ignoreAnalytics localStorage");
    return true;
  }

  return false;
}

function isProductionHost() {
  if (!isBrowser()) return false;

  const isProduction = window.location.hostname === PRODUCTION_HOST;

  if (!isProduction) {
    debugLog("skipped: non-production host", window.location.hostname);
  }

  return isProduction;
}

function isLikelyBot() {
  if (!isBrowser()) return false;

  const userAgent = navigator.userAgent.toLowerCase();

  const botSignals = [
    "headlesschrome",
    "bot",
    "crawler",
    "spider",
    "preview",
    "facebookexternalhit",
    "linkedinbot",
    "slackbot",
    "twitterbot",
    "whatsapp",
  ];

  const detected = botSignals.some((signal) => userAgent.includes(signal));

  if (detected) {
    debugLog("skipped: bot-like user agent", navigator.userAgent);
  }

  return detected;
}

function sanitizeAnalyticsData(data?: AnalyticsData) {
  if (!data) return undefined;

  const sanitized: AnalyticsData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      sanitized[key] = value;
      return;
    }

    if (Array.isArray(value)) {
      sanitized[key] = value
        .slice(0, 20)
        .map((item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
            ? item
            : String(item)
        );
      return;
    }

    sanitized[key] = String(value);
  });

  return sanitized;
}

export function track(event: string, data?: AnalyticsData) {
  if (!isBrowser()) return;

  if (shouldIgnoreAnalytics()) return;
  if (!isProductionHost()) return;
  if (isLikelyBot()) return;

  const payload = {
    event,
    data: sanitizeAnalyticsData(data),
    page: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  };

  debugLog("sending", payload);

  fetch("/api/capture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then((response) => {
      debugLog("response", event, response.status);
    })
    .catch((error) => {
      debugLog("failed", event, error);
    });
}