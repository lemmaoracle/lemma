# Lemma Critical Brief 執筆ルール（v2 — 6章構成）

2026-07-30 の6章化（PR #720）以降の正典。旧10章/9章時代の記述はここで上書きする。
English version: [`../critical-briefs-en/README.md`](../critical-briefs-en/README.md)

Brief は `<NNN>-<slug>.md`（例: `047-openclaw-agent-phishing.md`）としてここに置き、
**同名ファイルを `../critical-briefs-en/` にも必ず作る**（JA/EN ミラー）。ローダーの
glob は `[0-9]*.md` なのでこの README は収載されない。番号は欠番になっても再利用しない。
スキーマは [`../../content.config.ts`](../../content.config.ts)。

URL: `/ja/critical/briefs/<NNN>-<slug>/`（JA）／`/critical/briefs/<NNN>-<slug>/`（EN）

## Frontmatter

```yaml
brief_no: 47                          # 正の整数・再利用禁止
title: "<日本語タイトル — サブタイトル（— で区切ると 2 行目がライム縦罫のサブに）>"
title_en: "<English title — subtitle>"
pillar: 02-verifiable-ai              # 01 / 02 / 03 / 04
primary_category: ai-decision-integrity
secondary_categories: [agent-infrastructure, identity-auth]
incident_date: 2026-06-11
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]   # A-incident-response / B-regulatory / C-agent-governance
related_briefs: ["018-hackerbot-claw-ai-vs-ai"]
status: published                     # draft | review | published
version: "1.0"                        # 1.0 以外でテンプレートが改訂履歴を描画
og_lead_ja: "<og:title の先頭 30–45 字。検索語を前方に>"
og_lead_en: "<same, EN>"
```

- **`gap_*` 3点セットは退役した（2026-08-21）。新しい Brief では書かない。**
  右レールの常設パネル「この Brief の核心」を駆動していたが、TL;DR 末尾と §5 の
  言い換えで新規情報が無く、本文の横で読まれていなかったため撤去（PR #848）。
  既存の Brief に書かれた値は残っているが、どこにも描画されない。落差の要約は TL;DR の
  結びと §4／§5 が担う。

### Pillar とカテゴリの許容値

| Pillar | カテゴリ |
| --- | --- |
| 01-verifiable-origin | `bridge-config-trust` `code-provenance` `data-provenance` `training-data-provenance` |
| 02-verifiable-ai | `ai-decision-integrity` `ai-bias-harm` `model-supply-chain` |
| 03-agent-authority | `agent-runaway` `agent-infrastructure` `agent-payment-abuse` |
| 04-regulatory-attribute | `kyc-aml-disclosure` `attribute-proof-bypass` |
| 横断 | `identity-auth` |

Pillar とカテゴリの不整合はビルドが拒否する。カテゴリは Brief 一覧の
「脅威タイプで探す」と右レールの脅威タイプ別バナー（`config/briefThreatBanner.ts`）
の出し分けキーでもある。

## 6章構成

見出しは**番号付き**で書く。目次（§1〜§6）と本文はこの番号で揃う。

| 章 | JA 見出し | EN 見出し | 役割 |
|---|---|---|---|
| §1 | `## 1. TL;DR` | `## 1. TL;DR` | 結論。落差を文章として溶かす |
| §2 | `## 2. 何が起きたか` | `## 2. What happened` | 概要 bullet＋攻撃の連鎖（番号付き） |
| §3 | `## 3. 時系列 — 公表と対応` | `## 3. Timeline — disclosure and response` | 開示・パッチ・業界反応 |
| §4 | `## 4. なぜ止まらなかったか` | `## 4. Why it wasn't stopped` | 構造的論点。✓検出は効いた／✕証明が無かった を本文で |
| §5 | `## 5. 証明があれば、何が変わるか` | `## 5. What proof would have changed` | 処方 |
| §6 | `## 6. Sources` | `## 6. Sources` | 一次ソース |

**「検出と証明の落差」は独立章にしない。** §4 と §5 の骨格そのものにする
（落差の要約は TL;DR の結びが担う。旧 gap_* パネルは退役）。「検出と証明の落差」
「構造的」はブランド語なので、章名から消えても**本文の語彙としては使い続ける**。

### §1 TL;DR

- **数文で短く**。詳細は §2 以降に押し出す。検索語（製品名・事案名）を前方に。
  末尾の「§1…§8 参照」のような番号羅列は禁止。
- 結びは **「効かなかったのは、…する層である。」で断ち切る**。
  「検出と事前証明は代替でなく補完である」の定型文は **TL;DR に入れない**
  （補完のポジショニングは §4・§5 が担う）。
- 型: 「検出は効いていた。効かなかったのは、◯◯を独立に確かめる層である。」
  の対比を太字で立てるとよい（047 参照）。

### §2 何が起きたか

