---
brief_no: 93
title: "A7A5：ルーブル建てのステーブルコインが、制裁の指定の後も取引を伸ばしたと報告された(CertiK・Elliptic の分析)"
title_en: "A7A5: a ruble-backed stablecoin kept growing after sanctions designations, analytics firms report (CertiK / Elliptic)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2026-06-24
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "086-sumsub-support-environment-breach", "021-wirecard-balance-attestation"]
status: published
gate: "payment-instruction"
version: "1.0"
search_title: "A7A5：ルーブル建てステーブルコインと制裁の経緯"
search_description: "ルーブル建てステーブルコイン A7A5 のオンチェーン累計取引額が、制裁の下でも 1,100 億ドルを超えたと報告された（CertiK）。何が起きたか、なぜ追えても決済の前に止まらないか、対策を整理。"
og_lead_ja: "A7A5：ルーブル建てステーブルコインの累計取引額が、制裁の下でも 1,100 億ドルを超えたと CertiK が報告"
og_lead_en: "A7A5: CertiK reports a ruble-backed stablecoin passed $110B in cumulative transactions under sanctions"
layout: "report"
sections: "proof"
og_kicker_ja: "制裁の事例 · ステーブルコイン"
og_kicker_en: "SANCTIONS CASE · STABLECOIN"
og_headline_ja: "ルーブル建ての暗号資産、\n制裁下でも取引が増える。\n<accent>累計 1,100 億ドル超と報告</accent>"
og_headline_en: "A ruble stablecoin\ngrows under sanctions.\n<accent>CertiK: over $110B moved</accent>"
key_figures:
  - value: "1,100 億"
    unit: "ドル超"
    label: "A7A5 のオンチェーン累計取引額。制裁の下でも伸びた（CertiK）"
    tone: "alert"
  - value: "約 43"
    unit: "%"
    label: "米ドル建て以外のステーブルコインの市場に占める割合（CertiK）"
  - value: "約 900 億"
    unit: "ドル"
    label: "年間の取引額の推計（英政府）"
glossary:
  - term: "ステーブルコイン"
    desc: "法定通貨などに価値を連動させた暗号資産。A7A5 はロシアのルーブルに連動する。"
  - term: "SDN リスト"
    desc: "米財務省の外国資産管理局（OFAC）が公表する制裁対象の一覧。載った主体との取引は、米国の制裁で禁じられる。"
  - term: "自己ホストウォレット"
    desc: "取引所などの事業者を介さず、利用者が自分で鍵を持つウォレット。事業者の本人確認（KYC）を通らずに送受信できる。"
insight:
  slug: "traceable-is-not-screened"
  label: "追えることは、受け取る前の照合ではない"
  quote: "取引が誰にでも追えることは、受け取る前に相手の制裁の属性を照合したことにはならず、照合が実行の前に無ければ、送金は決済が済んでから特定される。"
industries: ["finance"]
controls:
  - slug: "ownership-check"
    item: "送金主体と資金源の制裁の属性を、取引の実行前に確認する"
  - slug: "hold-unverified"
    item: "属性を確認できない取引は、実行の前に止める"
impact: "制裁下でオンチェーン累計 1,100 億ドル超が移転"
takeaway: "取引はパブリックチェーン上で誰でも追えたが、制裁の指定は決済済みの移転を取り消さない。受け取る前に、相手と資金源の制裁の属性を照合する。"
self_check: "暗号資産の送金を受け付ける前に、送り手と資金源が制裁の対象に当たらないかを照合しているか。"
countries: ["ru", "kg"]
---

## 1. 要点

A7A5 は 2025 年に、Ilan Shor と、ロシア国有で防衛セクター向けの Promsvyazbank が関与して組成されたとされる（報道・分析企業）。2025 年 8 月に米 OFAC が発行体と主要な取引所を制裁の対象に加え、CertiK は、制裁の下でも保有者の数が増えたと報告した。取引の履歴はパブリックチェーン上で誰でも追え、分析企業と当局はフローと関与した主体を特定できた。ただ、制裁の指定は、すでに決済された移転を取り消すものではない。<strong>取引が誰にでも追えることは、受け取る前に相手の制裁の属性を照合したことにはならず、照合が実行の前に無ければ、送金は決済が済んでから特定される。</strong>

