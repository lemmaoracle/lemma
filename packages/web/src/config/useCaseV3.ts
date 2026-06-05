/**
 * Use Case detail — v3 template content.
 *
 * The v3 detail template (see `components/usecase/UseCaseV3Body.astro`)
 * compresses the long-form 9-section page into 5 sections and adds three
 * enterprise-reader hooks that have no source in the markdown:
 *
 *   §1  3 persona quotes (per industry/role)
 *   §2  Before / After data example (raw fields → claims + ZK proof)
 *       + a one-paragraph Lemma-approach callout
 *
 * Everything else the v3 body needs (H1, HIDE→PROVE, lead/abstract,
 * industry tags, reading time, §4 進め方 steps, §5 related cards) is pulled
 * from the existing use case data — only the hooks above live here.
 *
 * A slug is rendered with v3 ONLY when it has an entry in this map AND the
 * locale is JA. Slugs without an entry (and all EN pages) keep the current
 * long-form template untouched, so v3 can roll out one reference UC at a
 * time. EN copy ships in a follow-up PR.
 *
 * Drafts are seeded from each use case's content + the v3 PR spec; treat
 * persona quotes and the After-card claims as copy to refine in review.
 */

/** One persona voice in §1 — a role label and the concern it speaks. */
export interface V3Persona {
  /** Role / function, e.g. "情シス・情報セキュリティ". */
  readonly role: string;
  /** First-person concern, quoted. No surrounding 「」 — the template adds them. */
  readonly quote: string;
}

/** One row in the Before card — a raw field that today travels to the AI. */
export interface V3RawRow {
  readonly k: string;
  readonly v: string;
}

/** One row in the After card — what travels instead under Lemma. */
export interface V3ProofRow {
  readonly k: string;
  readonly v: string;
  /** Emphasize the value (the claim that matters). */
  readonly strong?: boolean;
  /** Render the value as a green ✓ VALID badge. */
  readonly badge?: boolean;
}

export interface UseCaseV3 {
  /** §1 — exactly three persona voices. */
  readonly personas: readonly [V3Persona, V3Persona, V3Persona];
  /** §2 Before card — 5 raw fields handed to the AI today. */
  readonly without: readonly V3RawRow[];
  /** §2 After card — the claims + proof that travel instead (≈3 rows). */
  readonly withProof: readonly V3ProofRow[];
  /** §2 approach callout — one paragraph summarizing the Lemma approach. */
  readonly approach: string;
}

export const USE_CASE_V3: Readonly<Record<string, UseCaseV3>> = {
  // ── P2 検証可能 AI · リファレンス実装 ──────────────────────────────
  "ai-document-isolation": {
    personas: [
      {
        role: "情シス・情報セキュリティ",
        quote: "AI を業務に入れたいが、社内文書をモデルや外部に渡すのが怖くて止まっている",
      },
      {
        role: "DX 推進・業務部門",
        quote: "PoC は成功した。でも、本番投入の承認がガバナンス側で止まっている",
      },
      {
        role: "CISO・内部監査",
        quote: "AI が何を参照したか、後から監査時に再現・説明できる仕組みがない",
      },
    ],
    without: [
      { k: "name", v: "田中太郎" },
      { k: "address", v: "東京都品川区…" },
      { k: "contract", v: "A プラン" },
      { k: "date", v: "2024-08-15" },
      { k: "id", v: "09xxx-xxxx-xxxx" },
    ],
    withProof: [
      { k: "claim", v: "契約区分 = A", strong: true },
      { k: "docHash", v: "0x4a3f…" },
      { k: "ZK verified", v: "✓ VALID", badge: true },
    ],
    approach:
      "文書を暗号化したまま、AI には「必要な事実・属性」だけを証明付きで渡します。生の PII や原本にはモデルを触れさせません。AI が「この事実だけを使った」ことを証跡として残せるので、後から原本を開示せず参照内容を説明できます。",
  },
};

export function getUseCaseV3(slug: string): UseCaseV3 | undefined {
  return USE_CASE_V3[slug];
}
