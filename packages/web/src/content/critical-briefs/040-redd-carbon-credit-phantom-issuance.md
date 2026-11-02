---
brief_no: 40
title: "Operation Greenwashing：保全の実態がないとされる森林から、カーボンクレジットが発行・販売されていた(ブラジル連邦警察・Mongabay)"
title_en: "Operation Greenwashing: carbon credits were issued and sold from forests allegedly not conserved (Brazil Federal Police, Mongabay)"
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
layout: "report"
sections: "proof"
gate: "intake"
og_lead_ja: "ブラジル連邦警察が Operation Greenwashing で 31 名を起訴。保全の実態がないとされる森林からクレジットが発行・販売されていた"
og_lead_en: "Brazil's Federal Police charged 31 people in Operation Greenwashing over credits issued and sold from forests allegedly not conserved"
og_kicker_ja: "環境属性の申告 · カーボンクレジット"
og_kicker_en: "ENVIRONMENTAL CLAIMS · CARBON CREDITS"
og_headline_ja: "保全の実態のない森から\nクレジットが出たと\n連邦警察が主張。\n<accent>31 名を起訴</accent>"
og_headline_en: "Credits from forests\nwith no conservation,\nBrazil police allege.\n<accent>31 people charged.</accent>"
key_figures:
  - value: "31"
    unit: "名"
    label: "Operation Greenwashing で連邦警察が詐欺・土地収奪等の容疑で起訴（2025-10）"
    tone: "alert"
  - value: "14 万超"
    unit: "ha"
    label: "対象の REDD+ プロジェクト 2 件（Unitor・Fortaleza Ituxi）の合計面積"
  - value: "2024-05 → 2025-10"
    label: "Mongabay の調査報道から、連邦警察の起訴まで"
glossary:
  - term: "REDD+"
    desc: "森林の減少・劣化を抑えて回避した排出を、クレジットとして数える仕組み。"
  - term: "カーボンクレジット（自主的炭素市場）"
    desc: "回避・削減した排出量を取引できる単位にしたもの。企業が自社の排出の相殺に使う。"
  - term: "ベースライン"
    desc: "保全しなかった場合に起きたはずの伐採・排出の見込み。回避した排出量はここから数える。"
  - term: "MRV"
    desc: "測定・報告・検証。衛星やリモートセンシングで、発行の後に区域の状態を見る取り組みを含む。"
insight:
  slug: "self-declared-environmental-attribute"
  label: "申告のまま発行される環境属性"
  quote: "保全した面積や回避した排出量の申告は、発行の前に、申告した側の外にある原データと照合する段が無ければ、申告のまま受け付けられる。"
industries: ["finance", "public-sector"]
operations: ["approval"]
attack_method: "privilege-abuse"
controls:
  - slug: "ownership-check"
    item: "申告された保全面積・伐採量を、衛星データなど原データと照合する"
impact: "連邦警察が 31 名を起訴。対象の 2 プロジェクトは合計 14 万 ha 超"
takeaway: "保全面積・伐採量の申告は、土地と環境の登録を根拠に受け付けられ、連邦警察はその登録に公務員の関与による不正があったとした。"
search_title: "ブラジルのカーボンクレジット捜査：31 名を起訴"
search_description: "ブラジル連邦警察は Operation Greenwashing で 31 名を起訴し、保全の実態のない森林からクレジットが発行・販売されたとした。何が通ったか、発行の前に何を照合するか、対策を整理。"
self_check: "保全や排出削減の申告を受け付ける前に、申告した側の外にある原データ（衛星の観測など）と照合する仕組みがあるか。"
countries: ["br"]
---

## 1. 要点

連邦警察によれば、同じ区域でクレジットを生成しながら、他所で違法に伐採した木材を「正規の産地」として流していた。連邦政府の所有地や保護区を自らの登録地とする土地収奪も併存し、土地改革庁・登記所・州の環境機関の公務員の関与で不正な登録が可能になったとする。いずれも捜査機関の主張で、裁判で確定したものではない。申告と実態の不一致は、調査報道と衛星画像の分析、捜査によって、クレジットが販売された後に外から見えた。<strong>保全した面積や回避した排出量の申告は、発行の前に、申告した側の外にある原データと照合する段が無ければ、申告のまま受け付けられる。</strong>

