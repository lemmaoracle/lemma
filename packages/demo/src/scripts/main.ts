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

import { FAILURE_STEP, getSample, PILLAR_I18N_KEY, type Sample } from "../data/fixtures";
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
  readonly counterFactual?: {
    readonly without: ReadonlyArray<string>;
    readonly with: ReadonlyArray<string>;
  };
}

interface StepCopy {
  readonly label: string;
  readonly primitive: string;
  readonly subStages: ReadonlyArray<string>;
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
  readonly verifyAnimStrings: Readonly<{
    readonly steps: ReadonlyArray<StepCopy>;
    readonly failedStepSuffix: string;
  }>;
  readonly counterFactualStrings: Readonly<{
    readonly withoutLabel: string;
    readonly withLabel: string;
  }>;
}

/**
 * §3b stepped animation timing. revealAt = ms after click when the step
 * becomes "verifying"; verifyMs = how long that step stays in the
 * verifying state before resolving. Spec target totals: ~1000ms for a
 * full valid run; failures truncate the sequence at their failing step.
 *
 * Spec §3b's headline "~400ms for fail" matches the model_hash_mismatch
 * sample (fail at Step 2). Later-step failures (Step 4 output, Step 5
 * policy/replay) intentionally take longer because the user sees the
 * earlier passes complete — this is the honest reading of the spec.
 */
interface StepTiming {
  readonly revealAt: number;
  readonly verifyMs: number;
  readonly traceOp: string;
}

const STEP_TIMINGS: ReadonlyArray<StepTiming> = [
  { revealAt: 100, verifyMs: 180, traceOp: "schema" },
  { revealAt: 300, verifyMs: 180, traceOp: "envelope.bbs" },
  { revealAt: 500, verifyMs: 180, traceOp: "input.poseidon" },
  { revealAt: 700, verifyMs: 230, traceOp: "output.poseidon" },
  { revealAt: 950, verifyMs: 150, traceOp: "policy.groth16" },
];

const STEP_JITTER_MS = 22;

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

interface DeepLinkResolution {
  /** Valid sample id, or null if absent / invalid. Used for `deep_link_sample`. */
  readonly valid: string | null;
  /** True if the URL had a `?sample=` query (regardless of validity). */
  readonly hadQuery: boolean;
}

