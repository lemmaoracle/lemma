---
brief_no: 35
title: "検査は「完了」と記録されていたが、実施されていなかった — Boeing 787 で、記録の存在が実施の証明と取り違えられた"
title_en: "The Inspections Were Recorded as 'Complete' — But Never Performed. On the Boeing 787, the Existence of a Record Was Mistaken for Proof of the Act"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2024-05-06
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "021-wirecard-balance-attestation", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
og_lead_ja: "検査は「完了」と記録されたが実施されていなかった — Boeing 787"
og_lead_en: "Inspections recorded as complete but never performed — Boeing 787"
gap_detected: "記録上は検査が完了しており、書類監査やシステム上のチェックは通過できていた。"
gap_missing: "「この検査記録は、実際の検査行為に裏づけられているか」を出荷の前に確かめる層が無く、実施を伴わない記録が「検査済み」として通用した。"
gap_fix: "下流に進む前に「検査済みという属性が、誰がいつ実際に検査したかの来歴に裏づけられている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Boeing が、一部の 787 Dreamliner で必須検査が記録上は「完了」とされていたのに、実際には作業者がその検査を行っていなかったことを、当局（FAA）へ自主報告した。問題の検査は、主翼と胴体の接合部が落雷等に対して適切に接地されているかを確かめる安全検査である。対象は約 450 機（うち約 60 機は製造ライン上）にのぼり、FAA は記録の虚偽について調査を開始、Boeing は製造中の全 787 の再検査を求められた。核心は、「検査済み」という安全上の証明が、実際に検査が行われた裏づけなしに、記録が存在するというだけで通用していた点にある。記録があることと、記録の示す行為が実際に行われたことは、別である。

---

## 1. 事案概要

- **対象**: Boeing 787 Dreamliner の主翼-胴体接合部(wing-to-body join)におけるボンディング/接地確認検査
- **公表**: Boeing が 2024 年 4 月に FAA へ自主報告、FAA が 2024-05-06 に調査開始を公表
- **事象**: 記録上は必須検査が完了とされていたが、作業者が一部の検査を実際には実施していなかった(記録の虚偽)
- **検査の意味**: 主翼と胴体を接合するファスナーの電気的ボンディング/接地を確認し、落雷等の電流に対して機体が適切に接地されていることを担保する安全検査
- **規模**: 関係筋によれば対象は約 450 機(うち約 60 機は Boeing の製造ライン内)
- **対応**: FAA は、製造ライン上の全 787 を Boeing が再検査し、就航中フリートへの対応計画も策定するよう求めた
- **位置づけ**: 高信頼が要求される航空安全領域における「記録の存在 ≠ 実施の証明」の典型例

---

## 2. タイムライン

- 2024-04: Boeing が FAA に対し、記録上完了とされた一部 787 の検査が実施されていなかった可能性を自主報告
- 2024-05-06: FAA が調査開始を公表。Boeing も従業員による検査記録の虚偽を認める
- 2024-05 以降: Boeing が製造ライン上の全 787 を再検査。就航中フリートへの対応計画策定が求められる

---

## 3. 事象連鎖

1. **必須検査の指定**: 787 の wing-to-body join に、ボンディング/接地を確認する必須検査が規定されている
2. **実施の欠落**: 一部の作業者が当該検査を実施しなかった
3. **記録の虚偽**: 実施していない検査を「完了」として記録(検査記録の falsification)
4. **属性の通用**: 「検査済み」という安全・規制属性が、記録の存在だけで成立し、製造・出荷工程を通過
5. **発覚と是正**: Boeing が自主報告、FAA が調査開始。製造ライン上の全機再検査と就航フリート対応へ

---

## 4. 構造的論点

本事案は Pillar 04(規制属性証明)の `attribute-proof-bypass` を背骨とし、Pillar 01(来歴証明)とも交差する。secondary に `data-provenance`(検査記録の来歴・真正性)と `identity-auth` を併記する。

中心の失敗 primitive は、**「検査済み」という安全・規制属性が、その属性を成立させる行為(実施)の独立した証跡なしに、記録の存在だけで通用した**点にある。記録は「検査が完了した」と主張するが、その主張が実際の実施に裏づけられているかは、記録の内部からは検証できない。属性(検査済み)の真正性が、その属性を生む行為の来歴(誰が・いつ・実際に検査したか)から切り離されている。

