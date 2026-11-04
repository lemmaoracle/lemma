---
brief_no: 36
title: "DataComp CommonPool：公開の AI 学習データに、パスポート・履歴書・顔が含まれていた(arXiv:2506.17185)"
title_en: "DataComp CommonPool: A public AI training dataset contained passports, résumés and faces (arXiv:2506.17185)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-07-18
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "011-synthid-watermark-reverse-engineering"]
version: "1.0"
status: published
search_title: "CommonPool の個人情報混入：AI 学習データの監査"
search_description: "公開 AI 学習データセット DataComp CommonPool に、パスポート・履歴書・顔など個人情報が含まれていた（研究チームの監査・arXiv:2506.17185）。何が起きたか、なぜ事後のフィルタで除ききれないか、対策を整理。"
og_lead_ja: "DataComp CommonPool の 128 億ペアの AI 学習データに、パスポート・履歴書・顔が含まれていたと研究チームが報告"
og_lead_en: "Researchers report that DataComp CommonPool's 12.8B training pairs contained passports, résumés and faces"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "AI の事例 · 学習データの個人情報"
og_kicker_en: "AI CASE · PERSONAL DATA IN TRAINING SETS"
og_headline_ja: "AI の学習データに、\n身分証や履歴書、顔。\n<accent>ぼかしを逃れた顔 800 超</accent>"
og_headline_en: "AI training data held\nIDs, résumés and faces.\n<accent>800+ faces evaded blurring</accent>"
key_figures:
  - value: "800 超"
    label: "0.1% の標本で、顔の自動ぼかしを逃れた顔。全体では約 1 億 200 万と推定された（研究チーム）"
    tone: "alert"
  - value: "128"
    unit: "億ペア"
    label: "DataComp CommonPool の画像とテキストの組（2023 年公開）。Common Crawl が 2014–2022 に集めた素材が基盤"
  - value: "0.1%"
    label: "研究チームが監査した標本の割合。数千件の有効な身分証と、800 件超の履歴書・カバーレターが見つかった"
glossary:
  - term: "DataComp CommonPool"
    desc: "2023 年に公開された、画像とテキストの組からなる AI の学習データセット。LAION-5B の後継に当たる。"
  - term: "Common Crawl"
    desc: "公開 Web を広く集めている取り組み。CommonPool は、2014–2022 にここで集められた素材を基盤にする。"
  - term: "個人情報の文字列のフィルタ"
    desc: "メールアドレスや社会保障番号など、形の決まった個人情報を文字列から探して除く仕組み。"
insight:
  slug: "public-is-not-consent"
  label: "公開されていることは、学習に使う同意ではない"
  quote: "公開されている素材でも、学習に使ってよい来歴と同意を取り込みの前に照合しなければ、後からのフィルタで除ききれない個人情報がデータセットに残る。"
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "ownership-check"
    item: "素材に、学習に使ってよい来歴と同意があるかを、取り込む前に照合する"
impact: "0.1% の標本で 800 超の顔が自動ぼかしを逃れていた（研究チームの監査）"
takeaway: "研究チームの監査では、顔のぼかしなど事後のフィルタを逃れた個人情報が見つかった。学習データに取り込む前に、素材の来歴と同意を照合する。"
self_check: "学習や分析に使うデータを取り込む前に、その素材を使ってよい来歴と同意があるかを照合しているか。"
countries: ["global"]
---

## 1. 要点

研究チームの監査によれば、公開 Web から集めた画像とテキストの組には、実在の個人の身分証や履歴書、顔が含まれ、キュレーターが施した顔の自動ぼかしを逃れたものもあった。メールアドレスなどの既知の個人情報の文字列のフィルタは、適用されていなかったとされる。規模は標本の監査からの推定で、全数を数えたものではない。<strong>公開されている素材でも、学習に使ってよい来歴と同意を取り込みの前に照合しなければ、後からのフィルタで除ききれない個人情報がデータセットに残る。</strong>

## 2. 通った操作

