---
brief_no: 118
title: "Microsoft 365 Copilot for Word：生成した文書が次の運び手になる文書ワームが示された(Håkon Måløy の研究)"
title_en: "Microsoft 365 Copilot for Word: A document worm that makes each generated file the next carrier was demonstrated (Håkon Måløy research)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-28
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "024-invisible-unicode-instruction-injection", "048-trapdoor-ai-instruction-provenance", "005-noroboto-lying-fonts", "104-webmcp-mid-session-tool-injection"]
status: published
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "研究者 Håkon Måløy が、Copilot for Word が文書の隠し文字の指示に従って財務報告の数値を半分にし、その指示を生成した文書へ複写する実証を公表した"
og_lead_en: "Researcher Håkon Måløy published a demonstration in which Copilot for Word followed hidden-text instructions in a document, halved a financial report's figures and copied the instructions into the file it generated"
og_kicker_ja: "研究の実証 · Copilot for Word"
og_kicker_en: "RESEARCH DEMO · COPILOT FOR WORD"
og_headline_ja: "見えない指示で、\n財務の数値が半分に。\n生成文書が次の運び手。\n<accent>研究者が実証と報告</accent>"
og_headline_en: "Hidden Word text made\nCopilot halve figures,\na researcher reports.\n<accent>Each output carries it on</accent>"
key_figures:
  - value: "2"
    unit: "回"
    label: "Microsoft が投入した緩和策の回数（2026-04・07）。研究者は、改変したペイロードで、すべての緩和策の適用下でも連鎖を再現したとする"
    tone: "alert"
  - value: "144"
    unit: "日"
    label: "MSRC への初報から公表までの日数（協調開示）"
  - value: "50"
    unit: "%"
    label: "実証で Copilot が財務報告の数値を減らした幅（すべて半分に）。研究者の実証環境での PoC で、実際の企業文書の改変の報告ではない"
glossary:
  - term: "文書伝播型のプロンプト注入"
    desc: "文書の中に埋め込んだ指示を AI に読ませ、AI が生成した文書にもその指示が写って、次の利用者の AI に読まれていく型。研究者は「ワーム的」と呼ぶ。"
  - term: "XPIA"
    desc: "クロスドメイン・プロンプト注入。利用者の指示でなく、文書やメールなど外から来た内容に含まれる指示を AI が実行してしまう型。"
insight:
  slug: "generated-output-as-next-input"
  label: "生成した文書が、次の入力になる"
  quote: "Copilot が書いた文書は、見た目では正しく生成された文書と区別できないので、次の生成や共有に使う前に、どの原資料と誰の指示から作られたかを照合しない限り、改変も埋め込まれた指示も、そのまま次の文書へ運ばれうる。"
industries: ["ai"]
controls:
  - slug: "hold-unverified"
    item: "Copilot が編集した数値を、元データと照合するまで共有しない"
attack_method: "ai-misuse"
takeaway: "生成した文書は次の生成の入力になるので、共有や再編集に使う前に、どの原資料と、利用者のどの指示から作られたかを照合する。"
search_title: "Copilot for Word の文書ワーム：手口と対策"
search_description: "研究者 Håkon Måløy が、Copilot for Word が文書の隠し文字の指示に従って財務報告の数値を半分にし、指示を生成した文書へ複写する実証を公表した。何が起きたか、Microsoft の対応、対策を整理。"
self_check: "AI で生成・編集した文書を共有したり、次の生成の入力にしたりする前に、どの原資料と誰の指示から作られたかを照合できるか。"
countries: ["global"]
---

## 1. 要点

