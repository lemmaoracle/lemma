/**
 * Brief 記事・右レールの「脅威タイプ別バナー」の文言
 * （`Lemma_コンテンツテンプレート_実装指示_v1_2026-07-30.md` §5.3）。
 *
 * Brief の `primary_category`（脅威タイプ）で見出しと説明1文を出し分ける。
 * ラベル「この脅威タイプの知見」とボタン「知見を受け取る」は共通。
 * 未登録のカテゴリは default に落ちる（新カテゴリを足しても壊れない）。
 *
 * なりすまし等の**脅威別訴求はこのバナーだけ**が持つ——末尾CTAは証明の
 * 訴求（テーマ不変）に一本化されている（§5.5）。
 *
 * 2026-08-21: 説明1文の末尾を「30分で貴社の該当箇所に当てはめます」から
 * 知見の提示に差し替えた。Brief の目的は転換ではなく認知で、デモ直行 CTA は
 * 90日クリック0だったため（末尾CTAのエンタープライズ相談と役割も重複していた）。
 */
import type { Locale } from "../i18n/translations";
import type { CategorySlug } from "../data/criticalBriefs";

export interface ThreatBannerCopy {
  /** 見出し（問いかけ）。 */
  head: string;
  /** 説明1文。 */
  desc: string;
}

const DEFAULT_COPY: Record<Locale, ThreatBannerCopy> = {
  ja: {
    head: "同じ構造は、自社にもありませんか？",
    desc: "実行の前に証明を要求する構成。こうした知見を、週1通でお届けします。",
  },
  en: {
    head: "Does the same structure exist in your systems?",
    desc: "Proof required before execution. Insights like this, once a week.",
  },
};

const COPY: Partial<Record<CategorySlug, Record<Locale, ThreatBannerCopy>>> = {
  "bridge-config-trust": {
    ja: {
      head: "ブリッジの信頼設定は、検証できますか？",
      desc: "署名と設定の正しさを実行前に独立検証する構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can your bridge's trust config be verified?",
      desc: "Pre-execution verification of signatures and config. Insights like this, once a week.",
    },
  },
  "code-provenance": {
    ja: {
      head: "そのコードの出どころを、証明できますか？",
      desc: "配布物の来歴を受け取り側が独立検証できる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can you prove where that code came from?",
      desc: "Independently verifiable code provenance. Insights like this, once a week.",
    },
  },
  "data-provenance": {
    ja: {
      head: "そのデータの来歴を、証明できますか？",
      desc: "データの出どころと改変の有無を独立検証できる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can you prove that data's provenance?",
      desc: "Independently verifiable data provenance. Insights like this, once a week.",
    },
  },
  "training-data-provenance": {
    ja: {
      head: "学習データの来歴を、証明できますか？",
      desc: "学習に使われたデータの出どころを検証できる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can you prove your training data's provenance?",
      desc: "Verifiable training-data provenance. Insights like this, once a week.",
    },
  },
  "ai-decision-integrity": {
    ja: {
      head: "AI の判断根拠を、後から証明できますか？",
      desc: "判断の根拠を実行時に固定し独立検証できる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can you prove what your AI's decision was based on?",
      desc: "Verifiable decision integrity. Insights like this, once a week.",
    },
  },
  "ai-bias-harm": {
    ja: {
      head: "AI の出力の妥当性を、検証できますか？",
      desc: "出力の条件と根拠を独立検証できる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can your AI's outputs be independently verified?",
      desc: "Verifiable output conditions. Insights like this, once a week.",
    },
  },
  "model-supply-chain": {
    ja: {
      head: "そのモデルは、本当に意図したものですか？",
      desc: "モデルの同一性と供給経路を検証できる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Is that model really the one you intended?",
      desc: "Verifiable model identity and supply chain. Insights like this, once a week.",
    },
  },
  "agent-runaway": {
    ja: {
      head: "エージェントの行動範囲を、事前に縛れていますか？",
      desc: "高リスク行動の前に権限証明を要求する構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Is your agent's range of action bound in advance?",
      desc: "Authority proofs before high-risk actions. Insights like this, once a week.",
    },
  },
  "agent-infrastructure": {
    ja: {
      head: "エージェント基盤の権限を、証明で縛れていますか？",
      desc: "基盤側の権限行使に証明を要求する構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Is your agent infrastructure bound by proofs?",
      desc: "Proof-bound authority across agent infrastructure. Insights like this, once a week.",
    },
  },
  "agent-payment-abuse": {
    ja: {
      head: "エージェントの支払いに、権限証明はありますか？",
      desc: "支払いの前に権限と範囲を証明で確かめる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Do your agents' payments carry authority proofs?",
      desc: "Proof-verified payment authority. Insights like this, once a week.",
    },
  },
  "kyc-aml-disclosure": {
    ja: {
      head: "属性の確認を、生データなしで通せますか？",
      desc: "生データを渡さずに属性を証明する構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can you verify attributes without raw data?",
      desc: "Attribute proofs without handing over raw data. Insights like this, once a week.",
    },
  },
  "attribute-proof-bypass": {
    ja: {
      head: "属性証明の再利用・迂回を、止められますか？",
      desc: "証明の範囲と鮮度を検証側で確かめる構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Can you stop attribute proofs being reused or bypassed?",
      desc: "Scope- and freshness-checked proofs. Insights like this, once a week.",
    },
  },
  "identity-auth": {
    ja: {
      head: "自社のシステムは、なりすましに耐えますか？",
      desc: "依頼の発信元に権限証明を要求する構成。こうした知見を、週1通でお届けします。",
    },
    en: {
      head: "Would your systems withstand impersonation?",
      desc: "Origin proofs on every request path. Insights like this, once a week.",
    },
  },
};

export function threatBannerCopy(
  category: CategorySlug,
  locale: Locale,
): ThreatBannerCopy {
  return COPY[category]?.[locale] ?? DEFAULT_COPY[locale];
}
