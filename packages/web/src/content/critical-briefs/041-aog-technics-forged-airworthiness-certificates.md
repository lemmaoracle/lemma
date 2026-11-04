---
brief_no: 41
title: "AOG Technics：偽造された耐空証明書付きの航空機エンジン部品が出回った(英 SFO)"
title_en: "AOG Technics: aircraft engine parts circulated with forged airworthiness certificates (UK SFO)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["data-provenance"]
incident_date: 2026-02-23
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["020-type-designation-conformity-fraud", "035-boeing-787-inspection-records", "019-construction-engineer-qualification-fraud", "021-wirecard-balance-attestation"]
status: published
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "英 SFO によれば、AOG Technics が偽造された耐空証明書付きの航空機エンジン部品 6 万点超を販売。同社ディレクターに禁錮 4 年 8 月の判決"
og_lead_en: "According to the UK SFO, AOG Technics sold 60,000+ aircraft engine parts with forged airworthiness certificates; its director was sentenced to 4 years 8 months"
og_kicker_ja: "偽造の証明書 · 航空機の部品"
og_kicker_en: "FORGED CERTIFICATES · AIRCRAFT PARTS"
og_headline_ja: "偽造の耐空証明書つきで\nエンジン部品を販売と\nSFO が発表。\n<accent>6 万点超</accent>"
og_headline_en: "Engine parts sold with\nforged airworthiness\ncertificates, SFO says.\n<accent>60,000+ parts.</accent>"
key_figures:
  - value: "6 万超"
    unit: "点"
    label: "偽造された ARC を伴って販売された航空機エンジン部品（SFO・報道）"
    tone: "alert"
  - value: "約 690 万"
    unit: "ポンド"
    label: "偽造された ARC を伴って販売された部品の金額（SFO・報道）"
  - value: "2019-01 → 2023-07"
    label: "偽造された証明書付きの部品が販売されていた期間"
glossary:
  - term: "ARC（Authorised Release Certificate）"
    desc: "部品が耐空性の要件を満たし、使ってよい状態であることを示す証明書。部品と一緒に受け渡される。"
  - term: "耐空性"
    desc: "航空機や部品が、安全に飛行できる状態にあること。"
  - term: "OEM"
    desc: "部品やエンジンの製造元。本件では Safran（CFM International の共同保有者）など。"
  - term: "SFO（重大不正捜査局）"
    desc: "英国で重大な詐欺・汚職を捜査し、訴追する機関。"
insight:
  slug: "certificate-accepted-on-appearance"
  label: "体裁のまま受け付けられる証明書"
  quote: "部品に付いてきた証明書は、受け入れの前に、発行したとされる側の記録と照合する段が無ければ、体裁が整っているだけで受け付けられる。"
