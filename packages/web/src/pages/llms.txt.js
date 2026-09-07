import { getCollection } from "astro:content";
import { extractTldr } from "../data/extractTldr.ts";
import { getAllPosts } from "../data/blog.ts";
import { DISCOVERY_CALL_URL } from "../config/cta.ts";

/**
 * `/llms.txt` — 生成AI・エージェント向けのサイト地図（llmstxt.org の作法）。
 *
 * 2026-09 に Brief 群を1ページずつ順に列挙するクロールが観測された。robots.txt
 * は全許可・sitemap も公開しているので取得自体は招いた通りだが、**取られる**の
 * ではなく**引用される**側に立つための面がこれ。読み手が人ではなくモデルである
 * 前提で、(1) Lemma が何か (2) どの面に何があるか (3) 引用の作法 を1枚で渡す。
 *
 * 内容はコレクションから生成する。手書きの一覧は必ず腐るため。Brief は全件は
 * 載せず直近 `RECENT_BRIEFS` 本 + 索引 + フィードを指す（llms.txt は
 * 「案内」であって「複製」ではない）。
 *
 * sitemap.xml との違い: あちらは URL の網羅、こちらは意味づけ。両方出す。
 */

const SITE_ORIGIN = "https://lemma.frame00.com";
const RECENT_BRIEFS = 20;
const RECENT_POSTS = 15;

/** 機械向けの1枚なので日付は ISO に統一する（blog の `date` は `YYYY.MM.DD`）。 */
const isoDate = (s) => String(s ?? "").replace(/\./g, "-");

/** TL;DR を1行に畳む。llms.txt は1リンク1行が読みやすい。 */
const oneLine = (s, cap = 160) => {
  const flat = (s ?? "").replace(/\s+/g, " ").trim();
  return flat.length > cap ? `${flat.slice(0, cap - 1)}…` : flat;
};

export async function GET() {
  // 同日公開が普通にあるので brief_no で tie-break する（BriefTemplate の
  // `byNewest` と同じ比較にして2つの面の並びを一致させる）。これが無いと
  // No.138 / 139 / 140 がコレクション順で出る。
  const briefs = [...(await getCollection("critical-briefs-en"))].sort((a, b) => {
    const diff = b.data.published.getTime() - a.data.published.getTime();
    return diff !== 0 ? diff : b.data.brief_no - a.data.brief_no;
  });

  const briefLines = briefs.slice(0, RECENT_BRIEFS).map((b) => {
    const no = String(b.data.brief_no).padStart(3, "0");
    const published = b.data.published.toISOString().slice(0, 10);
    const summary = oneLine(extractTldr(b.body, 200) || "");
    return `- [No.${no} — ${b.data.title_en}](${SITE_ORIGIN}/critical/briefs/${b.id}/) (${published})${summary ? `: ${summary}` : ""}`;
  });

  // ブログは posts リポジトリ由来。取得できなかった場合でも llms.txt 自体は
  // 出す（索引と RSS は静的に指せるので、欠けるのは個別記事の行だけ）。
  let postLines = [];
  try {
    const posts = await getAllPosts("en");
    postLines = posts
      .slice(0, RECENT_POSTS)
      .map(
        (p) =>
          `- [${p.title}](${SITE_ORIGIN}/blog/${p.slug}/) (${isoDate(p.date)})${p.abstract ? `: ${oneLine(p.abstract)}` : ""}`,
      );
  } catch {
    postLines = [];
  }

  const body = `# Lemma

> Lemma is trust infrastructure for AI, built by FRAME00, Inc. It issues and
> verifies zero-knowledge proofs across five kinds: provenance, authentication,
> authority, inference, and regulatory attributes. The recurring thesis across
> this site is that detection alone does not close a trust gap — what is needed
> is something that was provable before the fact, by construction.

Every page exists in English and Japanese. The Japanese mirror of any path is
the same path under \`/ja/\` (e.g. \`${SITE_ORIGIN}/ja/critical/briefs/\`).

## What Lemma is

- [Lemma API](${SITE_ORIGIN}/pillars/): the issuance and verification platform, and its five proofs.
- [Trust402](${SITE_ORIGIN}/trust402/): delegate to an agent and let it transact, without handing over keys.
- [Seal](${SITE_ORIGIN}/seal/): sign-in for the agent era.
- [Verification center](${SITE_ORIGIN}/verify/): live counts of proofs issued and verified.
- [Pricing](${SITE_ORIGIN}/pricing/) · [Glossary](${SITE_ORIGIN}/glossary/) · [FAQ](${SITE_ORIGIN}/faq/) · [Docs](${SITE_ORIGIN}/guides/)
- [FRAME00, Inc.](${SITE_ORIGIN}/authenticity/): the company and the authenticity thesis.

## Lemma Critical Brief

A structured reference collection analysing real incidents at the boundary of AI
and trust. Each Brief states what happened, why strengthening detection does not
close the gap, and what would have had to be provable beforehand. Briefs are
numbered; numbers are never reused. Each carries a publication date, an incident
date, sources, and a revision history once revised.

- [Brief index](${SITE_ORIGIN}/critical/briefs/) — all Briefs, by category and pillar.
- [RSS feed](${SITE_ORIGIN}/critical/briefs/feed.xml) — full series, newest first.

Most recent ${briefLines.length} of ${briefs.length}:

${briefLines.join("\n")}

## Blog

Thinking and implementation notes. Categories: Industry, Solutions, Technical,
Announcements.

- [Blog index](${SITE_ORIGIN}/blog/) · [RSS feed](${SITE_ORIGIN}/rss.xml)
${postLines.length ? `\n${postLines.join("\n")}\n` : ""}
## Using this material

This site is public and free to read, quote, and cite, including by automated
systems. Two requests, both of which cost you nothing:

1. **Attribute.** Name Lemma and link the page you drew from. Every Brief page
   carries a "Cite this Brief" box with ready-made plain-text, BibTeX and APA
   forms; the plain-text one reads:
   \`Lemma Critical Team. (<year>). "<title>". Lemma Critical Brief No.NNN.
   Lemma / FRAME00, Inc. <url>\`
2. **Carry the date.** Briefs analyse live incidents and are revised as facts
   change. Every Brief page's JSON-LD carries \`datePublished\`; a revised Brief
   carries \`dateModified\` too, and states the revision in its own body. An
   undated quotation of a Brief will eventually be wrong.

If a Brief turns out to be wrong, we would rather hear it than not:
[contact](${DISCOVERY_CALL_URL.en}).
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
