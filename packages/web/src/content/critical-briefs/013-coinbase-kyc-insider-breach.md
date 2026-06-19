---
brief_no: 13
title: "Coinbase KYC データ内部漏洩 — 規制が要求する生の個人情報の保管が、内部買収で漏洩面に転化した構造"
title_en: "The Coinbase KYC Insider Breach — When Regulation-Mandated Storage of Raw PII Becomes the Breach Surface"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth"]
incident_date: 2025-05-15
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["006-google-api-key-revocation-lag", "002-stakedao-vsdcrv"]
version: "1.0"
status: published
og_lead_ja: "規制が要求する生の個人情報の保管が内部買収で漏洩面化 — Coinbase KYC"
og_lead_en: "Regulation-mandated raw PII storage became the breach surface via insider — Coinbase KYC"
gap_detected: "社内不正を認識した後は、開示・懸賞金設定・サポート体制の見直しと、被害顧客への返金まで動けた。"
gap_missing: "規制対応で集めて保管している生の個人情報そのものが、正規の業務アクセス権を持つ内部者にとって常に手の届く場所にあり、買収されればそのまま社外へ持ち出せた。"
gap_fix: "規制が求める本人確認を、生の個人情報を抱え込まず「この利用者は確認済みである」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2025 年 5 月、Coinbase は、海外（インド）の委託先カスタマーサポート要員が金銭で買収され、少なくとも 69,461 名分の本人確認データ（氏名・住所・連絡先・下 4 桁の SSN・銀行口座情報・政府発行 ID の画像・残高や取引の履歴）を社外に持ち出して売却していたと公表した。パスワード・秘密鍵・資金は流出していない。攻撃者は 5 月 11 日に 2,000 万ドルの身代金を要求し、Coinbase は支払いを拒否して同額の懸賞金を設定、規制当局への報告では復旧費用を 1.8 億〜4 億ドルと見積もった。本人確認のために規制上集めざるを得ない個人情報そのものが、内部の人間を経由した漏洩の標的になった、という構図である。

---

## 1. 事案概要

- **影響を受けた組織**: Coinbase（米国の規制対象暗号資産取引所）
- **攻撃主体**: 外部委託のカスタマーサポート要員（主にインド）を買収した攻撃者。内部サポートツールへのアクセスを経由
- **手口**: 買収された要員が顧客データを内部ツールから取得（写真撮影を含む）し、1 件あたり少額（報道では約 200 ドル）で攻撃者に売却
- **影響規模**: 少なくとも 69,461 名（月間取引ユーザーの約 1% 未満）
- **流出データ**: 氏名、メール、郵送先住所、電話番号、マスク済み SSN（下 4 桁）、銀行口座識別子、政府発行 ID 画像、残高・取引履歴のスナップショット
- **流出しなかったもの**: パスワード、シードフレーズ／秘密鍵、資金（Coinbase Prime は非影響）
- **恐喝**: 2025-05-11 に攻撃者が 2,000 万ドル（BTC）の身代金を要求。Coinbase は支払いを拒否し、同額の懸賞金を設定
- **規制開示・費用**: 2025-05-15 に SEC へ Form 8-K を提出。復旧・補償費用を 1.8 億〜4 億ドルと見積もり
- **対応**: 詐取された顧客への返金、米国内サポート拠点の新設、影響顧客への ID 盗難保護・信用監視の提供

---

## 2. タイムライン

- 2024-09 〜 2024-12: 委託先サポート要員による顧客データの不正取得が開始（Maine への届出では侵害日を 2024-12-26 と記載）
- 2024-12 〜 2025-05: 数か月にわたり継続的にデータが取得・売却される
- 2025-05-11: 攻撃者が 2,000 万ドルの身代金を要求。Coinbase が内部不正を認識
- 2025-05-15: Coinbase が公式声明（支払い拒否・2,000 万ドルの懸賞金設定）を公表。同日 SEC へ Form 8-K を提出、復旧費用 1.8 億〜4 億ドルを開示
- 2025-05-21 前後: 影響者数（少なくとも 69,461 名）と流出データ種別が報道で確認される

---

## 3. 攻撃ベクター

1. **Regulatory data accumulation（前提）**: KYC/AML 規制の遵守として、Coinbase は顧客の生 PII（政府発行 ID 画像、SSN、銀行情報等）を収集・保管していた。これは規制上要求される属性確認の副産物として蓄積された
2. **Insider recruitment**: 攻撃者が外部委託のサポート要員（海外）を金銭で買収。正規の業務アクセス権を持つ内部者を経路に選択
3. **Authorized-access exfiltration**: 買収された要員が、内部サポートツールを通じて正規の権限の範囲で顧客データにアクセスし、写真撮影等で外部へ持ち出し
4. **Monetization**: 取得データを攻撃者に売却（報道では 1 件約 200 ドル）。攻撃者側でデータを集約
5. **Extortion**: 集約データを材料に 2,000 万ドルの身代金を要求。公開を脅迫
6. **Impact realization**: 69,461 名超の KYC データが攻撃者の手に渡り、二次的なソーシャルエンジニアリング・なりすまし・資金詐取の素材となった。資金・秘密鍵は直接流出していないが、属性データの漏洩が下流被害の起点となった

---

## 4. 構造的論点

本事案は Pillar 04（規制属性証明）の `kyc-aml-disclosure` カテゴリに属する。中心的な失敗 primitive は、規制（KYC/AML）が事業者に顧客の生 PII の収集・保管を要求し、その保管された属性データそのものが、正規アクセス権を持つ内部者を経由して漏洩する攻撃面に転化した点にある。攻撃は脆弱性ではなく、正規の業務アクセスと「データが存在すること」自体を突いた。secondary に `identity-auth` を併記する。

