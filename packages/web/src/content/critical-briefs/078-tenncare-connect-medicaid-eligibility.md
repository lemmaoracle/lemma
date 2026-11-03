---
brief_no: 78
title: "TennCare Connect：自動の適格判定の不具合で、Medicaid の給付が違法に打ち切られた(連邦地裁の判断・報道)"
title_en: "TennCare Connect: Defects in automated eligibility decisions illegally cut people off Medicaid (federal court ruling, reporting)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["ai-bias-harm", "attribute-proof-bypass"]
incident_date: 2024-08-01
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "035-boeing-787-inspection-records"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
version: "1.0"
og_lead_ja: "報道によれば、米テネシー州中部地区の連邦地裁は、適格判定システム TennCare Connect の不具合により、数千人の Medicaid の給付が違法に打ち切られたと判断した（2024 年 8 月）"
og_lead_en: "According to reporting, the federal district court for the Middle District of Tennessee ruled that defects in the TennCare Connect eligibility system illegally cut thousands of people off Medicaid (August 2024)"
og_kicker_ja: "自動の判定 · 公共の給付"
og_kicker_en: "AUTOMATED DECISION · MEDICAID"
og_headline_ja: "自動の適格判定で、\n数千人の給付が\n違法に打ち切られたと\n<accent>連邦地裁が判断</accent>"
og_headline_en: "An automated eligibility\ncheck cut thousands off\nMedicaid illegally,\n<accent>a federal court ruled</accent>"
key_figures:
  - value: "数千"
    unit: "人"
    label: "違法に給付を打ち切られたと連邦地裁が判断した人数（報道）"
    tone: "alert"
  - value: "4 億ドル超"
    label: "テネシー州が TennCare Connect に投じた費用（報道）"
  - value: "2020 → 2024-08"
    label: "集団訴訟の提起 → 連邦地裁の判断（報道）"
glossary:
  - term: "Medicaid（メディケイド）"
    desc: "米国で、所得などの条件を満たす人の医療費を公費で賄う制度。州ごとに運営される。"
  - term: "TennCare / TennCare Connect"
    desc: "TennCare はテネシー州の Medicaid。TennCare Connect は、所得や健康の情報から受給の資格を自動で判定するシステム。"
  - term: "適格判定"
    desc: "申請者や受給者が、給付を受ける条件を満たしているかを判定すること。世帯の構成や所得などの入力に依存する。"
insight:
  slug: "automated-eligibility-before-termination"
  label: "判定のまま、打ち切りへ"
  quote: "自動の判定の結果は、打ち切りのような取り消しにくい処分の前に、その入力と前提を元の記録と照合する段が無ければ、誤った入力のままでも処分の根拠として通る。"
industries: ["public-sector", "healthcare"]
operations: ["approval"]
controls:
  - slug: "hold-unverified"
    item: "判定が正しいデータと世帯に基づくと確認できるまで、打ち切らない"
impact: "数千人の給付が違法に打ち切られたと連邦地裁が判断（報道）"
takeaway: "自動の適格判定の結果は、給付を打ち切る前に、判定に使った入力と世帯の前提が元の記録と合うかを照合する。"
search_title: "TennCare の自動判定で Medicaid 打ち切り"
search_description: "報道によれば、米テネシー州の適格判定システム TennCare Connect の不具合で、数千人の Medicaid の給付が違法に打ち切られたと連邦地裁が判断した。何が通ったか、何を照合するか、対策を整理。"
self_check: "自動の判定の結果で給付やサービスを止める前に、判定に使った入力と前提が元の記録と合うかを照合しているか。"
countries: ["us"]
---

## 1. 要点

テネシー州が 4 億ドル超を投じ、Deloitte らが構築した適格判定システム TennCare Connect は、所得や健康の情報から Medicaid などの受給の資格を自動で判定する。報道によれば、システムは適切なデータを読み込まないことがあり、受給者を誤った世帯に割り当て、誤った適格判定を出していた。2024 年 8 月、テネシー州中部地区の連邦地裁は、この不具合により数千人が違法に給付を打ち切られたと判断した（報道）。<strong>自動の判定の結果は、打ち切りのような取り消しにくい処分の前に、その入力と前提を元の記録と照合する段が無ければ、誤った入力のままでも処分の根拠として通る。</strong>

## 2. 通った操作

