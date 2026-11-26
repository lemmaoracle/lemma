/**
 * Brief §3 冒頭の「区別できる条件」の検査（`astro:config:setup`・dev とビルドの両方）。
 *
 * 条件の1文は「何が満たされていれば通してよいか」だけを書く。照合の手段
 * （何の記録と・何とは別に・どの鍵で）は、続く「誰が出すか／どこで照合するか」
 * と帯（insight.quote）に書く。手段まで冒頭に書くと文が長くなり、条件ではなく
 * やり方に読める（本人 2026-11-27・208「端末の鍵で照合することである」）。
 *
 * 検査するのは 196 番以降（決まりを作ったときの下書きと、これからの Brief）。
 *   JA: 「経路を問わず区別できる条件は、」で始め「かどうかである。」で終える・65 字まで・
 *       照合／確かめ／とは別／ではなく／記録 を使わない
 *   EN: "Whatever the route, the condition for telling them apart is whether " で始める・
 *       35 語まで・checked / against / apart from / rather than / record を使わない
 * 守れないとビルドを落とす。
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FROM = 196;
const JA_HEAD = "経路を問わず区別できる条件は、";
const JA_TAIL = "かどうかである。";
const JA_MAX = 65;
const JA_BAN = ["照合", "確かめ", "とは別", "ではなく", "記録"];
const EN_HEAD = "Whatever the route, the condition for telling them apart is whether ";
const EN_MAX = 35;
const EN_BAN = [/\bchecked\b/i, /\bagainst\b/i, /\bapart from\b/i, /\brather than\b/i, /\brecords?\b/i];

/** §3 の見出しのあとの、最初の段落（1行）。 */
const firstLineOfSection3 = (text) => {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => /^## 3\./.test(l));
  if (at < 0) return null;
  return lines.slice(at + 1).find((l) => l.trim() !== "") ?? null;
};

export const checkBriefConditions = (contentDir) => {
  const errors = [];
  for (const [dir, lang] of [["critical-briefs", "ja"], ["critical-briefs-en", "en"]]) {
    const base = join(contentDir, dir);
    for (const name of readdirSync(base)) {
      const m = /^(\d{3})-.*\.md$/.exec(name);
      if (!m || Number(m[1]) < FROM) continue;
      const line = firstLineOfSection3(readFileSync(join(base, name), "utf8"));
      const where = `${dir}/${name}`;
      if (line === null) continue; // §3 の無い形の Brief は対象外
      const problems = [];
      if (lang === "ja") {
        if (!line.startsWith(JA_HEAD)) problems.push(`「${JA_HEAD}」で始める`);
        if (!line.endsWith(JA_TAIL)) problems.push(`「${JA_TAIL}」で終える`);
        const len = [...line].length;
        if (len > JA_MAX) problems.push(`${JA_MAX} 字まで（いま ${len} 字）`);
        for (const w of JA_BAN) if (line.includes(w)) problems.push(`「${w}」は使わない（手段は下の項目と帯に）`);
      } else {
        if (!line.startsWith(EN_HEAD)) problems.push(`start with "${EN_HEAD.trim()}"`);
        const words = line.split(/\s+/).filter(Boolean).length;
        if (words > EN_MAX) problems.push(`${EN_MAX} words max (now ${words})`);
        for (const re of EN_BAN) if (re.test(line)) problems.push(`no "${re.source.replace(/\\b/g, "")}" (put the means in the bullets and the band)`);
      }
      if (problems.length) errors.push(`${where}: ${problems.join(" / ")}\n    ${line}`);
    }
  }
  return errors;
};

export default function checkBriefCondition() {
  return {
    name: "lemma:check-brief-condition",
    hooks: {
      "astro:config:setup": ({ config, logger }) => {
        const contentDir = new URL("./src/content/", config.root).pathname;
        const errors = checkBriefConditions(contentDir);
        if (errors.length) {
          throw new Error(
            `Brief §3 冒頭の「区別できる条件」が決まりに合わない（critical-briefs/README.md「区別できる条件の1文」）:\n${errors.join("\n")}`,
          );
        }
        logger.info(`Brief §3 の区別できる条件: ${FROM} 番以降は決まりどおり`);
      },
    },
  };
}
