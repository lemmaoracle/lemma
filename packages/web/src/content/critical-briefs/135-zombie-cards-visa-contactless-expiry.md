---
brief_no: 135
title: "Visa の非接触カード：期限切れのカードを中継で期限内に見せ、決済を通せることが示された(USENIX Security 2026) — 端末が読む有効期限を、発行者が自社の記録と照合する層が無い"
title_en: "Visa contactless cards: An expired card was made to look valid through a relay and used to pay (USENIX Security 2026) — Nothing has the issuer check the expiry the terminal reads against its own record"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-08-18
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["006-google-api-key-revocation-lag", "032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation"]
status: published
version: "2.0"
og_lead_ja: "期限切れの Visa の非接触カードが、中継で期限内に見せられ決済に通った — 米国の大手 5 行で試した研究"
og_lead_en: "Expired Visa contactless cards were made to look valid through a relay and passed at checkout — tested at five major US banks"
layout: "report"
og_kicker_ja: "攻撃の実証 · カード決済"
og_kicker_en: "ATTACK RESEARCH · CARD PAYMENTS"
og_headline_ja: "期限切れのカードが、\nまた決済に使えた。\n<accent>Visa の非接触で実証</accent>"
og_headline_en: "An expired card worked\nagain at checkout.\n<accent>Shown on Visa contactless.</accent>"
summary_labels: ["何が起きたか", "なぜ見分けられないか", "欠けていた層"]
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
  quote: "有効期限はカードの中にあるが、Visa の構成ではカードの署名で守られていなかった。端末が読んだ値と、発行者が持つ値が結び付いていなければ、途中で書き換えた期限がそのまま通る。"
industries: ["finance", "retail"]
controls:
  - slug: "ownership-check"
    item: "決済の承認のとき、そのカードの有効期限と状態を、発行者の記録と照合する"
  - slug: "hold-unverified"
    item: "有効期限が記録と合わない取引は、承認しない"
search_title: "Visa の期限切れカードが決済に通る問題：手口と対策"
search_description: "捨てられた期限切れの Visa の非接触カードを、スマートフォン 2 台の中継で期限内に見せ、決済を通せることが示された（USENIX Security 2026）。手口、なぜ通るか、発行者と利用者の対策を整理。"
self_check: "カードの決済を承認するとき、有効期限とカードの状態を、端末が送ってきた値ではなく自社の記録で照合しているか。"
countries: ["global"]
---

> **改訂（v2.0 / 2026-10-25）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。著者の要約と USENIX の要旨で事実を取り直した（始まりは捨てられた実物の期限切れのカード・米国の大手 5 行で試した・1・100・500 ドルの決済で観察）。Lemma の設計の説明は外した。

## 1. TL;DR

マサチューセッツ大学アマースト校の研究者は 2026 年 8 月の USENIX Security で、期限切れの Visa の非接触カードを、カードと端末の間の中継で期限内に見せ、決済を通せることを示した。始まりは、確実に処分されなかった実物の期限切れのカードである。

Visa の構成では、端末が読む有効期限がカードの署名で守られておらず、途中で書き換えてもカードのほかの検査は有効に見えたまま通った。決済が通るかは、発行者の銀行が、そのカードの状態を自社の記録で確かめるかで分かれた。

研究者は 2025 年 5 月と 12 月に Visa と銀行に知らせたが、発表の時点で緩和は確認されていない。効かなかったのは、端末が読む有効期限を、発行者がそのカードの記録と照合する層である。

## 2. 何が起きたか

- **研究者**: マサチューセッツ大学アマースト校の Raja Hasnain Anwar、Gerard DeCunha、Muhammad Taqi Raza。論文「Zombie Cards Back Online」を USENIX Security 2026 で発表した。実地の被害ではなく、研究者による実証である。
- **始まり**: 確実に処分されなかった、実物の期限切れのカード。期限切れのカードは雑に捨てられることが多いとしている。すべてのカードの持ち主を遠くから狙える攻撃ではない。
- **手口**: スマートフォン 2 台でカードと端末の間に中継を作り、端末が読む有効期限の値だけを書き換えた。特別な機器は使わず、店舗の普通の条件で動いた。
- **通った理由**: Visa の構成では、端末が読む有効期限がカードの署名の範囲に入っていなかった。そのため、カードの暗号の応答は有効に見えたままだった。発行者は、承認の要求の中の別の項目にある有効期限に頼っており、2 つの値が結び付いていなかった。
- **ブランドと銀行**: Mastercard・American Express・Discover の構成は、書き換えた有効期限を受け付けなかった。米国の大手 5 行では、通した銀行と、断った・新しいカードを求めた銀行に分かれた。1・100・500 ドルの決済で、期限切れが通ることを観察した。
- **研究者がしていないこと**: カードの暗号を破ったり、安全のための応答を偽造したりはしていない。中継のコードは公開しない。試した店舗には事前に知らせ、代金はすべて払った。

