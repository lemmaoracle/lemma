/**
 * Pillar detail — v4 page bodies (Salesforce-style product page).
 *
 * Each pillar's §sections (hero → NOW → §1 mechanism → §2 matrix → §3
 * position → §4 use cases → §5 tech → §6 CTA) are authored as a raw HTML
 * fragment ported from the v4 mockups (Lemma_pillar_detail_v4_*_mockup.html)
 * and injected by `PillarDetailV4.astro` inside `<main class="pv4">`. The
 * shared, namespaced CSS lives in `styles/pillar-v4.css`.
 *
 * JA-first: a slug with no `ja` body falls back to the legacy
 * `PillarDetailTemplate` (see pages/ja/pillars/[slug].astro), so pillars
 * roll onto v4 as their bodies land. EN bodies are a follow-up.
 */
import type { PillarSlug } from "../data/pillars";

// Raw HTML fragments (Vite ?raw import — content is injected via set:html).
import verifiableOriginJa from "./pillar-v4/verifiable-origin.ja.html?raw";

interface PillarV4 {
  readonly ja?: string;
  readonly en?: string;
  /** Meta title / description (H1 + strap), per locale. */
  readonly meta: {
    readonly title: { readonly ja: string; readonly en: string };
    readonly description: { readonly ja: string; readonly en: string };
  };
}

const PILLAR_V4: Partial<Record<PillarSlug, PillarV4>> = {
  "verifiable-origin": {
    ja: verifiableOriginJa,
    meta: {
      title: {
        ja: "来歴証明 — AI が読むデータの出所を、改ざん不能な証明として渡す | Lemma",
        en: "Verifiable Origin — pass the origin of the data AI reads as a tamper-proof proof | Lemma",
      },
      description: {
        ja: "来歴証明。AI が読むデータの出所を、改ざん不能な証明として渡す。原本は発行元に残したまま、出所だけを暗号証明として AI 入力・業務システムへ。",
        en: "Verifiable Origin. Pass the origin of the data AI reads as a tamper-proof proof — the original stays with the issuer, only the provenance travels.",
      },
    },
  },
};

/** v4 body HTML for the slug+locale, or undefined to fall back to legacy. */
export function getPillarV4Body(slug: string, locale: "ja" | "en"): string | undefined {
  return PILLAR_V4[slug as PillarSlug]?.[locale];
}

/** v4 meta (title/description) for the slug, or undefined. */
export function getPillarV4Meta(slug: string):
  | { title: { ja: string; en: string }; description: { ja: string; en: string } }
  | undefined {
  return PILLAR_V4[slug as PillarSlug]?.meta;
}
