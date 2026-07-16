declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const IS_DEV =
  import.meta.env.MODE !== "production" ||
  import.meta.env.VITE_GA_DEBUG === "true";

/** Internal — only fires when GA is available */
function send(...args: Parameters<typeof window.gtag>) {
  if (IS_DEV) {
    console.log("[Analytics DEV]", ...args);
    return;
  }
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

// ─── Page Views ────────────────────────────────────────────────────────────
export function trackPageView(url: string, title?: string) {
  send("config", GA_ID, {
    page_path: url,
    page_title: title ?? document.title,
  });
}

// ─── Generic Event ─────────────────────────────────────────────────────────
export function trackEvent(
  action: string,
  params: Record<string, unknown> = {},
) {
  send("event", action, params);
}

// ─── User Identity ──────────────────────────────────────────────────────────
export function identifyUser(
  userId: string,
  userProps?: Record<string, unknown>,
) {
  send("config", GA_ID, { user_id: userId });
  if (userProps) {
    send("event", "user_identified", { user_id: userId, ...userProps });
  }
}

export function setUserProperties(props: Record<string, unknown>) {
  send("set", "user_properties", props);
}

// ─── Consent ───────────────────────────────────────────────────────────────
export function grantConsent() {
  send("consent", "update", {
    ad_storage: "granted",
    analytics_storage: "granted",
  });
}

export function denyConsent() {
  send("consent", "update", {
    ad_storage: "denied",
    analytics_storage: "denied",
  });
}
