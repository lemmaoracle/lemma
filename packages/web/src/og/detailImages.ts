/**
 * Detail-page OG wrappers — Pillar details + Use Case details.
 *
 * ハブ面と違って**slug ごと**に1枚ずつ出る（柱4本・ユースケース29本 × 2ロケール）。
 * 地・書体・見出し直下のラインはマーケ面と同じ組み（`slateArtboard`）を共有する
 * ——2026-08-05 にクリーム＋サドルブラウンから移した。ここだけ旧配色に残すと、
 * ユースケースを共有したときにトップや料金と別サイトのように見えるため。
 */
import type { Locale } from "../i18n/translations";
import { SLATE_BACKDROP, renderOgPng, slateArtboard } from "./ogBase";

/* ────────────────────── Pillar Detail ────────────────────── */

export async function renderPillarDetailOg(
  pillarSlug: string,
  pillarNumber: number,
  titleJa: string,
  titleEn: string,
  locale: Locale,
): Promise<Buffer> {
  const title = locale === "ja" ? titleJa : titleEn;
  const enName = pillarSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const label = `Pillar ${String(pillarNumber).padStart(2, "0")} · ${enName}`;
  const node = slateArtboard({ title, label });
  return renderOgPng(node, SLATE_BACKDROP);
}

/* ────────────────────── Use Case Detail ────────────────────── */

export async function renderUseCaseOg(
  useCaseTitle: string,
  pillarSlug: string,
): Promise<Buffer> {
  const pillarLabel = pillarSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const label = `Use Case · ${pillarLabel}`;
  const node = slateArtboard({ title: useCaseTitle, label });
  return renderOgPng(node, SLATE_BACKDROP);
}
