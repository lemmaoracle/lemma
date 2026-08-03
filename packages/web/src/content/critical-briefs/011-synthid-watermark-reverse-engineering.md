---
brief_no: 11
title: "SynthID 透かしが統計的に剥がされた — 成果物に埋めた来歴印は除去も偽造もされうる（Google DeepMind / Alosh Denny）"
title_en: "SynthID Watermark, Statistically Stripped — a provenance mark that can be removed and forged (Google DeepMind / Alosh Denny)"
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
og_lead_ja: "SynthID 透かしが統計的に剥がされた — 成果物に埋めた来歴印は除去も偽造もされうる"
og_lead_en: "SynthID Watermark, Statistically Stripped — a provenance mark that can be removed and forged"
gap_detected: "透かしと検出 API は、コンテンツを大規模に「AI 生成らしいか」とラベル付けする初期選別としては機能する。"
gap_missing: "来歴の印を成果物そのものに埋め込むため、十分な量を観測すれば統計的に印を剥がすことも、偽って付けることもできてしまう。"
gap_fix: "コンテンツの真偽を判断する前に「この成果物は正規の生成主体によって作られたものか」を、成果物の外側に置いた証明として Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

SynthID — Google DeepMind の AI 画像向け透かし — が、2026 年 3 月、研究者 Alosh Denny によって 2D フーリエ変換と位相コヒーレンス分析だけ（ニューラルネットも専有アクセスも使わず）でリバースエンジニアリングされた。画質をほぼ保ったまま透かしの約 91% を除去でき、同じ原理で非 AI 画像への偽装も成立する。攻撃事案ではなく研究実証だが、成果物に埋め込んだ印は統計的に剥離・偽造されうる構造を示す。

---

## 2. 何が起きたか

- **対象システム**: Google DeepMind SynthID（AI 生成画像に不可視透かしを埋め込み、検出 API で AI 生成か否かを判定する仕組み。Gemini 生成画像が対象）
- **実証者**: Alosh Denny（独立研究者）
- **公表形態**: 手法・コード・結果を GitHub（`aloshdenny/reverse-SynthID`）で公開。テキスト版検出を対象とする `reverse-SynthID-text` も併存。技術コミュニティ（Hacker News 等）で議論
- **時期**: 2026-03-05（公開 disclosure、Medium 「How to Reverse SynthID (legally😉)」公開時点。GitHub 初コミットは 2025-12-15、Hacker News 議論は 2026-04-11 前後）
- **手法**: ニューラルネット不使用・proprietary access 不使用。123,000 枚の Gemini 生成画像を用い、SynthID が固定 carrier 周波数を一定位相で符号化する性質を観測。多数画像を平均して透かしの周波数領域シグネチャ（鍵に相当するパターン）を抽出し、phase-shift attack で当該周波数を狙って無効化
- **結果**: 透かしエネルギーの約 91% を除去、画質はほぼ無損（PSNR 43.5 dB / SSIM 0.997）、任意解像度の Gemini 画像で再現
- **性質**: 攻撃 incident（被害組織・被害額のある事案）ではなく、来歴標識の構造的限界を示すセキュリティ研究の実証

事象は次の連鎖で成立している。

1. **観測（Observation）**: SynthID が画像群に対し固定 carrier 周波数を一定位相で符号化していることを特定。透かしが出力間で一貫しているため、複数画像にわたり共通の周波数領域シグネチャが現れる
2. **鍵抽出（Key extraction）**: 多数の Gemini 生成画像（実証では 123,000 枚）のノイズを平均し、共通パターン＝透かしのシグネチャを分離。proprietary access なしに「鍵に相当するもの」を統計的に復元
3. **除去（Removal）**: phase-shift attack により、透かしが存在する特定周波数を狙って位相を操作し、標識を無効化。画質に視認可能な損傷を与えずに透かしエネルギーの約 91% を除去
4. **偽造可能性（Forging surface）**: 透かしのシグネチャが復元される以上、除去の逆操作——非 AI 生成コンテンツへの透かし注入（misattribution）——も同じ原理で成立し得る。透かしの「有無」が真正性の判定基準である限り、両方向の改ざんが脅威になる
5. **規制との衝突（Regulatory collision）**: 透かしが真正性の制度的根拠（EU AI Act の透明性要件など）として要件化される一方、上記のとおり剥離・偽造が可能なため、「透かしの有無＝来歴の真偽」という前提自体が成立しない

