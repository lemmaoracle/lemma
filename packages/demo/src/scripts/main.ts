/**
 * Demo page interactivity. Loaded as a module from DemoTemplate.astro.
 *
 * v0.3.1 — locale-aware (reads i18n payload from window.__LEMMA_DEMO_I18N__
 * injected by DemoTemplate). Adds liveness signals tier 1: session nonce,
 * real-time ms counter, timing jitter, "0 bytes sent" pulse. Result panel
 * now renders Pillar mapping + business-impact bullets for pass samples,
 * plain-language fail reason for fail samples.
 *
 * State machine:
 *   - sample selected (radio) OR custom file uploaded
 *     → Verify button enabled
 *   - Verify clicked
 *     → track verify_clicked (with locale + session nonce)
 *     → run verifier (mock in v0.1; jittered delay)
 *     → render result panel + CTAs
 */

import { getSample, type PillarSlug, type Sample } from "../data/fixtures";
import { track } from "../lib/analytics";
import {
  verifyCustom,
  verifySample,
  type VerificationResult,
} from "../lib/verify";

interface PillarCopy {
  readonly title: string;
  readonly proofLabel: string;
  readonly href: string;
}

interface SampleCopy {
  readonly label: string;
  readonly scenario: string;
  readonly stakes: ReadonlyArray<string>;
  readonly businessImpact: ReadonlyArray<string>;
  readonly failReason: string;
}

interface I18nPayload {
  readonly locale: "en" | "ja";
  readonly pillarsCopy: Readonly<{
    readonly verifiableOrigin: PillarCopy;
    readonly verifiableAi: PillarCopy;
    readonly agentAuthorityProof: PillarCopy;
    readonly regulatoryAttributeProof: PillarCopy;
  }>;
  readonly samplesCopy: Readonly<Record<string, SampleCopy>>;
  readonly resultStrings: Readonly<{
    readonly passOverall: string;
    readonly failOverall: string;
    readonly sessionLabel: string;
    readonly browserOnlyBadge: string;
    readonly provenHeading: string;
    readonly impactHeading: string;
    readonly failHeading: string;
  }>;
  readonly verifyStrings: Readonly<{
    readonly button: string;
    readonly buttonInFlight: string;
    readonly hintPick: string;
    readonly hintReadySample: string;
    readonly hintReadyCustom: string;
  }>;
}

declare global {
  interface Window {
    __LEMMA_DEMO_I18N__?: I18nPayload;
  }
}

type Selection =
  | { readonly kind: "sample"; readonly sample: Sample }
  | { readonly kind: "custom"; readonly raw: string; readonly fileName: string }
  | { readonly kind: "none" };

const VERIFY_JITTER_MS = 25;
const VERIFY_BASE_DELAY_MS = 180;
const VERIFY_CUSTOM_BASE_DELAY_MS = 220;

let selection: Selection = { kind: "none" };

const PILLAR_KEY: Readonly<Record<PillarSlug, keyof I18nPayload["pillarsCopy"]>> = {
  "verifiable-origin": "verifiableOrigin",
  "verifiable-ai": "verifiableAi",
  "agent-authority-proof": "agentAuthorityProof",
  "regulatory-attribute-proof": "regulatoryAttributeProof",
};

function getI18n(): I18nPayload {
  const payload = window.__LEMMA_DEMO_I18N__;
  if (!payload) {
    throw new Error("i18n payload missing — DemoTemplate did not inject window.__LEMMA_DEMO_I18N__");
  }
  return payload;
}

function jitter(base: number): number {
  const offset = (Math.random() * 2 - 1) * VERIFY_JITTER_MS;
  return Math.max(50, base + offset);
}

