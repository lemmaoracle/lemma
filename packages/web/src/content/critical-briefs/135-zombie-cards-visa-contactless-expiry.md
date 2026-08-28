---
brief_no: 135
title: "Visa の EMV 非接触カードで、期限切れでも決済が通りうることが示された — 端末が読む有効期限が、発行者の署名済み記録と照合されていない"
title_en: "Expired Visa EMV contactless cards were shown to pass at checkout — the expiry the terminal reads is never collated against the issuer's signed record"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [identity-auth, data-provenance]
incident_date: 2026-08-18
published: 2026-08-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["006-google-api-key-revocation-lag", "032-booking-payout-account-tampering", "084-hong-kong-deepfake-video-call-fraud", "013-coinbase-kyc-insider-breach", "021-wirecard-balance-attestation"]
status: published
version: "1.0"
og_lead_ja: "Visa の EMV 非接触で期限切れカードの決済が通りうる、有効期限が未照合"
og_lead_en: "Expired Visa EMV contactless cards can pass; the terminal's expiry isn't bound to the record"
gap_detected: "検出は効きうる。異常な取引や失効カードの利用は、事後の監視の層として捉えられる。"
gap_missing: "端末が判定に使った有効期限が、発行者の署名済み記録と照合されていなかった。"
gap_fix: "取引が確定する前に、端末が判定に使う属性を、発行者の署名済み原本と暗号的に結び付けて照合する。"
---

## 1. TL;DR

USENIX Security 2026 で、研究者は Visa の非接触カードで**期限切れでも決済が通りうる**ことを示した。EMV の非接触取引は選択的にしか認証されておらず、端末が読む有効期限はカードの署名で保護されていない。端末が見る値と発行者が使う値は別のデータ項目にあり、暗号的に結び付いていなかった。**効かなかったのは、端末が判定に使った有効期限を、発行者の署名済み記録と照合する層である。**

## 2. 何が起きたか

- マサチューセッツ大学アマースト校の研究者（Raja Hasnain Anwar ほか）が、論文「Zombie Cards Back Online」で、期限切れの非接触カードを有効に見せかけて決済を通す手口を示した。
- EMV 非接触取引は、カードと端末が NFC で直接やり取りし、決済ネットワーク・銀行・発行者につながる。取引フローは選択的にしか認証されず、一部のデータは平文で送られ、後で暗号検証（ODA・発行者の暗号文）に結び付けられる。
- この構造が、NFC プロキシとして働くスマートフォンを使った中間者の介入を許した。研究者は、期限切れの非接触カードを「有効」と見せて購入を成立させた。
- 端末は「有効期限（Application Expiration Date）」に基づいて処理制限を評価するが、発行者はオンライン認可要求の別のデータ項目にある有効期限に依拠する。この 2 つは暗号的に結び付いているべきだが、Visa の実装では束ねられていない。攻撃者はカードと端末の間で、端末が見る値だけを書き換え、カードの通常の検査は有効に見えたまま通せた。
- Mastercard・American Express・Discover の構成では攻撃は通らず、Visa の非接触カードで通った。成否は銀行の扱いにも依存し、屈した銀行と屈しなかった銀行があった。

攻撃は次の連鎖で成立している。

1. 攻撃者が、カードと端末の間に NFC プロキシとして割り込む。
2. 平文でやり取りされ署名で束ねられていない有効期限を、端末が見る値だけ書き換える。
3. カードの通常の暗号検査は有効に見えたまま、端末は「有効なカード」として処理を進める。
4. 発行者側の判定が別データ項目・銀行依存であるため、照合の隙間を通って取引が成立する。

## 3. 時系列 — 公表と対応

- 2025-05：研究者が Visa と関係する銀行に所見を通知。
- 2025-12：研究者が Visa と銀行に再度通知。
- 2026-08：USENIX Security 2026 で発表。**Visa・通知した銀行のいずれも、有効期限の問題を緩和したとは確認していない。**

> 本 Brief は、実地の被害でなく研究者による実証を扱う。手口・対象（Visa の非接触構成が影響、Mastercard/Amex/Discover は耐性）・通知の経緯は USENIX 発表と著者の要約、独立報道に基づく。個別の被害額・被害者は主張しない。攻撃の成否は銀行の扱いにも依存する。

