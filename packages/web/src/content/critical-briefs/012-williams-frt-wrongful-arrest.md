---
brief_no: 12
title: "Robert Williams 氏の誤認逮捕：顔認識の誤った一致を起点に、逮捕まで進んだ(ACLU の訴訟と和解)"
title_en: "Robert Williams wrongful arrest: A false facial-recognition match led all the way to an arrest (ACLU lawsuit and settlement)"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2020-01-09
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["061-hyundai-fca-phantom-braking", "005-noroboto-lying-fonts", "011-synthid-watermark-reverse-engineering"]
version: "1.0"
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
og_lead_ja: "顔認識の誤った一致を起点に誤認逮捕、約 30 時間拘束 — Robert Williams 氏（米デトロイト）"
og_lead_en: "A false facial-recognition match led to the wrongful arrest of Robert Williams, held about 30 hours (Detroit)"
og_kicker_ja: "AI の判定 · 顔認識による誤認逮捕"
og_kicker_en: "AI DECISION · FACIAL RECOGNITION ARREST"
og_headline_ja: "顔認識の一致が、\n逮捕まで進んだ。\n<accent>約 30 時間の拘束</accent>"
og_headline_en: "A face-recognition match\nled to an arrest.\n<accent>Held about 30 hours</accent>"
key_figures:
  - value: "約 30"
    unit: "時間"
    label: "Williams 氏が拘束された時間（2020 年 1 月）"
    tone: "alert"
  - value: "2024-06-28"
    label: "和解。FRT の結果だけでの逮捕・面通しを禁じ、独立の裏付けを求める運用を受諾"
  - value: "約 200"
    unit: "アルゴリズム"
    label: "NIST が、一部の群で誤検知の偏りを定量化した評価の対象（NISTIR 8280、2019-12）"
glossary:
  - term: "顔認識技術（FRT）"
    desc: "顔の画像を、データベースの写真と照合し、似ている候補を出す技術。出すのは確率的な候補で、本人と確定するものではない。"
  - term: "面通し（photo lineup）"
    desc: "目撃者などに複数の顔写真を見せ、見覚えのある人物を選んでもらう捜査の手順。"
  - term: "NISTIR 8280"
    desc: "米国の NIST が 2019 年 12 月に公表した、顔認識の人口統計上の偏りに関する評価報告。"
insight:
  slug: "ai-match-before-action"
  label: "候補のまま、処分へ"
  quote: "AI の照合結果は確率的な候補であり、行動の前に独立の裏付けと承認を照合する段が無ければ、候補のまま取り消せない処分の根拠になる。"
industries: ["public-sector", "ai"]
operations: ["approval"]
controls:
  - slug: "hold-unverified"
    item: "裏づけが取れるまで、逮捕に進まない"
attack_method: "ai-misuse"
impact: "1 人を誤認逮捕し約 30 時間拘束"
takeaway: "顔認識の照合結果は、候補であって同定ではない。逮捕などの処分の前に、独立の裏付けと承認があるかを照合する。"
self_check: "AI の照合結果を処分や判断に使う前に、独立の裏付けと承認があるかを照合しているか。"
countries: ["us"]
---

## 1. 要点

防犯映像と運転免許の写真を照合した顔認識の候補を起点に、窃盗の容疑で逮捕が行われ、のちに誤認逮捕と分かった。ACLU の訴訟は、照合の結果が独立の裏付けのないまま同定として扱われたと訴え、2024 年の和解で、照合の結果だけでの逮捕を禁じる運用が受け入れられた。<strong>AI の照合結果は確率的な候補であり、行動の前に独立の裏付けと承認を照合する段が無ければ、候補のまま取り消せない処分の根拠になる。</strong>

## 2. 通った操作

- **通った操作**: 顔認識の照合で候補に挙がった Williams 氏を、窃盗の容疑で逮捕する操作。顔認識技術（FRT）が、2018 年の Shinola の店舗の防犯映像の静止画と運転免許のデータベースを照合して候補を出し、その候補が面通しに使われ、2020 年 1 月の逮捕に至った（ACLU の訴訟の概要）。Williams 氏は自宅の前で、家族と近隣の人の前で逮捕され、約 30 時間拘束された。
- **受け付けた側に届くもの**: 一般に、照合の結果は、候補の顔とスコアとして届く。スコアや画質など、信頼性を下げる要因が、捜査・面通し・裁判の各段で示されなければ、候補と同定の区別は、受け取る側からは見えない。
- **訴訟での主張**: ACLU は、照合の結果が独立の裏付けとなる証拠なしに面通しに持ち込まれ、逮捕の根拠として扱われたと訴えた。2024 年の和解は、照合の結果だけでの逮捕・面通しの禁止と、独立の裏付けの義務を含む。
- **公表されていないこと**: 照合のスコアと、使われたアルゴリズムの名前。参照した資料には無い。

