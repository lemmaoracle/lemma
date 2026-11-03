---
brief_no: 35
title: "Boeing：787 で完了と記録された必須の検査の一部が、実施されていなかったと FAA に報告した(報道)"
title_en: "Boeing: told the FAA that some mandatory 787 inspections recorded as complete had not been performed (reporting)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2024-05-06
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["041-aog-technics-forged-airworthiness-certificates", "020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "none"
og_lead_ja: "報道によれば、Boeing は 787 の主翼と胴体の接合部で、完了と記録された必須の検査の一部が実施されていなかったと FAA に報告。FAA が調査を開始"
og_lead_en: "According to reporting, Boeing told the FAA that some mandatory inspections at the 787 wing-to-body join, recorded as complete, had not been performed; the FAA opened an investigation"
og_kicker_ja: "検査の記録 · 航空機の製造"
og_kicker_en: "INSPECTION RECORDS · AIRCRAFT"
og_headline_ja: "未実施の検査が完了と\n記録されていたと\nBoeing が報告。\n<accent>約 450 機</accent>"
og_headline_en: "Inspections logged as\ndone were not performed,\nBoeing reported.\n<accent>~450 aircraft.</accent>"
key_figures:
  - value: "約 450"
    unit: "機"
    label: "対象とされた 787（関係筋・報道）"
    tone: "alert"
  - value: "約 60"
    unit: "機"
    label: "うち Boeing の製造ラインにある機体（報道）"
  - value: "2024-04 → 05-06"
    label: "Boeing の FAA への報告 → FAA の調査開始の公表（報道）"
glossary:
  - term: "主翼と胴体の接合部（wing-to-body join）"
    desc: "航空機の主翼を胴体に取り付ける部分。多数のファスナーで結合される。"
  - term: "ボンディング・接地の確認"
    desc: "接合部のファスナーが電気的につながり、落雷などの電流に対して機体が適切に接地されているかを確認する安全検査。"
  - term: "FAA（米国連邦航空局）"
    desc: "米国で航空機の製造・運航の安全を監督する当局。"
insight:
  slug: "completion-record-without-act"
  label: "実施と結び付かない完了の記録"
  quote: "検査の完了の記録は、実施を示す測定や作業の記録と、次の工程に渡す前に照合する段が無ければ、記録があるだけで「検査済み」として通る。"
industries: ["manufacturing"]
operations: ["approval"]
controls:
  - slug: "audit-trail"
    item: "検査記録に、実際に検査した人・時刻・測定結果を残す"
impact: "約 450 機が対象（関係筋）"
takeaway: "完了と記録された必須の検査の一部が実施されていなかったことは、Boeing の FAA への報告から外に見えた（報道）。"
search_title: "Boeing 787 検査記録の問題：未実施の検査が完了と記録"
search_description: "報道によれば、Boeing は 787 の主翼と胴体の接合部の必須の検査の一部が、完了と記録されながら実施されていなかったと FAA に報告し、FAA が調査を始めた。何が通ったか、何を照合するか、対策を整理。"
self_check: "検査を「完了」と記録するとき、その記録が実施を示す測定の記録と合うかを、次の工程に渡す前に照合する仕組みがあるか。"
countries: ["us"]
---

## 1. 要点

報道によれば、Boeing は、記録の上では完了とされていた主翼と胴体の接合部の必須の検査の一部が、実際には実施されていなかったと FAA に報告し、記録が実態と異なっていたことを認めた。この検査は、接合部のファスナーの電気的なボンディング・接地を確認し、落雷などの電流に対して機体が適切に接地されていることを担保するものである。記録と実施が食い違っていたことは、記録の上ではなく、Boeing の報告によって外に見えた。<strong>完了の記録は、実施を示す測定や作業の記録と、次の工程に渡す前に照合する段が無ければ、記録があるだけで「検査済み」として通る。</strong>

## 2. 通った操作

- **通った操作**: 報道によれば、実施されていない必須の検査が「完了」として記録され、その記録のまま機体が製造の工程を進んだ。対象は 787 の主翼と胴体の接合部のボンディング・接地の確認である。
- **受け付けた側に届くもの**: 一般に、次の工程や品質の部門に届くのは、検査が完了したという記録である。記録の項目がそろっていれば、記録だけからは、検査が実際に行われたかを見分けにくい。
- **検知の経路**: 2024 年 4 月、Boeing が FAA に、完了と記録された一部の検査が実施されていなかった可能性を自主的に報告した（報道）。FAA は 2024-05-06 に調査の開始を公表した。
- **公表されていないこと**: 参照した報道には、検査の記録がどの仕組みで作られ、どの点検を経ていたか、記録と実施の食い違いが社内でどのように見つかったかは書かれていない。

## 3. 何を照合するか

経路を問わず区別できる条件は、検査の完了の記録が、記録した人の申告とは別に、その検査が実施されたことを示す測定や作業の記録と合うかを、次の工程に渡す前に照合することである。

- **誰が承認を出すか**: 検査を実施した人と、測定に使った機器。誰が・いつ・どの箇所を測り、どんな結果だったかを、測定の記録として出す。完了の記録を作る側が、完了の根拠を自らの申告だけで出す形にしない。
- **どこで照合するか**: 検査の完了を記録するときと、機体を次の工程・出荷に渡す直前。完了の記録を、測定の記録と照らし、合うかを照合する。照合できない検査は、確認できるまで完了として扱わず、次の工程に渡さない。
- **何が残るか**: どの機体のどの検査を、誰が・いつ・どの測定の記録で完了としたかを、機体ごとに。後から書き換えられない形で、記録を作った部門の外に残す。再検査が必要になったとき、該当する機体を絞る手がかりになる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝検査を完了と記録し、次の工程に渡す前に、完了の記録を実施を示す測定の記録と照合し、記録に残すこと。検知＝記録のあとに、報告・調査・再検査から気づくこと。日付は報道に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>完了の記録を、次の工程に渡す前に測定の記録と照合する</div>
<div class="rx-zone gapz"><b>報道が示したこと</b><span>記録の上では完了とされた必須の検査<br>その一部が実施されていなかったと Boeing が報告</span></div>
<div class="rx-zone det"><b>検知 · 記録のあとに働いた</b>Boeing が FAA に報告し、FAA が調査を始め、製造ライン上の機体の再検査が求められた</div>
<div class="rx-g g1"><div class="t">2024-04 以前</div><b>必須の検査が完了と記録される</b></div>
<div class="rx-g g2"><div class="t">2024-04</div><b>Boeing が FAA に報告</b></div>
<div class="rx-g g3"><div class="t">2024-05-06</div><b>FAA が調査の開始を公表</b></div>
<div class="rx-g g4"><div class="t">2024-05 以降</div><b>製造ライン上の全 787 を再検査</b></div>
</div>
</figure>

検知は、記録と実施の食い違いを外から見えるようにし、再検査と就航中の機体への対応を進める。完了を記録する前の照合とは、別に働く。規制で求められる属性が、それを示す書類のまま受け付けられた事案に、[Brief 041](https://lemma.frame00.com/ja/critical/briefs/041-aog-technics-forged-airworthiness-certificates/)（部品の証明書）、[Brief 020](https://lemma.frame00.com/ja/critical/briefs/020-type-designation-conformity-fraud/)（製品の適合の属性）、[Brief 019](https://lemma.frame00.com/ja/critical/briefs/019-construction-engineer-qualification-fraud/)（人の資格の属性）、[Brief 021](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（残高の属性）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、検査の完了を記録する手順と、機体を次の工程に渡す手順に組み込む。** 検査の不備を検出したり、機体を検査したりするのではなく、完了の記録が、誰が・いつ・何を測ったかの測定の記録と合うかを、記録を作る部門の外で照合し、記録に残す。測定値などの細かな情報を外に出さずに、照合が済んだことだけを示す形にもできる。

### 注意したい業界・業務

- **業界 · 製造・基幹インフラ**: 航空機など、安全に直結する製品を、検査の記録を根拠に次の工程・出荷へ進める組織。
- **業務 · 承認・決裁**: 検査の完了の記録をもとに、次の工程への引き渡しや出荷を決める業務。

### いまの対策と Lemma の違い

今回、報道が示した経路は 1 列目と 2 列目にあたる。3 列目は、食い違いが分かったあとの段である。

| 対策 | 検査の完了の記録 | 次の工程・出荷への引き渡し | 再検査が要る機体の特定 |
| --- | --- | --- | --- |
| 書類・記録の点検（記録がそろっているか） | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 一部 | 効く | 一部 |

記録の点検は、記録の欠けや記載の不備は見つけられるが、項目のそろった記録が実際の検査に裏づけられているかは分からない。Lemma は、完了の記録を、次の工程に渡す前に測定の記録と照らし、照合できない機体を渡さない。ただし、照合できるのは記録どうしが合うかで、作業が正しく行われたかそのものではない。再検査が要る機体の特定では、どの機体のどの検査を、どの測定の記録で完了としたかをたどれるが、照合を組み込む前に記録された検査には、その記録が無い。

注：Lemma の照合が働くのは、検査の完了の記録と引き渡しの手順に照合を組み込み、測定の記録が、完了の記録を作る側の外で残る場合に限る。測定の記録そのものが誤っていれば、誤ったものも通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、不正や侵入を検出・防止するものではない。

### 点検チェックリスト

検査の記録を根拠に、製品を次の工程・出荷へ進める組織で確認する 3 項目

- 測定の記録と照合できない検査を、確認できるまで完了として扱わず、次の工程に渡さない手順があるか。
- どの製品のどの検査を、誰が・いつ・どの測定の記録で完了としたかを、後から確認できるか。
- 記録と実施の食い違いが分かったとき、再検査が要る製品を、記録からすぐに絞り込めるか。

## 5. 事実と時系列

- **対象**: Boeing 787 Dreamliner の主翼と胴体の接合部（wing-to-body join）の、ボンディング・接地の確認の検査。
- **検査の意味**: 主翼と胴体を接合するファスナーの電気的なボンディング・接地を確認し、落雷などの電流に対して機体が適切に接地されていることを担保する安全検査。
- **報告された内容**: 報道によれば、記録の上では完了とされていた必須の検査の一部が、実際には実施されていなかった。Boeing は 2024 年 4 月に FAA へ自主的に報告し、記録が実態と異なっていたことを認めた。
- **規模**: 関係筋によれば、対象は約 450 機（うち約 60 機は Boeing の製造ラインにある機体）。

### 時系列

- **2024-04**: Boeing が FAA に対し、記録の上で完了とされた一部の 787 の検査が実施されていなかった可能性を自主的に報告する。
- **2024-05-06**: FAA が調査の開始を公表する。Boeing は、検査の記録が実態と異なっていたことを認める。
- **2024-05 以降**: Boeing が製造ライン上の全 787 を再検査する。就航中の機体への対応計画の策定が求められる。

> 事実は、The Seattle Times・The Washington Post・NPR・CBS News の報道に拠る。対象の機数は、報道が伝えた関係筋の数字である。本 Brief は、記録に関わった個人の動機や、Boeing・FAA の対応の当否を論じるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Boeing**: FAA に自主的に報告し、製造ライン上の全 787 を再検査した（報道）。
- **FAA**: 2024-05-06 に調査の開始を公表した。Boeing に、製造ライン上の全 787 の再検査と、就航中の機体への対応計画の策定を求めた（報道）。

## 6. Sources

- **The Seattle Times**: "FAA opens new investigation into Boeing 787 wing-to-body join work"(2024-05、検査内容・規模・FAA 対応)— https://www.seattletimes.com/business/boeing-aerospace/faa-opens-new-investigation-into-boeing-787-wing-to-body-join-work/
- **The Washington Post**: "FAA investigating whether Boeing falsified 787 inspections"(2024-05-06)— https://www.washingtonpost.com/transportation/2024/05/06/faa-boeing-787-inspections/
- **NPR**: "FAA is investigating Boeing for apparent missed inspections on 787 Dreamliner"(2024-05-06)— https://www.npr.org/2024/05/06/1249432229/faa-investigation-boeing-787-dreamliner
- **CBS News**: "FAA investigates Boeing for falsified records on some 787 Dreamliners"(2024-05)— https://www.cbsnews.com/news/boeing-787-dreamliners-faa-falsified-records/

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