2026 年 7 月 28 日、研究者 Håkon Måløy は、Microsoft 365 Copilot for Word に対する文書伝播型のプロンプト注入「Context Collapse, Part 3」を公表した。研究者によれば、人の目に見えない書式で文書に埋め込んだ指示は、Copilot が書式を落として本文をモデルに渡すため、モデルにはそのまま読まれる。実証では、Copilot が四半期の財務報告の数値をすべて半分に書き換え、さらに指示そのものを生成した文書に隠し文字として写したので、生成された文書が次の運び手になった。Microsoft は 2026 年 4 月と 7 月に緩和策を投入し、報告された個別のペイロードは遮断されたが、研究者は、改変したペイロードで公表の時点でも連鎖を再現したとする。<strong>Copilot が書いた文書は、見た目では正しく生成された文書と区別できないので、次の生成や共有に使う前に、どの原資料と誰の指示から作られたかを照合しない限り、改変も埋め込まれた指示も、そのまま次の文書へ運ばれうる。</strong>

## 2. 通った操作

- **通った操作**: 利用者が、隠し文字の指示を含む文書を Copilot for Word に処理させ、報告を作らせる操作。研究者の実証では、Copilot は利用者の指示と同じように文書の中の指示に従い、財務の数値を半分にした。次の段では、悪性の文書を外し、先に生成された Q1 の報告だけを添付して Q2 の報告を作らせたところ、同じ改変が起きた（研究者）。
- **受け付けた側に届くもの**: 見た目では正しく生成された報告と区別できない文書。研究者によれば、財務報告の実証で Copilot は数値を半分にしたことを告げていない。生成された文書には指示が隠し文字のまま写っているので、組織の中で共有・再編集されるたびに、次の利用者の Copilot がその指示を読みうる。
- **公表されていないこと**: 本件の手法による実際の被害の事案。研究者の公表は協調開示を経た研究の実証で、実際の企業文書が改変されたとする報告ではない。公表の時点で再現に使われた改変後のペイロードの中身は、本 Brief では扱わない。

## 3. 何を照合するか

経路を問わず区別できる条件は、文書を生成の入力に入れる手前と、生成した文書を共有する手前で、その文書がどの原資料と、どの入力の文書と、誰の指示から作られたかを、見た目とは別に照合することである。

- **誰が承認を出すか**: 原資料の作成者（持ち主）と、生成を頼んだ利用者。原資料は作成者が版を記録し、生成の指示は利用者のものとして記録する。文書の本文の中の文は、承認にも指示にも使わない。
- **どこで照合するか**: 文書を Copilot などの生成の入力に入れる手前と、生成した文書を共有・再編集に回す手前。出どころを照合できない文書や、それを入力に含んで生成された文書は、照合が済むまで次へ回さない。
- **何が残るか**: どの原資料のどの版と、どの入力の文書から、誰の指示で、どの文書が生成されたかの記録。生成する AI とは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝文書を生成の入力に入れる前や、生成した文書を共有する前に、どの原資料と誰の指示から作られたかを照合し、記録に残すこと。検知＝研究者の報告やベンダーの緩和策で、報告された個別のペイロードに気づき、遮断すること。下の日付は、報告と緩和策と公表の日で、実際の被害の日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>生成の入力や共有の前に、原資料と指示の出どころを、見た目とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>文書の隠し指示で数値が書き換わり<br>生成した文書に指示が写った（研究者）</span></div>
<div class="rx-zone det"><b>検知 · 報告と緩和策</b>研究者の報告・Edit with Copilot の刷新・モデルの更新</div>
<div class="rx-g g1"><div class="t">03-06</div><b>研究者が MSRC に報告</b></div>
<div class="rx-g g2"><div class="t">04-03</div><b>一次の緩和策（Edit with Copilot の刷新）</b></div>
<div class="rx-g g3"><div class="t">07-14</div><b>二次の緩和策（GPT-5.5 への更新）</b></div>
<div class="rx-g g4"><div class="t">07-28</div><b>公表。研究者は class はなお悪用できるとする</b></div>
</div>
</figure>