---

## 3. 時系列 — 公表と対応

- 2025-12-15: Alosh Denny が GitHub repo `aloshdenny/reverse-SynthID` を非公開で立ち上げ（dev 開始）
- 2026-03-05: Medium 「How to Reverse SynthID (legally😉)」で reverse-engineering 手法を公開 disclosure
- 2026-04-11 前後: Hacker News（item 47709130）で議論拡大、技術コミュニティ横断で関心が広がる
- 2026-04 以降: 同手法を踏まえた SynthID 透かし bypass ツールの存在が一般メディアでも報道（MediaNama 等）
- 2026-08-02: EU AI Act の AI 生成コンテンツ透かし義務（透明性要件）適用開始予定。透かしが規制要件化する局面と、透かしの剥離可能性が実証された局面が重なる

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。本事案は攻撃 incident ではなく研究・ラボ実証であり、被害規模・運用上の影響を誇張しない。

公表後の対応と業界の動きは次のとおり。

- **Google DeepMind**: SynthID は AI 生成コンテンツの識別を目的とした透かし技術として提供されている。本事案を受けた公式 statement は公式チャネル（blog / press release）から独立に確認できなかった。一部の二次報道（techbuzz.ai、stork.ai 等）は The Verge を典拠として Google が SynthID 侵害認識を否定したと記述するが、典拠記事を本 Brief で独立確認できないため確定情報としては扱わない。透かしの堅牢性をめぐる議論への DeepMind の関与は今後の論点
- **規制動向**: EU AI Act は AI 生成コンテンツへの透かし / 透明性要件を 2026-08-02 から適用予定。透かしが規制上の必須要件になる局面と、透かしの剥離・偽造可能性が実証された局面が重なり、「透かしを義務化すれば来歴が担保される」という前提自体が問われている。AI 画像生成器のうち十分な透かしを実装しているのは一部にとどまるとの学術報告もある
- **学術動向**: 生成コンテンツ向け透かしへの攻撃研究が 2025–2026 年に増加。UnMarker（USENIX Security 2025）は防御的透かしへの汎用攻撃を初めて提示したとされ、本事案はこの流れの中の具体的実証に位置づく

「AI 生成コンテンツの来歴をどの層で担保するか」は、透かしの規制要件化と剥離可能性の実証が同時に進む中で、業界横断の論点として顕在化している。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「来歴標識を成果物そのものに埋め込むこと（embedded provenance marking）」</strong>であり、その標識が成果物と同じ統計的特性を持つために、外部から観測・抽出・除去・偽造され得る。来歴の主張（この画像は AI 生成である / ない）が、それを独立検証する別系統の証明と切り離されている。secondary に `ai-decision-integrity` を併記し、AI 出力の検証可能性（Pillar 02）との straddle を記録する。

