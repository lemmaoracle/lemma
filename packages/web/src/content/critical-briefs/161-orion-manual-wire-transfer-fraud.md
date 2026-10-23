---
brief_no: 161
title: "Orion S.A.：社員が詐欺の標的になり、複数の送金が外部の口座へ出た(米 SEC 提出書類) — 同社が設計上は足りていたとする送金の統制が働かず、送金を照合済みの依頼に結びつける層が無い"
title_en: "Orion S.A.: An employee was targeted by a criminal scheme, and multiple wire transfers went to outside accounts (US SEC filings) — Wire controls the company believed adequate as designed did not operate, and nothing ties each transfer to a verified request"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2024-08-10
published: 2026-10-24
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "032-booking-payout-account-tampering"]
status: published
version: "1.0"
og_lead_ja: "化学メーカー Orion、社員を狙った詐欺で複数の送金が外部の口座へ — 未回収の損失 5,920 万ドル"
og_lead_en: "Orion: a scheme targeting one employee sent multiple wires to outside accounts — a $59.2M unrecovered loss"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · 送金詐欺"
og_kicker_en: "CYBERATTACK · WIRE FRAUD"
og_headline_ja: "社員を狙った詐欺で、\n送金が何度も外部へ出た。\n<accent>未回収 5,920 万ドル</accent>"
og_headline_en: "A scheme targeting one employee\nsent wires out again and again.\n<accent>$59.2M unrecovered.</accent>"
summary_labels: ["何が起きたか", "何が分かっているか", "欠けていた層"]
key_figures:
  - value: "5,920"
    unit: "万ドル"
    label: "2024 年 7〜9 月期に、未回収の送金として損失に計上した額（同社の四半期報告）"
    tone: "alert"
  - value: "920"
    unit: "万ドル"
    label: "2025 年に回収した額（790 万ユーロ）。2024 年中の回収と合わせても、大半は戻っていない（同社の年次報告）"
  - value: "Q3 → 12-31"
    label: "手作業の送金の統制に「重要な不備」を認めてから、是正済みとするまで（同社の報告）"
glossary:
  - term: "Orion S.A."
    desc: "タイヤやプラスチックの原料になるカーボンブラックのメーカー。ルクセンブルク籍で、本社機能は米テキサス州にある。ニューヨーク証券取引所に上場。"
  - term: "8-K"
    desc: "米国の上場会社が、重要な出来事を臨時に SEC（証券取引委員会）に届け出る書類。"
  - term: "重要な不備（material weakness）"
    desc: "財務報告に関わる内部統制の欠陥のうち、重大な誤りを防げないおそれがあるもの。上場会社は開示する。"
insight:
  slug: "control-designed-but-not-operating"
  label: "設計はあっても働かない送金の統制"
  quote: "同社は、手作業の送金の統制は設計としては不正な送金を防ぐか検知できるものだったとみているが、実際には働かなかったと報告した。送金そのものを、照合済みの依頼に結びつける仕組みは公表からは見えない。"
industries: ["manufacturing"]
operations: ["approval", "payment-change"]
controls:
  - slug: "separate-approval"
    item: "手作業の送金は、依頼した人とは別の手段で、依頼が本物かを照合する"
  - slug: "hold-unverified"
    item: "照合済みの依頼に結びつかない送金は、実行しない"
  - slug: "audit-trail"
    item: "どの依頼を、何で照合して送金したかを残す"
impact: "社員を狙った詐欺で送金が第三者の口座へ出て、5,920 万ドルを未回収の損失に計上した（その後一部を回収）"
takeaway: "社員を狙った詐欺で、送金が何度も外部へ出た。同社が設計上は足りていたとする統制が働かず、送金を照合済みの依頼に結びつける層が無かった。"
self_check: "手作業の送金を、依頼が本物かを照合してから実行しているか。"
countries: ["us"]
---

## 1. TL;DR

カーボンブラックのメーカー Orion S.A. は 2024 年 8 月、開示対象の上級役員（NEO）ではない社員が詐欺の標的になり、だまされて行われた複数の送金が正体不明の第三者の口座へ出ていたと米 SEC に届け出た。7〜9 月期に、未回収分として 5,920 万ドルの損失を計上した。2025 年に 920 万ドルを回収したが、大半は戻っていない。

