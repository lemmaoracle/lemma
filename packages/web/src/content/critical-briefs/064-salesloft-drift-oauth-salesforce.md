---
brief_no: 64
title: "Salesloft Drift：信頼された連携アプリの OAuth トークンが盗まれ、数百の Salesforce 環境が横断照会された — 広範・永続の OAuth が、行動ごとにスコープ・失効検証されない構造（UNC6395）"
title_en: "Salesloft Drift: a trusted integration's OAuth tokens stolen, hundreds of Salesforce tenants queried — broad, persistent OAuth not scope/revocation-verified per action (UNC6395)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2025-08-08
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["059-vercel-contextai-oauth", "029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "連携の OAuth 窃取で 700 超の Salesforce が横断照会 — Salesloft Drift"
og_lead_en: "Stolen integration OAuth tokens hit 700+ Salesforce tenants — Salesloft Drift"
gap_detected: "侵害の調査でどのデータが照会されたかを事後に把握でき、Salesloft はトークンを失効させ連携を撤去できた。"
gap_missing: "「いまこの連携が行っている照会は、本来の許可の範囲内で、今も有効な権限か」を行動の前に確かめる層が無く、盗まれた連携トークンによる正規を装った照会は素通りした。"
gap_fix: "連携が顧客データに触れる前に「この操作は許可の範囲内で、いまも有効な認可に基づく」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2025 年 8 月、攻撃グループ UNC6395 は、Salesloft の GitHub・AWS 侵害で連携アプリ Drift の OAuth トークンを窃取し、700 社超の Salesforce 環境を横断照会した。Salesloft のトークン失効・連携撤去は事後の対応で、その照会が許可の範囲内かつ有効かを実行の前には立証しない。窃取トークンによる照会は形式上正規の連携アクセスで、有効な限り各社の防御から区別がつかない。欠けているのは、行動の前に操作のスコープ・認可・有効性を独立検証する層である。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: Salesloft の Drift（チャットボット連携）と、Drift を Salesforce に接続していた顧客組織。攻撃者は Drift が保持する OAuth トークンを悪用して各社の Salesforce を照会した
- **攻撃主体**: UNC6395（Google Threat Intelligence Group〔GTIG〕／Mandiant の追跡名）。2025 年 6 月の別の Salesforce 関連攻撃に紐づく ShinyHunters（UNC6040）とは区別される
- **規模**: GTIG は 700 超の組織が影響を受けた可能性を指摘。ShinyHunters を名乗る恐喝グループは、侵害した Drift の OAuth トークンで 760 社から 15 億レコードを窃取したと主張（恐喝上の主張であり独立に確認されていない）
- **標的データ**: Account・User・Opportunity に加え、とりわけ **Case（サポート案件）本文に埋め込まれた秘密情報**（AWS アクセスキー、Snowflake トークン、VPN 認証情報、パスワード）。顧客連絡先・案件本文・アカウント記録も持ち出された
- **根本原因**: UNC6395 が 2025 年 3〜6 月に Salesloft の GitHub アカウントへ不正アクセスし、複数リポジトリの内容を取得、ゲストユーザー追加・ワークフロー設定を行った。さらに Drift の AWS 環境へアクセスし、Drift 顧客の連携用 OAuth トークンを取得した。この一連が、後の横断照会の起点になったとされる
- **核心**: Drift の OAuth トークンは、利用者に代わって Salesforce に接続する**広範・永続の権限**を意味する。トークンが奪われると、攻撃者は正規の連携として各社の Salesforce に入れ、しかも同じ連携が数百社に導入されているため、被害がエコシステム規模で広がった

---

## 2. タイムライン

- 2025-03〜06: UNC6395 が Salesloft の GitHub アカウントへ不正アクセス（リポジトリ取得・ゲストユーザー追加・ワークフロー設定）。さらに Drift の AWS 環境に到達し、顧客連携用の OAuth トークンを取得
- 2025-08-08〜18: UNC6395 が窃取した Drift の OAuth トークンを悪用し、数百の Salesforce 環境を横断照会。Case 等から秘密情報を探索
- 2025-08-20: Salesloft が有効な Drift トークンを Salesforce と連携して失効させ、Drift 連携を Salesforce マーケットプレイスから撤去。Drift を一時オフラインに
- 以降: GTIG / Mandiant が UNC6395 として公表。影響組織の特定と、流出した可能性のある認証情報のローテーションが進行

> 注: 影響組織数は GTIG の「700 超が影響の可能性」に基づく。「760 社・15 億レコード」は ShinyHunters を名乗る側の恐喝上の主張であり、独立検証されていない。本文は規模の断定を避け、出所を明示する。

---

## 3. 攻撃の経路：盗まれた連携トークンが、各社の Salesforce へ

本事象は、信頼された連携アプリの広範・永続の OAuth が、ベンダー側の侵害を起点に、導入先のエコシステム全体へ連鎖する構造を示す。経路は以下の通り。

1. **ベンダー側の足場（GitHub 侵害）**: UNC6395 が 2025 年 3〜6 月に Salesloft の GitHub アカウントを侵害し、リポジトリ取得・ワークフロー設定で足場を築く。続いて Drift の AWS 環境に到達し、連携用 OAuth トークンを取得する
2. **連携トークンの掌握**: 攻撃者が Drift が保持する OAuth トークンを掌握する。これらのトークンは、利用者に代わって Salesforce へ接続する立ったままの（standing）広範な権限を意味する
3. **各社 Salesforce の横断照会**: 8 月、窃取トークンで数百社の Salesforce を正規の連携として照会する。トークンが有効である限り、各社の防御からは通常の連携アクセスと区別がつかない
4. **CRM 内の秘密情報の探索**: Account・User・Opportunity に加え、Case 本文に紛れ込んだ AWS キー・Snowflake トークン・VPN 認証情報・パスワードを探索・収集する。CRM が二次的な秘密情報の保管面になっていた
5. **失効と事後対応**: Salesloft が 8 月 20 日に Drift トークンを失効させ連携を撤去。これはトークンが悪用された後に作動する事後の系列であり、流出しえた認証情報のローテーションが後続する

---

## 4. 構造的論点

本事象は Pillar 03（エージェント権限証明）の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**連携アプリに付与される OAuth が、行動ごとにスコープ・認可・失効検証される「動的な権限」ではなく、広範かつ永続の「立ったままの権限（standing authority）」として存在し続ける**点にある。Drift のトークンは、利用者に代わって Salesforce を読み書きする広い権限を持ち、奪われればそのまま各社への入口になる。secondary に `identity-auth`（委任された権限の認可）と `attribute-proof-bypass`（トークンの有効性・失効属性の独立検証不在）を併記する。

本事案は Brief 059（AI ツールへ付与した「すべて許可」の OAuth が、ベンダー侵害でそのまま侵入経路になった）と同じ primitive である。059 が AI 生産性ツールへの OAuth が単一企業へ横展開した事例だったのに対し、本事案は **信頼された SaaS 連携の OAuth が、数百社というエコシステム規模で悪用された**点で、standing token の被害が一社に留まらない構造を際立たせる。Brief 029（github.dev で過剰スコープの OAuth トークンが窃取された）とはトークンが行動の範囲にスコープされていない点で、Brief 006（認証情報の失効が独立検証されず削除後も有効だった）とは失効属性の独立検証不在で連なる。Brief 033（位置的信頼と保存された認証情報による横展開）とは、信頼された連携面と保管された秘密情報が横展開の足場になる点で接続する。

本事案が加えるもう一つの層は、**CRM が秘密情報の二次保管面になっていた**ことだ。サポート Case に貼り付けられた AWS キーや VPN 認証情報は、その出所・有効期限・スコープが管理されないまま蓄積され、連携トークンの侵害が秘密情報の連鎖流出に転化した。広範な連携権限と、来歴の管理されない秘密情報の蓄積が重なったとき、単一トークンの窃取がエコシステム全体の認証情報露出に拡大する。

---

## 5. 検出と証明の落差

GTIG / Mandiant の調査、Salesloft によるトークン失効と連携撤去、各社の認証情報ローテーションは、被害把握と抑止に不可欠であり、本 Brief がその役割を否定するものではない。トークン失効と coordinated な対応は、被害の拡大を止める重要な歯止めである。

一方で、検出は「いまこのトークンで行われている照会が、本来の認可の範囲内か」を、**アクセスの実行前に**独立に立証する材料にはならない。窃取された Drift トークンによる照会は、形式上は正規の連携アクセスであり、トークンが有効である限り各社の防御からは正常な連携と区別がつかない。事後のログ解析は「どのオブジェクトが照会されたか」を再構成するが、「その照会は、付与された認可の範囲内であり、現に有効なものだったか」を行動の前に独立検証する材料にはならない。失効は侵害の後に作動し、CRM に蓄積された秘密情報の来歴も遡って固定できない。

事前証明（pre-execution attestation）は、連携アプリの権限を「広範・永続の同意」ではなく、行動ごとにスコープされ独立検証可能な認可として扱う設計を採る。連携が Salesforce に対して行う各操作を、付与者の認可の範囲・トークンの有効性に対して行為の時点で検証し、CRM に保管される秘密情報をその出所・有効期限に来歴バインドすれば、窃取トークンによる範囲外の照会や、失効済み認証情報の利用は、行動の前に弾ける。侵害の検出（detection 的な「何が照会されたか」）と権限・有効性の証明（「その照会は認可の範囲内で、現に有効だったか」）は代替ではなく **補完** の関係にある。

---

## 6. 対応経緯と業界動向

- **Salesloft / Salesforce**: Salesloft は 8 月 20 日に有効な Drift トークンを失効させ、Drift 連携を Salesforce マーケットプレイスから撤去、Drift を一時オフラインに。GTIG / Mandiant が UNC6395 として調査・公表
- **OAuth 連携の棚卸し**: 信頼された SaaS 連携に付与された OAuth スコープを棚卸しし、広範・永続の付与を、行動ごとにスコープされた・失効可能な認可へ移す動きが推奨されている。連携トークンを「立ったままの権限」ではなく監視・失効の対象として扱う
- **CRM 内の秘密情報**: サポート Case 等に秘密情報を貼り付けない運用・検知と、保管される認証情報の来歴・有効期限管理が論点に。CRM が二次的な秘密情報保管面になる構造を断つ
- **業界横断の論点**: 本事案は、ベンダー侵害 → 連携 OAuth トークン窃取 → 導入先エコシステムへの横展開という反復可能なパターンの大規模事例であり（Brief 059 と同型）、信頼された第三者連携を、従来のクラウド事業者と同等のリスク区分で、行動ごとに検証する必要性が論点になっている

広範・永続の連携 OAuth を「立ったままの権限」ではなく「行動ごとにスコープされ、失効が即時反映される認可」として扱う設計の不在は、特定ベンダーの問題ではなく、SaaS 連携を多用する組織横断の課題として残っている。

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差（広範・永続の連携 OAuth が、行動ごとにスコープ・認可・失効検証されないまま立ったままの権限として存在する）に対して、Lemma は、連携やエージェントの行動を「トークンの提示」ではなく「行動ごとにスコープされ独立検証可能な認可の証明」として裏づける設計を提示している。

- **行動ごとのスコープ認可（proof-as-auth）**: 連携が Salesforce に対して行う各操作を、付与者の認可の範囲・現在の有効性に対して行為の時点で独立検証する。広範な同意の再利用では満たせない、操作ごとの証明に置き換える
- **失効の即時反映**: トークン・認証情報の有効性属性を独立検証可能にし、失効が行動判断に即時反映される設計とする（窃取トークンによる照会を、行動の前に弾く。Brief 006 の失効遅延と接続）
- **秘密情報の来歴バインド**: CRM 等に保管される認証情報を、その出所・有効期限に来歴バインドし、来歴のない秘密情報の蓄積と再利用を抑止する
- **選択的開示**: 内部データを出さずに、「この操作は付与者の認可の範囲内であり、現に有効である」ことだけを最小開示し、独立検証と機微情報保護を両立する

これにより、行為の時点で固定された証明が、「この連携の操作は、認可の範囲内で、現に有効なトークンに基づくか」を、事後のログ照合に依存せず独立検証可能なトレイルとして機能させる。検出（事後の調査・失効・ローテーション）は被害の是正に、事前証明（行為時点の権限・有効性の独立検証）は連携アクセスの信頼確立に、それぞれ相補的に働く。

---

## 8. Sources

- **Google Cloud / GTIG（一次・調査）**: "Data Theft from Salesforce Instances via Salesloft Drift"（UNC6395、OAuth トークン窃取・影響範囲）— <https://cloud.google.com/blog/topics/threat-intelligence/data-theft-salesforce-instances-via-salesloft-drift>
- **The Hacker News**: "GitHub Account Compromise Led to Salesloft Drift Breach"（2025-09、根本原因＝GitHub 侵害）— <https://thehackernews.com/2025/09/github-account-compromise-led-to.html>
- **The Hacker News**: "Salesloft Takes Drift Offline After OAuth Token Theft Hits Hundreds of Organizations"（2025-09）— <https://thehackernews.com/2025/09/salesloft-takes-drift-offline-after.html>
- **AppOmni**: "Salesloft Drift–Salesforce Breach (UNC6395): Why Salesforce OAuth Integrations are a Growing Risk" — <https://appomni.com/blog/drift-breach-salesforce-unc6395-saas-prevention/>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
