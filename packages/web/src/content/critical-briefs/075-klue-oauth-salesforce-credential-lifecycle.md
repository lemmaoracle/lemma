---
brief_no: 75
title: "失効されていない古い認証情報が、連携アプリ経由で Salesforce の大量取得につながった（Klue） — 無効化されないテスト認証情報と長命の OAuth トークンが、行動の前に検証されない構造（Huntress / ReliaQuest）"
title_en: "A Dormant, Un-Revoked Credential Turned a Trusted Integration into Mass Salesforce Extraction (Klue) — un-revoked test credentials and long-lived OAuth tokens that go unverified at the moment of action (Huntress / ReliaQuest)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-11
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["064-salesloft-drift-oauth-salesforce", "059-vercel-contextai-oauth", "029-github-dev-oauth-token", "006-google-api-key-revocation-lag", "013-coinbase-kyc-insider-breach"]
status: published
version: "1.0"
og_lead_ja: "古いテスト認証情報の失効漏れで Salesforce が大量取得 — Klue"
og_lead_en: "Klue's un-revoked test credential led to mass Salesforce extraction"
gap_detected: "発覚後の連携停止と異常検知は機能し、Salesforce は Klue 連携アプリを無効化し追加抽出を止められた。"
gap_missing: "「この認証情報・トークンは、今この操作を行う正当な認可に裏づけられているか」を行動の前に検証する層が無く、失効されない古い認証情報と長命の OAuth トークンがそのまま強い権限の bearer になった。"
gap_fix: "認証情報・トークンが顧客データに触れる前に「この操作は正当な認可の範囲内で、いまも有効な認証情報に基づく」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

競合インテリジェンスの SaaS、Klue のバックエンドに、長く使われていなかった古いテスト用認証情報がまだ有効なまま残っており、それが侵入の起点になった。攻撃者は侵入後にコード更新を仕込み、Klue の顧客が自社システム（Salesforce 等）と連携するために使う OAuth トークンを収集。顧客の連携用サービスアカウントとして認証し、Salesforce の REST API 経由で約 24 時間にわたり大量の CRM レコードを引き出した（15 分間に約 1,000 回の集中的な照会、6 時間超に及ぶ抽出の継続も観測）。Salesforce は Klue の連携アプリを無効化した。発覚後の連携停止・異常検知は機能したが、「この認証情報・トークンは、今この操作を行う正当な認可に裏づけられているか」を行動の前に検証する層が無かった。失効されたはずの認証情報が生き続け、長命の OAuth トークンがそのまま強い権限の bearer になっていた。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: Klue（競合・市場インテリジェンス SaaS。顧客が Salesforce 等と連携して利用）と、その連携を通じて照会された顧客の Salesforce 環境
- **被害**: Klue の複数の顧客企業の Salesforce CRM データが大量に抽出された。被害企業にはセキュリティ各社（Huntress、HackerOne、Jamf、Recorded Future、Tanium 等）が含まれると報じられている
- **初期侵入（2026-06-11）**: 長く使われていなかった**古いテスト用認証情報がまだ有効**で、これを悪用して攻撃者が Klue のバックエンドに侵入
- **悪用の核心**: 侵入後、攻撃者は顧客の OAuth トークンを収集できるコード更新を仕込んだ。これらのトークンは Klue の顧客が Klue を自社システムに接続するために用いるもの。攻撃者は顧客の連携用サービスアカウントとして認証し、OAuth トークンを生成して、Salesforce REST API 経由で大量の CRM レコードを自動スクリプトで引き出した（約 24 時間。15 分で約 1,000 回の照会バースト、6 時間超の継続抽出も観測）
- **対応**: Salesforce が Klue（Klue Battlecards）連携を自社プラットフォーム上で無効化
- **帰属（未確定）**: Huntress は、恐喝メールのセッション識別子がダークウェブのリーク用識別子と一致したことから、新興の恐喝グループ "Icarus" の関与を指摘。Icarus は 6 月 19 日に Klue を公開掲載。手口は 2025〜2026 年の第三者 OAuth 悪用キャンペーン（ShinyHunters / UNC6395 に結び付けられた一連）に酷似するが、本 Brief 作成時点で responsible party は確定していない
- **文脈**: 信頼された第三者連携アプリの OAuth トークンを窃取し、Salesforce を横断的に大量照会する手口が 2025〜2026 年に反復している

---

## 2. タイムライン

- 2026-06-11: 失効されていない古いテスト認証情報を悪用して Klue バックエンドに侵入。OAuth トークン収集のためのコード更新が仕込まれる
- 2026-06-11 以降: 攻撃者が顧客の連携用サービスアカウントとして認証、OAuth トークンを生成し、Salesforce REST API 経由で約 24 時間にわたり CRM を大量抽出
- 2026-06-19: 恐喝グループ Icarus が Klue をリークサイトに公開掲載し、複数の Klue パートナー企業から Salesforce データを exfiltrate したと主張
- 2026-06（前後）: Salesforce が Klue 連携アプリを無効化。被害企業として複数のセキュリティ企業が報じられる
- 2026-06-22: 主要メディアが本件を広く報道（被害範囲・手口・帰属の不確実性を含む）

