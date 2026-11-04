---
brief_no: 42
title: "Waymo：自動運転車が、停止中のスクールバスを止まらずに通り過ぎた(NHTSA)"
title_en: "Waymo: robotaxis drove past stopped school buses (NHTSA)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance", "ai-bias-harm"]
incident_date: 2025-12-05
published: 2026-06-17
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["049-tesla-robotaxi-control-attribution", "043-tesla-fsd-self-reported-safety", "012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Waymo の自動運転車が停止中のスクールバスの脇を通過し、NHTSA が調査、Waymo は 3,067 台のソフトウェアリコールを実施"
og_lead_en: "Waymo robotaxis drove past stopped school buses; NHTSA opened a probe and Waymo recalled software on 3,067 vehicles"
og_kicker_ja: "AI の運転判断 · 安全規則"
og_kicker_en: "AI DRIVING · SAFETY RULES"
og_headline_ja: "停止中のスクールバスの\n脇を止まらず通過し、\nNHTSA が調査。\n<accent>リコール 3,067 台</accent>"
og_headline_en: "Robotaxis passed\nstopped school buses;\nNHTSA investigates.\n<accent>3,067 vehicles recalled.</accent>"
key_figures:
  - value: "19"
    unit: "件"
    label: "Austin 学区が今年度に記録した通過（うち 1 件は児童が車の直前を横断した直後）"
    tone: "alert"
  - value: "3,067"
    unit: "台"
    label: "Waymo が NHTSA と実施した自主的なソフトウェアリコールの対象（第 5 世代 ADS）"
  - value: "22"
    unit: "件"
    label: "NHTSA ODI が拡大した調査で対象にした報告（静止物への衝突・信号無視を含む）"
glossary:
  - term: "ADS（Automated Driving System）"
    desc: "自動運転システム。周囲を知覚し、停止や通過などの走行の判断をして、車を制御する。"
  - term: "NHTSA ODI"
    desc: "米国運輸省の道路交通安全局（NHTSA）の欠陥調査室。車の欠陥を調べ、リコールにつなげる。"
  - term: "stop arm"
    desc: "スクールバスが児童の乗降のときに車体の横に出す停止の標識。米国では、停止中のスクールバスの追い越しは違法。"
  - term: "SGO（Standing General Order）"
    desc: "自動運転・運転支援のシステムが関わる事故を、事業者が NHTSA に報告する命令。"
insight:
  slug: "driving-decision-before-action"
  label: "行動の前に照合されない走行の判断"
  quote: "安全規則に関わる走行の判断は、行動の前に、判断をした仕組みの外で照合する段が無ければ、システムの内部の判断のまま実行される。"
industries: ["ai"]
attack_method: "ai-misuse"
impact: "Austin 学区で今年度 19 件の通過を記録"
takeaway: "停止中のスクールバスの前で止まるかどうかはシステムの内部の判断で決まり、事案は通過の後に映像と学区の通報から見えた。"
search_title: "Waymo とスクールバス：NHTSA の調査とリコール"
search_description: "Waymo の自動運転車が停止中のスクールバスの脇を通過し、NHTSA が調査、Waymo は 3,067 台のソフトウェアリコールを実施した。Austin 学区は今年度 19 件を記録。何が起きたか、何を照合するか、対策を整理。"
self_check: "安全規則に関わる自動の行動を、実行の前に、判断をした仕組みの外の条件で照合する仕組みがあるか。"
countries: ["us"]
---

## 1. 要点

Waymo の自動運転車が、赤色灯と stop arm を出して停止中のスクールバスの脇を、止まらずに通り過ぎた。NHTSA ODI はその映像を受けて調査を始め、Waymo は原因のソフトウェアを特定して更新し、3,067 台の自主的なソフトウェアリコールを NHTSA と実施した。Austin 学区は、更新の後にも事案を確認したとしている。映像・学区の通報・事故の報告は、通過の後に働く。<strong>安全規則に関わる走行の判断は、行動の前に、判断をした仕組みの外で照合する段が無ければ、システムの内部の判断のまま実行される。</strong>

## 2. 通った操作

- **通った操作**: 停止中のスクールバス（赤色灯の点灯・stop arm の展開）の前での、通過または停止を続けないという走行の判断。米国では停止中のスクールバスの追い越しは違法で、児童の乗降に直結する安全規則である。
- **受け付けた側に届くもの**: 一般に、車の制御は、システム自身の知覚と「停止の義務がある」という規則の当てはめを前提に動く。通過は、制御としてはふだんの走行と同じ形で実行される。
- **検知の経路**: メディアが報じた映像、学区の通報、NHTSA への事故の報告。いずれも通過の後に働く。
- **公表されていないこと**: 参照した資料には、個々の事案で知覚と規則の当てはめのどこで判断が分かれたかは無い。NHTSA が 2026-01-20 までの回答を求めた質問への Waymo の回答の中身と、拡大した調査の結論も出ていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、安全規則に関わる走行の判断を、判断をした仕組みの外の条件で、行動の前に照合することである。

- **誰が承認を出すか**: 停止の義務が生じる条件（赤色灯・stop arm・乗降中の児童）と、そのときに取ってよい行動を定める側（車両の安全機能の設計と、運行の規則）。
- **どこで照合するか**: 停止中のスクールバスの前で、通過や発進の判断を制御に渡す直前。システムの自己判定だけでなく、外から照合できる条件で。照合できないときは、停止を続ける。
- **何が残るか**: どの判断を、どの条件を満たして行ったかの記録と、そのときのテレメトリ。後から書き換えられない形で、判断をした仕組みの外に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝通過や発進の前に、その判断が停止の義務の条件を満たすかを、判断をした仕組みの外で照合し、記録に残すこと。検知＝通過の後に、映像や通報から気づくこと。日付は、各社・当局・報道が確認・公表した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>通過や発進の判断を、判断をした仕組みの外で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>Austin 学区で今年度 19 件<br>更新の後にも事案（学区の報告）</span></div>
<div class="rx-zone det"><b>検知 · 通過の後に働いた</b>映像と学区の通報から NHTSA が調査を始め、のちに対象を広げた</div>
<div class="rx-g g1"><div class="t">2025-10</div><b>NHTSA ODI が調査を開始</b></div>
<div class="rx-g g2"><div class="t">2025-11-17</div><b>Waymo がソフトウェアを更新</b></div>
<div class="rx-g g3"><div class="t">2025-12</div><b>3,067 台の自主リコール</b></div>
<div class="rx-g g4"><div class="t">2026</div><b>NHTSA が調査を拡大</b></div>
</div>
</figure>

検知は、停止中のスクールバスの前での通過を外から見えるようにし、調査とリコールにつながった。行動の前の照合とは、別に働く。同じ自動運転の事案で、事故のときに誰が制御していたかと記録の来歴を扱ったものに [Brief 049](https://lemma.frame00.com/ja/critical/briefs/049-tesla-robotaxi-control-attribution/)（Tesla Robotaxi）、安全の数字が申告のまま受け付けられたものに [Brief 043](https://lemma.frame00.com/ja/critical/briefs/043-tesla-fsd-self-reported-safety/) がある。AI の判定が独立した照合を欠いたまま公共の場の処分に直結した事案に、[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)（顔認識の判定が誤認逮捕につながった）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、AI の走行の判断を制御に渡す側に組み込む。** 知覚の正否を判定したり、違反を検出したりするのではなく、安全規則に関わる行動の判断が、あらかじめ定めた条件を満たしているかを、判断をした仕組みの外で照合し、記録に残す。内部の知覚のモデルや実装は出さずに、条件を満たしたことだけを示せる。

### 注意したい業界・業務

- **業界 · AI 導入**: 自動運転のように、AI の判断が公共の場での物理的な行動に直結する仕組みを運用する組織。
- **業務 · 安全規則に関わる自動の行動**: 停止・通過・発進のように、規則を満たさなければ取り返しのつかない行動を、システムの判断で実行する業務。

### いまの対策と Lemma の違い

今回は、2 つの列のどちらもが通った経路にあたる。

| 対策 | 停止中のスクールバスの前での通過の判断 | 判断とそのときの条件の記録 |
| --- | --- | --- |
| ソフトウェアの更新と自主リコール（2025-11〜12） | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 一部 | 効く |

ソフトウェアの更新は判断の傾向を改めるもので、個々の通過の判断を外から照合するものではない。学区は、更新の後にも事案を確認したとしている。Lemma は、通過や発進の判断を、定めた条件と照合してから制御に渡し、どの判断がどの条件を満たしたかを、判断をした仕組みの外に残す。

注：Lemma の照合が働くのは、走行の制御の手順に照合を組み込み、停止の義務の条件を、判断をした仕組みの外で管理できる場合に限る。条件の入力となる知覚そのものが誤っていれば、誤った判断も通る。走行中の短い時間で、どの条件をどう照合できるかは、参照した資料からは分からない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI の判断で公共の場の行動を実行する組織で確認する 3 項目

- 安全規則に関わる行動の前に、その判断が規則の条件を満たすかを、判断をする仕組みの外で照合しているか。
- 照合できないときに、行動を止めたままにする決まりがあるか。
- 判断と、そのときの条件・テレメトリを、後から書き換えられない形で残しているか。

## 5. 事実と時系列

- **対象**: Waymo の自動運転車（ADS を搭載したロボタクシー。Atlanta・Austin などで運行）。
- **事象**: 停止中（赤色灯の点灯・stop arm の展開）のスクールバスに対し、Waymo の車が停止せずに脇を通り過ぎた、または停止を続けなかった。
- **規模**: Austin 学区は今年度 19 件を記録した。うち 1 件は、児童が車の直前を横断した直後の通過。Atlanta でも 2025 年に少なくとも 6 件。NHTSA ODI は、静止物・半静止物（ゲート・チェーンなど）や駐車車両への衝突、信号の無視を含む 22 件の報告も対象にしている。
- **対応**: Waymo は原因のソフトウェアを特定し、2025-11-17 までに更新したと説明した。2025-12 に、第 5 世代 ADS を搭載した 3,067 台の自主的なソフトウェアリコールを NHTSA と実施した。学区は、更新の後にも複数の事案を確認したとしている。

### 時系列

- **2025-10**: NHTSA ODI が、Atlanta で Waymo の車が停止中のスクールバスの脇を通過した映像（メディアの報道）を受け、調査を始める。
- **2025-11-17**: Waymo が、原因のソフトウェアを特定し、更新を展開したと説明する。
- **2025-12-03**: NHTSA が Waymo に、2026-01-20 までに質問へ回答するよう求める書簡を送る。
- **2025-12**: Waymo が、第 5 世代 ADS を搭載した 3,067 台の自主的なソフトウェアリコールを NHTSA と実施する。
- **2025-12 以降**: Austin 学区が、更新の後にも事案を確認したと報告する。
- **2026**: NHTSA が調査を広げる。stop arm・横断アームを出したスクールバスの前で停止を続けなかった事案と、静止物への衝突・信号の無視を含む 22 件の報告を対象にする。Zoox も別に、不意の急制動による追突 2 件で調査の対象になっている。

> リコールの台数（3,067）と各事案の件数は、NHTSA のリコール文書と報道に拠る。Waymo の別のリコール（冠水した道路の走行に関する約 3,800 台）と混同しないよう、本 Brief はスクールバスに関するリコールに限る。原因の説明と更新の時期は Waymo の説明に、更新の後の事案は学区の報告に拠る。調査は続いており、本文では結論を断定しない。本 Brief は、Waymo を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Waymo / NHTSA**: Waymo は原因のソフトウェアを特定して更新し、自主リコールを実施した。NHTSA ODI は 2026 に調査を広げ、停止中のスクールバスの前で停止を続けなかった事案や、静止物への衝突・信号の無視を含む報告を対象に続けている。
- **是正の後の事案**: ソフトウェアの更新の後にも事案が報告されたことで、判断のモデルを後から直すことと、個々の行動の前に照合することを分けて考える必要が論点になっている。
- **業界の論点**: 自動運転の安全の評価を、運行する事業者の事後のテレメトリと是正だけに拠らせず、安全に関わる走行の判断を、行動の時点で外から照合できる記録に残す方向の議論がある。

## 6. Sources

- **TechCrunch**: "Waymo to issue software recall over how robotaxis behave around school buses"（2025-12-05）— <https://techcrunch.com/2025/12/05/waymo-to-issue-software-recall-over-how-robotaxis-behave-around-school-buses>
- **CBS News**: "Waymo recalls more than 3,000 vehicles over faulty software following school bus violations" — <https://www.cbsnews.com/news/waymo-recall-3000-vehicles-software-school-bus/>
- **CBS News**: "U.S. expands investigation into Waymo over robotaxis driving around stopped school buses" — <https://www.cbsnews.com/news/waymo-investigation-nhtsa-robotaxis-passing-school-bus>
- **NHTSA**: Standing General Order ADS Incident Reports（自動運転事故報告制度の一次データ）— <https://www.nhtsa.gov/laws-regulations/standing-general-order-crash-reporting>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
