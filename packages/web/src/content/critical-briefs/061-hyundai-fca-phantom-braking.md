---
brief_no: 61
title: "Hyundai：AI の自動ブレーキが、危険がないのに作動し、追突が起きた(NHTSA のリコール文書)"
title_en: "Hyundai: Driver-assist AI braked with no real danger, and cars were rear-ended (NHTSA recall report)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "ai-bias-harm"]
incident_date: 2026-05-22
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety", "012-williams-frt-wrongful-arrest"]
status: published
version: "1.0"
og_lead_ja: "AI の自動ブレーキが危険なく誤作動し追突を招く — Hyundai"
og_lead_en: "Driver-assist AI braked with no real threat, causing rear-end crashes — Hyundai"
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "AI の安全機能の誤作動 · 自動ブレーキ"
og_kicker_en: "AI SAFETY FEATURE · AUTO BRAKING"
og_headline_ja: "危険がないのに、\nAI の自動ブレーキが\n作動した。\n<accent>リコール 421,078 台</accent>"
og_headline_en: "With no real danger,\nAI auto-braking kicked in.\n<accent>421,078 vehicles recalled.</accent>"
key_figures:
  - value: "421,078"
    unit: "台"
    label: "リコールの対象（NHTSA 26V316）"
    tone: "alert"
  - value: "376"
    unit: "件"
    label: "前方衝突回避（FCA）の作動に関する報告（2024-10-28〜2026-04-27）"
  - value: "4"
    unit: "件"
    label: "Hyundai 車が後続車に追突された件数。負傷も 4 件が申告された（NHTSA のリコール文書）"
glossary:
  - term: "前方衝突回避（FCA）"
    desc: "前方カメラで先行車や障害物を知覚し、衝突が迫っていると判断すると、自動でブレーキをかける安全機能。"
  - term: "ファントムブレーキ"
    desc: "危険がない状況で、意図せず自動ブレーキがかかること。"
  - term: "ODI（欠陥調査局）"
    desc: "米国の NHTSA（運輸省の道路交通安全局）にある、車の欠陥を調べる部署。"
insight:
  slug: "braking-without-check"
  label: "危険がないのに作動した自動ブレーキ"
  quote: "人の運転に割り込む AI の判断は、その作動が必要かを実行の前に照合する段が無ければ、誤った判断も、正規の安全機能の作動として実行される。"
industries: ["manufacturing"]
controls:
  - slug: "hold-unverified"
    item: "人の運転に割り込む自動制動は、その作動が必要かを実行の前に照合できた場合に限って実行する"
  - slug: "audit-trail"
    item: "自動制動の判断とテレメトリを、後から書き換えられない形で記録する"
attack_method: "ai-misuse"
impact: "追突 4 件・負傷 4 件の申告"
search_title: "Hyundai の自動ブレーキ誤作動（26V316）：経緯と対策"
search_description: "Hyundai が、前方衝突回避の自動ブレーキが危険がないのに早すぎる作動をしうるとして 421,078 台をリコール（NHTSA 26V316）。何が起きたか、なぜ止まらなかったか、対策を整理。"
self_check: "人の運転に割り込む AI の判断を、実行する前に、その作動が必要かを照合する仕組みがあるか。"
countries: ["us"]
---

## 1. 要点

ソフトウェアの不具合により、危険がない状況でも、前方衝突回避（FCA）の自動ブレーキが早すぎるタイミングで作動しうるとして、リコールになった。所有者の報告や申し立てを集めてリコールに至る検知は、作動の後に働く。<strong>人の運転に割り込む AI の判断は、その作動が必要かを実行の前に照合する段が無ければ、誤った判断も、正規の安全機能の作動として実行される。</strong>

## 2. 通った操作

