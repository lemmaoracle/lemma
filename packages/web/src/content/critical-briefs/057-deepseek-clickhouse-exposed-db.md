---
brief_no: 57
title: "認証のない AI バックエンドで、到達がそのまま全取得になった — データ基盤の到達と認可が分離されない構造（DeepSeek / ClickHouse）"
title_en: "Reachable Meant Readable — DeepSeek's Unauthenticated ClickHouse Backend Exposure"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2025-01-29
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["056-mchire-paradox-recruiting-auth", "013-coinbase-kyc-insider-breach", "036-public-training-dataset-pii", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "認証なしの AI バックエンド、到達＝全取得 — DeepSeek / ClickHouse"
og_lead_en: "No auth on the AI backend — reachable meant readable — DeepSeek"
---

## TL;DR

AI サービスの利用者は、入力したチャットが安全に扱われていると前提する。だが 2025 年 1 月、Wiz Research は、AI 企業 **DeepSeek** のバックエンド **ClickHouse データベースが認証なしで一般公開**されていることを発見した。公開ポート（8123 / 9000）経由で誰でも到達でき、**100 万行を超えるログ、平文のチャット履歴、API キー、秘密トークン、バックエンド情報**が露出していた。本 Brief を Pillar 03（エージェント権限証明）の観点から、「**AI サービスの機微データ基盤へのアクセスに認証・権限検証が一切なく、ネットワーク到達がそのまま全取得になっていた**」構造として分析する。Wiz は責任ある開示を行い、DeepSeek は約 30 分で是正した。failure primitive は個別の設定ミスではなく、データ面の到達と認可が分離されていなかったことにある。Brief 056（推測可能な資格情報＋認可欠如）・013（規制で保存が義務づけられた生 PII が侵害面に）・036（AI 学習データの来歴・同意）・006（資格情報の失効属性の検証ギャップ）に連なる。

---

## 1. 事案概要

- **対象**: DeepSeek（AI / LLM サービス）のバックエンドインフラ
- **発見者**: Wiz Research（外部インフラのセキュリティ評価中に発見）
- **露出の起点**: ClickHouse インスタンスが認証なしで外部公開（`oauth2callback.deepseek.com:9000`・`dev.deepseek.com:9000`）。公開ポートは 8123（HTTP）/ 9000 で、Web インターフェースから任意の SQL クエリが認証なしで実行できた
- **露出内容**: 100 万行超のログストリーム（`log_stream` テーブル）、平文のユーザーチャット履歴、API キー、秘密アクセストークン、バックエンドの運用メタデータ
- **データ範囲**: 少なくとも 2025-01-06 以降のログが蓄積
- **対応**: Wiz が DeepSeek に責任ある開示を実施、DeepSeek は約 30 分で露出を是正
- **核心**: 機微データ基盤へのアクセスに認証・権限検証が存在せず、**到達＝取得**になっていた

> 注: 本 Brief は第三者による不正取得の有無を断定するものではなく、認証・権限検証の不在という構造を分析対象とする。

---

## 2. タイムライン

- 2025-01-06: 露出していたデータベースのログがこの日付以降蓄積
- 2025-01: Wiz Research が外部インフラ評価中に 2 つの ClickHouse インスタンスを発見
- 2025-01-29: Wiz が DeepSeek へ責任ある開示。DeepSeek は約 30 分で是正

---

## 3. 露出が「到達＝全取得」へ伝播する経路

本件は、AI サービスのデータ基盤への到達と認可が分離されていない構造に起因する。

1. **認証なしの外部到達**: ClickHouse インスタンスが公開ポート（8123 / 9000）で外部に開いており、認証を経ずにネットワーク到達できた
2. **権限検証の不在**: 到達した主体に対し、データへのアクセス権限の検証が一切なく、フルコントロールに近い操作が可能
3. **機微データの全取得**: 平文チャット履歴・API キー・秘密トークン・バックエンド情報が、追加の検証なしに取得可能。到達がそのまま全取得になる
4. **二次リスクの連鎖**: 露出した API キー・トークンは、他システムへの横移動・権限昇格の起点になり得る

---

## 4. 構造的論点

本件は Pillar 03（エージェント権限証明）の `identity-auth` カテゴリに属する。中心的な failure primitive は、**AI サービスの機微データ基盤に対し、アクセス主体の認証・権限属性が独立検証されないまま、ネットワーク到達が全取得に直結する**ことである。secondary に `attribute-proof-bypass`（アクセス権限の検証迂回）と `data-provenance`（チャット履歴という機微データの扱い）を併記する。

Brief 036（公開学習データの PII）はデータの来歴・同意の層を扱うが、本件は**稼働中の AI サービスの運用データ**が露出した点で断面が異なる。Brief 056（McHire）と同じ「権限検証の不在」primitive を共有するが、McHire が推測可能な資格情報＋ IDOR だったのに対し、DeepSeek は**認証そのものが存在しない**より根源的な欠落である。AI 企業がスケールを優先する中で、データ基盤の到達制御と認可が分離されないまま公開される、というパターンを示す。

---

## 5. 検出と証明の落差

ここでは検出チェーン — Wiz Research による外部スキャンと責任ある開示、DeepSeek の即時是正 — が機能し、露出は悪用の証拠が広がる前に是正された。外部からの継続的なアタックサーフェス監視が有効に働いた例であり、本 Brief はその役割を否定しない。

しかし問題は、外部スキャンが露出を「検出」できても、それは露出が成立した後の事後作動であり、「**このアクセスは正当な権限に基づくか**」をアクセスの瞬間に証明する層にはならないことである。認証のない基盤では、到達した主体が正当か否かを区別する手段がそもそも存在しない。「ポートが開いていた／いなかった」は検出の対象だが、「正当なアクセスである」ことの証明ではない。

現状、AI サービスのデータ基盤では、到達制御（ネットワーク）と認可（誰が何にアクセスできるか）が分離されないまま運用される例が後を絶たない。事前証明（pre-execution attestation）は、データ基盤へのアクセス経路に「主体がこのスコープの権限を正当に持つ」という属性証明を前置し、到達と認可を構造的に分離する。検出（外部スキャン・開示）は被害の縮小に、事前証明（アクセス時の権限検証）は認可の独立検証に、**補完** 的に寄与する。行動の前に独立検証する考え方は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **発見・是正**: Wiz Research の責任ある開示を受け、DeepSeek は約 30 分で露出を是正
- **業界の論点**: 急成長する AI サービスにおいて、チャット履歴という極めて機微なデータの基盤が、認証なしで公開され得るという**運用セキュリティの基本**が改めて論点化
- **二次リスク**: 露出した API キー・秘密トークンは横移動・権限昇格の起点になり得るため、シークレット管理とローテーションの重要性が再認識された
- **地政学・規制文脈**: DeepSeek を巡る各国の規制・利用制限の議論とも重なり、AI サービスのデータ保護とガバナンスへの関心を高めた

機微データ基盤の到達と認可が分離されていない構図は、一社の設定ミスにとどまらず、スケールを優先する AI サービス全体の運用セキュリティ課題として残る。

---

## 7. Lemma による分析

DeepSeek が露呈した落差 — AI サービスの機微データ基盤へのアクセスに認証・権限検証がなく、到達が全取得に直結する — に対し、Lemma はアクセスの根拠を、その瞬間に独立検証可能な暗号学的証明として固定する設計を提示している。

- **権限属性の事前証明**: データ基盤へのアクセス前に、「主体がこのスコープの権限を正当に持つ」ことを独立検証可能な属性として証明する。認証のないネットワーク到達だけでは通らない
- **到達と認可の分離**: ネットワーク到達可能性と、データへの認可を構造的に分離する。ポートの露出が直ちに全取得にならない
- **シークレットの取り扱い**: API キー・トークンを平文で保持・露出させず、証明ベースの認可（鍵を送らず証明を送る）へ移行する
- **選択的開示**: 「アクセスが権限範囲内であった」ことだけを証明し、チャット履歴等の機微データ本体は露出させない

行動時点で固定された証明は、後日「このアクセスは正当だったか」を問われたときに、機微データを開示せずに独立検証できる証跡として機能する。検出（外部スキャン・開示）は被害の縮小に、事前証明（アクセス時の権限検証）は認可の独立検証に、補完的に寄与する。設計と適用範囲は、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) および [Seal（鍵ではなく証明を送る）](https://lemma.frame00.com/ja/seal/) を参照のこと。

---

## 8. Sources

- **Wiz Research**: "Wiz Research Uncovers Exposed DeepSeek Database Leaking Sensitive Information, Including Chat History"（一次・発見の原典、2025-01） — <https://www.wiz.io/blog/wiz-research-uncovers-exposed-deepseek-database-leak>
- **BleepingComputer**: "DeepSeek exposes database with over 1 million chat records"（ポート・露出内容・是正） — <https://www.bleepingcomputer.com/news/security/deepseek-exposes-database-with-over-1-million-chat-records/>
- **The Register**: "DeepSeek database left open, exposing sensitive info"（2025-01-30、経緯の整理） — <https://www.theregister.com/2025/01/30/deepseek_database_left_open/>

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する脅威インテリジェンス・ブリーフです。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

[Discovery Call →](https://tally.so/r/EkBqDX)
[ホワイトペーパー →](https://tally.so/r/xX0VYv)
[✉️ ニュースレター →](https://tally.so/r/EkMj82?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
