---
brief_no: 115
title: "Workday：AI の応募者スクリーニングが、人種・年齢・障害で応募者を不利に選別したと訴えられた(Mobley v. Workday の訴訟)"
title_en: "Workday: A lawsuit alleges its AI applicant screening sorted candidates unfavorably by race, age and disability (Mobley v. Workday)"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-06-22
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "076-dillon-frt-wrongful-arrest", "078-tenncare-connect-medicaid-eligibility", "056-mchire-paradox-recruiting-auth"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "Workday の AI 応募者スクリーニングが人種・年齢・障害で応募者を不利に選別したとする集団訴訟で、連邦地裁が主張の一部の続行を認めた（2026-06-22）"
og_lead_en: "In a class action alleging Workday's AI applicant screening sorted candidates unfavorably by race, age and disability, a federal court allowed part of the claims to proceed (2026-06-22)"
og_kicker_ja: "AI の判定 · 採用の差別訴訟"
og_kicker_en: "AI DECISION · HIRING BIAS SUIT"
og_headline_ja: "AI の応募者選考で\n不利に選別されたと\n原告が主張。\n<accent>100 件超の求人で落選</accent>"
og_headline_en: "Applicants were screened\nout by AI, suit alleges.\n<accent>100+ rejections claimed</accent>"
key_figures:
  - value: "100 超"
    unit: "件"
    label: "筆頭原告が、Workday を使う企業で落選したとする求人の数（原告の主張）"
    tone: "alert"
  - value: "1"
    unit: "時間以内"
    label: "応募から自動の不採用の通知が届くまでの時間。深夜に届いたとも訴えている（原告の主張）"
  - value: "2023-02 → 2026-06-22"
    label: "提訴から、連邦地裁が FEHA の主張と ADA の主張の一部の続行を認めるまで"
glossary:
  - term: "代理指標（proxy）"
    desc: "人種・年齢・障害などの属性そのものではないが、それと結びつきやすい情報。原告は、就業ギャップなどがこの役をしたと主張している。"
  - term: "FEHA・ADA・ADEA"
    desc: "FEHA はカリフォルニア公正雇用住宅法、ADA は米国障害者法、ADEA は米国の年齢差別禁止法。"
  - term: "弁護士・依頼者間の秘匿特権"
    desc: "弁護士と依頼者のあいだのやり取りを、訴訟の開示の対象から外す米国の法の原則。"
insight:
  slug: "ai-judgment-to-adverse-action"
  label: "AI の判定のまま、不利益へ"
  quote: "AI の判定を人の不利益に使う前に、その判定の根拠と確認した人を照合する段が無ければ、結果だけが届き、根拠は後から示せない。"
industries: ["ai"]
operations: ["approval"]
controls:
  - slug: "audit-trail"
    item: "自動不採用の判定を、誰がどう確認したかを記録に残す"
impact: "筆頭原告が 100 件超の求人で落選（原告主張）"
takeaway: "AI の判定で応募者に不採用を返すなら、送る前に、どの判定をどの根拠と確認のもとで使ったかを照合し、記録に残す。"
search_title: "Workday の AI 採用差別訴訟：Mobley 事件と対策"
search_description: "Workday の AI 応募者スクリーニングが人種・年齢・障害で不利に選別したとする Mobley v. Workday の集団訴訟。連邦地裁は主張の一部の続行を認めた。経緯と、判定を使う前に照合することを整理。"
self_check: "AI の判定で人に不利益を返す前に、その判定の根拠と確認した人を照合しているか。"
countries: ["us"]
---

## 1. 要点

AI の応募者スクリーニングが、顧客企業の採用で応募者を人種・年齢・障害に基づいて不利に選別したと、原告が集団訴訟で訴えている。2026 年 6 月、連邦地裁は Workday の「ツールを提供したにすぎない」という抗弁の一部を斥け、主張の一部の続行を認めた。差別があったかどうかは、まだ裁判所が判断していない。<strong>AI の判定を人の不利益に使う前に、その判定の根拠と確認した人を照合する段が無ければ、結果だけが届き、根拠は後から示せない。</strong>

## 2. 通った操作

- **通った操作**: 応募者への不採用の通知。原告は、Workday のプラットフォームを使う企業の 100 件超の求人で落選し、応募から 1 時間以内や深夜に自動の不採用の通知を受け取ったと主張している（原告の申立て）。
- **受け付けた側に届くもの**: 一般に、応募者に届くのは合否の結果で、どの判定が、どの根拠で使われたかは届かない。原告は、就業ギャップなどの代理指標（proxy）を通じて選別され、保護される属性と相関する形で不利益が生じたと主張している。
- **訴訟での主張と判断**: 2026-06-22、Rita F. Lin 判事は、Workday が「単なるツール提供者」ではなく差別の責任の射程に入りうるとして、FEHA に基づく主張と、ADA に基づく代理指標の差別の主張の一部の続行を認めた。これは主張を退けなかった判断で、差別があったと認めたものではない。
- **公表されていないこと**: 判定に使われた要因と、不採用を送る前に人や別の層が判定を確認したかどうか。参照した資料には無い。Workday のバイアス検査データは、2026 年 5 月の命令で秘匿特権に守られると判断され、原告への開示は強制されなかった。

