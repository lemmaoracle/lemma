---
brief_no: 93
title: "A7A5：ルーブル建てステーブルコインが制裁下で累計 $110B を流した — 取引は誰でも追えるのに、送金主体の制裁属性を実行時に証明・遮断する層がない（CertiK / Elliptic）"
title_en: "A7A5: a ruble-backed stablecoin moved $110B under sanctions — fully traceable on-chain, yet nothing proves or blocks a sender's sanctions status at transaction time (CertiK / Elliptic)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2026-06-24
published: 2026-07-03
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "086-sumsub-support-environment-breach", "021-wirecard-balance-attestation"]
status: published
version: "1.0"
og_lead_ja: "A7A5 が制裁下で累計 $110B — 追えても実行時に制裁属性を遮断できない"
og_lead_en: "A7A5 moved $110B under sanctions — traceable, yet no attribute stops it at transaction time"
gap_detected: "取引はパブリックチェーン上で完全に可視で、分析企業・当局が事後にフローと関与主体を特定できた。"
gap_missing: "送金主体が制裁対象か、資金源が適法かを取引の実行時に検証・遮断する属性が、取引に伴走していない。"
gap_fix: "送金主体・資金源に検証可能な規制属性を同伴させ、対向側や決済インフラが実行前に制裁ステータスを検証して遮断できることを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

ルーブル建てステーブルコイン A7A5 が、制裁を受けながらオンチェーンで累計 1,100 億ドル超を移転していたと CertiK が報告した。A7A5 は Ilan Shor と、ロシア国有で防衛セクター向けの Promsvyazbank が関与して 2025 年に組成され、英政府は年間の取引額を約 900 億ドルと推計する。取引履歴はパブリックチェーン上で誰でも追跡できるにもかかわらず、送金の相手方が制裁対象・特定資金源に該当するかを取引の瞬間に証明して遮断する属性の層が欠けていたため、制裁指定やチェーン分析といった事後の手段でしか止められなかった。決済はすでに完了しており、事後の可視性では止められなかった。

---

## 2. 何が起きたか

- **対象**: A7A5（ルーブル・ペッグのステーブルコイン、2025 年 1 月ローンチ）。発行体はキルギス拠点の Old Vector LLC、組成主体は A7 LLC。
- **関与主体**: A7 LLC は Ilan Shor が 51% を保有するとされる。Shor はモルドバ国籍で英制裁対象、2014 年のモルドバ 3 銀行からの約 10 億ドル窃取に関して 2017 年に有罪判決を受けている。もう一方の主要株主は、ロシア国有で防衛セクター向けの Promsvyazbank（PSB）とされる（いずれも報道・分析企業に基づく）。
- **規模**: CertiK 集計でオンチェーン累計取引額は 1,100 億ドル超、非米ドル建てステーブルコイン市場の約 43% を占める。保有ウォレット数は 2025 年 2 月の約 1.3 万から 2026 年 5 月に約 2.9 万へ増加。英政府は年間取引額を約 900 億ドルと推計し、Elliptic はピーク時に日次約 10 億ドルが移転したとする。主要な取引の場は、制裁対象 Garantex の後継とされる取引所 Grinex。
- **根本原因（構造）**: パブリックチェーンは取引の可視性（検出）を提供するが、取引主体の規制属性 — 相手方が制裁対象か、資金源は適法か — を取引の実行前に証明・遮断する仕組みは提供しない。KYC / AML はオンボーディング時点の一過性チェックに依存し、オフショア取引所や自己ホストウォレット間の移転では、その確認結果が取引に伴走しない。

事象は次の連鎖で成立している。

1. **属性を伴わない移転手段の組成**: ルーブル建てステーブルコインを組成し、制裁下の資金に、安定した価値でオンチェーン移転できる手段を提供した。
2. **KYC 関門の回避**: オフショア取引所や自己ホストウォレットを経由することで、オンボーディング時 KYC が効く関門を通らずに移転が成立した。
3. **属性の非伴走**: 送金主体の「制裁対象」属性が取引データに伴走しないため、対向側や決済インフラは、正当な取引と区別できないまま受領した。
4. **事後の特定**: 当局・分析企業は、パブリックチェーン上で事後にフローを追跡し、パターンから関与主体を推定できた。
5. **取り消せない決済**: 制裁指定（SDN 追加）や取引所指定は事後措置であり、すでに決済された巨額の移転を取り消すことはできない。