- **通った操作**: 危険がない状況での、自動ブレーキの作動。前方カメラ（multi-function camera）のソフトウェアの不具合により、FCA が早すぎるタイミングで作動しうる（NHTSA のリコール文書）。4 件で Hyundai 車が後続車に追突され、4 件の負傷が申告された。
- **受け付けた側に届くもの**: 一般に、ブレーキの制御は、FCA が出した制動の指示を、危険が実際に迫っているかを知らないまま実行する。誤作動も正規の安全機能の作動として実行され、車両の側からは、正常な作動と区別がつかない。
- **検知の経路**: 所有者の報告、NHTSA への申し立て、ODI の照会、リコール。いずれも被害と報告の後に働く。
- **公表されていないこと**: 参照した資料には、不具合が起きる条件の詳細、作動を止める別の仕組みが車両にあったか、追突 4 件以外の報告の内訳は無い。

## 3. 実行前の照合

経路を問わず区別できる条件は、人の運転に割り込む自動制動を実行する側が、その作動が必要かを、実行の前に、知覚と判断をしたカメラとソフトウェアの外で照合することである。

- **誰が承認を出すか**: 自動制動の作動の条件を定める側(車両の安全機能の設計)。作動は、カメラの判断とは別に、その作動が必要であることを示す条件が満たされたときに通す。
- **どこで照合するか**: 自動制動を実行する直前。知覚と判断がカメラとソフトウェアの内部で完結する場合、その内部の判断だけでなく、外から照合できる形の条件で。照合できない作動は、保留にして、確認できるまで止める。
- **何が残るか**: どの作動を、どの条件を満たして行った(または止めた)かの記録と、そのときのテレメトリ。後から書き換えられない形で、判断をした処理の外に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝自動制動を実行する前に、その作動が必要かを、カメラの判断の外で照合し、記録に残すこと。検知＝作動の後に、報告や申し立てから気づくこと。日付は、各社・当局が確認・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>制動の前に、その作動が必要かを、カメラの判断の外で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>危険がないのに急制動がかかりうる<br>追突 4 件・負傷 4 件の申告</span></div>
<div class="rx-zone det"><b>検知 · 作動の後に働いた</b>所有者の報告と申し立てが集まり、リコールに至った</div>
<div class="rx-g g1"><div class="t">2025-01</div><b>所有者アンケートで不具合の可能性を把握</b></div>
<div class="rx-g g2"><div class="t">2025-09</div><b>ODI が照会を開始</b></div>
<div class="rx-g g3"><div class="t">2026-04-27</div><b>報告が 376 件に</b></div>
<div class="rx-g g4"><div class="t">2026-05</div><b>421,078 台のリコール</b></div>
</div>
</figure>

検知は、何件起きたかを可視化し、リコールとカメラの再フラッシュにつながった。個々の作動の前の照合とは、別に働く。AI の判断が独立した照合を欠いたまま、取り消せない行動に直結した事案に、[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)（顔認識の AI 判定が、行政の強制処分に直結した）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、人の運転に割り込む AI の判断(自動制動など)を実行する側に組み込む。** 知覚や判断そのものの正否を判定するのではなく、その作動が、あらかじめ定めた条件を満たしているかを、実行の前に、判断をした処理の外で照合し、記録に残す。

### 注意したい業界・業務

- **業界 · 製造**: 車両や機械に、人の操作に割り込む自動制御の機能を載せる組織。
- **業務 · AI の判断を業務に組み込む部門**: 人が最終責任を負う前提のまま、AI の判断が行動に割り込む業務。

### いまの対策と Lemma の違い

今回の経路は、人の運転に割り込む自動制動の作動である。

| 対策 | 人の運転に割り込む自動制動の作動 | 作動の後の、記録からの把握 |
| --- | --- | --- |
| 所有者の報告・NHTSA への申し立ての集約と、リコール | 効かない | 効く |
| ソフトウェアの更新（カメラの再フラッシュ・作動タイミングの再調整） | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 一部 | 効く |

報告の集約とリコールは、何件起きたかの把握、安全の評価、再発の防止に欠かせないが、作動の後に働く。ソフトウェアの更新は、作動タイミングを再調整するもので、判断の分布を改善する。個々の作動が、実行の前に、必要と照合されるわけではない。Lemma は、作動の前に、あらかじめ定めた条件を満たしているかを、判断をした処理の外で照合し、判断とテレメトリを、発行の時点で記録に結びつけて残す。作動の後に、記録の真正性を確認できる。

