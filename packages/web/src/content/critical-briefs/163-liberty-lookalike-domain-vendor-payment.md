---
brief_no: 163
title: "米リバティ市：取引先に似せたドメインから本物と同じ額の請求が届き、市が送金した(市の声明) — 支払いの請求が本当にその取引先から出たかを、送金の前に照合する層が見えない"
title_en: "City of Liberty, Texas: A lookalike vendor domain sent a request for the exact amount owed, and the city paid it (city statement) — No check, before paying, that the request really came from that vendor is visible"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-10-14
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud"]
status: published
version: "1.0"
og_lead_ja: "米リバティ市、取引先に似せたドメインの請求に応じ約 60 万ドルを送金 — 債務の額は本物と同じだった"
og_lead_en: "City of Liberty, Texas wired ~$600K on a lookalike-domain request that matched a real debt"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすましメール"
og_kicker_en: "CYBERATTACK · LOOKALIKE DOMAIN"
og_headline_ja: "取引先に似せたドメインから、\n本物と同じ額の請求が届いた。\n<accent>約 60 万ドルを送金</accent>"
og_headline_en: "A lookalike domain sent a request\nfor the exact amount owed.\n<accent>About $600K wired.</accent>"
summary_labels: ["何が起きたか", "なぜ見分けられないか", "欠けていた層"]
key_figures:
  - value: "約 60"
    unit: "万ドル"
    label: "取引先を装う支払いの請求に応じて送金した額（市の声明）"
    tone: "alert"
  - value: "同じ額"
    label: "市がその取引先に実際に負っていた債務と、請求の額。これが、請求を本物と見る判断に影響した（市の声明）"
  - value: "送金の後"
    label: "受け手の銀行が、不正の疑いを市の銀行に知らせた時点（市の声明）"
glossary:
  - term: "似せたドメイン"
    desc: "本物のメールアドレスのドメイン（@ の後ろ）に、1 文字だけ違えるなどして見た目を似せたもの。表示だけでは見分けにくい。"
  - term: "電信送金（wire transfer）"
    desc: "銀行の間でお金を直接送る方法。米国では即日に着金し、送った後の取り消しが難しい。"
insight:
  slug: "real-debt-fake-sender"
  label: "中身は本物、送り主だけが偽物"
  quote: "請求の額は、市が実際に負っていた債務と同じだった。中身が正しいほど請求は本物に見える。送金の前に送り主を照合した形跡は、公表からは見えない。"
industries: ["public-sector"]
operations: ["approval", "payment-change"]
controls:
  - slug: "separate-approval"
    item: "支払いの請求は、届いたメールとは別の経路で、取引先の登録済みの連絡先に照合する"
  - slug: "hold-unverified"
    item: "送り主を照合できない請求には、送金しない"
  - slug: "audit-trail"
    item: "どの請求を、何で照合して送金したかを残す"
attack_method: "impersonation"
impact: "取引先に似せたドメインの請求に応じて、約 60 万ドルを送金した"
takeaway: "実際にある債務と同じ額の請求が、取引先に似せたドメインから届いた。請求が本当にその取引先から出たかを、送金の前に照合する層は、公表からは見えない。"
self_check: "取引先からの支払いの請求が、本当にその取引先から出たかを、送金の前に照合できるか。"
countries: ["us"]
---

## 1. TL;DR

米テキサス州のリバティ市は 2026 年 10 月 14 日、取引先に似せたドメインのメールで届いた支払いの請求に応じて、約 60 万ドルを電信送金したと発表した。送金の後、受け手の銀行が、不正の疑いを市の銀行に知らせた。

市はその取引先に、請求と同じ額の債務を実際に負っていた。市は、この本物の債務が請求を本物と見る判断に影響したとしている。請求の中身が正しいほど、送り主の表示だけでは見分けられない。

受け手の銀行は不正の疑いに気づいたが、それは送金が通った後だった。公表から見えないのは、支払いの請求が本当にその取引先から出たかを、送金の前に照合する層である。

## 2. 何が起きたか

- **当事者**: 米テキサス州リバティ市。ヒューストンの北東にある市。
- **起きたこと**: 市が支払いを負っていた本物の取引先を装い、取引先に似せたドメインのメールで支払いの請求が届いた。市はこの請求に応じて、約 60 万ドルを電信送金した。
- **見分けにくさ**: 市は、その取引先に請求と同じ額の債務を実際に負っていた。この本物の債務が、請求を本物と見る最初の判断に影響したとしている。
- **気づいた経緯**: 送金が通った後、受け手の銀行が、送金は不正の疑いがあると市の銀行に知らせた。
- **市のシステム**: 市の内部のネットワークは侵害されておらず、取引先の本物のメールアドレスに似せたドメインを使った、外部からの単発の事案とみられるとしている。
- **公表されていないこと**: 送金の日付、取引先の名前、請求に新しい振込先が書かれていたか、誰が承認したか、回収できたか。攻撃者が取引先と債務の額をどう知ったか（取引先の側のメールが侵害されたか）。市は、捜査中のため詳細は話せないとしている。市、取引先、市のコンサルタントのいずれも、不正を疑われていない。

