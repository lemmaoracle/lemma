---
brief_no: 189
title: "Chicago Sun-Times：配信会社から購入した特集が編集部の確認を経ずに載り、存在しない本を推薦図書に挙げた(同紙の声明と検証)"
title_en: "Chicago Sun-Times: A syndicated section ran without newsroom review and listed books that do not exist (the paper's statement and review)"
pillar: 01-verifiable-origin
primary_category: data-provenance
secondary_categories: [ai-decision-integrity]
incident_date: 2025-05-18
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["188-deloitte-dewr-report-fabricated-references", "060-withers-aberdeen-ai-hallucinated-precedent", "053-youtube-deepfake-likeness-provenance"]
status: draft
version: "1.0"
og_lead_ja: "Chicago Sun-Times、配信会社から購入した特集（シンジケート記事）が編集部の確認を経ずに載り、推薦図書の多くが存在しない本だった"
og_lead_en: "Chicago Sun-Times ran a syndicated section without newsroom review; most books on its reading list did not exist"
layout: "report"
sections: "proof"
gate: "delivery"
og_kicker_ja: "AI の誤用事例 · シンジケート記事の掲載"
og_kicker_en: "AI MISUSE · SYNDICATED CONTENT"
og_headline_ja: "購入した配信記事の\n推薦図書は存在しない本。\n<accent>15 冊中 10 冊</accent>"
og_headline_en: "Syndicated content\nrecommended fake books.\n<accent>10 of 15 titles</accent>"
key_figures:
  - value: "10 / 15"
    unit: "冊"
    label: "推薦図書の一覧のうち、存在しない本（著者は実在。同紙の検証）"
    tone: "alert"
  - value: "10"
    unit: "本"
    label: "名前の出た情報源のある記事。同紙の事実確認で、どれにも複数の誤りがあった"
  - value: "64"
    unit: "ページ"
    label: "King Features から購入した特集「Heat Index」の大きさ"
glossary:
  - term: "シンジケート（記事の配信）"
    desc: "通信社や配信会社が作った記事・特集・漫画などを、複数の新聞社に売って載せてもらう仕組み。購入した新聞社の紙面に、その新聞の体裁で載ることが多い。"
  - term: "King Features"
    desc: "米 Hearst の一部門で、ニューヨークに本拠を置く配信会社。漫画・パズル・特集などを新聞社に売る。"
  - term: "e-paper（電子版の紙面）"
    desc: "印刷した紙面と同じ割り付けを、そのままネットで読める形にした版。"
insight:
  slug: "bought-content-not-reviewed"
  stop: true
  label: "購入した配信記事が編集部の確認を経ずに載る"
  quote: "紙面に載せる前に、購入した配信記事を、購入した部署の判断ではなく編集の承認と照合する。"
industries: ["media"]
operations: ["delivery"]
controls:
  - slug: "check-origin"
    item: "購入した配信記事の配信元・執筆者・AI の使用を、載せる前に確認する"
  - slug: "hold-unverified"
    item: "編集の確認を経たと照合できるまで、購入した配信記事を紙面や配信に載せない"
  - slug: "audit-trail"
    item: "版ごとに、どのコンテンツを、どこから受け取り、誰が確認して出したかを記録する"
attack_method: "ai-misuse"
impact: "推薦図書 15 冊のうち 10 冊が存在しない本で、特集は 2 紙に載った"
takeaway: "配信会社から購入した特集が、編集部の確認に回らないまま自社の紙面に載った。購入した配信記事も、編集の確認を経たと照合してから配信する。"
self_check: "購入した配信記事を、編集の確認を経たと照合してから、紙面や配信に載せているか。"
countries: ["us"]
search_title: "Sun-Times の AI 架空の推薦図書：載った経緯"
search_description: "米 Chicago Sun-Times が配信会社から購入した特集（シンジケート記事）で、推薦図書 15 冊のうち 10 冊が存在しない本だった（同紙の声明と検証）。何が起きたか、なぜ編集部の校閲を経ずに載ったか、対策を整理。"
---

## 1. 要点

特集は、同紙の編集部が作ったものではなく、販売部門が Hearst の配信会社 King Features から購入した。編集部の確認に回らないまま日曜の紙面と電子版（e-paper）に載り、第三者の作であること（クレジット）も示されなかった（同紙の声明と検証）。

King Features によれば、委託の執筆者が AI のエージェントを使って特集を作り、申告していなかった。運営の Chicago Public Media の CEO は、配信元から自社の紙面までの間で人の誤りが重なったと説明している。

<strong>配信会社から購入した記事（シンジケート記事）でも、自社の紙面に載れば、読み手には自社が確認したものとして届く。</strong>

## 2. 通った操作