function resolveDeepLinkSample(): DeepLinkResolution {
  if (typeof window === "undefined") return { valid: null, hadQuery: false };
  const url = new URL(window.location.href);
  const querySample = url.searchParams.get("sample");
  const hashMatch = url.hash.match(/^#sample=(.+)$/);
  const hashSample = hashMatch ? decodeURIComponent(hashMatch[1]) : null;
  // Query parameter (inbound deep-link) takes precedence over the hash
  // (in-app round-trip across the language toggle). Spec §2a.
  const candidate = querySample ?? hashSample;
  if (!candidate) return { valid: null, hadQuery: false };
  const sample = getSample(candidate);
  return {
    valid: sample ? sample.id : null,
    hadQuery: querySample !== null,
  };
}

/**
 * Normalise the URL so `?sample=` is consumed on first load and the in-app
 * form `#sample=<id>` is what subsequent navigation (e.g. language toggle)
 * round-trips. Invalid sample ids are dropped entirely. Called only when
 * the inbound URL had a `?sample=` query.
 */
function normaliseDeepLinkUrl(validSampleId: string | null): void {
  const url = new URL(window.location.href);
  // Drop only the `sample` query — other params (utm_source, utm_content,
  // utm_medium, utm_campaign, utm_term) are owned by the analytics layer
  // and stay on the URL so a subsequent share or reload retains the
  // referral attribution.
  url.searchParams.delete("sample");
  url.hash = validSampleId ? `sample=${validSampleId}` : "";
  history.replaceState(null, "", url.toString());
}

const sleep = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

interface TraceLogger {
  reset(startedAt: number): void;
  emit(op: string, result: "pass" | "fail" | null): void;
}

function createTraceLogger(container: HTMLElement): TraceLogger {
  let startedAt = performance.now();
  return {
    reset(t: number): void {
      startedAt = t;
      container.innerHTML = "";
    },
    emit(op: string, result: "pass" | "fail" | null): void {
      const t = Math.round(performance.now() - startedAt);
      const arrow = result === null ? "…" : result === "pass" ? "ok" : "fail";
      const cls =
        result === "fail"
          ? "trace-line trace-line-fail"
          : result === "pass"
          ? "trace-line trace-line-pass"
          : "trace-line";
      const line = document.createElement("span");
      line.className = cls;
      line.textContent = `[t=${t.toString().padStart(4, "0")}ms] verifier.${op} → ${arrow}`;
      container.appendChild(line);
      container.scrollTop = container.scrollHeight;
    },
  };
}

interface SteppedAnimationArgs {
  readonly verifyClickedAt: number;
  /** Step number (1-5) that should fail, or null for full-pass. */
  readonly failStep: number | null;
  readonly stepCopies: ReadonlyArray<StepCopy>;
  readonly animSteps: ReadonlyArray<HTMLElement>;
  readonly animProgressFill: HTMLElement;
  readonly trace: TraceLogger;
  readonly onStepCompleted: (
    stepNumber: number,
    stepName: string,
    result: "pass" | "fail",
    durationMs: number,
  ) => void;
}

/**
 * Drives the §3b stepped reveal. Awaits each step's reveal time
 * (jittered ±22ms per §3f), cycles its sub-stages with trace-log
 * emissions, then resolves the step pass/fail. Halts at failStep when
 * supplied. Returns the final step number reached (1-5).
 */
async function runSteppedAnimation(args: SteppedAnimationArgs): Promise<number> {
  args.animProgressFill.classList.remove("fail");
  args.animProgressFill.style.width = "0%";
  let lastStepReached = 0;
  for (let i = 0; i < STEP_TIMINGS.length; i++) {
    const cfg = STEP_TIMINGS[i];
    const stepNum = i + 1;
    const stepEl = args.animSteps[i];
    if (!stepEl) continue;
    lastStepReached = stepNum;
    const copy = args.stepCopies[i];
    const subEl = stepEl.querySelector<HTMLElement>(".anim-step-substage");
    const iconEl = stepEl.querySelector<HTMLElement>(".anim-step-icon");
    const msEl = stepEl.querySelector<HTMLElement>(".anim-step-ms");

    const revealTarget =
      args.verifyClickedAt + cfg.revealAt + (Math.random() * 2 - 1) * STEP_JITTER_MS;
    await sleep(revealTarget - performance.now());

    stepEl.dataset["state"] = "verifying";
    if (iconEl) iconEl.textContent = "◐";
    args.trace.emit(`${cfg.traceOp}.start`, null);

    const stepStartedAt = performance.now();
    const subDuration = cfg.verifyMs / Math.max(1, copy.subStages.length);
    for (let s = 0; s < copy.subStages.length; s++) {
      if (subEl) subEl.textContent = copy.subStages[s];
      args.trace.emit(`${cfg.traceOp}.${s + 1}/${copy.subStages.length}`, null);
      await sleep(subDuration);
    }

    const isFail = args.failStep !== null && stepNum === args.failStep;
    const result: "pass" | "fail" = isFail ? "fail" : "pass";
    const durationMs = Math.round(performance.now() - stepStartedAt);
    stepEl.dataset["state"] = result;
    if (iconEl) iconEl.textContent = result === "pass" ? "✓" : "✗";
    if (msEl) msEl.textContent = `${durationMs} ms`;
    if (subEl && isFail) subEl.textContent = "✗ verification rejected";

    const progress = isFail ? (stepNum / STEP_TIMINGS.length) * 100 : (stepNum / STEP_TIMINGS.length) * 100;
    args.animProgressFill.style.width = `${progress}%`;
    if (isFail) args.animProgressFill.classList.add("fail");

    args.trace.emit(cfg.traceOp, result);
    args.onStepCompleted(stepNum, copy.label, result, durationMs);

    if (isFail) break;
  }
  return lastStepReached;
}

function resetAnimationPanel(
  animSteps: ReadonlyArray<HTMLElement>,
  animProgressFill: HTMLElement,
): void {
  animProgressFill.classList.remove("fail");
  animProgressFill.style.width = "0%";
  for (const step of animSteps) {
    delete step.dataset["state"];
    const icon = step.querySelector<HTMLElement>(".anim-step-icon");
    const ms = step.querySelector<HTMLElement>(".anim-step-ms");
    const sub = step.querySelector<HTMLElement>(".anim-step-substage");
    if (icon) icon.textContent = "○";
    if (ms) ms.textContent = "";
    if (sub) sub.textContent = "";
  }
}

function renderCounterFactual(
  cfBlock: HTMLElement,
  withoutList: HTMLElement,
  withList: HTMLElement,
  copy: { without: ReadonlyArray<string>; with: ReadonlyArray<string> },
): void {
  withoutList.innerHTML = "";
  withList.innerHTML = "";
  for (const line of copy.without) {
    const li = document.createElement("li");
    li.textContent = line;
    withoutList.appendChild(li);
  }
  for (const line of copy.with) {
    const li = document.createElement("li");
    li.textContent = line;
    withList.appendChild(li);
  }
  cfBlock.hidden = false;
}

export function mount(): void {
  const i18n = getI18n();

  const deepLink = resolveDeepLinkSample();
  // Normalise URL — drop `?sample=` query (consumed on load); keep
  // `#sample=<id>` for in-app round-trip. Only rewrite when a query was
  // present so plain reloads of an already-normalised URL don't churn
  // history.
  if (deepLink.hadQuery) {
    normaliseDeepLinkUrl(deepLink.valid);
  }

  track("demo_loaded", {
    referrer: document.referrer || "(direct)",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    locale: i18n.locale,
    deep_link_sample: deepLink.valid,
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
  // v0.3.2 stepped animation + counter-factual + trust badges + trace log
  const resultAnimation = document.getElementById("result-animation");
  const animProgressFill = document.getElementById("anim-progress");
  const animSteps = Array.from(document.querySelectorAll<HTMLElement>(".anim-step"));
  const counterFactualBlock = document.getElementById("counterfactual-block");
  const cfWithoutList = document.getElementById("cf-without");
  const cfWithList = document.getElementById("cf-with");
  const traceSection = document.getElementById("trace-section");
  const traceToggle = document.getElementById("trace-toggle") as HTMLButtonElement | null;
  const traceLog = document.getElementById("trace-log");
  const trustBadgesSection = document.getElementById("trust-badges");

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
    !ctaRow ||
    !resultAnimation ||
    !animProgressFill ||
    !counterFactualBlock ||
    !cfWithoutList ||
    !cfWithList ||
    !traceSection ||
    !traceToggle ||
    !traceLog ||
    !trustBadgesSection
  ) {
    return;
  }

  // Capture the lang toggle's bare locale href before we layer the sample
  // hash on top of it; we need the bare value when the selection clears.
  const langToggleBaseHref = langToggle?.getAttribute("href") ?? "";

  const setHashSample = (sampleId: string | null): void => {
    const url = new URL(window.location.href);
    url.hash = sampleId ? `sample=${sampleId}` : "";
    history.replaceState(null, "", url.toString());
  };

  const updateLangToggleHref = (sampleId: string | null): void => {
    if (!langToggle) return;
    langToggle.href = sampleId
      ? `${langToggleBaseHref}#sample=${sampleId}`
      : langToggleBaseHref;
  };

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

  const selectSampleById = (
    id: string,
    source: "deep_link" | "user_click",
  ): boolean => {
    const sample = getSample(id);
    if (!sample) return false;
    selection = { kind: "sample", sample };
    // Sync radio state (no-op on user_click path; meaningful for deep_link).
    radios.forEach((r) => {
      r.checked = r.dataset["sampleId"] === id;
    });
    if (fileInput) fileInput.value = "";
    if (fileNameLabel) {
      const def = fileNameLabel.dataset["defaultNote"];
      if (def) fileNameLabel.textContent = def;
    }
    setHashSample(id);
    updateLangToggleHref(id);
    track("sample_selected", {
      sample_id: id,
      locale: i18n.locale,
      source,
    });
    updateVerifyState();
    return true;
  };

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const id = radio.dataset["sampleId"];
      if (!id) return;
      selectSampleById(id, "user_click");
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
      // Custom uploads aren't deep-linkable — drop the sample hash and
      // strip it from the lang toggle so a locale switch doesn't re-select
      // an unrelated sample.
      setHashSample(null);
      updateLangToggleHref(null);
      track("custom_uploaded", { file_size_bytes: file.size });
      updateVerifyState();
    });
  }

  // Apply deep-link selection now that the radios + handlers are wired.
  if (deepLink.valid) {
    if (selectSampleById(deepLink.valid, "deep_link")) {
      const matchingRadio = Array.from(radios).find(
        (r) => r.dataset["sampleId"] === deepLink.valid,
      );
      if (matchingRadio) {
        const label = matchingRadio.closest("label.sample") as HTMLElement | null;
        if (label) {
          const reduceMotion =
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
            false;
          label.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      }
    }
  }

  // ── Trace log toggle (closure-scoped state, not localStorage) ─────
  let traceOpen = false;
  const trace = createTraceLogger(traceLog);
  const setTraceOpen = (open: boolean): void => {
    traceOpen = open;
    traceToggle.setAttribute("aria-expanded", open ? "true" : "false");
    traceToggle.textContent =
      open
        ? traceToggle.dataset["labelHide"] ?? i18n.verifyAnimStrings.steps.length.toString()
        : traceToggle.dataset["labelShow"] ?? "Show trace ▾";
    traceLog.hidden = !open;
  };
  traceToggle.addEventListener("click", () => setTraceOpen(!traceOpen));

  // ── Trust badges IntersectionObserver (fires once) ─────────────────
  if (typeof IntersectionObserver !== "undefined") {
    const trustObs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            track("trust_badges_viewport_entered", { locale: i18n.locale });
            trustObs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    trustObs.observe(trustBadgesSection);
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
    counterFactualBlock.hidden = true;
    cfWithoutList.innerHTML = "";
    cfWithList.innerHTML = "";
    resetAnimationPanel(animSteps, animProgressFill);
    resultAnimation.hidden = false;
    trace.reset(verifyClickedAt);

    resultSession.textContent = `${i18n.resultStrings.sessionLabel}: ${sessionNonce}`;
    resultSession.hidden = false;
    result.classList.remove("hidden");

    verifyBtn.disabled = true;
    const labelBase = verifyBtn.dataset["label"] ?? "Verify";
    const labelInFlight = verifyBtn.dataset["labelInflight"] ?? "Verifying…";
    verifyBtn.textContent = labelInFlight;

    const stopLiveCounter = startLiveCounter(resultTime, verifyClickedAt);

    // Determine which step (if any) should fail so the animation can halt
    // at the right point. For custom uploads, run a quick JSON parse —
    // invalid JSON → schema-step (Step 1) fails in the animation; the
    // verifier will still produce the canonical body content.
    let failStep: number | null = null;
    if (selection.kind === "sample" && selection.sample.failureMode) {
      failStep = FAILURE_STEP[selection.sample.failureMode];
    } else if (selection.kind === "custom") {
      try {
        JSON.parse(selection.raw);
      } catch {
        failStep = 1;
      }
    }

    let resultData: VerificationResult;
    try {
      await runSteppedAnimation({
        verifyClickedAt,
        failStep,
        stepCopies: i18n.verifyAnimStrings.steps,
        animSteps,
        animProgressFill,
        trace,
        onStepCompleted: (stepNumber, stepName, stepResult, durationMs) => {
          track("verification_step_completed", {
            sample_id: sampleId,
            step_number: stepNumber,
            step_name: stepName,
            result: stepResult,
            duration_ms: durationMs,
            locale: i18n.locale,
          });
        },
      });
      resultData =
        selection.kind === "sample"
          ? await verifySample(selection.sample)
          : await verifyCustom(selection.raw);
    } finally {
      stopLiveCounter();
      verifyBtn.textContent = labelBase;
      verifyBtn.disabled = false;
    }

    const totalMs = Math.round(performance.now() - verifyClickedAt);
    resultTime.textContent = `${totalMs} ms`;
    resultAnimation.hidden = true;

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

    // Counter-factual block for fail samples that ship the §3d copy.
    if (
      resultData.overall === "fail" &&
      selection.kind === "sample" &&
      i18n.samplesCopy[selection.sample.id]?.counterFactual
    ) {
      const cf = i18n.samplesCopy[selection.sample.id].counterFactual!;
      renderCounterFactual(counterFactualBlock, cfWithoutList, cfWithList, cf);
      track("counterfactual_shown", {
        sample_id: selection.sample.id,
        locale: i18n.locale,
      });
    }

    // Trust badges + trace section become visible after first verify.
    trustBadgesSection.hidden = false;
    traceSection.hidden = false;

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
): () => void {
  // Respect prefers-reduced-motion: don't run the per-frame counter; the
  // final value is set by the verify click handler when verification ends.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }
  let rafId = 0;
  const tick = (): void => {
    const ms = Math.round(performance.now() - startedAt);
    resultTime.textContent = `${ms} ms`;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => {
    if (rafId !== 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
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
        const copy = i18n.pillarsCopy[PILLAR_I18N_KEY[slug]];
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