## 2. 通った操作

- **通った操作**: 連邦警察の主張によれば、二つある。一つは、保全面積・伐採量などの申告に基づくクレジットの発行と販売。もう一つは、連邦政府の所有地や保護区を自らの土地とする登録。クレジットは Nestlé・Toshiba・Spotify・Boeing・PwC などに販売されていた。
- **受け付けた側に届くもの**: 一般に、クレジットの発行では、土地の登録・保全面積・ベースライン・伐採量が申告データとして届き、その一部は土地改革庁・登記所・州の環境機関の記録を根拠に受け付けられる。根拠の記録そのものが操作されていれば、受け付ける側の手元の記録どうしは食い違わない。
- **検知の経路**: Mongabay 記者 Fernanda Wenzel の調査報道（2024-05）と、その依頼で CCCA が行った衛星画像の分析が、申告された伐採量と衛星の推定値の不一致を指摘した。その後、連邦警察が捜査した。いずれも発行と販売の後に働いた。
- **公表されていないこと**: 参照した資料には、個別の発行ロット・無効化・買い戻しの確定値は無い。発行の手続きで、申告がどの記録とどう照らし合わされたかも書かれていない。起訴は捜査の段階で、有罪は確定していない。

## 3. 何を照合するか

経路を問わず区別できる条件は、保全面積・伐採量の申告と区域の帰属を、申告した側の外にある原データと、クレジットを発行する前に照合することである。

- **誰が承認を出すか**: 発行では、方法論の要件を定め、発行を決める側（認証・登録の仕組み）。原データでは、衛星の観測を出す側と、土地の帰属を記録する公的な登記の側。申告する事業者が、自らの申告の根拠を出す形にしない。
- **どこで照合するか**: クレジットを発行する直前と、区域の帰属の登録を根拠として受け付ける直前。申告された値を、原データの出どころが記録した値と照らし、方法論の要件を満たすかを照合する。照合できないものは、確認できるまで発行しない。
- **何が残るか**: どの申告を、どの原データとどの方法論の要件で照合して発行したかの記録を、発行ロットごとに。後から書き換えられない形で、申告した側と発行した側の外に残す。後年に「当時、その区域は保全されていたか」を問われたときの手がかりになる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝クレジットを発行する前に、保全面積・伐採量の申告と区域の帰属を、申告した側の外の原データと照合し、記録に残すこと。検知＝発行と販売の後に、報道・衛星の分析・捜査から気づくこと。日付は、報道と捜査機関が公表した時期。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>申告と区域の帰属を、発行の前に原データと照合する</div>
<div class="rx-zone gapz"><b>連邦警察・報道が示したこと</b><span>申告された伐採量と衛星の推定値の不一致（CCCA）<br>クレジットの生成と木材の産地の偽装、不正な土地の登録（連邦警察）</span></div>
<div class="rx-zone det"><b>検知 · 発行と販売の後に働いた</b>調査報道と衛星の分析が不一致を指摘し、連邦警察が捜査して起訴した</div>
<div class="rx-g g1"><div class="t">2024-05</div><b>Mongabay の報道・CCCA の分析</b></div>
<div class="rx-g g2"><div class="t">2024–2025</div><b>連邦警察が捜査</b></div>
<div class="rx-g g3"><div class="t">2025-10</div><b>31 名を起訴</b></div>
<div class="rx-g g4"><div class="t">2025-11</div><b>国際的に報じられる</b></div>
</div>
</figure>

