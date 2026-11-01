---
brief_no: 169
title: "Binance：不正な出金の取引が通り、暗号資産が流出"
title_en: "Binance: Unauthorised withdrawal transactions went through, and crypto was taken"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-10-29
published: 2026-11-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["081-bybit-safe-wallet-ui-injection", "155-tving-developer-key-hardcoded-production-keys"]
status: draft
version: "1.0"
og_lead_ja: "Binance から約 63 億ドルが流出、秘密鍵の漏えいは見つかっていない"
og_lead_en: "About US$6.3 billion taken from Binance, with no sign the private keys leaked"
search_title: "Binance の約 63 億ドル流出：経緯と対策"
search_description: "Binance から約 63 億ドル相当の暗号資産が流出した。同社は秘密鍵の漏えいの証拠は無いとし、不正な出金の取引が出されたと説明する。何が通り、署名の前に何を照合するかを整理。"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "サイバー攻撃事例 · 不正な出金"
og_kicker_en: "CYBERATTACK · UNAUTHORISED WITHDRAWALS"
og_headline_ja: "鍵の漏えいは\n見つかっていない。\n出金は通った。\n<accent>約 63 億ドルが流出</accent>"
og_headline_en: "No sign the keys leaked.\nThe withdrawals went through.\n<accent>About $6.3 billion taken.</accent>"
key_figures:
  - value: "約 63"
    unit: "億ドル"
    label: "流出した暗号資産（Binance の見積もり。TRM Labs の解析では送金時点の価格で約 63.6 億ドル）"
    tone: "alert"
  - value: "約 20"
    unit: "分"
    label: "流出の大半が出た時間（10 月 29 日 20:05 UTC から・TRM Labs）"
  - value: "10"
    unit: "チェーン"
    label: "資金が流出したブロックチェーンの数（TRM Labs）"
insight:
  slug: "valid-signature-not-approved-request"
  label: "正しい署名と、承認された依頼の区別"
  quote: "鍵が漏れていなくても、署名を依頼できる場所に入られれば、正しい署名で資金は動かせる。"
industries: ["finance"]
operations: ["approval"]
controls:
  - slug: "separate-approval"
    item: "出金の署名の前に、その依頼に対応する顧客の申請か、権限のある担当者の承認があるかを、依頼を出すサービスとは別の場所で照合する"
  - slug: "hold-unverified"
    item: "申請や承認に対応しない出金、上限を超える出金、出金ではない署名の依頼は、署名せずに保留する"
  - slug: "audit-trail"
    item: "どの出金が、どの申請や承認に基づいて署名されたかを、依頼を出すサービスの外に記録する"
attack_method: "privilege-abuse"
impact: "約 63 億ドルの暗号資産が流出した（Binance の見積もり。TRM Labs の解析では 10 のチェーンから約 63.6 億ドル）。約 27 億ドルが凍結され、Binance は損失を補うとしている"
takeaway: "鍵が漏れていなくても、署名を依頼できる場所に入られれば、正しい署名で資金は動かせる。"
self_check: "出金の署名の前に、その依頼に対応する顧客の申請か社内の承認があるかを照合しているか。"
countries: ["global"]
---

## 1. 要点

Binance は初期の調査で、侵害された DevOps 技術者のノート PC から攻撃者がサービスのコンテナに入り、不正な出金の取引を出した可能性があるとした。その後、ほかの侵入口も見つかったとしている。秘密鍵が漏れた証拠は見つかっていないと同社は説明している。TRM Labs の解析では、10 のチェーンから約 63.6 億ドル相当が流出し、その大半は約 20 分のうちだった。<strong>鍵が漏れていなくても、署名を依頼できる場所に入られれば、正しい署名で資金は動かせる。</strong>

## 2. 通った操作

