---
brief_no: 23
title: "Bartz v. Anthropic — 海賊版書籍の学習利用と 15 億ドル和解"
title_en: "Bartz v. Anthropic — Pirated Books in Model Training and the $1.5B Settlement"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance"]
incident_date: 2025-06-23
published: 2026-06-04
authors: ["Lemma Critical Team"]
related_briefs: ["008-discord-scraping", "011-synthid-watermark-reverse-engineering", "022-onlyfake-ai-id-kyc-bypass"]
version: "1.0"
status: draft
og_lead_ja: "学習データの取得来歴が fair use の成否を分けた"
og_lead_en: "Where training data came from decided fair use"
---

## TL;DR

2025 年 6 月 23 日、米カリフォルニア北部地区連邦地裁の William Alsup 判事は、作家らが Anthropic を訴えた Bartz v. Anthropic において、AI 学習と著作権をめぐる初の本格的な fair use 判断を示した。判決は同じ「書籍で LLM を学習する」行為を、データの取得来歴で 3 つに切り分けた。適法に購入した書籍による学習は「本質的に変容的 (quintessentially transformative)」で fair use（この部分の原告請求は却下）。購入した紙書籍を裁断・スキャンしてデジタル化する行為も fair use。一方、LibGen・PiLiMi などのシャドーライブラリから取得した 700 万冊超の海賊版書籍を恒久的な社内ライブラリとして保持した行為は fair use ではないとされた。この判断を受け、2025 年 9 月、Anthropic は約 50 万作品を対象に総額 15 億ドル（1 作品あたり約 3,000 ドル）の和解に合意した。米国著作権史上最大の和解であり、和解条件には不正取得ファイルの破棄義務が含まれる（責任を認めない合意）。学習という利用行為の適法性が、モデルでも出力でもなく、データがどこから来たかという来歴で分かれた。本 Brief は、学習データの取得来歴が証明可能な形で管理されていない場合に、事後に遡及検証コストと法的責任として顕在化する構造を扱う。

学習できた ≠ 適法に取得した

---

## 1. 事案概要

- **訴訟**: Bartz et al. v. Anthropic PBC（N.D. Cal., 3:24-cv-05417）。作家 Andrea Bartz 氏らが 2024 年 8 月に提訴
- **争点**: 書籍を LLM（Claude）の学習に用いた行為が fair use にあたるか
- **判断（2025-06-23、部分的サマリージャッジメント）**:
  - 適法取得した書籍による学習 → **fair use**（「本質的に変容的」。この部分の原告 3 名の請求は却下）
  - 購入済み紙書籍の裁断・スキャンによるデジタル化（フォーマット変換） → **fair use**
  - シャドーライブラリ（LibGen・PiLiMi 等）から取得した 700 万冊超の海賊版コピーの恒久保持 → **fair use ではない**（訴訟継続 → 和解へ）
- **和解**: 2025-09、総額 15 億ドル（最少額）。対象は海賊版 700 万冊のうちクラス要件を満たす約 50 万作品、1 作品あたり約 3,000 ドル。米国著作権史上最大の和解額
- **和解条件**: 不正取得ファイルの破棄義務を含む。支払いは 4 回分割（2025-10〜2027-09）。責任を認めない合意（no admission of liability）
- **手続の現況**: 予備承認済み。クレーム提出期限 2026-03-30（終了。クラスの約 93% がクレームと報告）。最終承認のための公正性審問は 2026-05-14 に実施（最終承認決定の公表は本ドラフト時点で未確認）

---

## 2. タイムライン

- 2024-08: 作家らが Anthropic を提訴（N.D. Cal.）
- 2025-06-23: Alsup 判事、fair use に関する部分的サマリージャッジメント。学習・フォーマット変換は fair use、海賊版コピーの取得・保持は fair use ではないと切り分け
- 2025-07 以降: 海賊版ライブラリ関連の請求についてクラス認証、12 月のトライアルに向けた手続が進行
- 2025-09: 総額 15 億ドルの和解合意が公表
- 2025 秋: 裁判所による予備承認、クレーム手続開始。和解金の分割払い開始（2025-10〜2027-09 の 4 回）
- 2026-03-30: クレーム提出期限（終了。クラスの約 93% がクレーム）
- 2026-05-14: 最終承認のための公正性審問が実施（最終承認決定の公表は本ドラフト時点で未確認）

