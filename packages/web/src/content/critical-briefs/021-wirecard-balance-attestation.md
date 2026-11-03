---
brief_no: 21
title: "Wirecard：残高を示す確認書類を、フィリピンの 2 行が偽造と通知し、同社は破綻を申請した(KPMG 特別監査・同社の開示)"
title_en: "Wirecard: two Philippine banks said the balance confirmations were forged, and the company filed for insolvency (KPMG special audit, company disclosure)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["kyc-aml-disclosure"]
incident_date: 2020-06-25
published: 2026-06-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "019-construction-engineer-qualification-fraud", "040-redd-carbon-credit-phantom-issuance", "006-google-api-key-revocation-lag", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "disclosure"
search_title: "Wirecard 破綻：19 億ユーロの残高確認書は偽造と通知"
search_description: "Wirecard は 2020 年 6 月、19 億ユーロが存在しない可能性が高いと開示し破綻を申請した。残高を示す書類はフィリピンの 2 行が偽造と通知。何が通ったか、開示の前に何を照合するか、対策を整理。"
og_lead_ja: "Wirecard が 19 億ユーロは存在しない可能性が高いと開示し破綻を申請。残高を示す書類は、フィリピンの 2 行が偽造と通知"
og_lead_en: "Wirecard disclosed that EUR 1.9 billion likely did not exist and filed for insolvency; two Philippine banks said the balance documents were forged"
og_kicker_ja: "企業破綻の事例 · 残高確認書"
og_kicker_en: "CORPORATE COLLAPSE · BALANCE LETTERS"
og_headline_ja: "残高を示す書類は、\n偽造と銀行が通知。\nWirecard は破綻。\n<accent>19 億ユーロ不在と開示</accent>"
og_headline_en: "Banks said the balance\nletters were forged.\nWirecard collapsed.\n<accent>EUR 1.9B likely not there</accent>"
key_figures:
  - value: "19 億"
    unit: "ユーロ"
    label: "信託口座にあるとされ、存在しない可能性が高いと Wirecard が開示した残高。貸借対照表の約 4 分の 1"
    tone: "alert"
  - value: "約 10 億"
    unit: "ユーロ"
    label: "KPMG の特別監査が、実在を確認できないとした海外口座の残高（2020-04）"
  - value: "06-16 → 06-25"
    label: "2 行が書類を偽造と通知してから、破綻の申請まで（2020 年）"
glossary:
  - term: "残高確認書（balance confirmation）"
    desc: "銀行が、ある時点の口座の残高を示す書類。監査で、現金の実在の根拠として使われる。"
  - term: "信託（エスクロー）口座"
    desc: "第三者（資金の管理者）が預かって管理する口座。Wirecard の 19 億ユーロは、この口座にあるとされた。"
  - term: "特別監査（forensic special audit）"
    desc: "通常の監査とは別に、疑いのある取引や残高を調べるために依頼する調査。"
  - term: "ad-hoc 開示"
    desc: "株価に影響しうる事実を、定期の報告を待たずにただちに公表する開示。"
insight:
  slug: "forwarded-letter-taken-as-balance"
  label: "届いた確認書を、残高の実在と見なす"
  quote: "残高確認書がどれほど整って見えても、発行元の銀行がその残高を示したかは、届いた書面の中身からは確認できない。"
industries: ["finance"]
operations: ["disclosure"]
controls:
  - slug: "ownership-check"
    item: "残高確認書を、発行元の銀行に直接確認する"
attack_method: "impersonation"
impact: "存在しない可能性が高いと開示された 19 億ユーロの残高"
takeaway: "現金残高の実在は、銀行が出したとされる確認書類を根拠に示され、フィリピンの 2 行はその書類を偽造と通知した。"
self_check: "残高や資産の確認書を受け付ける前に、発行元の金融機関がそれを出したかを、届いた書面とは別に照合しているか。"
countries: ["de"]
---

## 1. 要点

資金はフィリピンの 2 行（BDO・BPI）の信託口座にあるとされ、その実在は、銀行の名義の残高確認書で示されていた。報道と Wikipedia の集約によれば、確認書は第三者を経由して監査法人に届き、監査法人は銀行に直接照会せずにそれに依拠していたとされる。KPMG の特別監査と調査報道が、主張と実態の食い違いを外に見えるようにしたのは、長年の開示が市場に受け入れられた後だった。刑事の手続きは容疑の段階として報じられたもので、本 Brief は判決の内容を述べない。<strong>残高確認書がどれほど整って見えても、発行元の銀行がその残高を示したかは、届いた書面の中身からは確認できない。</strong>

## 2. 通った操作