報告された個別のペイロードの遮断は、既知の手口を止め、攻撃の手間を上げる。ただし、研究者は、言い回しを変えたペイロードで、すべての緩和策の適用下でも連鎖を再現したとしており、特定の文言を塞ぐ対策は、新しい変種を後から追うことになる。データに埋め込まれた指示を Copilot が実行した [Brief 055（EchoLeak）](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/)、人の目に見えない文字が指示として働いた [Brief 024（不可視 Unicode による指示注入）](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)、人が読む文字列と機械が読む文字列をずらした [Brief 005（Noroboto）](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/) と同じく、本件でも、人が見ている文書とモデルが読んでいる文書は別のものになる。本件は、その指示が生成した文書に写り、次の入力になる点が加わる。

## 4. Lemma でできること

**Lemma は、03 の照合を、文書を生成の入力に入れる操作と、生成した文書を共有する操作の手前に組み込む。** 隠し文字や注入の言い回しを見つけるのではなく、その文書がどの原資料と誰の指示から作られたかの記録を、次へ回す前に、見た目とは別に照合する。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: Copilot などの生成 AI で、報告・集計・要約の文書を作り、組織の中で共有している組織。
- **業務 · 報告・集計の文書の作成**: 前の期の報告や外から届いた文書を添付して、次の報告を AI に作らせる業務。前の生成物が次の入力になるので、改変と指示が引き継がれうる。
- **業務 · 文書の共有・再編集**: AI が生成・編集した文書を、元データと照合しないまま、根拠として回したり、さらに編集したりする業務。

### いまの対策と Lemma の違い

研究者が示した連鎖は、隠し指示を含む文書が生成の入力に入り、生成された文書がさらに次の入力になるもので、どちらの列に当たるかは、その文書の出どころを照合できるかによる。

| 対策 | 出どころを照合できない文書、またはそれを入力に含んで生成された文書が、次の生成や共有に入る | 出どころを照合できる文書そのものに、隠し指示が含まれる |
| --- | --- | --- |
| 文書を開いて読む（人の目視） | 効かない | 効かない |
| 報告された個別のペイロードの遮断（Edit with Copilot の刷新・モデルの更新） | 一部 | 一部 |
| 生成した数値を元データと照合してから共有する（人の手） | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効かない |

人の目視は、指示が見えない書式で埋め込まれ、改変された報告も見た目では区別できないので、どちらの列でも気づけない。個別のペイロードの遮断は、報告された文言には効いたが、研究者は改変したペイロードで連鎖を再現したとする。元データとの照合は、書き換わった数値に気づけるが、生成した文書に写った隠し指示までは見えない。Lemma は、文書の生成の記録（原資料の版・入力の文書・指示を出した利用者）を、次の生成や共有の前に照合するので、出どころを照合できない文書や、それを入力に含んで生成された文書は、次へ回る前に止まり、伝播の連鎖はそこで切れる。一方、出どころを照合できる文書そのものに隠し指示が入っていれば、照合は一致し、そのまま通る。この列は、ベンダーの緩和策や元データとの照合と組み合わせて埋める。

注：Lemma の照合が働くのは、文書の生成と共有に照合を組み込み、原資料の版と生成の記録が、生成する AI とは別に管理されている場合に限る。Lemma は文書の中身を読んで隠し指示を見つけるものではなく、数値の正しさや AI の出力の品質を保証するものでもない。正規の作成者の文書に隠し指示が入っていた場合は、照合を通る。表は何を照合しているかの比較で、今回の実証が止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

生成 AI で報告や集計の文書を作り、共有している組織で確認する 3 項目

- AI に添付して読ませている文書が、どこから来たものかを把握しているか。
- AI が生成・編集した数値を、共有する前に元データと照合しているか。
- AI が生成した文書が、どの原資料とどの入力の文書から作られたかの記録を、生成する AI とは別に見られるか。

## 5. 事実と時系列

