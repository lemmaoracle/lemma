import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Lemma Critical Brief content collection.
 *
 * Source of truth: `lemma_critical_brief_template.md` (Mayumi local).
 * Brief markdown files live at `src/content/critical-briefs/<NN>-<slug>.md`
 * and surface at `/critical/briefs/<NN>-<slug>/` (and the JA mirror).
 *
 * Schema invariants:
 *   - brief_no is a positive integer; archive numbers are never reused
 *     (per Methodology page §6).
 *   - pillar is one of the 4 Pillars. primary_category must be either a
 *     Pillar-specific category or a crosscutting one. Mismatches surface
 *     at build time via the refinement at the bottom.
 *   - version defaults to "1.0"; the individual Brief page hides the
 *     "Revision History" section while version === "1.0".
 *
 * Adding categories: extend CATEGORIES_BY_PILLAR (or CROSSCUTTING) and
 * the union members get picked up automatically. Adding a Pillar means
 * updating PILLARS too.
 */

const PILLARS = [
  "01-verifiable-origin",
  "02-verifiable-ai",
  "03-agent-authority",
  "04-regulatory-attribute",
] as const;

const CATEGORIES_BY_PILLAR = {
  "01-verifiable-origin": [
    "bridge-config-trust",
    "code-provenance",
    "data-provenance",
    "training-data-provenance",
  ],
  "02-verifiable-ai": [
    "ai-decision-integrity",
    "ai-bias-harm",
    "model-supply-chain",
  ],
  "03-agent-authority": [
    "agent-runaway",
    "agent-infrastructure",
    "agent-payment-abuse",
  ],
  "04-regulatory-attribute": [
    "kyc-aml-disclosure",
    "attribute-proof-bypass",
  ],
} as const satisfies Record<(typeof PILLARS)[number], readonly string[]>;

const CROSSCUTTING = ["identity-auth"] as const;

const PRIMARY_CATEGORIES = [
  ...CATEGORIES_BY_PILLAR["01-verifiable-origin"],
  ...CATEGORIES_BY_PILLAR["02-verifiable-ai"],
  ...CATEGORIES_BY_PILLAR["03-agent-authority"],
  ...CATEGORIES_BY_PILLAR["04-regulatory-attribute"],
  ...CROSSCUTTING,
] as const;

const PACKS = [
  "A-incident-response",
  "B-regulatory",
  "C-agent-governance",
] as const;

const STATUSES = ["draft", "review", "published"] as const;

/** Brief slug like "002-stakedao-vsdcrv". */
const briefSlug = z.string().regex(/^\d{3}-[a-z0-9-]+$/, {
  message:
    "related_briefs slugs must look like '001-kelpdao-rseth' (3-digit number, hyphen, lowercase slug)",
});

const briefSchema = z
  .object({
    brief_no: z.number().int().positive(),
    title: z.string().min(1),
    title_en: z.string().min(1),
    pillar: z.enum(PILLARS),
    primary_category: z.enum(PRIMARY_CATEGORIES),
    secondary_categories: z.array(z.enum(PRIMARY_CATEGORIES)).default([]),
    incident_date: z.date(),
    published: z.date(),
    authors: z.array(z.string()).default(["Lemma Critical Team"]),
    related_pack: z.array(z.enum(PACKS)).default([]),
    related_briefs: z.array(briefSlug).default([]),
    status: z.enum(STATUSES).default("draft"),
    /** Frontmatter version. The Brief page hides "Revision History" while this is "1.0". */
    version: z.string().regex(/^\d+\.\d+$/).default("1.0"),
    /**
     * Optional headline used as the og:title / twitter:title / <title> lead.
     * Format: `{short descriptive headline} — {codename or case name}`
     * (≈30–45 chars; full og:title stays under ~65 chars for card-safe
     * rendering on LinkedIn / X / Google). The series tail
     * (`｜Lemma Critical Brief No.NNN` / ` | Lemma Critical Brief No.NNN`)
     * is appended by the template. When absent, the template falls back to
     * the existing `title` mainTitle. Locale-suffixed (`_ja` / `_en`) and
     * duplicated across the JA + EN collections, mirroring the
     * `title` / `title_en` pattern.
     */
    og_lead_ja: z.string().optional(),
    og_lead_en: z.string().optional(),
    /**
     * Optional cover image URL for the OG v2 artboard. When unset, the
     * OG generator falls back to the cream-deep + dark-on-light design.
     * Existing briefs leave this empty; future briefs can opt in.
     */
    cover: z.string().url().optional(),
  })
  .refine(
    (data) => {
      const allowed: readonly string[] = [
        ...CATEGORIES_BY_PILLAR[data.pillar],
        ...CROSSCUTTING,
      ];
      return allowed.includes(data.primary_category);
    },
    {
      message:
        "primary_category must belong to the chosen pillar (or be a crosscutting category like identity-auth)",
      path: ["primary_category"],
    },
  );

const criticalBriefs = defineCollection({
  // Only files like "001-kelpdao-rseth.md" are loaded; README.md and other
  // adjacent docs in the same directory are ignored.
  loader: glob({
    pattern: "[0-9][0-9][0-9]-*.md",
    base: "./src/content/critical-briefs",
  }),
  schema: briefSchema,
});

// English bodies. Same schema, separate folder. EN routes prefer entries here
// when an EN translation exists; otherwise they fall back to the JA body so
// the EN site never 404s for an untranslated Brief.
const criticalBriefsEn = defineCollection({
  loader: glob({
    pattern: "[0-9][0-9][0-9]-*.md",
    base: "./src/content/critical-briefs-en",
  }),
  schema: briefSchema,
});

export const collections = {
  "critical-briefs": criticalBriefs,
  "critical-briefs-en": criticalBriefsEn,
};
