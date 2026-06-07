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
import verifiableAiJa from "./pillar-v4/verifiable-ai.ja.html?raw";
import agentAuthorityJa from "./pillar-v4/agent-authority-proof.ja.html?raw";
import regulatoryAttributeJa from "./pillar-v4/regulatory-attribute-proof.ja.html?raw";
import verifiableOriginEn from "./pillar-v4/verifiable-origin.en.html?raw";
import verifiableAiEn from "./pillar-v4/verifiable-ai.en.html?raw";
import agentAuthorityEn from "./pillar-v4/agent-authority-proof.en.html?raw";
import regulatoryAttributeEn from "./pillar-v4/regulatory-attribute-proof.en.html?raw";

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
    en: verifiableOriginEn,
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
  "verifiable-ai": {
    ja: verifiableAiJa,
    en: verifiableAiEn,
    meta: {
      title: {
        ja: "検証可能 AI — AI の判断を、後から独立に再現・検証する | Lemma",
        en: "Verifiable AI — independently reproduce and verify AI decisions after the fact | Lemma",
      },
      description: {
        ja: "検証可能 AI。AI の判断を、後から独立に再現・検証する。何を見て、どう判断したかを、機密データを開示せず暗号証明として残す。",
        en: "Verifiable AI. Reproduce and verify what an AI saw and decided, after the fact — without disclosing the confidential data.",
      },
    },
  },
  "agent-authority-proof": {
    ja: agentAuthorityJa,
    en: agentAuthorityEn,
    meta: {
      title: {
        ja: "エージェント権限証明 — AI エージェントに鍵を渡さず、権限だけを証明する | Lemma",
        en: "Agent Authority Proof — prove an agent's authority without handing over keys | Lemma",
      },
      description: {
        ja: "エージェント権限証明。AI エージェントに署名鍵を渡さず、行為ごとに「委任された範囲内である」ことを暗号で証明する。",
        en: "Agent Authority Proof. Instead of giving an AI agent signing keys, prove at each action that it stays within delegated scope.",
      },
    },
  },
  "regulatory-attribute-proof": {
    ja: regulatoryAttributeJa,
    en: regulatoryAttributeEn,
    meta: {
      title: {
        ja: "規制属性証明 — AI に個人情報を渡さず、必要な事実だけを証明として渡す | Lemma",
        en: "Regulatory Attribute Proof — pass only the required facts as proofs, never the personal data | Lemma",
      },
      description: {
        ja: "規制属性証明。原本を手元に残したまま、必要な属性だけを証明として渡す。KYC・年齢確認・許認可などを、個人情報を集約せず検証可能に。",
        en: "Regulatory Attribute Proof. Keep originals in hand and pass only the required attributes as proofs — KYC, age, licensing, verifiable without aggregating PII.",
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