- **通った操作**: Binance のホットウォレット（常に接続されていて、出金に使う財布）からの出金。Binance は「不正な出金の取引が出された」と説明している。TRM Labs は、攻撃者がチェーンをまたいで「Binance のホットウォレットの署名の仕組みに、任意の取引を署名させられるようになった」ことを、最も可能性が高い説明としている。Ethereum では、ホットウォレットの操作を攻撃者のプログラムに任せる署名（EIP-7702 の委任）が使われた。ウォレットの取引には通し番号があり、署名はその番号のときにしか使えない。攻撃者は、番号を 1 つずつずらした 50 件の署名をまとめて用意し、1 件の取引で出した（TRM Labs）。番号は誰でも読めるが、取引の多いウォレットでは取り込まれるまでに進むため、連続した番号を並べればどれか 1 件が合う。仕様では、番号の合わない署名は飛ばされるだけで、取引は止まらない（EIP-7702）。番号が合った 1 件が通り、その後は攻撃者の指示で残高が攻撃者のアドレスへ送られた。任せた状態は、取引の実行が失敗しても巻き戻らない仕様で（EIP-7702）、数時間のあいだ、入ってきた資金も繰り返し送られた。ほかの 9 チェーンは、通常の署名済みの送金だった（TRM Labs）。
- **受け付けた側に届くもの**: 一般に、ブロックチェーンは、正しい鍵で署名された取引をそのまま実行する。署名が正しいことは、その出金が顧客の申請や社内の承認に基づくことを示さない。
- **公表されていないこと**: 根本原因、侵入の手口、追加で見つかった侵入口の中身、署名の仕組みのどこに依頼が届いたか。

## 3. 何を照合するか

経路を問わず区別できる条件は、署名する側が、出金の依頼を出したサービスとは別の場所で、その依頼が顧客の申請や社内の承認に基づくかを、署名の前に照合することである。

- **誰が承認を出すか**: 顧客の出金は、顧客の端末で出した、金額と出金先に結びついた申請（パスキーでの承認や、取引所が秘密を持たない形式の API キーでの署名）。社内の資金の移動は、権限と上限を持つ担当者の承認か、担当者があらかじめ承認したルール（送り先は自社のアドレスだけ、1 時間の上限など）。どちらも、依頼を出すサービスや開発者の端末が作れない形で出す。
- **どこで照合するか**: 署名に必要な鍵の一部を持つ、別に運用する照合の側（共同署名者など）。照合を通らなければ署名がそろわない。対応する申請や承認が無い出金、上限を超える出金、出金ではない署名の依頼（ウォレットの操作をほかに任せる署名や、まとめて先に作る署名など）は、署名せずに保留する。
- **何が残るか**: どの出金が、どの申請や承認に基づいて署名されたかの記録。依頼を出したサービスの外に残る。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝署名する前に、出金の依頼が顧客の申請や社内の承認に基づくかを照合し、記録に残すこと。検知＝侵入や流出が起きた後に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>署名の前に、依頼の元の申請と承認を照合する</div>
<div class="rx-zone gapz"><b>その間</b><span>約 20 分で<br>流出の大半</span></div>
<div class="rx-zone det"><b>検知 · 気づいた後の手当て</b>出金を止め、発行体などが凍結する</div>
<div class="rx-g g1"><div class="t">10-28 から</div><b>攻撃者の資金の準備</b></div>
<div class="rx-g g2"><div class="t">10-29 20:05 UTC</div><b>主な流出が始まる</b></div>
<div class="rx-g g3"><div class="t">10-29 以降</div><b>出金を停止</b></div>
<div class="rx-g g4"><div class="t">10-29〜30</div><b>約 27 億ドルが凍結</b></div>
</div>
</figure>

