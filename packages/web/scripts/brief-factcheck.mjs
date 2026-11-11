#!/usr/bin/env node
/**
 * Brief に「AI の事実確認」を記録する（2026-11-11・src/lib/factCheck.ts）。
 *
 *   node packages/web/scripts/brief-factcheck.mjs <id> --by "Claude Opus 5.5" [--en] [--at 2026-11-11]
 *
 * <id> は Brief のファイル名（拡張子なし・例 200-logix-aero-…）。--en で英語版（critical-briefs-en）。
 * 頭に fact_check: { by, at, rev } を書く（あれば置き換える）。by はモデル名まで。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

/* src/lib/factCheck.ts の factRevOf と同じ式（変えるときは両方）。 */
const factRevOf = (title, body) => {
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

const args = process.argv.slice(2);
const id = args.find((a, i) => !a.startsWith("--") && !["--by", "--at"].includes(args[i - 1]));
const opt = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const by = (opt("by") ?? "").trim();
const at = opt("at") ?? new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
if (!id || !/^[0-9a-z-]+$/.test(id) || !by || !/^\d{4}-\d{2}-\d{2}$/.test(at)) {
  console.error('使い方: node packages/web/scripts/brief-factcheck.mjs <id> --by "Claude Opus 5.5" [--en] [--at YYYY-MM-DD]');
  process.exit(1);
}
if (!/\d/.test(by)) {
  console.error('by はモデル名まで書いてください（例: "Claude Opus 5.5"）');
  process.exit(1);
}
const root = process.env.BRIEF_CONTENT_DIR ?? join(dirname(fileURLToPath(import.meta.url)), "../src/content");
const file = join(root, args.includes("--en") ? "critical-briefs-en" : "critical-briefs", `${id}.md`);
const raw = readFileSync(file, "utf8");
const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
if (!m) {
  console.error(`${file}: 頭（frontmatter）が読めません`);
  process.exit(1);
}
const title = String(matter(raw).data.title ?? "");
const rev = factRevOf(title, m[2]);
const block = `fact_check:\n  by: ${JSON.stringify(by)}\n  at: ${at}\n  rev: ${JSON.stringify(rev)}`;
const lines = m[1].split("\n");
const out = [];
for (let i = 0; i < lines.length; i++) {
  if (/^fact_check:/.test(lines[i])) {
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) i++;
    continue;
  }
  out.push(lines[i]);
}
const si = out.findIndex((l) => /^status:/.test(l));
out.splice(si >= 0 ? si : out.length, 0, block);
writeFileSync(file, `---\n${out.join("\n")}\n---\n${m[2]}`);
console.log(`${id}: AI の事実確認 ${by}・${at}（rev ${rev}）`);