- **報告者**: ノルウェーのデータサイエンティスト Håkon Måløy。Microsoft Security Response Center（MSRC）との協調開示として、初報から 144 日後に公表した。
- **手法の要点**: 指示は、白地に白文字・極小のフォントという、人の目に見えない書式で文書に埋め込まれる。Copilot for Word は色やフォントの書式を落としてから本文をモデルに渡すので、隠し文字はモデルには平文として届く（研究者）。
- **伝播**: 研究者によれば、Copilot は指示そのものを生成した文書に隠し文字として書き込み、その文書が新しい運び手になる。悪性の文書を外し、先に生成された報告だけを添付した次の段でも、同じ改変が再現した。
- **実証の題材**: 財務の数値の半減は、変更がひと目で分かるために選ばれた（研究者）。
- **位置づけ**: 協調開示を経た研究の実証で、実際の被害の事案ではない。

### 時系列

- **2026-03-06**: Måløy が、再現の手順と PoC のプロンプトを付けて MSRC に報告する。
- **2026-03-09**: MSRC が受領を確認する。
- **2026-03-31**: Microsoft が挙動を確認する。
- **2026-04-03**: 一次の緩和策として「Edit with Copilot」を刷新する。
- **2026-04-09**: 当初のプロンプトは緩和されたが、研究者が新しい XPIA の変種を見つける。
- **2026-07-14**: 二次の緩和策として、モデルを GPT-5.5 に更新する。
- **2026-07-15**: GPT-5.6 の上でも攻撃が再現し、公表を再び延ばす。
- **2026-07-28**: 公表。研究者は、脆弱性の class は公表の時点でなお悪用できるとする。

> 事実は研究者本人の公表記事と、それを受けた報道（The Register・iTnews・Malwarebytes・CyberInsider）に拠る。本件は協調開示を経た研究の実証で、財務の数値の改変は研究者の実証環境での PoC であり、実際の企業文書が改変されたとする報告ではない。本 Brief は、再現できるペイロードや手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Microsoft**: The Register に対し、「研究者から報告された事象には対処済みであり、協調的な脆弱性開示を通じて協働してくれたことに感謝する。この種のリスクに対しては、悪性の指示を複数の地点で遮断する多層防御の戦略を採っている」と述べた。
- **研究者**: Microsoft の修正は露出を有意に減らし、Part 1・Part 2 で扱ったメモリとメール本文の経路は完全に緩和されたとして、開示の過程での Microsoft の協働を評価している。一方で、二度の緩和は報告された個別のペイロードを塞いだもので、脆弱性の class の除去ではなく、公表の時点でこの類型への包括的な緩和策は無いとしている。
- **報道**: 本件を「自己伝播するワーム的な挙動」として扱い、ふだんの企業の文書のワークフローが伝播の経路になりうる点を取り上げている。

## 6. Sources

- **Håkon Måløy（一次）**: “Context Collapse, Part 3 — AI Worming through Word”（2026-07-28）— <https://enklypesalt.com/posts/context-collapse-part3-ai-worming-through-word/>
- **The Register（独立報道・Microsoft の声明を収録）**: “Word worm crawls into Copilot, spreads chaos”（2026-07-29）— <https://www.theregister.com/security/2026/07/29/word-worm-crawls-into-copilot-spreads-chaos/5280588>
- **iTnews（独立報道）**: “Microsoft can't kill dogged researcher's Copilot for Word worm”（2026-07-31）— <https://www.itnews.com.au/news/microsoft-cant-kill-dogged-researchers-copilot-for-word-worm-627830>
- **Malwarebytes（独立解析）**: “Hidden prompt turns Microsoft Copilot into an AI worm”（2026-07-30）— <https://www.malwarebytes.com/blog/ai/2026/07/hidden-microsoft-copilot-ai-worm>
- **CyberInsider（独立報道）**: “Microsoft Copilot for Word vulnerable to self-propagating worm-like attack”（2026-07-30）— <https://cyberinsider.com/microsoft-copilot-for-word-vulnerable-to-self-propagating-worm-like-attack/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