研究者の検証で見ると、決済は次の連鎖で通った。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">研究者の検証で見た、決済が通るまでの連鎖</span></div>
<p class="rx-ex-cap">止めどころは ④。発行者が、そのカードの有効期限と状態を自社の記録と照合していれば、③ で書き換えた期限は通らない。</p>
<div class="rx-chain">
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">1</div><b>処分されなかった期限切れのカードを手にする</b><p>実物のカードが要る。</p></div>
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">2</div><b>スマートフォン 2 台で、カードと端末の間に中継を作る</b><p>特別な機器は使わない。</p></div>
<div class="rx-step crit"><div class="who">中継</div><div class="no">3</div><b>端末が読む有効期限だけを書き換える</b><p>署名の範囲外なので、ほかの検査は有効に見える。</p></div>
<div class="rx-step crit"><div class="who">発行者</div><div class="no">4</div><b>一部の銀行が、決済を承認する</b><p>カードの状態まで確かめる銀行は断った。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2025-05**: 研究者が Visa と関係する銀行に知らせる。
- **2025-12**: 研究者が Visa と銀行に、もう一度知らせる。
- **2026-08**: USENIX Security 2026 で発表する。8 月 18 日に The Register が報じる。

> 本件の事実は、研究者の論文の要旨と著者の要約（一次）に拠る。報道はそれを伝えたもの。実地の被害額や被害者は主張しない。試したカードや取引の数、成功の割合は公表されていない。

### 公表後の対応

- **Visa**: 著者の要約によれば、研究者の報告は最初の選別を通り、Visa の検証の担当が再現を進めていた。発表の時点で、Visa も知らせた銀行も、有効期限の問題を緩和したとは確認していない。CVE は割り当てられていない。
- **研究者**: 発行者とブランドに、有効期限を決済の最初から最後まで一貫して確かめること、口座ではなくそのカードの状態を確かめることを勧めた。中継を見つける仕組み（Relay Resistance Protocol）は、試したカードと端末では有効になっていなかった。

## 4. なぜ止まらなかったか

この事案の失敗は、カードの暗号が破られたことではない。**端末が読んだ有効期限が、発行者が持つそのカードの記録と照合されないまま、決済が承認された**ことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、決済の判断に使う有効期限が、発行者の記録にあるそのカードの期限と一致することを、承認の前に照合すること。検出は、おかしな取引に後から気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 無い</b>端末が読んだ期限を、発行者の記録と照合する</div>
<div class="rx-zone gapz"><b>落差</b><span>期限切れの<br>カードが通る</span></div>
<div class="rx-zone det"><b>検出の層 · 一部</b>カードの状態を確かめる銀行は断った</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>期限切れのカード</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>中継</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>期限の書き換え</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>承認</b></div>
</div>
</figure>

カードの状態まで確かめる銀行は、決済を断るか、新しいカードを求めた。一方で、端末の判断に頼り、速さのために確かめを省く銀行では、書き換えた期限が通った。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[Google の API キー](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)（取り消した後もしばらく使えた鍵）にも現れている。

## 5. 対策するには

**決済の承認では、端末が送ってきた有効期限ではなく、発行者が持つそのカードの記録で、期限と状態を照合する。** 端末が読む値は途中で書き換えられうる。承認の前に自社の記録と照合すれば、期限切れのカードは期限内に見せられても通らない。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · 金融**: カードを発行し、決済を承認する銀行。速さのために端末の判断に頼る処理がある。
- **業界 · 小売**: 非接触の決済を受け付ける店舗。中継を見つける仕組みが端末で有効かは、店舗からは見えにくい。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| カードの暗号の検査 | 効かない | 有効期限が署名の範囲に入っておらず、検査は有効に見えたまま通った。 |
| 発行者の承認 | 一部 | そのカードの状態まで確かめる銀行は断ったが、通した銀行もあった。 |
| 中継を見つける仕組み（RRP） | 一部 | 任意の機能で、試したカードと端末では有効になっていなかった。 |
| 期限切れのカードの処分 | 一部 | 攻撃の入口を減らすが、雑に捨てられたカードは残る。 |

### 必要になるもの

1. **承認のとき、そのカードの有効期限と状態を、発行者の記録と照合する。** 口座が有効かではなく、その番号・その世代のカードが有効かを確かめる。
2. **有効期限が記録と合わない取引は、承認しない。** 端末の判断や処理の速さを理由に、照合を省かない。
3. **端末が読む有効期限を、署名の範囲に入れる。** ブランドと端末の側で、中継を見つける仕組みも有効にする。

### 点検チェックリスト

カードの決済を承認・受け付ける組織で確認する 3 項目

- 決済の承認で、有効期限を端末が送ってきた値ではなく、自社の記録と照合しているか。
- 口座ではなく、そのカード（番号・世代）が有効かを確かめているか。
- 期限切れや再発行で使わなくなったカードの処分の仕方（IC と磁気の部分を切る、窓口に返す）を、利用者に伝えているか。

注：研究者は実物の期限切れのカードから始めており、遠くからすべてのカードを狙える攻撃ではない。Visa や銀行が緩和を発表すれば、この Brief を改訂する。

## 6. Sources

- **USENIX Security 2026（研究・一次）**: Anwar, DeCunha, Raza, "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments"（2026-08） — <https://www.usenix.org/conference/usenixsecurity26/presentation/anwar>
- **Khwarizmi Lab（研究・一次・著者の要約）**: "Reviving expired cards for contactless payments" — <https://khwarizmilab.github.io/emvexpiredcards/>
- **The Register（報道）**: "Expired credit cards revived by researchers to make unauthorized payments"（2026-08-18） — <https://www.theregister.com/security/2026/08/18/expired-credit-cards-revived-by-researchers-to-make-unauthorized-payments/5289229>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
