/**
 * Analytics event emitter.
 *
 * v0.1 — events are routed to the global `plausible` function if present,
 * otherwise dropped. The Plausible / Posthog selection (open question §12-2)
 * is decided by the Plausible script tag in `Layout.astro`. This module
 * keeps the call sites stable so swapping the platform is a single change.
 */

declare global {
  var plausible:
    | ((event: string, options?: { props?: Record<string, unknown> }) => void)
    | undefined;
}

export type EventName =
  | "demo_loaded"
  | "sample_selected"
  | "custom_uploaded"
  | "verify_clicked"
  | "verify_completed"
  | "result_shown"
  | "cta_clicked"
  | "cta_outbound"
  | "report_email_submitted";

export function track(
  name: EventName,
  props?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const fn = window.plausible;
  if (typeof fn === "function") {
    fn(name, props ? { props } : undefined);
  }
}