## 3. 何を照合するか

経路を問わず区別できる条件は、AI の判定を使って人に不利益（不採用など）を返す前に、その判定に、根拠の記録と、それを確認した人の承認が結びついているかを照合することである。

- **誰が承認を出すか**: 不採用などの処分を決める採用の担当者。AI の判定とは別に、根拠を見たうえで承認を出す。判定が速く一貫して見えることは、承認の代わりにならない。
- **どこで照合するか**: AI の判定を使って不採用を送る前。判定に、根拠の記録と承認が結びついているかを照合し、結びついていなければ保留する。
- **何が残るか**: どの判定を、どの入力と条件で、誰の確認のもとで使ったかの記録。監査や訴訟で、処分の根拠を後から示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝AI の判定を不採用に使う前に、根拠の記録と確認した人の承認が結びついているかを照合し、記録に残すこと。検知＝不採用の後に、訴えや分析で問題に気づくこと。日付は、裁判所の命令と法律事務所の分析が伝えた日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>不採用を送る前に、判定の根拠と確認を照合したか</div>
<div class="rx-zone gapz"><b>訴えられたこと</b><span>100 件超の求人で落選<br>1 時間以内や深夜の自動不採用（原告の主張）</span></div>
<div class="rx-zone det"><b>検知 · 不採用の後に働いた</b>応募者の訴えが、集団訴訟として裁判所に届いた</div>
<div class="rx-g g1"><div class="t">2023-02</div><b>Mobley 氏が提訴</b></div>
<div class="rx-g g2"><div class="t">2025-05</div><b>ADEA の集団の暫定認証</b></div>
<div class="rx-g g3"><div class="t">2026-05-29</div><b>検査データの開示強制を却下</b></div>
<div class="rx-g g4"><div class="t">2026-06-22</div><b>主張の一部の続行を許可</b></div>
</div>
</figure>

