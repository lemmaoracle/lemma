/**
 * Brief → Lemma conversion copy (BizDev 導線モジュール v1, detail page).
 *
 * The Brief detail page gets an active path to the AI-attack-resistance LP:
 *   - §1 banner after the TL;DR (top of body, intro intact)
 *   - §2 single-path tail CTA at the article end
 * The neutral incident analysis is never touched; only the banner line and
 * the tail-CTA heading swap by Brief theme (spec §3). Everything else (tag,
 * button labels, the but-honest note) is theme-invariant.
 *
 * Theme assignment is BizDev-owned and per-Brief (THEME_BY_SLUG); unlisted
 * Briefs fall back to the neutral default (共通). It is deliberately an
 * explicit allowlist rather than a category-derived rule — category alone
 * mis-fits cases (e.g. an identity-auth robot-RCE Brief is not a "data
 * exfiltration" story), so themes are opted in per Brief as they're confirmed.
 *
 * Out of scope (lives elsewhere): the §4 inline CTA to the Pillar / use cases
 * (BriefTemplate), the newsletter banner, the security-assessment engagement
 * (the LP, not here).
 */
import type { Locale } from "../i18n/translations";
import { DISCOVERY_CALL_URL } from "./cta";

export type BriefCtaTheme =
  | "default"
  | "data_exfil_privesc"
  | "audit_log_tamper"
  | "siem_evasion"
  | "social_eng";

interface ThemeCopy {
  /** Banner one-liner (§1). */
  bannerLine: string;
  /** Tail-CTA heading / 投げかけ (§2). */
  tailHead: string;
}

/** Theme-invariant copy (tag, buttons, but-honest note). */
interface SharedCopy {
  bannerTag: string;
  bannerBtn: string;
  tailMainBtn: string;
  tailSubLink: string;
  tailNote: string;
  /** Open-loop CTA (§1-screen, after the gap module) — theme-invariant. */
  loopLine: string;
  loopBtn: string;
}

const SHARED: Record<Locale, SharedCopy> = {
  ja: {
    bannerTag: "最新AI攻撃実験",
    bannerBtn: "結果を見る →",
    tailMainBtn: "最新AI攻撃実験を見る →",
    tailSubLink: "デモをリクエスト →",
    tailNote: "※ セキュリティ評価（システム監査）は別途・規模に応じて設計します。",
    loopLine: "同じ構造を、最新 AI 6 種で再現したら？ 最強モデルが 5/5 突破。Lemma 導入後は突破ゼロだった。",
    loopBtn: "実証を見る →",
  },
  en: {
    bannerTag: "AI ATTACK LAB",
    bannerBtn: "See the results →",
    tailMainBtn: "See the latest AI attack experiments →",
    tailSubLink: "Request a demo →",
    tailNote:
      "* Security assessment (system audit) is scoped separately, sized to the engagement.",
    loopLine:
      "What if the same structure were run against 6 frontier AIs? The strongest broke through 5/5; after Lemma, 0 broke through.",
    loopBtn: "See the evidence →",
  },
};

const THEMES: Record<Locale, Record<BriefCtaTheme, ThemeCopy>> = {
  ja: {
    default: {
      bannerLine: "最強AIが企業システムを突破。Lemma 導入後は？",
      tailHead: "AI 時代のサイバー攻撃に、備えはできていますか？",
    },
    data_exfil_privesc: {
      bannerLine: "AIが権限を昇格させ全件取得。止め方は？",
      tailHead: "御社の権限管理、AI に昇格されませんか？",
    },
    audit_log_tamper: {
      bannerLine: "AIが監査ログを自律で書き換え。止め方は？",
      tailHead: "御社の監査ログ、書き換えられませんか？",
    },
    siem_evasion: {
      bannerLine: "AIが検知をすり抜けて不正送金。止め方は？",
      tailHead: "御社の検知、AI にすり抜けられませんか？",
    },
    social_eng: {
      bannerLine: "AIが承認フローをなりすまし突破。止め方は？",
      tailHead: "自社のシステムはなりすましに耐えますか？",
    },
  },
  en: {
    default: {
      bannerLine:
        "The strongest AI broke into enterprise systems. What changes after Lemma?",
      tailHead: "Are you ready for cyberattacks in the age of AI?",
    },
    data_exfil_privesc: {
      bannerLine: "AI escalated its own privileges and pulled every record. How do you stop it?",
      tailHead: "Could your access controls be escalated by AI?",
    },
    audit_log_tamper: {
      bannerLine: "AI rewrote the audit log on its own. How do you stop it?",
      tailHead: "Could your audit logs be rewritten?",
    },
    siem_evasion: {
      bannerLine: "AI slipped past detection and moved funds. How do you stop it?",
      tailHead: "Could your detection be slipped past by AI?",
    },
    social_eng: {
      bannerLine: "AI impersonated its way through the approval flow. How do you stop it?",
      tailHead: "Would your systems withstand impersonation?",
    },
  },
};

/**
 * Per-Brief theme assignment (BizDev-owned). Unlisted Briefs → "default".
 * Seeded with unambiguous fits; extend as themes are confirmed.
 */
const THEME_BY_SLUG: Readonly<Record<string, BriefCtaTheme>> = {
  "066-litellm-ai-gateway-privilege-escalation": "data_exfil_privesc",
  "064-salesloft-drift-oauth-salesforce": "data_exfil_privesc",
  "063-claude-code-github-action-bot-trust": "social_eng",
  "047-openclaw-agent-phishing": "social_eng",
};

export function resolveBriefCtaTheme(slug: string): BriefCtaTheme {
  return THEME_BY_SLUG[slug] ?? "default";
}

export function briefCtaCopy(
  locale: Locale,
  theme: BriefCtaTheme,
): SharedCopy & ThemeCopy {
  return { ...SHARED[locale], ...THEMES[locale][theme] };
}

const ATTACK_LP_PATH = "/compare/ai-models-attack-resistance/";

function withUtm(url: string, locale: Locale, medium: string): string {
  const sep = url.includes("?") ? "&" : "?";
  const p = new URLSearchParams({
    utm_source: "brief_detail",
    utm_medium: medium,
    utm_campaign: "brief_to_lp",
    utm_term: locale,
  });
  return `${url}${sep}${p.toString()}`;
}

/** Attack-resistance LP deep link (locale-aware base + UTM). */
export function attackLpUrl(base: string, locale: Locale, medium: string): string {
  return withUtm(`${base}${ATTACK_LP_PATH}`, locale, medium);
}

/** Discovery Call link (canonical per-locale form + UTM). */
export function attackDiscoveryUrl(locale: Locale, medium: string): string {
  return withUtm(DISCOVERY_CALL_URL[locale], locale, medium);
}
