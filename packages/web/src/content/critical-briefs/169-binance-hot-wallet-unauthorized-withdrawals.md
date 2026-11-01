---
brief_no: 169
title: "Binance：不正な出金の依頼が通り、約 63 億ドルの暗号資産が流出"
title_en: "Binance: Unauthorised withdrawal requests went through, and about US$6.3 billion in crypto was taken"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-10-29
published: 2026-11-01
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["081-bybit-safe-wallet-ui-injection", "166-litellm-v1107-pypi-compromise"]
status: draft
version: "1.0"
og_lead_ja: "Binance から約 63 億ドルが流出、秘密鍵の漏えいは見つかっていない"
og_lead_en: "About US$6.3 billion taken from Binance, with no sign the private keys leaked"
search_title: "Binance の約 63 億ドル流出：経緯と対策"
search_description: "Binance から約 63 億ドルの暗号資産が流出した。同社は秘密鍵の漏えいの証拠は無いとし、不正な出金の取引が出されたと説明する。何が通り、署名の前に何を照合するかを整理。"
layout: "report"
sections: "proof"
gate: "signing"
victim_desk:
  ja: "Binance の利用者の方へ：ご自身の資産や出金の再開についての確認は、Binance の公式の案内とサポートへ。当サイトは Binance とは関係がありません。"
  en: "Binance users: for your own assets or when withdrawals resume, check Binance's official announcements and support. This site is not affiliated with Binance."
  url: "https://www.binance.com/en/support"
og_kicker_ja: "サイバー攻撃事例 · 権限の悪用"
og_kicker_en: "CYBERATTACK · PRIVILEGE ABUSE"
og_headline_ja: "鍵の漏えいは\n見つかっていない。\n出金は通った。\n<accent>約 63 億ドルが流出</accent>"
og_headline_en: "No sign the keys leaked.\nThe withdrawals went through.\n<accent>About $6.3 billion taken.</accent>"
key_figures:
  - value: "約 63"
    unit: "億ドル"
    label: "流出した暗号資産（TRM Labs の推定。送金時点の価格で約 63.6 億ドル）"
    tone: "alert"
  - value: "約 20"
    unit: "分"
    label: "主な流出が続いた時間（10 月 29 日 20:05 UTC から・TRM Labs）"
  - value: "10"
    unit: "チェーン"
    label: "資金が流出したブロックチェーンの数（TRM Labs）"
insight:
  slug: "valid-signature-not-approved-request"
  label: "正しい署名と、承認された依頼の区別"
  quote: "鍵が漏れていなくても、出金を依頼できる場所に入られれば、正しい署名で出金は通りうる。"
industries: ["finance"]
operations: ["approval"]
controls:
  - slug: "separate-approval"
    item: "出金の署名の前に、その依頼に対応する顧客の申請か、権限のある担当者の承認があるかを、依頼を出すサービスとは別の場所で照合する"
  - slug: "hold-unverified"
    item: "申請や承認に対応しない出金、上限を超える出金、想定していない種類の署名は、署名せずに保留する"
  - slug: "audit-trail"
    item: "どの出金が、どの申請や承認に基づいて署名されたかを、依頼を出すサービスの外に記録する"
attack_method: "privilege-abuse"
impact: "10 のチェーンから約 63 億ドルの暗号資産が流出した（TRM Labs の推定）。約 27 億ドルが凍結され、Binance は損失を自社で補うとしている"
takeaway: "鍵が漏れていなくても、出金を依頼できる場所に入られれば、正しい署名で出金は通りうる。署名の前に依頼の元を照合しているかは、公表からは分からない。"
self_check: "出金の署名の前に、その依頼に対応する顧客の申請か社内の承認があるかを照合しているか。"
countries: ["global"]
---

## 1. 要点

Binance によると、侵害された DevOps 技術者のノート PC を起点に、攻撃者がサービスのコンテナに入り、不正な出金の取引を出した。秘密鍵が漏れた証拠は見つかっていないと同社は説明している。TRM Labs の解析では、約 20 分のうちに 10 のチェーンから約 63 億ドル相当が流出した。<strong>鍵が漏れていなくても、出金を依頼できる場所に入られれば、正しい署名で出金は通りうる。</strong>

## 2. 通った操作

