---
brief_no: 188
title: "Deloitte：豪雇用職場関係省に納品した報告書の参考文献と判決の要約に誤りがあり、差し替え版に生成 AI の利用が書き加えられた"
title_en: "Deloitte: A report delivered to Australia's employment department had errors in its references and in a court-case summary, and the replacement added a note on generative AI use"
pillar: 02-verifiable-ai
primary_category: ai-decision-integrity
secondary_categories: [data-provenance]
incident_date: 2025-07-04
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["060-withers-aberdeen-ai-hallucinated-precedent", "189-chicago-sun-times-syndicated-ai-book-list"]
status: draft
version: "1.0"
og_lead_ja: "Deloitte が豪雇用職場関係省に納品した報告書、参考文献と判決の要約の誤りで差し替え。差し替え版に生成 AI の利用の記載"
og_lead_en: "Deloitte's report for Australia's employment department replaced over faulty references; the new version notes generative AI use"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "AI の利用事例 · 納品物の誤り"
og_kicker_en: "AI USE · DELIVERABLE ERRORS"
og_headline_ja: "豪州の省の報告書、\n参考文献に誤り。\n<accent>約 44 万豪ドルの契約</accent>"
og_headline_en: "Deloitte's welfare review\nhad faulty citations.\n<accent>A$440K contract</accent>"
key_figures:
  - value: "最大 20"
    unit: "か所"
    label: "最初の版で見つけた誤り（シドニー大学の研究者・AP の報道）"
    tone: "alert"
  - value: "約 44"
    unit: "万豪ドル"
    label: "契約の額（報道）。最後の支払い分が返金された"
  - value: "07-04 → 09-26"
    label: "最初の版の日付と、差し替え版の日付（2025 年）"
glossary:
  - term: "TCF（Targeted Compliance Framework）"
    desc: "オーストラリアの雇用サービスで、給付を受ける人が求職などの義務を果たしたかに応じて、支払いの停止などを IT のシステムで進める枠組み。報告書は、そのシステムが政策や業務の規則と合っているかを評価した。"
  - term: "Amato の訴訟"
    desc: "「Robodebt」と呼ばれた、所得の平均から過払いの債務を自動で算出した仕組みをめぐる連邦裁判所の訴訟（2019 年）。報告書は、自動の処理には法の根拠と証拠が要る例として挙げた。"
  - term: "差し替え版"
    desc: "省のページで、前の版に置き換えて掲載された版。ページには、置き換えた前の版の日付が書かれる。"
insight:
  slug: "citation-not-matched-to-source"
  stop: true
  label: "引用を原典と照合しないまま納品する"
  quote: "報告書を納品する前に、引いた文献や判決の 1 件ごとに、報告書の参考文献の一覧ではなく原典の記録と照合する。"
industries: ["public-sector", "ai"]
operations: ["delivery", "approval"]
controls:
  - slug: "check-origin"
    item: "報告書が引く文献・判決の 1 件ごとに、原典の記録と照合する"
  - slug: "hold-unverified"
    item: "原典と照合できない引用が残る報告書は、納品する前に止める"
  - slug: "audit-trail"
    item: "版ごとに、どの引用を何と照合し、何を直したかを記録する"
attack_method: "ai-misuse"
impact: "省に納品した報告書の参考文献と判決の要約に誤りがあり、差し替え版が掲載された。契約の最後の支払い分が返金された（報道）"
takeaway: "参考文献の一覧は、体裁が整っていても実在を示さない。報告書を納品する前に、引用の 1 件ごとに原典と照合する。"
self_check: "外部に納品する報告書で、引いた文献や判決が原典にあることを、納品する前に照合しているか。"
countries: ["au"]
search_title: "Deloitte の報告書の誤った引用：差し替えの経緯"
search_description: "Deloitte が豪雇用職場関係省に納品した報告書で、参考文献と判決の要約に誤りがあり差し替えられた（省のページ・報告書の注記）。何が起きたか、納品する前に照合する点を整理。"
---

## 1. 要点

省が公開した Deloitte の最終報告書に、原典に当たらない引用と参考文献が入っていた。報道によれば、最初の版には実在しない文献と、連邦裁判所の判事の言葉とされる引用も含まれていた。

差し替え版の注記によれば、誤りのある引用と参考文献の項目、訴訟の要約の誤りを直した。報告書の結論は問われておらず、所見と勧告には影響しないとしている。