検知は、申告と実態の不一致を外から見えるようにし、捜査と、無効にすべきクレジットの特定を進める。発行の前の照合とは、別に働く。自己申告の属性が開示や受け付けに直結した事案に、[Brief 021](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（残高の属性）、[Brief 020](https://lemma.frame00.com/ja/critical/briefs/020-type-designation-conformity-fraud/)（製品の適合の属性）、[Brief 019](https://lemma.frame00.com/ja/critical/briefs/019-construction-engineer-qualification-fraud/)（人の資格の属性）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、クレジットを発行する側と、区域の登録を根拠として受け付ける側に組み込む。** 不正を検出したり、保全の方法論の妥当性を判定したりするのではなく、申告された値が、原データの出どころが記録した値と、あらかじめ定めた方法論の要件を満たしているかを、申告した側の外で照合し、記録に残す。座標や契約などの内部のデータを外に出さずに、要件を満たすことだけを示す形にもできる。

### 注意したい業界・業務

- **業界 · 金融**: カーボンクレジットなど、環境属性に基づく商品を発行・仲介・取引する組織。
- **業界 · 公共**: 土地の帰属や環境の許可など、発行の根拠として使われる記録を持つ機関。
- **業務 · 承認・決裁**: 事業者の申告をもとに、発行や登録の受け付けを決める業務。

### いまの対策と Lemma の違い

今回は、3 つの列のどれもが連邦警察と報道の示した経路にあたる。

| 対策 | 保全面積・伐採量の申告に基づく発行 | 区域の帰属の登録 | 発行されたクレジットの販売 |
| --- | --- | --- | --- |
| 方法論の厳格化（ベースライン・追加性・二重計上・恒久性） | 一部 | 関係しない | 関係しない |
| 衛星・リモートセンシングによる事後の監視（MRV） | 一部 | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 一部 |

方法論の厳格化は、何を数えるかの決まりを変えるもので、申告された値が原データと合うかを個々の発行の前に照合するものではない。衛星による監視は、不一致を見つけられるが、重心は発行の後にある。Lemma は、申告された保全面積・伐採量を、衛星の観測を出す側が記録した値と照らし、発行の前に照合する。区域の帰属では、登記の記録と合うかは照合できるが、登記の記録そのものが不正に作られていれば通る。販売では、発行の前の照合の記録があるかを、売る前・買う前に照合できるが、その記録がない取引を止めるかは、取引の手順で決まる。

注：Lemma の照合が働くのは、発行と登録の受け付けの手順に照合を組み込み、原データの出どころ（衛星の観測を出す側、登記）が、申告する事業者の外で値を記録する場合に限る。ベースラインや追加性の決め方そのものが誤っていれば、誤ったものも通る。公務員の関与で公的な記録が書き換えられた場合は、別の出どころの原データと照らせる範囲でしか照合できない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、不正や侵入を検出・防止するものではない。

### 点検チェックリスト

環境属性の申告をもとに、発行や登録を受け付ける組織で確認する 3 項目

- 区域の帰属を、一つの登録の記録だけでなく、別の出どころの記録とも照合できるか。
- 発行の判断を、どの原データとどの方法論の要件で行ったかを、発行ロットごとに後から確認できるか。
- 申告と照合の記録を、後から書き換えられない形で、申告した側の外に残しているか。

## 5. 事実と時系列

- **対象**: Amazonas 州 Lábrea の 2 つの REDD+ プロジェクト（Unitor・Fortaleza Ituxi）。合計 14 万ヘクタール超。
- **捜査**: 2025-10、ブラジル連邦警察が Operation Greenwashing として、3 つの相互に結びついたグループに属する 31 名を、詐欺・土地収奪等の容疑で起訴。同国でこれまでに捜査されたカーボンクレジット詐欺としては最大規模とされる。
- **連邦警察の主張**: 同じ区域でクレジットを生成しながら、他所で違法に伐採した木材を「正規の産地」としてロンダリングしていた。連邦政府の所有地や保護区を自らの登録地として偽る土地収奪が併存した。
- **公的機関**: 連邦警察は、土地改革庁（Incra）・登記所・Amazonas 州環境保護機関（Ipaam）の公務員の関与によって不正な登録が可能になったとした。
- **申告の内容**: 「森林を保全し、排出を回避した」という主張が、土地の登録・保全面積・回避した排出量の申告データに基づくクレジットとして示された。
- **検知の契機**: Mongabay 記者 Fernanda Wenzel の調査報道（2024-05）と、その依頼で CCCA が行った衛星画像の分析。申告された伐採量と衛星の推定値の不一致が指摘された。
- **販売先**: クレジットは Nestlé・Toshiba・Spotify・Boeing・PwC などに販売されていた。中心人物の一人とされる Ricardo Stoppe Júnior は、ブラジル最大級の個人のクレジット販売者で、COP28 を含む公開の場で事業のモデルを宣伝していた。

### 時系列

- **2024-05**: Mongabay が、Unitor・Fortaleza Ituxi の 2 プロジェクトが違法伐採の木材のロンダリングに結びついている疑いを報道。CCCA が衛星画像の分析で、申告された伐採量との不一致を指摘する。
- **2024–2025**: 連邦警察が Operation Greenwashing として捜査を続ける。土地の登録・保全面積・伐採量の申告と実態の不一致、公務員の関与を調べる。
- **2025-10**: 連邦警察が、3 つの相互に結びついたグループに属する 31 名を、詐欺・土地収奪等の容疑で起訴する。
- **2025-11**: 起訴が国際的に報じられる。Incra・Ipaam が捜査への協力を表明する。

> 不正の手口・公務員の関与・起訴の内容は、連邦警察の主張として Folha de S.Paulo と Mongabay が報じたものに拠る。起訴は捜査の段階で、有罪は確定していない。個別の発行ロット・無効化・買い戻しの確定値は、係争と捜査の進行に依存するため、本文では断定しない。本 Brief は、クレジットを購入した企業の落ち度を述べるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **捜査**: 連邦警察が組織犯罪として 31 名を起訴した。Incra・Ipaam は捜査への協力を表明した。公的な登録（土地・環境）が不正に使われたとされる点は、公的な記録への信頼を問う論点になった。
- **市場・認証**: 自主的炭素市場では、ベースラインの設定・追加性・二重計上・恒久性をめぐる方法論の厳格化と、衛星・リモートセンシングによる事後の監視（MRV）の強化が進む。これらは発行の後の検証に重心がある。
- **開示の要請**: 企業の排出量の開示で、相殺に使うクレジットの裏づけを、事業者の自己申告ではなく、外から照合できる形で求める要請が強まっている。

## 6. Sources

- **Mongabay（調査報道・一次）**: Fernanda Wenzel, “Top brands buy Amazon carbon credits from suspected timber laundering scam”（2024-05）— <https://news.mongabay.com/2024/05/top-brands-buy-amazon-carbon-credits-from-suspected-timber-laundering-scam/>
- **Mongabay（続報）**: “Brazil charges 31 people in major carbon credit fraud investigation”（2025-11-04、Operation Greenwashing・Unitor / Fortaleza Ituxi・14 万 ha 超・Incra / Ipaam の関与）— <https://news.mongabay.com/short-article/2025/11/brazil-charges-31-people-in-major-carbon-credit-fraud-investigation/>
- **Folha de S.Paulo（一次報道）**: “PF aponta organização criminosa e indicia 31 em maior fraude com créditos de carbono já investigada”（2025-10）— <https://www1.folha.uol.com.br/ambiente/2025/10/pf-aponta-organizacao-criminosa-e-indicia-31-em-maior-fraude-com-creditos-de-carbono-ja-investigada.shtml>
- **Business & Human Rights Resource Centre（集約）**: “Brazil: Federal Police indicted 31 suspects for fraud and land-grabbing in massive criminal carbon credit scheme in the Amazon” — <https://www.business-humanrights.org/en/latest-news/brazil-federal-police-indicted-31-suspects-for-fraud-and-land-grabbing-in-massive-criminal-carbon-credit-scheme-in-the-amazon/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
