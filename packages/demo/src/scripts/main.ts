/**
 * Oracle Pipeline demo — interactivity.
 *
 * Loaded as a module from DemoTemplate.astro. Handles:
 *   - theme toggle (persisted to localStorage)
 *   - filter tabs (All / Received / Verifying / Verified / On-chain / Rejected)
 *   - search by docHash / schema substring
 *   - row click → opens the detail panel for that row
 *   - sample chip click → prepends a synthetic sample row to the pipeline,
 *     opens its detail, and advances its status over a few seconds so the
 *     four-stage timeline animates
 *   - ambient sim that nudges a few of the seeded fixture rows from
 *     received → verifying → verified / onchain over time so the table
 *     visibly moves
 *
 * Functional style throughout (we read DOM, but operate on plain data
 * objects via small pure helpers; no class state). The module exposes a
 * single `mount()` entry point.
 */

import { getSample, type Sample } from "../data/fixtures";
import {
  PIPELINE_FIXTURES,
  SCHEMA_FAMILY,
  SCHEMA_LABEL,
  formatRelative,
  truncateHash,
  type PipelineEntry,
  type PipelineSchema,
  type PipelineStatus,
} from "../data/pipelineFixtures";
import { verifyCustom } from "../lib/verify";
import {
  getTranslations,
  type Locale,
  type SampleCopy,
  type Translations,
} from "../i18n/translations";

type Filter = "all" | PipelineStatus;

type Row = PipelineEntry & {
  /** Stable DOM id used to find/update the row. */
  readonly id: string;
  /** Schema title shown in the detail header, e.g. "Identity". */
  readonly schemaTitle: string;
  /**
   * Optional human description for sample-spawned rows; surfaces in the
   * detail body as the row's scenario line.
   */
  readonly scenario?: string;
  /** Optional final outcome blurb for sample-spawned rows. */
  readonly outcome?: string;
  /**
   * Tutorial content for sample-driven rows — these turn the detail
   * panel into a business-value explainer for the demo. Absent on
   * the seeded fixture rows and on custom uploads.
   */
  readonly stakes?: ReadonlyArray<string>;
  readonly businessImpact?: ReadonlyArray<string>;
  readonly failReason?: string;
  readonly counterFactual?: Readonly<{
    readonly without: ReadonlyArray<string>;
    readonly with: ReadonlyArray<string>;
  }>;
  /** Source of this row, used to gate tutorial vs upload rendering. */
  readonly source?: "fixture" | "sample" | "upload";
};

interface Globals {
  readonly locale: Locale;
  readonly i18n: Translations;
}

declare global {
  interface Window {
    __LEMMA_DEMO_I18N__?: Globals;
  }
}

const THEME_KEY = "lemma-demo-theme";

/**
 * Application state. We keep it in a single object because the
 * interactions all read the same handful of fields; passing it as a
 * parameter into the small pure helpers below keeps `mount()` itself
 * readable.
 */
interface State {
  rows: Row[];
  filter: Filter;
  query: string;
  selectedId: string | null;
  /** Map of rowId → timer handle for in-flight sample animations. */
  animTimers: Map<string, ReturnType<typeof setTimeout>[]>;
  /** Per-row stage timestamps, mirroring what a real API would return. */
  stageTimes: Map<string, Partial<Record<TimelineStage, string>>>;
  /**
   * Element that had focus immediately before the detail panel opened.
   * Restored on close so keyboard users return to where they were
   * instead of dropping to <body>.
   */
  lastFocus: HTMLElement | null;
}

type TimelineStage = "registered" | "verifying" | "offchain" | "onchain";

const STAGE_ORDER: ReadonlyArray<TimelineStage> = [
  "registered",
  "verifying",
  "offchain",
  "onchain",
];

