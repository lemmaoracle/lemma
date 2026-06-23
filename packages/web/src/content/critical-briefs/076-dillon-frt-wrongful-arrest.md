---
brief_no: 76
title: "顔認証の「93% 一致」が、独立検証のないまま逮捕に直結した（Robert Dillon 誤認逮捕訴訟） — FRT の確率的一致が、逮捕という強制処分の前に独立裏付け・認可されなかった構造（ACLU 提訴）"
title_en: "A 93% Facial-Recognition 'Match' Led Straight to Arrest Without Independent Verification (Robert Dillon Wrongful Arrest Suit) — a probabilistic FRT match that was never independently corroborated or authorized before the coercive act of arrest (ACLU suit)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "identity-auth"]
incident_date: 2026-06-10
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety"]
status: published
version: "1.0"
og_lead_ja: "FRT の「93% 一致」が独立裏付けなく逮捕に直結 — Robert Dillon 誤認逮捕"
og_lead_en: "A 93% FRT 'match' drove arrest with no independent corroboration — Robert Dillon"
gap_detected: "FRT の精度・バイアス評価と、事後の誤り是正（無実の判明・提訴）は、技術選定や運用制限・被害救済の根拠として機能した。"
gap_missing: "個々の「93% 一致」について、逮捕という行動の前に独立した裏付け（居住地・距離など）と認可があったかを確かめる層が無く、確率的な候補がそのまま同定として扱われた。"
gap_fix: "AI 出力を逮捕などの強制処分に使う前に「この出力が、どの信頼性条件で、どの独立裏付け・認可の下で使われるのか」を Lemma で独立検証し、改ざんできない証跡として残す。"
---

## TL;DR

フロリダ州在住の Robert Dillon 氏は、顔認証（FRT）が「93% 一致」と出した別人として、2024 年 8 月に窃盗容疑で誤認逮捕された。一致先とされた事件現場は本人の自宅から 300 マイル以上離れた街で、本人は訪れたこともなかった。2026 年 6 月 10 日、ACLU らが代理して連邦地裁に提訴し、警察が確率的な AI の一致結果に依拠しつつ、無実を示す証拠を十分に検討しなかったと主張している。米国で公に判明している FRT 起因の誤認逮捕はこれで少なくとも 15 件目とされる。本事案の核心は、確率的候補にすぎない FRT の出力が、その信頼性・独立裏付け・認可の状態を証明できないまま、逮捕という不可逆な強制処分の事実上の根拠として機能した点にある。Brief 012（Robert Williams 誤認逮捕）と同じ構造が、別の管轄・別の当事者で反復した。

---

## 1. 事案概要

- **被害当事者**: Robert Dillon 氏（52 歳、フロリダ州 Fort Myers 在住）
- **行政主体**: フロリダ州の警察（逮捕を執行した法執行機関）。訴訟は米国フロリダ州中部地区連邦地裁に提起
- **AI システム**: 顔認証技術（FRT）。Jacksonville Beach の店舗の防犯映像に写った容疑者と、Dillon 氏を「93% 一致」と照合
- **失敗の連鎖**: FRT の一致結果が、独立した裏付け証拠による検証を経ないまま容疑者同定として扱われ、逮捕の根拠になった。一致先の事件現場は本人居住地から 300 マイル以上離れ、本人は訪問歴もなかった
- **被害**: 2024 年 8 月に誤認逮捕。本人は無関係であり、居住地・行動の基本的な突き合わせがあれば容疑は早期に解消し得た
- **訴訟**: 2026 年 6 月 10 日、ACLU と法律事務所 Hoguet Newman Regal & Kenney が代理し提訴。訴状は、警察が誤りやすい AI の一致結果に依拠し、無実を示す証拠（居住地・距離など）を十分に検討しなかったと主張
- **歴史的位置**: 米国で公に判明している FRT 起因の誤認逮捕は少なくとも 15 件とされる。妊娠 8 か月の女性が車両強盗容疑で誤認逮捕された例、防犯映像の人物と身長が大きく異なる例など、基本的な裏付け確認の欠落が共通して報告されている
- **政策動向**: 20 を超える都市・管轄が警察による FRT 利用を禁止。Detroit やインディアナでは、顔の一致と写真面通しのみに基づく逮捕を制限する運用が導入されている
- **核心**: 確率的候補にすぎない FRT の出力が、その信頼性・独立裏付け・認可の状態を証明できる証跡を伴わないまま、逮捕という不可逆な強制処分の事実上の根拠として受理されたこと

---

## 2. タイムライン

