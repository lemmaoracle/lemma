---
brief_no: 120
title: "TikTok：AI 生成の「司会者」が、シンガポールとマレーシアの偽情報を流していた(CNA 調査)"
title_en: "TikTok: AI-generated \"presenters\" pushed disinformation about Singapore and Malaysia (CNA investigation)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-07-13
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["011-synthid-watermark-reverse-engineering", "053-youtube-deepfake-likeness-provenance", "105-japro-likeness-voice-ai-provenance", "119-japan-sexual-deepfake-npa-h1-2026", "050-grok-deepfake-consent-provenance"]
status: published
version: "1.0"
search_title: "TikTok の AI 生成「司会者」偽情報：CNA 調査"
search_description: "TikTok の 30 アカウント・550 本超の動画が、AI 生成の女性の人物像でシンガポールとマレーシアの偽情報を流していた（CNA の調査）。何が起きたか、なぜラベルで分けられないか、対策を整理。"
og_lead_ja: "TikTok で AI 生成の「司会者」の偽情報動画 550 本超が 300 万回超再生されたと CNA が報告"
og_lead_en: "CNA reports 550+ TikTok videos with AI-generated presenters drew over 3 million views"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "AI の事例 · 偽情報の動画"
og_kicker_en: "AI CASE · DISINFORMATION VIDEOS"
og_headline_ja: "AI 生成の「司会者」が\n偽情報を流したと報告。\n<accent>再生は 300 万回超</accent>"
og_headline_en: "AI presenters pushed\nfalse claims, CNA says.\n<accent>Over 3M views.</accent>"
key_figures:
  - value: "550"
    unit: "本超"
    label: "30 アカウントで調べた動画。98% は、AI 生成・加工・複製された女性の人物像に、使い回しの音声と台本を継ぎ合わせたもの（CNA の調査）"
    tone: "alert"
  - value: "300"
    unit: "万回超"
    label: "総再生数。およそ 9 割の動画が、シンガポールとマレーシアに関する虚偽または誤解を招く主張を運んだ（CNA の調査）"
  - value: "30"
    unit: "億件超"
    label: "TikTok がこれまでに AI 生成としてラベルを付けたコンテンツ（C2PA の発表）"
glossary:
  - term: "C2PA"
    desc: "Coalition for Content Provenance and Authenticity。コンテンツの出所と加工履歴を示す仕組みを進める業界団体。"
  - term: "Content Credentials"
    desc: "コンテンツの出所と加工履歴を示す情報。C2PA の発表は「デジタルの栄養表示ラベル」と位置付けている。"
  - term: "来歴"
    desc: "そのコンテンツを、誰が発行し、どう加工されてきたかの記録。"
insight:
  slug: "no-label-not-authentic"
  label: "ラベルが無いことは、本物の印ではない"
  quote: "ラベルは来歴の情報が経路を生き延びたときにだけ付くので、ラベルが無いことは、発信者が名乗りどおりの作り手であることを示さない。"
industries: ["media"]
operations: ["delivery"]
controls:
  - slug: "ownership-check"
    item: "動画の発信者が名乗りどおりの作り手かを、配信の前に照合する"
attack_method: "ai-misuse"
impact: "偽情報動画 550 本超が計 300 万回超再生された"
takeaway: "CNA の調査では、AI 生成の人物像の動画を複数のアカウントが同じ台本で流していた。配信の前に、発信者と動画の来歴を照合する。"
self_check: "動画を配信・引用する前に、その発信者と来歴を、アカウント名や見た目とは別に照合しているか。"
countries: ["sg", "my"]
---

## 1. 要点

調査によれば、動画は AI 生成・加工・複製された女性の人物像に、使い回しの音声と台本を継ぎ合わせて作られ、複数のアカウントが時期をずらして同じ論点を繰り返していた。偽装は、報道機関が頭部の固定や口の動きのずれなどの痕跡を分析して特定したもので、運営の主体は特定されていない。AI 生成のラベル付けが大規模に進んでいた場でも、この体制は成り立っていた。<strong>ラベルが無いことは発信者が名乗りどおりの作り手であることを示さず、それを配信の前に照合する手段が無ければ、一つの運営体が多くの独立した声に見える。</strong>

## 2. 通った操作

- **通った操作**: AI 生成・加工・複製された女性の人物像の動画の投稿と、推薦・配信を通じた視聴者への配信。24 のアカウントが、時期をずらしながら同じ論点を反復し、視聴者は同じ主張を異なるアカウントから繰り返し受け取った（CNA の調査）。
- **受け付けた側に届くもの**: 一般に、投稿を受け付ける側に届くのはアカウントと動画のデータで、動画の人物が実在するか、発信者が独立した作り手かは、それだけでは分からない。ラベルは、来歴の情報が経路を生き延びたときにだけ付く。
- **公表されていないこと**: 調べた動画に来歴のラベルが付いていたか。CNA が共有した 2 アカウントのほかの 28 アカウントと動画への措置の有無。運営の主体や発注者と、商業目的か国家の関与か（CNA は特定・判定していない）。

