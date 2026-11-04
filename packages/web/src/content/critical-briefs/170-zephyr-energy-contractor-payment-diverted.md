---
brief_no: 170
title: "Zephyr Energy：契約先への支払い 1 件が、第三者の口座へ流用された(同社の開示)"
title_en: "Zephyr Energy: A single payment meant for a contractor was diverted to a third-party account (company disclosure)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-04-09
published: 2026-11-02
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["158-portland-water-bureau-vendor-bank-change", "163-liberty-lookalike-domain-vendor-payment", "032-booking-payout-account-tampering"]
status: draft
version: "1.0"
og_lead_ja: "英 Zephyr Energy、米子会社で契約先への支払い 1 件が流用され約 70 万ポンドが第三者の口座へ"
og_lead_en: "Zephyr Energy: one contractor payment at a US subsidiary diverted, ~£700K sent to a third-party account"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "サイバー攻撃事例 · 支払いの流用"
og_kicker_en: "CYBERATTACK · PAYMENT DIVERSION"
og_headline_ja: "契約先への支払いが、\n別の口座へ送られた。\n<accent>約 70 万ポンド</accent>"
og_headline_en: "A contractor payment was\nsent to someone else.\n<accent>About £700K diverted.</accent>"
key_figures:
  - value: "約 70"
    unit: "万ポンド"
    label: "契約先への支払いとして、第三者の口座へ送られた額（同社の開示）"
    tone: "alert"
  - value: "1 件"
    label: "流用された支払いの数。契約先への支払い 1 件だった（同社の開示）"
  - value: "非公表"
    label: "手口・支払いの日・発見の日・回収できたか（同社の開示に無い）"
glossary:
  - term: "RNS"
    desc: "ロンドン証券取引所の適時開示の仕組み。上場会社が、株価に影響しうる事実を公表するのに使う。"
  - term: "支払いの流用"
    desc: "本来の受け取り手に向けた支払いが、別の口座に送られること。手口（請求書の書き換え、連絡の乗っ取りなど）は事案ごとに違う。"
insight:
  slug: "right-payee-not-checked"
  stop: true
  label: "支払いは正しく、受け手が違う"
  quote: "支払いの前に、振込先の口座を、支払いの依頼や請求書ではなく取引先の登録済みの口座と照合する。"
industries: ["supply-chain"]
operations: ["payment-change", "approval"]
controls:
  - slug: "hold-unverified"
    item: "振込先の口座が、取引先の登録済みの情報と照合できるまで、支払いを保留する"
  - slug: "audit-trail"
    item: "どの支払いを、どの口座へ、何で照合して送ったかを残す"
impact: "契約先への支払い 1 件が流用され、約 70 万ポンドが第三者の口座へ送られた"
takeaway: "本物の取引先への支払い 1 件が、第三者の口座へ送られた。支払いの前に、振込先の口座が取引先の登録済みの情報と一致するかを照合する。"
self_check: "取引先への支払いの前に、振込先の口座が、その取引先の登録済みの口座と一致するかを照合しているか。"
countries: ["gb", "us"]
search_title: "Zephyr Energy の支払い流用：約70万ポンドの経緯"
search_description: "英 Zephyr Energy の米子会社で、契約先への支払い 1 件が第三者の口座へ流用され、約 70 万ポンドが送られた（同社の開示）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. 要点

米国の子会社で、本物の契約先に向けた支払いが、第三者の口座へ送られた（同社の開示）。

同社は、技術と支払いの仕組みに業界標準の手順を使っていたとしている。手口と、支払いがどの段階で別の口座に向いたかは公表されていない。

<strong>支払いそのものが本物の取引に基づいていても、振込先の口座がその取引先のものかを照合しなければ、支払いは別の口座へ通る。</strong>

## 2. 通った操作

- **通った操作**: 契約先への支払いとして実行された送金。振込先は第三者の口座で、約 70 万ポンドが送られた（Zephyr Energy の開示）。
- **受け付けた側に届くもの**: 一般に、支払いを実行する側には、取引先の名前、額、振込先の口座が届く。振込先の口座が差し替わっていても、名前と額が本物の取引と同じなら、中身からは見分けがつかない。
- **公表されていないこと**: 手口と侵入の経路。支払いの日と、発見の日。契約先と、受け取った口座の名前。どの子会社か。回収できたか。データが取られたか。同社は、事案を「高度な」ものとしている。

## 3. 何を照合するか

経路を問わず区別できる条件は、振込先の口座を、取引先の登録済みの口座と、支払いの前に照合することである。

- **誰が承認を出すか**: 取引先。口座を新しく登録するときや変えるときに、登録済みの連絡先（支払いの依頼や請求書に書かれた連絡先ではない）で、その口座を承認する。
- **どこで照合するか**: 支払いを実行する前の承認の手順。振込先の口座が取引先のものかは、支払いの中身（名前と額）の確認とは別に照合する。登録済みの口座と照合できない支払いは、保留にする。
- **何が残るか**: どの支払いを、どの口座へ、何で照合して送ったかの記録。回収や捜査、保険で、何を照合して送ったかを示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝支払いの前に、振込先の口座を取引先の登録済みの口座と照合し、記録に残すこと。検知＝支払いの後に流用に気づくこと。支払いの日と発見の日は公表されていない。日付は同社が開示した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>支払いの前に、振込先の口座を、取引先の登録済みの口座と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>契約先への支払い 1 件が流用された<br>約 70 万ポンドが第三者の口座へ</span></div>
<div class="rx-zone det"><b>検知 · 支払いの後に働いた</b>流用に気づき、法執行機関に届ける</div>
<div class="rx-g g1"><div class="t">支払い</div><b>契約先への支払い 1 件（日付は非公表）</b></div>
<div class="rx-g g2"><div class="t">流用</div><b>第三者の口座へ送られる</b></div>
<div class="rx-g g3"><div class="t">発見</div><b>法執行機関に届ける（日付は非公表）</b></div>
<div class="rx-g g4"><div class="t">04-09</div><b>同社が開示する</b></div>
</div>
</figure>