- **通った操作**: Binance のウォレットからの出金。Binance は「不正な出金の取引が出された」と説明している。TRM Labs は、攻撃者が「Binance のホットウォレットの署名の仕組みに、任意の取引を署名させられるようになった」と見ている。Ethereum では、ホットウォレットが事前に署名した EIP-7702 の委任 50 件が 1 件の取引で出され、ウォレットの中身が攻撃者の契約へ移された。ほかの 9 チェーンは、通常の署名済みの送金だった（TRM Labs）。
- **受け付けた側に届くもの**: 一般に、ブロックチェーンは、正しい鍵で署名された取引をそのまま実行する。署名が正しいことは、その出金が顧客の申請や社内の承認に基づくことを示さない。
- **公表されていないこと**: 根本原因、侵入の手口、追加で見つかった侵入口の中身、署名の仕組みのどこに依頼が届いたか、ホットウォレットの残高の上限や補充の仕組み。

## 3. 何を照合するか

経路を問わず区別できる条件は、署名する側が、出金の依頼を出したサービスとは別の場所で、その依頼が顧客の申請や社内の承認に基づくかを、署名の前に照合することである。

- **誰が承認を出すか**: 顧客の出金は、顧客が自分の端末の鍵で出した申請。社内の資金の移動は、権限と上限を持つ担当者の承認。どちらも、依頼を出すサービスや開発者の端末とは別の鍵で出す。
- **どこで照合するか**: 署名する仕組み（HSM や共同署名者）の中。対応する申請や承認が無い出金、上限を超える出金、想定していない種類の署名（多数の委任の事前署名など）は、署名せずに保留する。
- **何が残るか**: どの出金が、どの申請や承認に基づいて署名されたかの記録。依頼を出したサービスの外に残る。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝署名する前に、出金の依頼が顧客の申請や社内の承認に基づくかを照合し、記録に残すこと。検知＝侵入や流出が起きた後に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>署名の前に、依頼の元の申請と承認を照合する</div>
<div class="rx-zone gapz"><b>その間</b><span>約 20 分で<br>10 のチェーンから流出</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>入出金を止め、凍結を依頼する</div>
<div class="rx-g g1"><div class="t">10-28 から</div><b>攻撃者の資金の準備</b></div>
<div class="rx-g g2"><div class="t">10-29 20:05 UTC</div><b>主な流出が始まる</b></div>
<div class="rx-g g3"><div class="t">10-29 以降</div><b>入出金を停止</b></div>
<div class="rx-g g4"><div class="t">10-29〜30</div><b>約 27 億ドルが凍結</b></div>
</div>
</figure>

