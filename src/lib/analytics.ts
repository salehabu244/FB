/**
 * Facebook integration.
 *
 * • Campaign parameters (fbclid / utm_*) are preserved for the order record.
 * • The Facebook Pixel is loaded only when VITE_FACEBOOK_PIXEL_ID is set.
 * • The Purchase conversion is fired only after an order was actually saved
 *   AND the customer allowed anonymous analytics.
 */

const PIXEL_ID = import.meta.env.VITE_FACEBOOK_PIXEL_ID || "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const CAMPAIGN_KEYS = ["fbclid", "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const CAMPAIGN_STORAGE = "bb_campaign";
const CONSENT_STORAGE = "bb_analytics_consent";

/** Capture campaign parameters once per session so they survive navigation. */
export function captureCampaign(): Record<string, string> {
  try {
    const url = new URL(window.location.href);
    const found: Record<string, string> = {};
    let changed = false;
    for (const key of CAMPAIGN_KEYS) {
      const value = url.searchParams.get(key);
      if (value) {
        found[key] = value.slice(0, 120);
        changed = true;
      }
    }
    if (changed) {
      sessionStorage.setItem(CAMPAIGN_STORAGE, JSON.stringify(found));
    }
    const stored = sessionStorage.getItem(CAMPAIGN_STORAGE);
    return stored ? (JSON.parse(stored) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

type Fbq = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  callMethod?: (...args: unknown[]) => void;
};

export function initFacebookPixel(): void {
  if (!PIXEL_ID || typeof window === "undefined" || window.fbq) return;
  try {
    const w = window as Window & { fbq?: Fbq; _fbq?: unknown };
    const fbq: Fbq = (...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    fbq.queue = [];
    if (!w._fbq) w._fbq = fbq;
    w.fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  } catch {
    // Analytics must never break the shop.
  }
}

export function setAnalyticsConsent(allowed: boolean): void {
  localStorage.setItem(CONSENT_STORAGE, allowed ? "1" : "0");
}

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_STORAGE) === "1";
  } catch {
    return false;
  }
}

/** Fires the checkout conversion — only for a saved order and with consent. */
export function trackPurchase(orderId: string, value: number, currency: string): void {
  if (!PIXEL_ID || !hasAnalyticsConsent() || !window.fbq) return;
  try {
    window.fbq("track", "Purchase", { value, currency, content_ids: [orderId], num_items: 1 });
  } catch {
    /* ignore */
  }
}