公表された範囲で見ると、攻撃は次の連鎖で成立した。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過の連鎖</span></div>
<p class="rx-ex-cap">止めどころは ②。請求が本当にその取引先から出たかを、届いたメールとは別の経路で照合していれば、③ の送金は起きない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">第三者</div><div class="no">1</div><b>取引先に似せたドメインから、支払いを請求する</b><p>額は、市が実際に負う債務と同じ。</p></div>
<div class="rx-step crit"><div class="who">市</div><div class="no">2</div><b>本物の債務と突き合わせて、請求を本物と見る</b><p>送り主の照合は、公表からは見えない。</p></div>
<div class="rx-step crit"><div class="who">市</div><div class="no">3</div><b>約 60 万ドルを電信送金する</b><p>日付は非公表。</p></div>
<div class="rx-step good"><div class="who">銀行</div><div class="no">4</div><b>受け手の銀行が、不正の疑いを知らせる</b><p>送金が通った後。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **送金の日（非公表）**: 取引先を装う請求に応じて、約 60 万ドルを電信送金する。その後、受け手の銀行が不正の疑いを市の銀行に知らせる。
- **2026-10-14**: 市が声明を出し、事案を公表する。

> 本件の事実は、リバティ市の声明（一次）に拠る。報道は声明を伝えたもので、それ以上の事実は確認できていない。送金の日付と回収の状況は公表されていない。

### 公表後の対応

- **リバティ市**: 取引先への支払いの照合の手順の見直しを強めたとした。保険会社に請求を出し、連邦の捜査機関と協力している。市の警察が、連邦の捜査機関と捜査している。

## 4. なぜ止まらなかったか

この事案の失敗は、請求の中身を見なかったことではない。**中身は正しかったが、その請求が本当にその取引先から出たかを、送金の前に照合した形跡は公表からは見えない**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、支払いの請求が本当にその取引先から出たかを、送金の前に、届いたメールとは別の経路で照合し、記録に残すこと。検出は、送金の後に不正の疑いに気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 見えず</b>請求の送り主を、送金の前に照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>約 60 万ドルが<br>送金された</span></div>
<div class="rx-zone det"><b>検出の層 · 働いた</b>受け手の銀行が不正の疑いを知らせる</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>似せたドメインの請求</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>本物の債務と一致</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>電信送金</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>銀行の通報</b></div>
</div>
</figure>

請求の額が本物の債務と同じなら、中身をいくら見ても見分けはつかない。見分けるには、中身ではなく送り主を照合するしかない。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[ポラリス HD・Booking.com](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/)（正規の管理画面で、ホテルの受取口座が書き換えられた）にも現れている。

## 5. 対策するには

**支払いの請求は、その取引先の登録済みの連絡先で、送り主が本物と照合できたものだけに送金する。** 請求の中身が正しいかと、送り主が本物かは別に照合する。そうすれば、本物と同じ額の請求でも、似せたドメインからのものには送金しない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · 行政・公共**: 取引先と支払いの額が議会の資料や入札で公になる自治体。攻撃者が本物の債務の額を知る可能性がある（今回の経路は非公表）。
- **業務 · 承認・決裁**: 取引先からの請求に基づく支払いの承認。
- **業務 · 振込先・口座の変更**: 請求とともに届く、振込先の指定や変更（今回の扱いは非公表）。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 請求の中身の確認 | 一部 | 額は本物の債務と同じだった。中身が正しいほど、本物に見える。 |
| メールの送信元の確認 | 一部 | ドメインは本物に似せてあった。表示だけでは見分けにくい。 |
| 銀行の不正の検知 | 一部 | 受け手の銀行が気づいたのは、送金の後だった。 |
| 保険 | 効かない | 損失を補うことはあるが、送金は止めない。 |

### 必要になるもの

1. **請求の送り主を、届いたメールとは別の経路で照合する。** 取引先の登録済みの連絡先に、その請求を出したかを確かめる。
2. **送り主を照合できない請求には、送金しない。** 中身が本物の債務と合っていても、照合を省かない。
3. **どの請求を、何で照合して送金したかを残す。** 請求のメールとは別に、照合の結果を証明として残す。保険や捜査で、何を照合して送ったかを示せる。

### 点検チェックリスト

取引先からの請求について、組織で確認する 3 項目

- 請求のメールのドメインが、取引先の登録済みのものと一致するかを照合しているか。
- 請求を、届いたメールの中の連絡先ではなく、登録済みの連絡先で確認しているか。
- 取引先と支払いの額が公の資料から分かることを、前提にした手順になっているか。

注：取引先の登録済みの連絡先そのものが乗っ取られている場合は、この照合を通りうる。また、市は送金の日付や振込先の扱いを公表しておらず、続報で判明すれば、この Brief を改訂する。

## 6. Sources

- **リバティ市（一次・声明）**: "Press Release - 2026-10-14"（2026-10-14） — <https://www.cityofliberty.org/home-page/page/press-release-2026-10-14>
- **Click2Houston（報道）**: "City of Liberty loses $600,000 in fraudulent wire transfer after email impersonation scheme"（2026-10-14） — <https://www.click2houston.com/news/local/2026/10/14/city-of-liberty-loses-dollar600000-in-fraudulent-wire-transfer-after-email-impersonation-scam/>
- **Bluebonnet News（報道）**: "City of Liberty targeted in $600,000 payment fraud scheme"（2026-10-14） — <https://bluebonnetnews.com/2026/10/14/city-of-liberty-targeted-in-600000-payment-fraud-scheme/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
