---
brief_no: 184
title: "シンガポールの商品取引会社：仕入先に似せたアドレスのメールに応じ、東ティモールの新しい口座へ送金した(シンガポール警察の発表)"
title_en: "Singapore commodity firm: Following an email from a lookalike supplier address, it paid a new account in Timor-Leste (Singapore Police Force release)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-07-19
published: 2026-11-05
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["163-liberty-lookalike-domain-vendor-payment", "170-zephyr-energy-contractor-payment-diverted", "177-ovid-therapeutics-partner-email-compromise-payment", "174-mobile-alabama-arena-contractor-bank-change"]
status: published
version: "1.0"
og_lead_ja: "シンガポールの商品取引会社、仕入先に似せたアドレスのメールで東ティモールの新しい口座へ 4,230 万ドルを送金"
og_lead_en: "A Singapore commodity firm wired $42.3M to a new Timor-Leste account on a lookalike supplier email"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE EMAIL"
og_headline_ja: "仕入先に似せたメールで、\n新しい口座へ送金した。\n<accent>4,230 万ドル</accent>"
og_headline_en: "Paid a new account on a\nlookalike supplier email.\n<accent>$42.3M wired.</accent>"
key_figures:
  - value: "4,230"
    unit: "万ドル"
    label: "仕入先を装うメールに応じて、東ティモールの新しい口座へ送金した額（約 66 億円相当・シンガポール警察の発表）"
    tone: "alert"
  - value: "07-19 → 07-23"
    label: "送金してから、本物の仕入先の知らせで気づき、警察に届け出るまで（警察の発表）"
  - value: "07-23 → 07-24"
    label: "届け出から、東ティモールの口座で 3,900 万ドルが凍結されたと知らせを受けるまで（警察の発表）"
glossary:
  - term: "ビジネスメール詐欺（BEC）"
    desc: "取引先や経営者を装ったメールで、支払いや口座の変更を依頼する詐欺。警察の発表はこの言葉（Business Email Compromise）を使っている。"
  - term: "I-GRIP"
    desc: "INTERPOL（国際刑事警察機構）の、国をまたいで支払いを素早く止めるための仕組み。2022 年に始まった（INTERPOL）。"
insight:
  slug: "new-account-lookalike-sender"
  stop: true
  label: "新しい口座、似せた送り主"
  quote: "送金の前に、依頼の新しい口座を、届いたメールではなく仕入先の登録済みの連絡先で照合する。"
industries: ["supply-chain"]
operations: ["payment-change", "approval"]
controls:
  - slug: "ownership-check"
    item: "支払いの依頼に書かれた新しい口座を、仕入先の登録済みの連絡先で照合してから送金に使う"
  - slug: "hold-unverified"
    item: "登録済みの連絡先で照合できない新しい口座への送金は保留にする"
  - slug: "audit-trail"
    item: "どの依頼の口座を、誰が、何で照合して送金したかを残す"
attack_method: "impersonation"
impact: "仕入先を装うメールに応じて、東ティモールの新しい口座へ 4,230 万ドルを送金した（うち 3,900 万ドルが凍結された）"
takeaway: "仕入先のアドレスに似せたメールが、代金を国外の新しい口座へ払うよう求め、4,230 万ドルが送られた。依頼に書かれた新しい口座は、仕入先の登録済みの連絡先で照合してから送金に使う。"
self_check: "仕入先から新しい口座への支払いを求められたとき、その口座を仕入先の登録済みの連絡先で照合してから送金しているか。"
countries: ["sg"]
search_title: "シンガポールのBEC詐欺：4,230万ドル送金と回収の経緯"
search_description: "シンガポールの商品取引会社が、仕入先に似せたアドレスのメールに応じ、東ティモールの口座へ 4,230 万ドル（約 66 億円相当）を送金した（シンガポール警察）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. 要点

警察によれば、メールは仕入先を名乗り、品物の代金を新しい口座へ払うよう求めていた。送り主のアドレスは仕入先のものと 1 文字だけ違い、社員は気づかなかった。

会社が気づいたのは、本物の仕入先が代金を受け取っていないと知らせてからだった。資金の大半は国をまたいだ協力で凍結されたが、送金そのものは通っている。

<strong>新しい口座への支払いは、その口座を仕入先の登録済みの連絡先で照合しない限り、似せたアドレスからの依頼でも通る。</strong>

## 2. 通った操作

