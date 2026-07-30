---
brief_no: 41
title: "AOG Technics：偽造された耐空証明書付きで、6万点超の航空機エンジン部品が出回った — 耐空という規制属性を主張する証書の来歴が、受領の前に独立検証されない構造（SFO）"
title_en: "AOG Technics: over 60,000 aircraft engine parts circulated with forged airworthiness certificates — the provenance of the certificates asserting airworthiness is not independently verified before receipt (SFO)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-02-23
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "035-boeing-787-inspection-records", "019-construction-engineer-qualification-fraud", "021-wirecard-balance-attestation"]
status: published
version: "1.0"
og_lead_ja: "AOG Technics、偽造耐空証明書付きで6万点超の航空機エンジン部品が4年以上流通"
og_lead_en: "AOG Technics circulated 60,000+ aircraft engine parts with forged airworthiness certificates for over four years"
gap_detected: "真贋照会・Safran の通報・CAA／FAA／EASA の安全警告・運航停止・SFO の捜査が、不正の範囲を事後に可視化し封じ込めた。"
gap_missing: "「この証書は、正規の発行機関が、この部品に対して発行した真正なものか」を受領の前に独立検証する層が無く、証書の存在だけで耐空属性が受理された。"
gap_fix: "受領の前に、証書の来歴（発行機関・対象・真正性）を Lemma で独立検証し、来歴が確認できなければ受理を block して事前に防ぐ。"
---

## 1. TL;DR

部品商社 AOG Technics は、2019 年から 2023 年にかけて、耐空性（airworthiness）を保証する Authorised Release Certificate（ARC）を偽造した状態で、6 万点を超える航空機エンジン部品（約 690 万ポンド相当）を販売していた。多くは CFM International の CFM56 エンジン（Boeing 737／Airbus A320 に広く搭載）向けだった。発覚の端緒は、ある航空会社が部品の真贋を Safran に照会したことで、証明書が偽物と判明したことだった。英国 CAA・米国 FAA・欧州 EASA が安全警告を出し、Delta・American・Southwest など多数の航空会社で該当機が運航停止になった。耐空という規制属性が、それを主張する証書の来歴を受領の前に独立検証できない構造の下で、4 年以上も流通し続けた。証書が存在することと、その証書が真正で対象部品の耐空を実際に裏づけることが分離されていた。

---

## 2. 何が起きたか

