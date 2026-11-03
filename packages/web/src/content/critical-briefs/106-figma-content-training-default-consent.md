---
brief_no: 106
title: "Figma：AI の学習への利用が、個人・小規模チームでは既定でオン、エンタープライズでは既定でオフだった(同社の公開ドキュメント)"
title_en: "Figma: AI content training was on by default for individuals and small teams, and off for enterprise (Figma's documentation)"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-11-21
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "079-common-crawl-training-data-live-secrets", "054-sora2-ip-provenance-consent", "052-discord-age-verification-id-leak"]
status: published
layout: "report"
sections: "proof"
gate: "disclosure"
version: "1.0"
search_title: "Figma の AI 学習の既定オン：訴訟と対策"
search_description: "Figma の公開ドキュメントでは、AI の学習への利用は個人・小規模チームのプランで既定オン、エンタープライズで既定オフ。2025 年に集団訴訟が提起された。経緯と、学習に取り込む前に同意を照合することを整理。"
og_lead_ja: "Figma の公開ドキュメントによれば、AI の学習への利用は Starter・Professional で既定オン、Organization・Enterprise で既定オフ。2025-11-21 に集団訴訟が提起された"
og_lead_en: "Per Figma's documentation, AI content training is on by default for Starter and Professional and off for Organization and Enterprise; a class action was filed on 2025-11-21"
og_kicker_ja: "AI の事例 · 学習への利用の既定値"
og_kicker_en: "AI CASE · TRAINING DEFAULTS"
og_headline_ja: "AI の学習への利用は\n個人・小規模で既定オン。\n<accent>エンタープライズは既定オフ</accent>"
og_headline_en: "AI content training was\non by default for small\nteams and individuals.\n<accent>Off for enterprise</accent>"
key_figures:
  - value: "2"
    unit: "プラン"
    label: "学習への利用が既定でオンのプラン（Starter・Professional）。Organization・Enterprise は既定でオフ（Figma の公開ドキュメント）"
    tone: "alert"
  - value: "2024-08-15 → 2025-11-21"
    label: "content training の発効から、集団訴訟 Khan v. Figma の提起まで"
  - value: "4"
    unit: "つ"
    label: "原告が掲げる法律の理論の数。中心は契約違反と営業秘密の不正取得（原告の主張）"
glossary:
  - term: "content training"
    desc: "Figma の AI 機能のモデル学習に、デザインファイルなどのコンテンツを用いる設定。チーム／組織の管理者が持つ。"
  - term: "Starter・Professional／Organization・Enterprise"
    desc: "Figma のプラン。前の 2 つは個人や小規模チーム向け、後の 2 つは組織・大企業向け。"
  - term: "AB 2013"
    desc: "米カリフォルニア州の生成 AI 学習データ透明化法。開発者に、学習データの出所と内容の公表を義務づける。2026-01-01 施行。"
insight:
  slug: "default-is-not-consent"
  label: "既定値は、学習への利用の同意ではない"
  quote: "預けられたコンテンツを学習に取り込む前に、その用途への同意を既定値や管理者の設定とは別に照合しなければ、同意して預けたものとそうでないものは、学習データの中で後から区別できない。"
industries: ["ai"]
operations: ["disclosure"]
controls:
  - slug: "hold-unverified"
    item: "学習への取り込みは、既定の設定ではなく、認可された範囲を確認できた場合に限る"
  - slug: "audit-trail"
    item: "取り込んだデータごとに、同意の範囲と取得時点を記録する"
impact: "Starter・Professional の 2 プランで、学習への利用が既定でオン（Figma の公開ドキュメント）"
takeaway: "Figma の公開ドキュメントでは、学習への利用はプランの既定値と管理者の設定で決まる。預かったコンテンツを学習に取り込む前に、その用途への同意を照合する。"
self_check: "預かったデータを自社の AI の学習に使う前に、その用途への同意を、既定の設定とは別に照合しているか。"
countries: ["us"]
---

## 1. 要点

同社の公開ドキュメントによれば、AI の学習への利用の設定はチーム／組織の管理者が持ち、個々の利用者は自分のコンテンツについて単独では選べない。集団訴訟の原告は、コンテンツを他の用途に使わないという長年の説明に反して、既定の設定と方針の変更によりデザインファイルが学習に使われたと主張し、同社は否認している。どちらの主張が正しいかは、裁判所がまだ判断していない。<strong>預けられたコンテンツを学習に取り込む前に、その用途への同意を既定値や管理者の設定とは別に照合しなければ、同意して預けたものとそうでないものは、学習データの中で後から区別できない。</strong>

## 2. 通った操作

