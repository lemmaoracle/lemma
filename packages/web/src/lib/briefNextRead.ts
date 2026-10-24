/**
 * Brief の「この手口・この対策で探す」（2026-10-24）。描画は
 * components/BriefNextRead.astro。
 *
 * 対策を探して記事に来た人は、次の 1 本より、同じ手口・同じ対策の事例の
 * 一覧を見たい。記事のリンクではなく、アーカイブの絞り込みへのカテゴリの
 * 入口を出す。
 *
 * - 手口：attack_method、続けて operations（狙われた業務）の順に 3 つまで。
 * - 対策：controls を Brief に書いた順に 3 つまで。「記録する」（audit-trail）
 *   は補助の対策でほとんどの Brief に付くので最後に回す。
 * - 件数は、その分類が付いた Brief の数（この Brief を含む）。この Brief しか
 *   無い分類は出さない。
 */
import {
  BRIEF_ATTACKS,
  BRIEF_CONTROLS,
  BRIEF_OPERATIONS,
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
  /** 22×22 の線画（config/briefFacets.ts）。 */
  readonly icon: string;
  readonly count: number;
  readonly href: string;
}

export interface BriefFacetTiles {
  readonly methods: ReadonlyArray<FacetTile>;
  readonly controls: ReadonlyArray<FacetTile>;
}

const MAX = 3;
const SUPPORTING_CONTROL: BriefControlSlug = "audit-trail";

const controlSlugs = (b: AnyBrief): ReadonlyArray<string> =>
  (b.data.controls ?? []).map((c) => c.slug);
const isAttack = (a: string | undefined): a is BriefAttackSlug =>
  a !== undefined && a in BRIEF_ATTACKS;
const isOperation = (o: string): o is BriefOperationSlug => o in BRIEF_OPERATIONS;
const isControl = (c: string): c is BriefControlSlug => c in BRIEF_CONTROLS;

/** 手口と対策のタイル。どちらも空なら、テンプレートは従来の関連 Brief を出す。 */
export function briefFacetTiles(
  locale: "ja" | "en",
  brief: AnyBrief,
  all: ReadonlyArray<AnyBrief>,
): BriefFacetTiles {
  const archive = briefsArchiveHref(locale === "ja" ? "/ja" : "");
  const tile = (
    key: FacetTile["key"],
    slug: string,
    entry: { readonly ja: string; readonly en: string; readonly icon: string },
    has: (b: AnyBrief) => boolean,
  ): FacetTile => ({
    key,
    slug,
    label: entry[locale],
    icon: entry.icon,
    count: all.filter(has).length,
    href: `${archive}?${key}=${slug}`,
  });

  const attack = brief.data.attack_method;
  const attackTiles = isAttack(attack)
    ? [tile("attack", attack, BRIEF_ATTACKS[attack], (b) => b.data.attack_method === attack)]
    : [];
  const operationTiles = (brief.data.operations ?? [])
    .filter(isOperation)
    .map((o) =>
      tile("operation", o, BRIEF_OPERATIONS[o], (b) => (b.data.operations ?? []).includes(o)),
    );

  const controls = controlSlugs(brief)
    .filter(isControl)
    .sort((a, b) => Number(a === SUPPORTING_CONTROL) - Number(b === SUPPORTING_CONTROL))
    .map((c) => tile("control", c, BRIEF_CONTROLS[c], (b) => controlSlugs(b).includes(c)));

  // この Brief しか無い分類は、一覧へ行っても先が無いので出さない。
  const useful = (t: FacetTile) => t.count > 1;
  return {
    methods: [...attackTiles, ...operationTiles].filter(useful).slice(0, MAX),
    controls: controls.filter(useful).slice(0, MAX),
  };
}

export const hasFacetTiles = (t: BriefFacetTiles): boolean =>
  t.methods.length > 0 || t.controls.length > 0;
