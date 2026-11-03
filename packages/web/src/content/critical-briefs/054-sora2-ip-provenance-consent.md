---
brief_no: 54
title: "OpenAI Sora 2：著作権のあるキャラクターを、権利者が拒否しない限り生成できる方針で公開した(CODA・日本政府が要請)"
title_en: "OpenAI Sora 2: Launched with a policy letting copyrighted characters be generated unless the rightsholder opted out (CODA and the Japanese government made requests)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["training-data-provenance", "attribute-proof-bypass"]
incident_date: 2025-10-15
published: 2026-06-13
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["008-discord-scraping", "036-commonpool-training-data-pii", "011-synthid-watermark-reverse-engineering", "053-youtube-deepfake-likeness-provenance"]
status: published
gate: "agent-operation"
version: "1.0"
og_lead_ja: "OpenAI Sora 2：権利者が拒否しない限り著作権キャラを生成できる方針で公開し、約 3 日で事前許諾へ改めると表明した"
og_lead_en: "OpenAI Sora 2: launched letting copyrighted characters be generated unless rightsholders opted out, then announced a move to opt-in within about three days"
search_title: "Sora 2 の著作権キャラ問題：CODA・政府の要請と対策"
search_description: "OpenAI は Sora 2 を、権利者が拒否しない限り著作権キャラを生成できる方針で公開し、約 3 日で事前許諾へ改めると表明した。CODA と日本政府も要請。何が通ったか、何を照合するか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "生成 AI の事例 · 著作権と許諾"
og_kicker_en: "GENERATIVE AI · COPYRIGHT CONSENT"
og_headline_ja: "Sora 2 は著作権キャラを\n権利者が拒否しない限り\n生成できる方針で公開。\n<accent>約 3 日で事前許諾へ</accent>"
og_headline_en: "Sora 2 let users make\ncopyrighted characters\nunless owners opted out.\n<accent>Opt-in within ~3 days</accent>"
key_figures:
  - value: "約 3"
    unit: "日"
    label: "公開から、著作権キャラの生成を事前許諾（opt-in）の方式へ移すと表明するまで（OpenAI の表明と報道）"
    tone: "alert"
  - value: "opt-out → opt-in"
    label: "公開当初の「拒否しない限り生成できる」方針から、「あらかじめ許諾を要する」方式へ（OpenAI の表明）"
  - value: "10-16 → 10-23"
    label: "日本政府が OpenAI に、事前に権利者の許諾を求めるよう正式に要請した時期（2025 年・報道）"
glossary:
  - term: "opt-out（事後の拒否）"
    desc: "権利者が自分から拒否を申し出ない限り、使ってよいとする方式。Sora 2 の公開当初の方針。"
  - term: "opt-in（事前の許諾）"
    desc: "権利者があらかじめ許諾したものだけを使う方式。OpenAI が公開から約 3 日で移すと表明した。"
  - term: "CODA"
    desc: "コンテンツ海外流通促進機構（Content Overseas Distribution Association）。スタジオジブリ・バンダイナムコ・東映アニメーションなどが加わる。"
insight:
  slug: "not-refused-is-not-permitted"
  label: "拒否されていないことと、許諾されていること"
  quote: "「拒否されていない」ことは「許諾されている」ことではないので、著作物を使う生成は、生成の前に許諾の記録を照合しない限り、許諾の無いものも生成され、拡散の後にしか問えない。"
industries: ["media", "ai"]
controls:
  - slug: "hold-unverified"
    item: "権利者の許諾を確認するまで、著作権キャラを生成しない"
takeaway: "OpenAI は Sora 2 を、権利者が拒否しない限り著作権キャラを生成できる方針で公開し、約 3 日で事前許諾へ改めると表明した。著作物を使う生成の前に、権利者の許諾を照合する。"
self_check: "著作物や他人の素材を使って生成する前に、権利者の許諾があることを照合しているか。"
countries: ["us", "jp"]
---

## 1. 要点

公開当初の方針は、許諾の確認を生成の前ではなく、権利者が後から拒否を申し出ることに任せていた。公開直後から、著名な著作物のキャラクターを含む動画が生成されて SNS で広がり、MPA やアーティストの批判、CODA と日本政府の要請が続いた。出力ごとの違反の判定や権利者の異議は、生成と拡散の後に働き、広がった出力を回収するところまでは届かない。<strong>「拒否されていない」ことは「許諾されている」ことではないので、著作物を使う生成は、生成の前に許諾の記録を照合しない限り、許諾の無いものも生成され、拡散の後にしか問えない。</strong>

## 2. 通った操作