- **通った操作**: 銀行の名義の残高確認書による、信託口座の現金残高の提示と、それを根拠にした監査済みの財務諸表としての開示。2020-06-16、フィリピンの 2 行は、19 億ユーロの残高を示すとされた書類を「偽造（spurious）」と監査法人 EY に通知した。
- **受け付けた側に届くもの**: 一般に、残高の確認で監査人に届くのは、銀行の名義の書面と、その書式・署名・金額である。書面が第三者を経由して届くと、発行元の銀行がその書面を出したかは、書面そのものには含まれない。報道と Wikipedia の集約は、EY が銀行に直接照会せず、転送された書面に依拠していたとする。
- **規制の範囲**: Wikipedia の集約によれば、規制当局 BaFin の権限は同社の銀行子会社に限られ、決済の本体や会計の実務には及ばなかった。
- **公表されていないこと**: 確認書類を誰がどの段で作り、どの経路で監査法人に届けたか。どの期の開示が、どの書類に依拠していたか。

## 3. 何を照合するか

経路を問わず区別できる条件は、残高を受け付ける側が、確認書を発行元の銀行が出したかを、届いた書面とは別に、開示や監査意見の前に照合することである。

- **誰が承認を出すか**: 資産を預かる金融機関（発行元の銀行）。残高が基準の額以上にあることを、発行元が自らの署名を付けて出す。資金の管理者や代理人を経由して転送される書面や、残高を開示する会社が自ら示す形では出さない。
- **どこで照合するか**: 監査で残高を受け付ける手前と、財務諸表として開示する手前。発行元の署名と、その残高が示された時点を照合する。照合できなければ、書面がどれほど整っていても、残高の実在の根拠として受け付けない。口座の番号や取引の明細は外に出さずに、基準の額以上にあることだけを示す形にもできる。
- **何が残るか**: どの残高を、どの発行元の署名で、いつ照合して受け付けたかの記録。後年に「当時、その残高はあったか」を問われたときに、監査人・規制当局・取引先が示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝残高を監査や開示の根拠として受け付ける前に、確認書を発行元の銀行が出したかを、届いた書面とは別に照合し、記録に残すこと。検知＝特別監査や調査報道、銀行からの通知で、後から気づくこと。下の日付は、監査報告・通知・開示が出た日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>受け付ける前に、発行元の銀行の署名を書面とは別に照合する</div>
<div class="rx-zone gapz"><b>監査報告・銀行・同社が示したこと</b><span>海外口座の残高約 10 億ユーロの実在を確認できない（KPMG）<br>残高を示す書類は偽造（フィリピンの 2 行）</span></div>
<div class="rx-zone det"><b>検知 · 長年の開示の後に働いた</b>調査報道と特別監査が食い違いを示し、銀行の通知で確定した</div>
<div class="rx-g g1"><div class="t">2020-04-28</div><b>KPMG の特別監査の報告</b></div>
<div class="rx-g g2"><div class="t">2020-06-16</div><b>2 行が書類を偽造と EY に通知</b></div>
<div class="rx-g g3"><div class="t">2020-06-22</div><b>存在しない可能性が高いと開示</b></div>
<div class="rx-g g4"><div class="t">2020-06-25</div><b>破綻を申請</b></div>
</div>
</figure>

