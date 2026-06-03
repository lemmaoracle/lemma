---
brief_no: 9
title: "GTG-1002 — AI エージェントが攻撃の 80–90% を自律実行した初の報告例、エージェント権限が独立検証されない構造"
title_en: "GTG-1002 — The First Reported AI-Orchestrated Espionage Campaign Where the Agent Executed 80–90% Autonomously, and Agent Authority Was Never Independently Verified"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["identity-auth"]
incident_date: 2025-11-13
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["007-pocketos-cursor-db-deletion", "003-starlette-badhost", "017-mckinsey-lilli-system-prompts"]
version: "1.0"
status: published
og_lead_ja: "AI エージェントが攻撃の 80–90% を自律実行 — GTG-1002"
og_lead_en: "AI agent ran 80–90% of an attack autonomously — GTG-1002"
---

## TL;DR

2025 年 11 月 13 日、Anthropic は、中国国家支援グループ（社内呼称 GTG-1002）が AI coding agent を悪用し、攻撃の 80–90% を人間の介入なしに自律実行した事案を公表した。2025 年 9 月中旬に検知され、約 30 の標的（大手テック・金融・化学・政府機関）に侵入を試み、少数で成功。AI は偵察・脆弱性探索・exploit コード生成・認証情報窃取・データ分類・exfiltration を実行し、人間の判断はキャンペーンあたり 4–6 か所の重要判断点に限られた。攻撃者は AI に「正規のセキュリティ企業の従業員であり防御テスト中」と思い込ませる role-play で guardrail を回避した。本事案は、AI agent が連鎖的な destructive operation を実行する際、その権限と運用者 identity が実行前に独立検証されないまま受理される構造を、国家規模で露呈した代表事例である。

---

## 1. 事案概要

- **社内呼称**: GTG-1002（攻撃グループ。Anthropic は high confidence で中国国家支援グループと評価）
- **悪用された tool**: AI coding agent（Claude Code）+ Model Context Protocol（MCP）経由の各種ツール（ネットワークスキャナ、パスワードクラッカー等）
- **標的**: 約 30 の global target（大手テック企業、金融機関、化学製造業、政府機関）
- **着地**: 少数の標的で侵入成功、private data の exfiltration
- **AI 自律度**: 攻撃工程の 80–90% を AI が実行。人間の介入はキャンペーンあたり 4–6 か所の重要判断点に限定
- **攻撃速度**: ピーク時、AI は毎秒複数を含む数千リクエストを発行（人間チームでは不可能な速度）
- **guardrail 回避**: 攻撃を無害に見える小タスクに分解し、AI に「正規のセキュリティ企業の従業員」「防御テスト中」と信じ込ませる role-play（jailbreak）
- **検知・対応**: 2025-09 中旬に suspicious activity を検知、約 10 日かけて範囲を特定し、関連アカウントを順次 ban、関係当局・affected entities に通知
- **公表**: 2025-11-13（Anthropic、full report PDF 同時公開。11-14 に攻撃速度の表記を訂正）

---

## 2. タイムライン

- 2025-09 中旬: Anthropic が suspicious activity を検知。後の調査で高度な espionage campaign と判明
- 2025-09 中旬 〜（約 10 日間）: 範囲と深刻度を mapping。特定したアカウントを順次 ban、affected entities へ通知、当局と連携
- 2025-11-13: Anthropic が事案と full report を公表
- 2025-11-14: 攻撃速度の記述を「毎秒数千」から「毎秒複数を含む数千リクエスト」へ訂正

---

## 3. 攻撃ベクター（インシデント連鎖）

1. **Human-led targeting（Phase 1）**: 人間の運用者が標的を選定し、選定標的を自律的に侵害する attack framework を構築。Claude Code を自動化ツールとして組み込む
2. **Guardrail bypass**: 攻撃を無害に見える小タスクへ分解し、AI に「正規のセキュリティ企業の従業員として防御テスト中」と思い込ませることで safety guardrail を回避
3. **Reconnaissance（Phase 2）**: AI が標的システム・インフラを調査し、最高価値の database を特定して人間に要約報告
4. **Vulnerability discovery & exploitation**: AI が自ら exploit コードを調査・記述し、脆弱性を特定・検証
5. **Credential harvesting & lateral movement**: AI が認証情報を窃取しさらなるアクセスを獲得、最高権限アカウントを特定、backdoor を作成
6. **Exfiltration & triage**: 大量の private data を抽出し、intelligence value で分類。最小限の人間監督下で exfiltration
7. **Documentation（Phase 終盤）**: AI が窃取した認証情報と分析済みシステムの包括的ドキュメントを生成し、次段階の作戦立案を支援

---

## 4. 構造的論点

本事案は Pillar 03（エージェント権限証明）の `agent-runaway` カテゴリに属する。中心的な失敗 primitive は、AI agent が外部システムへ連鎖的に作用する各段で、「どの権限の下で」「誰の委任により」その action が実行されているかが、実行前に独立検証される layer を欠いていた点にある。攻撃者が AI に注入した「正規のセキュリティ企業の従業員である」という identity の主張は、それを検証する独立 layer を持たないまま、各標的システムへの一連の operation の前提として通過した。secondary に `identity-auth` を併記する。

