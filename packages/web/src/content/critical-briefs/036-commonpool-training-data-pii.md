---
brief_no: 36
title: "128 億枚の AI 学習データに、パスポート・履歴書・顔が混入していた — 学習データの来歴と同意が、収集の時点で検証されていなかった"
title_en: "12.8 Billion Training Images Contained Passports, Résumés, and Faces — The Provenance and Consent of Training Data Were Never Verified at Collection"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-07-18
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "011-synthid-watermark-reverse-engineering"]
version: "1.0"
status: published
og_lead_ja: "128 億枚の AI 学習データに ID・履歴書・顔が混入 — DataComp CommonPool"
og_lead_en: "12.8B training images contained passports, résumés, faces — CommonPool"
gap_detected: "独立研究者の監査によって混入が可視化され、顔の自動ぼかしや PII 検出フィルタの改善も進められている。"
gap_missing: "「この素材は、学習に使ってよい来歴・同意を持つか」を収集の時点で確かめる層が無く、事後の機械的フィルタでは網羅できず（0.1% の標本だけで 800 超の顔が漏れた）。"
gap_fix: "公開されているかではなく「各素材が学習利用に供してよい来歴・同意を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

研究チームが、最大級の公開 AI 学習データセット DataComp CommonPool に、パスポート・履歴書・顔など実在個人の個人情報が大量に混入していると報告した。独立監査による可視化や顔ぼかし・PII フィルタの改善は進むが、事後の機械的フィルタは網羅性を保証できず、0.1% の標本だけで 800 超の顔が漏れた。欠けていたのは「この素材は学習に供してよい来歴・同意を持つか」を収集の時点で確かめる層であり、来歴のないまま大規模に固定化され下流モデルへ回収困難な形で波及する。

---

## 2. 何が起きたか

- **対象**: DataComp CommonPool(2023 年公開、128 億の画像-テキストペア。Common Crawl が 2014–2022 に Web スクレイピングした素材が基盤。LAION-5B の後継)
- **公表**: 2025-07-18、研究チームの監査結果(arXiv:2506.17185)。MIT Technology Review が報道
- **発見**: データセットの 0.1% の監査で、数千件の有効な ID 書類(クレジットカード・運転免許・パスポート・出生証明書)と 800 件超の履歴書/カバーレター(LinkedIn 照合で実在確認)を確認。全体では数億規模の個人画像が存在すると推定
- **privacy 対策の漏れ**: キュレーターは顔の自動ぼかしを実施していたが、サンプル中で 800 超の顔が検出を逃れ、全体で約 1 億 200 万の顔が見逃されたと推定。メール・SSN 等の既知 PII 文字列のフィルタは未適用
- **波及**: CommonPool は LAION-5B の後継で、Stable Diffusion・Midjourney 等の学習系譜に連なる。下流の生成モデルと派生物への PII 混入が高い蓋然性で波及
- **位置づけ**: 攻撃 incident ではないが、AI 時代の信頼層リスク事象(学習データの来歴・同意の不在)。Brief 008(Discord scraping)に続く training-data-provenance の事例

(本件は攻撃でなく、学習データの来歴・同意の不在を露呈したリスク事象。確認されている構造を記す)

- 2014–2022: Common Crawl が Web を広範にスクレイピング(公開 Web 上の画像・テキスト)
- 2023: DataComp CommonPool が 128 億ペアで公開。顔の自動ぼかし等の privacy 対策を実施
- 2025-07-18: 研究チームが 0.1% 監査の結果を公表(arXiv:2506.17185)。ID 書類・履歴書・見逃された顔の大量混入と、その全体推定を報告。MIT Technology Review が報道

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。本件は研究チームによる 0.1% 標本監査と全体推定であり、推定値を確定値として扱わず、混入の規模を誇張しない。

事象は次の連鎖で成立している。

1. **無差別収集**: 公開 Web を広範にスクレイピングし、画像-テキストペアを大規模収集。収集対象に個人の ID 書類・履歴書・顔が含まれる
2. **来歴・同意の不在**: 各素材が「誰の・どの同意で・どの利用範囲で」公開されたかの来歴は付随せず、学習可否の判断材料がない
3. **不完全な事後フィルタ**: 顔ぼかし等を適用するが、サンプルだけで 800 超の顔が漏れ、PII 文字列フィルタは未適用。事後の機械的フィルタでは網羅できない
4. **データセット公開**: 128 億ペアとして公開され、誰でも学習に利用可能
5. **下流への波及**: 後継・派生モデル(Stable Diffusion・Midjourney 系譜)へ PII が伝播し、回収困難な形で固定化

---

## 3. 時系列 — 公表と対応

公表後の対応と業界の動きは次のとおり。

- **研究チーム / MIT Technology Review**: 0.1% 監査から全体推定を示し、顔ぼかしの漏れと PII フィルタ未適用を指摘。LAION-5B 後継としての下流波及リスクを提起
- **業界横断の論点**: 大規模 Web スクレイピングを基盤とする学習データは、事後フィルタでは規制対象の個人情報混入を網羅的に防げない。収集時点で素材の来歴・同意を検証する仕組み、および学習データの構成可監査性(どの素材が・どの来歴で入っているか)を担保する設計が、規制(個人情報保護・忘れられる権利)とモデル供給網の双方から要求されつつある。来歴のないデータセットは、削除・訂正・規制対応のいずれにも対応しにくい