- **通った操作**: 有料の特別版として、配信元から購入した 64 ページの特集「Heat Index」を、2025-05-18 の日曜の紙面と電子版に載せる、いつもの掲載。同紙の販売の部門（circulation）が King Features と取引し、特集は同紙の題字（マストヘッド）の下に組まれた（同紙の声明と検証）。
- **受け付けた側に届くもの**: 一般に、読者には、いつもの新聞の紙面として届く。中の記事が誰の作で、どこまで確認されたかは、紙面からは分からない。同紙も、第三者の作であることを示さずに載ったとしている。
- **配信元での扱い**: King Features によれば、同社には社員と外部の執筆者に AI を禁じる方針があり、執筆者は AI の使用を申告していなかった。運営の Chicago Public Media の CEO は、King Features が執筆者の原稿を十分に事実確認・校閲しなかったとみられるとした（同紙の検証）。
- **公表されていないこと**: 使われた AI のツールの名前。King Features の社内の調べの結果。最初にどこから誤りが指摘されたか。Philadelphia Inquirer に載った日と、同紙の側での扱い。

## 3. 何を照合するか

経路を問わず区別できる条件は、外部から受け取った記事（コンテンツ）の出どころと編集の承認を、受け取った部署とは別に、載せる前に照合することである。

- **誰が承認を出すか**: 配信する新聞社の編集の側。購入した配信記事でも、紙面に載せてよいとする承認は編集の担当が出す。購入契約を結ぶ部署（今回は販売部門）では決めない。
- **どこで照合するか**: 紙面や電子版に組み込む（入稿の）直前。コンテンツごとに、配信元と執筆者、AI の使用の申告、編集の承認がそろっているかを照合する。承認は、載せる版の中身と同じものに対して出されたものに限る。そろわないコンテンツは版に入れない。
- **何が残るか**: 版ごとに、どのコンテンツを、どの配信元から受け取り、誰が確認して出したかの記録。外部の作であることを読者に示すときの根拠にもなる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝購入した配信記事を紙面に載せる前に、出どころと編集の承認がそろっているかを照合し、記録に残すこと。検知＝読者や著者の指摘など、載った後に分かること。下の日付は、同紙の声明と検証に書かれた日である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>載せる前に、出どころと編集の承認がそろっているかを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>推薦図書 15 冊のうち 10 冊が存在しない本<br>名前の出た情報源のある 10 本すべてに誤り</span></div>
<div class="rx-zone det"><b>検知 · 載った後に分かった</b>掲載の後に誤りが分かり、同紙が声明と検証を出す</div>
<div class="rx-g g1"><div class="t">2025-04</div><b>King Features が特集を売り込む</b></div>
<div class="rx-g g2"><div class="t">2025-05-18</div><b>特集が日曜の紙面と電子版に載る</b></div>
<div class="rx-g g3"><div class="t">2025-05-20</div><b>同紙が声明を出し、電子版から外す</b></div>
<div class="rx-g g4"><div class="t">2025-05-29</div><b>同紙が検証の結果を公表する</b></div>
</div>
</figure>

