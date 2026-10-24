/**
 * Brief の「次に読む」の選び方（2026-10-24）。描画は components/BriefNextRead.astro。
 *
 * - 手口の行：同じ attack_method の Brief。業務（operations）の重なりが
 *   多い順（最初の業務は重く見る）、同じなら新しい順に 3 本。
 * - 対策の行：この Brief の対策を書いた順に見て、最初に事例が組めるものの
 *   3 本（手口の行と重ならない）。「記録する」（audit-trail）は補助の対策で
 *   ほとんどの Brief に付くので最後に回す。
 * - 「すべて見る」は、アーカイブの絞り込み（?attack= / ?control=）へ。
 */
import {
  BRIEF_ATTACKS,
  BRIEF_CONTROLS,
  type BriefAttackSlug,
  type BriefControlSlug,
} from "../config/briefFacets";
import { briefsArchiveHref } from "../data/briefIndex";
import type { BriefEntry } from "../data/criticalBriefs";

// `astro:content` の型は生成物の外では any になるので、BriefEntry で受ける
// （getEnBriefMap と同じ）。
type AnyBrief = BriefEntry;

export interface NextReadRow {
  readonly kind: "attack" | "control";
  readonly label: string;
  readonly total: number;
  readonly href: string;
  readonly picks: ReadonlyArray<AnyBrief>;
}

const PICKS = 3;
const SUPPORTING_CONTROL: BriefControlSlug = "audit-trail";

const controlSlugs = (b: AnyBrief): ReadonlyArray<string> =>
  (b.data.controls ?? []).map((c) => c.slug);
const isAttack = (a: string | undefined): a is BriefAttackSlug =>
  a !== undefined && a in BRIEF_ATTACKS;
const operationsOf = (b: AnyBrief): ReadonlyArray<string> => b.data.operations ?? [];

/** 行を組む。どちらも組めなければ空（BriefTemplate は従来の関連 Brief を出す）。 */
export function nextReadRows(
  locale: "ja" | "en",
  brief: AnyBrief,
  all: ReadonlyArray<AnyBrief>,
): ReadonlyArray<NextReadRow> {
  const archive = briefsArchiveHref(locale === "ja" ? "/ja" : "");
  const others = all.filter((b) => b.id !== brief.id);
  // 業務の重なり。この Brief の最初の業務（いちばん狙われた操作）は重く見る。
  const ownOps = operationsOf(brief);
  const overlap = (b: AnyBrief) =>
    ownOps.reduce((sum, o, i) => sum + (operationsOf(b).includes(o) ? (i === 0 ? 2 : 1) : 0), 0);
  const rank = (pool: ReadonlyArray<AnyBrief>) =>
    [...pool].sort(
      (a, b) =>
        overlap(b) - overlap(a) ||
        b.data.published.getTime() - a.data.published.getTime() ||
        b.data.brief_no - a.data.brief_no,
    );

  const attack = brief.data.attack_method;
  const attackPool = isAttack(attack) ? others.filter((b) => b.data.attack_method === attack) : [];
  const attackRow: NextReadRow | null =
    isAttack(attack) && attackPool.length > 0
      ? {
          kind: "attack",
          label: BRIEF_ATTACKS[attack][locale],
          total: attackPool.length + 1,
          href: `${archive}?attack=${attack}`,
          picks: rank(attackPool).slice(0, PICKS),
        }
      : null;
  const taken = new Set((attackRow?.picks ?? []).map((b) => b.id));

  const countOf = (slug: string) => all.filter((b) => controlSlugs(b).includes(slug)).length;
  const controlRow: NextReadRow | null =
    controlSlugs(brief)
      .filter((s): s is BriefControlSlug => s in BRIEF_CONTROLS)
      .sort((a, b) => Number(a === SUPPORTING_CONTROL) - Number(b === SUPPORTING_CONTROL))
      .map((slug): NextReadRow => ({
        kind: "control",
        label: BRIEF_CONTROLS[slug][locale],
        total: countOf(slug),
        href: `${archive}?control=${slug}`,
        picks: rank(
          others.filter((b) => controlSlugs(b).includes(slug) && !taken.has(b.id)),
        ).slice(0, PICKS),
      }))
      .find((r) => r.picks.length > 0) ?? null;

  return [attackRow, controlRow].filter((r): r is NextReadRow => r !== null);
}