Brief 006（Google API key の失効遅延）と同じ Pillar 04 だが primitive が異なる。Brief 006 は属性証明（credential）が失効すべき時に失効されない遅延の問題、本事案は属性確認のために収集された生データが保管段階で漏洩する問題。両者は「規制属性の trust が、それを担保する layer の構造的弱点で破れる」という点で同根。Brief 002（Stake DAO、暗号資産領域の identity / 権限）とも、規制対象事業者における trust boundary という文脈で隣接する。本事案は攻撃 incident であり、KYC を「約束」として運用する設計（生 PII を集めて守る）の限界を示す。

---

## 5. 検出と証明の落差

内部脅威検知、アクセス異常検知、DLP、委託先ガバナンスは、本事案のような insider 経由の漏洩の早期発見・封じ込めに不可欠であり、本 Brief がその役割を否定するものではない。Coinbase が不正を認識し、開示・懸賞金・サポート体制の見直しに動いたことも、検出と対応の機能が働いた結果である。

一方で、検出は「データが保管されていること」自体を変えない。KYC/AML を生 PII の収集・保管で満たす設計では、その属性データは正規アクセス権を持つ内部者にとって常に到達可能であり、買収・誤用が成立すれば検出は事後の封じ込めにしかならない。規制遵守を「事業者が生 PII を集めて適切に守る」という約束として運用する限り、守るべきデータの存在そのものが漏洩面であり続ける。規制報告・監査で「属性確認は適正に行われ、かつ最小限の開示で完結したか」を立証する材料としても、生 PII の保管ログは漏洩リスクと不可分である。

事前証明（attribute attestation）は、属性確認（KYC 通過・許可された jurisdiction・サンクション非該当・年齢等）を、検証側が生 PII を保管しないまま独立検証可能な暗号証明（ZK 属性証明）として受け取る設計を採る。検証側は「この利用者は KYC を満たす / 許可属性を持つ」を proof で確認でき、政府発行 ID 画像や SSN そのものを warehouse しない。漏洩面となる生 PII の蓄積を最小化することで、内部買収が成立しても流出し得るデータが構造的に縮小する。検出（insider monitoring 等）と事前証明（attribute proof）は代替ではなく **補完** の関係にある。

---

## 6. 対応経緯と業界動向

- **Coinbase**: 身代金の支払いを拒否し、攻撃者特定のため 2,000 万ドルの懸賞金を設定。SEC へ Form 8-K を提出して復旧費用 1.8 億〜4 億ドルを開示。詐取された顧客への返金、米国内サポート拠点の新設、影響顧客への ID 盗難保護・信用監視を提供
- **規制・法務動向**: 米国の証券・データ保護規制下での開示（8-K）と、州レベルの breach 通知（Maine 等）が並行。複数の集団訴訟が提起され、規制対象事業者の KYC データ保管責任が争点化
- **業界横断の論点**: 委託先サポートを含むサプライチェーン上の内部脅威と、規制が要求する生 PII の保管がもたらす honeypot 問題が、暗号資産・フィンテック横断で再認識された。KYC を「保管して守る」から「保管せず証明する」へ転換する設計論が論点として浮上

「規制属性の確認を、生 PII の保管なしにどう満たすか」は、本事案を契機に規制対象事業者の設計・調達の論点として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（KYC/AML 遵守のために収集・保管された生 PII が、正規アクセス経由の内部脅威で漏洩面に転化する）に対して、Lemma は、属性確認を「検証側が生 PII を保管したまま守る」のではなく、「検証側が生 PII を受け取らずに属性を証明として受領する」設計を提示している。利用者が KYC 通過・許可 jurisdiction・サンクション非該当・年齢などの規制属性を独立検証可能な暗号証明（ZK 属性証明）として提示し、事業者は政府発行 ID 画像や SSN そのものを warehouse せずに「属性を満たす」事実だけを検証する。漏洩し得る生 PII の蓄積を構造的に縮小することで、内部買収が成立しても流出範囲が限定される。Lemma は規制遵守を代替するものではなく、遵守を「約束」ではなく「証明」として運用するための層を提供する。

---

## 8. Sources

- **Coinbase 公式声明**: "Protecting Our Customers - Standing Up to Extortionists"（2025-05-15、身代金拒否・2,000 万ドル懸賞金）— https://www.coinbase.com/blog/protecting-our-customers-standing-up-to-extortionists
- **TechCrunch**: "Coinbase says its data breach affects at least 69,000 customers"（2025-05-21、影響者数・流出データ種別）— https://techcrunch.com/2025/05/21/coinbase-says-its-data-breach-affects-at-least-69000-customers/
- **Bitdefender (HotForSecurity)**: "Data Breach at Coinbase Exposes Information of Nearly 70,000 Customers"（2025-05、手口・データ種別）— https://www.bitdefender.com/en-us/blog/hotforsecurity/data-breach-at-coinbase-exposes-information-of-nearly-70-000-customers
- **SecurityInfoWatch**: "Coinbase Reveals Insider Bribery Scheme Led to Data Breach, Potential $400M Cost"（2025-05、Form 8-K・復旧費用見積もり）— https://www.securityinfowatch.com/cybersecurity/article/55290995/coinbase-reveals-insider-bribery-scheme-led-to-data-breach-potential-400m-cost
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
