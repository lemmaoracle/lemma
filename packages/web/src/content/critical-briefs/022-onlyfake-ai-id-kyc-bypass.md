---
brief_no: 22
title: "OnlyFake — AI 生成 ID による KYC 突破"
title_en: "OnlyFake — AI-Generated IDs Bypass Exchange KYC"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2024-02-05
published: 2026-06-04
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["021-wirecard-balance-attestation", "019-construction-engineer-qualification-fraud", "011-synthid-watermark-reverse-engineering", "006-google-api-key-revocation-lag"]
version: "1.0"
status: published
og_lead_ja: "AI 生成 ID で取引所 KYC を突破、画像審査は発行者検証ではない — OnlyFake"
og_lead_en: "AI-generated IDs bypassed exchange KYC — image review isn't issuer verification — OnlyFake"
gap_detected: "deepfake 検知・画像フォレンジック・injection 検知は、不正試行の多くを実際に止められた。"
gap_missing: "「この身分証は発行元が実際に発行した本物か」を口座開設の前に暗号的に確かめる層が無く、本物らしく見える画像は素通りした。"
gap_fix: "口座開設の前に「この本人確認属性が、発行者の署名付きクレデンシャルとして正当に発行されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2024 年 2 月、偽造 ID 生成サービス「OnlyFake」の英国パスポート画像で大手暗号資産取引所 OKX の本人確認（KYC）を通過できたと 404 Media が報じた。KYC の審査は身分証画像が本物らしいかを見るだけで、発行元が実際に発行した文書かを確かめない。検出強化は不正試行の多くを止めるが、生成系との軍拡競争であり、提示画像が発行者の発行物かには答えられない。欠けているのは、口座開設前に発行者署名を暗号的に検証する層である。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **実証報道**: 2024-02-05、404 Media が OnlyFake で生成した英国パスポート画像により OKX の KYC を通過したことを報道。OECD.AI の incident registry にも収載
- **サービスの内容**: 1 通 15 ドル。米・加・英・豪・EU 各国を含む 26 か国の ID 画像を生成。氏名・生年月日・住所・有効期限・署名を指定可能。本人確認でよく使われる「カーペット上に置いた撮影」のような質感まで再現
- **メタデータ偽装**: 撮影デバイス・日時・GPS 座標などの EXIF 偽装に対応
- **運営者の主張**: 匿名運営者（自称 "John Wick"）は、主要取引所・暗号資産対応ネオバンクの KYC を突破可能と主張。「ニューラルネットワーク」による生成を称した（404 Media は AI 利用の主張自体は確認できなかったと明記。一方で価格水準は自動生成を示唆）
- **被弾側の認識**: OKX は本件を特定 1 社ではなく業界横断の問題であるとの認識を示した
- **核心**: 本人確認の書類審査が画像の「本物らしさ」だけを見て発行者署名を検証しないため、本物らしい画像の生成コストが暴落した時点で規制属性（KYC 通過）が素通りした

---

## 2. タイムライン

- 2024-02-05: 404 Media が OnlyFake の実証報道を公開。OKX の KYC 通過を確認
- 2024-02: 業界各紙が追報。OKX が業界横断の問題であるとの認識を表明。OECD.AI incident registry に収載
- 2025: 世界経済フォーラム（WEF）等が、AI 生成書類・face swap・カメラ injection を組み合わせ書類確認と生体確認の双方を破る攻撃連鎖を文書化
- 2025: 本人確認業界の統計で、deepfake 起因の不正試行が 3 年間で 2,137% 増、本人確認失敗の 20 件に 1 件が deepfake 関連と報告される
- 2025 上期: deepfake 関連詐欺の損失が半年で約 4.1 億ドルに到達と報告。AML/KYC 違反に対する金融当局の制裁金も急増

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。本件は研究者・媒体による実証報道であり、実被害の特定事案ではない点を誇張しない。

---

## 3. 攻撃ベクター

1. **書類画像の生成**: 攻撃者が OnlyFake 等のサービスで、指定した氏名・属性を持つ photorealistic な ID 画像を低コストで生成する。撮影状況・メタデータも偽装される
2. **書類確認の通過**: 生成画像を KYC フローに提出する。書類確認は画像の「本物らしさ」（テンプレート適合・質感・整合性）を審査するものであり、発行者が実際に発行した文書かどうかを暗号的に検証していない
3. **生体確認の通過**: face swap・カメラ injection を組み合わせ、selfie 照合・liveness 検知を破る。書類と生体という KYC の 2 本柱が双方とも「提示物の見た目」への審査である限り、生成系の進歩がそのまま突破率に転化する
4. **属性の取得**: 「本人確認を通過した」という規制属性が付与され、口座が開設される。以後、この属性は取引・送金の前提として下流に受理され続ける
5. **影響の確定**: 不正口座が詐欺・資金洗浄に利用される。事業者側は事後のモニタリングと当局対応を迫られ、オンボーディング不備は AML/KYC 制裁金として顕在化する

---

## 4. 構造的論点

本事象は、Pillar 04（規制属性証明）の `attribute-proof-bypass` カテゴリに属する。中心的な**失敗 primitive は「規制属性（本人確認通過）が、発行者を検証できない証拠（画像）の上に構築されている」**点にある。KYC の書類確認が検証しているのは、文書そのものではなく文書の「画像」であり、審査の実体は見た目の妥当性判定である。発行者の署名という暗号的事実に接続されていない以上、「本物らしい画像」の生成コストが暴落した時点で、この審査は属性証明として機能しなくなる。secondary に `identity-auth`（本人と属性の binding）、`data-provenance`（AI 生成コンテンツの来歴）を併記する。

本物らしい ≠ 発行されている