function sessionShortNonce(): string {
  // Take first 8 chars (two groups of 4) of a UUID v4. `crypto.randomUUID`
  // is widely supported in all browsers we target.
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2, 10).padEnd(8, "0");
  const hex = uuid.replace(/-/g, "");
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function mount(): void {
  const i18n = getI18n();

  track("demo_loaded", {
    referrer: document.referrer || "(direct)",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    locale: i18n.locale,
  });

  const radios = document.querySelectorAll<HTMLInputElement>(
    'input[type="radio"][name="sample"]',
  );
  const fileInput = document.getElementById(
    "custom-file",
  ) as HTMLInputElement | null;
  const fileNameLabel = document.getElementById("custom-file-name");
  const verifyBtn = document.getElementById(
    "verify-btn",
  ) as HTMLButtonElement | null;
  const verifyHint = document.getElementById("verify-hint");
  const result = document.getElementById("result");
  const resultOverall = document.getElementById("result-overall");
  const resultTime = document.getElementById("result-time");
  const resultSession = document.getElementById("result-session");
  const resultBrowserOnly = document.getElementById("result-browser-only");
  const resultPassBody = document.getElementById("result-pass-body");
  const resultFailBody = document.getElementById("result-fail-body");
  const resultProvenList = document.getElementById("result-proven-list");
  const resultImpactList = document.getElementById("result-impact-list");
  const resultFailReason = document.getElementById("result-fail-reason");
  const ctaRow = document.getElementById("cta-row");
  const ctaSales = document.getElementById("cta-sales") as HTMLAnchorElement | null;
  const ctaWaitlist = document.getElementById("cta-waitlist") as HTMLAnchorElement | null;
  const langToggle = document.querySelector<HTMLAnchorElement>(".lang-toggle");

  if (
    !verifyBtn ||
    !result ||
    !resultOverall ||
    !resultTime ||
    !resultSession ||
    !resultBrowserOnly ||
    !resultPassBody ||
    !resultFailBody ||
    !resultProvenList ||
    !resultImpactList ||
    !resultFailReason ||
    !ctaRow
  ) {
    return;
  }

  const updateVerifyState = (): void => {
    if (selection.kind === "none") {
      verifyBtn.disabled = true;
      if (verifyHint) verifyHint.textContent = i18n.verifyStrings.hintPick;
      return;
    }
    verifyBtn.disabled = false;
    if (verifyHint) {
      verifyHint.textContent =
        selection.kind === "custom"
          ? `${i18n.verifyStrings.hintReadyCustom} ${selection.fileName}`
          : `${i18n.verifyStrings.hintReadySample} ${i18n.samplesCopy[selection.sample.id]?.label ?? selection.sample.id}.`;
    }
  };

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const id = radio.dataset["sampleId"];
      if (!id) return;
      const sample = getSample(id);
      if (!sample) return;
      selection = { kind: "sample", sample };
      if (fileInput) fileInput.value = "";
      if (fileNameLabel) {
        const def = fileNameLabel.dataset["defaultNote"];
        if (def) fileNameLabel.textContent = def;
      }
      track("sample_selected", { sample_id: id, locale: i18n.locale });
      updateVerifyState();
    });
  });

  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const raw = await file.text();
      selection = { kind: "custom", raw, fileName: file.name };
      // Clear any radio selection.
      radios.forEach((r) => {
        r.checked = false;
      });
      if (fileNameLabel) {
        const prefix = fileNameLabel.dataset["readyPrefix"] ?? "";
        fileNameLabel.textContent = `${file.name} — ${prefix}`;
      }
      track("custom_uploaded", { file_size_bytes: file.size });
      updateVerifyState();
    });
  }

  verifyBtn.addEventListener("click", async () => {
    if (selection.kind === "none") return;
    const sampleId = selection.kind === "sample" ? selection.sample.id : "custom";
    const sessionNonce = sessionShortNonce();
    const verifyClickedAt = performance.now();
    track("verify_clicked", { sample_id: sampleId, locale: i18n.locale });

    // Reset UI for new run.
    resetResultPanel({
      result,
      resultOverall,
      resultTime,
      resultSession,
      resultBrowserOnly,
      resultPassBody,
      resultFailBody,
      resultProvenList,
      resultImpactList,
      resultFailReason,
      ctaRow,
    });
    resultSession.textContent = `${i18n.resultStrings.sessionLabel}: ${sessionNonce}`;
    resultSession.hidden = false;
    result.classList.remove("hidden");

    verifyBtn.disabled = true;
    const labelBase = verifyBtn.dataset["label"] ?? "Verify";
    const labelInFlight = verifyBtn.dataset["labelInflight"] ?? "Verifying…";
    verifyBtn.textContent = labelInFlight;

    // Start live ms counter via RAF. `runActive.value = false` stops it.
    const runActive = { value: true };
    startLiveCounter(resultTime, verifyClickedAt, runActive);

    let resultData: VerificationResult;
    try {
      const baseDelay =
        selection.kind === "custom"
          ? VERIFY_CUSTOM_BASE_DELAY_MS
          : VERIFY_BASE_DELAY_MS;
      // Replace the verifier's internal delay with a jittered one so each
      // run produces a visibly different total. The verifier still measures
      // its own duration; the jitter affects perceived liveness.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, jitter(baseDelay)),
      );
      resultData =
        selection.kind === "sample"
          ? await verifySample(selection.sample)
          : await verifyCustom(selection.raw);
    } finally {
      runActive.value = false;
      verifyBtn.textContent = labelBase;
      verifyBtn.disabled = false;
    }

    const totalMs = Math.round(performance.now() - verifyClickedAt);
    resultTime.textContent = `${totalMs} ms`;

    renderResult({
      data: resultData,
      sample: selection.kind === "sample" ? selection.sample : null,
      i18n,
      resultOverall,
      resultBrowserOnly,
      resultPassBody,
      resultFailBody,
      resultProvenList,
      resultImpactList,
      resultFailReason,
      ctaRow,
    });

    track("verify_completed", {
      sample_id: sampleId,
      result: resultData.overall,
      total_duration_ms: totalMs,
      primitives_verified: resultData.checks
        .filter((c) => c.status !== "skip")
        .map((c) => c.id),
      locale: i18n.locale,
    });
    track("result_shown", {
      result: resultData.overall,
      time_to_result_ms: totalMs,
      locale: i18n.locale,
    });

    // Update CTA hrefs with sample-specific UTM (v0.3 convention).
    if (ctaSales) {
      ctaSales.href = withUtm(ctaSales.dataset["ctaBase"] ?? ctaSales.href, sampleId, i18n.locale);
    }
    if (ctaWaitlist) {
      ctaWaitlist.href = withUtm(ctaWaitlist.dataset["ctaBase"] ?? ctaWaitlist.href, sampleId, i18n.locale);
    }

    // Scroll to the result so it's visible without manual scroll.
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const onCtaClick = (ctaType: "sales" | "waitlist") => () => {
    const sampleId =
      selection.kind === "sample" ? selection.sample.id : selection.kind === "custom" ? "custom" : "none";
    track("cta_clicked", {
      cta_type: ctaType,
      result_at_click: resultOverall.textContent ?? "",
      locale: i18n.locale,
      sample_id: sampleId,
    });
    track("cta_outbound", {
      cta_type: ctaType,
      outbound_url:
        ctaType === "sales"
          ? ctaSales?.href
          : ctaWaitlist?.href,
      locale: i18n.locale,
    });
  };
  ctaSales?.addEventListener("click", onCtaClick("sales"));
  ctaWaitlist?.addEventListener("click", onCtaClick("waitlist"));

  if (langToggle) {
    const toLocale = langToggle.dataset["otherLocale"] === "ja" ? "ja" : "en";
    langToggle.addEventListener("click", () => {
      track("language_toggled", {
        from_locale: i18n.locale,
        to_locale: toLocale,
        time_since_load_ms: Math.round(performance.now()),
      });
    });
  }

  updateVerifyState();
}

