/**
 * Detail-page OG wrappers — Pillar details + Use Case details.
 *
 * Thin renderers that supply a per-page title, top-right label, and
 * the standard PRODUCT_GRADIENT background to `buildOgArtboard`.
 * Unlike the marketing hub surfaces, these are per-slug — each pillar
 * detail and each use case detail gets its own artboard.
 */
import type { Locale } from "../i18n/translations";
import {
  BROWN,
  PRODUCT_GRADIENT,
  buildOgArtboard,
  makeTopRightLabel,
  renderOgPng,
} from "./ogBase";

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
  const node = buildOgArtboard({
    title,
    topRight: makeTopRightLabel(label, BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
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
  const node = buildOgArtboard({
    title: useCaseTitle,
    topRight: makeTopRightLabel(label, BROWN),
    background: PRODUCT_GRADIENT,
  });
  return renderOgPng(node);
}
