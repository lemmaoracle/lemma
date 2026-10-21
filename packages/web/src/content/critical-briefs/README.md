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

**§3 は接続文（「公表後の対応と業界の動きは次のとおり。」）の代わりに
`### 公表後の対応` の小見出しを置いてよい。**

**§5 の見出しは `## 5. 対策するには`**（EN: `## 5. How to counter this`）。読者が自社で
何をすればよいかを書く章で、製品の処方ではない。

### 重ねて言わない（2026-10-21・069 から）

- **§1 の 3 段落目**は「（気づいていたが）◯日に◯◯は通った。効かなかったのは…層である。」の
  2 文。§4 で検出の経緯を言い直さない。
- **§4** は「冒頭の結論 2 文 → 図表 2 → 検出が働いた範囲と落差（3 文まで）→ 関連 Brief 1 文」。
  関連 Brief は事案名と一言の括弧書きで足りる（下にカードが出る）。
- **§5** の業界・業務の説明に書いた「なぜ同じ穴があるか」を、表の後で段落にして繰り返さない。
  対策の表は 4 行まで。状態語は中立に並べ、Lemma で埋まる行だけを色で目立たせることはしない。
- **時系列**は日付だけのラベル（時刻・範囲は本文側）。検知から封じ込めまでの空白は、
  公表された日時でたどれるときだけ書く（推定の間隔を描かない）。

### 自社で確かめる・まず 1 つ（frontmatter・任意）

```yaml
self_check: "同意済みのアプリが自らに管理者権限を付けたら、実行の前に止められるか。"  # 読者への問い1文
first_step: "Entra ID の管理画面で、同意済みのアプリと権限を書き出す。…"              # 今日できる一手
```

表紙のメタ行の下・TL;DR の上に、アイコンつきのカード（問い → まず 1 つ → §5 へのリンク）で出る。
`self_check` が無ければカードごと出ない。

`self_check` は「〜か。」の問いにする（答えが「いいえ」になりやすい問いほど、続きを読む理由になる）。
`first_step` は、チェックリストの中から今日着手できるものを 1 つ、具体的な画面・記録の名前で書く。

### 出典の折りたたみ

§6 の種別に「一次」（EN: Primary）を含む行は開いたまま、それ以外（報道・解析）は
「報道・解析 N 件」の開閉にまとめて出る（番号は続き番号）。一次ソースは減らさない。

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

**OG 画像（共有カード）**: report Brief の OG は脅威タイプ名ではなく事件そのものが主役
（表紙と同じ生成グラフィックの地）。`og_kicker_ja/en` に事例の種類（例「サイバー攻撃事例 ·
アカウント乗っ取り」/ "CYBERATTACK · ACCOUNT TAKEOVER"。ライムの札になるので短い1行）、`og_headline_ja/en` に
何が起きたかを書く（`\n` で改行・被害の大きさを `<accent>…</accent>` でライムの1行に）。
og:description は `insight.quote` で始まる。

### 一覧の索引（2026-10・レイアウトを問わず書ける）

一覧（`/critical/briefs/`）は「いま読む 3 本 → 対策から読む → そのほかの新着」で組む。
各 Brief の frontmatter に次を書くと一覧に出る（記事には描画しない）。

```yaml
industries: ["public-sector"]          # 業界（config/briefFacets.ts）
operations: ["delivery"]               # 業務
controls:                              # 対策（4 つ・増やすのは 4 つに当てはまらない Brief が 3 本たまったとき）
  - { slug: "ownership-check", item: "…" }
attack_method: "impersonation"         # 手口：account-takeover / impersonation / privilege-abuse / supply-chain / human-error / ai-misuse
impact: "36 自治体が配信を停止"          # 影響。数字だけにせず何の数かを書く。公表が無ければ書かない
takeaway: "届いた通知が自治体のものかを、送信元の表示とは別に確かめる手順が無かった。"  # いま読むに選んだときの一文
```

EN ファイルの `impact` / `takeaway` / `controls[].item` は英語で書く。「いま読む 3 本」は
`config/briefPicks.ts` で週に一度選ぶ（業界と手口が 3 本で重ならないように）。脅威タイプ
（`primary_category`）は内部分類として残し、一覧の入口には使わない。

`industries` / `operations` / `controls` は**一覧のファセット用の索引で、記事には描画
しない**。語彙・ラベル・アイコンは `config/briefFacets.ts`。記事中の「注意したい
業界・業務」は md 側で説明文つきの表として書く。EN ファイルの `key_figures` /
`glossary` / `insight` は英語で書く。

### 普通の markdown から組み立てる部品