流用に気づいたのは、支払いが通った後だった。同じように、本物の取引先への支払いが別の口座へ向いた事案に、[米ポートランド市水道局](https://lemma.frame00.com/ja/critical/briefs/158-portland-water-bureau-vendor-bank-change/)（取引先の口座の変更の依頼に応じた）と、[米リバティ市](https://lemma.frame00.com/ja/critical/briefs/163-liberty-lookalike-domain-vendor-payment/)（取引先に似せたドメインからの請求書に応じた）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、取引先への支払いを実行する側に組み込む。** 侵入を見つけるのではなく、振込先の口座が、取引先の登録済みの口座と照合できたものかを、支払いの前に確認する。

### 注意したい業界・業務

- **業界 · サプライチェーン**: 子会社や現場の契約先に、1 件でまとまった額を支払う組織。
- **業務 · 振込先・口座の変更**: 取引先の口座の登録と変更（今回、口座の変更の依頼があったかは非公表）。
- **業務 · 承認・決裁**: 契約先への支払いの承認。

### いまの対策と Lemma の違い

今回の経路は、契約先への支払いの振込先の口座である。どの段階で口座が差し替わったか（請求書か、口座の変更の依頼か、支払いの仕組みの中か）は公表されていないので、列は 1 つにしている。

| 対策 | 契約先への支払いの振込先の口座 |
| --- | --- |
| 支払いの中身（名前と額）の確認 | 効かない |
| 銀行と法執行機関による回収 | 一部 |
| **Lemma（実行の前の照合）** | 効く |

支払いの中身の確認は、本物の契約先への支払いだったため、名前と額からは見分けがつかない。銀行と法執行機関による回収は、同社が進めているが、支払いの後の手段で、回収できたかは公表されていない。Lemma は、支払いの中身ではなく、振込先の口座を、取引先の登録済みの口座と、支払いの前に照合する。

注：Lemma の照合が働くのは、支払いの前の承認の手順に照合を組み込み、取引先の登録済みの口座と連絡先を、支払いの依頼や請求書とは別に管理している場合に限る。登録済みの口座や連絡先そのものが書き換えられている場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

取引先への支払いについて、組織で確認する 3 項目

- 取引先の口座を登録・変更するときに、登録済みの連絡先で、その取引先に確認しているか。
- 振込先の口座が登録済みの口座と違う支払いを、実行の前に止める手順があるか。
- 支払いの後に流用が分かったとき、すぐ銀行に連絡する手順が決まっているか。

## 5. 事実と時系列

- **当事者**: Zephyr Energy plc。ロンドン証券取引所の AIM に上場する、英国の石油・ガスの会社。米国の子会社 1 社が標的になった。
- **起きたこと**: 契約先への支払い 1 件が流用され、約 70 万ポンドが第三者の口座へ送られた。同社は「高度な」サイバーセキュリティの事案としている。
- **会社の手順**: 同社は、技術と支払いの仕組みに業界標準の手順を使っていたとしている。
- **会社のシステム**: 外部のサイバーセキュリティの顧問が IT システムを評価し、事案は封じ込め済みで、業務は通常どおりとしている。
- **影響**: 取締役会は、運転資金は十分で、この単発の事案は事業に影響しないと見ている。

### 時系列

- **支払いの日（非公表）**: 契約先への支払い 1 件が、第三者の口座へ送られる。
- **発見の日（非公表）**: 同社が流用に気づき、法執行機関に届ける。
- **2026-04-09**: 同社が、ロンドン証券取引所の適時開示（RNS 7163Z）で公表する。

> 本件の事実は、Zephyr Energy の開示（一次）に拠る。報道（TechCrunch・The Register）は開示を伝えたもので、それ以上の事実は確認できていない。報道にある、請求書の口座の書き換えやビジネスメール詐欺の型だとする記述は推測である。同社は手口を公表していない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Zephyr Energy**: 発見後すぐに法執行機関に届け、取引のある銀行と顧問と、流用された資金の回収を進めている。追加のセキュリティの層を入れたとしている（中身は非公表）。顧問が引き続きシステムを監視している。

## 6. Sources

- **Zephyr Energy plc（一次・適時開示）**: "Cybersecurity incident"（RNS 7163Z、2026-04-09） — <https://polaris.brighterir.com/public/zephyr_energy/news/rns_widget/story/xo91ymx>
- **TechCrunch（報道）**: "Hacker stole £700,000 from U.K. energy company by redirecting payment"（2026-04-09） — <https://techcrunch.com/2026/04/09/hacker-stole-700000-from-u-k-energy-company-by-redirecting-payment/>
- **The Register（報道）**: "Zephyr Energy loses £700K to contractor payment fraud"（2026-04-09） — <https://www.theregister.com/security/2026/04/09/zephyr-energy-loses-700k-to-contractor-payment-fraud/5226395>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
