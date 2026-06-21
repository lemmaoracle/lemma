---
brief_no: 5
title: "Noroboto：フォント偽装で AI の文書レビューに別の文章を読ませた — 埋め込みフォントによる入力 integrity の偽装"
title_en: "Noroboto: embedded \"lying fonts\" made AI's document review read different text — input-integrity forgery"
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
gap_detected: "出力側の AI 安全対策（ハルシネーション検出など）は、判断の品質を事後に点検する層として引き続き使える。"
gap_missing: "AI は与えられた文字列を正常に処理してしまうため、判断の前に「AI が読んだ内容は人間が見た内容と同じか」を確かめる層が無かった。"
gap_fix: "AI が判断を下す前に「AI が読んだ入力は、人間が画面で見ている内容と一致している」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Noroboto（Lying Fonts attack）が公開された。文書に細工フォントを埋め込み、Unicode 符号位置と字形の対応をずらすことで、人間が画面で読む文章と AI が抽出する文字列を別物にできる。AI は与えられた入力を正常に推論するため、出力側のハルシネーション検出は発火しにくい。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **攻撃手法名**: Noroboto(Lying Fonts attack)
- **公開**: 2026-05、ドリュー・ミラー氏(Tritium Legal Technologies 創業者、企業法務弁護士・ソフトウェア開発者として 10 年以上の経験)
- **公開先**: Tritium 公式 blog「Noroboto: Lying Fonts and Mitigation in Rust」
- **影響領域**: 契約書レビュー、請求書処理、監査、入札書類確認、その他 AI が文書中身を根拠に判断する全領域
- **実証**: ミラー氏らのテストで一部 AI プラットフォームが誤回答
- **Mitigation**: ミラー氏が Rust 実装の対策コードを公式 blog で公開
- **核心**: 本事案の構造的失敗は、「文書が画面に表示する内容と AI に渡される内容は同一である」という暗黙の前提が独立検証されないまま、改ざんされた入力に対する AI の判断が正規の判断として受理された点にある。

---

## 2. タイムライン

- 2026-05、ミラー氏が Tritium 公式 blog で Noroboto 攻撃と Rust 実装の mitigation を公開
- 2026-05-25、GIGAZINE が日本語で解説、業界横断で AI 文書レビューの入力 integrity 課題として注目
- 2026-05 以降、契約書 / 請求書 / 監査領域での AI 採用組織における入力 integrity 検証要件の議論が並走

> 注: 固有名・攻撃手法は一次（Tritium Legal Technologies 公式 blog の Drew Miller 氏による開示）に基づき、各実装の対応状況は時点により異なるため最新情報を参照のこと。本 Brief は研究者による実証（Lying Fonts attack）として扱い、実環境での被害規模を誇張しない。

---

## 3. 攻撃ベクター

1. **Initial preparation**: 悪意あるフォントを文書(PDF など)に埋め込む。フォントは Unicode 符号位置と字形の対応関係を意図的にずらす(本来「A」の番号に「A」の見た目が対応するところ、別の Unicode 文字に「A」の見た目を割り当てる)
2. **Surface deception**: 文書を人間が画面で開くと、フォントが画面上に「Maryland」「2 億円」「2026-01-01」などの字形を描画する。人間目視では正常に見える
3. **AI extraction divergence**: AI(LLM、文書レビュープラットフォーム等)が文書を読む前段でテキスト抽出を行う際、フォントが指定する Unicode マッピングを参照し、人間が見ている字形とは別の文字列を内部的に得る。例:画面上「Maryland(メリーランド州)」→ AI 内部「Delaware(デラウェア州)」
4. **AI inference on tampered input**: AI は得たテキスト(改ざんされた input)に基づき判断・要約・回答を生成。人間目視で判断する結論と AI が出す結論が乖離する
5. **Targeted partial attack**: 文書全体ではなく一部だけに悪意あるフォントを使うとより深刻。AI は全体異常を検知できず通常のテキスト抽出結果を信じる(人間「2 億円」/ AI「1 億円」のような部分書き換えが有効)

---

## 4. 構造的論点

