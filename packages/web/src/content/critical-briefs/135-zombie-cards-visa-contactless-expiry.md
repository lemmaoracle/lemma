---
brief_no: 135
title: "Visa の非接触カード：期限切れのカードを中継で期限内に見せ、決済を通せることが示された(USENIX Security 2026)"
title_en: "Visa contactless cards: An expired card was made to look valid through a relay and used to pay (USENIX Security 2026)"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-08-18
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["006-google-api-key-revocation-lag", "032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation"]
status: published
version: "2.1"
og_lead_ja: "期限切れの Visa の非接触カードが、中継で期限内に見せられ決済に通った — 米国の大手 5 行で試した研究"
og_lead_en: "Expired Visa contactless cards were made to look valid through a relay and passed at checkout — tested at five major US banks"
layout: "report"
sections: "proof"
gate: "payment-instruction"
og_kicker_ja: "攻撃の実証 · カード決済"
og_kicker_en: "ATTACK RESEARCH · CARD PAYMENTS"
og_headline_ja: "期限切れのカードが、\nまた決済に使えた。\n<accent>Visa の非接触で実証</accent>"
og_headline_en: "An expired card worked\nagain at checkout.\n<accent>Shown on Visa contactless.</accent>"
key_figures:
  - value: "1"
    unit: "ブランド"
    label: "試した 4 つのカードブランドのうち、書き換えた有効期限が通ったのは Visa の構成だけだった（研究者の検証）"
    tone: "alert"
  - value: "5"
    unit: "行"
    label: "試した米国の大手銀行。通した銀行と、断った・新しいカードを求めた銀行に分かれた（研究者の検証）"
  - value: "2025-05 → 2026-08"
    label: "研究者が Visa と銀行に知らせてから、発表まで。発表の時点で、緩和は確認されていない"
glossary:
  - term: "非接触決済（EMV）"
    desc: "カードを端末にかざして払う方法。カードと端末が近距離の無線（NFC）でやり取りし、端末が銀行に承認を求める。"
  - term: "中継（リレー）"
    desc: "カードと端末の間に機器を挟み、やり取りを受け渡すこと。今回はスマートフォン 2 台で行い、途中で有効期限の値だけを書き換えた。"
  - term: "発行者"
    desc: "カードを発行した銀行。決済の承認を出すかどうかを最後に決める。"
insight:
  slug: "expiry-read-not-bound"
  label: "端末が読んだだけの有効期限"
  quote: "端末が読んだ値と、発行者が持つ記録が結び付いていなければ、途中で書き換えた値が、そのまま承認に使われる。"
industries: ["finance", "retail"]
controls:
  - slug: "ownership-check"
    item: "決済の承認のとき、そのカードの有効期限と状態を、発行者の記録と照合する"
  - slug: "hold-unverified"
    item: "有効期限が記録と合わない取引は、承認しない"
search_title: "Visa の期限切れカードが決済に通る問題：手口と対策"
search_description: "捨てられた期限切れの Visa の非接触カードを、スマートフォン 2 台の中継で期限内に見せ、決済を通せることが示された（USENIX Security 2026）。手口、なぜ通るか、発行者と利用者の対策を整理。"
takeaway: "端末が読んだ有効期限を、発行者が承認の前に自社の記録と照合するかで、結果が分かれた。"
self_check: "カードの決済を承認するとき、有効期限とカードの状態を、端末が送ってきた値ではなく自社の記録で照合しているか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。v2.0（2026-10-25）の事実の取り直し（始まりは捨てられた実物の期限切れのカード・米国の大手 5 行で試した・1・100・500 ドルの決済で観察）は、そのまま反映している。

## 1. 要点

この件は研究者の実証で、実地の被害は主張されていない。Visa の構成では、端末が読む有効期限がカードの署名の範囲に入っておらず、途中で書き換えても、カードのほかの検査は有効に見えたまま通った。決済が通るかは、発行者の銀行が、そのカードの状態を自社の記録と照合するかで分かれた。<strong>端末が読んだ値と、発行者が持つ記録が結び付いていなければ、途中で書き換えた値が、そのまま承認に使われる。</strong>

## 2. 通った操作