- **通った操作**: 仕入先への品物の代金として実行された送金。送り先は、メールで指定された東ティモールの銀行の新しい口座で、額は 4,230 万ドルだった（シンガポール警察の発表）。INTERPOL は、依頼を、未払いの支払いを新しい口座へ送るよう求めるものだったとしている。
- **受け付けた側に届くもの**: 一般に、支払う側には、仕入先の名前、送り主のアドレス、代金の中身、送り先の口座が届く。アドレスが 1 文字だけ違うと、表示を見るだけでは見分けにくい。警察によれば、社員はこの違いに気づかなかった。
- **公表されていないこと**: 会社と仕入先の名前。依頼の額が、実際の取引の額と同じだったか。新しい口座への支払いを、誰がどの手順で承認したか。攻撃者が取引と仕入先をどう知ったか（仕入先や会社の側のメールが侵害されたか）。最終的に会社へ戻った額と時期。

## 3. 実行前の照合

経路を問わず区別できる条件は、依頼に書かれた新しい口座を仕入先が承認したかを、届いたメールではなく仕入先の登録済みの連絡先で、送金の前に照合することである。

- **誰が承認を出すか**: 仕入先。口座を新しく使うときや変えるときに、登録済みの連絡先（依頼のメールに書かれた連絡先ではない）で、その口座を承認する。
- **どこで照合するか**: 送金を実行する前の承認の手順。依頼の口座が登録済みの口座と違えば、仕入先の承認と照合できるまで送金を保留する。代金の中身の確認とは別に照合する。
- **何が残るか**: どの依頼の口座を、誰が、どの連絡先で照合して送金に使ったかの記録。回収や捜査、保険、監査で、何を照合して送ったかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝依頼に書かれた新しい口座を送金に使う前に、仕入先の登録済みの連絡先で承認されたものかを照合し、記録に残すこと。検知＝送金の後に、仕入先が代金を受け取っていないと知ること。日付はシンガポール警察の発表に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>新しい口座を、仕入先の登録済みの連絡先で照合してから送金する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>4,230 万ドルが新しい口座へ送られた<br>3,900 万ドルが凍結された</span></div>
<div class="rx-zone det"><b>検知 · 送金の後に働いた</b>本物の仕入先が未着を知らせ、会社が警察に届け出る</div>
<div class="rx-g g1"><div class="t">07-15</div><b>仕入先に似せたアドレスからメールが届く</b></div>
<div class="rx-g g2"><div class="t">07-19</div><b>新しい口座へ送金する</b></div>
<div class="rx-g g3"><div class="t">07-23</div><b>本物の仕入先の知らせで気づき、届け出る</b></div>
<div class="rx-g g4"><div class="t">07-24</div><b>東ティモールの口座で凍結される</b></div>
</div>
</figure>