- **通った操作**: 公開 Web から集めた画像とテキストの組の、学習データセットへの取り込みと公開。顔の自動ぼかしを施したうえで、誰でも学習に使えるデータセットとして公開された（研究チームの監査、MIT Technology Review の報道）。
- **受け付けた側に届くもの**: 一般に、Web から集めた素材には、画像とテキストは付いてくるが、誰の素材で、どの同意で、どの利用の範囲で公開されたかの来歴は付いてこない。取り込む側には、学習に使ってよいかを判断する材料が届かない。
- **事後のフィルタ**: 顔の自動ぼかしは施されていたが、標本の中で 800 超の顔が検出を逃れた。メール・社会保障番号などの既知の個人情報の文字列のフィルタは適用されていなかった、と研究チームは報告している。
- **公表されていないこと**: 下流の生成モデルや派生物に、実際にどの程度の個人情報が伝わったか。データセット全体の規模（標本からの推定で、全数は数えられていない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、素材をデータセットに取り込む前に、その素材に、学習に使ってよい来歴と同意があるかを照合することである。

- **誰が承認を出すか**: 素材の持ち主（写っている本人や、文書の持ち主）。Web で公開されていることは、学習への利用を認めたことの代わりにならない。
- **どこで照合するか**: 素材をデータセットに取り込む手前。来歴と同意が照合できない素材は、取り込まない。
- **何が残るか**: どの素材が、どの来歴と同意で入ったかの記録。削除や訂正を求められたとき、当たる素材を辿れる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝素材をデータセットに取り込む前に、学習に使ってよい来歴と同意を照合し、記録に残すこと。検知＝取り込んだ後に、混ざった個人情報を見つけること。今回は、研究チームの標本の監査がそれに当たる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取り込む前に、素材の来歴と同意を照合する</div>
<div class="rx-zone gapz"><b>研究チームが報告したこと</b><span>ぼかしを逃れた顔と<br>身分証・履歴書が残っていた</span></div>
<div class="rx-zone det"><b>検知 · 研究チームの監査が働いた</b>0.1% の標本を監査し、全体を推定する</div>
<div class="rx-g g1"><div class="t">2014–22</div><b>Common Crawl が公開 Web を広く集める</b></div>
<div class="rx-g g2"><div class="t">2023</div><b>顔の自動ぼかしを施し、データセットを公開する</b></div>
<div class="rx-g g3"><div class="t">下流</div><b>誰でも学習に使える形で出回る</b></div>
<div class="rx-g g4"><div class="t">2025-07</div><b>監査の結果が報じられる</b></div>
</div>
</figure>

