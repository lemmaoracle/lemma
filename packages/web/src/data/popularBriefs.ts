/**
 * 一覧トップの「よく見られている / Most-read」ランキング。
 *
 * **手で編集しないこと。** GA4 の実測から生成している:
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/lemma-ga-mcp-key.json \
 *   GA4_PROPERTY_ID=527344455 \
 *   python3 scripts/refresh-popular-briefs.py
 *
 * 最終更新 2026-08-21 — 直近 28 日（前日まで）の screenPageViews を
 * JA + EN 合算。Brief 本文ページのみ（一覧・カテゴリ・柱・アーカイブは除外）。
 * この窓で閲覧のあった Brief は 105 本。並び＝順位（上が1位）。
 *
 * 窓が短いほど順位は週ごとに入れ替わる。安定させたいときは --days を
 * 伸ばす（90 日まではプロパティに保持がある）。値は slug ＝ content の
 * ファイル名から .md を落としたもの。[] にするとセクションごと消える。
 */
export const POPULAR_BRIEF_SLUGS: ReadonlyArray<string> = [
  "011-synthid-watermark-reverse-engineering", // 41 views (JA 4 + EN 37)
  "109-servicenow-ai-platform-preauth-rce", // 36 views (JA 35 + EN 1)
  "084-hong-kong-deepfake-video-call-fraud", // 19 views (JA 0 + EN 19)
  "099-agentjacking-sentry-mcp", // 18 views (JA 2 + EN 16)
  "119-japan-sexual-deepfake-npa-h1-2026", // 8 views (JA 2 + EN 6)
];
