---
brief_no: 5
title: "Noroboto：埋め込みフォントの偽装で、AI の文書レビューに別の文章を読ませうることが示された(Tritium Legal Technologies)"
title_en: "Noroboto: Embedded \"lying fonts\" could make an AI document review read different text (Tritium Legal Technologies)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance"]
incident_date: 2026-05-25
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["024-invisible-unicode-instruction-injection", "003-starlette-badhost", "017-mckinsey-lilli-system-prompts", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "intake"
og_lead_ja: "Noroboto — 埋め込みフォントの偽装で、人が画面で読む文章と AI が抽出する文字列を別にできることを、Tritium Legal Technologies のミラー氏が公開した"
og_lead_en: "Noroboto — Tritium Legal Technologies' Drew Miller showed that an embedded font can make the text a person reads on screen differ from the string an AI extracts"
og_kicker_ja: "攻撃の実証 · AI の文書レビュー"
og_kicker_en: "ATTACK RESEARCH · AI DOCUMENT REVIEW"
og_headline_ja: "偽装フォントで、\nAI が別の文章を\n読むと研究者が報告。\n<accent>画面では正常に見える</accent>"
og_headline_en: "Lying fonts made AI\nread different text,\na researcher reports.\n<accent>Looks normal on screen.</accent>"
key_figures:
  - value: "Maryland → Delaware"
    label: "人が画面で見る字と、AI が抽出する文字列が別になる例。字形は正常に描かれる"
    tone: "alert"
  - value: "3"
    unit: "つ"
    label: "ミラー氏が、事前に一致を照合するよう提案した文章（画面に見える文章・ファイル内の Unicode 文字列・AI が処理する文章）"
  - value: "05-25"
    label: "GIGAZINE が日本語で解説した日。手法の公開は 2026-05（Tritium の公式 blog）"
glossary:
  - term: "埋め込みフォント"
    desc: "PDF などの文書ファイルの中に入れて配るフォント。読む側の環境に無い字体でも、同じ見た目で表示できる。"
  - term: "符号位置と字形"
    desc: "符号位置は、Unicode で文字に振られた番号。字形は、画面に描かれる文字の形。フォントが、番号ごとに描く形を決める。"
  - term: "テキスト抽出"
    desc: "AI や文書レビューの仕組みが、文書を読む前に、ファイルから文字列を取り出すこと。画面の見た目ではなく、ファイルの中の文字の番号を読む。"
insight:
  slug: "rendered-vs-extracted-text"
  label: "画面の文章と AI が読む文字列"
  quote: "AI は画面の字形ではなくファイルから抽出した文字列を読むので、その文字列を人が見る文章と照合しない限り、人が目で確認した文書でも、AI は別の文章をもとに判断しうる。"
industries: ["ai"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "AI が読んだ文字列が、人が画面で見た文章と同じか確認する"
attack_method: "ai-misuse"
takeaway: "埋め込みフォントの偽装で、画面の文章と AI が読む文字列は別になりうるので、AI の結論を使う前に、両者の一致を照合する。"
search_title: "Noroboto（偽装フォント）：AI 文書レビューの手口と対策"
search_description: "埋め込みフォントの偽装で、人が画面で読む文章と AI が抽出する文字列を別にできることが示された（Tritium Legal Technologies のミラー氏）。手口の型、何を照合するか、対策。"
self_check: "AI に文書をレビューさせるとき、AI が読む文字列が、人が画面で見る文章と同じかを、AI の結論を使う前に照合できるか。"
countries: ["global"]
---

## 1. 要点

Tritium Legal Technologies の創業者ドリュー・ミラー氏は、文書に埋め込んだフォントで、Unicode の符号位置と画面に描かれる字形の対応をずらすと、人が画面で読む文章と、AI が抽出する文字列を別のものにできることを示した。ミラー氏らのテストでは、一部の AI プラットフォームが誤った回答を返した。AI は受け取った文字列に対しては正常に推論するので、出力の側の検出は働きにくい。<strong>AI は画面の字形ではなくファイルから抽出した文字列を読むので、その文字列を人が見る文章と照合しない限り、人が目で確認した文書でも、AI は別の文章をもとに判断しうる。</strong>

## 2. 通った操作

- **通った操作**: AI による文書の読み込みと、それに基づく要約・判定・回答。文書を開いた人には正常な文章が見えるが、AI は、フォントが指す符号位置から、別の文字列を受け取る。研究で示された例では、画面に「Maryland」と見える箇所を、AI は「Delaware」として読む（ミラー氏）。
- **受け付けた側に届くもの**: 一般に、AI の要約や判定を使う人には、AI の結論だけが届く。その結論が、人が見た文章からではなく、別の文字列から出たことは、結論の側からは区別がつかない。文書の一部だけを書き換えると、文書全体の異常としては現れにくく、より深刻になると研究は指摘する。
- **公表されていないこと**: 誤回答した AI プラットフォームの名前と数、実環境での被害の有無。本件は研究者による実証である。

## 3. 何を照合するか

経路を問わず区別できる条件は、AI の結論を判断に使う手前で、AI が処理した文字列が、人が画面で見る文章と一致するかを、文書の見た目とは別に照合することである。

- **誰が承認を出すか**: AI のレビュー結果を使って判断する担当者。AI が処理した文字列と、画面の文章との一致の結果を、AI の出力とは別に見て承認する。AI の要約の中の文は、承認に使わない。
- **どこで照合するか**: 文書のテキストを AI に渡す手前と、AI の要約・判定を承認に使う手前。一致を照合できない文書の結論は、照合が済むまで使わない。
- **何が残るか**: どの文書から、どの文字列を AI に渡し、画面の文章との一致をどう照合し、誰の承認で結論を使ったかの記録。AI とは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝AI の結論を判断に使う前に、AI が処理した文字列が、人が画面で見る文章と一致するかを照合し、記録に残すこと。検知＝誤った回答や、根拠の無い判断に、出力の側で気づくこと。下の日付は、研究の公開と解説の日で、手法が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>AI の結論を使う前に、AI が読んだ文字列と画面の文章の一致を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>テストで、一部の AI プラットフォームが<br>誤った回答を返した</span></div>
<div class="rx-zone det"><b>検知 · 研究の公開と周知</b>研究の公開・解説の記事・出力の側の検出</div>
<div class="rx-g g1"><div class="t">2026-05</div><b>ミラー氏が手法を公開</b></div>
<div class="rx-g g2"><div class="t">2026-05</div><b>同じ記事で Rust の対策コードを公開</b></div>
<div class="rx-g g3"><div class="t">05-25</div><b>GIGAZINE が日本語で解説</b></div>
<div class="rx-g g4"><div class="t">05-25〜</div><b>AI の文書レビューの論点として取り上げられる</b></div>
</div>
</figure>

出力の側の検出（ハルシネーションや根拠の無い判断の検出）は、AI の判断の質を後から点検する層として引き続き要る。ただ、本件の AI は受け取った文字列に対して正常に推論しているので、出力だけを見ても、入力が人の見た文章と違うことには気づきにくい。人の目に見えない Unicode の文字で、人の見る内容とモデルが読む内容をずらした [不可視 Unicode の指示注入](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/) と同じ型を、本件はフォントという別の経路で成立させる。

## 4. Lemma でできること

**Lemma は、03 の照合を、AI の要約・判定を承認などの判断に使う操作の手前に組み込む。** フォントの偽装を見つけるのではなく、AI が処理した文字列について、画面の文章との一致の照合が済んでいるかと、その結論を使う承認を、使う前に照合し、記録に残す。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: 外部から受け取った文書を、AI にレビュー・要約させている組織。研究は、契約書のレビュー、請求書の処理、監査、入札書類の確認など、AI が文書の中身を根拠に判断する領域を挙げる。
- **業務 · 承認・決裁**: AI の要約や判定を、契約や支払いの承認に使う業務。AI が読んだ文字列が画面の文章と違えば、承認の根拠がずれる。

### いまの対策と Lemma の違い

今回の経路は、1 列目（文書から AI へのテキストの取り込み）から 2 列目（AI の結論を使った承認）へ続く連鎖である。

| 対策 | 文書から AI へのテキストの取り込み | AI の結論を使った承認 |
| --- | --- | --- |
| 人が画面で文書を目視する | 効かない | 一部 |
| 出力の側の検出（ハルシネーション・根拠の無い判断） | 関係しない | 効かない |
| 埋め込みフォントを無条件に信用しない・字形を再読して照合する（ミラー氏の提案） | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効かない | 効く |

人の目視は、字形が正常に描かれるので、取り込みの段では偽装に気づけない。AI の結論と原本を人が読み比べれば、ずれに気づく場合はあるが、文書の一部だけの書き換えは見落としやすい。出力の側の検出は、AI が受け取った文字列に対して正常に推論しているので、発火しにくい。ミラー氏が提案した対策（埋め込みフォントを無条件に信用しない、フォントで描いた字を OCR で読み直して期待する文字列と照合する、画面の文章・ファイル内の Unicode 文字列・AI が処理する文章の 3 つの一致を事前に照合する）は、取り込みの段で偽装を見つけにいくもので、効く範囲は実装による。Lemma は、取り込みそのものは止めず、AI の結論を承認に使う操作を、一致の照合の結果と承認に結ぶ。照合の記録が無い結論は、承認に使う前に止まる。

注：Lemma の照合が働くのは、AI の結論を承認に使う操作に照合を組み込み、一致を照合する仕組み（字形の再読など）の結果と承認の鍵が、AI が読む文書とは別に管理されている場合に限る。Lemma は、フォントの偽装そのものを見つけない。一致の照合が偽装を見逃せば、その結果は照合を通る。担当者が、一致の結果を見ないまま承認すれば通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

外部から受け取った文書を AI にレビューさせている組織で確認する 3 項目

- 外部から受け取った文書の埋め込みフォントを、無条件には信用しない扱いにしているか。
- AI の要約・判定を承認に使う前に、要の数字・名前・日付を、原本の画面と照合しているか。
- AI が処理した文字列と、それに基づく承認の記録を、AI とは別に見られるか。

## 5. 事実と時系列

- **研究**: Noroboto（Lying Fonts attack）。Tritium Legal Technologies の創業者ドリュー・ミラー氏（企業法務の弁護士・ソフトウェア開発者として 10 年以上の経験）が公開した。研究者による実証で、実地の被害の件数ではない。
- **公開先**: Tritium の公式 blog「Noroboto: Lying Fonts and Mitigation in Rust」。
- **手法の型**: 文書（PDF など）に埋め込んだフォントで、Unicode の符号位置と画面に描かれる字形の対応をずらす。人には正常な文章が見え、AI がテキストを抽出する段では、別の文字列が得られる。文書の一部だけに使うと、より深刻になる（ミラー氏）。例として、画面の「2 億円」を AI が「1 億円」として読むような部分の書き換えが挙げられている。
- **実証**: ミラー氏らのテストで、一部の AI プラットフォームが誤った回答を返した。
- **影響が想定される領域**: 契約書のレビュー、請求書の処理、監査、入札書類の確認など、AI が文書の中身を根拠に判断する領域。
- **対策の提案**: ミラー氏が、Rust で実装した対策のコードを公式 blog で公開した。

### 時系列

- **2026-05**: ミラー氏が Tritium の公式 blog で、Noroboto の手法と、Rust で実装した対策を公開する。
- **2026-05-25**: GIGAZINE が日本語で解説し、AI の文書レビューの入力の論点として取り上げられる。

> 固有名と手法は、Tritium Legal Technologies の公式 blog でのドリュー・ミラー氏の開示に拠る。本 Brief は研究者による実証（Lying Fonts attack）として扱い、実環境での被害の規模を誇張しない。各実装の対応は時点によって異なるので、最新の情報を参照されたい。本 Brief は、偽装フォントの作り方を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Tritium Legal Technologies（ミラー氏）**: Rust で実装した対策のコードを公式 blog で公開し、「埋め込みフォントを無条件に信用しない」「フォントで英数字を描き、OCR で読み取って期待する文字列と一致するかを確認する」「人が画面で見る文章・文書ファイル内の Unicode 文字列・AI が実際に処理する文章の 3 つの一致を、事前に検証する」ことを提案した。
- **AI の文書レビューのプラットフォーム**: 各社の個別の対応は、本 Brief の出典では確認できない。

## 6. Sources

- **Tritium Legal Technologies official blog**: "Noroboto: Lying Fonts and Mitigation in Rust" by Drew Miller(2026-05、公式 blog、Rust 実装 mitigation コード公開を含む)— https://tritium.legal/blog/noroboto
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