## 3. 何を照合するか

経路を問わず区別できる条件は、動画が視聴者の前に並ぶ前に、その発信が、名乗りどおりの作り手が発行し、改ざんされていないものかを、アカウント名や人物像の見た目とは別に照合することである。

- **誰が承認を出すか**: 動画を発行した作り手。発行の記録を作り手の鍵に結び付ける。アカウント名、人物像の見た目、ラベルの有無は、その代わりにならない。
- **どこで照合するか**: 推薦と配信の経路で、動画が視聴者の前に並ぶ手前。来歴が照合できない動画は、「独立した作り手の発信」として扱わない。音声・映像・台本を継ぎ合わせた動画は、構成要素の来歴の対応も照合する。
- **何が残るか**: どの動画が、どの発行者の来歴に基づいて配信されたかの記録。同じ運営体が立てた複数の人物像が、独立した作り手として数えられない形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝動画を視聴者に配信する前に、発信者と動画の来歴を照合し、記録に残すこと。検知＝流れた動画の偽装を、後から見つけること。今回は、報道機関の痕跡の分析がそれに当たる。日付は CNA の調査の公表日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>配信の前に、発信者と動画の来歴を照合する</div>
<div class="rx-zone gapz"><b>報告されたこと</b><span>AI 生成の人物像の動画が<br>同じ台本で繰り返し届いた</span></div>
<div class="rx-zone det"><b>検知 · 報道機関の分析が働いた</b>痕跡から偽装を特定し、2 アカウントを共有する</div>
<div class="rx-g g1"><div class="t">制作</div><b>AI 生成の人物像に、音声と台本を継ぐ</b></div>
<div class="rx-g g2"><div class="t">投稿</div><b>24 のアカウントが同じ論点を反復する</b></div>
<div class="rx-g g3"><div class="t">配信</div><b>推薦で、異なるアカウントから届く</b></div>
<div class="rx-g g4"><div class="t">07-13</div><b>CNA が調査を公表する</b></div>
</div>
</figure>