## 3. 実行前の照合

経路を問わず区別できる条件は、AI の照合結果を使って処分に進む前に、その結果に、AI とは独立した裏付けと、処分を承認する人の承認が結びついているかを照合することである。

- **誰が承認を出すか**: 逮捕などの処分を承認する人。AI の照合結果とは別の、独立の裏付けを見たうえで承認を出す。照合結果そのものは、承認の代わりにならない。
- **どこで照合するか**: 照合結果を使って処分（面通し・逮捕）に進む前。照合結果に、独立の裏付けと承認が結びついているかを照合し、結びついていなければ保留する。
- **何が残るか**: どの照合結果を、どの信頼性の条件（スコア・画質など）で、どの裏付けと承認のもとで使ったかの記録。裁判や監査で、処分の根拠を後から示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝AI の照合結果を処分に使う前に、独立の裏付けと承認が結びついているかを照合し、記録に残すこと。検知＝処分の後に、誤りに気づくこと。日付は、ACLU と報道が伝えた日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 2024 年の和解で求められた</b>照合の結果だけで逮捕・面通しに進まず、独立の裏付けを求める</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>顔認識の一致を起点に誤認逮捕<br>約 30 時間の拘束</span></div>
<div class="rx-zone det"><b>検知 · 逮捕の後に働いた</b>訴訟と和解で、運用が改められた</div>
<div class="rx-g g1"><div class="t">2018</div><b>店舗で窃盗、防犯映像が残る</b></div>
<div class="rx-g g2"><div class="t">2020-01</div><b>誤認逮捕、約 30 時間の拘束</b></div>
<div class="rx-g g3"><div class="t">2021</div><b>ACLU が提訴</b></div>
<div class="rx-g g4"><div class="t">2024-06-28</div><b>和解、運用の制限を受諾</b></div>
</div>
</figure>