「学習データを、公開されているかでなく、来歴・同意を持つかで取り込む」必要性が、本事案と [Brief 008](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/) を通じて重みを増している。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「学習データが、どこから・誰の同意で・どの利用範囲で収集されたかの来歴を、収集・公開の時点で検証されないこと」</strong>にある。データセットは「公開 Web から集めた」と言えるが、各素材が学習利用に供してよいものか(同意・規制対象性・利用範囲)は、データに付随しない。来歴と同意が欠けたまま大規模に固定化され、顔ぼかしのような事後フィルタは網羅性を担保できない(0.1% サンプルで 800 超の顔が漏れた)。

Brief 008(Discord の公開 API 経由 20.5 億メッセージのスクレイピング → AI 学習データセット化)の**兄弟事案**である。008 は「公開されている ≠ 学習利用の同意がある」を示し、本件は「大規模収集の事後フィルタでは、規制対象の個人情報(ID 書類・顔)の混入を防げない」を、128 億規模で具体化した。両者は「学習データの来歴・同意が収集の時点で検証されないと、下流に回収困難な形で波及する」点で同根。Brief 011(SynthID、AI 生成物の来歴標識が剥がせる)とも、AI のライフサイクル全体で来歴が独立検証されない問題系として連なる。規制(GDPR 等の個人情報・忘れられる権利)の観点でも、来歴のないデータセットからの削除・訂正は事実上困難である。

研究チームによる監査、キュレーターの顔ぼかし、PII 検出フィルタの改善は、被害縮小に不可欠であり、本 Brief がその役割を否定するものではない。本件も独立研究者の監査によって問題が可視化された。

一方で、検出・事後フィルタは「収集の時点で、この素材を学習に取り込んでよいか」自体を決めない。顔ぼかしや PII 検出は、すでに収集した 128 億ペアから機械的に除こうとするが、0.1% サンプルで 800 超の顔が漏れたように、網羅性は保証されない。検出は生成・収集の後追いであり、いったんデータセットが公開され下流モデルへ伝播すれば、回収はほぼ不可能になる。欠けていたのは「この素材は、学習に供してよい来歴・同意を持つか」という収集時点の独立検証であり、これは事後の PII 検出とは別系統である。規制対応の観点でも、来歴のないデータからは「誰の同意で・どの範囲で使ってよいか」を立証できない。

---

## 5. 証明があれば、何が変わるか

事前証明(pre-execution attestation)は、学習データの取り込みを、事後フィルタではなく「各素材が学習利用に供してよい来歴・同意を持つかの収集時点での独立検証」に置く設計を採る。来歴・同意の proof が成立しない素材は、データセットに取り込む前に reject される。PII 検出(detection 的な「混入物を後から探す」)と来歴の事前証明(「取り込んでよい素材か」)は代替ではなく**補完**の関係にあり、回収困難な下流波及を防ぐには後者の比重が増す。

本事案で露呈した構造(学習データの来歴・同意が収集時点で検証されず、事後フィルタでは網羅できない)に対して、Lemma は、データの取り込みを、事後の PII 検出ではなく「各素材が学習利用に供してよい来歴・同意を持つかの収集時点での独立検証」に置く設計を提示している。

- **公開から来歴への反転**: 取り込みの判断基準を「公開されているか」から「各素材が学習利用に供してよい来歴・同意を持つか」へ反転させる。
- **収集時点の事前 block**: 来歴・同意の proof が成立しない素材を、データセットに取り込む前に reject し、来歴なき固定化を防ぐ。
- **構成の可監査性**: どの素材が・どの来歴で入っているかを来歴つきで記録し、削除・訂正・規制対応(忘れられる権利等)に応えられる構成にする。
- **検出との補完**: 事後の PII 検出(混入物を後から探す)と来歴の事前証明(取り込んでよい素材か)を別系統として併置し、回収困難な下流波及には後者の比重を増す。

来歴・同意の proof が成立しない素材は取り込み前に reject され、事後フィルタは事前の証明によって補完される。「公開されている ≠ 来歴・同意がある」という来歴証明カテゴリの設計思想がここで働く。Brief 008(Discord scraping)と合わせ、学習データ来歴の系譜として参照されたい。

---

## 6. Sources

- **MIT Technology Review**: "A major AI training data set contains millions of examples of personal data"(2025-07-18、CommonPool の PII 混入・規模推定・顔ぼかしの漏れ)— https://www.technologyreview.com/2025/07/18/1120466/a-major-ai-training-data-set-contains-millions-of-examples-of-personal-data/
- **研究論文(arXiv)**: "A Common Pool of Privacy Problems: Legal and Technical Lessons from a Large-Scale Web-Scraped Machine Learning Dataset"(arXiv:2506.17185、2025-06)— https://arxiv.org/abs/2506.17185
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