対応と論点は次のとおり。

- 端末と発行者が別々のデータ項目の有効期限に依拠し、両者が暗号的に結び付いていないことが核である。
- 実装の選択（後方互換・処理速度のための選択的認証）が、属性の照合の隙間を残していた。

## 4. なぜ止まらなかったか

この事案の失敗は、暗号そのものが破られたことではない。**端末が判定に使った有効期限が、発行者の署名済み記録と照合されていなかった**ことにある。

非接触取引は選択的にしか認証されない。速度と後方互換のために、一部のデータは平文で送られ、後段の暗号検証と結び付かない。端末が有効期限として読む値は署名で束ねられておらず、発行者が使う値とは別の項目にある。中間者は、端末が見る値だけを書き換え、カードの通常の検査を有効に見せたまま、「有効なカード」として処理を進めさせた。異常な取引や失効カードの利用を事後に監視で捉えることはできる。効かなかったのはその手前——端末が判定に使う属性を、発行者の署名済み原本と照合する層である。

> ある属性（有効期限）は、それが署名済みの原本と結び付いているかで意味が変わる。端末が読む値と、発行者が署名した値が別物のまま処理が進めば、端末は「有効」を、確かめないまま受け入れる。属性の正しさは、端末が読めることではなく、署名済み原本との照合で初めて担保される。

これは、失効後もしばらく有効だった資格情報が使われた [Brief 006](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)、正規プラットフォーム内で受領口座（送金先指示）が書き換えられた [Brief 032](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/) と同じ方向にある。共通するのは、行動が依拠する属性が、署名済みの原本と照合されないまま確定することである。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、取引が確定する一段手前に、端末が判定に使う属性を、発行者の署名済み原本と結び付けて照合する層を挟む。カードが本物かを見るのではない。「端末が読んだ有効期限は、発行者が署名した記録と一致するか」を、取引が成立する前に、実行側が確かめられる形にする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>属性の署名済み原本への照合</strong>：端末が判定に使う属性（有効期限など）を、発行者の署名済み記録と暗号的に結び付け、取引の前に一致を確かめる。端末が読めることを、正しさの代用にしない。</li>
<li><strong>行動前の照合ゲート</strong>：決済のように結果を伴う行動の直前に、依拠する属性が原本と照合済みであることの証明を要求する。選択的認証の隙間を、照合で埋める。</li>
<li><strong>属性の完全性バインド</strong>：平文でやり取りされる項目を、署名済みの原本と結び付け、中間で書き換えられた値がそのまま判定に乗らないようにする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>異常な取引や失効カードの利用を検知するのは、監視と不正検知の仕事である。この層はその手前で、属性が原本と照合済みかを確かめられるようにする。</li>
<li>証明が示せるのは属性が署名済み原本と一致していたかまでで、決済判断そのものの当否までは示せない。</li>
<li>どの属性に照合を課すかを決めるのは決済の設計者であり、この層が出せるのはその判断材料までである。</li>
</ul>

事後の取引記録との違いはここにある。記録は取引の後に残るが、その取引が依拠した属性が原本と一致していたかを、取引の前に確かめる材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者は異常な取引を後から捉え、後者は「行動が依拠する属性が、署名済み原本と照合されているか」を、取引が成立する前に確かめられるようにする。

## 6. Sources

- **USENIX Security 2026（研究一次）**: Anwar, DeCunha, Raza, "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments" — <https://www.usenix.org/conference/usenixsecurity26/presentation/anwar>
- **著者要約（研究一次）**: "Reviving expired cards for contactless payments"（Khwarizmi Lab）— <https://khwarizmilab.github.io/emvexpiredcards/>
- **The Register（独立報道）**: "Expired credit cards revived by researchers to make unauthorized payments"（2026-08-18）— <https://www.theregister.com/security/2026/08/18/expired-credit-cards-revived-by-researchers-to-make-unauthorized-payments/5289229>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。属性の証明は[Pillar 04 — 規制属性](https://lemma.frame00.com/ja/pillars/#attribute)。

緩和状況は公表時点で確認されていません。