本事案は、[Brief 008](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/)（Discord scraping）に続く「攻撃 incident ではない信頼層リスク事象」の事例である（Methodology の射程拡張に基づく）。[Brief 008](https://lemma.frame00.com/ja/critical/briefs/008-discord-scraping/) が公開 API + ToS を通じた訓練データの来歴の問題を扱ったのに対し、本事案は AI 生成 **出力** の来歴標識の問題を扱う。両者は「データ / コンテンツの来歴が、それを検証する独立 layer を欠く」という構造で同根。[Brief 005](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/)（Noroboto、フォント偽装による AI 文書レビューの誤誘導）とも、コンテンツの真正性の主張が独立検証されないという論点で隣接する。前者は AI への入力、本事案は AI からの出力という対称性を持つ。

透かしと、その検出 API は、AI 生成コンテンツのラベリング・コンテンツモデレーション・初期スクリーニングに有用であり、本 Brief がその役割を否定するものではない。大規模に「AI 生成らしさ」を判定する層として、透かしは実務的な価値を持つ。

一方で、透かしは標識を成果物の内部に埋め込む detection 的アプローチであり、標識が成果物と同じ信号空間に存在する以上、十分な観測量があれば統計的に分離・除去・偽造され得る。本事案はその構造を実証した。受信側が「この画像は本当に当該モデルが生成したものか」を判定する基準が透かしの有無である限り、攻撃者は除去（来歴の消去）と注入（来歴の偽造）の双方を行える。規制報告・訴訟・コンテンツ真正性の立証で「透かしが無い ＝ 非 AI 生成」「透かしが有る ＝ 当該モデル生成」と扱うことは、独立した証跡を伴わない。学術側でも汎用的な透かし除去・偽造攻撃（例: USENIX Security 2025 の UnMarker、arXiv の Warfare）が 2023–2026 年に相次いで示されており、本事案は孤立した事例ではない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution / pre-distribution attestation）は、コンテンツの来歴を成果物に埋め込む標識ではなく、生成主体が「この成果物は正規の origin によって生成された」ことを独立検証可能な暗号証明（署名付き manifest や ZK origin proof）として付与し、受信側が proof を検証する設計を採る。proof は成果物の信号空間の外側にあり、統計的平均化で抽出できる「埋め込み標識」ではない。透かし（detection）と暗号的来歴（proof）は代替ではなく **補完** の関係にある（事後の検知では満たせない来歴の独立検証については [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、鍵を渡さずに正当性を立証する設計については [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照）。

本事案で露呈した検出と証明の落差（来歴を成果物に埋め込む標識は、成果物と同じ信号空間に存在するため統計的に剥離・偽造され得る）に対して、Lemma は、コンテンツの来歴を埋め込み標識ではなく、生成主体による独立検証可能な暗号証明として固定する設計を提示している。

- **来歴の暗号証明（origin proof / proof-as-auth）**: 生成主体が「この成果物は正規の origin の下で生成された」ことを、署名付き manifest や ZK origin proof として付与し、受信側が proof を検証する
- **信号空間の外側に置く**: 証明を成果物の信号空間の外側に置き、平均化や周波数操作で抽出できる「鍵」を成果物内に残さない
- **両方向の改ざんに対処**: 標識が剥がされても、非正規コンテンツに偽って付けられても、proof が別系統で「正規の origin か否か」を告げる
- **選択的開示**: 内部情報を出さずに「この成果物は正規の origin の下で生成された」ことだけを最小開示する

検出（事後の透かし判定・モデレーション）は AI 生成らしさのラベリングに、事前証明（来歴の独立検証）はコンテンツ真正性の確立に、それぞれ相補的に働く。設計と適用範囲は、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 6. Sources

- **Alosh Denny / reverse-SynthID（GitHub）**: SynthID 透かしの reverse-engineering 手法・実装・結果（phase-shift attack、約 91% 除去、PSNR 43.5 dB / SSIM 0.997）。2026-03 公開。https://github.com/aloshdenny/reverse-SynthID
- **reverse-SynthID-text（GitHub）**: SynthID テキスト検出を対象とする関連実装。https://github.com/aloshdenny/reverse-SynthID-text
- **MediaNama**: "GitHub Tool Bypasses Google SynthID Watermark"（2026-04）— https://www.medianama.com/2026/04/223-google-gemini-synthid-ai-watermark-bypass/
- **arXiv 2310.07726**: Guanlin Lee et al. "Warfare: Breaking the Watermark Protection of AI-Generated Content"（2023-10、2024-03 更新）— 透かし除去・偽造攻撃の汎用フレームワーク（背景文献）。https://arxiv.org/abs/2310.07726
- **ACM CSAI'25**: "Insecure AI Image Watermarking — Is it Really Damaging The Future?"（2025、Proceedings of the 2025 9th International Conference on Computer Science and Artificial Intelligence）— SynthID 等の透かしが除去可能・相互運用性を欠くことを論じた定性研究（背景文献）。https://dl.acm.org/doi/10.1145/3788149.3788154
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>