報道機関の分析は、頭部の固定、口の動きと音声のずれ、音声トラックの共有といった痕跡から偽装を特定したが、それは再生が積み上がったあとのことで、痕跡はいまの生成技術の粗さに依存する手がかりである。来歴が生成・公開の前に照合されなかった事案に、[SynthID の透かし](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/)（成果物に埋めた印は除去も偽造もされうる）、[YouTube の偽の著名人](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)、[JAPRO の肖像・声の実態調査](https://lemma.frame00.com/ja/critical/briefs/105-japro-likeness-voice-ai-provenance/) がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、動画が視聴者の前に並ぶ手前に組み込む。** 情報の真偽を判定するのでも、AI 生成の痕跡を見つけるのでもなく、その発信が、名乗りどおりの作り手が発行し、改ざんされていないものかを、配信の前に照合する。

### 注意したい業界・業務

- **業界 · メディア・コンテンツ**: 動画の配信や報道など、届いた動画を発信者の名で人に見せる事業。
- **業務 · 配信・送付**: 動画の推薦と配信、報道での動画の引用。

### いまの対策と Lemma の違い

今回の経路は、1 列目（推薦・配信で、動画が独立した作り手の発信として視聴者に届く）である。2 列目は、動画が運ぶ主張が虚偽かどうかの判定で、CNA が虚偽または誤解を招くと報告した中身に当たる。

| 対策 | 推薦・配信（発信者が名乗りどおりの作り手か） | 主張の真偽の判定 |
| --- | --- | --- |
| AI 生成のラベル（Content Credentials・不可視の透かし） | 一部 | 関係しない |
| 痕跡の分析（頭部の固定・音声のずれ・音声の共有） | 一部 | 関係しない |
| 規約違反のアカウントの監視と停止 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 関係しない |

AI 生成のラベルは、来歴の情報が経路を生き延びたときにだけ付き、敵対的に作られた動画はラベルを持たないまま届く。痕跡の分析とアカウントの停止は、流れた動画やアカウントを後から見つけて止めるもので、今回は CNA が共有した 2 アカウントが数日で停止された。Lemma は、配信の前に、発信をアカウント名や人物像の見た目ではなく発行者の来歴に結び付けて照合するので、同じ運営体が複数の人物像を立てても、独立した作り手としては通らない。主張が虚偽かどうかは判定しない。

注：Lemma の照合が働くのは、推薦・配信の経路に照合を組み込み、作り手が自分の鍵で発行の記録を残している場合に限る。来歴を持つ作り手が自ら発信する虚偽の主張は、この照合を通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

届いた動画を配信・引用するときに、組織で確認する 3 項目

- ラベルの無い動画を、「来歴が確認されていないもの」として扱っているか。
- 同じ運営体が立てた複数のアカウントを、独立した作り手として数えない仕組みがあるか。
- どの動画を、どの来歴に基づいて配信・引用したかを、記録に残しているか。

## 5. 事実と時系列

- **調べた人**: CNA（Sophia Tay と CNA Verification）。30 の TikTok アカウントを調べ、550 本超の動画の背後に「工場のような」制作体制があることを特定した。対象の期間は 2025 年 10 月から 2026 年 6 月。
- **作り方**: 98% は、AI 生成・加工・複製された女性の人物像を用い、使い回しの音声と再利用された台本を継ぎ合わせて組み立てられていた。
- **主張と再生**: 動画のおよそ 9 割が、シンガポールとマレーシアに関する虚偽または誤解を招く主張を運び、総再生数は 300 万回を超えた。
- **反復**: 550 本超のうち 94 本は同一の虚偽・誤解を招く主張を繰り返し、この 94 本で 160 万回超、調査対象全体のほぼ半数の再生を占めた。24 のアカウントが、時期をずらしながら同じ論点を反復していた。
- **最も極端な例**: シンガポールのヴィヴィアン・バラクリシュナン外相が、同国の港を迂回する新航路を認めないよう中国とインドネシアに懇願して失敗した、という主張。CNA の調査は、そのような事実はないとしている。この一件は 2 か月近く反復され、10 万回超再生された。
- **偽装の手がかり**: 人物像の頭部や胴体が 1 本の動画の中でも複数の動画をまたいでもほぼ動かず固定されていたこと、口の動きと音声のずれが頻発していたこと、台本を共有するアカウント群のうち半数が同一の音声トラックを使っていたこと、一部のアカウントが「人物名＋金融関連語」という命名の型と短時間の大量投稿を示していたこと（CNA の調査）。
- **ラベル付け**: C2PA の発表によれば、TikTok は Content Credentials・不可視の透かし・作り手向けの教育とラベル付けツールを組み合わせ、これまでに 30 億件超のコンテンツを AI 生成としてラベル付けしてきた。

### 時系列

- **2026-02**: CNA が先行する調査を公表し、YouTube 上でも同種の筋書きが流通していることを示す。
- **2026-07-13**: CNA が TikTok に関する調査を公表する（7 月 17 日に更新）。公表の前後に TikTok に質問と 2 アカウントの実例を送り、数日後、その 2 アカウントが「欺瞞的行為」の規約違反として停止される。
- **2026-07-28**: C2PA が、TikTok の一般会員から運営委員への昇格を発表する。

> 本件の事実は、CNA の調査記事と C2PA の公式発表に拠る。CNA が TikTok に共有したのは 2 アカウントで、いずれも停止された。残る 28 アカウントと 550 本超の動画への措置の有無を、記事は述べていない。記事は、調べた動画に来歴のラベルが付いていたかにも触れていない。CNA は運営の主体や発注者を特定しておらず、商業目的か国家の関与かも判定していない。本 Brief は、特定の事業者を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **TikTok**: 広報担当者は、規約違反として 2 アカウントを停止したと説明し、「システムやコミュニティを操作して世論に影響を与えようとする」アカウントを常時監視・削除していると述べた。同社の定義する欺瞞的行為には、隠蔽された影響工作・なりすまし・スパム・偽レビューが含まれる。
- **C2PA**: 議長の Clement Wolf 氏は発表文で、TikTok による Content Credentials の「早期かつ大規模な実装は、来歴が実環境で意味ある価値をもたらしうることを示している」と述べた。
- **専門家**: 南洋理工大学の Saifuddin Ahmed 准教授は、ディープフェイク技術の急速な進展を踏まえ、AI の痕跡を見つけようとすることは「負け戦（losing game）」だと述べた。個別の主張ではなく手口そのものに対する事前の免疫付け（prebunking）のほうが拡張性があるとし、「コンテンツは変わるが、手口は変わらない」としている。

## 6. Sources

- **CNA（一次・調査報道）**: Sophia Tay & CNA Verification, “AI-generated women are spreading disinformation about Singapore on TikTok”（2026-07-13、2026-07-17 更新）— <https://www.channelnewsasia.com/singapore/tiktok-ai-women-disinformation-deepfake-presenters-6250271>
- **C2PA / PR Newswire（一次・公式発表）**: “C2PA Welcomes TikTok to Steering Committee, Advancing the Adoption of Content Credentials at a Global Scale”（2026-07-28）— <https://www.prnewswire.com/news-releases/c2pa-welcomes-tiktok-to-steering-committee-advancing-the-adoption-of-content-credentials-at-a-global-scale-302836730.html>
- **CNA（一次・関連調査）**: Renald Loh & CNA Verification, “Some 260 fake Jack Ma videos spreading falsehoods about Singapore on YouTube: CNA investigation”（2026-07-28）— <https://www.channelnewsasia.com/singapore/jack-ma-ai-deepfakes-youtube-disinformation-falsehoods-6273136>
- **CNA（一次・先行調査）**: “Singapore and PM Lawrence Wong targeted in AI-driven disinformation campaign on YouTube”（2026-02）— <https://www.channelnewsasia.com/singapore/lawrence-wong-disinformation-ai-youtube-campaign-chinese-fake-videos-5949266>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