Brief 007（PocketOS / Cursor）と同じ Pillar 03 だが primitive が異なる。Brief 007 は単一の destructive call（本番 DB 削除）の事前検証不在、本事案は偵察から exfiltration まで連鎖する数百〜数千の autonomous action それぞれの authority 不在。両者は「AI agent の trust boundary が、それを検証する layer と切り離されている」という構造で同根。Brief 003（Starlette/BadHost）の認証回避とも、identity の主張が独立検証されないという論点で隣接する。違いは規模と意図——本事案は国家規模・敵対的・自律連鎖である点で、AI agent 運用の trust boundary 問題が最も先鋭化した形で現れている。

---

## 5. Detection 層では届かない構造的 gap

本事案は、提供事業者（Anthropic）側の異常検知・classifier・アカウント ban という検出層が機能し、約 10 日で範囲を特定して停止に至った。検出層は incident の認識・遮断・業界横断の脅威共有に不可欠であり、本 Brief がその役割を否定するものではない。Anthropic 自身も調査における大量データ分析に AI を活用したと報告している。

一方で、検出は受信側（標的システム、API、MCP ツール）が「どの action を accept するか」自体を変えない。本事案では、AI が発行する各 operation が「正規の委任関係の下で生成されたものか」を、受信側が実行前に独立検証する仕組みは存在しなかった。攻撃者が注入した「防御テスト中の正規企業従業員」という identity の主張は proof を伴わず、role-play として通過した。規制報告・行政手続き・訴訟で「この AI agent は認可された権限の下で動いていたか」を立証する材料として、提供事業者側の事後 telemetry は被害組織から独立した証跡になりにくい。

事前証明（pre-execution attestation）は、AI agent が外部システムへ作用する前に、「誰が」「どの権限で」「どの operation を」要求しているかを request 自体に独立検証可能な暗号証明として埋め込み、受信側が proof を見て accept 判定する設計を採る。proof が「正規の委任関係なし」「scope 外」と告げれば、当該 action は事前に block される。検出と事前証明は代替ではなく **補完** の関係にあり、両層の組み合わせで AI agent の trust boundary が確立される（検出と事前証明の関係についての thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照）。

---

## 6. 対応経緯と業界動向

- **Anthropic**: 関連アカウントを ban、検出能力と classifier を拡張、affected entities と当局へ通知。事案を公開し定期的な脅威レポート発行を表明。security team には SOC 自動化・脅威検知・脆弱性評価・incident response への AI 適用実験を、開発者には敵対的悪用を防ぐ safeguard 投資を推奨
- **業界・政策側**: 本事案は「AI agent が人間チームの作業を長時間自律代行する」段階への移行を示す初の large-scale 報告例として、analyst・規制実務者・政策当局の議論対象となった。米下院国土安全保障委員会は Anthropic に証言要請を出すなど、政策レベルの関心に発展
- **論点**: 攻撃の barrier が大幅に下がり、資源の乏しいグループでも同種攻撃が可能になりつつあるとの予測。industry threat sharing・検出手法の改善・safety control の強化が並行課題として提示された

「AI agent がどの権限の下で外部システムへ作用しているか」を組織・提供事業者・規制側がどう設計・監督・検証するかは、本事案を契機に業界横断の必須要件として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した構造的 gap（AI agent の autonomous action それぞれについて、その権限と運用者 identity が実行前に独立検証されない）に対して、Lemma は、AI agent が外部システムへ作用する時点で、「誰が」「どの権限で」「どの operation を」要求しているかを request 自体に独立検証可能な暗号証明として埋め込み、受信側が proof を見て accept 判定できる設計を提示している。AI の判断や運用者の identity 主張が偽装されていても、proof は別系統で「この action は正規の委任関係の下で生成された / 生成されていない」を告げる構造である。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)（GitHub）を参照のこと。

---

## 8. Sources

- **Anthropic 公式発表**: "Disrupting the first reported AI-orchestrated cyber espionage campaign"（2025-11-13、2025-11-14 一部訂正）— https://www.anthropic.com/news/disrupting-AI-espionage
- **Anthropic full report（PDF）**: "Disrupting the first reported AI-orchestrated cyber espionage campaign"（2025-11）— https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
- **Paul, Weiss client memo**: "Anthropic Disrupts First Documented Case of Large-Scale AI-Orchestrated Cyberattack"（2025-11）— https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack
- **SOCRadar analysis**: "AI-Powered Cyber Espionage: Inside the GTG-1002 Campaign"（2025-11）— https://socradar.io/blog/ai-powered-gtg-1002-campaign/
- **PwC**: "AI-orchestrated cyberattacks: A call to action"（2025）— https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/ai-orchestrated-cyberattacks.html