- **対象**: AOG Technics（英国拠点の航空部品商社）と、同社から偽造証明書付き部品を購入した航空会社・整備事業者
- **規模**: 2019 年 1 月〜2023 年 7 月に、偽造 ARC を伴う 6 万点超の航空機エンジン部品（約 690 万ポンド相当）を販売。多くは CFM56 エンジン（737／A320）向け
- **手口**: 同社ディレクター（Jose Alejandro Zamora Yrala 被告）が自宅 PC で正規の ARC を改ざんし、Safran 等の OEM から直接購入したかのような偽の出荷メモを作成。架空の従業員（営業・品質管理担当）を名乗る署名・メールで、正規事業者を装った
- **発覚**: 2023 年、ある航空会社が部品の真贋を Safran（CFM International の共同保有者）に照会し、証明書が偽物と判明。Safran が当局に通報
- **規制対応**: 英国 CAA・米国 FAA・欧州 EASA が AOG Technics 部品に関する安全警告を発出。Delta・American・Southwest・TAP・Ryanair・WestJet・Virgin Australia などが該当機を運航停止
- **被害**: 航空会社・製造各社で 3,930 万ポンド超の損失と推計
- **司法**: 英国 SFO（重大不正捜査局）が捜査。Zamora 被告は 2025-12-01 に Southwark 刑事法院で有罪を認め、2026-02-23 に禁錮 4 年 8 月の判決
- **文脈**: 耐空・適合・資格などの規制属性が、それを主張する文書の来歴を受領時点で独立検証できないまま受理される構造の事例（[Brief 019](https://lemma.frame00.com/ja/critical/briefs/019-construction-engineer-qualification-fraud/)／020／021／035 と同系）

事象は次の連鎖で成立している。

1. **規制属性の文書化**: 部品の耐空性は、Authorised Release Certificate（ARC）という文書で保証される。受領側はこの証書をもって耐空という属性を信頼する
2. **証書の偽造**: AOG が正規 ARC を改ざんし、OEM から直接購入したかのような偽の出荷記録・架空従業員の署名を付して、正規の供給経路を装った
3. **来歴の独立検証の欠落**: 受領側（航空会社・整備事業者）が、証書の来歴（本当に正規発行機関が、この部品に対して発行したか）を受領の時点で独立検証する手段を持たず、証書の存在をもって耐空属性を受理した
4. **不可逆な領域への流入**: 耐空が独立検証されないまま、部品が実機のエンジンに組み込まれ得る領域へ流通した。4 年以上、構造的に気づかれなかった
5. **事後の照会で発覚**: 端緒は人手による真贋照会（航空会社 → Safran）であり、構造的な事前検証ではなく偶発的な確認に依存していた

---

## 3. 時系列 — 公表と対応

- 2019-01〜2023-07: AOG Technics が偽造 ARC を伴う 6 万点超のエンジン部品（約 690 万ポンド相当）を販売
- 2023: ある航空会社が部品の真贋を Safran に照会、証明書が偽物と判明。Safran が当局へ通報し、CAA／FAA／EASA が安全警告を発出。多数の航空会社が該当機を運航停止
- 2025-12-01: Zamora 被告が Southwark 刑事法院で有罪を認める
- 2026-02-23: SFO が、禁錮 4 年 8 月の判決を公表

> 注: 本 Brief の事実は英国 SFO の発表および確立メディアの報道に基づく。本 Brief は被告個人の動機の断罪ではなく、耐空という規制属性を主張する証書の来歴が、受領の前に独立検証されないという構造に焦点を当てる。金額・点数は当局・報道に依拠し出所を明示する。

公表後の対応と業界の動きは次のとおり。

- **英国 SFO**: AOG Technics の偽造証明書による部品販売を捜査・訴追。Zamora 被告は有罪を認め（2025-12-01）、禁錮 4 年 8 月の判決（2026-02-23 公表）
- **規制当局（CAA／FAA／EASA）**: AOG Technics 部品に関する安全警告を発出し、業界横断で該当部品の特定・除去を促した
- **OEM・航空会社**: Safran の真贋確認を端緒に発覚。Delta・American・Southwest 等が該当機を運航停止し、業界全体で部品の trace と交換が進んだ
- **業界横断の論点**: 航空部品の供給網において、耐空証明（ARC）の来歴を受領時点で独立検証できる仕組みの不在が改めて問われた。文書の体裁ではなく、発行機関・対象・真正性の来歴を検証可能にする設計が、安全直結の供給網の要件として議論が進む

「耐空・適合といった規制属性を主張する証書の来歴を、受領の前にどう独立検証するか」は、本事案を契機に航空部品供給網および規制属性インフラ設計の必須要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「耐空という規制属性を主張する証書（ARC）の来歴を、受領の前に独立検証しないまま、証書の存在だけで属性を受理すること」</strong>である。証書が存在することと、その証書が真正で、対象の部品の耐空を実際に裏づけることが分離されていた。

[Brief 020](https://lemma.frame00.com/ja/critical/briefs/020-type-designation-conformity-fraud/)（型式指定：認証試験データの改ざんで規制適合属性が独立検証されないまま出荷直結）・[Brief 019](https://lemma.frame00.com/ja/critical/briefs/019-construction-engineer-qualification-fraud/)（国家資格：実務経験を満たさない技術者が有資格として現場配置）・[Brief 021](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（Wirecard：実在しない残高を「銀行に残高あり」と偽った残高確認）と同じ `attribute-proof-bypass` であり、いずれも **規制属性（適合・資格・財務・耐空）が、それを主張する文書・証跡の来歴を独立検証されないまま受理される**構造で同型である。[Brief 035](https://lemma.frame00.com/ja/critical/briefs/035-boeing-787-inspection-records/)（Boeing 787：検査が「完了」と記録されていたが実施されていなかった）とは、**記録・証書の存在が、それが指す実態（検査の実施・部品の耐空）の証明にはならない**点で直接連なる。

この構造は、誰かが文書を偽る悪意の有無にかかわらず成立する——属性を主張する証書の来歴が受領時点で独立検証できなければ、偽造であれ誤記であれ、検証されない属性が不可逆な領域（実機・実務・市場）へ流入する。本事案で偽造が 4 年以上気づかれなかったのは、まさにこの独立検証の層が無かったためである。耐空のような安全直結の属性ほど、証書の存在ではなく証書の来歴の独立検証が、流通の前提として要る。

真贋照会、Safran の通報、CAA／FAA／EASA の安全警告、該当機の運航停止、SFO の捜査・訴追は、被害の把握・封じ込め・再発抑止に不可欠であり、本 Brief がその役割を否定するものではない。これらにより不正は止められ、責任が問われた。

一方で、これらの検出・是正は、受領側が「耐空という属性を、証書の来歴を独立検証してから受理するか」という設計自体を変えない。本事案では、偽造証書が正規の体裁を備えていたため、証書の存在をもって属性が受理され、4 年以上構造的に気づかれなかった。欠けていたのは「この証書は、正規の発行機関が、この部品に対して発行した真正なものか」を受領の前に独立検証する層であり、これは事後の真贋照会や運航停止とは別系統の検証である。発覚が人手の偶発的照会に依存していたことが、その不在を示している。規制報告・安全監査で「この部品は、真正な耐空証明に裏づけられていたか」を立証する材料として、証書が手元にあるという事実だけでは、来歴の独立した証跡にならない——その証書自体が偽造だった。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）と来歴証明は、規制属性を、それを主張する文書の来歴と切り離さずに扱う。証書を「存在するか」ではなく「正規の発行機関が、この対象に対して発行した真正なものか」を、受領の前に独立検証可能な証明として確認し、来歴が確認できなければ受理を block する。検出（事後の照会・運航停止・規制警告）と、受領前の属性の来歴証明（proof）は代替ではなく **補完** の関係にあり、両者が重なって初めて、安全直結の部品流通を実務に載せられる。

本事案で露呈した検出と証明の落差（規制属性を主張する証書の来歴が、受領の前に独立検証されない）に対して、Lemma は、属性の確認を、それを主張する文書の来歴と結びつけて扱う設計を提示している。

- **来歴に基づく属性証明**: 証書を「存在するか」ではなく「正規の発行機関が、この対象に対して発行した真正なものか」を、受領の前に独立検証可能な証明として確認し、来歴が確認できなければ受理を block する
- **発行の真正性の固定**: 発行機関・対象・発行事実を改ざんできない来歴として固定し、文書の体裁の模倣では属性が成立しないようにする
- **選択的開示**: 機微な取引情報を全面開示せずに、「この部品は真正な耐空証明に裏づけられている」ことだけを最小開示し、独立検証と商取引の機密を両立する
- **供給網横断の検証**: 属性の来歴を供給網の各段で検証可能にし、不正・誤記の混入が不可逆な領域へ流入する前に止める

「証書の存在 ≠ 属性の来歴の証明」という規制属性証明カテゴリの設計思想に対し、本事案はその想定する failure mode が、安全直結の航空部品供給網で 4 年以上の偽造流通として顕在化した事例である。検出（事後の照会・運航停止・規制警告・訴追）は被害の是正に、受領前の属性の来歴証明（proof）は供給網の信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **英国 SFO（GOV.UK、一次）**: “SFO secures 4-year prison sentence for aircraft parts fraud”（2026-02-23）— <https://www.gov.uk/government/news/sfo-secures-4-year-prison-sentence-for-aircraft-parts-fraud>
- **AeroTime**: “Fake aircraft parts fraudster jailed for $52M scam that grounded airline fleets”（2026-02）— <https://www.aerotime.aero/articles/fake-aircraft-parts-aog-technics>
- **Simple Flying**: “60,000 Fake Parts Sold: The True Scale Of The AOG Technics Fraud” — <https://simpleflying.com/60000-fake-parts-sold-true-scale-aog-technics-fraud/>
- **reference 実装（GitHub）**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/)、[Seal](https://lemma.frame00.com/ja/seal/)
