---
brief_no: 5
title: "Noroboto 攻撃 — フォント偽装による AI 文書レビューの入力完全性の偽装"
title_en: "Noroboto Attack — AI Document Review Input-Integrity Forgery via Embedded Lying Fonts"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["data-provenance"]
incident_date: 2026-05-25
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["003-starlette-badhost", "017-mckinsey-lilli-system-prompts", "019-construction-engineer-qualification-fraud"]
version: "1.0"
status: published
og_lead_ja: "埋め込みフォント偽装で AI 文書レビューの入力を改ざん — Noroboto 攻撃"
og_lead_en: "Embedded font forgery silently rewrote what the AI read — Noroboto attack"
---

## TL;DR

2026 年 5 月、Tritium Legal Technologies 創業者ドリュー・ミラー氏が「Noroboto」攻撃手法を公開した。文書に埋め込まれた悪意あるフォントが Unicode 符号位置と字形の対応関係を意図的にずらすことで、人間が画面上で読む文章と AI が内部処理する文字列を意図的に乖離させる。契約書中の準拠法・金額・日付など意味が大きく変わる箇所で悪用された場合、AI 文書レビューが行う判断と人間が想定する判断が齟齬する構造になる。攻撃の核心は AI 推論能力ではなく AI が文書を読む前段のテキスト抽出処理にあり、AI 文書レビューが暗黙に前提していた「人間目視 = AI 解釈」の同一性が破壊される。本事案は AI 判断の入力 integrity 検証が独立した層として存在しないことを露呈した代表事例である。

---

## 1. 事案概要

- **攻撃手法名**: Noroboto(Lying Fonts attack)
- **公開**: 2026-05、ドリュー・ミラー氏(Tritium Legal Technologies 創業者、企業法務弁護士・ソフトウェア開発者として 10 年以上の経験)
- **公開先**: Tritium 公式 blog「Noroboto: Lying Fonts and Mitigation in Rust」
- **影響領域**: 契約書レビュー、請求書処理、監査、入札書類確認、その他 AI が文書中身を根拠に判断する全領域
- **実証**: ミラー氏らのテストで一部 AI プラットフォームが誤回答
- **Mitigation**: ミラー氏が Rust 実装の対策コードを公式 blog で公開

---

## 2. タイムライン

- 2026-05、ミラー氏が Tritium 公式 blog で Noroboto 攻撃と Rust 実装の mitigation を公開
- 2026-05-25、GIGAZINE が日本語で解説、業界横断で AI 文書レビューの入力 integrity 課題として注目
- 2026-05 以降、契約書 / 請求書 / 監査領域での AI 採用組織における入力 integrity 検証要件の議論が並走

---

## 3. 攻撃ベクター

1. **Initial preparation**: 悪意あるフォントを文書(PDF など)に埋め込む。フォントは Unicode 符号位置と字形の対応関係を意図的にずらす(本来「A」の番号に「A」の見た目が対応するところ、別の Unicode 文字に「A」の見た目を割り当てる)
2. **Surface deception**: 文書を人間が画面で開くと、フォントが画面上に「Maryland」「2 億円」「2026-01-01」などの字形を描画する。人間目視では正常に見える
3. **AI extraction divergence**: AI(LLM、文書レビュープラットフォーム等)が文書を読む前段でテキスト抽出を行う際、フォントが指定する Unicode マッピングを参照し、人間が見ている字形とは別の文字列を内部的に得る。例:画面上「Maryland(メリーランド州)」→ AI 内部「Delaware(デラウェア州)」
4. **AI inference on tampered input**: AI は得たテキスト(改ざんされた input)に基づき判断・要約・回答を生成。人間目視で判断する結論と AI が出す結論が乖離する
5. **Targeted partial attack**: 文書全体ではなく一部だけに悪意あるフォントを使うとより深刻。AI は全体異常を検知できず通常のテキスト抽出結果を信じる(人間「2 億円」/ AI「1 億円」のような部分書き換えが有効)

---