> 注: 本 Brief の事実は Salesforce の対応・Huntress / ReliaQuest 等の解析・確立メディアの報道に基づく。帰属（Icarus）は調査段階であり断定しない。日付は初期侵入（6-11）・公開掲載（6-19）・報道波（6-22）が併存する点に留意し、出所を明示する。

---

## 3. 攻撃ベクター

1. **失効されない認証情報の悪用**: 長く使われていなかった古いテスト用認証情報がまだ有効なまま残っており、攻撃者がこれで Klue バックエンドに侵入する。認証情報のライフサイクル（無効化・期限）が運用されていなかった
2. **収集コードの埋め込み**: 攻撃者が、顧客の OAuth トークンを収集できるコード更新を仕込む。信頼された連携アプリの内部が、トークン収集の経路に転用される
3. **顧客サービスアカウントとしての認証**: 収集した情報で、攻撃者が顧客の Klue 連携用サービスアカウントとして認証し、OAuth トークンを生成する
4. **長命トークンによる大量照会**: 生成・収集した OAuth トークンを bearer として、Salesforce REST API 経由で大量の CRM レコードを自動スクリプトで抽出（約 24 時間、15 分で約 1,000 回のバースト、6 時間超の継続）
5. **横断的な被害**: 複数の Klue 顧客企業の Salesforce データが横断的に引き出される
6. **検知と封じ込め**: 異常な照会が検知され、Salesforce が Klue 連携アプリを無効化（トークンが行使された後に作動する事後の系列）

---

## 4. 構造的論点

本事案は Pillar 03（エージェント権限証明）の `identity-auth` カテゴリに属する。中心的な失敗 primitive は、**認証情報・OAuth トークンが「保有されていること」だけで強い権限の行使を許し、「今この操作を行う正当な認可に裏づけられているか」を行動の前に検証する層が無かった**点にある。具体的には二つの欠落が重なった。第一に、無効化されるべき古いテスト認証情報が失効されないまま有効で、侵入の起点になった（認証情報ライフサイクルの検証不在）。第二に、収集された OAuth トークンが長命の bearer として機能し、それを保有する主体が正当かを都度問わずに Salesforce の大量照会を許した（トークン＝権限の取り違え）。secondary に、連携アプリ基盤が悪用経路になった点で `agent-infrastructure`、トークン保有者の正当性検証回避として `attribute-proof-bypass` を併記する。

Brief 064（Salesloft Drift、信頼された連携アプリの OAuth トークンが盗まれ数百の Salesforce 環境が横断照会）と primitive が同型であり、本事案はその反復事例である。064 と本事案を分けるのは差別化の角度——本事案では**「失効されたはずの認証情報が生き続けた」というライフサイクルの検証不在**がもう一つの核として明確に現れている。この点で Brief 006（Google API キーが削除後も 23 分有効だった失効遅延）と直接連なる。さらに Brief 059（AI ツールに渡した「すべて許可」の OAuth がベンダー侵害でそのまま侵入経路に）・Brief 029（github.dev で OAuth トークンが 1 クリックで窃取）とも、**長命・広範な OAuth トークンが、行使時点の認可検証なしに強い権限の bearer になっている**構造で同根。Brief 013（Coinbase の内部経由 KYC データ漏洩）とは、保有された権限・データが行使・流出の時点で独立検証されない点で隣接する。

信頼された連携アプリは、業務の生産性を支える一方で、その内部が侵害されれば顧客の権限ごと転用される単一の集約点になる。トークンを持っていることと、そのトークンが今この操作を行う正当な認可に裏づけられていることを切り離さない限り、SaaS 連携を機微データの現場に安心して載せられない。

---

## 5. 検出と証明の落差

異常な照会パターンの検知、Salesforce による Klue 連携アプリの無効化、Huntress / ReliaQuest 等による解析と被害範囲の特定は、被害の把握・封じ込めに不可欠であり、本 Brief がその役割を否定するものではない。連携の無効化により追加の抽出は止められた。

一方で、検出は受信側（Salesforce API、連携を受け入れる側）が「どのトークンを、誰の認可として accept するか」自体を変えない。本事案では、収集された OAuth トークンが形式上有効で、顧客のサービスアカウントとして認証されたため、API 側の検証は通過した。欠けていたのは「この認証情報・トークンは、今この操作を行う正当な認可に裏づけられているか——失効されるべき古い認証情報ではないか、トークンの保有者は正当か」を行動の前に独立検証する層であり、これは bearer トークンの形式的有効性とは別系統の検証である。異常検知が大量照会の最中・後に発火しても、トークンが accept された各操作は止まらない。規制報告・監査で「この CRM 抽出は、正当に認可された主体による、有効期限内の認可に裏づけられていたか」を立証する材料として、トークンが形式上有効だったという事実だけでは、認可の正当性の独立した証跡にならない。