同社は手口を公表していない。報道はビジネスメール詐欺とみるが、同社の書類にその言葉は無い。分かっているのは、同社が手作業の送金の統制に「重要な不備」を認め、統制は設計としては不正な送金を防ぐか検知できるものだったとみているが、実際には働かなかったと報告したことである。

同社は 8 月 10 日に事態を把握したが、それまでに送金は何度も通っていた。効かなかったのは、手作業の送金を、照合済みの依頼に結びつける層である。

## 2. 何が起きたか

- **当事者**: Orion S.A.。カーボンブラックのメーカー。ルクセンブルク籍で、SEC の書類上の本社は米テキサス州スプリング。ニューヨーク証券取引所に上場。
- **起きたこと**: 2024 年 8 月 10 日、開示対象の上級役員（NEO）ではない社員が詐欺の標的になり、その結果、だまされて行われた複数の送金が、正体不明の第三者の口座へ出ていたと判断した（8 月 12 日の 8-K）。
- **損失**: 7〜9 月期に、未回収の送金として 5,920 万ドルの損失を計上した。2024 年の年次報告では、回収を差し引いて 5,570 万ドル。2025 年に 920 万ドル（790 万ユーロ）を回収した。調査の専門家の費用は、2024 年に 360 万ドル、2025 年に 230 万ドル。
- **社内のシステム**: データやシステムへの不正なアクセスは無く、事業にも影響は無かったとしている。
- **公表されていないこと**: 手口（メールか、電話か、誰を装ったか）。送金の総額・回数・日付、送り先の国。不正な送金そのものが手作業だったか（重要な不備は、手作業の送金の統制について認めた）。標的になった社員の役割。どこの拠点で起きたか。報道は「ビジネスメール詐欺」と呼ぶが、同社の書類にその言葉は無い。

公表された範囲で見ると、経過は次のとおりである。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過の連鎖</span></div>
<p class="rx-ex-cap">止めどころは ②。送金を、照合済みの依頼に結びつけていれば、だまされた依頼では ③ の送金は出ない。① の手口は公表されていない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">第三者</div><div class="no">1</div><b>社員を詐欺の標的にする</b><p>手口は非公表。</p></div>
<div class="rx-step crit"><div class="who">Orion</div><div class="no">2</div><b>送金の統制が働かない</b><p>同社は、手作業の送金の統制は設計上は防ぐか検知できるものだったとみる。</p></div>
<div class="rx-step crit"><div class="who">Orion</div><div class="no">3</div><b>複数の送金が第三者の口座へ出る</b><p>2024 年 7〜9 月期。未回収分の損失は 5,920 万ドル。</p></div>
<div class="rx-step good"><div class="who">Orion</div><div class="no">4</div><b>事態を把握し、捜査機関に協力する</b><p>8 月 10 日。回収と保険での補てんを求める。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2024-08-10**: 社員が詐欺の標的になり、複数の送金が第三者の口座へ出ていたと判断する。
- **2024-08-12**: 8-K で届け出る。これ以上の回収が無ければ約 6,000 万ドルの損失になるとする。
- **2024-11-07**: 四半期報告で 5,920 万ドルの損失を計上し、手作業の送金の統制に重要な不備があったと開示し、9 月末時点で開示の統制は有効でなかったと結論する。
- **2025-02-20**: 年次報告で、損失を回収差し引き後 5,570 万ドルとし、重要な不備は 2024 年末までに是正したとする。
- **2026-02-17**: 2025 年の年次報告で、920 万ドルの回収を開示する。

> 本件の事実は、Orion の SEC への提出書類（8-K、2024 年 7〜9 月期の四半期報告、2024 年と 2025 年の年次報告。いずれも一次）に拠る。手口が「ビジネスメール詐欺」だという見方は報道のもので、同社は確認していない。

### 公表後の対応

- **Orion**: 現金の支払いの手続きに統制を足し、四半期ごとの経営陣の内部確認を強めた。社員の研修を充実させ、懸念を早く上げることを促すとした。監査委員会は第三者に調査を頼んだ。2024 年末時点で、統制は十分な期間働いたとして、重要な不備は是正済みとした。
- **回収**: 捜査機関に協力し、保険も含めて回収を求めている。

## 4. なぜ止まらなかったか