研究チームの監査は、事後のフィルタで除ききれなかった個人情報を具体的に示したが、それはデータセットが公開された後に見つけたものだった。公開されていることと学習に使う同意が分かれた事案に、[Discord のメッセージのスクレイピング](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/) がある。AI の生成物に埋めた来歴の印が外せた点は、[SynthID の透かしの除去](https://lemma.frame00.com/ja/critical/briefs/011-synthid-watermark-reverse-engineering/) と重なる。

## 4. Lemma でできること

**Lemma は、03 の照合を、素材をデータセットに取り込む手前に組み込む。** 混ざった個人情報を後から探すのではなく、その素材に学習に使ってよい来歴と同意があるかを、取り込む前に照合する。

### 注意したい業界・業務

- **業界 · AI**: Web から集めた素材でモデルを学習させる、または学習データセットを公開・提供する事業者。
- **業務 · 情報の開示・提供**: 集めたデータを、データセットとして公開・提供すること。

### いまの対策と Lemma の違い

1 列目は素材をデータセットに取り込むこと、2 列目は取り込んだ素材から個人情報を除くことで、今回はどちらも通った。

| 対策 | 素材の取り込み（来歴と同意） | 取り込んだ素材からの個人情報の除去 |
| --- | --- | --- |
| 顔の自動ぼかし | 関係しない | 一部 |
| 既知の個人情報の文字列のフィルタ | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 関係しない |

研究チームの報告によれば、顔の自動ぼかしは施されていたが、標本だけで 800 超の顔が検出を逃れ、既知の個人情報の文字列のフィルタは適用されていなかった。どちらも、取り込んだ後の素材から個人情報を探して除くもので、その素材を学習に使ってよいかは決めない。Lemma は、取り込む前に、素材の来歴と同意を照合する。取り込んだ素材の中から個人情報を見つけたり、データを消したりするものではない。

注：Lemma の照合が働くのは、素材をデータセットに取り込む手前に照合を組み込み、素材の来歴と同意が、集める側とは別に発行・管理されている場合に限る。来歴と同意を持つ素材は、この照合を通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

学習や分析に使うデータの取り込みについて、組織で確認する 3 項目

- 取り込む素材を、公開されているかどうかとは別の基準で選んでいるか。
- どの素材が、どの来歴と同意でデータセットに入ったかを記録しているか。
- 削除や訂正を求められたとき、当たる素材をデータセットの中で辿れるか。

## 5. 事実と時系列

- **対象**: DataComp CommonPool。2023 年に公開された、128 億の画像とテキストの組からなる学習データセット。Common Crawl が 2014–2022 に Web から集めた素材を基盤にし、LAION-5B の後継に当たる。
- **公表**: 研究チームが監査の論文を公開し（arXiv:2506.17185）、2025-07-18 に MIT Technology Review が報じた。
- **確認されたこと**: データセットの 0.1% の監査で、数千件の有効な身分証（クレジットカード・運転免許・パスポート・出生証明書）と、800 件超の履歴書・カバーレター（LinkedIn との照合で実在を確認）が見つかった、と研究チームは報告している。
- **推定**: 研究チームは、全体では数億規模の個人の画像があると推定している。
- **個人情報の対策**: キュレーターは顔の自動ぼかしを施していたが、標本の中で 800 超の顔が検出を逃れ、全体で約 1 億 200 万の顔が見逃されたと推定された。メール・社会保障番号などの既知の個人情報の文字列のフィルタは、適用されていなかった。
- **影響**: CommonPool は LAION-5B の後継で、Stable Diffusion・Midjourney などの学習の系譜に連なる。研究チームと報道は、下流の生成モデルと派生物へ個人情報が伝わる恐れを指摘している。

### 時系列

- **2014–2022**: Common Crawl が、公開 Web の画像とテキストを広く集める。
- **2023**: DataComp CommonPool が 128 億の組で公開される。顔の自動ぼかしなどの対策が施される。
- **2025-06**: 研究チームの論文が arXiv で公開される（arXiv:2506.17185）。
- **2025-07-18**: MIT Technology Review が、身分証・履歴書・ぼかしを逃れた顔の混入と、全体の推定を報じる。

> 固有名は一次（研究機関など）に基づく。本件は研究チームによる 0.1% の標本の監査と全体の推定で、推定値を確定値として扱わず、混入の規模を誇張しない。本件は攻撃ではなく、学習データの来歴と同意の扱いが表に出た事例である。本 Brief は、特定の事業者を責めるものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **研究チームと報道**: 標本の監査から全体を推定し、顔のぼかしの漏れと、個人情報の文字列のフィルタが適用されていなかったことを指摘した。LAION-5B の後継として、下流へ伝わる恐れを示した。
- **フィルタの改善**: 顔の自動ぼかしや、個人情報の検出フィルタの改善が進められている。
- **業界の論点**: 大規模な Web の収集を基盤にする学習データでは、事後のフィルタだけでは個人情報の混入を除ききれないこと、どの素材がどの来歴で入っているかを辿れる構成が、個人情報の保護（忘れられる権利など）とモデルの供給網の両方から求められつつあることが、論点になっている。来歴の無いデータセットからは、削除や訂正に応えにくい。

## 6. Sources

- **MIT Technology Review**: "A major AI training data set contains millions of examples of personal data"(2025-07-18、CommonPool の PII 混入・規模推定・顔ぼかしの漏れ)— https://www.technologyreview.com/2025/07/18/1120466/a-major-ai-training-data-set-contains-millions-of-examples-of-personal-data/
- **研究論文(arXiv)**: "A Common Pool of Privacy Problems: Legal and Technical Lessons from a Large-Scale Web-Scraped Machine Learning Dataset"(arXiv:2506.17185、2025-06)— https://arxiv.org/abs/2506.17185

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