---

## 3. 取得から係争までの経路

本事象は外部攻撃ではなく、学習データの来歴が証明可能な形で管理されない取得構造に起因する。失敗が係争へ伝播する経路は以下の通り。

1. **取得**: 学習コーパスの構築にあたり、適法に購入・スキャンした書籍と、シャドーライブラリ由来の海賊版コピーが、同じ「社内ライブラリ」に混在して取り込まれる
2. **来歴の不可視化**: 取り込み後のコーパスにおいて、各作品が「どの経路で・どのライセンス状態で」取得されたかは、学習パイプラインの外側の管理情報にのみ依存する。学習行為そのものは取得経路を区別しない
3. **学習・製品化**: コーパス全体がモデル学習に使われ、製品として展開される。この時点で取得来歴の差は、外形上いっさい現れない
4. **発覚と遡及検証**: 提訴・discovery によって取得経路が初めて法的争点として可視化される。「どの作品が・どの経路で取得されたか」の遡及的な特定と立証が、当事者双方にとって巨大なコストになる
5. **影響の確定**: 同じ学習行為でも、来歴が適法なら fair use、海賊版なら侵害という形で帰結が分岐し、本件では 15 億ドルの和解として確定した

---

## 4. 構造的論点

本事象は、データの利用の適法性が、利用行為ではなく取得来歴で決まることを司法が明確に示した代表例である。判決は「学習は変容的か」という問いと「コピーはどこから来たか」という問いを切り分け、後者が独立に帰結を支配した。学習データの来歴が、取得の時点で証明可能な形に固定されていない限り、組織は「学習できている」ことと「適法に取得した」ことの乖離を、係争まで可視化できない。

同じ学習、異なる来歴、異なる帰結

本件で特筆すべきは、来歴が貨幣化されたことである。同じ学習行為でも、来歴の差が 1 作品あたり約 3,000 ドルという形で値付けされ、さらに来歴が不適法なファイルには破棄義務という形で「資産からの除去」まで求められた。来歴は、コンプライアンスの注記ではなく、データ資産の価値とリスクを直接決定する変数になった。

Brief 008（Discord 20.5 億メッセージ scraping）が扱った「公開データの再配布で学習コーパス化される」構造と同じ Training Data Provenance の primitive に属するが、本件は来歴の差が法的帰結と金額として確定した点で、このカテゴリの anchor となる。AI 生成コンテンツの来歴標識を扱った Brief 011（SynthID）とは、コンテンツの「入口（学習データ）」と「出口（生成物）」で対をなす。

---

## 5. Detection 層では届かない構造的 gap

本事象では、訴訟手続と discovery という事後の検証系列が機能し、取得経路の差異が法廷で立証可能な形に整理された。データセット監査・コーパス由来調査などの検出層も、発覚後の範囲特定に不可欠であり、本 Brief が否定するものではない。

一方で、事後の監査・discovery は「取得の時点で、そのコピーが適法な経路で入手されたか」を変えることはできない。学習と製品展開はすでに行われており、遡及的な特定・立証のコストは作品数に比例して膨張する。本件で対象の切り分けに要した手続自体が、来歴の事後復元がいかに高コストかを示している。事後の調査記録は、「取得時点で適法だった」ことを独立に立証する材料には直接ならない。これは検出層の射程外にある、構造的に独立した層の gap である。

現状、学習データの運用モデル全体において、取得時点での来歴の固定は、まだ独立した層として扱われていない。事前証明 (pre-execution attestation) は、取得・取り込みの経路に来歴証明を 1 段挟むことで、この gap を埋める。事前証明は事後の監査に対する代替ではなく補完であり、両層の組み合わせで学習コーパスの trust boundary が確立される（検出と事前証明の関係についての詳細は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照）。

---

## 6. 対応経緯と業界動向

