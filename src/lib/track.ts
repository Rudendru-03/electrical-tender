type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/** Sends a GA4 event when analytics is loaded; a no-op otherwise. */
export function track(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", event, params);
}
