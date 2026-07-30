---
brief_no: 78
title: "TennCare Connect：自動適格判定が誤ったまま、数千人の Medicaid が違法に打ち切られた — 給付の打ち切りという不利益処分の前に、適格判定が独立検証されない構造（連邦地裁）"
title_en: "TennCare Connect: an automated eligibility system illegally cut thousands off Medicaid — eligibility decisions not independently verified before the adverse action of termination (federal court)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2024-08-01
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
version: "1.0"
og_lead_ja: "TennCare Connect の自動適格判定が誤判定のまま数千人を違法に打ち切り"
og_lead_en: "TennCare Connect's automated eligibility system illegally cut thousands off Medicaid"
gap_detected: "不服申立て・行政監査・集団訴訟と司法判断は、誤った打ち切りの是正に不可欠であり、本件でも違法性の認定と是正に機能した。"
gap_missing: "判定が「不利益処分の前に正しいデータ・正しい世帯構成・正しい認可の下で行われたか」を独立検証する層が無く、誤った入力のまま自動判定が「不適格」を出力し打ち切りに直結した。"
gap_fix: "給付の打ち切りという不利益処分の前に、自動適格判定の入力・世帯構成の前提・認可を Lemma で独立検証し、後から改ざんできない証跡として固定する。"
---

## 1. TL;DR

テネシー州が 4 億ドル超を投じ、Deloitte らが構築した適格判定システム TennCare Connect は、所得・健康情報から Medicaid 等の受給資格を自動判定するはずだった。実際には適切なデータを読み込まないことがあり、受給者を誤った世帯に割り当て、誤った適格判定を出していた。2024 年 8 月、連邦地裁（テネシー州中部地区）は、この自動判定の不具合により数千人が違法に給付を打ち切られたと判断した。打ち切りという不利益処分の前に、自動判定が正しいデータと正しい世帯構成に基づいて行われたかを独立検証する層が無かった。システムが「不適格」と出力したという事実は、その判定が正しい入力と認可の下で行われた証明にはならない。

---

## 2. 何が起きたか

- **対象**: TennCare Connect（テネシー州の Medicaid〔TennCare〕適格判定システム。Deloitte ら受託、構築費 4 億ドル超）
- **被害当事者**: TennCare 等の受給者・申請者。2020 年提訴の集団訴訟は、給付を打ち切られた成人・児童を代理
- **行政主体**: テネシー州（TennCare 運営）。システムは Deloitte らシステムインテグレータが構築・運用
- **失敗の連鎖**: システムが (1) 適切なデータを読み込まないことがある、(2) 受給者を誤った世帯に割り当てる、(3) 誤った適格判定を出す——これらが重なり、本来資格のある人が「不適格」と自動判定された
- **不利益処分への直結**: 誤った自動判定が、給付の打ち切り（不利益処分）に直結。受給者が誤りに気づき不服を申し立てるまで、処分が先行した
- **司法判断**: 2024 年 8 月、テネシー州中部地区連邦地裁は、TennCare Connect の不具合により数千人が違法に給付を打ち切られたと判断（2020 年提訴の集団訴訟）
- **文脈**: Deloitte が複数州で運用する Medicaid 適格判定システムが、同種のエラーで問題を指摘されている。公共給付の適格判定を自動化する局面が広がる中、判定の検証可能性が制度的論点になっている

事象は次の連鎖で成立している。

1. **自動判定の生成**: TennCare Connect が、所得・健康情報から受給資格を自動判定する。判定は入力データと世帯構成の前提に依存する
2. **入力の不備**: システムが適切なデータを読み込まない、または受給者を誤った世帯に割り当てるなど、判定の前提となる入力が誤った状態のまま処理が進む
3. **独立検証の欠落**: 判定が正しいデータ・正しい世帯構成に基づいているかを、不利益処分の前に独立検証する層が無く、誤った判定がそのまま「不適格」の結論として扱われた
4. **不利益処分への直結**: 誤った自動判定が給付の打ち切りに直結。生活に直結する不可逆な処分が、受給者の関与・確認の前に先行した
5. **是正の事後性**: 受給者が打ち切りに気づき不服を申し立てて初めて誤りが争われる構造で、是正は常に処分の後にずれ込んだ

---

## 3. 時系列 — 公表と対応

- 2019〜2020: TennCare Connect の適格判定をめぐり、誤った打ち切り・不適格判定が顕在化
- 2020: 給付を打ち切られた成人・児童を代理する集団訴訟が提起される
- 2024-08: テネシー州中部地区連邦地裁が、自動判定の不具合により数千人が違法に給付を打ち切られたと判断
- 2024 以降: Deloitte が複数州で運用する同種システムのエラーが、報道・専門機関により横断的に指摘される

> 注: 本 Brief の事実は連邦地裁の判断および確立メディア・専門報道（KFF Health News 等）に基づく。判決後の係争・是正の最新状況は公開前に確認すること。本 Brief は特定事業者の動機の断罪ではなく、不利益処分の前に判定が独立検証されないという構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- **司法**: テネシー州中部地区連邦地裁が、TennCare Connect の不具合により数千人が違法に給付を打ち切られたと判断（2024-08、2020 年提訴の集団訴訟）
- **専門報道（KFF Health News 等）**: Deloitte が複数州で運用する Medicaid 適格判定システムが同種のエラーで問題を抱えていることを横断的に報道し、構造的な論点として可視化
- **制度設計の論点**: 公共給付の適格判定を自動化する際、判定が不利益処分の前に正しい入力・認可の下で行われたかを検証・記録する要件が、調達・運用基準の論点として浮上
- **システムインテグレータの責務**: 同種システムを複数行政に納める SI 事業者の側に、判定の検証可能性・証跡を設計に組み込む要請が強まっている