- **通った操作**: 権利者が明示的に拒否（opt-out）していない著作権キャラクターを含む動画の生成。公開直後から、Pikachu・SpongeBob・South Park の全編風などが容易に生成された（報道）。
- **受け付けた側に届くもの**: 一般に、opt-out の方式では、生成の条件は「拒否の申し出が無い」ことで、権利者の許諾があることではない。生成の時点で、どの素材を、どの許諾で使ったかは、出力からは分からない。
- **CODA の指摘**: 学習の過程での複製が著作権侵害になり得るとし、One Piece・鬼滅の刃・ポケモン・マリオなどに酷似する出力を問題視した。opt-out の方式は同意の負担を逆転させ、日本の著作権の原則（事前の許諾）に反すると指摘した（CODA）。
- **公表されていないこと**: 学習データの具体的な構成と、個別の許諾の状況。

## 3. 何を照合するか

経路を問わず区別できる条件は、著作物を使って生成する前に、その素材について、この用途への権利者の許諾があるかを、拒否の申し出の有無とは別に照合することである。

- **誰が承認を出すか**: 素材の権利者。どの作品・キャラクターを、どの用途に使ってよいかを、許諾として示す。
- **どこで照合するか**: 生成のサービスが生成を実行する手前。著作物を使う生成は、許諾の記録と照合し、許諾が無い・用途が合わないものは生成しない。
- **何が残るか**: どの生成を、どの権利者の、どの許諾の照合を通して実行したかの記録。権利者や当局から異議を受けたときに、どの生成が何に基づいたかを辿れる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝生成の前に、素材についての権利者の許諾を照合し、記録に残すこと。検知＝生成と拡散の後に、出力の違反や権利者の異議で見つけること。下の日付は、表明と報道に基づく経過である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>生成の前に、素材についての権利者の許諾を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>著作権キャラを含む動画が、<br>公開直後から SNS で拡散した</span></div>
<div class="rx-zone det"><b>検知 · 生成と拡散の後に働いた</b>出力の違反の判定と、権利者・業界・政府の異議</div>
<div class="rx-g g1"><div class="t">09 下旬〜10 上旬</div><b>opt-out の方針で公開</b></div>
<div class="rx-g g2"><div class="t">公開から約 3 日</div><b>opt-in への移行を表明</b></div>
<div class="rx-g g3"><div class="t">10-15 前後</div><b>CODA が要求</b></div>
<div class="rx-g g4"><div class="t">10-16〜23</div><b>日本政府が要請</b></div>
</div>
</figure>

