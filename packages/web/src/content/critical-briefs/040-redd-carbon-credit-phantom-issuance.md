---
brief_no: 40
title: "保全の実態がない森林から、カーボンクレジットが発行・販売されていた — 環境属性の裏づけデータが、発行時に独立検証されない構造（ブラジル Operation Greenwashing）"
title_en: "Phantom Carbon Credits — When an Environmental Attribute Is Issued Without Independent Verification of Its Underlying Data (Operation Greenwashing)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2025-10-14
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["021-wirecard-balance-attestation", "020-type-designation-conformity-fraud", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
og_lead_ja: "保全の実態がない森林からクレジットが発行・販売 — Operation Greenwashing"
og_lead_en: "Carbon credits from forests with no real conservation — Operation Greenwashing"
gap_detected: "調査報道と独立の衛星画像分析、連邦警察の捜査により、申告と実態の乖離は外部から可視化できた。"
gap_missing: "クレジットを発行する時点で「申告された保全面積・伐採量が原データの真の状態を反映しているか」を確かめる層が無く、事業者の自己申告がそのまま受理された。"
gap_fix: "クレジットを発行・取引する前に「この区域は方法論の要件を満たして実際に保全されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

連邦警察が「Operation Greenwashing」として 31 名を起訴した本事案では、保全の実態がない森林から作られたカーボンクレジットが Nestlé・Boeing などに販売されていた。調査報道・衛星分析・捜査は、クレジットが企業の開示に取り込まれた後に乖離を可視化する事後の検出にとどまる。欠けているのは、発行時に「申告された保全面積・伐採量が原データの真の状態を反映するか」を独立検証する層であり、事業者の自己申告がそのまま受理された。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **起訴**: 2025-10、ブラジル連邦警察が Operation Greenwashing として 31 名を詐欺・土地収奪の容疑で起訴。同国でこれまでに捜査されたカーボンクレジット詐欺としては最大規模とされる
- **対象プロジェクト**: Amazonas 州 Lábrea の 2 つの REDD+ プロジェクト（Unitor・Fortaleza Ituxi）、合計 14 万ヘクタール超
- **属性の提示手段**: 「森林を保全し炭素排出を回避した」という主張を、土地登録・保全面積・回避排出量の申告データに基づくクレジットとして提示
- **失敗の核**: 連邦警察によれば、同じ区域でクレジットを生成しながら、他所で違法伐採した木材を「正規の産地」としてロンダリングしていた。連邦政府所有地や保護区を自らの登録地として偽る土地収奪が併存した
- **検出の契機**: Mongabay 記者 Fernanda Wenzel の調査報道（2024-05）と、その依頼で CCCA が実施した衛星画像分析。申告された伐採量と衛星推定値の不一致が指摘された
- **流通先**: クレジットは Nestlé・Toshiba・Spotify・Boeing・PwC などに販売されていた。中心人物の一人 Ricardo Stoppe Júnior はブラジル最大級の個人クレジット販売者で、COP28 を含む公開の場で事業モデルを宣伝していた
- **共犯構造**: 連邦警察は、土地改革庁（Incra）・登記所・Amazonas 州環境保護機関（Ipaam）の公務員の関与によって不正な登録が可能になったとした
- **核心**: 環境属性の主張が、その根拠データの真正性を発行の時点で独立検証されないまま、事業者の自己申告のままクレジット化され、市場と企業の開示に直結した

---

## 2. タイムライン

- 2024-05: Mongabay が、Unitor・Fortaleza Ituxi の 2 プロジェクトが違法伐採木材のロンダリングに結びついている疑いを報道。CCCA が衛星画像分析で申告伐採量との不一致を指摘
- 2024–2025: 連邦警察が Operation Greenwashing として捜査を継続。土地登録・保全面積・伐採量の申告と実態の乖離、公務員の関与を調査
- 2025-10: 連邦警察が、3 つの相互に結びついたグループに属する 31 名を、詐欺・土地収奪等の容疑で起訴
- 2025-11: 起訴が国際的に報じられる。Incra・Ipaam は捜査への協力を表明

> 注: 個別の発行ロット・無効化（cancellation）・買い戻しの確定値は係争・調査の進行に依存するため、本文では断定しない。

---

## 3. 登録から市場流通までの経路

本事象は、環境属性（森林の保全・炭素固定）が独立検証されない発行構造に起因する。失敗が自主的炭素市場と企業の排出量開示へ伝播する経路は以下の通り。

1. **属性の主張**: 「特定区域の森林を保全し、本来発生するはずだった排出を回避した」という主張が、土地登録・保全面積・参照シナリオ（ベースライン）・伐採量の申告データとして提示される
2. **登録データへの依拠**: 申告データの一部が、土地改革庁・登記所・州環境機関の記録を根拠に受理される。これらの記録自体が共犯的に操作されていた場合、申告と原データの乖離は発行の時点で独立に再検証されない
3. **クレジット化と市場流入**: 申告に基づきクレジットが発行され、自主的炭素市場で取引される。購入企業はこのクレジットを自社の排出量相殺（カーボンオフセット）として開示に取り込む
4. **発覚の遅延**: 申告と実態（衛星から見える実際の伐採・土地の帰属）の乖離は、通常の発行・監査サイクルでは可視化されない。外部の調査報道と独立の衛星分析によって初めて外部から確認された
5. **影響の確定**: 不正が確定すると、クレジットの無効化・刑事訴追に加え、当該クレジットを購入・開示に用いた全企業について、相殺主張の遡及的な再検証が必要となる

---

## 4. 構造的論点

本事象は、Pillar 04（規制属性証明）の `attribute-proof-bypass` カテゴリに属する。中心的な失敗 primitive は、**環境属性（一定の森林が保全され炭素が固定された）の主張が、その根拠データの来歴・真正性の独立検証から切り離されたまま、クレジットとして受理される**点にある。「保全した」「排出を回避した」という属性は、土地登録・保全面積・伐採量という申告データの形で提示されるが、その原データ（衛星で観測される実際の森林状態、土地の真の帰属）の真正性は、発行の時点で検証層に接続されていない。申告データを信頼の終点とする限り、属性の主張と実態の乖離は検証層なしには可視化できない。secondary に `data-provenance`（保全面積・伐採量の原データの来歴）を併記する。

Brief 021（金融属性＝資産の実在）、Brief 020（製品の適合属性）、Brief 019（人の資格属性）と対象は異なるが、共通する primitive は同じである。すなわち、**ある属性の assertion が、それを検証する layer と切り離されている**。本事案は、その assertion が公的登録（土地・環境）を共犯的に取り込み、自主的炭素市場と企業の排出量開示にまで流入した点で、属性証明バイパスが「規制と市場の両面」に同時に波及する帰結を示す。

---

## 5. 検出と証明の落差

本事象では、調査報道（Mongabay）と独立の衛星画像分析（CCCA）、そして連邦警察の捜査という検出の系列が機能し、最終的に属性の主張と実態の乖離が外部から可視化された。これは検出の典型的成功であり、本 Brief が検出層の役割を否定するものではない。検出は、疑義の提起、捜査の駆動、発覚後の是正範囲（無効化すべきクレジットの特定）に不可欠である。

一方で、検出は「申告された保全面積・伐採量が、原データの真正な状態を反映しているか」を、クレジットを発行・購入する時点で変えることはできない。調査報道も衛星分析も、クレジットが発行され大手企業の開示に取り込まれた後に作動した事後の系列である。申告ベースの発行は、企業の排出量開示において「当時、その区域は実際に保全されていた」を独立に立証する材料には直接ならない。これは検出層の射程外にある、構造的に独立した層の落差である。

現状、自主的炭素市場の運用モデル全体において、環境属性の独立検証は、事業者から申告される登録データへの信頼に依存しており、まだ独立した層として扱われていない。事前証明（pre-execution attestation）は、発行・取引の経路に属性証明を 1 段挟むことで、この落差を埋める。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせでクレジットの trust boundary が確立される。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **捜査・規制**: 連邦警察が組織犯罪として 31 名を起訴。Incra・Ipaam は捜査への協力を表明した。公的登録（土地・環境）が共犯的に取り込まれた点は、公的記録への信頼そのものを問う論点となった
- **市場・認証**: 自主的炭素市場では、ベースライン設定・追加性（additionality）・二重計上・恒久性をめぐる方法論の厳格化と、衛星・リモートセンシングによる事後監視（MRV）の強化が進む。一方で、これらは発行後の検証に重心があり、発行時点で原データの真正性を独立検証する層は依然として薄い
- **規制の重心移動**: 規制の重心はデータ開示からコンプライアンス証明へ移りつつある。企業の排出量開示（および関連する開示規制）において、相殺に用いるクレジットの裏づけを、事業者の自己申告ではなく独立検証可能な形で求める要請が強まっている

環境属性の根拠を、発行・取引の時点で独立検証する層の不在は、特定事業者の問題ではなく、自主的炭素市場とそれを開示に取り込む企業の双方に横断する運用課題として残っている。

---

## 7. Lemma による分析

本事象で露呈した落差（環境属性の主張が、その根拠データの来歴の独立検証から切り離されたまま発行・市場・開示に直結する）に対して、Lemma は、クレジットの裏づけを発行時点で独立検証可能な暗号証明として commit し、認証機関・購入企業・規制当局が原データを事業者外に出さずに「この区域が方法論の要件を満たして保全されている」を独立に検証できる設計を提示している。

- **発行者署名付きアテステーション**: 原データの出所（衛星データ提供者・公的登記）が、観測値・帰属を発行者署名付きで証明する。事業者から転送される申告ではなく、原データの発行元に紐づく証明とする
- **スキーマバインド証明**: 各証明を、それが満たす方法論・規制スキーマ（REDD+ 方法論・追加性・ベースライン・開示基準）と紐付け、認証機関・規制当局がスキーマに対して直接検証できる形にする
- **選択的開示**: 「保全面積・回避排出量が基準を満たす」ことだけを最小開示し、座標・契約・事業者内部データは外に出さない
- **原本バインドと有効性**: 衛星観測・土地登録の原本に docHash で紐付け、実在・非改ざんを証明する。発行ロット単位で、当時の原データへのトレイルを固定する

これにより、発行・取引の時点で固定された証明が、「当時、その区域は実際に保全されていたか」を後年に問われた際に、原データを開示せず独立検証可能なトレイルとして機能する。検出（事後の衛星監視・調査報道）は発覚後の是正に、事前証明（発行時点の属性検証）は環境属性の独立検証に、それぞれ相補的に働く。

設計と適用範囲は、[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **Mongabay（調査報道・一次）**: Fernanda Wenzel, “Top brands buy Amazon carbon credits from suspected timber laundering scam”（2024-05）— <https://news.mongabay.com/2024/05/top-brands-buy-amazon-carbon-credits-from-suspected-timber-laundering-scam/>
- **Mongabay（続報）**: “Brazil charges 31 people in major carbon credit fraud investigation”（2025-11-04、Operation Greenwashing・Unitor / Fortaleza Ituxi・14 万 ha 超・Incra / Ipaam の関与）— <https://news.mongabay.com/short-article/2025/11/brazil-charges-31-people-in-major-carbon-credit-fraud-investigation/>
- **Folha de S.Paulo（一次報道）**: “PF aponta organização criminosa e indicia 31 em maior fraude com créditos de carbono já investigada”（2025-10）— <https://www1.folha.uol.com.br/ambiente/2025/10/pf-aponta-organizacao-criminosa-e-indicia-31-em-maior-fraude-com-creditos-de-carbono-ja-investigada.shtml>
- **Business & Human Rights Resource Centre（集約）**: “Brazil: Federal Police indicted 31 suspects for fraud and land-grabbing in massive criminal carbon credit scheme in the Amazon” — <https://www.business-humanrights.org/en/latest-news/brazil-federal-police-indicted-31-suspects-for-fraud-and-land-grabbing-in-massive-criminal-carbon-credit-scheme-in-the-amazon/>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