本事案は、AI 判断において **「文書ファイルが画面に表示する内容と AI に渡される内容は同一である」という暗黙の前提が独立検証されないまま放置されていた** という構造の代表事例である。AI の推論能力(モデル性能)に問題はなく、AI が「何を見ているか」「人間が見ているものと同じか」を独立検証する層が存在しないことが本事案の検出と証明の落差である。

Brief 003(Starlette/BadHost)とは別の primitive(対象が HTTP request の trust ではなく文書テキストの trust)だが、共通する構造は同じ:**信頼の assertion が、それを検証する layer と切り離されている**。Brief 001 / 002 / 004 が扱う「メッセージ origin の独立検証」「commit origin の独立検証」と隣接する構造を持ち、本事案では入力データの origin / integrity が独立検証されないことが gap として露呈している。

---

## 5. 検出と証明の落差

従来の検出側 AI 安全対策は、AI の出力フィルタリング(ハルシネーション検出、根拠不在の判断検出、有害コンテンツ検出など)に集中している。本事案ではこれらが機能しにくい。AI は与えられた入力(「Delaware」と書かれたテキスト)に対して正常に推論しており、出力レベルでは異常が検知されにくいためである。

検出層は AI 判断品質の事後評価には引き続き重要であり、その役割を本 Brief が否定するものではない。一方で、入力の integrity が侵害された状態での AI 判断の正確性は、検出層の射程外にある層として独立して存在する。

事前証明(pre-execution attestation)は、AI が判断を生成する前に、AI が見ている入力データと「人間目視で見えるべき」入力データの同一性を独立に commit する構造を採る。文書を AI に渡す前のテキスト抽出 layer に、フォント解釈の独立検証(ミラー氏が提案する OCR ベースの再検証、または Unicode と表示字形の対応 audit)を組み込むことで、入力の integrity を AI 判断の前段で保証する。判断後の検出と判断前の入力 attestation は **代替ではなく補完** の関係にあり、両層の組み合わせで AI 文書レビューの trust boundary が確立される。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **Tritium Legal Technologies**(ミラー氏): Rust 実装の Mitigation コードを公式 blog で公開。具体的な対策として「埋め込みフォントを無条件に信用しない」「フォントで英数字を描画して OCR で読み取り期待文字列との一致確認」「人間目視で見える文章・文書ファイル内 Unicode 文字列・AI が実際に処理する文章の 3 つの事前一致検証」を提案
- **AI 文書レビュープラットフォーム各社**: 本事案に対する個別 mitigation は公開時点で限定的(攻撃公開直後)。今後、契約書レビュー / 請求書処理 / 監査ツール各社の対応が業界横断で進む見込み
- **業界横断の論点**: 契約書 / 請求書 / 監査領域での AI 採用が拡大する中、AI 判断の入力 integrity 検証が新たな必須要件として浮上。法律事務所、会計監査法人、金融機関の AI 文書レビュー実務に対する影響が大きい

---

## 7. Lemma による分析

Lemma の設計は、AI 判断の入力 integrity が独立検証されないという本事案の gap に対し、判断の前段で入力の同一性を proof として固定する点で対置される。

- **入力 integrity の来歴バインド**: AI が判断に使用する入力データを独立検証可能な暗号証明として commit し、「AI が見ている入力」と「人間目視で見えるべき入力」の同一性を固定する。
- **判断前の入力 attestation(proof-as-auth)**: AI が推論を生成する前に入力の同一性を検証する設計であり、出力フィルタリングではなく入力の前段で trust boundary を確立する。
- **表示層からの独立**: 入力フォントが偽装された状態でも、proof は別系統で「この AI 判断はこの入力に基づいている / その入力は人間目視のものと一致する / していない」を verifier に告げる。
- **検出との補完**: 出力側のハルシネーション検出と、入力の前段で同一性を固定する attestation は、対立軸ではなく二段構成として機能する。

これは AI が「何を見ているか」を別系統で証明する設計思想であり、出力側の検出層を置き換えるものではなく補完する。

設計と適用範囲は、[Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **Tritium Legal Technologies official blog**: "Noroboto: Lying Fonts and Mitigation in Rust" by Drew Miller(2026-05、公式 blog、Rust 実装 mitigation コード公開を含む)— https://tritium.legal/blog/noroboto
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
