---
brief_no: 24
title: "AI エージェントのスキル：人の目に見えない Unicode の文字で、モデルが読む指示を埋め込む手法が開示された(CSA AI Safety Initiative)"
title_en: "AI agent skills: A technique that embeds model-read instructions in Unicode characters invisible to humans was disclosed (CSA AI Safety Initiative)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2026-03-10
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_briefs: ["005-noroboto-lying-fonts", "003-starlette-badhost", "011-synthid-watermark-reverse-engineering", "025-mcp-stdio-config-to-command-rce"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "intake"
og_lead_ja: "CSA が、人の目に見えない Unicode の文字で、AI エージェントのスキルにモデルが読む指示を埋め込む手法を開示した"
og_lead_en: "CSA disclosed a technique that embeds model-read instructions in AI-agent skills using Unicode characters invisible to humans"
og_kicker_ja: "攻撃手法の開示 · AI エージェントのスキル"
og_kicker_en: "ATTACK RESEARCH · AI AGENT SKILLS"
og_headline_ja: "見えない文字の指示を、\n人は読めず AI は読む。\nCSA が手法を開示。\n<accent>人のレビューを素通り</accent>"
og_headline_en: "Invisible Unicode can\nhide instructions\nthe AI reads, CSA says.\n<accent>Human review misses them</accent>"
key_figures:
  - value: "76"
    unit: "件"
    label: "Snyk が 3,984 スキルの監査で確認した、悪意あるペイロードの数（ToxicSkills・2026-02）。本件の手法による件数とは限らない"
    tone: "alert"
  - value: "36.82"
    unit: "%"
    label: "同じ監査で、何らかのセキュリティ問題が見つかったスキルの割合（Snyk）"
  - value: "13.4"
    unit: "%"
    label: "同じ監査で、重大な問題が見つかったスキルの割合（Snyk）"
glossary:
  - term: "Unicode Tag 文字"
    desc: "U+E0000–U+E007F の範囲の文字。人の目や多くのエディタには表示されないが、言語モデルは意味のある内容として処理する（CSA）。"
  - term: "スキル"
    desc: "AI エージェントが再利用する能力のパッケージ。スキルファイル・ツール記述・MCP メタデータとして配布され、エージェントが読み込む。"
insight:
  slug: "human-read-vs-model-read"
  label: "人が読む入力とモデルが読む入力"
  quote: "人の目に見えない文字もモデルは読むので、モデルに渡る版を、人がレビューした版と正規の配布元に照合しない限り、レビューを通った入力にも、誰も読んでいない指示が混ざりうる。"
industries: ["ai", "developers"]
controls:
  - slug: "ownership-check"
    item: "人が確認した入力とモデルが読む入力が同じか確認する"
attack_method: "ai-misuse"
takeaway: "見えない文字は人のレビューを通るので、スキルやツール定義をモデルに渡す前に、正規の配布元から、レビューした版のまま届いたかを照合する。"
search_title: "不可視 Unicode の指示注入：AI スキルの手口と対策"
search_description: "人の目に見えない Unicode の文字で、AI エージェントのスキルやツール定義に指示を埋め込む手法が開示された（CSA AI Safety Initiative）。何が起きたか、なぜレビューで見えないか、対策を整理。"
self_check: "AI エージェントに読み込ませるスキルやツール定義が、正規の配布元から、人がレビューした版のまま届いたかを、読み込ませる前に照合できるか。"
countries: ["global"]
---

## 1. 要点

CSA AI Safety Initiative は、人の目や多くのエディタには空白に見える Unicode の文字に指示を符号化し、AI エージェントのスキルやツール定義に埋め込むと、言語モデルがそれを意味のある指示として読みうることを開示した。見出しの中・行末・空白の中に置かれた文字は、配布・導入のときの人のレビューでは表示されず、研究者コミュニティ（Embrace The Red など）も同じ型の手法を報告している。AI の安全確認の多くは「人がレビューした」ことに頼るが、人の知覚とモデルの解釈のあいだにずれを作れるなら、レビューを通ったことは、モデルが読んだ内容を保証しない。<strong>人の目に見えない文字もモデルは読むので、モデルに渡る版を、人がレビューした版と正規の配布元に照合しない限り、レビューを通った入力にも、誰も読んでいない指示が混ざりうる。</strong>

## 2. 通った操作

- **通った操作**: 不可視の文字を含むスキルファイル・ツール記述・MCP メタデータ・文書の、配布・導入のときの人のレビュー。文字が表示されないため、レビューする人は、埋め込まれた指示があることに気づけない。エージェントがそのスキルや文書を読み込むと、モデルは不可視の文字を意味のある内容として解釈し、埋め込まれた指示に従いうる（CSA）。
- **受け付けた側に届くもの**: 一般に、モデルには、人が画面で見た文字列ではなく、不可視の文字を含む文字列そのものが届く。CSA の示した流れでは、指示に従った認証情報の窃取・外部への送信・権限の外の操作が、エージェントの操作として実行されうる。人が確認した内容とモデルが従った内容がずれているので、後から「なぜそう動いたか」を説明し、再現することが難しい。
- **公表されていないこと**: 本件の手法による、実際の被害の特定の事案。CSA の公表は手法の開示で、Snyk の数字はスキル全体の監査の結果である。

## 3. 実行前の照合

経路を問わず区別できる条件は、スキルやツール定義をモデルに渡す手前で、それが正規の配布元から来たか、人がレビューした版から変わっていないかを、画面での見た目とは別に照合することである。

- **誰が承認を出すか**: スキルやツール定義の配布元（発行者）と、それをレビューして導入を決めた人。配布元は、発行する版に署名し、導入する側は、レビューした版を記録する。スキルの本文の中の文は、承認に使わない。
- **どこで照合するか**: エージェントがスキル・ツール定義・文書を読み込み、モデルに渡す手前。配布元と版を照合できない入力は、照合が済むまで渡さない。
- **何が残るか**: どの配布元の、どの版を、誰がレビューして導入し、モデルに渡したかの記録。エージェントとは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝スキルやツール定義をモデルに渡す前に、正規の配布元から、人がレビューした版のまま届いたかを照合し、記録に残すこと。検知＝不可視の文字や、怪しいデコードの挙動に気づくこと。下の日付は、監査と開示の公表の日で、手法が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>モデルに渡す前に、配布元と、レビューした版と同じかを、見た目とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>人に見えない文字の指示を<br>モデルが読む手法が開示された</span></div>
<div class="rx-zone det"><b>検知 · 監査と緩和策</b>スキルの監査・不可視の文字の除去・検出フック</div>
<div class="rx-g g1"><div class="t">02-05</div><b>Snyk が ToxicSkills の監査を公開</b></div>
<div class="rx-g g2"><div class="t">03-10</div><b>CSA が Research Note を公開</b></div>
<div class="rx-g g3"><div class="t">2026</div><b>Embrace The Red が同じ型の手法を報告</b></div>
<div class="rx-g g4"><div class="t">2026〜</div><b>検出フックや緩和策の研究が続く</b></div>
</div>
</figure>

不可視の文字の除去・デコードの挙動の印付け・スキルの監査は、既知の手口を止め、攻撃の手間を上げる。ただし、既知の符号化に効いても、新しい符号化や難読化が現れれば、後から追うことになる。画面の文字と AI が処理する文字列をフォントの偽装でずらした [Noroboto](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/) と同じ型を、本件は不可視の Unicode という別の経路で成立させる。スキルやメタデータを通る点で、[BadHost](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/) とも、エージェント基盤の入力の境界で隣り合う。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントがスキルやツール定義をモデルに渡す操作の手前に組み込む。** 不可視の文字を見つけるのではなく、その入力の配布元と、人がレビューした版と同じかを、渡す前に、見た目とは別に照合する。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: 外部の配布元のスキル・ツール定義・MCP メタデータを、AI エージェントに読み込ませている組織。
- **業界 · 開発者・エージェント運用**: スキルやツール定義を導入するとき、人のレビューを安全確認の前提にしている開発・運用のチーム。
- **業務 · スキル・ツール定義の導入**: 配布されたスキルや文書を、レビューしてエージェントに読み込ませる業務。読み込んだ文字列の中の指示が、エージェントの操作につながりうる。

### いまの対策と Lemma の違い

開示された手法は、攻撃者が不可視の文字を埋め込んだスキルや文書が、配布・導入のときの人のレビューを通るもので、どちらの列に当たるかは、その版を誰が発行したかによる。

| 対策 | 正規でない配布元の版・レビューの後に差し替わった版 | レビューした版そのものに含まれた不可視の文字 |
| --- | --- | --- |
| 人のレビュー（目視） | 効かない | 効かない |
| 不可視の文字の除去・デコードの挙動の印付け（検出フックなど） | 一部 | 一部 |
| スキルの監査 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効かない |

人のレビューは、文字が表示されないので、どちらの列でも埋め込まれた指示に気づけない。不可視の文字の除去や印付けは、既知の符号化には効くが、新しい符号化や難読化には後から追う。スキルの監査は、問題のあるスキルを見つけて外すが、監査の後に読み込まれる版までは見ない。Lemma は、配布元の署名と、レビューした版の記録を、モデルに渡す版に照合するので、正規でない配布元の版や、レビューの後に変わった版は、渡す前に止まる。一方、レビューした版そのものに不可視の文字が入っていれば、照合は一致し、そのまま通る。この列は、不可視の文字の除去や監査と組み合わせて埋める。

注：Lemma の照合が働くのは、スキルやツール定義の読み込みに照合を組み込み、配布元の署名の鍵と、レビューした版の記録が、エージェントが読む入力とは別に管理されている場合に限る。正規の配布元が不可視の文字を含む版に署名した場合や、人が不可視の文字に気づかないままその版をレビューして導入した場合は、照合を通る。表は何を照合しているかの比較で、今回の手法が止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントにスキルやツール定義を読み込ませている組織で確認する 3 項目

- エージェントに読み込ませているスキル・ツール定義が、どの配布元から入ったものかを把握しているか。
- スキルや文書を導入する前に、不可視の文字を取り除くか、印を付ける処理を通しているか。
- エージェントが読み込んだスキルの版と、それで行った操作の記録を、エージェントとは別に見られるか。

## 5. 事実と時系列

- **開示**: CSA AI Safety Initiative が "Hidden Unicode Instruction Injection in AI Agent Skills" として開示した。研究者コミュニティ（Embrace The Red など）も、同じ型の手法を報告している。
- **手法の要点**: Unicode Tag 文字（U+E0000–U+E007F）は、人の目や多くのエディタには表示されないが、言語モデルは意味のある内容として処理する。任意の指示をこの文字で符号化し、スキルファイル・ツール記述・MCP メタデータ・文書に埋め込む（CSA）。
- **埋め込む場所**: 見出しの中・行末・空白の中など、人のレビューで気づけない位置（CSA）。
- **関連する調査**: Snyk の ToxicSkills（2026-02）が 3,984 のスキルを監査し、36.82% に何らかのセキュリティ問題、13.4% に重大な問題、76 件の悪意あるペイロードを確認した。再利用される能力のパッケージであるスキルが、供給網の攻撃面になっていることを数で示した。
- **位置づけ**: 実際の被害の特定の事案ではなく、手法の開示と、エコシステムの監査である。

### 時系列

- **2026-02-05**: Snyk が ToxicSkills の監査を公開する。3,984 のスキルのうち 36.82% に何らかのセキュリティ問題、13.4% に重大な問題、76 件の悪意あるペイロードを確認した。
- **2026-03-10**: CSA AI Safety Initiative が、不可視の Unicode による指示の注入を Research Note として公開する。検出フック（claude-hooks など）や緩和策の研究が相次ぐ。
- **2026 継続**: スキル・ツール定義・MCP メタデータを通る間接的なプロンプトインジェクションが、エージェントの入力の完全性の主な問題として議論される。

> 手法の事実は CSA AI Safety Initiative の Research Note と Embrace The Red の報告に、監査の数字は Snyk の公表に拠る。本件は研究での手法の実証で、実際の被害の特定の事案ではない。固有名は一次の資料に拠り、各実装の対応は時点によって異なるので、最新の情報を参照されたい。本 Brief は、再現できるペイロードを載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **研究・業界団体**: CSA と研究者コミュニティが手法を開示し、不可視の文字の除去、入力のサニタイズ、スキルの監査などの緩和策が共有された。
- **供給網の認識**: スキル・ツール定義・MCP メタデータが、再利用される「文脈」として供給網の攻撃面になっていることが、ToxicSkills などで数として裏づけられ、配布元の確認とスキルの出どころの管理が求められている。
- **入力の完全性**: 人のレビューを前提にした安全確認から、AI が処理する入力そのものの出どころと完全性を、別に照合する方向へ、関心が移りつつある。

## 6. Sources

研究・業界団体の公表資料を出典として示す。再現に資する具体的ペイロードは引用しない。

- **CSA AI Safety Initiative（一次情報）**: "Hidden Unicode Instruction Injection in AI Agent Skills"（2026-03-10）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-unicode-instruction-injection-ai-skills-20/>
- **研究者開示（二次情報）**: Embrace The Red "Scary Agent Skills: Hidden Unicode Instructions in Skills"（2026）— <https://embracethered.com/blog/posts/2026/scary-agent-skills/>
- **供給網監査（一次情報）**: Snyk "ToxicSkills: Comprehensive Security Audit of AI Agent Skills"（2026-02-05、3,984 スキル・36.82%・13.4% CRITICAL・76 悪性ペイロード）— <https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