---

## 3. 時系列 — 公表と対応

- 2025-01: A7A5 が組成・流通を開始。
- 2025-08-14: OFAC が A7 LLC・Old Vector LLC・Grinex ほか関連 6 主体を SDN リストに追加。
- 2026-04-08: 米 FinCEN・OFAC が GENIUS Act の枠組みで、認可決済ステーブルコイン発行体（PPSI）に AML / CFT・制裁コンプライアンスプログラムを課す規則を提案（2026-04-10 に連邦官報掲載）。
- 2026-04-23: EU が第 20 次制裁パッケージを採択。暗号関連の措置は 2026-05-24 に発効し、ロシア設立の暗号資産サービス提供者（CASP）を一括で禁止、Grinex 等を指定。
- 2026-06: CertiK が、制裁下でも A7A5 のオンチェーン累計取引額が 1,100 億ドルを超え、保有者数も増加したと報告。

> 注: 件数・取引額・株主構成は、CertiK・Elliptic 等の分析企業および報道に基づく。組成・関与主体の詳細は、当事者による検証可能な開示ではなく第三者分析に依拠する点を明示する。本 Brief は特定主体の動機を断罪するものではなく、規制属性が取引に伴走しないという構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- **OFAC**: 2025-08-14 に A7 LLC・Old Vector LLC・Grinex ほかを SDN リストに追加し、ステーブルコインを用いたロシア制裁回避を標的化した。
- **EU**: 第 20 次制裁パッケージ（2026-04-23 採択、暗号措置は 2026-05-24 発効）で、ロシア設立の CASP を一括禁止し、国家が支える instrument を規模拡大前に禁じる方向へ、個別指定から分野横断の枠組みへ軸足を移した。Grinex 等が指定され、キルギスが迂回対策の枠組みで活性化された。
- **米国**: FinCEN・OFAC が GENIUS Act に基づき、認可決済ステーブルコイン発行体に AML / CFT プログラムと、連邦法として初めて明示的に義務づけられる制裁コンプライアンスプログラム、および違法な取引を凍結・拒否する技術的能力を求める規則を提案した（2026-04）。
- **業界横断の論点**: 「オンボーディング時 KYC の限界」と、「取引に伴走する属性（トラベルルールの拡張、オンチェーンでの属性証明）」への関心が高まっている。可視性だけでは規制目的を達成できないという認識が、監視強化の次の設計課題として浮上している。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**取引に同伴する規制属性証明の不在**である。KYC / AML はオンボーディング時点の一過性チェックに留まり、以後の移転には「相手方が制裁対象か」「資金源は適法か」という属性が伴わない。ゆえに、取引がいかに可視であっても、実行の瞬間に検証・遮断できる層が存在しない。