- **司法**: 学習の変容性と取得来歴の適法性を切り分ける枠組みが、AI × 著作権訴訟の参照点になった。同種の訴訟が音楽・報道・画像の各分野で係属しており、来歴による切り分けが共通の争点として広がっている
- **AI 事業者**: 適法取得（購入・ライセンス契約・権利処理済みデータセット）への調達シフトと、コーパスの取得記録管理の強化が進む。出版社・権利者とのライセンス契約の公表が相次ぐ
- **権利者側**: クレーム手続を通じて、自作品が学習コーパスに含まれていたかを確認・申告する初の大規模な実務が生じた。「含まれていたことの確認」自体が来歴情報に依存する構造が、権利者側からも可視化された

学習データの取得来歴を、取り込みの時点で証明可能な形に固定する層の不在は、特定企業の問題ではなく、AI 開発全体の運用課題として浮上している。

---

## 7. Lemma による分析

本事象で露呈した構造的 gap（学習データの取得来歴が証明可能な形で固定されず、係争時に遡及検証コストと責任として顕在化する）に対して、Lemma は、データの取得・取り込みの時点で来歴を独立検証可能な暗号証明として commit する設計を提示している。

- **取得来歴の固定**: 取得した原本を docHash でコミットし、取得経路・ライセンス状態を発行者（出版社・ライセンサー・権利処理事業者）の署名付きクレデンシャルとして紐付ける
- **選択的開示**: BBS+ over BLS12-381 により、「このコーパスは適法に取得・ライセンスされた作品で構成される」ことだけを最小開示する。契約条件・対価・コーパスの全容は開示しない
- **非改ざんと包含**: Poseidon over BN254 でコミットし、取り込み時点の来歴の非改ざんと、特定作品の包含・非包含を Groth16（Circom 回路）で証明する

これにより、取り込みの時点で固定された証明が、後年に「この学習データは適法に取得されたか」「この作品は含まれていたか」を問われた際に、コーパスの中身を開示せず独立検証可能なトレイルとして機能する。事後の監査・discovery は発覚後の範囲特定に、事前証明（取得時点の来歴固定）は適法性の独立検証に、それぞれ相補的に働く。

データは渡さない。証明は渡る。

設計と適用範囲については、ユースケース [RAG コンテンツ来歴](https://lemma.frame00.com/ja/solutions/use-cases/rag-content-provenance/) および [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) を参照のこと。

---

## 8. Sources

公開の裁判所記録・和解手続資料を一次情報として示す。

- **裁判所命令（一次情報）**: Bartz et al. v. Anthropic PBC, Order on Fair Use（N.D. Cal., 2025-06-23、Alsup 判事）— https://copyrightalliance.org/wp-content/uploads/2025/06/Bartz-v.-Anthropic-Order.pdf （docket: https://docs.justia.com/cases/federal/district-courts/california/candce/3:2024cv05417/434709/231 ）
- **和解手続（一次情報）**: Anthropic Copyright Settlement 公式サイト（対象作品・クレーム期限・手続）— https://www.anthropiccopyrightsettlement.com/
- **Authors Guild（二次情報）**: "What Authors Need to Know About the $1.5 Billion Anthropic Settlement" — https://authorsguild.org/advocacy/artificial-intelligence/what-authors-need-to-know-about-the-anthropic-settlement/
- **Kluwer Copyright Blog（二次情報・法解説）**: "The Bartz v. Anthropic Settlement: Understanding America's Largest Copyright Settlement" — https://legalblogs.wolterskluwer.com/copyright-blog/the-bartz-v-anthropic-settlement-understanding-americas-largest-copyright-settlement/
- **法律事務所解説（二次情報）**: Buchanan Ingersoll & Rooney "Anthropic's Copyright Settlement: Lessons for AI Developers and Deployers"（破棄義務・実務示唆）— https://www.bipc.com/anthropic%E2%80%99s-copyright-settlement-lessons-for-ai-developers-and-deployers ／ Norton Rose Fulbright / ArentFox Schiff / Wiggin and Dana 各所のサマリー（判決の 3 区分の整理）

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する脅威インテリジェンス・ブリーフです。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

[Discovery Call を予約する →](https://tally.so/r/EkBqDX)
[ホワイトペーパーをダウンロード →](https://tally.so/r/xX0VYv)
[ニュースレターを購読する →](https://tally.so/r/EkMj82?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