export function mount(): void {
  const globals = window.__LEMMA_DEMO_I18N__;
  const t = globals?.i18n ?? getTranslations("en");
  const locale = globals?.locale ?? "en";
  const state: State = {
    rows: PIPELINE_FIXTURES.map(toRow),
    filter: "all",
    query: "",
    selectedId: null,
    animTimers: new Map(),
    stageTimes: new Map(),
    lastFocus: null,
  };

  // Seed stage times for the existing fixtures so the timeline doesn't
  // open with empty timestamps when the user inspects them.
  state.rows.forEach((row) => seedStageTimes(state, row));

  wireTheme();
  wireFilters(state, t);
  wireSearch(state, t);
  wireRowClicks(state, t);
  wireSampleChips(state, t, locale);
  wireCustomUpload(state, t);
  wireDetailClose(state);
  startUpdatedAtTick();
  startAmbientSim(state, t);
}

/* ─── Row helpers ─── */

function toRow(entry: PipelineEntry): Row {
  return {
    ...entry,
    id: entry.docHash,
    schemaTitle: SCHEMA_LABEL[entry.schema],
    source: "fixture",
  };
}

function seedStageTimes(state: State, row: Row): void {
  const reached = stagesReachedAt(row.status);
  const map: Partial<Record<TimelineStage, string>> = {};
  const baseTs = Date.parse(row.updatedAt);
  // Spread the seeded stages over a 30-second window leading up to the
  // row's "updated" timestamp.
  reached.forEach((stage, i) => {
    map[stage] = new Date(baseTs - (reached.length - 1 - i) * 5000).toISOString();
  });
  state.stageTimes.set(row.id, map);
}

function stagesReachedAt(status: PipelineStatus): ReadonlyArray<TimelineStage> {
  switch (status) {
    case "received": return ["registered"];
    case "verifying": return ["registered", "verifying"];
    case "verified": return ["registered", "verifying", "offchain"];
    case "onchain":
      return ["registered", "verifying", "offchain", "onchain"];
    case "rejected": return ["registered", "verifying"];
  }
}

/* ─── Theme toggle ─── */

function wireTheme(): void {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch (_) {
      /* private mode */
    }
  });
}

/* ─── Filter tabs ─── */

function wireFilters(state: State, t: Translations): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>(".tab[data-filter]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((other) => {
        other.classList.remove("is-active");
        other.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      const filter = (tab.dataset.filter as Filter) ?? "all";
      state.filter = filter;
      applyFilterAndSearch(state, t);
    });
  });
}

/* ─── Search ─── */

function wireSearch(state: State, t: Translations): void {
  const input = document.getElementById("pipeline-search");
  if (!(input instanceof HTMLInputElement)) return;
  input.addEventListener("input", () => {
    state.query = input.value.trim().toLowerCase();
    applyFilterAndSearch(state, t);
  });
}

function applyFilterAndSearch(state: State, t: Translations): void {
  const tbody = document.getElementById("pipeline-tbody");
  if (!tbody) return;
  const trs = tbody.querySelectorAll<HTMLTableRowElement>("tr[data-doc-hash]");
  let shown = 0;
  trs.forEach((tr) => {
    const status = tr.dataset.status ?? "";
    const hash = (tr.dataset.docHash ?? "").toLowerCase();
    const schema = (tr.dataset.schema ?? "").toLowerCase();
    const matchesFilter = state.filter === "all" || state.filter === status;
    const matchesQuery =
      state.query === "" ||
      hash.includes(state.query) ||
      schema.includes(state.query);
    const visible = matchesFilter && matchesQuery;
    tr.style.display = visible ? "" : "none";
    if (visible) shown += 1;
  });
  const count = document.getElementById("pipeline-count");
  if (count) {
    count.textContent = t.table.showing.replace("{n}", String(shown));
  }
  // Empty state row
  let emptyRow = tbody.querySelector<HTMLTableRowElement>("tr.empty-state-row");
  if (shown === 0) {
    if (!emptyRow) {
      emptyRow = document.createElement("tr");
      emptyRow.className = "empty-state-row";
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "empty-row";
      td.textContent = t.table.empty;
      emptyRow.appendChild(td);
      tbody.appendChild(emptyRow);
    }
  } else if (emptyRow) {
    emptyRow.remove();
  }
}

/* ─── Row clicks → detail ─── */

function wireRowClicks(state: State, t: Translations): void {
  const tbody = document.getElementById("pipeline-tbody");
  if (!tbody) return;
  tbody.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const tr = target.closest<HTMLTableRowElement>("tr[data-doc-hash]");
    if (!tr) return;
    const id = tr.dataset.docHash ?? "";
    openDetail(state, t, id);
  });
}