- **通った操作**: TennCare Connect の「不適格」という自動の判定をもとに、Medicaid の給付を打ち切る操作。報道によれば、システムは (1) 適切なデータを読み込まないことがあり、(2) 受給者を誤った世帯に割り当て、(3) 誤った適格判定を出していた。連邦地裁は、この不具合により数千人が違法に給付を打ち切られたと判断した（2020 年に提起された集団訴訟）。
- **受け付けた側に届くもの**: 一般に、打ち切りを進める手順に届くのは、「不適格」という判定の結果である。判定の結果だけからは、それがどの入力と、どの世帯の構成の前提で出されたかは見えない。
- **検知の経路**: 報道によれば、誤りが争われたのは、打ち切りの後に、受給者が不服を申し立て、2020 年に集団訴訟が起こされてからである。
- **公表されていないこと**: 参照した報道には、どのデータがどの経路で読み込まれなかったか、打ち切りの前にどんな点検の手順があったか、判断の後の係争と是正の状況は書かれていない。

## 3. 何を照合するか

経路を問わず区別できる条件は、自動の判定の結果を使って給付を打ち切る前に、判定に使った入力と世帯の構成の前提が、元の記録と合うかを照合することである。

- **誰が承認を出すか**: 打ち切りを決める担当と、判定に使う入力の元の記録（所得・世帯などの記録）。判定を出すシステムとは別に、入力の出どころを示す。判定の結果そのものは、打ち切りの承認の代わりにならない。
- **どこで照合するか**: 判定の結果を使って打ち切りに進む前。判定に使った入力と世帯の前提を、元の記録と照らし、合わない、または読み込まれていない入力があれば、確認できるまで打ち切りを保留する。
- **何が残るか**: どの判定を、どの入力と世帯の前提で、誰の承認のもとで打ち切りに使ったかの記録。後から不服申立てや監査で、打ち切りの根拠をたどる手がかりになる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝自動の判定の結果で給付を打ち切る前に、判定に使った入力と世帯の前提を元の記録と照合し、記録に残すこと。検知＝打ち切りの後に、不服申立てや訴訟から誤りに気づくこと。日付は報道に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>判定の結果で打ち切る前に、入力と世帯の前提を元の記録と照合する</div>
<div class="rx-zone gapz"><b>連邦地裁の判断（報道）</b><span>自動の適格判定の不具合で<br>数千人の給付が違法に打ち切られた</span></div>
<div class="rx-zone det"><b>検知 · 打ち切りの後に働いた</b>受給者の不服申立てと集団訴訟で争われ、連邦地裁が判断した</div>
<div class="rx-g g1"><div class="t">2019〜2020</div><b>誤った打ち切りが表に出る</b></div>
<div class="rx-g g2"><div class="t">2020</div><b>集団訴訟が起こされる</b></div>
<div class="rx-g g3"><div class="t">2024-08</div><b>連邦地裁が判断</b></div>
<div class="rx-g g4"><div class="t">2024 以降</div><b>他州の同種のシステムの誤りも報じられる</b></div>
</div>
</figure>