入出金の停止と凍結の依頼は、気づいた後の手当てである。署名の前に依頼の元を照合していたかは、公表からは分からない。署名する側が見ていたものと、実際に署名された中身が食い違いうる点は、[Bybit](https://lemma.frame00.com/ja/critical/briefs/081-bybit-safe-wallet-ui-injection/)（署名者の画面に JavaScript が注入され、正規のマルチシグ承認で資金が移った）の件とも共通する論点である。

## 4. Lemma でできること

**Lemma は、03 の照合を、署名する仕組みに組み込む。** 侵入を見つけるのではなく、署名の前に、届いた出金の依頼が顧客の申請や権限のある承認に基づくかを確かめる。

### 注意したい業界・業務

- **業界 · 金融**: 暗号資産の取引所、カストディ、決済の事業者。出金の依頼を自動で受け、ホットウォレットで署名している。
- **業界 · 開発者・エージェント運用**: 本番のサービスや署名の仕組みに届く権限を、開発や運用の端末に置いている組織。
- **業務 · 承認・決裁**: 出金や資金の移動の承認と、その上限の管理。

### いまの対策と Lemma の違い

| 対策 | 申請や承認の無い出金 | 上限を超える出金 | 署名の仕組みそのものの操作 |
| --- | --- | --- | --- |
| 秘密鍵の厳重な管理（HSM・コールドウォレット） | 関係しない | 関係しない | 一部 |
| 開発・運用の端末の防御（EDR・多要素認証） | 一部 | 一部 | 一部 |
| 入出金の停止と資金の凍結 | 一部 | 一部 | 一部 |
| 損失の補填 | 関係しない | 関係しない | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 効く | 効かない |

鍵が漏れていない場合を比べた。鍵の管理は鍵そのものを守り、端末の防御は入口を守り、停止と凍結は気づいた後に効く。Lemma だけが、署名の前に、依頼そのものの元を照合する。

注：Lemma の照合が働くのは、署名する仕組みに照合を組み込み、承認の鍵が依頼を出すサービスや開発者の端末とは別にある場合に限る。署名の仕組みや照合の仕組みそのものを操られた場合、承認の権限ごと奪われた場合は通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

暗号資産の取引所・カストディ・決済の事業者で確認する 3 項目

- 開発や運用の端末から、出金を依頼できるサービスに直接届かないようになっているか。
- ホットウォレットの残高と、時間あたりの出金に上限を決めているか。
- 想定していない種類の署名の依頼（多数の委任の事前署名など）を、署名せずに止められるか。

## 5. 事実と時系列

- **取引所**: Binance。暗号資産の取引所。
- **Binance の説明**: 初期の調査で、侵害された DevOps 技術者のノート PC から、攻撃者がサービスのコンテナに入り、不正な出金の取引を出したとした。秘密鍵が漏れた証拠は見つかっていない。その後、追加の侵入口が見つかったとし、共同 CEO の Richard Teng 氏は、攻撃者は 1 人の技術者の権限を使っただけではなく、1 回の操作で済んだものでもないと述べた。根本原因は公表していない。
- **流出**: Ethereum、Bitcoin、Tron、XRP Ledger、Solana、Arbitrum、Avalanche、Optimism、Base、Polygon の 10 のチェーンから、送金時点の価格で約 63.6 億ドル（TRM Labs）。Binance の見積もりは約 63 億ドル。
- **凍結**: Tether、Circle、Ripple などが計約 26.7 億ドルのステーブルコインを凍結し、Arbitrum の Security Council も一部を凍結した（TRM Labs）。Binance は約 30 億ドルが凍結されたとしている。
- **補填**: Binance は、損失を SAFU（利用者保護の基金）と自社の資金で補うとした。10 月 31 日には、主な 10 銘柄の裏付けを 100% 回復し、全体で約 9 割を補ったとしている。
- **犯行の帰属**: TRM Labs と Chainalysis は、北朝鮮の TraderTraitor によるものとみている。CNBC によれば、FBI は 10 月 31 日、北朝鮮によるものと判断したと述べた。Binance は特定の集団を名指ししていない。

### 時系列

- **2026-10-28**: 攻撃者の資金が Tornado Cash から運用のウォレットに動き始める。準備は流出の少なくとも 36 時間前から（TRM Labs）。
- **2026-10-29**: 20:05 UTC ごろから約 20 分で主な流出。Ethereum の委任の取引は 20:20 UTC（TRM Labs）。Binance は一部のチェーンの出金を止め、のちに全ての入出金を止める。
- **2026-10-30**: Binance が初期の調査結果（侵害された端末、サービスのコンテナ、不正な出金の取引）を説明。TRM Labs と Chainalysis が TraderTraitor によるものと公表。
- **2026-10-31**: Binance が約 9 割の補填を公表し、11 月 1 日（日）の出金の再開を目指すとした。FBI が北朝鮮によるものと判断（CNBC）。

> 事実は、報道が引用した Binance の説明と、TRM Labs・Chainalysis の解析に拠る。Binance の公式の説明は X への投稿のため、出典には引用した報道を挙げる。根本原因は公表されていない。公表されていないことは、対策が無かったことを意味しない。11 月 1 日時点で、出金の再開は確認できていない。

### 公表後の対応

- **停止と取り消し**: 入出金を止め、影響を受けたアドレスの権限を取り消した。ブロックチェーン解析の会社や捜査機関と連携している。
- **補填と報告**: 損失を自社で補い、対応が終わったあとに準備金の証明（Proof of Reserves）を更新するとしている。

## 6. Sources

- **TRM Labs（独立解析）**: "North Korea Steals USD 6.36 Billion From Binance in the Largest Hack in History"（2026-10-29） — <https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history>
- **BleepingComputer（報道）**: "Binance links $6.3 billion crypto theft to compromised DevOps laptop"（2026-10-30。Binance と共同 CEO の説明を引用） — <https://www.bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop/>
- **TechCrunch（報道）**: "North Korean hackers blamed for stealing record $6.3B in Binance breach"（2026-10-30。Binance の広報の説明を引用） — <https://techcrunch.com/2026/10/30/north-korean-hackers-blamed-for-stealing-record-6-3b-in-binance-breach/>
- **CNBC（報道）**: "Binance hack: Investigators in a 'cat and mouse game' to recover $6.3 billion in stolen funds"（2026-10-30） — <https://www.cnbc.com/2026/10/30/binance-hack-stolen-crypto-recovery.html>
- **CNBC（報道）**: "Binance says 90% of $6.3 billion hack losses are now covered, plans to resume withdrawals Sunday"（2026-10-31。補填と FBI の判断） — <https://www.cnbc.com/2026/10/31/binance-hack-asset-coverage-withdrawals.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