出金の停止と凍結は、気づいた後の手当てである。事前に用意した署名を一度に実行する点は、TRM Labs によれば [Bybit](https://lemma.frame00.com/ja/critical/briefs/081-bybit-safe-wallet-ui-injection/)（署名者がいつもの送金だと思って承認した取引で、金庫の仕組みが書き換えられた）の件とも共通する。

## 4. Lemma でできること

**Lemma は、03 の照合を、署名に必要な鍵の一部を持つ照合の側として組み込む。** 侵入を見つけるのではなく、署名の前に、届いた署名の依頼が顧客の申請や権限のある承認に基づくかを照合する。

### 注意したい業界・業務

- **業界 · 金融**: 暗号資産の取引所、カストディ、決済の事業者。出金の依頼を自動で受け、ホットウォレットで署名している。
- **業界 · 開発者・エージェント運用**: 本番のサービスや署名の仕組みに届く権限を、開発や運用の端末に置いている組織。
- **業務 · 承認・決裁**: 出金や資金の移動の承認と、その上限の管理。

### いまの対策と Lemma の違い

| 対策 | 申請や承認の無い出金 | 上限を超える出金 | 出金でない署名（委任など） | 署名の仕組みそのものの操作 |
| --- | --- | --- | --- | --- |
| 鍵の保管（HSM・コールドウォレット） | 関係しない | 一部 | 関係しない | 一部 |
| 開発・運用の端末の防御（EDR・多要素認証） | 一部 | 一部 | 一部 | 一部 |
| 署名のポリシー（MPC・マルチシグの承認ルールと上限） | 一部 | 効く | 一部 | 一部 |
| 出金の停止と資金の凍結 | 一部 | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 効く | 効かない |

鍵が漏れていない場合を比べた。鍵の保管は鍵そのものを守り、コールドウォレットは、ホットに置く額で損失の上限を決める。端末の防御は入口を守る。署名のポリシーは、出金先の許可リスト・上限・承認の人数といった決めた規則を守る。ただし、自動の出金では、規則に合う依頼が本当に顧客の申請から来たかまでは見ないことが多い。停止と凍結は気づいた後に効く。Lemma は、署名の前に、依頼そのものの元を照合し、その記録を依頼を出すサービスの外に残す。

注：Lemma の照合が働くのは、照合の側が署名に必要な鍵の一部を持ち、承認の鍵が依頼を出すサービスや開発者の端末とは別にあり、出金だけでなく、すべての種類の署名の依頼が照合を通る場合に限る。照合の側そのものを操られた場合や、承認の権限ごと奪われた場合は通る。TRM Labs は、署名の仕組みに任意の取引を署名させられる状態だったとみている。照合の側が同じ仕組みの中にあれば、それは表の右の列に当たる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

暗号資産の取引所・カストディ・決済の事業者で確認する 4 項目

- 開発や運用の端末から、出金を依頼できるサービスに直接届かないようになっているか。
- ホットウォレットの残高と、時間あたりの出金に上限を決めているか。
- 出金ではない署名の依頼（ウォレットの操作をほかに任せる署名や、まとめて先に作る署名など）を、署名せずに止められるか。
- 顧客の出金の申請は、自社のサーバーでは作れない形（パスキーや、取引所が秘密を持たない API キー）で受けているか。

## 5. 事実と時系列

- **取引所**: Binance。暗号資産の取引所。
- **Binance の説明**: 初期の調査で、侵害された DevOps 技術者のノート PC から攻撃者がサービスのコンテナに入り、不正な出金の取引を出した可能性があるとした。秘密鍵が漏れた証拠は見つかっていない。その後、追加の侵入口が見つかったとした。共同 CEO の Richard Teng 氏は X で、攻撃者は 1 人の技術者の権限を使っただけではなく、1 回の操作（"one-click"）で済んだものでもないと述べ、調査は特定の個人の責任とはしていないとした（BleepingComputer）。根本原因は公表していない。
- **流出**: Ethereum、Bitcoin、Tron、XRP Ledger、Solana、Arbitrum、Avalanche、Optimism、Base、Polygon の 10 のチェーンから、送金時点の価格で約 63.6 億ドル（TRM Labs）。Binance の見積もりは約 63 億ドル、Chainalysis は約 64 億ドルとしており、推定は出典により 63〜64 億ドル。
- **凍結**: Tether、Circle、Ripple、World Liberty Financial が計約 26.7 億ドルのステーブルコインを凍結し、Arbitrum の Security Council は攻撃者のアドレスから約 3,000 万ドル相当を強制的に移した。合わせて約 27 億ドル（TRM Labs）。Binance は約 30 億ドルが凍結されたとしている。
- **補填**: Binance は、損失を SAFU（利用者保護の基金）の一部、先物の保険基金の一部、自社の資金で補うとした。10 月 31 日には、主な 10 銘柄の裏付けを 100% 回復し、全体で約 9 割を補ったとしている。
- **犯行の帰属**: TRM Labs と Chainalysis は、北朝鮮の TraderTraitor によるものとみている。FBI は 10 月 31 日、北朝鮮の TraderTraitor によるものとする警報を、シークレットサービス（USSS）・内国歳入庁の犯罪捜査部門（IRS-CI）と出した。Binance は、告知の中で特定の集団を名指ししていない。

### 時系列

- **2026-10-28**: 攻撃者の資金が Tornado Cash から運用のウォレットに動き始める。準備は流出の少なくとも 36 時間前から（TRM Labs）。
- **2026-10-29**: 20:05 UTC ごろから約 20 分で流出の大半。Ethereum の委任の取引は 20:20 UTC（TRM Labs）。23:05 UTC ごろ Avalanche・Polygon に第 2 波。Ethereum では委任が残り、23:56 UTC まで吸い上げが続いた（TRM Labs）。Binance は一部のチェーンの出金を止め、のちに全ての出金を止める（入金は通常どおりと Binance）。TRM Labs が TraderTraitor によるものと公表。
- **2026-10-30**: Binance が公式の告知で初期の調査結果（侵害された端末、サービスのコンテナ、不正な出金の取引）を説明し、続報で追加の侵入口を公表。Chainalysis が TraderTraitor によるものと公表。
- **2026-10-31**: Binance が約 9 割の補填と準備金の証明のスナップショットを公表し、11 月 1 日（日）の出金の再開を目指すとした。FBI が北朝鮮（TraderTraitor）によるものと公表。

> 事実は、Binance の公式の告知と、TRM Labs・Chainalysis の解析、FBI の警報に拠る。共同 CEO の発言は、X への投稿を引用した報道に拠る。根本原因は公表されていない。公表されていないことは、対策が無かったことを意味しない。11 月 1 日時点で、Binance の告知の一覧に出金の再開の告知は出ていない。

### 公表後の対応

- **停止と取り消し**: 出金を止め、影響を受けたアドレスの権限を取り消した。ブロックチェーン解析の会社や捜査機関と連携している。
- **補填と報告**: 10 月 31 日に準備金の証明（Proof of Reserves）のスナップショットを出し、完全な証明は 11 月 3 日ごろの見込みとした。原因の事後報告（post-mortem）を出すとしている。

## 6. Sources

- **Binance（一次・当事者の公表）**: "Security Incident Update"（2026-10-30） — <https://www.binance.com/en/support/announcement/detail/c5a8729a97ac486d963784d96c5642d7>
- **Binance（一次・当事者の公表）**: "Security Incident Update #2"（2026-10-30） — <https://www.binance.com/en/support/announcement/detail/d3306d9dca5243548c813b605e1d1751>
- **Binance（一次・当事者の公表）**: "Security Incident | Recovery Update #3"（2026-10-31） — <https://www.binance.com/en/support/announcement/detail/1fdf1f61559c401da0435895ffcccb62>
- **FBI（一次・捜査機関の警報）**: "North Korea Responsible for $6 Billion+ Binance Attack"（2026-10-31） — <https://www.fbi.gov/investigate/cyber/alerts/2026/north-korea-responsible-for-6-billion-binance-attack>
- **Ethereum Improvement Proposals（一次・仕様）**: "EIP-7702: Set Code for EOAs" — 委任の署名は 1 件ずつ判定し、無効なものは飛ばす・実行が失敗しても委任は巻き戻らない · <https://eips.ethereum.org/EIPS/eip-7702>
- **TRM Labs（独立解析）**: "North Korea Steals USD 6.36 Billion From Binance in the Largest Hack in History"（2026-10-29） — <https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history>
- **Chainalysis（独立解析）**: "The $6.4 Billion Binance Hack: Tracing the North Korea Link"（2026-10-30） — <https://www.chainalysis.com/blog/binance-exploit-latest-findings-and-response/>
- **BleepingComputer（報道）**: "Binance links $6.3 billion crypto theft to compromised DevOps laptop"（2026-10-30。共同 CEO の X への投稿を引用） — <https://www.bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop/>
- **TechCrunch（報道）**: "North Korean hackers blamed for stealing record $6.3B in Binance breach"（2026-10-30） — <https://techcrunch.com/2026/10/30/north-korean-hackers-blamed-for-stealing-record-6-3b-in-binance-breach/>
- **CNBC（報道）**: "Binance says 90% of $6.3 billion hack losses are now covered, plans to resume withdrawals Sunday"（2026-10-31） — <https://www.cnbc.com/2026/10/31/binance-hack-asset-coverage-withdrawals.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