Brief 020(型式指定の認証試験データ改ざん)・021(Wirecard の残高確認書偽造)・019(国家資格の実務経験詐称)と同じ系譜である。いずれも「規制が要求する属性(適合・資産実在・有資格・検査済み)が、独立検証されないまま、記録や書類の存在だけで下流(出荷・開示・配置・運用)に直結する」構造を共有する。本事案は、その primitive が**航空安全という極めて高信頼の領域**で、約 450 機という規模で顕在化した点に重みがある。検査記録が電子的・形式的に整っていることと、検査という物理的行為が行われたことの間のギャップが、安全の前提を崩した。

---

## 5. 検出と証明の落差

FAA の調査、Boeing の自主報告・再検査、就航フリートへの対応計画は、安全の回復に不可欠であり、本 Brief がその役割を否定するものではない。自主報告を起点に製造ライン上の全機再検査へ至った対応は重要である。

一方で、検出・監査は「記録が、実施を伴っているか」自体を保証しない。記録上は検査が完了しており、書類監査やシステム上のチェックは通過していた。事後の調査で初めて、記録と実施の乖離が判明する。欠けていたのは「この検査記録は、実際の検査行為に裏づけられているか」という、記録生成の時点での独立検証であり、これは事後監査とは別系統である。規制報告の観点でも、後から「この機体の検査は実際に行われたか」を立証する独立した証跡は、記録そのものを超えて残りにくい。

事前証明(pre-execution attestation)は、検査済みという属性を、記録の存在ではなく「検査行為が実際に・誰によって・いつ行われたかの来歴」として証明する設計を採る。下流(出荷・運用)に進む前に、属性の proof が実施の来歴に裏づけられていなければ、記録が形式上整っていても属性は成立しない。記録の監査(detection 的な「記録は揃っているか」)と実施の事前証明(「記録は実際の行為に裏づけられているか」)は代替ではなく**補完**の関係にある。

---

## 6. 対応経緯と業界動向

- **Boeing / FAA**: Boeing の自主報告を起点に FAA が調査を開始。製造ライン上の全 787 再検査と就航フリートへの対応計画が求められた
- **業界横断の論点**: 製造・安全・規制の各領域で、「記録の存在」を「実施・適合の証明」と取り違える構造は繰り返し顕在化している(Brief 019/020/021 参照)。電子記録・トレーサビリティの整備が進むほど、記録の整合性と、記録が示す行為の実在性を、どう独立に証明するかが論点になる。高信頼領域(航空・基幹インフラ・医療機器等)では、属性を行為の来歴に結びつける仕組みの必要性が高い

「検査済み・適合という属性を、記録の存在でなく実施の来歴として証明する」必要性が、本事案を含む一連の falsification 事案を通じて重みを増している。

---

## 7. Lemma による分析

本事案で露呈した構造(規制・安全属性が、実施の来歴なしに記録の存在だけで通用する)に対して、Lemma は、属性(検査済み・適合)を、記録の有無ではなく「その属性を生む行為が実際に行われた来歴」の独立検証可能な証明として扱う設計を提示している。記録が形式上整っていても、実施の来歴を伴う proof が成立しなければ属性は確立されない。Brief 019/020/021 と合わせ、「記録の存在 ≠ 実態の証明」の系譜として参照されたい。

---

## 8. Sources

- **The Seattle Times**: "FAA opens new investigation into Boeing 787 wing-to-body join work"(2024-05、検査内容・規模・FAA 対応)— https://www.seattletimes.com/business/boeing-aerospace/faa-opens-new-investigation-into-boeing-787-wing-to-body-join-work/
- **The Washington Post**: "FAA investigating whether Boeing falsified 787 inspections"(2024-05-06)— https://www.washingtonpost.com/transportation/2024/05/06/faa-boeing-787-inspections/
- **NPR**: "FAA is investigating Boeing for apparent missed inspections on 787 Dreamliner"(2024-05-06)— https://www.npr.org/2024/05/06/1249432229/faa-investigation-boeing-787-dreamliner
- **CBS News**: "FAA investigates Boeing for falsified records on some 787 Dreamliners"(2024-05)— https://www.cbsnews.com/news/boeing-787-dreamliners-faa-falsified-records/

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