Brief 019（人の資格属性）・020（製品の適合属性）・021（資産実在性）が内部者によるデータ改変・虚偽申告として現れたのに対し、本事案は **外部の攻撃者が同じ検出と証明の落差（属性の assertion がそれを検証する layer と切り離されている）を突いた** 点で対照的である。gap が同一であることは、対策が「提示物の審査強化」ではなく「検証層の追加」であるべきことを示す。また、AI 生成コンテンツの来歴という観点では Brief 011（SynthID 透かし reverse-engineering）と隣接する。

---

## 5. 検出と証明の落差

本事象への業界の初期応答は検出強化である。deepfake 検知、画像フォレンジック、injection 検知は、不正試行の多くを実際に止めており、本 Brief が検出層の役割を否定するものではない。検出は突破率を下げ、攻撃コストを引き上げる層として引き続き不可欠である。

一方で、検出は「提示された画像が発行者の発行した文書を写したものか」という問いそのものには答えられない。検出が判定するのは生成痕跡の有無であり、生成系と検出系は構造的に軍拡競争の関係にある。検出率がどれだけ高くても、それは確率的スコアであって、規制報告・行政手続き・訴訟で「この口座は正当な本人確認を経て開設された」と証明する材料には直接ならない。これは検出層の射程外にある、構造的に独立した層の gap である。

現状、本人確認の運用モデル全体において、提示された証拠の発行者検証は、まだ独立した層として扱われていない。事前証明（pre-execution attestation）は、オンボーディングの経路に発行者署名付きの属性証明を 1 段挟むことで、この gap を埋める。審査対象を「画像」から「証明」に置き換えれば、生成系の進歩は突破率に転化しない。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせで本人確認の trust boundary が確立される。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **事業者側**: OKX は業界横断の問題であるとの認識を表明。本人確認ベンダー各社は deepfake 検知・injection 検知の強化を進める一方、検出と生成の軍拡競争という構造自体は残ると報告している
- **国際機関・業界統計**: WEF 等が AI 生成書類・face swap・カメラ injection の攻撃連鎖を文書化。deepfake 起因の不正試行は 3 年間で 2,137% 増、2025 年には本人確認失敗の 20 件に 1 件が deepfake 関連と報告される
- **規制の重心移動**: AML/KYC 違反への制裁は強化が続き、オンボーディング段階の本人確認不備が主要な処分理由となっている。並行して、EU の eIDAS 2.0 / EUDI Wallet に代表される、発行者署名付きデジタルクレデンシャルと選択的開示を前提とする本人確認への制度移行が始まっており、「画像の審査」から「証明の検証」への構造転換が規制側からも進みつつある

本人確認の証拠の発行者を、オンボーディングの時点で暗号的に検証する層の不在は、特定事業者の問題ではなく、金融・本人確認業界横断の運用課題として浮上している。

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差（本人確認の規制属性が、発行者を検証できない画像証拠の上に構築されている）に対して、Lemma は、本人確認を「画像の審査」から「発行者署名付きクレデンシャルの暗号的検証」に置き換え、検証側が原本データを受け取らずに「要件を満たす」ことだけを検証できる設計を提示している。

- **発行者署名付きクレデンシャル**: 政府・発行機関・確認済み IdP が、本人属性を発行者署名付きで発行する。検証されるのは画像の見た目ではなく、発行者の署名という暗号的事実である
- **選択的開示**: BBS+ over BLS12-381 により、「18 歳以上」「制裁リスト非該当」「KYC 通過」など、規制要件が必要とする属性だけを最小開示する。ID 原本・全属性は検証側に渡さない
- **有効性・失効**: Poseidon over BN254 でコミットし、有効性・非失効を Groth16（Circom 回路）で証明する。docHash で発行原本に紐付け、失効（取消・期限切れ）も追跡できる

これにより、オンボーディングの時点で固定された証明が、後年に「この口座は正当な本人確認を経て開設されたか」を問われた際に、本人の原本データを開示せず独立検証可能なトレイルとして機能する。検出（deepfake 検知・事後モニタリング）は攻撃コストの引き上げと事後の是正に、事前証明（発行者検証）は属性の正当性の独立検証に、それぞれ相補的に働く。

データは渡さない。証明は渡る。

設計と適用範囲は、[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **404 Media（一次報道）**: "Inside the Underground Site Where 'Neural Networks' Churn Out Fake IDs"（2024-02-05、OnlyFake の実証・運営者主張・価格・対応国）
- **OECD.AI incident registry**: "AI-Generated Fake IDs Bypass Crypto Exchange KYC Checks"（2024-02-05 収載） — https://oecd.ai/en/incidents/2024-02-05-37e8
- **Decrypt（二次情報）**: "People Are Using Basic AI to Bypass KYC — But Should You?"（2024-02） — https://decrypt.co/216188/ai-generated-fake-id-bypass-kyc-aml-banks-crypto-onlyfakes
- **Benzinga / Nasdaq（二次情報）**: "AI-Generated Fake IDs Bypass Crypto Exchange KYC Checks, OKX Says Industry-Wide Issue"（2024-02） — https://www.nasdaq.com/articles/ai-generated-fake-ids-bypass-crypto-exchange-kyc-checks-okx-says-industry-wide-issue
- **AInvest（二次情報・統計集約）**: "Deepfake Fraud: $897M Trail and Crypto Market Risk"（2026-04、deepfake 詐欺損失・本人確認統計・規制制裁の集約） — https://www.ainvest.com/news/deepfake-fraud-897m-trail-crypto-market-risk-2604/
- **Signicat（業界統計）**: deepfake 不正試行 3 年間 2,137% 増 — https://www.signicat.com/press-releases/fraud-attempts-with-deepfakes-have-increased-by-2137-over-the-last-three-year

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
