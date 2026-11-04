---
brief_no: 43
title: "Tesla FSD：視界低下の事故で NHTSA が調査を引き上げ、安全の数字は自社の申告だった(NHTSA EA26002・Reuters)"
title_en: "Tesla FSD: NHTSA escalated its reduced-visibility crash probe, and the safety figures were self-reported (NHTSA EA26002, Reuters)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["attribute-proof-bypass", "ai-bias-harm"]
incident_date: 2026-03-18
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["061-hyundai-fca-phantom-braking", "012-williams-frt-wrongful-arrest", "021-wirecard-balance-attestation"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "none"
og_lead_ja: "Tesla FSD の視界低下の事故調査を NHTSA が引き上げ、安全の主張の比較を Reuters が報道"
og_lead_en: "NHTSA escalated its Tesla FSD reduced-visibility crash probe; Reuters reported on the safety-claim comparison"
og_kicker_ja: "AI の運転判断 · 安全の自己申告"
og_kicker_en: "AI DRIVING · SELF-REPORTED SAFETY"
og_headline_ja: "カメラの視界低下を\n検知しなかったと\nNHTSA が指摘。\n<accent>対象 約 320 万台</accent>"
og_headline_en: "FSD missed degraded\ncamera visibility,\nNHTSA says.\n<accent>About 3.2M vehicles.</accent>"
key_figures:
  - value: "3,203,754"
    unit: "台"
    label: "NHTSA の Engineering Analysis（EA26002）の対象"
    tone: "alert"
  - value: "9"
    unit: "件"
    label: "視界低下に関わる事故（死亡 1・負傷 1 を含む）。さらに 6 件を関連の可能性ありとして精査（NHTSA）"
  - value: "10 → 約 3"
    unit: "倍"
    label: "Tesla の「最大 10 倍安全」を、University of Michigan の研究者が対称な比較に補正した値（Reuters）"
glossary:
  - term: "FSD（Full Self-Driving）"
    desc: "Tesla の運転支援機能。カメラの入力から周囲を知覚し、走行の判断をする。"
  - term: "NHTSA"
    desc: "米国運輸省の道路交通安全局。車の欠陥を調べ、リコールを求める。"
  - term: "Engineering Analysis（EA）"
    desc: "NHTSA の欠陥調査で、予備評価（PE）の次の段階。通常、リコールの直前の段階にあたる。"
  - term: "SGO（Standing General Order）"
    desc: "自動運転・運転支援のシステムが関わる事故を、事業者が NHTSA に報告する命令。"
insight:
  slug: "self-reported-safety-figures"
  label: "申告のまま受け付けられる安全の数字"
  quote: "走行を続ける判断の前提と、当局や市場に出す事故の記録・安全の数字は、出す側の外で照合する段が無ければ、申告のまま受け付けられる。"
industries: ["manufacturing", "ai"]
operations: ["disclosure"]
attack_method: "ai-misuse"
impact: "視界低下に関わる事故 9 件（死亡 1・負傷 1）"
takeaway: "走行を続ける判断の前提も、当局と市場に出た事故の記録・安全の数字も、出す側の申告に拠っていた。"
search_title: "Tesla FSD の安全の数字：NHTSA 調査の経緯"
search_description: "NHTSA が Tesla FSD の視界低下の事故の調査を EA26002（対象 3,203,754 台）へ引き上げ、Reuters は「最大 10 倍安全」の比較が非対称と報じた。何が起きたか、何を照合するか、対策を整理。"
self_check: "外に出す事故の記録や安全の数字が、定めた集計の定義と範囲どおりかを、出す前に照合する仕組みがあるか。"
countries: ["us"]
---

## 1. 要点

NHTSA は、レビューした衝突で、FSD がカメラの視界を損なう路面の条件を検知せず、または衝突の直前まで性能の劣化を警告しなかったと認定した。Tesla は、データのラベリングの制約で、劣化検知が作動中の事故を一律には特定できないと NHTSA に説明し、NHTSA はそれが事故の過少報告を招いた可能性を指摘した。安全の主張の比較については、Reuters が別に報じた。規制の調査と調査報道は、走行と申告が受け付けられた後に働く。<strong>走行を続ける判断の前提と、当局や市場に出す事故の記録・安全の数字は、出す側の外で照合する段が無ければ、申告のまま受け付けられる。</strong>

## 2. 通った操作

- **通った操作**: 二つある。一つは、カメラの視界が落ちた場面での走行の継続。NHTSA によれば、車両は直前の他車を見失う、または全く認識しないまま衝突に至った。もう一つは、事故の記録と安全の数字の提出・公表。事故の記録は SGO の報告として NHTSA に届き、「最大 10 倍安全」という主張は市場に出た。
- **受け付けた側に届くもの**: 一般に、走行の制御は、カメラの入力が有効だというシステム自身の判定を前提に動く。当局は、提出された事故データを起点に評価する。比較に使った母集団の選び方は、出す側の集計の中で決まり、受け取る側からは見えにくい。
- **検知の経路**: NHTSA の段階的な調査（PE24031 → EA26002、別に PE25012 と事故報告の実務の調査）、Reuters の調査報道、社内のデータラベラーへの取材。いずれも走行と申告の後に働く。
- **公表されていないこと**: 参照した資料には、2024-06-28 に開発に着手した劣化検知の更新が、いつ・どの車両に配備されたかは無い（NHTSA も把握していないとする）。個別の事故の責任の認定も出ていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、走行を続ける判断の前提と、外に出す事故の記録・安全の数字を、それを作った処理の外で、実行や提出の前に照合することである。

- **誰が承認を出すか**: 走行の判断では、入力が有効とみなす条件を定める側（車両の安全機能の設計）。提出と公表では、報告の義務・指標の定義・比較の母集団を定める側（当局の報告の様式、社内の集計の定義）。
- **どこで照合するか**: カメラの入力が有効だとして走行を続ける直前と、事故の記録を当局に出す直前・安全の数字を公表する直前。前者はシステムの自己判定だけでなく外から照合できる条件で、後者は原データと定義に対して。照合できないものは、保留にして、確認できるまで出さない。
- **何が残るか**: どの判断・どの提出を、どの条件と定義を満たして行ったかの記録と、そのときのテレメトリ（映像・EDR・CAN）。後から書き換えられない形で、判断と集計をした処理の外に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝走行を続ける前、事故の記録や安全の数字を出す前に、その前提と定義を、作った処理の外で照合し、記録に残すこと。検知＝走行と申告の後に、調査や報道から気づくこと。日付は、各社・当局・報道が確認・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>走行の前提と、出す記録・数字を、作った処理の外で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>視界低下に関わる事故 9 件<br>対象期間の一部で過少報告の可能性（NHTSA）</span></div>
<div class="rx-zone det"><b>検知 · 走行と申告の後に働いた</b>NHTSA の調査が段階を上げ、Reuters が安全の主張の比較を報じた</div>
<div class="rx-g g1"><div class="t">2024-06-27</div><b>死亡事故の SGO 報告を提出</b></div>
<div class="rx-g g2"><div class="t">2024-10</div><b>NHTSA が PE24031 を開始</b></div>
<div class="rx-g g3"><div class="t">2026-03-18</div><b>EA26002 へ引き上げ</b></div>
<div class="rx-g g4"><div class="t">2026-05-28</div><b>Reuters の報道</b></div>
</div>
</figure>

検知は、走行の判断の失敗、過少報告の可能性、比較の非対称を外から見えるようにし、調査の段階を上げた。走行と提出の前の照合とは、別に働く。AI の判断が独立した照合を欠いたまま行動に直結した事案に、[Brief 061](https://lemma.frame00.com/ja/critical/briefs/061-hyundai-fca-phantom-braking/)（危険がないのに自動ブレーキが作動した）、自己申告の数字が開示に直結した事案に、[Brief 021](https://lemma.frame00.com/ja/critical/briefs/021-wirecard-balance-attestation/)（残高の属性が開示と市場に直結した）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、AI の判断を実行する側と、事故の記録や安全の数字を外に出す側に組み込む。** 知覚の正否を判定したり、事故を検出したりするのではなく、判断の前提と、出す記録・数字が、あらかじめ定めた条件と定義を満たしているかを、作った処理の外で照合し、記録に残す。

### 注意したい業界・業務

- **業界 · 製造**: 車両や機械に、人の運転や操作を代わる自動制御の機能を載せる組織。
- **業界 · AI 導入**: AI の判断の安全性を、自社の集計した数字で当局や市場に示す組織。
- **業務 · 情報の開示・提供**: 事故の記録や安全の指標を、当局への報告や公表として外に出す業務。

### いまの対策と Lemma の違い

今回は、3 つの列のどれもが通った経路にあたる。

| 対策 | 視界が落ちた場面での走行の継続 | 当局に出す事故の記録 | 市場に出す安全の数字 |
| --- | --- | --- | --- |
| 劣化検知システムの更新（2024-06-28 に開発に着手） | 一部 | 関係しない | 関係しない |
| メトリクスの標準化・第三者による検証（議論が続く） | 関係しない | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 一部 | 効く | 一部 |

劣化検知の更新は、検知の性能を変えるもので、個々の走行の継続を外から照合するものではない。標準化と第三者の検証は、出す側の自己申告のデータに拠る部分が大きい。Lemma は、事故の記録を原データ（映像・EDR・CAN）に結びつけ、報告の定義と範囲どおりかを提出の前に照合する。安全の数字では、公表した定義どおりに集計されたかを照合できるが、比較の母集団の選び方が妥当かは判定しない。

注：Lemma の照合が働くのは、走行の制御や提出・公表の手順に照合を組み込み、条件・定義・原データを、判断と集計をした処理の外で管理できる場合に限る。条件や定義そのものが誤っていれば、誤ったものも通る。ラベリングされなかった事故を見つけるには、原データが漏れなく結びつけられている必要がある。走行の前提を、走行中の短い時間でどう照合できるかは、参照した資料からは分からない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI の判断の安全性を、記録や数字で外に示す組織で確認する 3 項目

- AI の判断に使う入力が有効かを、判断をする仕組みの外の条件で、実行の前に照合しているか。
- 当局に出す事故の記録を、原データに結びつけ、どの事故を含めたかを後から確認できるか。
- 判断と事故の記録・テレメトリを、後から書き換えられない形で残しているか。

## 5. 事実と時系列

- **対象**: Tesla の FSD を搭載した車両。EA26002 の対象は 3,203,754 台。
- **識別子**: NHTSA の予備評価 PE24031（2024-10 開始）を、2026-03-18 に Engineering Analysis EA26002 へ引き上げ。
- **NHTSA が認定したこと**: レビューした衝突で、システムが「カメラの視界を損なう一般的な路面条件を検知せず、かつ／または、衝突直前までカメラ性能の劣化を警告しなかった」。車両は直前の他車を見失う、または全く認識しないまま衝突に至った。
- **事故**: 視界低下に関わる 9 件（死亡 1・負傷 1 を含む）を確認し、さらに 6 件を関連の可能性ありとして精査している。
- **報告について**: Tesla は「データ・ラベリング上の制約」により、劣化検知が作動中の事故を一律に特定・分析できないと NHTSA に説明した。NHTSA は、これが対象期間の一部で事故の過少報告を招いた可能性があるとした。
- **安全性の主張**: Reuters によれば、Tesla の「最大 10 倍安全」という主張は、自社のエアバッグ展開事故と、連邦の全レッカー事故の比較に基づく。University of Michigan の研究者が対称な比較に補正すると、優位は約 3 倍に縮み、それも車両の年齢差（Tesla 平均 4.1 年、全米 12.8 年）などで信頼性が低いとされた。レビューした交通安全の研究者 11 名のうち 10 名が「誤解を招くマーケティング」と評価した。
- **データの提出**: 別の調査で、Tesla は FSD の走行違反のデータ（映像・EDR・CAN バス）の提出を繰り返し延期している。

### 時系列

- **2021 年央**: Tesla が車載レーダーを廃し、カメラだけの方式へ移る（社内の技術者の懸念に反したと報じられる）。
- **2023-11-28**: FSD と視界低下が関わる死亡事故が起きる。
- **2024-06-27**: Tesla が当該事故の SGO 報告を提出する（発生から約 7 か月後）。
- **2024-06-28**: Tesla が劣化検知システムの更新の開発に着手する。NHTSA は、その更新がいつ・どの車両に配備されたかを把握していないとする。
- **2024-10**: NHTSA が予備評価 PE24031 を開始する（視界低下の下での 4 件の衝突、うち 1 件は歩行者の死亡）。
- **2025-08**: NHTSA が、Tesla の事故報告の実務に関する別の調査を起こす。
- **2025-10**: NHTSA が、走行違反（赤信号の無視・対向車線への進入など）58 件に関する別の調査 PE25012 を開始する。
- **2026-03-18**: NHTSA が調査を Engineering Analysis EA26002 へ引き上げる（約 320 万台、死亡 1 を含む 9 件）。
- **2026-05-28**: Reuters が、Tesla の安全性の主張の比較の方法と、社内のデータラベラーの不信を報じる。

> 台数（3,203,754）・事故の件数（9 件、精査中 6 件）・認定の内容・過少報告の可能性は NHTSA の EA26002 の開始通知に、安全性の主張の比較と研究者の評価は Reuters の報道に拠る。個別の事故の最終的な責任の認定・係争の帰結は、調査・訴訟の進行に依存するため、本文では断定しない。本 Brief は、Tesla を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **NHTSA**: FSD / Autopilot をめぐり複数の並行の調査を運用し、視界低下の調査を EA へ引き上げた。事故データ・走行違反データの提出の遅れが、調査の実効性をめぐる論点になっている。
- **安全保証・標準**: 自動運転の安全保証では、安全運転事例（safety case）の提示、事故・走行データの第三者による検証、メトリクスの標準化（比較の母集団・閾値の整合）をめぐる議論が続く。これらは事業者の自己申告のデータに拠る部分が大きい。
- **規制の重心**: 自動運転・先進運転支援で、安全性の主張を、事業者の自己申告ではなく、外から照合できる形で求める要請が強まっている。

## 6. Sources

- **NHTSA ODI（一次情報）**: Engineering Analysis EA26002 開始通知（PE24031 からの昇格、対象 3,203,754 台、劣化検知の不作動、過少報告の可能性）— <https://static.nhtsa.gov/odi/inv/2026/INOA-EA26002-10023.pdf>
- **Reuters（調査報道・一次）**: “Why Tesla's AI trainers don't trust its self-driving tech — or its safety stats”（2026-05-28、安全性主張の約 3 倍の水増し、比較母集団の非対称、研究者評価）— <https://www.reuters.com/investigations/why-teslas-ai-trainers-dont-trust-its-self-driving-tech-or-its-safety-stats-2026-05-28/>
- **Electrek（二次情報）**: “Tesla is one step away from having to recall FSD in NHTSA visibility crash probe”（2026-03-19、EA26002 の詳細・タイムライン）— <https://electrek.co/2026/03/19/nhtsa-upgrades-tesla-fsd-visibility-investigation-3-2-million-vehicles/>
- **Electrek（二次情報）**: “Tesla's own AI trainers don't trust 'Full Self-Driving' or its safety stats, Reuters finds”（2026-05-28、Reuters 調査の要点整理）— <https://electrek.co/2026/05/28/tesla-fsd-safety-stats-misleading-reuters-investigation/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