## 2. 通った操作

- **通った操作**: ルーブル建てのステーブルコイン A7A5 の、オンチェーンでの移転。主要な取引の場は、制裁対象の Garantex の後継とされる取引所 Grinex だった（分析企業・報道）。オフショアの取引所や自己ホストウォレットを経由した移転では、オンボーディング時の KYC が効く関門を通らずに移転が成立したとされる。
- **受け付けた側に届くもの**: 一般に、オンチェーンの移転で受け取る側に届くのは、送り元のアドレスと金額で、送り手が制裁の対象か、資金源が適法かは、取引のデータには載らない。KYC はオンボーディングの時点の確認で、その結果が以後の個々の移転に伴って届くわけではない。
- **後から分かったこと**: 分析企業と当局は、パブリックチェーン上でフローを追跡し、規模と関与した主体を特定した。制裁の指定（SDN リストへの追加）や取引所の指定は、すでに決済された移転を取り消すものではない。
- **公表されていないこと**: 個々の移転の送り手と受け手が誰か、受け取った側がどの時点でどの確認をしていたか。

## 3. 実行前の照合

経路を問わず区別できる条件は、送金を受け付ける前に、送り手と資金源が制裁の対象に当たらないかを、取引が追えるかどうかとは別に照合することである。

- **誰が承認を出すか**: 送り手の本人確認と制裁の該当を確認した事業者と、その確認に基づいて「制裁の対象ではない」「資金源は適法」という結論を出す側。送り元のアドレスが見えることは、承認にならない。
- **どこで照合するか**: 取引所・決済の事業者が、移転を受け付けて決済する前。結論だけを受け渡し、受け取る側が原本の個人の属性を集めずに照合できるようにする。照合できない移転は、実行の前に保留する。
- **何が残るか**: どの移転を、どの確認の結論に基づいて受け付けたか、または止めたかの記録。あとから、受け付けの判断の根拠を示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝送金を受け付ける前に、送り手と資金源の制裁の属性を照合し、記録に残すこと。検知＝移転の後に、チェーンの分析でフローと主体を特定し、制裁を指定すること。日付は当局と分析企業の公表による。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>受け付ける前に、送り手と資金源の制裁の属性を照合する</div>
<div class="rx-zone gapz"><b>報告されたこと</b><span>制裁の指定の後も<br>累計の取引額が伸びた</span></div>
<div class="rx-zone det"><b>検知 · 移転の後に働いた</b>チェーンの分析で特定し、制裁を指定</div>
<div class="rx-g g1"><div class="t">2025-01</div><b>A7A5 が組成され、流通を始める</b></div>
<div class="rx-g g2"><div class="t">2025-08-14</div><b>OFAC が発行体・Grinex などを SDN リストに追加</b></div>
<div class="rx-g g3"><div class="t">2026-04-23</div><b>EU が第 20 次制裁パッケージを採択</b></div>
<div class="rx-g g4"><div class="t">2026-06</div><b>CertiK が累計 1,100 億ドル超と報告</b></div>
</div>
</figure>

