---
brief_no: 8
title: "公開 API 経由の Discord 20.5 億メッセージのスクレイピング — 公開チャンネルデータが AI 学習データセットとして再配布される構造"
title_en: "Discord 2.05 Billion Message Scraping via Public API — How Public Channel Data Gets Redistributed as AI Training Datasets"
pillar: "01-verifiable-origin"
primary_category: "training-data-provenance"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2025-05-22
published: 2026-05-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory", "C-agent-governance"]
related_briefs: ["005-noroboto-lying-fonts", "006-google-api-key-revocation-lag"]
version: "1.0"
status: published
og_lead_ja: "公開 API 経由で 20.5 億メッセージが AI 学習データに再配布 — Discord スクレイピング"
og_lead_en: "2.05 billion public messages redistributed as AI training data — Discord scraping"
gap_detected: "技術メディアが、収集と公開が起きた後にその存在を検出し、業界に問題提起できた。"
gap_missing: "配布の前に「このデータは規約に沿った範囲で集められたものか」を確かめる層が無く、規約で禁じられた用途のデータがそのまま公開された。"
gap_fix: "配布や AI 学習への取り込みの前に「このデータは、どこから、どの利用条件で集められたか」を Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2024 年 11 月から 2025 年 5 月にかけて、ある大学の 15 名の研究チームが、Discord の公開機能を使って 3,167 サーバー・473 万 5,057 人・20.52 億メッセージ(2015〜2024 年分)を一括収集し、論文とデータセットとして誰でもダウンロードできる形で公開した。研究チームは利用者名の書き換えなどで匿名化したと説明している。だが Discord の規約は、こうして集めたメッセージを AI 学習に使うことも、データを一括収集・再配布することも明確に禁じている。技術的に公開 API でアクセスできることと、規約で許された範囲は別物であるにもかかわらず、配布の前にその範囲を確かめる層が無く、禁じられた用途のデータが下流の AI 学習へ流れ得る状態になった。

---

## 1. 事案概要

- **規模**: 20.52 億メッセージ(20,520,206,308)、3,167 サーバー、473 万 5,057 人、2015-2024 年分
- **発見スコープ**: Discord 「発見」機能による 31,673 公開サーバーの 10% を無作為選択(2024-11-17 時点)
- **scraping 主体**: ブラジル ミナス・ジェライス連邦大学の 15 名の研究者チーム
- **配布形式**: arXiv 論文(2502.00627)+ JSON dataset としてオンライン公開
- **配布目的**: 「メンタルヘルスや政治についての研究」「ボット訓練」用途の研究 dataset 配布
- **匿名化措置**: ユーザー名書き換え、ID とメッセージのハッシュ化による切り捨て
- **規約 / ポリシー上の位置**:
  - Discord 開発者ポリシー:「API で取得されたメッセージの内容を機械学習または AI のトレーニング(大規模言語モデルを含む)に使用してはなりません」「Discord サービスにおいて、またはこれを介して、利用可能ないかなるデータ、コンテンツ、情報もマイニングまたはスクレイピングしてはなりません」
  - Discord 利用規約: スクレイピング禁止条項を含む
- **配布範囲**: arXiv 経由で誰でもダウンロード可能、下流の研究者・AI 企業への流通経路が成立
- **Discord プラットフォーム側 response**: 公開時点で公式 statement は未確認(同社は過去に類似事案 Spy Pet に対して 2024-04 時点で法的措置を検討した経緯あり)

本事案は cybersecurity attack incident ではなく、研究目的の規約違反を契機とする「信頼層に関わるリスク事象」として扱う。Lemma Critical Brief の射程を、攻撃 incident に加え、AI 時代の信頼層に関わるリスク事象一般に拡張する第 1 事例として位置付ける。

---

## 2. タイムライン