出力ごとの違反の判定と権利者の異議の窓口は、被害の把握と是正に要る対応で、本 Brief はその役割を否定しない。ただ、許諾の確認が生成の後に置かれる限り、対応は拡散の後になる。公開されていることが、学習や生成に使ってよいことを意味しない型の事案に [Discord](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/)（公開 API で集めたメッセージの公開）、肖像の来歴が生成・公開の前に照合されない型の事案に [YouTube](https://lemma.frame00.com/ja/critical/briefs/053-youtube-deepfake-likeness-provenance/)（著名人を装った合成動画の広告）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、生成のサービスが生成を実行する手前に置く。** 出力が著作物に似ているかを判定するのではなく、生成に使う素材について、この用途への権利者の許諾があるかを、生成の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 画像・動画を生成するサービスの提供者。生成の既定を「拒否が無ければ使う」とするか「許諾があるものだけ使う」とするかが、権利者・業界団体・政府との論点になる。
- **業界 · メディア**: 作品とキャラクターの権利を持つスタジオ・出版社・ゲーム会社と、生成 AI で作った画像・動画を使う制作の現場。事前の許諾を原則とする法域では、opt-out で足りるかが問われる。

### いまの対策と Lemma の違い

今回の経路は、1 列目（権利者が拒否を申し出ていない著作権キャラの生成）である。

| 対策 | 権利者が拒否を申し出ていない著作権キャラを生成する | 権利者が拒否を申し出た著作権キャラを生成する | 生成済みの動画が SNS で拡散する |
| --- | --- | --- | --- |
| 権利者の拒否の申し出（opt-out） | 効かない | 一部 | 関係しない |
| 出力ごとのコンテンツ違反の判定 | 一部 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 一部 | 一部 | 関係しない |

opt-out の申し出は、申し出た権利者の作品にしか働かず、申し出ていない作品の生成は既定で通る。出力ごとの違反の判定は、既知の保護対象に似た出力を止めるが、判定の対象は生成の結果で、許諾の有無ではない。Lemma は、「拒否が無い」ではなく「許諾がある」ことを生成の条件にするので、申し出の有無にかかわらず、許諾の記録が無い素材の生成を止める。どの素材を使う生成かを特定できる範囲で働き、生成済みの動画の拡散を止めたり、消したりはしない。

注：Lemma の照合が働くのは、生成のサービスが、生成を実行する手前に照合を組み込み、権利者が許諾を記録として出している場合に限る。自由な指示文から、出力が特定のキャラクターに似るかを判断するのは Lemma の役目ではなく、使う素材を特定できない生成は照合を通り抜けうる。許諾の記録の鍵が漏れれば通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

生成 AI で著作物を扱う組織で確認する 3 項目

- 生成のサービスの既定は、許諾がある素材だけを使う形になっているか。
- 権利者からの許諾を、作品・用途・期間と結び付けて記録しているか。
- どの生成を、どの許諾に基づいて実行したかを記録し、異議を受けたときに辿れるか。

## 5. 事実と時系列

- **対象**: OpenAI の動画生成 AI「Sora 2」と、その権利管理の方針（公開当初は opt-out）。
- **公開当初の方針**: 権利者が明示的に拒否（opt-out）しない限り、著作権キャラクターを含む動画を生成できる方針だった。公開直後から、Pikachu・SpongeBob・South Park の全編風など、著名な著作物が容易に生成された。
- **批判**: 著作権キャラの動画が公開直後から拡散し、米国の Motion Picture Association（MPA）やアーティストを含む広い批判が出た。
- **方針の変更**: OpenAI は公開から約 3 日で、著作権キャラの生成にはあらかじめ許諾を要する事前許諾（opt-in）の方式へ移すと表明した。Sam Altman は、権利者へのより細かな制御と、opt-in した権利者との収益分配にも言及した。Family Guy・South Park などのキャラは以後コンテンツ違反となり、Martin Luther King Jr. など、遺族の異議を受けて特定の人物の生成も停止された。
- **CODA の要求**: CODA（スタジオジブリ・バンダイナムコ・東映アニメーションなどを含む）は、学習への無断使用の停止を求めた。学習の過程での複製が著作権侵害になり得るとし、One Piece・鬼滅の刃・ポケモン・マリオなどに酷似する出力を問題視し、opt-out の方式は日本の著作権の原則（事前の許諾）に反すると指摘した。
- **日本政府の要請**: 日本政府は OpenAI に、著作権侵害となり得る行為を控え、事前に権利者の許諾を求めるよう正式に要請した。

### 時系列

- **2025-09 下旬〜10 上旬**: OpenAI が Sora 2 を opt-out の方針で公開する。公開直後から著作権キャラを含む動画が SNS で広がり、MPA・アーティストなどから批判が出る。
- **2025-10（公開から約 3 日）**: OpenAI が、著作権キャラについて opt-in（事前許諾）の方式へ移すと表明し、収益分配に言及する。特定の人物（MLK Jr. など）の生成も、遺族の異議を受けて停止される。
- **2025-10-15 前後**: CODA が、学習への無断使用の停止を求める。
- **2025-10-16〜23**: 日本政府が OpenAI に、事前に権利者の許諾を求めるよう正式に要請する。

> 「opt-out から opt-in への変更」と「特定の人物の生成の停止」は、OpenAI の表明と国際報道に拠る。学習データの具体的な構成と個別の許諾の状況は公開された情報が限られ、本文では断定しない。日本の著作権法の解釈と侵害の最終の判断は、権利者・当局・司法に委ねられる。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **OpenAI**: 公開当初の opt-out の方針を、約 3 日で著作権キャラの opt-in（事前許諾）の方式へ改めると表明した。権利者へのより細かな制御と、opt-in した権利者との収益分配に言及し、特定の人物の生成も停止した。
- **CODA・日本政府**: CODA は学習への無断使用の停止を求め、opt-out が事前の許諾の原則に反すると指摘した。日本政府は OpenAI に、事前に権利者の許諾を求めるよう正式に要請した。
- **MPA**: 米国の MPA も、opt-out の方針を批判した。

## 6. Sources

- **The Register**: "Japan asks OpenAI to keep Sora 2's hands off anime IP"（2025-10-15、CODA・日本政府の要請・著作権キャラの拡散） — <https://www.theregister.com/2025/10/15/japan_openai_copyrighted_anime/>
- **Copyright Lately**: "Sora, Not Sorry: OpenAI Backtracks on Opt-Out Copyright Policy"（opt-out→opt-in 反転・特定生成の停止・収益分配の言及） — <https://copyrightlately.com/openai-backtracks-sora-opt-out-copyright-policy/>
- **EU IP Helpdesk (European Commission)**: "Japanese government requests OpenAI avoid copyright infringement (Sora 2)"（2025-10-23、日本政府の正式要請） — <https://intellectual-property-helpdesk.ec.europa.eu/news-events/news/japanese-government-requests-openai-avoid-copyright-infringement-sora-2-us-federal-judge-dismisses-2025-10-23_en>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