- **通った操作**: 利用者が預けたデザインファイルなどのコンテンツを、AI 機能のモデル学習の対象にすること。Figma の公開ドキュメントによれば、content training は 2024-08-15 に発効し、Starter・Professional では既定でオン、Organization・Enterprise では既定でオフ（現時点では有効化できない）である。
- **受け付けた側に届くもの**: 一般に、学習に取り込む側に届くのは、コンテンツと、チームの設定の状態である。そのコンテンツを預けた人が学習への利用に同意したかは、コンテンツには付いてこない。Starter・Professional では設定はチーム単位で、個々の利用者は自分のコンテンツについて単独で選べない（Figma の公開ドキュメント）。
- **訴訟での主張**: 原告は、利用者はコラボレーション機能の提供にだけ使われるという説明を前提に専有的なデザインを預けており、学習への転用は当初の合意に反する（契約違反）、デザインファイルに含まれる未公開の製品計画やワークフローから競争上の価値を引き出した（営業秘密の不正取得）と主張している。Figma はこれを否認し、許諾なく顧客情報をモデル学習に用いることはないとしている。
- **公表されていないこと**: どのチームの、どのコンテンツが、実際に学習に用いられたか。参照した資料には無い。

## 3. 何を照合するか

経路を問わず区別できる条件は、預かったコンテンツを学習に取り込む前に、そのコンテンツに、学習への利用についての権利者の同意が結びついているかを照合することである。

- **誰が承認を出すか**: コンテンツの権利者（デザインファイルを預けた利用者や、その組織）。既定値がオンだったこと、管理者がオフにしなかったことは、その用途への同意の代わりにならない。
- **どこで照合するか**: コンテンツを学習データに取り込む手前。同意を照合できないコンテンツは、取り込まない。
- **何が残るか**: どのコンテンツが、どの同意の範囲で、いつ取り込まれたかの記録。同社の説明では、管理者が後からオフにした場合、効果は以後の新規コンテンツと編集に及ぶ。それ以前に取り込まれたものを、後から辿れる形にする。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝預かったコンテンツを学習に取り込む前に、その用途への同意を照合し、記録に残すこと。検知＝取り込みの後に、利用者が転用に気づき、訴えや報道で争点になること。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取り込む前に、学習への利用の同意を照合する</div>
<div class="rx-zone gapz"><b>原告が訴えたこと</b><span>預けたデザインファイルが<br>学習に使われた（原告の主張）</span></div>
<div class="rx-zone det"><b>検知 · 取り込みの後に働いた</b>利用者の訴えが、集団訴訟として裁判所に届いた</div>
<div class="rx-g g1"><div class="t">2024-08-15</div><b>content training が発効する</b></div>
<div class="rx-g g2"><div class="t">発効後</div><b>既定でオンのチームのコンテンツが学習の対象になる</b></div>
<div class="rx-g g3"><div class="t">2025-11-21</div><b>集団訴訟が提起される</b></div>
<div class="rx-g g4"><div class="t">2026</div><b>係争中。Figma は否認</b></div>
</div>
</figure>

