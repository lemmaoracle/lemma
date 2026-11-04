---
brief_no: 11
title: "SynthID：Google DeepMind の AI 画像の透かしが、統計的な解析だけで剥がされた(Alosh Denny の研究)"
title_en: "SynthID: Google DeepMind's AI-image watermark was stripped by statistical analysis alone (Alosh Denny's research)"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity"]
incident_date: 2026-03-05
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["008-discord-scraping", "005-noroboto-lying-fonts", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: published
gate: "intake"
og_lead_ja: "SynthID：Google DeepMind の AI 画像の透かしを、統計的な解析で約 91% 除去したと研究者が報告（Alosh Denny）"
og_lead_en: "SynthID: a researcher reports removing about 91% of Google DeepMind's AI-image watermark by statistical analysis (Alosh Denny)"
search_title: "SynthID の透かしの除去：研究の報告と対策"
search_description: "研究者 Alosh Denny が、Google DeepMind の AI 画像の透かし SynthID を、2D フーリエ変換と位相の解析だけで約 91% 除去したと報告した。何が通ったか、何を照合するか、対策を整理。"
layout: "report"
sections: "proof"
og_kicker_ja: "AI の研究実証 · 透かしの除去"
og_kicker_en: "AI RESEARCH · WATERMARK REMOVAL"
og_headline_ja: "SynthID の透かしが\n統計的に剥がせると\n研究者が報告。\n<accent>約 91% を除去</accent>"
og_headline_en: "A researcher reports\nSynthID's watermark\ncan be stripped.\n<accent>About 91% removed</accent>"
key_figures:
  - value: "約 91"
    unit: "%"
    label: "除去できた透かしのエネルギーの割合。任意の解像度の Gemini 画像で再現した（Alosh Denny の公開した結果）"
    tone: "alert"
  - value: "123,000"
    unit: "枚"
    label: "平均して透かしの周波数のパターンを取り出すのに使った Gemini 生成画像の数"
  - value: "43.5"
    unit: "dB"
    label: "除去した後の画質（PSNR。SSIM は 0.997）。画質はほぼ保たれた"
glossary:
  - term: "透かし（SynthID）"
    desc: "AI が生成した画像に、目に見えない形で埋め込む印。Google DeepMind の SynthID は Gemini が生成した画像に埋め込み、検出 API で AI 生成かを判定する。"
  - term: "位相シフト攻撃"
    desc: "透かしが置かれた特定の周波数を狙って位相を操作し、印を無効にする手法（Denny の説明）。"
insight:
  slug: "mark-inside-the-artifact"
  label: "成果物の中に埋めた来歴の印"
  quote: "成果物の中に埋めた印は、十分な量を観測すれば剥がすことも付けることもできるので、出どころは、印の有無ではなく、生成元の署名を受け付けの前に照合しない限り分からない。"
industries: ["ai", "media"]
countries: ["global"]
controls:
  - slug: "check-origin"
    item: "成果物の出どころを、埋め込んだ印ではなく、生成元の署名で確認する"
takeaway: "研究者が、SynthID の透かしを統計的な解析だけで約 91% 除去したと報告した。画像の出どころは、埋め込んだ印の有無ではなく、生成元の署名を受け付けの前に照合する。"
self_check: "届いた画像の出どころを、埋め込まれた印とは別に、生成元の署名で照合しているか。"
---

## 1. 要点

研究者は、ニューラルネットも、提供元だけが持つ情報も使わずに、生成画像を大量に平均するだけで、透かしの鍵に当たるパターンを取り出したと報告している。取り出せる以上、逆の操作で、AI で作られていない画像に印を付けることも、同じ原理で成り立ち得る。透かしの検出は、大量のコンテンツを AI 生成らしいかで選り分ける層としては働くが、規制の報告や訴訟で「印が無い＝AI 生成でない」「印が有る＝そのモデルが生成した」と扱う根拠にはならない。<strong>成果物の中に埋めた印は、十分な量を観測すれば剥がすことも付けることもできるので、出どころは、印の有無ではなく、生成元の署名を受け付けの前に照合しない限り分からない。</strong>

## 2. 通った操作

- **通った操作**: Gemini が生成した画像から、SynthID の透かしのエネルギーの約 91% を、画質をほぼ保ったまま取り除く処理。手法・コード・結果は GitHub（`aloshdenny/reverse-SynthID`）で公開された（Alosh Denny の報告）。
- **手法**: SynthID が、固定の搬送周波数を一定の位相で符号化していることを観測し、123,000 枚の Gemini 生成画像のノイズを平均して、透かしの周波数のパターン（鍵に当たるもの）を取り出す。そのうえで、位相シフト攻撃でその周波数を狙い、印を無効にする。ニューラルネットも、提供元だけが持つ情報も使っていない（Denny の説明）。
- **受け付けた側に届くもの**: 一般に、画像を受け取る側に届くのは画像そのものであり、印を剥がされた画像と、もともと印の無い画像は、印の有無からは区別できない。パターンを取り出せる以上、非 AI の画像に印を付ける逆の操作（誤った帰属）も、同じ原理で成り立ち得る。
- **公表されていないこと**: 除去や偽造をした画像が、実際の受け付けの場（モデレーション・規制の報告・訴訟）で通った事例。Google DeepMind の公式の声明（公式のチャネルからは確認できていない）。

## 3. 実行前の照合

経路を問わず区別できる条件は、画像を受け付ける前に、その画像を生成した主体が出した署名を、画像の中の印とは別に照合することである。

- **誰が承認を出すか**: 画像を生成した主体（モデルの提供者・生成のサービス）。生成したときに、署名付きの manifest として、正規の生成元が作ったことを示す。
- **どこで照合するか**: 画像を受け付ける手前。モデレーション、規制の報告、訴訟の資料として扱う前に、生成元の署名を照合する。署名が無い・合わないものは「生成元を確認できない」として扱い、印の有無だけで AI 生成かを決めない。
- **何が残るか**: どの画像を、どの生成元の署名の照合を通して受け付けたかの記録。後から、どの判断が何を根拠にしたかを辿れる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝画像を受け付ける前に、生成元の署名を照合し、記録に残すこと。検知＝画像の中に埋め込んだ印から、後で AI 生成かを判定すること。下の日付は、公開と報道に基づく経過である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>受け付けの前に、画像の外にある生成元の署名を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>透かしのエネルギーの約 91% を除去、<br>画質はほぼ保たれた（Denny の報告）</span></div>
<div class="rx-zone det"><b>検知 · 画像の中の印で判定する</b>SynthID の検出 API が、埋め込んだ印から AI 生成かを判定する</div>
<div class="rx-g g1"><div class="t">2025-12-15</div><b>GitHub のリポジトリを立ち上げ</b></div>
<div class="rx-g g2"><div class="t">2026-03-05</div><b>Medium で手法を公開</b></div>
<div class="rx-g g3"><div class="t">04-11 前後</div><b>Hacker News で議論</b></div>
<div class="rx-g g4"><div class="t">2026-04 以降</div><b>MediaNama などが報道</b></div>
</div>
</figure>

透かしの検出は、AI 生成らしさを大規模に選り分ける層として実務の価値を持ち、本 Brief はその役割を否定しない。ただ、印が画像と同じ信号の中にある限り、印とは別に生成元を照合する層が要る。データの来歴がデータの中身に残らない型の事案に [Discord](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/)（公開 API で集めたメッセージの公開）、AI への入力の真正性が照合されない型の事案に [Noroboto](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/)（フォントの偽装による AI の文書レビューの誤誘導）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、画像を受け付ける手前に置く。** 透かしを検出するのでも、AI 生成らしさを判定するのでもなく、画像が正規の生成元によって作られたかを、画像の外に置いた生成元の署名で、受け付けの前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 画像を生成して外へ出すモデルの提供者と生成のサービス。EU AI Act の透かし・透明性の要件で、AI 生成コンテンツの来歴の示し方が論点になる。
- **業界 · メディア**: 届いた画像の真正性を扱う報道機関とプラットフォーム。AI 生成コンテンツのラベリング・モデレーション・初期選別に透かしを使う。

### いまの対策と Lemma の違い

今回実証された経路は、1 列目（透かしを取り除いた AI 生成画像）である。2 列目は、同じ原理で成り立ち得ると整理される逆の操作で、実際に行われたかは公表されていない。

| 対策 | 透かしを取り除いた AI 生成画像を、AI 生成でないものとして受け付ける | 非 AI の画像に偽って付けた印を、そのモデルの生成として受け付ける | 大量のコンテンツを、AI 生成らしいかで選り分ける |
| --- | --- | --- | --- |
| 透かしと検出 API（SynthID） | 効かない | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 一部 | 効く | 関係しない |

透かしと検出 API は、大規模な初期選別には使えるが、印が画像と同じ信号の中にあるため、取り除かれた印も、偽って付けられた印も、印の有無からは見分けられない。Lemma は、画像の外にある生成元の署名を照合するので、偽って付けた印は署名の照合を通らない。印を取り除いた画像は、署名が無いものとして扱われ、「AI 生成でない」の根拠にはならないが、AI 生成かどうかを Lemma が判定するわけではない。

注：Lemma の照合が働くのは、生成元が生成のときに署名を出し、受け付ける側がモデレーション・報告・審査の手前に照合を組み込んでいる場合に限る。署名を出さない生成元の画像は、照合の対象にならない。署名の鍵は、生成元が成果物の外で管理していることが前提で、鍵が漏れれば通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI 生成のコンテンツを扱う組織で確認する 3 項目

- 透かしの検出 API の結果を、初期選別の目安として扱い、真正性の判断の根拠と分けて定めているか。
- 自社が生成して外へ出す画像に、生成元として署名を付けているか。
- どの画像を、どの根拠で受け付けたかを記録し、後から辿れるか。

## 5. 事実と時系列

- **対象**: Google DeepMind の SynthID。AI が生成した画像に目に見えない透かしを埋め込み、検出 API で AI 生成かを判定する仕組みで、Gemini が生成した画像が対象。
- **実証者**: Alosh Denny（独立の研究者）。
- **公表の形**: 手法・コード・結果を GitHub（`aloshdenny/reverse-SynthID`）で公開。テキストの検出を対象とする `reverse-SynthID-text` もある。Hacker News などの技術コミュニティで議論された。
- **手法**: ニューラルネットも、提供元だけが持つ情報も使わない。123,000 枚の Gemini 生成画像を使い、SynthID が固定の搬送周波数を一定の位相で符号化する性質を観測し、多数の画像を平均して透かしの周波数のパターンを取り出し、位相シフト攻撃でその周波数を狙って無効にする（Denny の説明）。
- **結果**: 透かしのエネルギーの約 91% を除去。画質はほぼ保たれ（PSNR 43.5 dB / SSIM 0.997）、任意の解像度の Gemini 画像で再現した（Denny の公開した結果）。
- **偽造の余地**: 透かしのパターンを取り出せる以上、除去の逆の操作（非 AI の画像への透かしの注入）も、同じ原理で成り立ち得る。
- **性質**: 被害を受けた組織や被害額のある攻撃の事案ではなく、来歴の印の限界を示すセキュリティ研究の実証。

### 時系列

- **2025-12-15**: Alosh Denny が GitHub のリポジトリ `aloshdenny/reverse-SynthID` を非公開で立ち上げ、開発を始める。
- **2026-03-05**: Medium の記事「How to Reverse SynthID (legally😉)」で、手法を公開する。
- **2026-04-11 前後**: Hacker News（item 47709130）で議論が広がる。
- **2026-04 以降**: 同じ手法を踏まえた SynthID の透かしの回避ツールが、一般の媒体でも報じられる（MediaNama など）。
- **2026-08-02**: EU AI Act の、AI 生成コンテンツの透かしの義務（透明性の要件）の適用開始の予定日（本 Brief の公開時点）。

> 本件は、攻撃による侵害ではなく、研究・ラボでの実証として扱う。被害の規模や運用への影響は誇張しない。手法と数値は、Alosh Denny が GitHub と Medium で公開した内容に拠り、各実装の対応状況は時点により異なる。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Google DeepMind**: SynthID は、AI 生成コンテンツの識別を目的とした透かしの技術として提供されている。本件を受けた公式の声明は、公式のチャネル（ブログ・プレスリリース）からは確認できていない。一部の二次報道（techbuzz.ai、stork.ai など）は、The Verge を典拠に、Google が SynthID の侵害の認識を否定したと書くが、典拠の記事を本 Brief では確認できないため、確定した情報としては扱わない。
- **規制の動き**: EU AI Act は、AI 生成コンテンツへの透かし・透明性の要件を 2026-08-02 から適用する予定とされていた。透かしが規制の要件になる局面と、剥がせることや偽って付けられることが実証された局面が重なり、「透かしを義務にすれば来歴が担保される」という前提が問われている。十分な透かしを実装している AI 画像の生成器は一部にとどまるとする学術の報告もある。
- **学術の動き**: 生成コンテンツの透かしへの攻撃の研究は、2025〜2026 年に増えた。UnMarker（USENIX Security 2025）は、防御のための透かしへの汎用の攻撃を初めて示したとされ、arXiv の Warfare（2023）も、透かしの除去・偽造の汎用の枠組みを示している。本件は、その流れの中の具体的な実証に当たる。

## 6. Sources

- **Alosh Denny / reverse-SynthID（GitHub）**: SynthID 透かしの reverse-engineering 手法・実装・結果（phase-shift attack、約 91% 除去、PSNR 43.5 dB / SSIM 0.997）。2026-03 公開。https://github.com/aloshdenny/reverse-SynthID
- **reverse-SynthID-text（GitHub）**: SynthID テキスト検出を対象とする関連実装。https://github.com/aloshdenny/reverse-SynthID-text
- **MediaNama**: "GitHub Tool Bypasses Google SynthID Watermark"（2026-04）— https://www.medianama.com/2026/04/223-google-gemini-synthid-ai-watermark-bypass/
- **arXiv 2310.07726**: Guanlin Lee et al. "Warfare: Breaking the Watermark Protection of AI-Generated Content"（2023-10、2024-03 更新）— 透かし除去・偽造攻撃の汎用フレームワーク（背景文献）。https://arxiv.org/abs/2310.07726
- **ACM CSAI'25**: "Insecure AI Image Watermarking — Is it Really Damaging The Future?"（2025、Proceedings of the 2025 9th International Conference on Computer Science and Artificial Intelligence）— SynthID 等の透かしが除去可能・相互運用性を欠くことを論じた定性研究（背景文献）。https://dl.acm.org/doi/10.1145/3788149.3788154
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
