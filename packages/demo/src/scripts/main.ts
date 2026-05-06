/**
 * Demo page interactivity. Loaded as a module from index.astro.
 *
 * State machine:
 *   - sample selected (radio) OR custom file uploaded
 *     → Verify button enabled
 *   - Verify clicked
 *     → run verifier (mock in v0.1)
 *     → render result panel + CTAs
 */

import { getSample, type Sample } from "../data/fixtures";
import { track } from "../lib/analytics";
import {
  verifyCustom,
  verifySample,
  type CheckResult,
  type VerificationResult,
} from "../lib/verify";

type Selection =
  | { kind: "sample"; sample: Sample }
  | { kind: "custom"; raw: string; fileName: string }
  | { kind: "none" };

let selection: Selection = { kind: "none" };

export function mount(): void {
  track("demo_loaded", {
    referrer: document.referrer || "(direct)",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
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
  const resultChecks = document.getElementById("result-checks");
  const resultFailure = document.getElementById("result-failure");
  const ctaRow = document.getElementById("cta-row");
  const ctaSales = document.getElementById("cta-sales");
  const ctaWaitlist = document.getElementById("cta-waitlist");

  if (
    !verifyBtn ||
    !result ||
    !resultOverall ||
    !resultTime ||
    !resultChecks ||
    !resultFailure ||
    !ctaRow
  ) {
    return;
  }

  const updateVerifyState = (): void => {
    if (selection.kind === "none") {
      verifyBtn.disabled = true;
      if (verifyHint) verifyHint.textContent = "Pick a sample to begin.";
      return;
    }
    verifyBtn.disabled = false;
    if (verifyHint) {
      verifyHint.textContent =
        selection.kind === "custom"
          ? `Ready to verify uploaded file (${selection.fileName}).`
          : `Ready to verify ${selection.sample.label}.`;
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
      if (fileNameLabel)
        fileNameLabel.textContent =
          "Stays in your browser. We never receive the file.";
      track("sample_selected", { sample_id: id });
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
      if (fileNameLabel)
        fileNameLabel.textContent = `${file.name} — stays in your browser.`;
      track("custom_uploaded", { file_size_bytes: file.size });
      updateVerifyState();
    });
  }

  verifyBtn.addEventListener("click", async () => {
    if (selection.kind === "none") return;
    const verifyClickedAt = performance.now();
    track("verify_clicked", {
      sample_id:
        selection.kind === "sample" ? selection.sample.id : "custom",
    });
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Verifying…";
    let resultData: VerificationResult;
    try {
      resultData =
        selection.kind === "sample"
          ? await verifySample(selection.sample)
          : await verifyCustom(selection.raw);
    } finally {
      verifyBtn.textContent = "Verify";
      verifyBtn.disabled = false;
    }
    renderResult(resultData);
    track("verify_completed", {
      sample_id:
        selection.kind === "sample" ? selection.sample.id : "custom",
      result: resultData.overall,
      duration_ms: resultData.durationMs,
      primitives_verified: resultData.checks
        .filter((c) => c.status !== "skip")
        .map((c) => c.id),
    });
    track("result_shown", {
      result: resultData.overall,
      time_to_result_ms: Math.round(performance.now() - verifyClickedAt),
    });
    // Scroll to the result so it's visible without manual scroll.
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderResult(data: VerificationResult): void {
    if (!result || !resultOverall || !resultTime || !resultChecks || !resultFailure || !ctaRow) {
      return;
    }
    result.classList.remove("hidden");
    resultOverall.textContent =
      data.overall === "pass" ? "✓ Pass" : "✗ Fail";
    resultOverall.className = `result-overall ${data.overall}`;
    resultTime.textContent = `${data.durationMs} ms`;
    resultChecks.innerHTML = "";
    for (const check of data.checks) {
      resultChecks.appendChild(buildCheckRow(check));
    }
    if (data.failureReason) {
      resultFailure.textContent = data.failureReason;
      resultFailure.classList.remove("hidden");
    } else {
      resultFailure.classList.add("hidden");
    }
    ctaRow.classList.remove("hidden");
  }

  const onCtaClick = (ctaType: "sales" | "waitlist") => () => {
    track("cta_clicked", {
      cta_type: ctaType,
      result_at_click: resultOverall.textContent ?? "",
    });
    track("cta_outbound", {
      cta_type: ctaType,
      outbound_url:
        ctaType === "sales"
          ? (ctaSales as HTMLAnchorElement | null)?.href
          : (ctaWaitlist as HTMLAnchorElement | null)?.href,
    });
  };
  ctaSales?.addEventListener("click", onCtaClick("sales"));
  ctaWaitlist?.addEventListener("click", onCtaClick("waitlist"));

  updateVerifyState();
}

function buildCheckRow(check: CheckResult): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "result-check";
  const icon = document.createElement("span");
  icon.className = `result-check-icon ${check.status}`;
  icon.textContent =
    check.status === "pass" ? "✓" : check.status === "fail" ? "✗" : "—";
  icon.setAttribute("aria-label", check.status);
  const label = document.createElement("span");
  label.className = "result-check-label";
  label.textContent = check.label;
  const scheme = document.createElement("span");
  scheme.className = "result-check-scheme";
  scheme.textContent = check.scheme ?? "";
  li.append(icon, label, scheme);
  return li;
}