- 2024-08: フロリダ州の警察が FRT の「93% 一致」に基づき Dillon 氏を窃盗容疑で誤認逮捕。一致先の現場は本人居住地から 300 マイル以上離れた Jacksonville Beach
- 2024〜2026: 本人が無関係であることが明らかになり、容疑をめぐる争いが続く
- 2026-06-10: ACLU と Hoguet Newman Regal & Kenney が代理し、フロリダ州中部地区連邦地裁に提訴。FRT 依拠と裏付け検討の欠落を主張
- 2026-06（提訴前後）: 報道が本件を「少なくとも 15 件目」の FRT 誤認逮捕として位置づけ、警察の FRT 運用制限の議論が再燃

> 注: 本 Brief の事実は ACLU の発表・訴状報道・確立メディアに基づく。訴訟は係争中であり、警察の対応に関する主張は原告側の申立てを含む。本 Brief は当事者の動機・行為の断罪ではなく、AI 出力が強制処分の前に独立検証・認可されなかったという構造に焦点を当てる。

---

## 3. 事象連鎖（失敗の分解）

1. **AI 出力の生成**: FRT が防犯映像の容疑者と Dillon 氏を「93% 一致」と照合。これは確率的なスコアであり、確定的な同定ではない
2. **根拠の不透明性**: 一致スコアの意味、画質や撮影条件などの信頼性低下要因、候補の不確実性が、捜査・逮捕判断の各段で検証可能な形で固定されていなかった
3. **独立検証の欠落**: 居住地・移動可能性・距離（300 マイル以上）といった基本的な裏付けと突き合わせれば矛盾は明らかになり得たが、確率的な AI の一致が事実上の同定として扱われた
4. **強制処分への直結**: 検証されない AI 出力が、逮捕という不可逆な強制処分の根拠として機能。人間による独立確認が処分の前に十分に介在しなかった
5. **構造的偏りの文脈**: FRT は群間で誤検知の偏りが繰り返し報告されており、確率的出力を裏付けなく行動に移す運用は、特定集団に誤認リスクを構造的に高める（少なくとも 15 件の誤認逮捕という反復がその表れ）

---

## 4. 構造的論点

本事案は Pillar 02（AI 出力の検証可能性）の `ai-decision-integrity` カテゴリに属する。中心的な**失敗 primitive は「AI の判定出力（確率的な顔照合）を、その根拠・信頼性・独立裏付け・認可を証明できる証跡なしに、逮捕という強制処分の事実上の根拠として受理すること」**である。secondary に群間の誤検知偏りとして `ai-bias-harm`、本人性の誤同定として `identity-auth` を併記する。

Brief 012（Robert Williams 誤認逮捕、2020 年デトロイト）と primitive がほぼ同型である。012 は米国で初めて公に確認された FRT 誤認逮捕とされ、2024 年の和解でデトロイト市警は FRT 単独での逮捕禁止・独立裏付けの義務化・信頼性低下要因の開示義務を受諾した。本事案は、その remedy が示した要請——AI 出力の使用には検証と認可の独立した証跡が要る——が別の管轄でなお満たされていないことを示す。Brief 043（Tesla FSD の安全性自己申告）・Brief 049（Tesla Robotaxi の制御帰属と記録の自己黒塗り）とも、**AI の判定・記録が、独立検証の層と切り離されたまま下流の重大な意思決定に直結する**構造で連なる。043／049 が「行為そのもの（自己申告・自己黒塗り）が検証不在の構造」だったのと同様、本事案も「確率的出力を裏付けなく強制処分に用いた運用」そのものが検証不在の構造である。

本事案は攻撃 incident ではなく、公共部門における AI 利用の信頼層リスク事象である（Methodology の射程拡張、Brief 012 の position に連なる）。行政が AI 出力を強制処分・給付判断に用いる局面が拡大する中で、判定が行動の前に独立検証・認可されたかを証明できる層が、制度的要件として問われる代表事例として位置づく。Lemma は判定の公平性そのものを保証するものではなく、その判定が行動の前に独立検証・認可された事実（あるいはされなかった事実）を、後から改ざんできない証跡として残すことを射程とする。

---

## 5. 検出と証明の落差

FRT とその精度評価は、捜査における初期の絞り込み手段として一定の役割を持ち、本 Brief がその役割を否定するものではない。精度・バイアスの計測（detection 的評価）は、技術選定や運用制限の根拠として重要である。