学習への利用が争点になったのは、取り込みの後の訴訟だった。公開されていることと学習への同意が分かれた事案に、[Discord のメッセージのスクレイピング](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/)、[CommonPool の学習データの個人情報](https://lemma.frame00.com/ja/critical/briefs/036-commonpool-training-data-pii/)、[Common Crawl に残った認証情報](https://lemma.frame00.com/ja/critical/briefs/079-common-crawl-training-data-live-secrets/)がある。本件は公開データではなく、契約のもとで預けられた非公開のコンテンツである点で異なる。確認を利用の前に置く方向は、[Sora 2 と日本の IP](https://lemma.frame00.com/ja/critical/briefs/054-sora2-ip-provenance-consent/)（opt-out から opt-in への切り替え）と通じる。

## 4. Lemma でできること

**Lemma は、03 の照合を、預かったコンテンツを学習データに取り込む手前に組み込む。** 既定値や設定画面の状態を取り込みの許可の条件にせず、そのコンテンツに学習への利用の同意が結びついているかを、取り込む前に照合し、記録に残す。

### 注意したい業界・業務

- **業界 · AI**: 顧客から預かったコンテンツを、自社の AI 機能の学習や改善に使う事業者。
- **業務 · 情報の開示・提供**: 預かったコンテンツを、自社や第三者のモデル学習に渡すこと。

### いまの対策と Lemma の違い

今回の経路は、1 列目（預かったコンテンツを学習に取り込む）である。2 列目は取り込んだコンテンツの中身の扱い、3 列目は取り込みの後に、どのコンテンツがどの同意で入ったかを示す場面である。

| 対策 | 預かったコンテンツの学習への取り込み | 取り込んだコンテンツの中身の扱い | 取り込みの後に、同意の範囲を示す |
| --- | --- | --- | --- |
| 管理者の設定（content training のオン／オフ） | 一部 | 関係しない | 一部 |
| 非識別化と機微情報の秘匿 | 関係しない | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 関係しない | 効く |

同社の説明では、管理者の設定はチームや組織の単位で取り込みの対象を決め、後からオフにした場合の効果は以後の新規コンテンツと編集に及ぶ。非識別化と機微情報の秘匿は、取り込んだ後のコンテンツの扱いで、そのコンテンツを学習に使ってよいかは決めない。Lemma は、取り込む前に、そのコンテンツの学習への利用の同意を照合し、どのコンテンツがどの同意の範囲でいつ入ったかを残す。取り込んだコンテンツの中身を加工したり、データを消したりするものではない。

注：Lemma の照合が働くのは、学習データに取り込む手前に照合を組み込み、利用者の同意が、取り込む側の設定とは別に発行・管理されている場合に限る。同意を持つコンテンツは、この照合を通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

預かったコンテンツを AI の学習に使う組織で確認する 3 項目

- 学習への利用の可否を、プランの既定値とは別に、顧客ごとに記録しているか。
- 学習への利用の設定がどうなっているかを、コンテンツを預けた利用者に示しているか。
- 学習への利用を後からオフにされたとき、それ以前に取り込んだコンテンツを辿れるか。

## 5. 事実と時系列

- **対象**: Figma のデザインファイルなどのコンテンツ（デザインファイル、レイヤープロパティ、テキスト、画像）と、それを用いた同社の AI 機能のモデル学習。
- **設定（Figma の公開ドキュメント）**: content training は Starter・Professional で既定でオン、Organization・Enterprise で既定でオフ。Organization・Enterprise は「現時点では有効化できない」とされる。
- **発効日**: 2024-08-15。同社は、管理者がこの日以降にオフへ切り替えた場合、以後の新規コンテンツと編集は学習に用いられないとしている。
- **設定の所在**: チーム／組織の管理者の設定。Starter・Professional ではチーム単位の設定で、個々の利用者は自分のコンテンツについて単独で選べない。
- **第三者ベンダー**: 同社は、処理に関わる第三者ベンダー（OpenAI など）の一覧を公開している。
- **訴訟**: Khan v. Figma, Inc.（米カリフォルニア州北部地区連邦地裁、3:25-cv-10054）。2025-11-21 に提起された集団訴訟。
- **原告の主張**: コンテンツを他の用途に使わないという長年の説明に反して、既定の設定と方針の変更により、顧客のデザインファイルが生成 AI の学習に用いられた。フェアユースの論争を迂回する 4 つの理論を掲げ、中心は契約違反と営業秘密の不正取得。
- **Figma の説明**: 主張を否認し、許諾なく顧客情報をモデル学習に用いることはないとしている。公開ドキュメントでは、コンテンツの非識別化と機微情報の秘匿を行い、モデルが学ぶのは一般的なデザインパターンと Figma 固有の概念・書式で、利用者のコンテンツや着想そのものではないと説明している。

### 時系列

- **2024-08-15**: content training が発効する。Starter・Professional では既定でオン、Organization・Enterprise では既定でオフ。
- **2025-11-21**: Khan v. Figma, Inc.（3:25-cv-10054）が、カリフォルニア州北部地区連邦地裁に提起される。
- **2026-01-01**: カリフォルニア州の AB 2013 が施行される。
- **2026**: 係争中。Figma は主張を否認している。

> 設定の既定値・発効日・設定の所在は、Figma 自身の公開ドキュメント（一次）に拠る。訴訟における事実の記述は原告の主張で、裁判所が認定した事実ではない。Figma はこれを否認している。本 Brief は、当事者の主張の当否や法的責任を判断するものではなく、Figma を責めるものでもない。訴訟の最新の進行は、公開前に確認されたい。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Figma の説明**: 公開ドキュメントで、content training の既定値をプラン別に示し、管理者による切り替えの手順を示している。データの保護として、保存時・転送時の暗号化、アクセス制御、第三者のモデル提供者に自社のモデル学習への利用を禁じること、ベンダーのデータ保存期間の制限を挙げる。Figma for Education・Figma for Government のデータはモデル学習に用いないとしている。
- **訴訟**: 原告は、損害賠償と、AI モデルの使用を恒久的に差し止める命令を求めている。Figma は否認している。
- **法規制**: カリフォルニア州の AB 2013 が 2026-01-01 に施行され、生成 AI の開発者に学習データの出所と内容の公表が義務づけられた。

## 6. Sources

- **Figma（公式ドキュメント・一次）**: “Manage AI settings and content training for your team or organization” — <https://help.figma.com/hc/en-us/articles/17725942479127-Manage-AI-settings-and-content-training-for-your-team-or-organization>
- **Figma（公式・一次）**: “Building Figma AI — Our approach” — <https://www.figma.com/ai/our-approach/>
- **Figma（公式・一次）**: “AI Terms” — <https://www.figma.com/legal/ai-terms/>
- **Bloomberg Law**: “Figma Trained AI on User Data Without Consent, Class Action Says” — <https://news.bloomberglaw.com/litigation/figma-trained-ai-on-user-data-without-consent-class-action-says>
- **Law360（事件記録）**: Khan v. Figma, Inc.（N.D. Cal., 3:25-cv-10054）— <https://www.law360.com/cases/69208e3cd222541266876e83>
- **Davis+Gilbert（AB 2013 施行）**: “AI Legal Updates: California's AI Training Data Transparency Law Takes Effect” — <https://www.dglaw.com/ai-legal-updates-californias-ai-training-data-transparency-law-takes-effect/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