誤りが争われたのは、打ち切りの後の、不服申立てと訴訟だった。その間に失われた給付と医療へのつながりは、後からは取り消せない。AI の照合結果が、独立の裏付けを欠いたまま取り消せない処分に進んだ事案に、[Brief 012](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)（顔認識による誤認逮捕）がある。「完了」「結論」という記録があるだけで、その根拠と照合されずに通った事案に、[Brief 035](https://lemma.frame00.com/ja/critical/briefs/035-boeing-787-inspection-records/)（Boeing 787 の検査の記録）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、自動の判定の結果を使って給付を打ち切る手順に組み込む。** 判定の正しさや公平さそのものを決めるのではなく、判定に使った入力と世帯の前提が元の記録と合うかを、判定を出すシステムの外で照合し、記録に残す。

### 注意したい業界・業務

- **業界 · 自治体・公共**: 自動の判定の結果を、給付の打ち切りなど、取り消しにくい処分に使う行政機関と、そのシステムを受託する事業者。
- **業界 · 医療・ヘルスケア**: 医療の給付や保険の資格を、自動の判定で決める組織。
- **業務 · 承認・決裁**: 判定の結果をもとにした、給付の打ち切りの決定。

### いまの対策と Lemma の違い

今回、報道が示した経路は 1 列目（自動の判定の結果で給付を打ち切る）である。2 列目は、打ち切りの後に、何を根拠に打ち切ったかを示す場面である。

| 対策 | 自動の判定の結果で給付を打ち切る | 打ち切りの後に、判定の根拠を示す |
| --- | --- | --- |
| 不服申立ての仕組み（打ち切りの後に争う） | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く |

不服申立ては、誤った打ち切りを正す道になるが、受給者が打ち切りに気づいて申し立てるまで、処分が先に進む。Lemma は、打ち切りの前に、判定に使った入力と世帯の前提を元の記録と照らし、照合できない判定では打ち切りに進まない。どの判定を、どの入力と前提で使ったかが残るので、後から根拠をたどれる。

注：Lemma の照合が働くのは、打ち切りに進む手順に照合を組み込み、入力の元の記録を、判定を出すシステムの外で管理している場合に限る。元の記録そのものが誤っていれば、誤ったものも通る。Lemma は、判定の規則や正しさ・公平さを直すものではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、不正や侵入を検出・防止するものではない。

### 点検チェックリスト

自動の判定の結果を、給付の打ち切りなどの処分に使う組織で確認する 3 項目

- 判定の結果で処分に進む前に、判定に使った入力と世帯などの前提が、元の記録と合うかを照合しているか。
- 読み込まれていない入力や、合わない前提がある判定を、確認できるまで処分に使わない手順があるか。
- どの判定を、どの入力と前提で、誰の承認のもとで処分に使ったかを、後から示せる記録を残しているか。

## 5. 事実と時系列

- **対象**: TennCare Connect（テネシー州の Medicaid〔TennCare〕の適格判定システム）。Deloitte らが構築・運用し、州が投じた費用は 4 億ドル超（報道）。
- **影響を受けた人**: TennCare などの受給者と申請者。2020 年に起こされた集団訴訟は、給付を打ち切られた成人と子どもを代理する。
- **報道が伝えた不具合**: システムが適切なデータを読み込まないことがあり、受給者を誤った世帯に割り当て、誤った適格判定を出していた。
- **司法の判断**: 2024 年 8 月、テネシー州中部地区の連邦地裁は、TennCare Connect の不具合により数千人が違法に給付を打ち切られたと判断した（報道）。
- **ほかの州**: KFF Health News は、Deloitte が複数の州で運用する Medicaid の適格判定システムで、同種の誤りが指摘されていると報じた。

### 時系列

- **2019〜2020**: TennCare Connect の適格判定をめぐり、誤った打ち切りや不適格の判定が表に出る。
- **2020**: 給付を打ち切られた成人と子どもを代理する集団訴訟が起こされる。
- **2024-08**: テネシー州中部地区の連邦地裁が、自動の判定の不具合により数千人が違法に給付を打ち切られたと判断する。
- **2024 以降**: 同種のシステムの誤りが、複数の州にわたって報じられる（KFF Health News）。

> 事実は、Gizmodo・KFF Health News・Texas Dentists for Medicaid Reform の報道に拠る。「違法に」という評価は、報道が伝えた連邦地裁の判断に拠る。判断の後の係争と是正の状況は確認できていない。本 Brief は、州や受託した事業者、個人を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **司法**: テネシー州中部地区の連邦地裁が、TennCare Connect の不具合により数千人が違法に給付を打ち切られたと判断した（2024-08、2020 年に起こされた集団訴訟・報道）。
- **報道**: KFF Health News は、Deloitte が複数の州で運用する Medicaid の適格判定システムで、同種の誤りが指摘されていると報じた。

## 6. Sources

- **Gizmodo**: “Judge Rules $400 Million Algorithmic System Illegally Denied Thousands of People's Medicaid Benefits”（2024-08）— <https://gizmodo.com/judge-rules-400-million-algorithmic-system-illegally-denied-thousands-of-peoples-medicaid-benefits-2000492529>
- **KFF Health News**: “Medicaid for Millions in America Hinges on Deloitte-Run Systems Plagued by Errors” — <https://kffhealthnews.org/news/article/medicaid-deloitte-run-eligibility-systems-plagued-by-errors/>
- **Texas Dentists for Medicaid Reform**: “Judge Rules Thousands Illegally Booted off Tennessee Medicaid by Deloitte System Similar to Texas”（2024）— <https://www.tdmr.org/judge-rules-thousands-illegally-booted-off-tennessee-medicaid-by-deloitte-system-similar-to-texas/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