interface ResultPanelEls {
  readonly result: HTMLElement;
  readonly resultOverall: HTMLElement;
  readonly resultTime: HTMLElement;
  readonly resultSession: HTMLElement;
  readonly resultBrowserOnly: HTMLElement;
  readonly resultPassBody: HTMLElement;
  readonly resultFailBody: HTMLElement;
  readonly resultProvenList: HTMLElement;
  readonly resultImpactList: HTMLElement;
  readonly resultFailReason: HTMLElement;
  readonly ctaRow: HTMLElement;
}

function resetResultPanel(els: ResultPanelEls): void {
  els.resultOverall.textContent = "";
  els.resultOverall.className = "result-overall";
  els.resultTime.textContent = "";
  els.resultProvenList.innerHTML = "";
  els.resultImpactList.innerHTML = "";
  els.resultFailReason.textContent = "";
  els.resultPassBody.hidden = true;
  els.resultFailBody.hidden = true;
  els.ctaRow.classList.add("hidden");
  els.resultBrowserOnly.classList.remove("pulse");
}

function startLiveCounter(
  resultTime: HTMLElement,
  startedAt: number,
  active: { value: boolean },
): void {
  const tick = (): void => {
    if (!active.value) return;
    const ms = Math.round(performance.now() - startedAt);
    resultTime.textContent = `${ms} ms`;
    requestAnimationFrame(tick);
  };
  // Respect prefers-reduced-motion: don't run the per-frame counter; the
  // final value is set by the verify click handler when verification ends.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  requestAnimationFrame(tick);
}