- 2015-2024(対象期間): scraping 対象となるメッセージが Discord 公開サーバー上に蓄積
- 2024-11-17: 研究チームが Discord 「発見」機能を使用、合計 31,673 の公開サーバーを発見、10% を無作為選択
- 2024-11-17 以降(推定): 公開 API 経由の scraping を実施
- 2025-05: arXiv 論文(2502.00627)と JSON dataset をオンライン公開
- 2025-05-22: 404 Media が一次報道、Discord 利用規約・開発者ポリシー違反を明示。同日、日本語メディアでも続報
- 2025-05 以降: GenAI 業界横断で training data provenance の論点として議論

---

## 3. 事象連鎖

1. **Research design**: ブラジル ミナス・ジェライス連邦大学の 15 名の研究者チームが、Discord 公開コミュニケーションを大規模 dataset として配布する研究プロジェクトを策定
2. **Discovery scope mapping**: Discord 「発見」機能により 2024-11-17 時点で公開サーバー 31,673 を発見、10%(3,167 サーバー)を無作為選択
3. **Scraping via public API**: 公開 API を使用して 2015-2024 年分の 20.52 億メッセージ、473 万 5,057 人分のデータを収集
4. **Anonymization measures**: ユーザー名書き換え、ID とメッセージのハッシュ化による切り捨てを実施したと主張
5. **Distribution**: arXiv に論文を投稿、JSON ファイルとして dataset をオンライン公開
6. **Policy collision**: Discord 開発者ポリシー上の ML / AI training 用途禁止条項とスクレイピング禁止条項、利用規約上のスクレイピング禁止条項に同時抵触
7. **Downstream flow availability**: arXiv 経由で下流の研究者・AI 企業に dataset 流通が技術的に成立、AI training data として活用される経路が形成される

---

## 4. 構造的論点

本事案は、chat プラットフォームの公開チャンネルデータについて、**「サーバーが公開設定である」という属性表明と、規約で定められた「利用 scope」属性表明が独立に attestation されないまま、配布層を経由して下流に流通する** という構造の代表事例である。技術的にはアクセス可能な公開 API、規約上禁止された利用 scope(ML / AI training 用途、再配布、scraping)、そして dataset 配布時点で「収集 scope が規約遵守か」を独立検証する layer の不在が同時に成立している。

Brief 005(Noroboto)は AI 判断の **入力 integrity** が偽装される構造、Brief 006(Google API キー失効遅延)は credential の **失効属性** が独立検証されない構造、本事案は dataset の **来歴・利用 scope 属性** が独立検証されない構造として位置する。3 件はいずれも「信頼の assertion(本事案では『この dataset は適法 scope で収集された』)が、それを検証する layer と切り離されている」という共通構造を持つ。

本事案が他 Brief と異なるのは、cybersecurity attack incident ではなく、研究目的の規約違反による信頼層リスク事象である点。Lemma Critical Brief の射程を、攻撃 incident に加え、AI 時代の信頼層に関わるリスク事象一般に拡張する第 1 事例として位置付ける。同型の構造は今後、Slack / Teams / Notion 等の enterprise SaaS の公開チャンネル設定における data perimeter リスクや、GenAI 企業の training data provenance 説明責任の議論において、繰り返し参照されることが予想される。

---

## 5. 検出と証明の落差

本事案では、404 Media を中心とする技術メディアが scraping と dataset 公開の存在を検出し、業界横断議論を喚起した。これは検出層の典型的な機能であり、検出メディア・研究者の役割を本 Brief が否定するものではない。検出は事象の輪郭把握、業界横断の論点提起、組織横断の運用見直しに不可欠な層として引き続き重要である。

一方で、検出は dataset が **すでに arXiv に投稿され JSON として配布されている状態を取り消せない**。下流の研究者・AI 企業は dataset をダウンロード可能であり、AI training への流入経路は検出のみでは閉じない。Discord の利用規約と開発者ポリシー違反であっても、技術的なアクセス制御は存在せず、配布後の dataset を撤回する mechanism も成立しない。匿名化措置が施されていても、収集 scope の規約適合性は dataset 単体からは検証できない。

規制報告・行政手続き・企業の AI 採用 due diligence で「training data が適法 scope で収集された」と立証する材料として、本事案のような dataset が下流の AI training に流入した場合、検出スコアと dataset origin / scope 証明の間に独立した層が必要となる。事前証明(pre-execution attestation)は、検出に対する代替ではなく **補完** の関係にあり、両層の組み合わせで AI training data の trust boundary が確立される。