検知は、疑いを外に示し、調査を進め、発覚の後に是正の範囲を決めるのに欠かせない。ただ、調査報道も特別監査も、確認書が受け付けられ、開示が市場に届いた後に働いた。受け付ける時点で、その書面が発行元の銀行の示した残高かどうかは、検知では変わらない。ある属性の申告が、照合されないまま受け付けられた事案に、[製品の型式指定の不正](https://lemma.frame00.com/ja/critical/briefs/020-type-designation-conformity-fraud/)、[技術者の資格の偽り](https://lemma.frame00.com/ja/critical/briefs/019-construction-engineer-qualification-fraud/)、[カーボンクレジットの発行](https://lemma.frame00.com/ja/critical/briefs/040-redd-carbon-credit-phantom-issuance/)がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、残高を監査や開示の根拠として受け付ける側に組み込む。** 偽造の書類を見つけるのではなく、残高が発行元の金融機関の署名付きで示されたものかを、受け付ける前に照合し、記録に残す。口座の原本を会社の外に出さずに、基準の額以上にあることだけを示す形にもできる。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 決済事業者、銀行、資金を預かる事業者と、その監査を担う監査法人。残高の実在は、財務諸表・上場の開示・取引先の与信の前提として受け入れられる。
- **業務 · 情報の開示・提供**: 監査済みの財務諸表や ad-hoc 開示として、資産の残高を規制当局・市場に示す業務。

### いまの対策と Lemma の違い

今回の経路は、両方の列にあたる。確認書が受け付けられ（1 列目）、その残高が監査済みの財務諸表として開示された（2 列目）。

| 対策 | 第三者を経由して届いた残高確認書の受け付け | 監査済みの残高の開示 |
| --- | --- | --- |
| 届いた書面の確認（書式・署名・金額のそろい） | 効かない | 関係しない |
| 発行元の銀行への直接の照会 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 一部 |

届いた書面の確認は、書面がどれほど整っていても、発行元がそれを出したかを含まないので効かない。銀行への直接の照会は、照会先が本物の銀行の窓口であれば働くが、照会先を届いた書面や第三者から得ていれば、同じ経路を通る。Lemma は、書面ではなく、発行元の署名を、受け付ける前に照合する。開示では、開示する残高に照合の記録があるかを照合できるが、記録の無い残高を開示から外すかは、開示の手順で決まる。

注：Lemma の照合が働くのは、発行元の金融機関が残高を署名付きで出し、監査と開示の手順にその照合を組み込んだ場合に限る。書面でしか受け付けない手続きは、照合の外に残る。発行元の銀行の中で、正しくない残高に署名が付けられた場合は、署名の照合では見分けられない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、不正や侵入を検出・防止するものではない。

### 点検チェックリスト

資産の残高を監査や開示の根拠として受け付ける組織で確認する 3 項目

- 残高確認書を、第三者を経由せず、発行元の金融機関から直接受け取る手順になっているか。
- 発行元への照会先を、届いた書面に書かれた連絡先ではなく、別に持つ記録から選んでいるか。
- どの残高を、どの発行元の確認で受け付けたかを、後から示せる形で記録しているか。

## 5. 事実と時系列

- **会社**: Wirecard AG。ドイツ・ミュンヘンの、DAX に上場していた決済の大手。2020-06-25 に破綻を申請した。
- **確認されたこと**: 信託（エスクロー）口座にあるとされた 19 億ユーロについて、同社は 2020-06-22 の ad-hoc 開示で「存在しない可能性が高い」とした。同社の貸借対照表の約 4 分の 1 にあたる。
- **残高の示し方**: 現金残高の実在は、フィリピンの 2 行（BDO・BPI）の名義の残高確認書で示されていた。2 行は 2020-06-16、その書類を偽造と EY に通知した。
- **監査**: 長年の監査法人は EY。報道と Wikipedia の集約は、当該の残高について EY が銀行に直接照会せず、転送された確認書面に依拠していたとする。
- **特別監査**: 同社が 2019-10 に依頼した KPMG の特別監査は、2020-04 の報告書で、約 10 億ユーロの海外口座の残高の実在を確認できないとした。
- **規制**: Wikipedia の集約によれば、規制当局 BaFin の権限は同社の銀行子会社に限られ、決済の本体や会計の実務には及ばなかった。
- **捜査**: ミュンヘン検察が経営陣を捜査し、CEO の Markus Braun 氏は虚偽会計・市場操作の容疑で逮捕されたと報じられた。

### 時系列

- **2019-10**: Wirecard が、外部からの会計の疑いを受けて、KPMG に特別監査（forensic special audit）を依頼する。
- **2020-04-28**: KPMG の特別監査の報告書が公表される。約 10 億ユーロの海外口座の残高について、実在を確認できないとした。
- **2020-06-05**: ミュンヘン検察が、CEO の Markus Braun 氏ら経営陣を捜査し、本社を捜索する。
- **2020-06-16**: フィリピンの 2 行（BPI・BDO）が、19 億ユーロの残高を示すとされた書類は「偽造（spurious）」と EY に通知する。
- **2020-06-18**: Wirecard が、19 億ユーロが「行方不明」と公表する。COO の Jan Marsalek 氏を停職にする。
- **2020-06-19**: Braun 氏が CEO を辞任する。
- **2020-06-22**: 当該の残高が「存在しない可能性が高い」と ad-hoc 開示する。
- **2020-06-23**: Braun 氏が、虚偽会計・市場操作の容疑で逮捕される。
- **2020-06-25**: Wirecard AG が破綻を申請する。

> 事実は KPMG の特別監査の報告書、同社の開示、Wikipedia の集約と、Financial Times・CNN Business・Reuters の報道に拠る。書類が偽造であるとしたのはフィリピンの 2 行の通知で、経営陣の逮捕は容疑によるものとして報じられた。監査の手続きについての記述は報道と集約に拠り、本 Brief は監査法人や個人の落ち度を認定するものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **捜査・会社**: ミュンヘン検察が経営陣を捜査し、CEO を逮捕した。Wirecard は破綻し、上場は廃止された。BaFin の権限が決済の本体に及ばなかったことは、欧州の資本市場の監督のあり方をめぐる論点になった。
- **監査・ガバナンス**: 残高を銀行へ直接照会する手続きの実効性、第三者を経由した確認書面への依拠、内部統制と外部監査の限界が、国際的なコーポレートガバナンスの論点として議論された。
- **制度の動き**: 資産の実在や準備金を、書面の自己申告ではなく、外から照合できる形で示すことを求める要請が、金融と暗号資産の双方で強まっている。

## 6. Sources

- **KPMG 特別監査報告書（一次情報）**: "Report concerning the Independent Special Investigation — Wirecard AG, Munich"（2020-04-28、海外口座残高の実在を確認できない旨）— https://www.wirecard.com/uploads/Bericht_Sonderpruefung_KPMG_EN_200501_Disclaimer.pdf
- **Wikipedia（二次情報・経緯の集約）**: "Wirecard scandal"（19 億ユーロ、信託口座、EY・BaFin の関与、破綻の経緯）— https://en.wikipedia.org/wiki/Wirecard_scandal
- **報道（二次情報）**: 2020-06 の破綻に至る時系列（フィリピン 2 行の偽造通知、経営陣の辞任・逮捕、破綻申請）— Financial Times / CNN Business / Reuters

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