この事案の失敗は、統制を設計していなかったことではない。**同社が設計上は足りていたとみる送金の統制が実際には働かず、送金そのものを照合済みの依頼に結びつける層が無かった**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、手作業の送金を実行する前に「この送金は、本物と照合できた依頼に結びついているか」を照合し、記録に残すこと。検出は、送金のあとに不正に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 無かった</b>送金を、照合済みの依頼に結びつける</div>
<div class="rx-zone gapz"><b>落差</b><span>5,920 万ドルが<br>外部の口座へ</span></div>
<div class="rx-zone det"><b>検出の層 · 働いた</b>事態を把握し、回収を求める</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>社員が標的に</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>統制が働かない</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>Q3 複数の送金</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>08-10 把握</b></div>
</div>
</figure>

同社は 8 月 10 日に事態を把握し、回収に動いたが、そのときには送金は何度も出ていた。統制が人の手順に頼る限り、だまされた人が手順を進めれば、送金は手順どおりに見える。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[香港のディープフェイク会議詐欺](https://lemma.frame00.com/ja/critical/briefs/084-hong-kong-deepfake-video-call-fraud/)（財務担当者が、装われた CFO の指示で 15 回送金した）にも現れている。

## 5. 対策するには

**手作業の送金は、本物と照合できた依頼に結びついたものだけを実行する。** 照合は、送金を行う人の判断ではなく、依頼した人とは別の手段で行い、その結果を送金に結びつける。そうすれば、社員がだまされて手順を進めても、照合の無い依頼では送金は出ない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · 製造**: 海外の拠点や取引先が多く、国をまたぐ送金を手作業で行う場面がある会社。
- **業務 · 承認・決裁**: 社員が依頼を受けて行う手作業の送金と、その承認。
- **業務 · 振込先・口座の変更**: 初めての送り先や、急ぎで指定された新しい口座への送金。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 送金の承認の手順 | 一部 | 同社は、設計としては足りていたとみるが、働かなかったとする。 |
| 経営陣の内部確認 | 効かない | 四半期ごとの確認は、起きたあとの統制で、送金の前には働かない。 |
| 社員の研修 | 一部 | だまされにくくするが、だまされた人の手順は止めない。 |
| 回収と保険 | 効かない | 送金の後の手当てで、送金そのものは止めない。2025 年までに一部を回収した。 |

### 必要になるもの

1. **送金の依頼を、依頼した人とは別の手段で照合する。** 依頼が届いた経路の中で照合しない。
2. **照合済みの依頼に結びつかない送金は、実行できないようにする。** 手作業の送金でも、照合の結果が無ければ送れない形にする。
3. **どの依頼を、何で照合して送金したかを残す。** 四半期ごとの事後の確認を待たず、送金のたびに証明として残す。

### 点検チェックリスト

手作業の送金について、組織で確認する 3 項目

- 手作業の送金を、システムの支払いの流れの外で行える道が残っていないか。
- 送金の依頼を、依頼が届いた経路とは別の手段で照合する手順があるか。
- 1 人の社員の判断だけで、短い間に何度も送金できる設定になっていないか。

注：依頼した本人の連絡手段まで乗っ取られている場合は、この照合を通りうる。また、手口が公表されていないため、この Brief の対策は経路に依存しないものに絞った。続報で手口が判明すれば、この Brief を改訂する。

## 6. Sources

- **Orion S.A.（一次・SEC 8-K）**: "Form 8-K, Item 8.01 Other Events"（2024-08-12） — <https://www.sec.gov/Archives/edgar/data/1609804/000095014224002170/eh240519238_8k.htm>
- **Orion S.A.（一次・SEC 10-Q）**: "Quarterly Report for the period ended September 30, 2024"（2024-11-07） — <https://www.sec.gov/Archives/edgar/data/1609804/000160980424000033/oec-20240930.htm>
- **Orion S.A.（一次・SEC 10-K）**: "Annual Report for the year ended December 31, 2024"（2025-02-20） — <https://www.sec.gov/Archives/edgar/data/1609804/000160980425000007/oec-20241231.htm>
- **Orion S.A.（一次・SEC 10-K）**: "Annual Report for the year ended December 31, 2025"（2026-02-17） — <https://www.sec.gov/Archives/edgar/data/1609804/000162828026008601/oec-20251231.htm>
- **The Record（報道）**: "Carbon black supplier Orion loses $60 million in business email compromise scam"（2024-08-13） — <https://therecord.media/orion-carbon-black-bec-scam-millions>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