誤りが正されたのは、逮捕と拘束の後の、訴訟と和解だった。同じように、AI の判断が独立した照合を欠いたまま、取り消せない行動に直結した事案に、[Hyundai](https://lemma.frame00.com/ja/critical/briefs/061-hyundai-fca-phantom-braking/)（危険がないのに自動ブレーキが作動した）がある。AI への入力が改ざんされて判定が歪んだ事案には、[Noroboto](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/) がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、AI の照合結果を使って処分に進む手順に組み込む。** 照合の正しさそのものを判定するのではなく、その結果が、独立の裏付けと承認に結びついているかを、処分の前に、AI の外で照合し、記録に残す。

### 注意したい業界・業務

- **業界 · 公共部門**: AI の照合結果を、逮捕や給付など、取り消しにくい処分に使う行政機関。
- **業界 · AI導入**: 顔認識など、候補を出す AI を、業務の判断に組み込む組織。
- **業務 · 承認・決裁**: AI の出力を根拠にした処分の承認。

### いまの対策と Lemma の違い

今回の経路は、1 列目（AI の照合結果を逮捕の根拠に使う）である。2 列目は、処分の後に、何を根拠に処分したかを、裁判や監査で示す場面である。

| 対策 | AI の照合結果を逮捕の根拠に使う | 処分の後に、根拠を示す |
| --- | --- | --- |
| 精度・バイアスの評価（NIST など） | 効かない | 関係しない |
| 照合の候補をもとにした面通し | 効かない | 関係しない |
| 照合の結果だけでの逮捕を禁じ、独立の裏付けを求める運用（2024 年の和解） | 効く | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く |

精度とバイアスの評価は、技術の選定や運用の制限の根拠になるが、個々の照合結果が、処分の前に独立に裏付けられたかは変えない。面通しは、今回、照合の候補をもとに行われ、逮捕を止めなかった（ACLU の訴え）。和解の運用は、照合の結果だけでの逮捕を禁じ、独立の裏付けを求め、信頼性を下げる要因を捜査・裁判所・弁護人に示す義務を含む。運用の規則で、照合の記録を、処分をした組織の外に残すものではない。Lemma は、処分の前に、照合結果が独立の裏付けと承認に結びついているかを、AI の外で照合し、どの結果を、どの条件と承認のもとで使ったかを残す。

注：Lemma の照合が働くのは、処分に進む手順に照合を組み込み、裏付けと承認を、照合結果を出す AI の外で管理している場合に限る。裏付けそのものが誤っていれば、この照合を通りうる。Lemma は、照合の精度やバイアスを直すものではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI の照合結果を処分や判断に使う組織で確認する 3 項目

- AI の照合結果を処分に使う前に、独立の裏付けがあるかを照合しているか。
- 照合のスコアや画質など、信頼性を下げる要因を、処分を承認する人に渡しているか。
- どの照合結果を、どの裏付けと承認のもとで使ったかを、後から示せる記録を残しているか。

## 5. 事実と時系列

- **被害を受けた人**: Robert Williams 氏（ミシガン州在住の黒人のアメリカ人）。
- **捜査の主体**: デトロイト市警（Detroit Police Department）。
- **AI システム**: 顔認識技術（FRT）。2018 年の Shinola の店舗の防犯映像の静止画と、運転免許のデータベースを照合し、Williams 氏を候補として出した。照合は確率的なスコアで、確定した同定ではない。
- **被害**: 2020 年 1 月、自宅の前で、家族と近隣の人の前で逮捕され、約 30 時間拘束された。
- **位置づけ**: 米国で初めて公に確認された、FRT による誤認逮捕とされる。以後、同じ種類の誤認逮捕が複数報告されている。
- **技術の背景**: NIST の評価（NISTIR 8280、2019-12）は、約 100 の開発者・約 200 のアルゴリズムを、1,800 万枚を超える画像で評価し、多くのアルゴリズムで、一部の人種・年齢・性別の群に誤検知の偏りがあることを定量的に示した。
- **法的な経過**: ACLU が Williams v. City of Detroit を提訴し、2024-06-28 に和解した。

### 時系列

- **2018**: Shinola の店舗で窃盗が起き、防犯映像が残る。
- **2019-12**: NIST が NISTIR 8280（FRVT Part 3: Demographic Effects）を公表する。
- **2020-01**: デトロイト市警が、FRT の照合をもとに Williams 氏を逮捕し、約 30 時間拘束する（誤認逮捕）。
- **2021**: ACLU が Williams v. City of Detroit を提訴する。
- **2024-06-28**: 和解が成立する。
- **2024 以降**: デトロイト市警の FRT の運用が大きく縮小したと報じられている。

> 本件の事実は、ACLU の訴訟の概要と和解の要約、University of Michigan Law（Law Quadrangle）と Michigan Public の報道、NIST の評価に拠る。照合の結果の扱いについての記述は、ACLU の訴えと和解の条項に拠る。本 Brief は、警察や個人を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **デトロイト市警 / 和解**: 2024-06-28 の和解で、FRT の結果だけでの逮捕・面通しの禁止、独立の裏付けとなる証拠の義務、FRT の検索の信頼性を下げる要因を捜査・裁判所・弁護人に示す義務、誤同定の人種差に関する研修を受け入れた。全米で最も強い水準の制限とされ、以後の運用は大きく縮小したと報じられている。
- **ACLU / University of Michigan Law**: 訴訟と和解を主導し、記録した。FRT を「手がかり（lead）」にとどめ、独立の証拠による裏付けを前提とする運用の原則を示した。
- **規制・政策の動き**: FRT の警察での利用に、州ごとの制限が整えられつつある。
- **技術の根拠**: NISTIR 8280 は、群のあいだの誤検知の偏りを定量化した評価として、運用の制限の根拠に引かれ続けている。

## 6. Sources

- **ACLU**: "Williams v. City of Detroit"（訴訟概要）— https://www.aclu.org/cases/williams-v-city-of-detroit-face-recognition-false-arrest
- **ACLU**: "Summary of Detroit Facial Recognition Settlement Agreement (Williams v. City of Detroit)"（2024、和解条項の要約）— https://www.aclu.org/documents/summary-of-detroit-facial-recognition-settlement-agreement-williams-v-city-of-detroit
- **University of Michigan Law (Law Quadrangle)**: "Flawed Facial Recognition Technology Leads to Wrongful Arrest and Historic Settlement"（2024–2025 Winter）— https://quadrangle.michigan.law.umich.edu/issues/winter-2024-2025/flawed-facial-recognition-technology-leads-wrongful-arrest-and-historic
- **Michigan Public**: "'It didn't make sense at all': Wrongful facial recognition arrest in Detroit leads to landmark settlement"（2024-06-28）— https://www.michiganpublic.org/criminal-justice-legal-system/2024-06-28/it-didnt-make-sense-at-all-wrongful-facial-recognition-arrest-leads-to-landmark-settlement
- **NIST**: "Face Recognition Vendor Test (FRVT) Part 3: Demographic Effects"（NISTIR 8280、2019-12）— https://nvlpubs.nist.gov/nistpubs/ir/2019/nist.ir.8280.pdf

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