- 事実のみ。**概要 bullet**（被害規模・主体・調査方法・公式情報など）→
  接続文（「攻撃は次の連鎖で成立している。」等）→ **連鎖の番号付きリスト**。
- 「核心」「根本原因」の digest bullet は書かない（§4 の冒頭文が担う。重複する）。

### §3 時系列 — 公表と対応

- 順序: タイムライン ul → 注記 blockquote（一次ソースの限定・研究環境である旨
  など）→ 「公表後の対応と業界の動きは次のとおり。」→ 対応・業界動向 bullet。
- **見出しに「時系列」（EN: Timeline）を必ず含める** — 直後の ul が
  縦線＋ライム縁ドットのタイムライン装飾になるトリガー。

### §4 なぜ止まらなかったか — 圧縮の律

- **連結でなく圧縮**。短い段落 3〜4 本＋引用ブロックが目安。
- 冒頭は結論の一文:
  「この事案の失敗は、◯◯でも◯◯でもない。**…を独立に確かめる層が無かった**ことにある。」
- 続けて「検出は効いていた。…効かなかったのは、その手前である。」を
  **1段落に畳む**（検出の成功列挙と限界の言い直しを重複させない）。
- **カテゴリ帳簿文を書かない**: 「本事案は Pillar NN の `X` カテゴリに属する」
  「secondary に `Y` を併記する」の類い。ヒーローのタグが同じ情報を持つ。
- 印象的な引用（当事者・研究者の言）は blockquote に逃がす。
- 関連 Brief への接続は 1 段落に圧縮する。

### §5 証明があれば、何が変わるか

- 処方の段落（事前証明が経路のどこに 1 段挟まるか）→ Lemma の設計 bullet
  （行動前の認可証明・来歴バインド・スコープ・選択的開示など事案に合う軸）→
  検出との相補で締める。「代替ではなく補完」はここで書く。

### §6 Sources

- **一次ソース優先**。GitHub リポジトリ／README／公式 statement は直読
  （`gh api` 等）してから書く。二次報道はリスト・CVE 帰属・件数・削除状態を
  誤ることがある。URL は 200 を確認。各行に（一次）（独立解析）等の位置づけを添える。

## 記事末尾の定型

```markdown
## 6. Sources

- ...

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference)、[Trust402](https://lemma.frame00.com/ja/trust402/)
```

- **参照カード**: 「参照: 」（EN: `References: `）で始まる段落を Sources の後に
  置くと、**リンクだけ**が抽出されて記事末尾のカード列になる（地の文はページに
  出ない）。BLOG / PILLAR / PRODUCT のラベルは URL から自動判定。事案に関係する
  リンクだけを入れる（無理に4枚並べない）。
- **配布定型文（旧 §9）は書かない** — テンプレートが Sources の後に描画する。
  係争中の免責など**個体差のある注記だけ** md に書く（077 参照）。
- **改訂履歴**: `version` を上げるとテンプレートが描画。改訂注記の blockquote は
  本文冒頭（`## 1.` の前）に置いてよい（077 参照）。

## リンク規約

- 本文中の「Brief NNN」は**必ずテキストリンク**にする:
  JA は絶対 URL `https://lemma.frame00.com/ja/critical/briefs/<slug>/`、
  EN は相対 `/critical/briefs/<slug>/`。
- blog / pillars / 製品ページも同様（JA=`/ja/...` 絶対、EN=相対）。

## Markdown の落とし穴

- **「」『』（）に隣接する強調は壊れる**: `な**失敗…」**であり` は CommonMark の
  flanking 規則で `**` が素のまま露出する。括弧で始まる・終わる強調スパンは
  `<strong>…</strong>` を使う。
- 表は白カード・コードブロックはスレートのグラデで描画される（装飾は
  テンプレート任せ。Shiki テーマ指定などは書かない）。
- 見出し直前の `hr`（`---` の直後に `##`）は自動で非表示になるので気にしなくてよい。
- `/api/v1/**` のようなグロブ表記はインラインコード（バッククォート）に入れる。

## 用語・文体（既存正典から継続）

- である調。JP 用語は「ゼロ知識証明」（「零知識証明」不可）。
- 「構造的」「structurally」「by construction」は保持。
  「structural gap」の連語だけは「検出と証明の落差」に統一。
- 企業名は可（例: メタウォーター）。自治体名は要注意（掲載前に確認）。
- 実地侵害でない研究実証は、その旨を §3 の注記で明示し被害規模を誇張しない。

## EN 版の作り方

- 章立て・条項は JA と同一。見出しは上の対応表どおり。
- **TL;DR は 1:1 翻訳せず condense する**（EN は JA より短くてよい）。
- og_lead_* は EN ファイルでは英語で書く（両ファイルの frontmatter は
  title / title_en 等を共有しつつ、og_lead_* は各ロケールの言語）。
