# Lemma Critical Brief 執筆ルール（v2 — 6章構成）

2026-07-30 の6章化（PR #720）以降の正典。旧10章/9章時代の記述はここで上書きする。
English version: [`../critical-briefs-en/README.md`](../critical-briefs-en/README.md)

Brief は `<NNN>-<slug>.md`（例: `047-openclaw-agent-phishing.md`）としてここに置き、
**同名ファイルを `../critical-briefs-en/` にも必ず作る**（JA/EN ミラー）。ローダーの
glob は `[0-9]*.md` なのでこの README は収載されない。番号は詰める: 新しい Brief は**空いている番号のうち最も小さいもの**を使い、空きが無ければ最大＋1 にする（ドラフトに書かれた番号は使わない）。取り下げた Brief の URL は `public/_redirects` で一覧へ 301 する。
スキーマは [`../../content.config.ts`](../../content.config.ts)。

URL: `/ja/critical/briefs/<NNN>-<slug>/`（JA）／`/critical/briefs/<NNN>-<slug>/`（EN）

## Frontmatter

```yaml
brief_no: 47                          # 正の整数・空き番号の小さい順に採番
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

### タイトル

実際の Brief がそろって守っているのに、ここに書かれていなかった規則（2026-09-12
に直近11本を数えて確認）。

- **`—` の前半に、検索の取っ掛かりになる固有名を前方から置く**（製品名・組織名・
  脆弱性名・コードネーム）。ランキングや一覧は前半しか出さないので、ここに固有名が
  無いと引けない。11本中10本がこの形。
  例: `x402 決済のファシリテーター 15 社すべてで…` / `ServiceNow AI Platform で、…`
- 固有名を頭に立てたいときは **`名前：` のコロン形**も使う。
  例: `IDScan.net：本人確認のために窓口へ渡した…`
- **出典・識別子は前半の末尾に丸括弧で**置く。
  例: `…10時間未満で侵害した(Unit 42調査)` / `…機能していた(CVE-2026-59822、CISAが実悪用を確認しKEV登録)`
- H1 は**平叙文**（「〜した／〜された」）。体言止めにしない。
- 後半（`—` の後ろ）は**何が構造的に欠けていたか**を1文で。
  例: `— 支払いの検証と決済の確定が、行動の前に結び付いていない`
- `title_en` も同じ原則。

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
| §5 | `## 5. 証明があれば、何が変わるか` | `## 5. What proof would have changed` | 処方（report レイアウトでは `## 5. 対策するには` / `## 5. How to counter this`） |
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

## report レイアウト（opt-in・2026-10）

frontmatter に `layout: "report"` を書いた Brief だけが、レポート型の面で描画される
（見本: 032）。書かない Brief はこれまでどおりの面のまま。6章構成と上の各章の規則は
そのまま守る。

**オンになるもの**: スレートの表紙（`brief_no` を種にした生成グラフィック＋
`key_figures`）、表紙下のメタ行（事案日／公開／改訂／発行）、「01 見出し」形式の
章見出し、目次だけの右レール（脅威バナー・ブランド面は出ない）、下の部品 CSS。
冒頭の改訂注記 blockquote は描画されず、版と日付はメタ行に出る（md には残す——
dateModified がここから読む）。「参照: 」はカードにならず1行のまま。

**§5 の見出しは `## 5. 対策するには`**（EN: `## 5. How to counter this`）。読者が自社で
何をすればよいかを書く章で、製品の処方ではない。

### 追加の frontmatter

```yaml
layout: "report"
key_figures:            # 表紙の主要数値・最大3。value に → を含めると矢印をライムで描く
  - { value: "約 900", unit: "万円", label: "…", tone: "alert" }   # alert は1つだけ
  - { value: "05-23 → 05-28", label: "…" }
glossary:               # §2 の最初のブロックの直後に「用語メモ」として出る
  - { term: "エクストラネット", desc: "…" }
insight:                # quote は §4 の最初の段落の直後に「この事案の核心」の帯で出る
  slug: "confirmed-by-login-alone"   # slug / label は一覧用。記事には出ない
  label: "ログインだけで確定する操作"
  quote: "…"
industries: ["retail", "finance"]               # config/industriesV1.ts の slug
operations: ["payment-change", "account-admin"] # config/briefFacets.ts
controls:
  - { slug: "separate-approval", item: "…" }    # separate-approval / ownership-check / hold-unverified / audit-trail
```

`industries` / `operations` / `controls` は**一覧のファセット用の索引で、記事には描画
しない**。語彙・ラベル・アイコンは `config/briefFacets.ts`。記事中の「注意したい
業界・業務」は md 側で説明文つきの表として書く。EN ファイルの `key_figures` /
`glossary` / `insight` は英語で書く。

### 著者が書く部品

HTML ブロックの中に**空行を入れない**（空行で markdown に戻る）。

```html
<!-- §1 要旨（3行。最後の行に class="key"） -->
<div class="rx-exsum"><ol>
<li><div class="lab">01<b>何が起きたか</b></div><p>…</p></li>
<li class="key"><div class="lab">03<b>欠けていた層</b></div><p>…</p></li>
</ol></div>

<!-- 定義表（事実・持ち主など）。業界・業務の表は rx-scope ＋ kk の小見出し -->
<div class="rx-facts"><dl><dt>当事者</dt><dd>…</dd></dl></div>
<div class="rx-facts rx-scope"><dl><dt><span class="kk">業界</span>サービス・小売</dt><dd>…</dd></dl></div>

<!-- 図表: 連鎖（rx-step に crit / good）と落差（rx-gap） -->
<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">…</span></div>
<p class="rx-ex-cap">…</p>
<div class="rx-chain"><div class="rx-step crit"><div class="who">第三者</div><div class="no">2</div><b>…</b><p>…</p></div></div>
</figure>

<!-- §3 時系列（日付が無い行は time.nd） -->
<ul class="rx-tl"><li><time>2026-05-23</time><span>…</span></li></ul>

<!-- 注・資料の但し書き -->
<p class="rx-aside">注：…</p>

<!-- §5 必要になるもの／点検チェックリスト -->
<section class="rx-box"><div class="rx-ex-h"><span class="rx-ex-no">対策</span><span class="rx-ex-t">必要になるもの</span></div>
<ol class="num"><li><b>…。</b>…</li></ol>
</section>
<div class="bx-checklist"><div class="rx-ex-h"><span class="rx-ex-no">点検</span><span class="rx-ex-t">点検チェックリスト</span></div><p class="rx-box-cap">…</p><ul><li>…</li></ul></div>

<!-- §6 出典 -->
<ol class="rx-srcs"><li><span class="ty">報道</span><span class="bs"><b>媒体名</b>「記事名」<span class="meta">2026-06-03 · <a href="…">…</a></span></span></li></ol>
```

対策の表は普通の markdown の表で書き、状態だけ
`<span class="bx-st no">効かない</span>`（`part` 一部 / `na` 関係しない）でチップにする。
§5 の冒頭段落は `<p class="rx-lead"><strong>結論。</strong>…</p>`。
図表 2 の `rx-gap` の型は 032 を写す。

### 書かないもの

- **分析の本文に製品名・CTA を書かない。** 末尾 CTA はテンプレートが出す。
- **ファセットのチップは一覧のためのもので、記事には置かない**（「この対策で探す」の
  行なども書かない）。

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
