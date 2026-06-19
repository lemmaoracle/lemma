---
brief_no: 59
title: "AI ツールに渡した「すべて許可」の OAuth が、ベンダー侵害でそのまま侵入経路になった — 標準的に付与される広範・永続の OAuth が、行動ごとにスコープ・検証されない構造（Vercel / Context.ai）"
title_en: "When \"Allow All\" OAuth to an AI Tool Becomes the Breach Path (Vercel / Context.ai)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "attribute-proof-bypass"]
incident_date: 2026-04-19
published: 2026-06-16
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["029-github-dev-oauth-token", "033-f5-bigip-edge-pivot", "047-openclaw-agent-phishing", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "AI ツールへの「すべて許可」OAuth が侵入経路に — Vercel / Context.ai"
og_lead_en: "\"Allow all\" OAuth to an AI tool became the breach path — Vercel"
gap_detected: "侵害された認証情報は、公開開示の 1 か月以上前に脅威インテリジェンスのフィードで特定できており、監視・ログも記録できていた。"
gap_missing: "「いまこのアクセスは本来の許可の範囲内か」を行動の前に確かめる層が無く、一度「すべて許可」した同意の内側で動くアクセスは素通りした。"
gap_fix: "高リスク行動の前に「この操作は、この主体に、この範囲で認可されており、現に有効である」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

セキュリティ事故の発端は、ある従業員が AI 生産性ツール（Context.ai）の利用開始時に、自社の Google アカウントへのアクセスを「すべて許可」したことだった。2026 年 4 月、その AI ツールを提供するベンダー側が別の攻撃で侵害され、攻撃者は「すべて許可」で渡された認証情報を経由して Vercel の社内システムに入り、読み取り可能なまま保存されていた API 鍵や DB 接続情報を取得。約 580 名分の従業員記録が流出し、攻撃者はデータを 200 万ドルで売ると主張した。「すべて許可」は便利な一手だが、その一度の同意が、ツールのベンダー（とそれを侵害した攻撃者）に自分の権限をまるごと預けることになる。

---

## 1. 事案概要

- **開示**: 2026-04-19、Vercel が社内システムおよび限定的な顧客認証情報への不正アクセスを開示（CEO Guillermo Rauch が同日 X で攻撃連鎖を説明）
- **根本原因**: 第三者 AI エージェント基盤 Context.ai の侵害。少なくとも 1 名の Vercel 従業員が、自身の企業 Google Workspace アカウントに対し Context.ai へ広範な OAuth 権限（「すべて許可」、Google Drive への full read を含む）を付与していた
- **Context.ai の性質**: 40 以上の企業ツールに OAuth/API で接続し、組織データを処理してコンテンツを生成するエンタープライズ AI 基盤。製品の価値提案そのものが、企業 ID 基盤への広範なアクセスを前提とする（設計上、高権限の第三者）
- **到達対象**: Vercel のプロジェクト設定および環境変数管理画面。攻撃者は「sensitive」に分類されていない（=読み取り可能な形式で保存された）環境変数にアクセスした。「sensitive」指定の変数は UI からの取得を防ぐ暗号化が施されており、Vercel はそれらへのアクセスの証拠はないとしている。到達はチームスコープ単位で、プラットフォーム全体の一括露出ではない
- **攻撃者の主張**: ShinyHunters を名乗る攻撃者が 2026-04-19 頃に BreachForums へ投稿。内部 DB・API 鍵・GitHub/NPM トークン・ソースコード等を含むとし、証拠として約 580 名分の Vercel 従業員記録（氏名・メール・アカウント状態・活動タイムスタンプ）を提示、データを 200 万ドルで販売すると主張した。なお ShinyHunters は関与を否定しており（模倣または分派の可能性、技術的裏付けはなし）、Vercel は調査中で主張の全範囲は独立検証していない

---

## 2. タイムライン

- 2026-02: Context.ai 従業員が Lumma Stealer に感染（Hudson Rock によれば感染経路は同従業員による Roblox 関連スクリプト/ツールの個人ダウンロード）。Google Workspace・Supabase・Datadog・Authkit 等の認証情報が窃取され、Context.ai 自身の OAuth アプリ管理環境への管理者アクセスを含んでいた
- 2026-03: Context.ai が AWS 環境への不正アクセスと、一部利用者の OAuth トークン侵害の可能性を後に開示。「すべて許可」で付与された OAuth アプリの認可基盤を攻撃者が掌握し、同意済みユーザーに代わって有効なトークンを生成・再利用しうる状態に
- 2026-04: 攻撃者が侵害トークンで Vercel 従業員の Google Workspace を経由し、社内環境変数管理画面に到達
- 2026-04-19: Vercel が公開開示。ShinyHunters を名乗る攻撃者が BreachForums に投稿、200 万ドルでの販売を主張

> 注: Context.ai 内部の感染経路・トークン掌握の詳細、および BreachForums のデータ主張の真偽は調査の進行に依存するため、本文では断定しない。

---

## 3. 攻撃の経路：三段のサプライチェーン・エスカレーション

本事象は、AI ツールへ付与された広範・永続の OAuth が、ベンダー側の侵害を起点に下流へ連鎖する構造を示す。経路は明確な三段のホップを踏む。

1. **第 1 ホップ — AI ベンダーのエンドポイント侵害**: Context.ai 従業員が infostealer に感染。Google Workspace を含む複数の認証情報と、Context.ai の OAuth アプリ管理環境への管理者アクセスが窃取される
2. **第 2 ホップ — OAuth トークンの掌握**: 攻撃者が Context.ai の AWS 環境と OAuth 認可基盤を掌握。「すべて許可」で同意したユーザーに代わり、有効な OAuth トークンを生成・再利用できる状態になる。トークンはパスワード再入力を要さない、立ったままの（standing）アクセスを意味する
3. **第 3 ホップ — 下流 Vercel への横展開**: Vercel 従業員が Context.ai に企業 Workspace を広範な OAuth で接続していたため、攻撃者はそのトークンで従業員の Workspace ID を経由し、Vercel 社内システムへ。プロジェクト設定の環境変数管理画面に到達し、「sensitive」未指定で読み取り可能な API 鍵・DB 認証情報を取得した

補助的な要因として、**シークレット分類の落差**がある。Vercel の「sensitive 環境変数」指定はビルド実行時のみ読める暗号化を施すが、これはオプトインであり、既定では環境変数値は読み取り可能な形式で保存される。顧客が事前に「sensitive」を指定していなければ、プロジェクト権限を得た者——OAuth トークン侵害で到達した攻撃者を含む——に値が読まれる。Vercel は現在、本番/プレビュー環境の新規変数を既定で sensitive にするチーム方針をサポートしている。

---

## 4. 構造的論点

本事象は Pillar 03（エージェント権限証明）の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**AI ツールに付与される OAuth が、行動ごとにスコープ・認可・検証される「動的な権限」ではなく、広範かつ永続の「立ったままの権限（standing authority）」として存在し続ける**点にある。AI 生産性ツールは、その機能要件（メール・ドキュメント・社内ナレッジの横断的な読み書き）ゆえに、構造的に広範な OAuth スコープを要求する。ユーザーが企業 ID でそれを認可した瞬間、自分のアクセス姿勢をベンダーのインフラへ——そして将来そのベンダーを侵害する攻撃者へ——延長することになる。secondary に `identity-auth`（委任された権限の認可）と `attribute-proof-bypass`（権限属性の独立検証不在）を併記する。

Brief 029（github.dev で過剰スコープの OAuth トークンが窃取された）と同じく、「トークンが行為の範囲にスコープされていない」構造である。029 が単一サービス内の過剰スコープだったのに対し、本事象は **AI ツールという高権限の第三者を経由した、組織横断の standing token** という別軸を加える。また Brief 033（F5 BIG-IP）が示した「位置的信頼＋保存された認証情報による横展開」と同型の問題が、ここではネットワーク機器ではなく AI SaaS 連携の OAuth 信頼面で再現している。共通するのは、**ある主体のアクセスが、その都度の認可ではなく、過去に一度与えられた広範な信頼に依存している**ことだ。

AI ツールへの OAuth 付与は、調達時のベンダーリスク評価が詳細でも、OAuth 同意画面そのものは「日常的なオンボーディングの一手」として素通りされがちで、評価プロセスを迂回する ID ブリッジを作り出す。権限を与えた従業員が、雇用主に代わってその水準のアクセスを付与する権限を持っていたとは限らない。

---

## 5. 検出と証明の落差

infostealer インテリジェンスフィード、OAuth 付与の監査、egress 監視、EDR は、本事案の各段で機能しうる層であり、本 Brief がそれらの役割を否定するものではない。実際、Hudson Rock は Context.ai 従業員の認証情報を公開開示の 1 か月以上前に自社フィードで特定していた。検出能力は存在した。

一方で、検出は「いまこのトークンで行われているアクセスが、本来の認可の範囲内か」を、**アクセスの実行前に**独立して立証する材料にはならない。攻撃者の操作は、同意済みユーザーに代わって発行された有効な OAuth トークンによる、形式上は正規のアクセスである。Workspace から Vercel への横展開も、付与済みの広範スコープの内側で起きるため、トークンの有効性検査では止まらない。Hudson Rock の事例が示すのは、欠けていたのが検出能力ではなく、**インテリジェンスを「立ったままの権限の即時失効」へ接続するワークフロー**だったことだ。監査の観点でも、事後に「どのトークンが・どの認可の範囲で・どの行動を実行したか」を独立に示す証跡は、各サービスのアクセスログの突合以上には残りにくい。

事前証明（pre-execution attestation）は、AI ツールへの権限付与を「広範・永続の同意」ではなく、行動ごとにスコープされ独立検証可能な認可として扱う設計を採る（業界の標準化文脈でも、ユーザー OAuth のパススルーを避け、RFC 8693 のトークン交換で操作ごとにスコープされた・監査可能なトークンへ変換する方向が示されている）。proof が「この操作は付与者の認可の範囲内であり、現に有効である」ことを満たさなければ、アクセスは実行前に block される。

---

## 6. 対応経緯と業界動向

- **Vercel**: 4 月 19 日に開示し調査を継続。顧客に対し、活動ログの確認、シークレットの「sensitive」指定への即時移行、非 sensitive な値のローテーションを推奨。本番/プレビュー環境の新規変数を既定で sensitive にするチーム方針を提供
- **AI SaaS 連携の OAuth 監査**: Google Workspace 管理コンソールで第三者 OAuth アプリの広範スコープ付与を棚卸しし、IT 管理外で従業員が個別に認可したアプリを優先的に見直す動きが推奨されている。広範スコープの付与は失効・再プロビジョニング（必要最小限のスコープでの再付与）の対象
- **認証情報の運用**: deploy 環境の長期間有効な静的シークレットを、AWS IAM ロール・GitHub OIDC フェデレーション・実行時取得のシークレットマネージャ等の時間/スコープ限定の認証情報へ置き換える方向。単一トークン窃取の被害範囲を構造的に狭める
- **業界横断の論点**: 本事案は、infostealer 感染 → OAuth トークン侵害 → 下流顧客への横展開という反復可能なパターンの一例であり（2024 年の Snowflake キャンペーンと構造的に同型）、AI 生産性ツールの広範・永続アクセスを、従来のクラウド事業者と同等のリスク区分で扱う必要性が論点になっている

AI ツールへの OAuth 付与を「立ったままの権限」ではなく「監視され失効可能な、行動ごとにスコープされた認可」として扱う設計の不在は、特定ベンダーの問題ではなく、AI SaaS を採用する組織横断の運用課題として残っている。

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差（AI ツールへの広範・永続の OAuth が、行動ごとにスコープ・認可・検証されないまま立ったままの権限として存在する）に対して、Lemma は、ツールやエージェントの行動を「鍵の提示」ではなく「行動ごとにスコープされ独立検証可能な認可の証明」として裏づける設計を提示している。付与時の広範な同意ではなく、操作の実行前に「この行動は付与者の認可の範囲内か」「その認可は現に有効か」を証明として検証することで、ベンダー侵害が standing token を経由してそのまま下流の侵入権限に転化する連鎖を断つ。

---

## 8. Sources

- **Cloud Security Alliance（一次・分析）**: "AI SaaS as Enterprise Attack Vector: The Vercel–Context.ai Breach"（2026-04-20）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-saas-supply-chain-vercel-contextai-2026/>
- **Vercel（一次・当事者）**: "Vercel April 2026 security incident"（Vercel Knowledge Base、2026-04-19）— <https://vercel.com/kb/bulletin/vercel-april-2026-security-incident>
- **The Hacker News**: "Vercel Breach Tied to Context AI Hack Exposes Limited Customer Credentials"（2026-04-20）— <https://thehackernews.com/2026/04/vercel-breach-tied-to-context-ai-hack.html>
- **BleepingComputer**: "Vercel confirms breach as hackers claim to be selling stolen data"（2026-04）— <https://www.bleepingcomputer.com/news/security/vercel-confirms-breach-as-hackers-claim-to-be-selling-stolen-data/>
- **InfoStealers.com（Hudson Rock）**: "Breaking: Vercel Breach Linked to Infostealer Infection at Context.ai"（2026-04）— <https://www.infostealers.com/article/breaking-vercel-breach-linked-to-infostealer-infection-at-context-ai/>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