不利益の疑いが取り上げられたのは、不採用が届いた後の訴訟だった。同じように、AI の出力が独立の裏付けを欠いたまま人の不利益に直結したと訴えられた事案に、[Robert Williams 氏の誤認逮捕](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)と [Robert Dillon 氏の誤認逮捕](https://lemma.frame00.com/ja/critical/briefs/076-dillon-frt-wrongful-arrest/)（顔認識）、[TennCare Connect](https://lemma.frame00.com/ja/critical/briefs/078-tenncare-connect-medicaid-eligibility/)（給付の資格の判定）がある。採用の領域では、[McHire](https://lemma.frame00.com/ja/critical/briefs/056-mchire-paradox-recruiting-auth/)（応募者のデータの露出）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、AI の判定を使って不採用を送る手順に組み込む。** 判定の公平さそのものを判断するのではなく、その判定が、根拠の記録と確認した人の承認に結びついているかを、不採用を送る前に、AI の外で照合し、記録に残す。

### 注意したい業界・業務

- **業界 · AI導入**: 応募者の選別や合否の振り分けに、AI のスクリーニングを組み込む企業と、それを提供する事業者。
- **業務 · 承認・決裁**: AI の判定を根拠にした、不採用などの処分の承認。

### いまの対策と Lemma の違い

今回の経路は、1 列目（AI の判定で、応募者に不採用を送る）である。2 列目は、不採用の後に、どの判定をどの確認のもとで使ったかを、監査や訴訟で示す場面である。

| 対策 | AI の判定で、応募者に不採用を送る | 不採用の後に、判定の根拠と確認を示す |
| --- | --- | --- |
| モデルのバイアス検査（集団の傾向の評価） | 一部 | 一部 |
| 不採用を送る前に、人が判定を確認する運用 | 効く | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く |

バイアス検査は、モデルの選定や見直しの根拠になるが、1 件ずつの判定が、送る前に確認されたかは変えない。今回、Workday のバイアス検査データは秘匿特権に守られると判断され、訴訟で原告に開示されなかった。人が確認する運用は、送る前の段に効くが、確認の記録は運用する組織の中に残る。Lemma は、送る前に、判定が根拠の記録と承認に結びついているかを AI の外で照合し、どの判定を、どの条件と確認のもとで使ったかを残す。

注：Lemma の照合が働くのは、不採用を送る手順に照合を組み込み、根拠の記録と承認を、判定を出す AI の外で管理している場合に限る。確認した人が判定の偏りに気づかなければ、この照合を通りうる。Lemma は、判定の公平さを保証するものではなく、差別があったかどうかを判断するものでもない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI の判定を採用などの処分に使う組織で確認する 3 項目

- AI の判定に使われた入力と要因（代理指標になりうる情報を含む）を、処分を承認する人に渡しているか。
- 応募者などから訴えがあったとき、その 1 件にどの判定がどの確認のもとで使われたかを示せる記録があるか。
- AI のスクリーニングを外部の事業者から使うとき、判定と承認の記録を、どちらが持つかを決めているか。

## 5. 事実と時系列

- **事件**: Mobley v. Workday, Inc.（米カリフォルニア州北部地区連邦地裁、No. 3:23-cv-00770）。
- **筆頭原告**: Derek Mobley 氏（黒人・40 歳超・不安症とうつを持つと申し立てている）。
- **訴えの対象**: Workday の AI 応募者スクリーニング。顧客企業の採用で、応募者を人種・年齢・障害に基づいて不利に扱ったとする集団訴訟。
- **原告の主張**: 100 件超の求人で落選し、応募から 1 時間以内や深夜に自動の不採用の通知を受け取った。就業ギャップなどの代理指標を通じて選別されたと主張している。
- **裁判所の判断**: 2026-06-22、Lin 判事が Workday の抗弁の一部を斥け、FEHA の主張と、ADA の代理指標の差別の主張の一部の続行を認めた。
- **現在の段階**: 証拠開示（discovery）の段階にあり、判定の根拠や検査データの扱いをめぐる争いが続いている。

### 時系列

- **2023-02**: Mobley 氏が Workday を相手取り、連邦地裁に提訴する（No. 3:23-cv-00770、N.D. Cal.）。
- **2024（前後）**: 早期の申立ての段階で、Workday が「agent（代理人）」に当たるかをめぐる判断が示され、原告に補正の機会が与えられる。
- **2025-05**: ADEA に基づく全国規模の集団（collective）の暫定認証が認められる。
- **2026-05-29（前後）**: Laurel Beeler 治安判事が、Workday のバイアス検査データの開示強制を却下する。弁護士・依頼者間の秘匿特権がデータを守ると判断した。顧客の応募者データも、Rule 34 の「支配」の要件を満たさないとして、開示強制を却下した。
- **2026-06-22**: Rita F. Lin 判事が、Workday の抗弁の一部を斥け、FEHA の主張と ADA の主張の一部の続行を認める。

> 本件の事実は、連邦地裁の命令、法律事務所の分析、報道に拠る。訴訟は係争中で、応募者が受けた不利益と自動不採用の様子についての記述は、原告の申立てを含む。差別があったかどうかは、裁判所がまだ判断していない。集団認証の範囲や数値の細部には、確定していない点がある。本 Brief は、Workday や採用した企業を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **訴訟**: 証拠開示の段階にあり、判定の根拠や検査データの扱いをめぐる争いが続いている。
- **HR・法務の実務**: Lin 判事の 6 月の命令は、AI のスクリーニングの提供者が「単なるツール提供者」を超えて差別の責任の射程に入りうるとの判断として、広く参照されている。

## 6. Sources

- Seyfarth Shaw LLP, “Mobley v. Workday: Court Holds AI Service Providers Could Be Directly Liable for Employment Discrimination Under ‘Agent’ Theory”（2026-06）— <https://www.seyfarth.com/news-insights/mobley-v-workday-court-holds-ai-service-providers-could-be-directly-liable-for-employment-discrimination-under-agent-theory.html>
- Akin, “Court Allows Discrimination Claims Against AI Hiring Tool to Proceed (Mobley v. Workday, Inc.)”（AI Law and Regulation Tracker、2026）— <https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/court-allows-discrimination-claims-against-ai-hiring-tool-to-proceed-or-mobley-v-workday-inc>
- Duane Morris LLP, “California Federal Court Clarifies Limits On AI Bias Testing And Applicant Data Disclosure In Mobley v. Workday”（Class Action Defense、2026-06-02）— <https://blogs.duanemorris.com/classactiondefense/2026/06/02/california-federal-court-clarifies-limits-on-ai-bias-testing-and-applicant-data-disclosure-in-mobley-v-workday/>
- HR Executive, “Judge refuses to dismiss most Workday hiring bias allegations”（2026-06）— <https://hrexecutive.com/judge-refuses-to-dismiss-most-workday-hiring-bias-allegations/>
- Norton Rose Fulbright, “Behind the privilege shield: Safeguarding AI bias-testing data in employment decisions”（Inside Tech Law、2026-06）— <https://www.insidetechlaw.com/blog/2026/06/behind-the-privilege-shield-safeguarding-ai-bias-testing-data-in-employment-decisions>
- Mobley v. Workday, Inc., No. 3:23-cv-00770（N.D. Cal.）— 事件ドケット（一次） — <https://www.courtlistener.com/docket/66831340/mobley-v-workday-inc/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
