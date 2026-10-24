/**
 * Brief の「似た事例を一覧で読む」（2026-10-24）。描画は
 * components/BriefNextRead.astro。
 *
 * 対策を探して記事に来た人は、次の 1 本より、似た事例の一覧を見たい。記事の
 * リンクではなく、アーカイブの絞り込みへの入口を出す。
 *
 * 読み手のレビュー（経理部長・情シス・UX の 3 役）で、6 つを同じ大きさで並べると
 * いちばん近い分類が埋もれ、対策の分類（60 件前後）は広すぎて押されない、と
 * 出た。そこで:
 * - 主役（hero）：手口（attack_method）と業務（operations）のうち、付いている
 *   Brief がいちばん少ない＝この記事にいちばん近い分類。158 なら「振込先・口座の
 *   変更」。
 * - 対策：主役の分類で先に絞り、そのうちこの記事の対策（controls）も付いている
 *   事例（`?operation=…&control=…`）。Brief に書いた順で、「記録する」は最後。
 *   主役と同じ件数になるもの（絞っても同じ一覧）は出さない。
 * - ほかの手口：主役以外の手口・業務。
 * - 件数は、その絞り込みに当たる Brief の数（この Brief を含む）。1 件（この
 *   Brief だけ）のものは出さない。
 */
import {
  BRIEF_ATTACKS,
  BRIEF_CONTROLS,
  BRIEF_OPERATIONS,
  FACET_PLAIN,
  type BriefAttackSlug,
  type BriefControlSlug,
  type BriefOperationSlug,
} from "../config/briefFacets";
import { briefsArchiveHref } from "../data/briefIndex";
import type { BriefEntry } from "../data/criticalBriefs";

// `astro:content` の型は生成物の外では any になるので、BriefEntry で受ける
// （getEnBriefMap と同じ）。
type AnyBrief = BriefEntry;

export interface FacetTile {
  /** 絞り込みのキー（アーカイブの ?attack= / ?operation= / ?control=）。 */
  readonly key: "attack" | "operation" | "control";
  readonly slug: string;
  readonly label: string;
  /** 初めて読む人向けのひとこと（config/briefFacets.ts の FACET_PLAIN）。 */
  readonly desc: string;
  /** 22×22 の線画（config/briefFacets.ts）。 */
  readonly icon: string;
  readonly count: number;
  readonly href: string;
}

export interface BriefFacetTiles {
  /** この記事にいちばん近い手口・業務。 */
  readonly hero: FacetTile | null;
  /** 主役で絞ったうえでの対策（主役が無ければ対策だけで絞る）。 */
  readonly controls: ReadonlyArray<FacetTile>;
  /** 主役以外の手口・業務。 */
  readonly methods: ReadonlyArray<FacetTile>;
}

interface Method {
  readonly key: "attack" | "operation";
  readonly slug: string;
  readonly has: (b: AnyBrief) => boolean;
}

const MAX_CONTROLS = 3;
const MAX_METHODS = 2;
const SUPPORTING_CONTROL: BriefControlSlug = "audit-trail";

const controlSlugs = (b: AnyBrief): ReadonlyArray<string> =>
  (b.data.controls ?? []).map((c) => c.slug);
const isAttack = (a: string | undefined): a is BriefAttackSlug =>
  a !== undefined && a in BRIEF_ATTACKS;
const isOperation = (o: string): o is BriefOperationSlug => o in BRIEF_OPERATIONS;
const isControl = (c: string): c is BriefControlSlug => c in BRIEF_CONTROLS;

/** 主役・対策・ほかの手口。すべて空なら、テンプレートは従来の関連 Brief を出す。 */
export function briefFacetTiles(
  locale: "ja" | "en",
  brief: AnyBrief,
  all: ReadonlyArray<AnyBrief>,
): BriefFacetTiles {
  const archive = briefsArchiveHref(locale === "ja" ? "/ja" : "");
  const plain = (key: string, slug: string) => FACET_PLAIN[`${key}:${slug}`]?.[locale] ?? "";
  const useful = (t: FacetTile) => t.count > 1;

  const attack = brief.data.attack_method;
  const methodDefs: ReadonlyArray<Method> = [
    ...(isAttack(attack)
      ? [{ key: "attack" as const, slug: attack, has: (b: AnyBrief) => b.data.attack_method === attack }]
      : []),
    ...(brief.data.operations ?? []).filter(isOperation).map((o) => ({
      key: "operation" as const,
      slug: o,
      has: (b: AnyBrief) => (b.data.operations ?? []).includes(o),
    })),
  ];
  const methodTile = (m: Method): FacetTile => {
    const entry = m.key === "attack"
      ? BRIEF_ATTACKS[m.slug as BriefAttackSlug]
      : BRIEF_OPERATIONS[m.slug as BriefOperationSlug];
    return {
      key: m.key,
      slug: m.slug,
      label: entry[locale],
      desc: plain(m.key, m.slug),
      icon: entry.icon,
      count: all.filter(m.has).length,
      href: `${archive}?${m.key}=${m.slug}`,
    };
  };

  // 件数がいちばん少ない（＝いちばん近い）手口・業務を主役に。同数なら書いた順。
  const methods = methodDefs
    .map((m) => ({ m, t: methodTile(m) }))
    .filter(({ t }) => useful(t));
  const hero = methods.reduce<(typeof methods)[number] | null>(
    (best, cur) => (best === null || cur.t.count < best.t.count ? cur : best),
    null,
  );

  const controls = controlSlugs(brief)
    .filter(isControl)
    .sort((a, b) => Number(a === SUPPORTING_CONTROL) - Number(b === SUPPORTING_CONTROL))
    .map((c): FacetTile => {
      const hasC = (b: AnyBrief) => controlSlugs(b).includes(c);
      const inScope = (b: AnyBrief) => (hero ? hero.m.has(b) : true) && hasC(b);
      return {
        key: "control",
        slug: c,
        label: BRIEF_CONTROLS[c][locale],
        desc: plain("control", c),
        icon: BRIEF_CONTROLS[c].icon,
        count: all.filter(inScope).length,
        href: `${archive}?${hero ? `${hero.m.key}=${hero.m.slug}&` : ""}control=${c}`,
      };
    })
    // 主役と同じ件数＝絞っても同じ一覧になるものは出さない（レビュー 2 回目）。
    .filter((t) => useful(t) && (hero === null || t.count < hero.t.count))
    .slice(0, MAX_CONTROLS);

  return {
    hero: hero?.t ?? null,
    controls,
    methods: methods
      .filter((x) => x !== hero)
      .map(({ t }) => t)
      .slice(0, MAX_METHODS),
  };
}

export const hasFacetTiles = (t: BriefFacetTiles): boolean =>
  t.hero !== null || t.controls.length > 0 || t.methods.length > 0;