「行政が自動適格判定を不利益処分に用いる際、その判定がどの入力・認可の下で行われたかをどう証明するか」は、本事案を契機に公共部門調達・制度設計の必須要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「自動適格判定の出力が、入力・世帯構成・認可を独立に証明できる証跡を伴わないまま、不利益処分の根拠として受理される」</strong>であり、給付の打ち切りという不可逆な処分がその上に成立した点にある。

[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)（Robert Williams 誤認逮捕）と primitive が同型である。012 が「確率的な FRT 出力が独立裏付けなく逮捕に直結」した公共部門の AI 判断事案であり、本事案は「自動適格判定が独立検証なく給付打ち切りに直結」した同じ構造である。いずれも行政の AI / アルゴリズム判定が、独立検証の層と切り離されたまま不可逆な処分に直結している。[Brief 035](https://lemma.frame00.com/ja/critical/briefs/035-boeing-787-inspection-records/)（Boeing 787 で検査が「完了」と記録されていたが実施されていなかった）とは、**「システムが結論を出力した」という記録が、その結論が正しい根拠に基づく証明にはならない**点で連なる。

本事案は攻撃 incident ではなく、公共部門における AI / アルゴリズム利用の信頼層リスク事象である（Methodology の射程拡張、[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/) の position に連なる）。給付の適格判定を自動化する局面が広がる中で、判定が不利益処分の前に独立検証・認可されたかを証明できる層が、制度的要件として問われる代表事例である。システムインテグレータが複数の行政に同種システムを納める構造であるため、検証・証跡の要件は調達段階で組み込むことが現実的な導入経路になる。Lemma は判定の正しさ・公平性そのものを保証するものではなく、判定が不利益処分の前に独立検証・認可された事実（あるいはされなかった事実）を、後から改ざんできない証跡として残すことを射程とする。

不服申立ての仕組み、行政監査、本件の集団訴訟と司法判断は、誤った打ち切りの是正に不可欠であり、本 Brief がその役割を否定するものではない。訴訟により違法性が認定され、是正に向かった。

一方で、不服申立てや訴訟は、判定が「不利益処分の前に独立検証・認可されたか」という設計自体を変えない。本事案では、誤った入力・誤った世帯割当のまま自動判定が「不適格」を出力し、それが打ち切りに直結した。欠けていたのは「この判定は、正しいデータ・正しい世帯構成・正しい認可の下で行われたか」を処分の前に独立検証する層であり、これは事後の不服申立てとは別系統の検証である。是正が処分の後であれば、その間の給付の喪失（医療へのアクセス断絶等）は取り消せない。規制報告・行政監査・司法手続きで「この打ち切りは、正しい根拠と認可に基づいていたか」を立証する材料として、システムが「不適格」と出力したという記録だけでは、判定が正しい入力に基づいた証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、自動判定が不利益処分に用いられる前に、「どの入力で」「どの世帯構成の前提で」「どの独立検証・認可の下で」その判定が下されたのかを、独立検証可能な記録として固定する設計を採る。proof が「入力不備」「世帯割当の根拠なし」「認可なし」と告げれば、当該判定に基づく打ち切りは事前に保留される。事後の検知・是正（detection）と、処分前の判定の独立検証（proof）は代替ではなく **補完** の関係にある。

本事案で露呈した検出と証明の落差（自動適格判定の出力が、その入力・認可を独立に証明できないまま、不利益処分の根拠として機能する）に対して、Lemma は、判定が処分に用いられる時点で、その判定が「どの入力で」「どの前提で」「どの独立検証・認可の下で」下されたかを、後から改ざんできない証跡として固定する設計を提示している。設計要素は次の通り。

- **入力・前提の固定**: 自動適格判定が用いた入力データと世帯構成の前提を、判定時点のスナップショットとして独立検証可能な形で記録する。
- **認可状態の証明**: その判定が正しい認可の下で行われたか（あるいは認可なしか）を、処分の根拠とは独立に証明できる証跡に残す。
- **処分前ゲート**: proof が「入力不備」「世帯割当の根拠なし」「認可なし」と告げれば、当該判定に基づく打ち切りを事前に保留する設計を採る。
- **調達への組み込み**: これは行政が AI / アルゴリズム利用の説明責任を制度的に満たすための監査・証跡層に相当し、システムインテグレーション経由で公共部門の調達要件に組み込みうる。

Lemma は判定の正しさ・公平性そのものを保証するものではないが、判定が不利益処分の前に独立検証・認可された事実（あるいはされなかった事実）を、後から改ざんできない証跡として残す。検出（不服申立て・監査・事後是正）は誤りの救済に、事前証明（不利益処分の前に判定の入力・認可を独立検証する証跡）は処分が下る前の信頼確立に、それぞれ相補的に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)（GitHub）を参照のこと。設計と適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/) も参照。

---

## 6. Sources

- **Gizmodo**: “Judge Rules $400 Million Algorithmic System Illegally Denied Thousands of People's Medicaid Benefits”（2024-08）— <https://gizmodo.com/judge-rules-400-million-algorithmic-system-illegally-denied-thousands-of-peoples-medicaid-benefits-2000492529>
- **KFF Health News**: “Medicaid for Millions in America Hinges on Deloitte-Run Systems Plagued by Errors” — <https://kffhealthnews.org/news/article/medicaid-deloitte-run-eligibility-systems-plagued-by-errors/>
- **Texas Dentists for Medicaid Reform**: “Judge Rules Thousands Illegally Booted off Tennessee Medicaid by Deloitte System Similar to Texas”（2024）— <https://www.tdmr.org/judge-rules-thousands-illegally-booted-off-tennessee-medicaid-by-deloitte-system-similar-to-texas/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