一方で、精度スコアや「93%」という一致率は、その個々の判定が「逮捕という行動の前に独立に裏付け・認可されたか」を変えない。本事案では、FRT 出力が確率的候補にすぎないという事実、その信頼性低下要因、独立裏付け（居住地・距離など）の有無が、強制処分の前に検証可能な証跡として固定されていなかった。Brief 012 の和解が課した remedy——FRT 単独での逮捕禁止、独立裏付けの義務化、信頼性要因の開示——は、まさに「AI 出力の使用には、検証と認可の独立した証跡が要る」という要請である。規制報告・司法手続き・行政監査で「この AI 出力は、行動の前に独立検証・認可されたか」を立証する材料として、一致スコアそのものは独立した証跡を伴わない。

事前証明（pre-execution attestation）は、AI 出力が強制処分などの下流の意思決定に用いられる前に、「どの出力が」「どの信頼性条件で」「どの独立裏付け・認可の下で」使用されるのかを、独立検証可能な記録として固定する設計を採る。proof が「独立裏付けなし」「認可なし」と告げれば、当該出力に基づく強制処分は事前に保留される。精度評価（detection）と、検証・認可の証跡（proof）は代替ではなく **補完** の関係にある。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **ACLU / Hoguet Newman Regal & Kenney**: Dillon 氏を代理し、連邦地裁に提訴。FRT 依拠と独立裏付け検討の欠落を主張し、AI 出力を「lead（手がかり）」にとどめ独立証拠で裏付ける運用原則の確立を求める
- **誤認逮捕の反復**: 米国で公に判明している FRT 誤認逮捕は少なくとも 15 件。妊娠中の女性の誤認、身長が大きく異なる人物の誤認など、基本的裏付け確認の欠落が共通
- **運用制限の動き**: 20 を超える都市・管轄が警察 FRT 利用を禁止。Detroit・インディアナは顔の一致と写真面通しのみに基づく逮捕を制限。州単位のガードレール整備が進行
- **制度設計の論点**: AI 出力を行政の強制処分・給付判断に用いる際の検証・開示・認可の制度化が、公共部門横断の論点として進む。FRT の群間誤検知偏りは、確率的出力を裏付けなく行動に移すことの危険性の技術的根拠として引用が続く


「行政が AI 出力を強制処分に用いる際、その判定がどの検証・認可の下で使われたかをどう証明するか」は、本事案を契機に公共部門調達・制度設計の必須要件として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（AI の判定出力が、その根拠・検証状態・認可を独立に証明できないまま、行政の強制処分の根拠として機能する）に対して、Lemma は、AI 出力が下流の意思決定に用いられる時点で、その使用条件を独立検証可能な暗号証明として固定する設計を提示している。

- **出力使用の事前証明**: 「どの出力が」「どの信頼性条件で」「どの独立裏付け・認可の下で」使用されるかを、強制処分の前に独立検証可能な証跡として固定し、裏付け・認可が無ければ当該処分を保留する
- **改ざんできない証跡**: 判定が行動の前に独立検証・認可された事実（あるいはされなかった事実）を、後から改ざんできない記録として残す
- **公平性は保証せず、説明責任を満たす**: Lemma は判定の公平性そのものを保証しないが、行政が AI 利用の説明責任を制度的に満たすための監査・証跡層に相当し、システムインテグレーション経由で公共部門の調達要件に組み込みうる
- **選択的開示**: 元データや内部状態を全面開示せずに、「この出力が独立裏付け・認可の下で使われた」ことだけを最小開示する

検出（FRT 精度の計測、事後の誤り是正）は被害の把握・救済に、事前証明（強制処分の前に AI 出力の裏付け・認可を独立検証する証跡）は判定が行動に移る前の信頼確立に、それぞれ相補的に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)（GitHub）を参照のこと。設計と適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/) も参照。

---

## 8. Sources

- **CBS News**: “Florida man blames wrongful arrest on ‘error-prone’ AI facial recognition”（2026-06）— <https://www.cbsnews.com/news/lawsuit-wrongful-arrest-ai-facial-recognition/>
- **WUSF**: “How an AI facial recognition tool led to a Florida man's wrongful arrest”（2026-06-18）— <https://www.wusf.org/courts-law/2026-06-18/ai-facial-recognition-tool-led-to-florida-man-wrongful-arrest-lawsuit>
- **Common Dreams**: “Florida Man's Wrongful Arrest Suit Highlights Dangers of AI Facial Recognition in Policing”（2026-06）— <https://www.commondreams.org/news/police-facial-recognition>
- **University of Michigan Law (Law Quadrangle、Williams 先例)**: “Flawed Facial Recognition Technology Leads to Wrongful Arrest and Historic Settlement”（2024–2025 Winter）— <https://quadrangle.michigan.law.umich.edu/issues/winter-2024-2025/flawed-facial-recognition-technology-leads-wrongful-arrest-and-historic>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