## 4. 構造的論点

本事案は、AI 判断において **「文書ファイルが画面に表示する内容と AI に渡される内容は同一である」という暗黙の前提が独立検証されないまま放置されていた** という構造の代表事例である。AI の推論能力(モデル性能)に問題はなく、AI が「何を見ているか」「人間が見ているものと同じか」を独立検証する層が存在しないことが本事案の構造的 gap である。

Brief 003(Starlette/BadHost)とは別の primitive(対象が HTTP request の trust ではなく文書テキストの trust)だが、共通する構造は同じ:**信頼の assertion が、それを検証する layer と切り離されている**。Brief 001 / 002 / 004 が扱う「メッセージ origin の独立検証」「commit origin の独立検証」と隣接する構造を持ち、本事案では入力データの origin / integrity が独立検証されないことが gap として露呈している。

---

## 5. Detection 層では届かない構造的 gap

従来の検出側 AI 安全対策は、AI の出力フィルタリング(ハルシネーション検出、根拠不在の判断検出、有害コンテンツ検出など)に集中している。本事案ではこれらが機能しにくい。AI は与えられた入力(「Delaware」と書かれたテキスト)に対して正常に推論しており、出力レベルでは異常が検知されにくいためである。

検出層は AI 判断品質の事後評価には引き続き重要であり、その役割を本 Brief が否定するものではない。一方で、入力の integrity が侵害された状態での AI 判断の正確性は、検出層の射程外にある層として独立して存在する。

事前証明(pre-execution attestation)は、AI が判断を生成する前に、AI が見ている入力データと「人間目視で見えるべき」入力データの同一性を独立に commit する構造を採る。文書を AI に渡す前のテキスト抽出 layer に、フォント解釈の独立検証(ミラー氏が提案する OCR ベースの再検証、または Unicode と表示字形の対応 audit)を組み込むことで、入力の integrity を AI 判断の前段で保証する。判断後の検出と判断前の入力 attestation は **代替ではなく補完** の関係にあり、両層の組み合わせで AI 文書レビューの trust boundary が確立される(検出と事前証明の関係についての詳細な議論は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(Lemma、2026-05)を参照)。

---

## 6. 対応経緯と業界動向

- **Tritium Legal Technologies**(ミラー氏): Rust 実装の Mitigation コードを公式 blog で公開。具体的な対策として「埋め込みフォントを無条件に信用しない」「フォントで英数字を描画して OCR で読み取り期待文字列との一致確認」「人間目視で見える文章・文書ファイル内 Unicode 文字列・AI が実際に処理する文章の 3 つの事前一致検証」を提案
- **AI 文書レビュープラットフォーム各社**: 本事案に対する個別 mitigation は公開時点で限定的(攻撃公開直後)。今後、契約書レビュー / 請求書処理 / 監査ツール各社の対応が業界横断で進む見込み
- **業界横断の論点**: 契約書 / 請求書 / 監査領域での AI 採用が拡大する中、AI 判断の入力 integrity 検証が新たな必須要件として浮上。法律事務所、会計監査法人、金融機関の AI 文書レビュー実務に対する影響が大きい

---

## 7. Lemma による分析

本事案で露呈した構造的 gap(AI 判断の入力 integrity が独立検証されない)に対して、Lemma は、AI が判断に使用する入力データを独立検証可能な暗号証明として commit し、verifier が「AI が見ている入力」と「人間目視で見えるべき入力」の同一性を独立に検証できる設計を提示している。入力フォントが偽装された状態でも、proof は別系統で「この AI 判断はこの入力に基づいている / その入力は人間目視のものと一致する / していない」を verifier に告げる構造である。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)(Lemma、2026-05)、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)(GitHub)を参照のこと。

---

## 8. Sources

- **Tritium Legal Technologies official blog**: "Noroboto: Lying Fonts and Mitigation in Rust" by Drew Miller(2026-05、公式 blog、Rust 実装 mitigation コード公開を含む)— https://tritium.legal/blog/noroboto