industries: ["manufacturing", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "ownership-check"
    item: "部品の証明書が正規の発行元によるものか、発行元に照会して確認する"
  - slug: "hold-unverified"
    item: "証明書を確認できない部品は機体に組み込まない"
attack_method: "supply-chain"
impact: "偽造された証明書付きの部品 6 万点超が販売された"
takeaway: "偽造された証明書は正規の体裁で部品と一緒に届き、偽造は、ある航空会社が部品の真贋を Safran に照会したことで判明した（SFO・報道）。"
search_title: "AOG Technics 事件：偽造の耐空証明書で部品6万点超"
search_description: "英 SFO によれば、AOG Technics は偽造した耐空証明書（ARC）を付けた航空機エンジン部品 6 万点超を販売し、同社ディレクターは禁錮 4 年 8 月の判決を受けた。何が通ったか、受け入れの前に何を照合するか、対策を整理。"
self_check: "部品を受け入れる前に、付いてきた証明書が、発行したとされる側の記録にあるかを照合する仕組みがあるか。"
countries: ["gb"]
---

## 1. 要点

SFO の発表と報道によれば、同社のディレクターは正規の証明書を改ざんし、OEM から直接仕入れたかのような出荷メモと、架空の従業員の名による署名・メールを付けて、正規の供給元を装っていた。偽造は、ある航空会社が部品の真贋を Safran に照会したことで判明し、英 CAA・米 FAA・欧州 EASA が安全警告を出して、多くの航空会社が該当する機体を運航から外した。証明書が本物でないことは、発行したとされる側に問い合わせたときに、販売のあとで外から見えた。<strong>部品に付いてきた証明書は、受け入れの前に、発行したとされる側の記録と照合する段が無ければ、体裁が整っているだけで受け付けられる。</strong>

## 2. 通った操作

- **通った操作**: SFO の発表と報道によれば、偽造された ARC を伴う航空機エンジン部品の販売。部品には、OEM から直接購入したかのような偽の出荷メモと、架空の従業員（営業・品質管理の担当）を名乗る署名・メールが付いていた。多くは CFM56 エンジン（Boeing 737／Airbus A320 に広く搭載）向けだった。
- **受け付けた側に届くもの**: 一般に、部品の受け入れでは、部品と一緒に ARC などの証明書と出荷の記録が届く。証明書と出荷の記録がそろって作られていれば、受け取る側の手元の書類どうしは食い違わない。
- **検知の経路**: 2023 年、ある航空会社が部品の真贋を Safran に照会し、証明書が偽物と判明した。Safran が当局に通報し、CAA・FAA・EASA が安全警告を出した。いずれも販売のあとに働いた。
- **公表されていないこと**: 参照した資料には、部品を受け入れた各社が証明書をどのように確認していたか、偽造された証明書付きの部品のうちどれだけが機体に組み込まれたかは書かれていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、部品に付いてきた証明書の発行元・対象の部品・発行の事実を、販売した側の書類とは別に、発行したとされる側の記録と、受け入れる前に照合することである。

- **誰が承認を出すか**: 証明書を発行する側（ARC の発行元、OEM）。発行元が、どの部品にどの証明書を出したかを自らの記録として出す。部品を販売する側が、証明書の根拠を自ら出す形にしない。
- **どこで照合するか**: 部品を受け入れる直前と、機体に組み込む直前。届いた証明書の記載を、発行元が記録した内容と照らし、合うかを照合する。照合できない部品は、確認できるまで受け入れず、組み込まない。
- **何が残るか**: どの部品を、どの証明書と、発行元のどの記録で照合して受け入れたかを、部品ごとに。後から書き換えられない形で、販売した側と受け入れた側の外に残す。安全警告が出たとき、該当する部品をたどる手がかりになる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝部品を受け入れる前に、付いてきた証明書を、発行したとされる側の記録と照合し、記録に残すこと。検知＝販売のあとに、照会・通報・安全警告・捜査から気づくこと。日付は、SFO の発表と報道に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>証明書を、受け入れの前に発行元の記録と照合する</div>
<div class="rx-zone gapz"><b>SFO・報道が示したこと</b><span>正規の ARC の改ざんと、OEM から仕入れたかのような偽の出荷メモ<br>架空の従業員の名による署名・メール</span></div>
<div class="rx-zone det"><b>検知 · 販売のあとに働いた</b>航空会社の照会で偽造が判明し、当局が安全警告を出し、SFO が捜査・訴追した</div>
<div class="rx-g g1"><div class="t">2019-01 → 2023-07</div><b>偽造された ARC 付きの部品を販売</b></div>
<div class="rx-g g2"><div class="t">2023</div><b>Safran への照会・安全警告</b></div>
<div class="rx-g g3"><div class="t">2025-12-01</div><b>有罪を認める</b></div>
<div class="rx-g g4"><div class="t">2026-02-23</div><b>禁錮 4 年 8 月の判決</b></div>
</div>
</figure>

検知は、偽造された証明書付きの部品を外から見えるようにし、該当する部品の特定と交換、捜査を進める。受け入れの前の照合とは、別に働く。規制で求められる属性が、それを示す書類のまま受け付けられた事案に、[Brief 020](https://lemma.frame00.com/ja/critical/briefs/020-type-designation-conformity-fraud/)（製品の適合の属性）、[Brief 019](https://lemma.frame00.com/ja/critical/briefs/019-construction-engineer-qualification-fraud/)（人の資格の属性）、[Brief 021](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（残高の属性）、記録と実態が合っていなかった事案に [Brief 035](https://lemma.frame00.com/ja/critical/briefs/035-boeing-787-inspection-records/)（検査の記録）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、部品を受け入れる側と、機体に組み込む手順に組み込む。** 偽造を検出したり、部品の状態を検査したりするのではなく、届いた証明書の発行元・対象の部品・発行の事実が、発行元の記録と合うかを、販売した側の外で照合し、記録に残す。取引の条件などの機微な情報を外に出さずに、照合が済んだことだけを示す形にもできる。

### 注意したい業界・業務

- **業界 · 製造・基幹インフラ**: 航空機の運航・整備など、部品の証明書を根拠に、安全に直結する部品を使う組織。
- **業界 · 調達・サプライチェーン**: 製造元から直接ではなく、商社や仲介を通じて、証明書付きの部品を仕入れる組織。
- **業務 · 承認・決裁**: 届いた証明書をもとに、部品の受け入れや組み込みを決める業務。

### いまの対策と Lemma の違い

今回、SFO と報道が示した経路は 1 列目にあたる。2 列目と 3 列目は、受け入れたあとの段である。

| 対策 | 証明書付きの部品の受け入れ | 機体への組み込み | 安全警告のあとの該当部品の特定 |
| --- | --- | --- | --- |
| 受け入れの書類の点検（証明書の体裁・記載） | 一部 | 一部 | 関係しない |
| 発行元（OEM）への個別の照会 | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 一部 |

書類の点検は、記載の不備は見つけられるが、正規の体裁を写した証明書が本物かは分からない。発行元への照会は、今回、偽造が判明した経路だが、照会するかどうかは部品ごと・担当ごとの判断に任される。Lemma は、届いた証明書を、受け入れの前に発行元の記録と照らし、照合できないものを受け付けない。組み込みでは、照合の記録があるかを組み込む前に照合できるが、記録の無い部品を止めるかは整備の手順で決まる。該当部品の特定では、どの部品をどの証明書で受け入れたかの記録をたどれるが、照合を組み込む前に受け入れた部品には記録が無い。

注：Lemma の照合が働くのは、受け入れと組み込みの手順に照合を組み込み、証明書の発行元が、販売する側の外で、どの部品にどの証明書を出したかを記録する場合に限る。発行元の記録そのものが誤っていれば、誤ったものも通る。照合できるのは証明書と記録が合うかで、部品そのものの状態ではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、不正や侵入を検出・防止するものではない。

### 点検チェックリスト

証明書付きの部品を受け入れ、組み込む組織で確認する 3 項目

- 照合できない部品を、確認できるまで在庫から出さず、機体に組み込まない手順があるか。
- どの部品を、どの証明書と、どの照合の結果で受け入れたかを、部品ごとに後から確認できるか。
- 安全警告が出たとき、該当する供給元から受け入れた部品を、記録からすぐに特定できるか。

## 5. 事実と時系列

- **対象**: AOG Technics（英国拠点の航空部品商社）と、同社から偽造された証明書付きの部品を購入した航空会社・整備事業者。
- **規模**: 2019 年 1 月〜2023 年 7 月に、偽造された ARC を伴う 6 万点超の航空機エンジン部品（約 690 万ポンド相当）が販売された。多くは CFM56 エンジン（737／A320）向け。
- **手口**: SFO の発表と報道によれば、同社ディレクター（Jose Alejandro Zamora Yrala）が自宅の PC で正規の ARC を改ざんし、Safran などの OEM から直接購入したかのような偽の出荷メモを作成した。架空の従業員（営業・品質管理の担当）を名乗る署名・メールで、正規の事業者を装った。
- **発覚**: 2023 年、ある航空会社が部品の真贋を Safran（CFM International の共同保有者）に照会し、証明書が偽物と判明した。Safran が当局に通報した。
- **規制の対応**: 英国 CAA・米国 FAA・欧州 EASA が AOG Technics の部品に関する安全警告を出した。Delta・American・Southwest・TAP・Ryanair・WestJet・Virgin Australia などが該当する機体を運航から外した。
- **被害**: 航空会社・製造各社の損失は 3,930 万ポンド超と推計されている。
- **司法**: 英国 SFO が捜査した。Zamora 被告は 2025-12-01 に Southwark 刑事法院で有罪を認め、2026-02-23 に禁錮 4 年 8 月の判決を受けた。

### 時系列

- **2019-01 → 2023-07**: AOG Technics が、偽造された ARC を伴う 6 万点超のエンジン部品（約 690 万ポンド相当）を販売する。
- **2023**: ある航空会社が部品の真贋を Safran に照会し、証明書が偽物と判明する。Safran が当局へ通報し、CAA・FAA・EASA が安全警告を出す。多くの航空会社が該当する機体を運航から外す。
- **2025-12-01**: Zamora 被告が Southwark 刑事法院で有罪を認める。
- **2026-02-23**: SFO が、禁錮 4 年 8 月の判決を公表する。

> 手口・判決の事実は、英国 SFO の発表と、確立した媒体の報道に拠る。金額・点数は当局と報道に依拠する。本 Brief は、被告個人の動機を論じるものではなく、部品を受け入れた航空会社・整備事業者の落ち度を述べるものでもない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **英国 SFO**: AOG Technics の偽造された証明書による部品の販売を捜査・訴追した。Zamora 被告は有罪を認め（2025-12-01）、禁錮 4 年 8 月の判決を受けた（2026-02-23 公表）。
- **規制当局（CAA・FAA・EASA）**: AOG Technics の部品に関する安全警告を出し、業界をまたいで該当部品の特定と除去を促した。
- **OEM・航空会社**: Safran への照会を端緒に発覚した。Delta・American・Southwest などが該当する機体を運航から外し、業界全体で部品の追跡と交換が進んだ。

## 6. Sources

- **英国 SFO（GOV.UK、一次）**: “SFO secures 4-year prison sentence for aircraft parts fraud”（2026-02-23）— <https://www.gov.uk/government/news/sfo-secures-4-year-prison-sentence-for-aircraft-parts-fraud>
- **AeroTime**: “Fake aircraft parts fraudster jailed for $52M scam that grounded airline fleets”（2026-02）— <https://www.aerotime.aero/articles/fake-aircraft-parts-aog-technics>
- **Simple Flying**: “60,000 Fake Parts Sold: The True Scale Of The AOG Technics Fraud” — <https://simpleflying.com/60000-fake-parts-sold-true-scale-aog-technics-fraud/>
- **reference 実装（GitHub）**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