- **通った操作**: 中継で有効期限の値だけを書き換えた、期限切れの Visa の非接触カードの、決済の承認の要求。研究者の検証で、一部の銀行が承認した。
- **止まった操作**: Mastercard・American Express・Discover の構成は、書き換えた有効期限を受け付けなかった。米国の大手 5 行のうち、そのカードの状態まで自社の記録で確認した銀行は、断るか、新しいカードを求めた。
- **受け付けた側に届くもの**: 一般に、端末が読む値は、カードの署名の範囲の外にあれば、途中で書き換えられても、署名の検査では見分けられない。承認の要求に入る別の項目の値と、結び付いていなければ、発行者から見ると、書き換えられた値も、正しい値と同じ形で届く。
- **公表されていないこと**: 試したカードや取引の数、成功の割合、通した銀行の名前、Visa や銀行が緩和したか（発表の時点では確認されていない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、決済の承認を出す発行者が、端末が送ってきた有効期限ではなく、そのカード（番号・世代）の自社の記録にある期限と状態を、承認の前に照合することである。

- **誰が承認を出すか**: カードの発行者。承認を出すかを最後に決めるのは発行者で、照合に使うのは、端末や中継では作れない、発行者自身の記録。
- **どこで照合するか**: 発行者が決済の承認を出す手前。端末が読んだ期限、承認の要求の中の期限、カードの状態を、記録と照合し、合わない取引は承認しない。速さや端末の判断を理由に、省かない。
- **何が残るか**: どのカードの、どの期限と状態を、どの記録と照合して、承認または拒否したかの記録。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝承認の前に、端末が読んだ有効期限を、発行者の記録と照合し、記録に残すこと。検知＝おかしな取引や中継に後から気づくこと。下の日付は、研究者や報道が知らせた・公表した日で、検証の日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 銀行によって分かれた</b>承認の前に、カードの状態を自社の記録と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>期限切れのカードが、<br>一部の銀行の承認を通った</span></div>
<div class="rx-zone det"><b>検知 · 一部</b>中継を見つける仕組み（RRP）は、試した環境で有効になっていなかった</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>研究者が Visa と銀行に知らせる</b></div>
<div class="rx-g g2"><div class="t">2025-12</div><b>もう一度知らせる</b></div>
<div class="rx-g g3"><div class="t">2026-08</div><b>USENIX Security で発表する</b></div>
<div class="rx-g g4"><div class="t">08-18</div><b>The Register が報じる</b></div>
</div>
</figure>