<strong>体裁の整った参考文献の一覧は、その文献が実在することを示さない。</strong>

## 2. 通った操作

- **通った操作**: 委託先の Deloitte が、契約の最後の成果物（Milestone 4）として最終報告書を省に納品し、省がその PDF を自らのサイトに掲載した（報告書・省のページ）。引用と参考文献は、本文の分析の根拠として、そのまま公開の文書に載った。
- **受け付けた側に届くもの**: 一般に、受け取る側には、脚注と参考文献の一覧がそろった、いつもの体裁の報告書が届く。引いた文献や判決が原典にあるか、引用の言葉が原典と同じかは、1 件ずつ原典に当たるまで分からない。
- **気づいた経路**: シドニー大学の研究者が、最初の版に最大 20 か所の誤りを見つけ、報道機関に知らせた（AP の報道）。
- **AI の記載**: 差し替え版の付録 C（技術の評価の方法）は、システムのコードの状態を業務の要件と対応づけられるかの評価に、省が契約し省の Azure の環境に置いた生成 AI（Azure OpenAI GPT-4o）によるツールを使ったと書く。7 月の版の PDF には、この記載は見当たらない。省のページは AI に触れていない。
- **公表されていないこと**: 誤りのある引用がどの作業で作られたか、引用や参考文献の作成に AI を使ったか、納品する前にどんな確認をしていたか。Deloitte は、AI が誤りを生んだかという問いに答えなかった（AP の報道）。

## 3. 実行前の照合

経路を問わず区別できる条件は、引いた文献や判決の 1 件ごとに、原典の記録にあるかと引用の言葉が原典と同じかを、納品する前に照合することである。

- **誰が承認を出すか**: 報告書を納品する側の、作成に関わらないレビューの担当。引用の 1 件ごとに、照合した原典（文献の書誌の記録、判決の記録など）を結び付けて承認する。執筆者や、文を作ったツールの側では決めない。
- **どこで照合するか**: 報告書を納品する直前と、受け取る側が公開する直前。原典の記録と結び付かない引用や、言葉が原典と合わない引用が残る報告書は止める。受け取る側も、引用の照合の記録が付いているかを公開の前に確認する。
- **何が残るか**: 版ごとに、どの引用を、どの原典の記録と照合したか、誰が承認したかの記録。差し替えたときに、何をどう直したかを前の版と比べられる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝報告書を納品する前に、引用の 1 件ごとに原典の記録と照合し、記録に残すこと。検知＝公開の後に、読んだ人が誤りに気づくなど、納品した後に分かること。下の日付は、報告書と省のページに書かれた日と、報道の日である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>納品する前に、引用の 1 件ごとに原典の記録と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>誤りのある引用と参考文献の項目<br>訴訟の要約の誤り（差し替え版の注記）</span></div>
<div class="rx-zone det"><b>検知 · 読んだ人が知らせた</b>研究者が公開された報告書の誤りに気づき、報道機関に知らせる</div>
<div class="rx-g g1"><div class="t">2025-07-04</div><b>最終報告書の日付</b></div>
<div class="rx-g g2"><div class="t">2025-08</div><b>省のページに報告書が載る</b></div>
<div class="rx-g g3"><div class="t">2025-10-03</div><b>省のページが差し替え版に変わる</b></div>
<div class="rx-g g4"><div class="t">2025-10-07</div><b>最後の支払い分の返金が報じられる</b></div>
</div>
</figure>