チェーンの分析は、A7A5 のフローと関与した主体を特定し、制裁の指定につながったが、それは移転と決済が済んだ後の特定だった。KYC で預かったデータの保有と保護が問われた事案に、[Coinbase の内部経由の KYC データの漏えい](https://lemma.frame00.com/ja/critical/briefs/013-coinbase-kyc-insider-breach/)（Brief 013）、[IDMerit の露出](https://lemma.frame00.com/ja/critical/briefs/077-idmerit-kyc-data-exposure/)（Brief 077）、[Sumsub のサポート環境の侵害](https://lemma.frame00.com/ja/critical/briefs/086-sumsub-support-environment-breach/)（Brief 086）があり、本件は、KYC で確認した属性が以後の取引に伴わない側にあたる。属性の主張が照合されないまま流通した点は、[Wirecard の残高の偽装](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（Brief 021）と重なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、送金を受け付けて決済する手順に組み込む。** フローを追跡するのでも、制裁リストを作るのでもなく、受け付ける前に、送り手と資金源について「制裁の対象ではない」という確認の結論があるかを照合し、照合できない移転を止める。

### 注意したい業界・業務

- **業界 · 金融**: 暗号資産の取引所、ステーブルコインの発行体、暗号資産の送金を受け付ける決済の事業者。オンボーディングの時点の KYC と、以後の個々の移転の受け付けが、別の手順になっている。

### いまの対策と Lemma の違い

分析企業と報道によれば、今回の主な経路は 2 列目（オフショアの取引所と自己ホストウォレットを経由する移転）である。

| 対策 | 規制の下にある取引所・発行体での移転の受け付け | オフショアの取引所・自己ホストウォレットを経由する移転 |
| --- | --- | --- |
| オンボーディングの時点の KYC | 一部 | 効かない |
| 取引の監視と制裁リストとのスクリーニング | 一部 | 効かない |
| **Lemma（実行の前の照合）** | 効く | 一部 |

オンボーディングの時点の KYC は、口座を開くときの確認で、その結果が以後の個々の移転に伴って届くわけではない。取引の監視とスクリーニングは、規制の下にある事業者の中で働き、その関門を通らない移転には届かない。EU の第 20 次制裁パッケージと、GENIUS Act に基づく発行体への規則の案は、この監視と、違法な取引を凍結・拒否する能力を求める方向にある。Lemma は、送り手と資金源についての確認の結論を、受け付けの前に照合し、照合できない移転を止め、その記録を残す。

注：Lemma の照合が働くのは、受け付ける側の事業者が、移転の受け付けと決済の手順に照合を組み込み、確認の結論が、送り手とは別の確認した事業者から発行されている場合に限る。照合を組み込んでいない取引所や、自己ホストウォレットの間だけで完結する移転には働かない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではなく、制裁の対象かどうかを判定するものでもない。

### 点検チェックリスト

暗号資産の送金を受け付ける事業者で確認する 3 項目

- オンボーディングの後の個々の移転についても、送り手の制裁の該当を確認する手順があるか。
- 送り手と資金源の制裁の該当を確認できない移転を、決済の前に保留する手順があるか。
- どの移転を、どの確認に基づいて受け付けたか、または止めたかを記録しているか。

## 5. 事実と時系列

- **対象**: A7A5（ルーブル・ペッグのステーブルコイン、2025 年 1 月にローンチ）。発行体はキルギスを拠点とする Old Vector LLC、組成した主体は A7 LLC。
- **関与した主体**: A7 LLC は Ilan Shor が 51% を保有するとされる。Shor はモルドバ国籍で英国の制裁の対象で、2014 年のモルドバの 3 銀行からの約 10 億ドルの窃取に関して 2017 年に有罪判決を受けている。もう一方の主要な株主は、ロシア国有で防衛セクター向けの Promsvyazbank（PSB）とされる（いずれも報道・分析企業に基づく）。
- **規模**: CertiK の集計で、オンチェーンの累計取引額は 1,100 億ドル超、米ドル建て以外のステーブルコインの市場の約 43% を占める。保有するウォレットの数は、2025 年 2 月の約 1.3 万から 2026 年 5 月に約 2.9 万へ増えた。英政府は年間の取引額を約 900 億ドルと推計し、Elliptic はピーク時に日次で約 10 億ドルが移転したとする。
- **取引の場**: 主要な取引の場は、制裁対象の Garantex の後継とされる取引所 Grinex（分析企業・報道）。

### 時系列

- **2025-01**: A7A5 が組成され、流通を始める。
- **2025-08-14**: OFAC が、A7 LLC・Old Vector LLC・Grinex ほか関連する 6 主体を SDN リストに追加する。
- **2026-04-08**: 米 FinCEN と OFAC が、GENIUS Act の枠組みで、認可決済ステーブルコインの発行体（PPSI）に AML / CFT と制裁のコンプライアンスのプログラムを課す規則を提案する（2026-04-10 に連邦官報に掲載）。
- **2026-04-23**: EU が第 20 次制裁パッケージを採択する。暗号資産に関する措置は 2026-05-24 に発効し、ロシアで設立された暗号資産サービス提供者（CASP）を一括で禁止し、Grinex などを指定する。
- **2026-06**: CertiK が、制裁の下でも A7A5 のオンチェーン累計取引額が 1,100 億ドルを超え、保有者の数も増えたと報告する。

> 件数・取引額・株主の構成は、CertiK・Elliptic などの分析企業と報道に基づく。組成と関与した主体の詳細は、当事者による検証可能な開示ではなく、第三者の分析に拠る。制裁の回避という評価は、当局と分析企業によるものである。本 Brief は、特定の主体の動機を断じるものでも、個々の取引所や利用者の対応を評価するものでもない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **OFAC**: 2025-08-14 に、A7 LLC・Old Vector LLC・Grinex ほかを SDN リストに追加し、ステーブルコインを用いたロシアの制裁の回避を標的にした（Elliptic）。
- **EU**: 第 20 次制裁パッケージ（2026-04-23 採択、暗号資産の措置は 2026-05-24 発効）で、ロシアで設立された CASP を一括で禁止し、国家が支える instrument を規模が大きくなる前に禁じる方向へ、個別の指定から分野横断の枠組みへ軸足を移した。Grinex などが指定され、キルギスが迂回対策の枠組みで活性化された（Elliptic）。
- **米国**: FinCEN と OFAC が GENIUS Act に基づき、認可決済ステーブルコインの発行体に、AML / CFT のプログラムと、連邦法として初めて明示的に義務づけられる制裁のコンプライアンスのプログラム、違法な取引を凍結・拒否する技術的な能力を求める規則を提案した（2026-04）。
- **業界の論点**: オンボーディングの時点の KYC の限界と、取引に伴う属性（トラベルルールの拡張、オンチェーンでの属性の確認）への関心が高まっている。

## 6. Sources

- **CertiK（累計 1,100 億ドル・非 USD 建て市場の約 43%）**: “A7A5 Stablecoin Tops $110 Billion in Transactions Despite Sanctions”（FinanceFeeds、2026-06）— <https://financefeeds.com/a7a5-stablecoin-tops-110-billion-in-transactions-despite-sanctions/>
- **Elliptic（発行体・株主構成・OFAC 指定）**: “OFAC targets use of stablecoins for Russian sanctions evasion” — <https://www.elliptic.co/blog/ofac-targets-use-of-stablecoins-for-russian-sanctions-evasion>
- **Elliptic（累計取引額）**: “A7A5: the ruble-backed stablecoin crosses $100 billion in transactions” — <https://www.elliptic.co/blog/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions>
- **Elliptic（EU 第 20 次制裁パッケージ）**: “The EU's 20th sanctions package targets the architecture of crypto sanctions evasion” — <https://www.elliptic.co/blog/eu-20th-sanctions-package-targets-the-architecture-of-crypto-sanctions-evasion>
- **Holland & Knight（GENIUS Act 下の AML / 制裁規則提案）**: “FinCEN and OFAC Propose AML/Sanctions Rules for Stablecoin Issuers Under GENIUS Act”（2026-04）— <https://www.hklaw.com/en/insights/publications/2026/04/fincen-and-ofac-propose-aml-sanctions-rules-for-stablecoin-issuers>
- **Federal Register（PPSI の AML / CFT・制裁プログラム要件）**: “Permitted Payment Stablecoin Issuer Anti-Money Laundering / Countering the Financing of Terrorism…”（2026-04-10）— <https://www.federalregister.gov/documents/2026/04/10/2026-06963/permitted-payment-stablecoin-issuer-anti-money-launderingcountering-the-financing-of-terrorism>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
