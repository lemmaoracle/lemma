/**
 * Use case detail — §3 comparison table extra row (cyber-relevant UCs).
 *
 * The §3「選定基準」table is a common 4-row capability matrix (access control /
 * masking / encryption / Lemma). For the cyber-relevant UCs, detection &
 * monitoring is the reader's closest alternative, so we insert one extra row
 * — "detection / monitoring only" — above the Lemma row, scored △ / ✗ / ✗
 * (sees content to work / no independent verification / logs are tamperable).
 *
 * Per-slug label (the monitoring tool framed in the UC's own context), both
 * locales. Slugs with no entry keep the 3-row table. See
 * `Lemma_UC_cyber_compare_4row_PR.md`.
 */
import type { Locale } from "../i18n/translations";

interface L10n {
  readonly ja: string;
  readonly en: string;
}

const USE_CASE_COMPARE_ROW: Readonly<Record<string, L10n>> = {
  "financial-data-exfiltration": { ja: "SIEM / DLP 監視のみ", en: "SIEM / DLP monitoring only" },
  "ai-audit-log-proof": { ja: "ログ・監視のみ", en: "Logging / monitoring only" },
  "incident-response-record": { ja: "インシデント監視のみ", en: "Incident monitoring only" },
  "prompt-injection-detection": { ja: "WAF / 入力監視のみ", en: "WAF / input monitoring only" },
  "customer-flag-need-to-know": { ja: "モニタリングのみ", en: "Monitoring only" },
};

/** Resolved detection/monitoring row label for the locale, or undefined. */
export function getUseCaseCompareRow(slug: string, locale: Locale): string | undefined {
  return USE_CASE_COMPARE_ROW[slug]?.[locale];
}
