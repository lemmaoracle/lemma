/**
 * AI の事実確認（2026-11-11・CLUBS ブログの回覧と同じ形）。
 *
 * 事実確認を終えた AI が `node packages/web/scripts/brief-factcheck.mjs <id> --by "Claude Opus 5.5"`
 * を流し、Brief の頭に `fact_check: { by, at, rev }` を書く。rev はそのときの題名と本文の指紋で、
 * あとで Brief を直すと変わり「確認のあと変更あり」になる。by はモデル名まで（「Claude」だけにしない）。
 * 指紋の式は scripts/brief-factcheck.mjs と同じ（変えるときは両方）。
 */
export const factRevOf = (title: string, body: string): string => {
  const s = `${title}\n${body.trim()}`;
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
};

export interface FactCheck {
  by: string;
  at: Date;
  rev: string;
  ref?: string;
}

/** 「修正の記録：PR #1160」（コメントを指すなら「のコメント」）。 */
export const factRefLabel = (ref: string | undefined, locale: "ja" | "en" = "ja"): string => {
  const m = ref?.match(/\/pull\/(\d+)(#[\w-]+)?$/);
  if (!m) return "";
  return locale === "ja"
    ? `修正の記録：PR #${m[1]}${m[2] ? " のコメント" : ""}`
    : `Fixes: PR #${m[1]}${m[2] ? " (comment)" : ""}`;
};

export type FactCheckState = "ok" | "stale" | "none";

/** 札の文と状態。fact_check が無ければ「まだ」。 */
export const factCheckLabel = (
  f: FactCheck | undefined,
  title: string,
  body: string | undefined,
  locale: "ja" | "en" = "ja",
): { text: string; state: FactCheckState } => {
  const ja = locale === "ja";
  if (!f) return { text: ja ? "AI の事実確認：まだ" : "AI fact-check: not yet", state: "none" };
  const md = `${f.at.getUTCMonth() + 1}/${f.at.getUTCDate()}`;
  const fresh = f.rev === factRevOf(title, body ?? "");
  return fresh
    ? { text: ja ? `AI の事実確認 ✓ ${f.by}・${md}` : `AI fact-check ✓ ${f.by} · ${md}`, state: "ok" }
    : {
        text: ja
          ? `AI の事実確認：${f.by}・${md}（確認のあと変更あり）`
          : `AI fact-check: ${f.by} · ${md} (changed since)`,
        state: "stale",
      };
};