注：Lemma の照合が働くのは、自動制動を実行する仕組みに照合を組み込み、作動が必要である条件を、判断をした処理の外で定義・管理できる場合に限る。条件そのものが誤っていれば、誤った作動も通る。Lemma は、カメラの知覚の誤りを直すものではない。制動の必要性を、実行の前の短い時間でどう照合できるかは、参照した資料からは分からない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI の判断が人の操作に割り込む機能を持つ組織で確認する 3 項目

- 人の運転や操作に割り込む自動制御の作動を、実行の前に、必要かどうか照合しているか。
- 自動制御の判断とテレメトリを、後から書き換えられない形で記録しているか。
- 誤作動の報告を集めるだけでなく、個々の作動が妥当だったかを、あとから確認できるか。

## 5. 事実と時系列

- **対象**: 2025〜2026 年式 Hyundai Santa Cruz、Tucson、Tucson Hybrid、Tucson Plug-In Hybrid。リコール対象は 421,078 台。
- **識別子**: NHTSA リコール 26V316（Hyundai Motor America、Hyundai 社内番号 302）。
- **不具合**: 前方カメラ（multi-function camera）のソフトウェアの不具合により、FCA が早すぎるタイミングで作動しうる。結果として、危険がない状況で意図せず自動ブレーキがかかる（いわゆるファントムブレーキ）。
- **報告と被害**: 2024-10-28〜2026-04-27 に、FCA の作動に関する 376 件の報告。うち 4 件で Hyundai 車が後続車に追突され、4 件の負傷が申告された。
- **修正**: 前方カメラの再フラッシュ。作動タイミングと先行車までの距離の判定を、ドライバーの期待により整合するよう更新する。ディーラー・所有者への通知は 2026-07-17 の予定。
- **把握の経過**: Hyundai は、2025-01 に所有者アンケートで不具合の可能性を最初に把握した。ODI は 2025-09 に、Tucson の FCA に関する申し立てについて照会を開始し、Hyundai は 2026-05 までに ODI へ計 5 回ブリーフィングした。

### 時系列

- **2024-10-28**: FCA の作動に関する報告が蓄積し始める（NHTSA の報告期間の起点）。
- **2025-01**: Hyundai が、所有者アンケートで不具合の可能性を最初に把握する。
- **2025-09**: ODI が、Tucson の FCA に関する申し立てについて照会を開始する。
- **2026-04-27**: FCA の作動に関する報告が計 376 件に到達する(4 件の追突・4 件の負傷を含む)。
- **2026-05**: Hyundai が 421,078 台のリコール（26V316）を実施する。
- **2026-07-17**: ディーラー・所有者への通知の予定日。

> 台数（421,078）・報告件数（376）・追突/負傷（各 4）・リコール番号（26V316）・対象モデルは、NHTSA のリコール文書に拠る。本 Brief は、Hyundai を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Hyundai / NHTSA**: Hyundai は、前方カメラの再フラッシュによる是正を実施し、2026-07-17 に所有者へ通知する予定。ODI は、2025-09 以降の照会を経て、リコールに至る経緯を確認している。
- **是正の範囲**: 是正は作動タイミングの再調整で、判断の分布を改善するもの。個々の作動の前に、必要かを照合するものとは別に働く。

## 6. Sources

- **NHTSA**: Recall Report 26V316 — Hyundai Motor America（Forward Collision-Avoidance 早期作動・対象車種・台数の一次データ）— <https://static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V316-9486.pdf>
- **Fox Business**: "Hyundai recalls over 421,000 vehicles to fix software bug causing unexpected braking" — <https://www.foxbusiness.com/lifestyle/hyundai-recalls-over-421000-vehicles-fix-software-bug-causing-unexpected-braking>
- **The Brake Report**: "Hyundai Recalls 421,078 Vehicles for Phantom Braking"（376 件の報告・是正内容・26V316）— <https://thebrakereport.com/hyundai-tucson-santa-cruz-fca-recall-26v316/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