気づいたのは、送金から 4 日後だった。同じように、取引先に似せたアドレスからの請求に応じた事案に、[米リバティ市](https://lemma.frame00.com/ja/critical/briefs/163-liberty-lookalike-domain-vendor-payment/)（本物の債務と同じ額の請求に約 60 万ドルを送金）がある。今回は、送金の額がその 70 倍ほどで、依頼そのものが国外の新しい口座を指していた。また、送金の数日後に、国をまたいだ協力で資金の大半が凍結された。取引先への支払いが別の口座へ向いた事案には、[英 Zephyr Energy](https://lemma.frame00.com/ja/critical/briefs/170-zephyr-energy-contractor-payment-diverted/) と [Ovid Therapeutics](https://lemma.frame00.com/ja/critical/briefs/177-ovid-therapeutics-partner-email-compromise-payment/)（開発パートナー側のメールの乗っ取り）もある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、支払いの依頼に基づいて送金する側に組み込む。** なりすましのメールを見つけるのではなく、依頼に書かれた口座が、仕入先の登録済みの連絡先で承認されたものかを、送金の前に照合する。

### 注意したい業界・業務

- **業界 · 調達・サプライチェーン**: 商品の取引のように、国外の仕入先へ、1 回にまとまった額を払う会社。支払いの依頼がメールで届き、送り先が国をまたぐことがある。
- **業務 · 振込先・口座の変更**: 支払いの依頼とともに届く、新しい口座の指定。
- **業務 · 承認・決裁**: 仕入先への代金の送金の承認。

### いまの対策と Lemma の違い

今回の経路は 1 列目（仕入先に似せたアドレスから届いた、新しい口座への支払いの依頼）である。2 列目は、仕入先の本物のメールが乗っ取られて同じ依頼が届く場合で、今回そうだったという公表は無い。3 列目は、仕入先の登録済みの連絡先そのものが乗っ取られている場合である。

| 対策 | 似せたアドレスからの依頼 | 本物のメールからの依頼 | 登録済みの連絡先の乗っ取り |
| --- | --- | --- | --- |
| 送り主のアドレスの確認（表示を見る） | 一部 | 効かない | 効かない |
| 代金の中身の確認 | 一部 | 一部 | 効かない |
| 銀行と捜査機関による送金の後の凍結と回収 | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 効かない |

送り主のアドレスの確認は、1 文字の違いを見落とすことがあり、警察によれば今回も気づかれなかった。本物のメールが乗っ取られていれば、アドレスに違いは無い。代金の中身の確認は、依頼が実際の取引に沿っていれば、中身からは見分けにくい（今回の依頼の中身は公表されていない）。銀行と捜査機関による凍結と回収は送金の後の手段で、送金そのものは止めない（今回は送金の後に資金の大半が凍結された）。Lemma は、アドレスや代金の中身ではなく、依頼に書かれた口座を、仕入先の登録済みの連絡先での承認と、送金の前に照合する。

注：Lemma の照合が働くのは、送金の前の承認の手順に照合を組み込み、仕入先の承認を、依頼のメールとは別に管理する登録済みの連絡先や鍵で受ける場合に限る。登録済みの連絡先そのものが乗っ取られている場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではなく、送った資金を凍結・回収するものでもない。

### 点検チェックリスト

仕入先への送金について、組織で確認する 3 項目

- これまでと違う国や銀行の口座への初めての送金を、照合が済むまで保留にしているか。
- 支払いの依頼のメールのアドレスを、仕入先の登録済みのアドレスと仕組みで照合しているか。
- 送金の後に誤りが分かったとき、すぐ銀行と警察に届け出る手順が決まっているか。

## 5. 事実と時系列

- **当事者**: シンガポールの商品取引会社（名前は公表されていない）。
- **起きたこと**: 仕入先から来たように見えるメールが、品物の代金を東ティモールの銀行の新しい口座へ払うよう求めた。送り主のアドレスは仕入先のものと 1 文字だけ違い、社員は気づかなかった。会社は 4,230 万ドルをその口座へ送った。
- **気づいた経緯**: 本物の仕入先が、代金を受け取っていないと知らせた。会社は同じ日に警察に届け出た。
- **影響と回収**: 警察が、東ティモールの当局と INTERPOL に連絡し、東ティモールの口座で 3,900 万ドルが凍結された。東ティモールの当局は、さらに 200 万ドル超を回収し、のちに計 7 人を逮捕した。警察は、反詐欺センターが東ティモールの当局と INTERPOL と協力して計 4,000 万ドル超を回収したとし、会社へ資金を戻す手続きを進めているとした。

### 時系列

- **2024-07-15**: 会社の社員が、仕入先から来たように見えるメールを受け取る。代金を東ティモールの新しい口座へ払うよう求めていた。
- **2024-07-19**: 会社が 4,230 万ドルをその口座へ送る。
- **2024-07-23**: 本物の仕入先が、代金を受け取っていないと知らせる。会社が警察に届け出る。警察は、東ティモールの当局と INTERPOL に連絡し、I-GRIP の仕組みを使う。
- **2024-07-24**: 警察の反詐欺センターが、東ティモールの口座で 3,900 万ドルが凍結されたと知らせを受ける。
- **2024-07-25**: 東ティモールの当局が、逮捕と、200 万ドル超の回収を知らせる。
- **2024-08-03**: シンガポール警察が、事案と回収を発表する。
- **2024-08-06**: INTERPOL が、事案と回収を発表する。

> 本件の事実は、シンガポール警察の発表（一次）と INTERPOL の発表（一次）に拠る。凍結の知らせの日は警察の発表の 7 月 24 日とした（INTERPOL の発表の本文には 25 日とある）。会社と仕入先の名前、依頼の額が実際の取引と同じだったか、会社の承認の手順、最終的に戻った額と時期は公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **シンガポール警察**: 商業犯罪捜査局の局長は、詐欺は世界の脅威で、世界での対応が要るとし、INTERPOL と東ティモールの当局に謝意を示した。
- **東ティモールの当局**: 科学警察・犯罪捜査局、国家情報局、金融情報機関などが捜査し、計 7 人を逮捕した（警察の発表）。
- **INTERPOL**: I-GRIP は、加盟国の警察の網を使って、金融犯罪での支援の依頼を速めるための仕組みだとしている。

## 6. Sources

- **Singapore Police Force（一次・警察の発表）**: "International Cooperation Leading To The Biggest Recovery Of Over USD 40 Million Linked To Business Email Compromise Scam"（2024-08-03） — <https://www.police.gov.sg/media-hub/news/2024/20240803_international_cooperation_leading_to_the_biggest_recovery_of_over_usd_40_mil>
- **INTERPOL（一次・国際刑事警察機構の発表・フランス語版）**: "La police récupère plus de 40 millions d’USD à la suite d’une escroquerie internationale par courriel"（2024-08-06） — <https://www.interpol.int/fr/Actualites-et-evenements/Actualites/2024/La-police-recupere-plus-de-40-millions-d-USD-a-la-suite-d-une-escroquerie-internationale-par-courriel>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