事前証明（pre-execution attestation）は、各操作の実行前に、長命の bearer トークンに依存せず「この主体は、今この操作を行う認可を、有効な範囲・期限の下で持つ」ことを独立検証可能な形で確かめる設計を採る。失効・休眠した認証情報は検証時点で行使不能になり、認可が確認できなければ操作を事前に block する。異常検知（detection、事後の停止・解析）と、行使時点の認可の事前証明（proof）は代替ではなく **補完** の関係にあり、両者が重なって初めて、SaaS 連携を機微データの現場に安心して出せる。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、鍵やトークンを送らずに行動ごとに認可を証明する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **Salesforce**: Klue（Klue Battlecards）連携を自社プラットフォーム上で無効化し、影響の拡大を抑止
- **Huntress / ReliaQuest 等**: 攻撃の解析と被害範囲の特定を実施。Huntress は恐喝グループ Icarus の関与を指摘しつつ、手口が過去の第三者 OAuth 悪用キャンペーンに酷似することを示した（帰属は調査段階）
- **被害企業**: 複数のセキュリティ企業を含む Klue 顧客の Salesforce データが影響を受けたと報じられた
- **業界横断の論点**: 信頼された第三者連携アプリの OAuth トークン窃取による Salesforce 横断照会が 2025〜2026 年に反復。長命トークンの最小化、トークン・認証情報のライフサイクル管理（休眠・期限切れの確実な失効）、行使時点の認可検証が、SaaS 連携運用の必須要件として再認識された
- **認証情報衛生**: 使われなくなったテスト認証情報の確実な無効化、定期的な棚卸しが、初期侵入を断つ運用として共有された


「SaaS 連携の認証情報・トークンを、形式的有効性とは別に、行使時点の正当な認可としてどう独立検証するか」は、本事案を契機に連携設計の必須要件として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（認証情報・OAuth トークンが、行使時点の正当な認可として独立検証されていない）に対して、Lemma は、各操作の実行前に認可を独立検証可能な形で扱う設計を提示している。

- **行動ごとの認可の事前証明**: 長命の bearer トークンに依存せず、「この主体は、今この操作を、有効な範囲・期限の下で行う認可を持つ」ことを操作の前に検証し、確認できなければ block する
- **鍵・トークンを送らない認可**: トークンそのものを共有・保持させる前提を排し、鍵を一度も送らずに認可だけを証明する Proof-as-Auth の設計に寄せ、窃取された bearer が広範な権限の通行証にならないようにする
- **認証情報ライフサイクルの検証**: 認証情報・トークンの有効性を、保有の有無ではなく検証可能な期限・状態に結びつけ、失効・休眠した認証情報を検証時点で行使不能にする
- **最小権限と選択的開示**: 操作に必要な範囲だけを認可し、内部状態を全面開示せずに「この操作の認可を持つ」ことだけを最小開示する


「保有 ≠ 正当な認可」というエージェント権限証明カテゴリの設計思想に対し、本事案はその想定する failure mode が現実の大量データ抽出として顕在化した事例である。検出（事後の連携停止・解析）は被害の是正に、事前証明（行使時点の認可の独立検証）は SaaS 連携の信頼確立に、それぞれ相補的に働く。

設計と適用範囲は、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **The Hacker News**: “Salesforce Disables Klue App Integration After OAuth Token Abuse Exposes Customer Data”（2026-06）— <https://thehackernews.com/2026/06/salesforce-disables-klue-app.html>
- **TechCrunch**: “Klue hack results in data breach at several cybersecurity firms”（2026-06-22）— <https://techcrunch.com/2026/06/22/klue-hack-results-in-data-breach-at-several-cybersecurity-firms/>
- **ReliaQuest**: “Threat Spotlight: Integration Abused in CRM Data Theft”（2026-06）— <https://reliaquest.com/blog/threat-spotlight-integration-abused-in-crm-data-theft/>
- **CSO Online**: “Klue breach exposed Salesforce CRM data through stolen OAuth tokens”（2026-06）— <https://www.csoonline.com/article/4187907/klue-breach-exposed-salesforce-crm-data-through-stolen-oauth-tokens.html>
- **Salesforce Ben**: “Another OAuth Hack: Salesforce Disables Third-Party App as CRM Data Exposed Again”（2026-06）— <https://www.salesforceben.com/another-oauth-hack-salesforce-disables-third-party-app-as-crm-data-exposed-again/>
- **reference 実装（GitHub）**: agent-authority proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