interface RenderResultArgs {
  readonly data: VerificationResult;
  readonly sample: Sample | null;
  readonly i18n: I18nPayload;
  readonly resultOverall: HTMLElement;
  readonly resultBrowserOnly: HTMLElement;
  readonly resultPassBody: HTMLElement;
  readonly resultFailBody: HTMLElement;
  readonly resultProvenList: HTMLElement;
  readonly resultImpactList: HTMLElement;
  readonly resultFailReason: HTMLElement;
  readonly ctaRow: HTMLElement;
}

function renderResult(args: RenderResultArgs): void {
  const { data, sample, i18n } = args;
  const isPass = data.overall === "pass";
  args.resultOverall.textContent = isPass
    ? i18n.resultStrings.passOverall
    : i18n.resultStrings.failOverall;
  args.resultOverall.className = `result-overall ${data.overall}`;

  // Pulse the "0 bytes sent" badge briefly on completion.
  args.resultBrowserOnly.classList.add("pulse");
  setTimeout(() => args.resultBrowserOnly.classList.remove("pulse"), 1200);

  if (isPass) {
    args.resultPassBody.hidden = false;
    args.resultFailBody.hidden = true;
    // Proven pillars list — sample-driven; for custom uploads we omit (no
    // per-sample pillar mapping available).
    if (sample) {
      for (const slug of sample.pillars) {
        const copy = i18n.pillarsCopy[PILLAR_KEY[slug]];
        args.resultProvenList.appendChild(buildProvenRow(copy));
      }
      // Business impact bullets.
      const sampleCopy = i18n.samplesCopy[sample.id];
      if (sampleCopy) {
        for (const bullet of sampleCopy.businessImpact) {
          args.resultImpactList.appendChild(buildImpactRow(bullet));
        }
      }
    }
  } else {
    args.resultFailBody.hidden = false;
    args.resultPassBody.hidden = true;
    const sampleCopy = sample ? i18n.samplesCopy[sample.id] : null;
    args.resultFailReason.textContent =
      sampleCopy?.failReason || data.failureReason || "";
  }

  args.ctaRow.classList.remove("hidden");
}

function buildProvenRow(copy: PillarCopy): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "proven-item";
  const icon = document.createElement("span");
  icon.className = "proven-item-icon";
  icon.textContent = "✓";
  icon.setAttribute("aria-hidden", "true");
  const title = document.createElement("a");
  title.className = "proven-item-title";
  title.href = copy.href;
  title.target = "_blank";
  title.rel = "noopener";
  title.textContent = copy.title;
  const status = document.createElement("span");
  status.className = "proven-item-status";
  status.textContent = `[ ${copy.proofLabel} ]`;
  li.append(icon, title, status);
  return li;
}

function buildImpactRow(text: string): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "impact-item";
  const span = document.createElement("span");
  span.textContent = text;
  li.append(span);
  return li;
}

function withUtm(baseUrl: string, sampleId: string, locale: "en" | "ja"): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("utm_source", "demo");
    url.searchParams.set("utm_medium", "web");
    url.searchParams.set("utm_campaign", "ppsi_provenance");
    url.searchParams.set("utm_content", sampleId);
    url.searchParams.set("utm_term", locale);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