function openDetail(state: State, t: Translations, id: string): void {
  const row = state.rows.find((r) => r.id === id);
  if (!row) return;

  // Capture focus before opening so we can restore on close. Skip if
  // the panel is already open (re-opening with a new row should leave
  // the original lastFocus intact so close returns to the true origin).
  if (!state.selectedId) {
    const active = document.activeElement;
    state.lastFocus = active instanceof HTMLElement ? active : null;
  }
  state.selectedId = id;

  // Visual selection
  document
    .querySelectorAll<HTMLTableRowElement>("#pipeline-tbody tr[data-doc-hash]")
    .forEach((tr) => {
      tr.classList.toggle("is-selected", tr.dataset.docHash === id);
    });

  renderDetail(state, t, row);

  const panel = document.getElementById("detail");
  const overlay = document.getElementById("detail-overlay");
  panel?.classList.add("is-open");
  overlay?.classList.add("is-open");
  panel?.setAttribute("aria-hidden", "false");
  overlay?.setAttribute("aria-hidden", "false");

  // Move focus into the dialog so keyboard users land on something
  // actionable. The close button is the only focusable element in the
  // panel chrome; renderDetailBody is read-only content.
  const closeBtn = document.getElementById("detail-close");
  closeBtn?.focus();
}

function renderDetail(state: State, t: Translations, row: Row): void {
  const title = document.getElementById("detail-title");
  const body = document.getElementById("detail-body");
  if (!title || !body) return;
  title.textContent = `${row.schemaTitle}${t.detail.titleSuffix}`;
  body.innerHTML = renderDetailBody(state, t, row);
}

function renderDetailBody(state: State, t: Translations, row: Row): string {
  const reached = new Set(stagesReachedAt(row.status));
  const failed = row.status === "rejected";
  const failStage: TimelineStage = "verifying"; // current rejection model fails at proof verify
  const times = state.stageTimes.get(row.id) ?? {};

  const stepHtml = STAGE_ORDER.map((stage) => {
    const isReached = reached.has(stage);
    const isCurrent = !failed && row.status === "verifying" && stage === "verifying";
    const isFail = failed && stage === failStage;
    const state_ =
      isFail ? "fail" : isReached && !isCurrent ? "done"
      : isCurrent ? "active" : "pending";
    const label = stepLabel(t, stage);
    const ts = times[stage];
    const timeText = ts ? formatTime(ts) : "";
    const note =
      isFail && row.rejectionReason
        ? `<div class="timeline-note">${escape(row.rejectionReason)}</div>`
        : "";
    return `
      <li class="timeline-step" data-state="${state_}" data-stage="${stage}">
        <span class="timeline-marker" aria-hidden="true"></span>
        <div class="timeline-text">
          <span class="timeline-label">${escape(label)}</span>
          ${timeText ? `<span class="timeline-time">${escape(timeText)}</span>` : ""}
          ${note}
        </div>
      </li>
    `;
  }).join("");

  const scenario = row.scenario
    ? `
        <div class="detail-section">
          <div class="detail-section-label">${escape(t.detail.scenario)}</div>
          <div class="field-value is-plain">${escape(row.scenario)}</div>
        </div>
      `
    : "";

  // Tutorial sections — only render when the row was spawned from a
  // sample chip (and therefore has the populated business context
  // fields from i18n.samples.{id}). Empty for fixture rows and custom
  // uploads, which don't have a designed business narrative.
  const tutorialHtml = row.source === "sample"
    ? renderTutorial(t, row)
    : "";

  const hookHtml = row.hooks && row.hooks.length > 0
    ? `
        <div class="detail-section">
          <div class="detail-section-label">${escape(t.detail.hookExecutions)}</div>
          ${row.hooks.map((h) => `
            <div class="hook-row">
              <span class="hook-name">${escape(h.name)}</span>
              <span class="hook-badge">${escape(
                h.status === "succeeded"
                  ? t.detail.hookStatusSucceeded
                  : t.detail.hookStatusFailed,
              )}</span>
            </div>
          `).join("")}
        </div>
      `
    : "";

  return `
    ${scenario}
    ${tutorialHtml}
    <div class="detail-section">
      <div class="detail-section-label">${escape(t.detail.verificationPipeline)}</div>
      <ol class="timeline">${stepHtml}</ol>
    </div>

    <div class="detail-section">
      <div class="detail-section-label">${escape(t.detail.documentInfo)}</div>
      <div class="field-grid">
        ${field(t.detail.fields.docHash, row.docHash)}
        ${field(t.detail.fields.schema, row.schema, true)}
        ${field(t.detail.fields.ipfsCid, row.ipfsCid)}
        ${field(t.detail.fields.issuer, row.issuer)}
        ${field(t.detail.fields.subject, row.subject)}
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-label">${escape(t.detail.cryptographic)}</div>
      <div class="field-grid">
        ${field(t.detail.fields.commitmentScheme, row.commitmentScheme, true)}
        ${field(t.detail.fields.commitmentRoot, row.commitmentRoot)}
        ${field(t.detail.fields.revocationRoot, row.revocationRoot)}
        ${field(t.detail.fields.signatureFormat, row.signatureFormat, true)}
      </div>
    </div>

    ${hookHtml}

    <div class="detail-section">
      <div class="detail-section-label">${escape(t.detail.onchain)}</div>
      <div class="field-grid">
        ${field(t.detail.fields.chain, row.chain, true)}
      </div>
    </div>
  `;
}