検知は働いた。公開された報告書を読んだ研究者が誤りに気づき、Deloitte と省は確認の上で差し替えた。ただ、気づいたのは公開の後だった。AI が作った実在しない判例が、提出の後に裁判所で見つかった事案に [Withers 対 Aberdeen 市](https://lemma.frame00.com/ja/critical/briefs/060-withers-aberdeen-ai-hallucinated-precedent/)がある。配信会社から購入した特集（シンジケート記事）で、存在しない本の推薦が、掲載の後に見つかった事案に [Chicago Sun-Times](https://lemma.frame00.com/ja/critical/briefs/189-chicago-sun-times-syndicated-ai-book-list/) がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、報告書を納品する手続きに組み込む。** 文の誤りや AI の使用を見つけるのではなく、納品する報告書の引用の 1 件ごとに、原典の記録と結び付いているかを、執筆者やツールとは別に、納品する前に照合する。

### 注意したい業界・業務

- **業界 · 行政・公共**: 委託先の評価や調査の報告書を受け取り、政策の判断の根拠として公開する組織。公開した文書の引用は、そのまま行政の記録として読まれる。
- **業界 · AI 導入（全業界）**: 調査・評価・提案の文書の作成に生成 AI を使う組織。もっともらしい書誌の形の引用は、原典に当たらないと見分けにくい。
- **業務 · 配信・送付**: 報告書や成果物を、契約の相手や読者に納品する業務。納品した文書は、受け取った側の判断と公開に使われる。
- **業務 · 承認・決裁**: 成果物を受け取って検収し、支払いや公開を承認する業務。検収の手順に引用の照合が無ければ、引用の誤りは支払いと公開の後まで残る。

### いまの対策と Lemma の違い

誤りが報じられたのは、主に 1 列目（引用・参考文献の原典との一致）である。差し替え版の注記は、Amato の訴訟の要約の誤りも直したとしており、これは 2 列目（要約・分析の正しさ）にあたる。

| 対策 | 引用・参考文献の原典との一致 | 要約・分析・結論の正しさ |
| --- | --- | --- |
| 作成者以外による読み合わせ・品質のレビュー | 一部 | 一部 |
| 文献管理ツールで、登録した書誌から引用を作る | 一部 | 関係しない |
| 生成 AI を使ってよい作業とツールを、方針や契約で決める | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 関係しない |

読み合わせのレビューは、読んだ人が気づいた誤りは捉えるが、引用の 1 件ずつを原典に当たらなければ、体裁の整った架空の引用は通る。文献管理ツールは、登録した書誌から引用を作る分には書誌の形を保つが、登録した書誌そのものが誤っていれば、そのまま引用になる。AI を使う作業を方針で決めると、AI の文が入る場所は狭まるが、決めた範囲の中で作られた引用の中身は照合しない。Lemma は、引用の 1 件ごとに、原典の記録と結び付いているかを照合する。原典が実在しても、その要約や解釈が誤っている場合は照合を通る。

注：Lemma の照合が働くのは、納品する手続きに照合を組み込み、原典の記録（文献の書誌、判決の記録など）を執筆者やツールとは別の側で引ける場合に限る。原典の記録が無い資料（聞き取りや社内の文書）は、別の承認の記録で扱う。Lemma は文を書き直さず、公開した文書を取り下げもしない。分析や結論が正しいかを判断するのは、報告書を作り、受け取る組織の仕事である。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

外部に納品する・外部から受け取る報告書について、組織で確認する 3 項目

- 委託先が成果物に生成 AI を使う作業とツールを、発注の段で書面にしているか。
- 受け取った報告書を公開する前に、引用を少なくとも数件、原典と見比べて確認しているか。
- 報告書を差し替えたとき、どの版で何を直したかを記録し、読者に示しているか。

## 5. 事実と時系列

- **組織**: オーストラリアの雇用職場関係省（DEWR）が委託し、Deloitte が 2024 年 12 月から 2025 年 6 月にかけて、TCF のシステムの独立した評価を行った（省のページ）。発注書の日付は 2024-12-23（報告書）。
- **報告書**: 最終報告書は、評価の 4 つ目の節目（Milestone 4）で、日付は 2025-07-04（報告書）。省は、評価が挙げた急ぐ対応に着手したとしている（省のページ）。
- **差し替え**: 差し替え版の日付は 2025-09-26。注記は、前の版で誤りのあった引用と参考文献の項目を直し、Amato の訴訟の要約の誤りを直し、分かりやすさのために手を入れたとし、所見と勧告には影響しないとした（報告書）。省のページは、参考文献と脚注の少数の訂正のために更新し、7 月 4 日付の版に置き換えたと書く（省のページ）。
- **訴訟の要約**: 7 月の版は、Amato の訴訟を「[2021] FCA 1019」として、判事の言葉を段落の番号つきで引いていた。差し替え版は、事件の番号と日付（VID611/2019、2019-11-27）を書き、同意による命令の注記から引用し直している（2 つの版の PDF）。
- **報道された誤り**: 実在しない文献（大学の教授の著作とされた本など）と、連邦裁判所の判事の言葉とされた引用が、差し替え版で取り除かれた。省は、Deloitte が一部の脚注と参考文献の誤りを確認したと説明し、報告書の中身と勧告は変わらないとした（AP・CFO Dive の報道）。
- **AI の記載**: 差し替え版の付録 C と、方法を説明した章に、評価の一部の段で、省が契約した生成 AI（Azure OpenAI GPT-4o）によるツールを使ったとの記載がある（報告書）。7 月の版には、この記載は見当たらない（7 月の版の PDF）。
- **返金**: Deloitte は、契約の最後の支払い分を返すことに同意した（AP の報道）。返金は 9 万 7,000 豪ドルあまり（1,000 万円弱相当）と、省の広報が説明した（CFO Dive の報道）。契約の額は約 44 万豪ドル（4,400 万円ほど相当・同）。

### 時系列

- **2024-12-23**: 発注書の日付（報告書）。
- **2025-07-04**: 最終報告書の日付。
- **2025-08-14**: 省のページの作成日（省のページ）。
- **その後**: シドニー大学の研究者が誤りに気づき、報道機関に知らせる（AP の報道）。
- **2025-09-26**: 差し替え版の日付。
- **2025-10-03**: 省のページが差し替え版に更新される。
- **2025-10-07**: 最後の支払い分の返金が報じられる（AP の報道）。
- **2026-02-03**: 省のページによれば、報告書が再び更新され、9 月 26 日付の版に置き換わる。

> 本件の事実は、省のページ（Internet Archive の 2025-11-25 と 2026-10-07 の保存）と、報告書の 2 つの版の PDF（2025-07-04 付と 2025-09-26 付）に拠る。省のサイトは調べた時点で直接開けず、保存された写しで確認した。誤りの数と内容、研究者の指摘、返金の額は報道に拠る。報告書と省のページは、誤りのある引用がどの作業で作られたかを書いていない。本 Brief も、誤りを AI が作ったとは扱わない。2026 年 2 月の更新の内容は、省のページに書かれていない。誤りがどの段で入ったか、納品する前と受け取った後にどんな確認をしていたかは公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **省**: 差し替え版を掲載し、報告書の中身と勧告は変わらないとした。2026-02-03 に、さらに訂正した版に置き換えた（省のページ）。
- **Deloitte**: 差し替え版に更新の注記と、生成 AI のツールの記載を入れた（報告書）。問題は依頼主と直接解決したと述べた（AP の報道）。

## 6. Sources

- **オーストラリア雇用職場関係省（DEWR・一次・当事者）**: "Targeted Compliance Framework Assurance Review – Final Report"（ページ・2025-10-03 更新時の保存） — <https://web.archive.org/web/20251125121405/https://www.dewr.gov.au/assuring-integrity-targeted-compliance-framework/resources/targeted-compliance-framework-assurance-review-final-report>
- **オーストラリア雇用職場関係省（DEWR・一次・当事者）**: 同じページの 2026-02-03 更新後の保存 — <https://web.archive.org/web/20261007001244/https://www.dewr.gov.au/assuring-integrity-targeted-compliance-framework/resources/targeted-compliance-framework-assurance-review-final-report>
- **Deloitte／DEWR（一次・報告書）**: "Targeted Compliance Framework — Independent Review Final Report"（2025-09-26・差し替え版・付録 C） — <https://web.archive.org/web/20251006173740/https://www.dewr.gov.au/download/17099/targeted-compliance-framework-assurance-review-final-report/41163/targeted-compliance-framework-independent-review-final-report/pdf>
- **Deloitte／DEWR（一次・報告書）**: "Independent Review of the TCF – Final Report"（2025-07-04・最初の版） — <https://web.archive.org/web/20250816013629/https://www.dewr.gov.au/download/17099/targeted-compliance-framework-assurance-review-final-report/40749/targeted-compliance-framework-independent-review-final-report/pdf>
- **Korea JoongAng Daily（AP の配信・報道）**: "Deloitte to partially refund Australian government for report with apparent AI-generated errors"（2025-10-08） — <https://www.koreajoongangdaily.com/world/deloitte-to-partially-refund-australian-government-for-report-with-apparent-ai-generated-errors/12113870>
- **CFO Dive（報道）**: "Deloitte refunds over $60K for report with AI errors, Australian government says"（2025-10-21） — <https://www.cfodive.com/news/deloitte-refunds-60k-report-ai-errors-australian-government-accounting/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