部品の多くは、決まった形の markdown を書けば rehype（`lib/rehype-brief-section-number.mjs`）
が 032 と同じ HTML に組み替える。`layout: "report"` の Brief だけで働き、手書きの
HTML ブロックはそのまま通る（二重には組み替わらない）。

| 章 | 書くもの | なるもの |
|---|---|---|
| §1 | 段落を3つ（`summary_labels` と同じ数） | 要旨の表（`rx-exsum`）。最後の行が強調 |
| §2 | `- **ラベル**: 本文` の箇条 | 事実の表（`rx-facts`） |
| §3 | 小見出しより前の `- **日付**: 本文` の箇条 | 時系列の表（`rx-tl`）。日付で始まらないラベルは薄い字（`time.nd`） |
| §3 | 引用 `> …` | 注（`rx-aside`） |
| §5 | 冒頭の段落 | リード（`rx-lead`） |
| §5 | 2列目が 効かない／一部／関係しない／効く の表 | 状態のチップ（`bx-st no/part/na/ok`） |
| §5 | `### 必要になるもの` ＋番号つきリスト | 対策のパネル（`rx-box`・`ol.num`） |
| §5 | `### 点検チェックリスト` ＋（段落）＋箇条 | 点検のパネル（`bx-checklist`）。直後の段落は説明文 |
| §5 | `- **業界 · 名前**: 説明` の箇条 | 業界・業務の表（`rx-scope`）。` · ` の前が小見出し |
| §5 | `- **ラベル**: 本文` の箇条 | 定義表（`rx-facts`。持ち主の表など） |
| §3〜§5 | 「注：」で始まる段落 | 小さな注（`rx-aside`） |
| §6 | `- **媒体（種別）**: 題（日付） — 付記` | 出典の表（`rx-srcs`） |

```markdown
## 1. TL;DR

（何が起きたか）…。

（なぜ見分けられないか）…。

（欠けていた層）検出は効いていた。効かなかったのは、…する層である。

## 2. 何が起きたか

- **当事者**: …。
- **被害**: …。

## 3. 時系列 — 公表と対応

- **2026-05-23**: …。
- **調査で判明**: …。

> 本件の事実は、…に拠る。

### 公表後の対応

- **ポラリス**: …。（ここは普通の箇条のまま）

## 5. 対策するには

**結論の一文。** 続きの本文…。

### 注意したい業界・業務

- **業界 · サービス・小売**: …。
- **業務 · 振込先・口座の変更**: …。

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 多要素認証（MFA） | 一部 | … |

### 必要になるもの

1. **変更した本人以外が確かめる。** …。

### 点検チェックリスト

振込先の変更について、組織で確かめる 3 項目

- …か。

注：…。

## 6. Sources

- **Security NEXT（報道）**: 「記事名」（2026-06-03） — <https://www.security-next.com/185176>
- **当事者名（当事者・開示）**: 「資料名」（2026-05-28） — 同社サイトの資料は現在取り下げられている
```

- **§1 の行ラベル**は frontmatter `summary_labels: ["…", "…", "…"]` で変えられる。
  省略時は「何が起きたか／なぜ見分けられないか／欠けていた層」。段落の数と
  ラベルの数が違うと組み替えず、段落のまま出る。
- **太字の後の空白**: 日本語で `**…。**本文` と続けると強調が閉じない（下の
  「Markdown の落とし穴」）。`**…。** 本文` と空白を1つ挟んで書けば、全角の
  句読点・括弧で終わる強調の直後の空白は描画で落ちる。
- **出典**: 種別は太字の末尾の（）。題の末尾の（日付）は付記の頭に「日付 · 」で出る。
  区切りは最後の ` — `。`<https://…>` の自動リンクは `https://`・`www.`・末尾の `/`・
  `.html` を落として表示し、長い URL は `host/最初の段/…` に縮める。表示を決めたい
  ときは `[表示](URL)` で書く。英語の題（引用符で始まる題）の前には空白が入る。
- **引用符**: markdown の `"` `'` は描画で “ ” ’ になる（サイト全体の smartypants）。

### まだ手で書く部品

HTML ブロックの中に**空行を入れない**（空行で markdown に戻る）。図表番号も手で書く。

```html
<!-- 図表 1: 連鎖（rx-step に crit / good） -->
<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">…</span></div>
<p class="rx-ex-cap">…</p>
<div class="rx-chain"><div class="rx-step crit"><div class="who">第三者</div><div class="no">2</div><b>…</b><p>…</p></div></div>
</figure>
```

図表 2 の落差（`rx-gap`）の型は 032 を写す。上の表の部品も、形に収まらないときは
これまでどおり HTML で書いてよい（書いた HTML はそのまま通る）。

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