[Brief 013](https://lemma.frame00.com/ja/critical/briefs/013-coinbase-kyc-insider-breach/)（Coinbase の内部経由 KYC データ漏洩）・[Brief 077](https://lemma.frame00.com/ja/critical/briefs/077-idmerit-kyc-data-exposure/)（IDMerit の露出と帰属不能）・[Brief 086](https://lemma.frame00.com/ja/critical/briefs/086-sumsub-support-environment-breach/)（Sumsub のサポート環境侵害）は、いずれも「KYC データの保有・保護」の失敗だった。本事案はその裏側にあたり、**KYC で確認したはずの属性が、以後の取引に伴走しない**という失敗であり、KYC / AML カテゴリの別側面を補完する。[Brief 021](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（Wirecard の残高証明偽装）とは、「属性・帰属の主張が検証されないまま流通する」点で連続する。ブリッジ設定系の事案がプロトコルの脆弱性を主題とするのに対し、本事案が示すのはプロトコルの欠陥ではなく、規制属性を取引に載せる層そのものの設計欠如である。

制裁の実効性が問われるのは、フローを事後に集計できるかどうかではなく、取引が起きる瞬間に相手方の属性を検証して遮断できるかどうかである。オフショア経路・自己ホストウォレット間の移転が増えるほど、オンボーディング時 KYC の空白は広がり、属性が伴走しない移転が再生産される。

パブリックチェーンの可視性は、事後分析にとって強力である。分析企業・当局は、A7A5 のフローを完全に追跡し、規模と関与主体を特定できた。**検出は機能した**。本 Brief はその役割を否定しない。

一方で、可視性は取引主体の属性を証明しない。取引の瞬間に「相手方が制裁対象か」「資金源が適法か」を検証・遮断する属性証明がなければ、決済は完了してしまい、事後の制裁指定では既に移転した資金を取り消せない。EU 第 20 次制裁パッケージや、GENIUS Act に基づく発行体への AML / 制裁義務は、継続的モニタリングと、違法な取引を凍結・拒否する能力を求める方向にある。しかしこれらは監視・スクリーニングを強化する枠組みであり、規制属性そのものを取引に同伴させ、実行前に検証可能にする層を与えるものではない。監視の網をどれだけ細かくしても、属性が取引に載っていなければ、対向側は実行の瞬間に相手を検証できない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）と検証可能な来歴は、この構造を反転させる。送金主体・資金源に、制裁ステータスと適法性への検証可能な参照を同伴させれば、対向側や決済インフラは取引の実行前に属性を検証し、範囲外を遮断できる。フローの可視性（detection）と、属性の証明（proof）は代替ではなく **補完** の関係にあり、両者が重なって初めて、制裁の実効性は事後追跡から事前遮断へと前進する。

本事案が示すのは、透明性（検出）だけでは規制目的を達成できないという構造である。オンチェーンの可視性は事後分析に強力だが、制裁の実効性が問われるのは取引が起きる瞬間であり、そこで相手方の属性を検証・遮断できなければ、可視であっても決済は通ってしまう。

- **取引に同伴する属性証明**: 送金主体・資金源に、制裁ステータスと適法性への検証可能な参照を同伴させ、対向側が取引の実行前に検証できるようにする
- **一過性でない検証**: KYC を「一度確認して終わり」から「取引ごとに証明が伴走する」モデルへ移し、オンボーディング以後の移転にも属性を伴わせる
- **原本を集約しない検証**: 「この主体は制裁非該当」「資金源は適法」といった結論だけを独立検証可能な証明として受け渡し、検証者が原本属性の集約点にならないようにする
- **事前遮断の検証可能性**: 範囲外の取引が実行前に停止したこと自体を検証可能な形で残し、事後追跡に頼らずに責任と適法性を証拠ベースで確定できるようにする

「取引の可視性 ≠ 取引主体の属性証明」という規制属性証明カテゴリの設計思想に対し、本事案はその想定する failure mode が、制裁下で累計 1,100 億ドルという規模で顕在化した事例である。フローの可視性（事後の検出）は分析と指定に、属性証明（事前の遮断）は制裁の実効性に、それぞれ相補的に働く。

---

## 6. Sources

- **CertiK（累計 1,100 億ドル・非 USD 建て市場の約 43%）**: “A7A5 Stablecoin Tops $110 Billion in Transactions Despite Sanctions”（FinanceFeeds、2026-06）— <https://financefeeds.com/a7a5-stablecoin-tops-110-billion-in-transactions-despite-sanctions/>
- **Elliptic（発行体・株主構成・OFAC 指定）**: “OFAC targets use of stablecoins for Russian sanctions evasion” — <https://www.elliptic.co/blog/ofac-targets-use-of-stablecoins-for-russian-sanctions-evasion>
- **Elliptic（累計取引額）**: “A7A5: the ruble-backed stablecoin crosses $100 billion in transactions” — <https://www.elliptic.co/blog/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions>
- **Elliptic（EU 第 20 次制裁パッケージ）**: “The EU's 20th sanctions package targets the architecture of crypto sanctions evasion” — <https://www.elliptic.co/blog/eu-20th-sanctions-package-targets-the-architecture-of-crypto-sanctions-evasion>
- **Holland & Knight（GENIUS Act 下の AML / 制裁規則提案）**: “FinCEN and OFAC Propose AML/Sanctions Rules for Stablecoin Issuers Under GENIUS Act”（2026-04）— <https://www.hklaw.com/en/insights/publications/2026/04/fincen-and-ofac-propose-aml-sanctions-rules-for-stablecoin-issuers>
- **Federal Register（PPSI の AML / CFT・制裁プログラム要件）**: “Permitted Payment Stablecoin Issuer Anti-Money Laundering / Countering the Financing of Terrorism…”（2026-04-10）— <https://www.federalregister.gov/documents/2026/04/10/2026-06963/permitted-payment-stablecoin-issuer-anti-money-launderingcountering-the-financing-of-terrorism>