検知は働いた。載った 2 日後に同紙は声明を出して電子版から特集を外し、11 日後には記事ごとの事実確認の結果を公表している。ただ、分かったのは読者に届いた後だった。AI が作った存在しないものが、確認を経ないまま外へ出た事案に、裁判所に出した書面に実在しない判例が入っていた [Withers 対 Aberdeen 市](https://lemma.frame00.com/ja/critical/briefs/060-withers-aberdeen-ai-hallucinated-precedent/)がある。出どころの分からない合成の中身が、配信の場で区別されなかった事案に [YouTube の偽の著名人](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、紙面や配信にコンテンツを組み込む手順に入れる。** 記事の中身が正しいかを判定するのではなく、外部から受け取った記事（コンテンツ）ごとに、出どころの申告と編集の承認がそろい、その承認が載せる中身と同じものに対して出されたかを、載せる前に照合する。

### 注意したい業界・業務

- **業界 · メディア・コンテンツ**: 配信会社や外部の制作会社から、記事・特集・広告の企画を購入して自社の名前で出す新聞社・出版社・放送局・ウェブの媒体。購入の部署と編集の部署が分かれていると、確認の道に乗らない中身が出る。
- **業務 · 配信・送付**: 外部から受け取った記事（コンテンツ）を、自社の版や配信にまとめて読者や顧客に届ける業務。受け取ったコンテンツは、自社の確認を経ていなくても、自社のものとして届く。

### いまの対策と Lemma の違い

今回の経路は 1 列目（編集の確認を経ない、購入した配信記事の掲載）である。2 列目は、編集の確認を経たのに中身の誤りが残る場合で、今回の経路ではない。

| 対策 | 確認を経ない配信記事の掲載 | 確認を経た後に残る中身の誤り |
| --- | --- | --- |
| 第三者の作であることと出どころの明示（同紙の事後の方針） | 一部 | 関係しない |
| 配信元の AI を禁じる方針（King Features の説明） | 一部 | 一部 |
| 編集部の事実確認・校閲 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 関係しない |

出どころの明示は、読者が外部の作だと知る助けになるが、それだけでは確認を経たかは分からない。配信元の AI の方針は、執筆者が申告しなければ働かない（King Features は執筆者が申告していなかったとし、同紙の検証によれば執筆者は契約に AI の定めが無かったとしている）。編集部の事実確認は中身の誤りを捉えるが、確認の道に回ってきた中身にしか働かない。Lemma は、確認の道に乗ったかを載せる前に照合する。中身が正しいかは判定しないので、確認を経た後に残る誤りには働かない。

注：Lemma の照合が働くのは、コンテンツを版に組み込む手順に照合を入れ、編集の承認を出せる人を購入の部署とは別に登録している場合に限る。承認した人が中身を十分に見ていなければ、誤った中身も通る。Lemma は記事を消さず、配られた紙面を回収もしない。中身が事実かを確認するのは編集の仕事である。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

購入した配信記事を自社の名前で出す配信について、組織で確認する 3 項目

- 購入する配信記事について、誰が書き、AI を使ったかを、配信元が申告する取り決めがあるか。
- 購入した配信記事を受け取る部署が編集の部署と別のとき、編集の確認に回す決まりがあるか。
- 版ごとに、どのコンテンツを誰が確認して出したかを記録しているか。

## 5. 事実と時系列

- **組織**: Chicago Sun-Times（運営は非営利の Chicago Public Media）。特集は Philadelphia Inquirer にも載った。2 紙とも King Features から購入した（同紙の検証）。
- **特集**: 「Heat Index: Your Guide to the Best of Summer」。64 ページで、夏の過ごし方の記事と、62 ページの「2025 年夏の推薦図書」を含む（同紙の検証）。
- **取引の背景**: 同紙はこの 2 年、宅配の購読者に、年に 10 ほどの特別版を、1 回 3 ドルの追加で届けてきた。もとは同紙の記者が書いていたが、その数は減らしており、King Features から購入するのは、紙から電子への移行の間に売上の目標を保つためだった。King Features は 4 月の営業のメールで、この特集を「premium summer lifestyle section」として売り込んだ（同紙の検証）。
- **確認されたこと**: 推薦図書 15 冊のうち 10 冊が存在しない本で、著者は実在した。著者や代理人が存在しないことを認めた。名前の出た情報源のある記事 10 本を同紙が事実確認し、どれにも複数の誤りがあり、実在が確認できない人物や、本人が否定した発言の引用があった（同紙の検証）。
- **AI の使用**: King Features によれば、委託の執筆者が AI のエージェントを使って特集を作り、申告していなかった。同紙の検証によれば、執筆者は誤りを AI の使用と事実確認の不足によるものと説明した（同紙の声明と検証）。
- **ほかの特集**: 同紙は、King Features から購入した 11 月の休暇の特集でも、引用された人物が実在するかを確認できなかったとした（同紙の検証）。

### 時系列

- **2025-04**: King Features が、営業のメールで特集を売り込む。
- **2025-05-18**: 特集「Heat Index」が、同紙の日曜の紙面と電子版に載る。
- **2025-05-20**: 同紙が声明を出す。推薦図書の一覧は AI のツールで作られ、存在しない本を薦めていたとし、特集を電子版から外し、この特別版の代金を購読者に請求しないとする。
- **2025-05-29**: 同紙が検証の結果を公表する。

> 本件の事実は、Chicago Sun-Times の声明（2025-05-20）と、同紙の記者による検証の記事（2025-05-29）に拠る。AI の使用と執筆者の扱いは、King Features の説明として同紙が伝えたものである。配信元から紙面までの経緯は、同紙と運営の Chicago Public Media の説明である。Chicago Public Media の CEO は、執筆者・King Features・同紙・Chicago Public Media にまたがる人の誤りの連なりだったとしている。本 Brief は個人や組織の落ち度を評価するものではない。使われた AI のツール、King Features の社内の調べの結果、Philadelphia Inquirer の側での経緯は公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Chicago Sun-Times（声明）**: 第三者から購入するコンテンツが自社の報道の基準に合うよう方針を改め、第三者の作であることと出どころを明示する。全国の配信元との関係を見直す。
- **Chicago Public Media（検証の記事での説明）**: 「Heat Index」と 11 月の特集を電子版の保管から外す。King Features から特集を購入するのをやめるが、漫画とパズルは続ける。AI の方針を作って公表する。AI を試すことは続けるが、AI のエージェントに記事を書かせることはしない。
- **King Features（同紙が伝えた説明）**: 執筆者が同社の AI の方針に反したとして、関係を終えた。同社の社内の調べを進めている（同紙の検証）。

## 6. Sources

- **Chicago Sun-Times（一次・当事者）**: "Chicago Sun-Times response to May 18 special section"（2025-05-20） — <https://chicago.suntimes.com/press-room/2025/05/20/chicago-sun-times-response-to-may-18-special-section>
- **Chicago Sun-Times（一次・当事者の検証）**: "Special section with fake book list plagued with additional errors, Sun-Times review finds"（2025-05-29） — <https://chicago.suntimes.com/news/2025/05/29/special-section-king-fake-book-list-errors-sun-times-review>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
