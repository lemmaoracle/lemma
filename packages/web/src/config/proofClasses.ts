/**
 * The 5 Lemma API proof classes (suites) — single source of truth for the
 * class → canonical-page mapping and the per-issuance USD rate. Consumed by
 * /pricing #api (PricingLemmaApi.astro), the /lemma-api node, and (later) the
 * pillar pages, so the class list / rates / links never drift across surfaces.
 *
 * Four of the five map 1:1 to a pillar page; 認証/authentication has no pillar
 * yet and deep-links to its Seal LP until the canonical URL is confirmed.
 * `path` is locale-neutral — prefix it with the locale base ("" | "/ja").
 *
 * Rates are working values (see PricingLemmaApi header) — confirm with CTO.
 */
import type { Locale } from "../i18n/translations";

export interface ProofClass {
  readonly key: "provenance" | "authentication" | "authority" | "inference" | "attribute";
  readonly name: { readonly ja: string; readonly en: string };
  /** One-line "what it proves", for the suite index / rate presentation. */
  readonly blurb: { readonly ja: string; readonly en: string };
  /** Per-issuance rate in USD (verification is always free). */
  readonly rate: string;
  /** Locale-neutral canonical path; 認証 → /seal/ (no pillar page yet). */
  readonly path: string;
}

export const PROOF_CLASSES: ReadonlyArray<ProofClass> = [
  { key: "provenance",     name: { ja: "来歴", en: "Provenance" },     blurb: { ja: "データの出所を証明", en: "Prove where data came from" },       rate: "0.005",     path: "/pillars/verifiable-origin/" },
  { key: "authentication", name: { ja: "認証", en: "Authentication" }, blurb: { ja: "本人性・所属を証明", en: "Prove identity & affiliation" },      rate: "0.01–0.05", path: "/seal/" },
  { key: "authority",      name: { ja: "権限", en: "Authority" },      blurb: { ja: "委譲された権限を証明", en: "Prove delegated authority" },        rate: "0.05",      path: "/pillars/agent-authority-proof/" },
  { key: "inference",      name: { ja: "推論", en: "Inference" },      blurb: { ja: "AI の推論を証明", en: "Prove an AI's inference" },              rate: "0.07",      path: "/pillars/verifiable-ai/" },
  { key: "attribute",      name: { ja: "属性", en: "Attribute" },      blurb: { ja: "規制属性を満たすと証明", en: "Prove a regulated attribute" },     rate: "0.20",      path: "/pillars/regulatory-attribute-proof/" },
] as const;

/** Locale-prefixed href for a proof class (base = "" for en, "/ja" for ja). */
export const proofClassHref = (cls: ProofClass, base: string): string => `${base}${cls.path}`;

/** Localized class name. */
export const proofClassName = (cls: ProofClass, locale: Locale): string => cls.name[locale];
