/**
 * セルフチェックのチェック項目（2026-10-24・日本語だけ）。
 *
 * report の Brief の「### 点検チェックリスト」の箇条を、狙われた業務ごとに
 * まとめる。事例ごとに書いた同じチェック項目は data/selfCheckItems.ts で 1 項目に
 * まとめ、元の事例を並べる。そこに無い項目（新しい Brief の項目）は、記事の
 * 文のまま、その Brief の業務（operations の先頭・無ければ「そのほか」）に
 * 1 問として足す。
 *
 * Excel で配ると一気に出回るので、チェック項目は /ja/critical/self-check/ の画面の
 * 中で答えてもらい、回答はブラウザの外に出さない。
 */
import {
  BRIEF_OPERATION_SLUGS,
  BRIEF_OPERATIONS,
  type BriefOperationSlug,
} from "../config/briefFacets";
import type { BriefEntry } from "../data/criticalBriefs";
import { SELF_CHECK_ITEMS } from "../data/selfCheckItems";

export type SelfCheckGroupKey = BriefOperationSlug | "other";

export interface SelfCheckSource {
  /** 記事の slug（ページの ?from= と結ぶ）。 */
  readonly id: string;
  readonly no: number;
  readonly title: string;
}

export interface SelfCheckItem {
  /** まとめたチェック項目は data/selfCheckItems.ts の id、記事のままのチェック項目は「160-1」。 */
  readonly id: string;
  readonly text: string;
  readonly sources: ReadonlyArray<SelfCheckSource>;
}

export interface SelfCheckGroup {
  readonly key: SelfCheckGroupKey;
  readonly label: string;
  readonly icon: string;
  readonly items: ReadonlyArray<SelfCheckItem>;
}

const OTHER = {
  label: "そのほか（委託・廃棄など）",
  icon: '<circle cx="11" cy="11" r="7"/><path d="M8 11h6"/>',
};

const pad = (no: number): string => String(no).padStart(3, "0");

/** 本文から点検チェックリストの箇条だけを取り出す（太字の ** は外す）。 */
export const checklistItemsOf = (body: string): string[] => {
  const m = /^###\s+点検チェックリスト\s*$([\s\S]*?)(?=^###?\s|$(?![\s\S]))/m.exec(body);
  if (!m) return [];
  return [...m[1].matchAll(/^-\s+(.*)$/gm)].map((x) => x[1].replace(/\*\*/g, "").trim());
};

interface RawItem {
  readonly id: string;
  readonly text: string;
  readonly op: SelfCheckGroupKey;
  readonly source: SelfCheckSource;
}

const rawItemsOf = (briefs: ReadonlyArray<BriefEntry>): RawItem[] => {
  const out: RawItem[] = [];
  for (const b of [...briefs].sort((a, c) => c.data.brief_no - a.data.brief_no)) {
    if (b.data.layout !== "report" || b.data.status !== "published") continue;
    const first = b.data.operations?.[0];
    const op: SelfCheckGroupKey =
      first && (BRIEF_OPERATION_SLUGS as readonly string[]).includes(first)
        ? (first as BriefOperationSlug)
        : "other";
    const source = { id: b.id, no: b.data.brief_no, title: b.data.title.split(" — ")[0] };
    checklistItemsOf(b.body ?? "").forEach((text, i) => {
      out.push({ id: `${pad(b.data.brief_no)}-${String(i + 1)}`, text, op, source });
    });
  }
  return out;
};

export const selfCheckGroups = (briefs: ReadonlyArray<BriefEntry>): SelfCheckGroup[] => {
  const raw = rawItemsOf(briefs);
  const byId = new Map(raw.map((r) => [r.id, r]));
  const used = new Set<string>();
  const placed: Array<{ ops: ReadonlyArray<SelfCheckGroupKey>; item: SelfCheckItem }> = [];
  for (const def of SELF_CHECK_ITEMS) {
    const hits = def.from.flatMap((f) => {
      const r = byId.get(f);
      return r ? [r] : [];
    });
    // 元の項目が 1 つも無い（記事が下書きに戻った等）チェック項目は出さない。
    if (!hits.length) continue;
    hits.forEach((h) => used.add(h.id));
    const sources = hits
      .map((h) => h.source)
      .filter((s, i, all) => all.findIndex((x) => x.id === s.id) === i);
    placed.push({ ops: def.ops, item: { id: def.id, text: def.text, sources } });
  }
  for (const r of raw) {
    if (used.has(r.id)) continue;
    placed.push({ ops: [r.op], item: { id: r.id, text: r.text, sources: [r.source] } });
  }
  const keys: SelfCheckGroupKey[] = [...BRIEF_OPERATION_SLUGS, "other"];
  return keys.flatMap((k) => {
    // その業務がいちばん近いチェック項目を先に、ほかの業務から来たチェック項目をあとに。
    const own = placed.filter((p) => p.ops[0] === k).map((p) => p.item);
    const also = placed.filter((p) => p.ops[0] !== k && p.ops.includes(k)).map((p) => p.item);
    const items = [...own, ...also];
    if (!items.length) return [];
    const meta = k === "other" ? OTHER : { label: BRIEF_OPERATIONS[k].ja, icon: BRIEF_OPERATIONS[k].icon };
    return [{ key: k, label: meta.label, icon: meta.icon, items }];
  });
};

/** チェック項目の数（同じチェック項目が複数の業務に出ても 1 と数える）。 */
export const selfCheckItemCount = (groups: ReadonlyArray<SelfCheckGroup>): number =>
  new Set(groups.flatMap((g) => g.items.map((i) => i.id))).size;