---

## 6. 対応経緯と業界動向

- **404 Media**(2025-05-22 一次報道): Discord 利用規約・開発者ポリシー違反を明示し、業界に問題を提示。「研究者たちはデータを匿名化したと主張しているが、自分の Discord メッセージがオンライン上の公開ファイルに保存されていることを快く思う人はいない」「Discord ユーザーの多くは子どもであることに留意すべき」と論点を提起
- **研究チーム(ミナス・ジェライス連邦大学)**: dataset 配布目的を「他の研究チームがメンタルヘルスや政治について研究したり、ボットを訓練したりする際に使用できるようにするため」と表明、匿名化措置を実施したと主張
- **Discord プラットフォーム側**: 公開時点で公式 response は確認できず。同社は過去に類似事案 Spy Pet(2024-04、6 億ユーザー以上の Discord ユーザーを監視していた事業者)に対して法的措置を検討した経緯がある
- **arXiv**: dataset 論文(2502.00627)を含む preprint platform における training data dataset 配布 policy が、業界横断の論点として浮上
- **業界横断の論点**:
  - **GenAI 企業の training data provenance 説明責任**: EU AI Act の training data documentation 要件、米 NIST AI RMF 等のガイダンスに直結する論点として、本事案は具体ケースを提供
  - **enterprise SaaS の data perimeter 再評価**: Slack / Teams / Notion 等の enterprise chat / collaboration ツールの公開設定 channel における、第三者 scraping を通じた AI training data 流入リスクが CSO 層の primary 関心領域として浮上
  - **ToS 違反 + 匿名化主張 + 学術研究目的のグレーゾーン規制**: GDPR、米国・州レベルのプライバシー法、日本の個人情報保護法における公開 API + ToS 違反 + 匿名化主張の組み合わせの法的位置付けが、政策実務者の議論に乗る

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差(dataset の来歴と利用 scope 属性が独立検証されないまま下流に流通する)に対して、Lemma は 2 層の構造を提示する。

第一に **dataset 配布層** において、dataset の収集元、収集 scope(規約遵守 / 違反)、利用条件(再配布禁止、ML / AI training 禁止等)を独立検証可能な暗号証明として埋め込み、配布時点で proof attestation を必須化する設計。下流の研究者・AI 企業は proof を verifier として、自社の用途(例: ML training)が dataset の収集 scope に整合するかを独立検証できる構造になる。

第二に **AI training data audit 層** において、AI ベンダーの training data audit 工程に proof 必須化を組み込み、AI モデルの出力に対して「この出力はどの training data に基づくか」「その training data は適法 scope で収集されたか」を独立検証可能にする設計。エンプラ CSO は AI 採用判断時点で proof のない、または不正 scope proof を持つ training data を契約要件として排除可能になる。

2 層の組み合わせは、検出に対する代替ではなく補完の関係にある。検出は scraping の発生と dataset 配布を後追いで把握できるが、配布済み dataset の下流流通を制御できない。事前証明は dataset 配布時点と AI training audit 時点の 2 層で trust boundary を確立する。

---

## 8. Sources

- **404 Media**: "Researchers Scrape 2 Billion Discord Messages and Publish Them Online"(2025-05-22、一次報道、Discord 利用規約・開発者ポリシー違反を含む技術記述)— https://www.404media.co/researchers-scrape-2-billion-discord-messages-and-publish-them-online/
- **arXiv 研究チーム論文**: "Discord Unveiled: A Comprehensive Dataset of Public Communication (2015-2024)"(2025、ブラジル ミナス・ジェライス連邦大学 15 名研究者チーム、dataset 配布の一次資料)— https://arxiv.org/pdf/2502.00627
- **Discord 開発者ポリシー** 公式(ML / AI training 用途禁止条項とスクレイピング禁止条項の根拠)— https://support-dev.discord.com/hc/ja/articles/8563934450327
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