function field(label: string, value: string, plain = false): string {
  return `
    <div class="field">
      <span class="field-label">${escape(label)}</span>
      <span class="field-value ${plain ? "is-plain" : ""}">${escape(value)}</span>
    </div>
  `;
}

function stepLabel(t: Translations, stage: TimelineStage): string {
  return t.detail.steps[stage];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function escape(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─── Tutorial content (rendered for sample-driven rows) ─── */

/**
 * Build the "what this protects / business impact / counter-factual"
 * sections for the detail panel. These restore the original demo's
 * business-value framing — the Oracle Pipeline redesign trimmed them,
 * and they were brought back so sample chips lead the user through
 * the same teaching arc as before (scenario → stakes → outcome).
 *
 * Timing: only the "context" sections (stakes) render before the
 * verification pipeline animates. Outcome sections — businessImpact
 * for pass, failReason + counterFactual for fail — render after the
 * pipeline reaches its terminal state, so the user sees the result
 * appear once verification has actually run. The detail panel is
 * re-rendered by transitionRow as the row's status changes, so these
 * gates fire automatically as the animation completes.
 */
function renderTutorial(t: Translations, row: Row): string {
  const parts: string[] = [];

  // Context: always shown so the user reads the scenario + stakes
  // before the pipeline starts.
  if (row.stakes && row.stakes.length > 0) {
    parts.push(`
      <div class="detail-section">
        <div class="detail-section-label">${escape(t.detail.whatAtStake)}</div>
        <ul class="stakes-list">
          ${row.stakes.map((s) => `<li>${escape(s)}</li>`).join("")}
        </ul>
      </div>
    `);
  }

  // Outcome (pass side): only after verification completes off-chain
  // or anchors on-chain. Mirrors the timeline reaching "Off-chain
  // Verified" / "On-chain Verified".
  const passComplete = row.status === "verified" || row.status === "onchain";
  if (passComplete && row.businessImpact && row.businessImpact.length > 0) {
    parts.push(`
      <div class="detail-section">
        <div class="detail-section-label">${escape(t.detail.businessImpact)}</div>
        <ul class="impact-list">
          ${row.businessImpact.map((s) => `<li>${escape(s)}</li>`).join("")}
        </ul>
      </div>
    `);
  }

  // Outcome (fail side): only after verification rejects. Mirrors the
  // timeline reaching the rejection step, so the failure narrative
  // appears alongside the red marker rather than pre-spoiling it.
  const failComplete = row.status === "rejected";
  if (failComplete && row.failReason) {
    parts.push(`
      <div class="detail-section">
        <div class="detail-section-label">${escape(t.detail.whatWentWrong)}</div>
        <p class="fail-reason">${escape(row.failReason)}</p>
      </div>
    `);
  }

  if (failComplete && row.counterFactual) {
    const cf = row.counterFactual;
    parts.push(`
      <div class="detail-section">
        <div class="cf-grid">
          <div class="cf-col cf-col-without">
            <div class="cf-col-label">${escape(t.detail.counterFactualWithout)}</div>
            <ul class="cf-list">
              ${cf.without.map((s) => `<li>${escape(s)}</li>`).join("")}
            </ul>
          </div>
          <div class="cf-col cf-col-with">
            <div class="cf-col-label">${escape(t.detail.counterFactualWith)}</div>
            <ul class="cf-list">
              ${cf.with.map((s) => `<li>${escape(s)}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `);
  }

  return parts.join("");
}

/* ─── Custom JSON upload ─── */

/**
 * Wire the "upload your own proof JSON" file input. On change: read the
 * file, call verifyCustom (re-uses the mock verifier from #206's
 * preserved lib/verify.ts), spawn a pipeline row, and animate it
 * Received → Verifying → Verified / Rejected based on the verify
 * outcome. All in-browser; the file never leaves the device.
 */
function wireCustomUpload(state: State, t: Translations): void {
  const input = document.getElementById("custom-upload-input");
  const status = document.getElementById("custom-upload-status");
  if (!(input instanceof HTMLInputElement) || !status) return;

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    status.className = "sample-upload-status";
    status.textContent = "";

    try {
      const text = await file.text();
      const result = await verifyCustom(text);

      const docHash = `0x${randSegment(40)}`;
      const row: Row = {
        id: docHash,
        docHash,
        schema: "identity-v1",
        status: "received",
        chain: "Browser-only",
        updatedAt: new Date().toISOString(),
        ipfsCid: "",
        issuer: "",
        subject: "",
        commitmentScheme: "poseidon",
        commitmentRoot: "",
        revocationRoot: "",
        signatureFormat: "bbs+",
        schemaTitle: t.sampleStrip.customChip,
        source: "upload",
        failReason: result.overall === "fail" ? result.failureReason : undefined,
        rejectionReason:
          result.overall === "fail" ? result.failureReason : undefined,
      };

      state.rows = [row, ...state.rows];
      state.stageTimes.set(row.id, { registered: row.updatedAt });
      prependRow(t, row);
      openDetail(state, t, row.id);
      applyFilterAndSearch(state, t);

      status.classList.add("is-success");
      status.textContent = t.sampleStrip.uploadSuccess;

      window.setTimeout(
        () => transitionRow(state, t, row.id, "verifying"),
        700,
      );
      if (result.overall === "pass") {
        window.setTimeout(
          () => transitionRow(state, t, row.id, "verified"),
          2000,
        );
      } else {
        window.setTimeout(
          () => transitionRow(state, t, row.id, "rejected"),
          2000,
        );
      }

      // Reset so picking the same file again re-fires change.
      input.value = "";
      window.setTimeout(() => {
        status.className = "sample-upload-status";
        status.textContent = "";
      }, 3500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      status.classList.add("is-error");
      status.textContent = `${t.sampleStrip.uploadErrorPrefix}${msg}`;
    }
  });
}

/* ─── Detail close ─── */

function wireDetailClose(state: State): void {
  const close = (): void => {
    if (!state.selectedId) return;
    document.getElementById("detail")?.classList.remove("is-open");
    document.getElementById("detail-overlay")?.classList.remove("is-open");
    document.getElementById("detail")?.setAttribute("aria-hidden", "true");
    document.getElementById("detail-overlay")?.setAttribute("aria-hidden", "true");
    state.selectedId = null;
    document
      .querySelectorAll<HTMLTableRowElement>("#pipeline-tbody tr[data-doc-hash]")
      .forEach((tr) => tr.classList.remove("is-selected"));
    // Restore focus to whatever was focused before the panel opened.
    state.lastFocus?.focus();
    state.lastFocus = null;
  };
  document.getElementById("detail-close")?.addEventListener("click", close);
  document.getElementById("detail-overlay")?.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.selectedId) close();
  });

  // Focus trap — the panel only owns one focusable (the close button),
  // so Tab/Shift+Tab cycles back to it. This keeps keyboard focus
  // inside the dialog while it's open, per WAI-ARIA dialog pattern.
  document.getElementById("detail")?.addEventListener("keydown", (e) => {
    if (!state.selectedId) return;
    if (e.key !== "Tab") return;
    e.preventDefault();
    document.getElementById("detail-close")?.focus();
  });
}

/* ─── Sample chip → spawn pipeline row + animate ─── */

function wireSampleChips(state: State, t: Translations, locale: Locale): void {
  const chips = document.querySelectorAll<HTMLButtonElement>(".sample-chip[data-sample-id]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const sampleId = chip.dataset.sampleId ?? "";
      const sample = getSample(sampleId);
      if (!sample) return;
      spawnSampleRow(state, t, sample, locale);
    });
  });
}

function spawnSampleRow(
  state: State,
  t: Translations,
  sample: Sample,
  locale: Locale,
): void {
  const copy = t.samples[sample.id];
  const docHash = synthHash(sample.id);
  const row: Row = {
    id: docHash,
    docHash,
    schema: pickSchemaForSample(sample),
    status: "received",
    chain: "Monad Testnet",
    updatedAt: new Date().toISOString(),
    ipfsCid: `bafy${randSegment(20)}`,
    issuer: `0x${randSegment(20)}`,
    subject: `0x${randSegment(20)}`,
    commitmentScheme: "poseidon",
    commitmentRoot: `0x${randSegment(32)}`,
    revocationRoot: `0x${randSegment(32)}`,
    signatureFormat: sample.bundle.envelope.scheme.startsWith("BBS+")
      ? "bbs+"
      : "opaque",
    schemaTitle: SCHEMA_LABEL[pickSchemaForSample(sample)],
    scenario: copy?.scenario,
    outcome: copy?.outcome,
    // Tutorial content surfaced in the detail panel.
    stakes: copy?.stakes,
    businessImpact: copy?.businessImpact,
    failReason: copy?.failReason || undefined,
    counterFactual: copy?.counterFactual,
    source: "sample",
    rejectionReason:
      sample.expectedResult === "fail" ? copy?.outcome : undefined,
  };

  state.rows = [row, ...state.rows];
  state.stageTimes.set(row.id, { registered: row.updatedAt });

  prependRow(t, row);
  openDetail(state, t, row.id);
  applyFilterAndSearch(state, t);

  // Animate Received → Verifying → (Verified → On-chain) or Rejected.
  const timers: ReturnType<typeof setTimeout>[] = [];
  timers.push(
    setTimeout(() => transitionRow(state, t, row.id, "verifying"), 900),
  );
  if (sample.expectedResult === "pass") {
    timers.push(setTimeout(() => transitionRow(state, t, row.id, "verified"), 2700));
    timers.push(setTimeout(() => transitionRow(state, t, row.id, "onchain"), 4500));
  } else {
    timers.push(setTimeout(() => transitionRow(state, t, row.id, "rejected"), 2700));
  }
  state.animTimers.set(row.id, timers);
}

function pickSchemaForSample(sample: Sample): PipelineSchema {
  if (sample.industry === "Financial") return "kyc-aml-v2";
  if (sample.industry === "Manufacturing") return "asset-proof-v1";
  return "identity-v1";
}

function randSegment(len: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function synthHash(seed: string): string {
  // Stable-looking but unique-per-click hash so the row id is unique.
  const nonce = Math.random().toString(16).slice(2, 8);
  return `0x${hashSeed(seed)}${nonce}${randSegment(6)}`;
}

function hashSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function prependRow(t: Translations, row: Row): void {
  const tbody = document.getElementById("pipeline-tbody");
  if (!tbody) return;
  const tr = document.createElement("tr");
  tr.dataset.docHash = row.docHash;
  tr.dataset.status = row.status;
  tr.dataset.schema = row.schema;
  tr.classList.add("is-fresh");
  tr.innerHTML = `
    <td><span class="cell-hash">${escape(truncateHash(row.docHash))}</span></td>
    <td><span class="cell-schema"><span class="schema-dot ${SCHEMA_FAMILY[row.schema]}"></span>${escape(SCHEMA_LABEL[row.schema])}</span></td>
    <td><span class="status-pill ${row.status}">${escape(t.tabs[statusToTabKey(row.status)])}</span></td>
    <td class="col-chain cell-chain">${escape(row.chain)}</td>
    <td class="cell-updated" data-iso="${row.updatedAt}">${escape(formatRelative(row.updatedAt))}</td>
  `;
  // Insert before existing rows (but after the empty-state row if one exists)
  const empty = tbody.querySelector(".empty-state-row");
  if (empty) {
    tbody.insertBefore(tr, empty);
  } else {
    tbody.insertBefore(tr, tbody.firstChild);
  }
}

function statusToTabKey(
  status: PipelineStatus,
): "received" | "verifying" | "verified" | "onchain" | "rejected" {
  return status;
}

function transitionRow(
  state: State,
  t: Translations,
  id: string,
  next: PipelineStatus,
): void {
  const row = state.rows.find((r) => r.id === id);
  if (!row) return;
  const newRow: Row = { ...row, status: next, updatedAt: new Date().toISOString() };
  state.rows = state.rows.map((r) => (r.id === id ? newRow : r));

  // Update stage times
  const times = state.stageTimes.get(id) ?? {};
  const stamp = new Date().toISOString();
  const nextTimes: Partial<Record<TimelineStage, string>> = { ...times };
  if (next === "verifying") nextTimes.verifying = stamp;
  if (next === "verified") nextTimes.offchain = stamp;
  if (next === "onchain") nextTimes.onchain = stamp;
  if (next === "rejected") nextTimes.verifying = times.verifying ?? stamp;
  state.stageTimes.set(id, nextTimes);

  // Update the DOM
  const tr = document.querySelector<HTMLTableRowElement>(
    `#pipeline-tbody tr[data-doc-hash="${cssEscape(id)}"]`,
  );
  if (tr) {
    tr.dataset.status = next;
    const pill = tr.querySelector<HTMLSpanElement>(".status-pill");
    if (pill) {
      pill.className = `status-pill ${next}`;
      pill.textContent = t.tabs[statusToTabKey(next)];
    }
    const updated = tr.querySelector<HTMLSpanElement>(".cell-updated");
    if (updated) {
      updated.dataset.iso = stamp;
      updated.textContent = formatRelative(stamp);
    }
  }

  applyFilterAndSearch(state, t);

  // Re-render the detail panel if it's the open one
  if (state.selectedId === id) {
    renderDetail(state, t, newRow);
  }
}

function cssEscape(value: string): string {
  if (typeof (window.CSS as { escape?: (s: string) => string })?.escape === "function") {
    return (window.CSS as { escape: (s: string) => string }).escape(value);
  }
  return value.replace(/(["\\])/g, "\\$1");
}

/* ─── Ambient sim: nudge a couple of seeded rows forward over time ─── */

function startAmbientSim(state: State, t: Translations): void {
  const advance = (): void => {
    // Find a random non-terminal row and advance it one stage.
    const candidates = state.rows.filter(
      (r) => r.status === "received" || r.status === "verifying" || r.status === "verified",
    );
    if (candidates.length === 0) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const next: PipelineStatus =
      target.status === "received"
        ? "verifying"
        : target.status === "verifying"
        ? Math.random() < 0.9 ? "verified" : "rejected"
        : "onchain";
    transitionRow(state, t, target.id, next);
  };
  // Advance every 4-7 seconds.
  const tick = (): void => {
    const delay = 4000 + Math.random() * 3000;
    window.setTimeout(() => {
      advance();
      tick();
    }, delay);
  };
  tick();
}

/* ─── Updated-at tick (refresh "Nh ago" labels every 30s) ─── */

function startUpdatedAtTick(): void {
  window.setInterval(() => {
    document
      .querySelectorAll<HTMLSpanElement>(".cell-updated[data-iso]")
      .forEach((el) => {
        const iso = el.dataset.iso;
        if (!iso) return;
        el.textContent = formatRelative(iso);
      });
  }, 30_000);
}