カードの状態を記録と照合した銀行は断り、端末の判断に頼った銀行では、書き換えた期限が通った。同じように、取り消したあとも、しばらく使えた鍵の事案に、[Google の API キー](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、発行者が決済の承認を出す手前に組み込む。** 侵入や中継を見つけるのではなく、端末が読んだ有効期限が、発行者の記録にあるそのカードの期限と状態に合うかを、承認の前に照合する。

### 注意したい業界・業務

- **業界 · 金融**: カードを発行し、決済を承認する銀行。速さのために端末の判断に頼る処理がある。
- **業界 · 小売**: 非接触の決済を受け付ける店舗。中継を見つける仕組みが端末で有効かは、店舗からは見えにくい。

### いまの対策と Lemma の違い

今回の経路は 1 列目（中継で書き換えた有効期限での承認の要求）である。2 列目は、その入口で、処分されずに残った期限切れのカードを手にする場面である。

| 対策 | 中継で書き換えた有効期限での承認の要求 | 期限切れのカードを手にする入口 |
| --- | --- | --- |
| カードの暗号の検査 | 効かない | 関係しない |
| 発行者の承認（カードの状態まで照合する場合） | 一部 | 関係しない |
| 中継を見つける仕組み（RRP） | 一部 | 関係しない |
| 期限切れのカードの処分 | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 関係しない |

カードの暗号の検査は、有効期限が署名の範囲に入っておらず、有効に見えたまま通った。発行者の承認は、そのカードの状態まで確認した銀行は断ったが、通した銀行もあった。中継を見つける仕組みは任意の機能で、試したカードと端末では有効になっていなかった。期限切れのカードの処分は、攻撃の入口を減らすが、雑に捨てられたカードは残る。Lemma は、発行者が承認を出す前に、端末が読んだ期限を、自社の記録と照合する。

注：Lemma の照合が働くのは、発行者の承認の判断の手前に照合を組み込み、記録が、端末や中継とは別に、発行者の側で管理されている場合に限る。発行者の記録そのものが古い・誤っている場合は、通る。端末が読む有効期限を署名の範囲に入れることや、中継を見つける仕組みを有効にすることは、ブランドと端末の側の対策で、この照合の外にある。研究者は実物の期限切れのカードから始めており、遠くからすべてのカードを狙える攻撃ではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。Visa や銀行が緩和を発表すれば、この Brief を改訂する。

### 点検チェックリスト

カードの決済を承認・受け付ける組織で確認する 3 項目

- 決済の承認で、有効期限を端末が送ってきた値ではなく、自社の記録と照合しているか。
- 口座ではなく、そのカード（番号・世代）が有効かを確認しているか。
- 期限切れや再発行で使わなくなったカードの処分の仕方（IC と磁気の部分を切る、窓口に返す）を、利用者に伝えているか。

## 5. 事実と時系列

- **研究者**: マサチューセッツ大学アマースト校の Raja Hasnain Anwar、Gerard DeCunha、Muhammad Taqi Raza。論文「Zombie Cards Back Online」を USENIX Security 2026 で発表した。実地の被害ではなく、研究者による実証である。
- **始まり**: 確実に処分されなかった、実物の期限切れのカード。期限切れのカードは雑に捨てられることが多いとしている。すべてのカードの持ち主を遠くから狙える攻撃ではない。
- **手口**: スマートフォン 2 台でカードと端末の間に中継を作り、端末が読む有効期限の値だけを書き換えた。特別な機器は使わず、店舗の普通の条件で動いた。
- **通った理由**: Visa の構成では、端末が読む有効期限がカードの署名の範囲に入っていなかった。そのため、カードの暗号の応答は有効に見えたままだった。発行者は、承認の要求の中の別の項目にある有効期限に頼っており、2 つの値が結び付いていなかった。
- **ブランドと銀行**: Mastercard・American Express・Discover の構成は、書き換えた有効期限を受け付けなかった。米国の大手 5 行では、通した銀行と、断った・新しいカードを求めた銀行に分かれた。1・100・500 ドルの決済で、期限切れが通ることを観察した。
- **研究者がしていないこと**: カードの暗号を破ったり、安全のための応答を偽造したりはしていない。中継のコードは公開しない。試した店舗には事前に知らせ、代金はすべて払った。

### 時系列

- **2025-05**: 研究者が Visa と関係する銀行に知らせる。
- **2025-12**: 研究者が Visa と銀行に、もう一度知らせる。
- **2026-08**: USENIX Security 2026 で発表する。8 月 18 日に The Register が報じる。

> 本件の事実は、研究者の論文の要旨と著者の要約（一次）に拠る。報道はそれを伝えたもの。実地の被害額や被害者は主張しない。試したカードや取引の数、成功の割合は公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Visa**: 著者の要約によれば、研究者の報告は最初の選別を通り、Visa の検証の担当が再現を進めていた。発表の時点で、Visa も知らせた銀行も、有効期限の問題を緩和したとは確認していない。CVE は割り当てられていない。
- **研究者**: 発行者とブランドに、有効期限を決済の最初から最後まで一貫して確認すること、口座ではなくそのカードの状態を確認することを勧めた。中継を見つける仕組み（Relay Resistance Protocol）は、試したカードと端末では有効になっていなかった。

## 6. Sources

- **USENIX Security 2026（研究・一次）**: Anwar, DeCunha, Raza, "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments"（2026-08） — <https://www.usenix.org/conference/usenixsecurity26/presentation/anwar>
- **Khwarizmi Lab（研究・一次・著者の要約）**: "Reviving expired cards for contactless payments" — <https://khwarizmilab.github.io/emvexpiredcards/>
- **The Register（報道）**: "Expired credit cards revived by researchers to make unauthorized payments"（2026-08-18） — <https://www.theregister.com/security/2026/08/18/expired-credit-cards-revived-by-researchers-to-make-unauthorized-payments/5289229>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
