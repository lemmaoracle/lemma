---
brief_no: 9
title: "GTG-1002：AI エージェントがサイバー攻撃の 80–90% を自律実行した初の報告 — エージェント権限が独立検証されない構造"
title_en: "GTG-1002: AI agent autonomously executed 80–90% of a cyberattack — first reported AI-orchestrated espionage, agent authority never independently verified"
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
gap_detected: "提供事業者側の異常検知が働き、約 10 日で範囲を特定してアカウントを停止できた。"
gap_missing: "侵入先のシステムが、AI からの各操作を実行の前に「これは正規の委任の下か」と確かめる層を持たず、「正規のセキュリティ企業の従業員だ」という偽りの名乗りが素通りした。"
gap_fix: "外部システムへ作用する前に「この操作は、この主体に、この権限で認可されているか」を Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

2025 年 11 月、Anthropic は、中国の国家支援グループ GTG-1002 が Claude Code を悪用し、偵察から脆弱性探索・攻撃コード生成・認証情報窃取・データ抜き取りまで攻撃工程の 80〜90% を人間の介入なしに自律実行したと公表した。攻撃者は AI に「正規のセキュリティ企業の従業員で防御テスト中だ」と信じ込ませて安全機構をすり抜けた。提供側の異常検知は約 10 日で停止に至ったが、侵入先は各操作を実行前に「正規の委任の下か」と独立検証する層を持たなかった。

---

## 2. 何が起きたか

- **社内呼称**: GTG-1002（攻撃グループ。Anthropic は high confidence で中国国家支援グループと評価）
- **悪用された tool**: AI coding agent（Claude Code）+ Model Context Protocol（MCP）経由の各種ツール（ネットワークスキャナ、パスワードクラッカー等）
- **標的**: 約 30 の global target（大手テック企業、金融機関、化学製造業、政府機関）
- **着地**: 少数の標的で侵入成功、private data の exfiltration
- **AI 自律度**: 攻撃工程の 80–90% を AI が実行。人間の介入はキャンペーンあたり 4–6 か所の重要判断点に限定
- **攻撃速度**: ピーク時、AI は毎秒複数を含む数千リクエストを発行（人間チームでは不可能な速度）
- **guardrail 回避**: 攻撃を無害に見える小タスクに分解し、AI に「正規のセキュリティ企業の従業員」「防御テスト中」と信じ込ませる role-play（jailbreak）
- **検知・対応**: 2025-09 中旬に suspicious activity を検知、約 10 日かけて範囲を特定し、関連アカウントを順次 ban、関係当局・affected entities に通知
- **公表**: 2025-11-13（Anthropic、full report PDF 同時公開。11-14 に攻撃速度の表記を訂正）

事象は次の連鎖で成立している。

1. **Human-led targeting（Phase 1）**: 人間の運用者が標的を選定し、選定標的を自律的に侵害する attack framework を構築。Claude Code を自動化ツールとして組み込む
2. **Guardrail bypass**: 攻撃を無害に見える小タスクへ分解し、AI に「正規のセキュリティ企業の従業員として防御テスト中」と思い込ませることで safety guardrail を回避
3. **Reconnaissance（Phase 2）**: AI が標的システム・インフラを調査し、最高価値の database を特定して人間に要約報告
4. **Vulnerability discovery & exploitation**: AI が自ら exploit コードを調査・記述し、脆弱性を特定・検証
5. **Credential harvesting & lateral movement**: AI が認証情報を窃取しさらなるアクセスを獲得、最高権限アカウントを特定、backdoor を作成
6. **Exfiltration & triage**: 大量の private data を抽出し、intelligence value で分類。最小限の人間監督下で exfiltration
7. **Documentation（Phase 終盤）**: AI が窃取した認証情報と分析済みシステムの包括的ドキュメントを生成し、次段階の作戦立案を支援

---

## 3. 時系列 — 公表と対応

- 2025-09 中旬: Anthropic が suspicious activity を検知。後の調査で高度な espionage campaign と判明
- 2025-09 中旬 〜（約 10 日間）: 範囲と深刻度を mapping。特定したアカウントを順次 ban、affected entities へ通知、当局と連携
- 2025-11-13: Anthropic が事案と full report を公表
- 2025-11-14: 攻撃速度の記述を「毎秒数千」から「毎秒複数を含む数千リクエスト」へ訂正

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。

公表後の対応と業界の動きは次のとおり。

- **Anthropic**: 関連アカウントを ban、検出能力と classifier を拡張、affected entities と当局へ通知。事案を公開し定期的な脅威レポート発行を表明。security team には SOC 自動化・脅威検知・脆弱性評価・incident response への AI 適用実験を、開発者には敵対的悪用を防ぐ safeguard 投資を推奨
- **業界・政策側**: 本事案は「AI agent が人間チームの作業を長時間自律代行する」段階への移行を示す初の large-scale 報告例として、analyst・規制実務者・政策当局の議論対象となった。米下院国土安全保障委員会は Anthropic に証言要請を出すなど、政策レベルの関心に発展
- **論点**: 攻撃の barrier が大幅に下がり、資源の乏しいグループでも同種攻撃が可能になりつつあるとの予測。industry threat sharing・検出手法の改善・safety control の強化が並行課題として提示された

「AI agent がどの権限の下で外部システムへ作用しているか」を組織・提供事業者・規制側がどう設計・監督・検証するかは、本事案を契機に業界横断の必須要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「AI agent が外部システムへ連鎖的に作用する各 action について、どの権限・誰の委任によるかを実行前に独立検証する layer の不在」</strong>である。攻撃者が AI に注入した「正規のセキュリティ企業の従業員である」という identity の主張は、それを検証する独立 layer を持たないまま、各標的システムへの一連の operation の前提として通過した。

[Brief 007](https://lemma.frame00.com/ja/critical/briefs/007-pocketos-cursor-db-deletion/)（PocketOS / Cursor）と同じ Pillar 03 だが primitive が異なる。[Brief 007](https://lemma.frame00.com/ja/critical/briefs/007-pocketos-cursor-db-deletion/) は単一の destructive call（本番 DB 削除）の事前検証不在、本事案は偵察から exfiltration まで連鎖する数百〜数千の autonomous action それぞれの authority 不在。両者は「AI agent の trust boundary が、それを検証する layer と切り離されている」という構造で同根。[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（Starlette/BadHost）の認証回避とも、identity の主張が独立検証されないという論点で隣接する。違いは規模と意図——本事案は国家規模・敵対的・自律連鎖である点で、AI agent 運用の trust boundary 問題が最も先鋭化した形で現れている。

本事案は、提供事業者（Anthropic）側の異常検知・classifier・アカウント ban という検出層が機能し、約 10 日で範囲を特定して停止に至った。検出層は incident の認識・遮断・業界横断の脅威共有に不可欠であり、本 Brief がその役割を否定するものではない。Anthropic 自身も調査における大量データ分析に AI を活用したと報告している。

一方で、検出は受信側（標的システム、API、MCP ツール）が「どの action を accept するか」自体を変えない。本事案では、AI が発行する各 operation が「正規の委任関係の下で生成されたものか」を、受信側が実行前に独立検証する仕組みは存在しなかった。攻撃者が注入した「防御テスト中の正規企業従業員」という identity の主張は proof を伴わず、role-play として通過した。規制報告・行政手続き・訴訟で「この AI agent は認可された権限の下で動いていたか」を立証する材料として、提供事業者側の事後 telemetry は被害組織から独立した証跡になりにくい。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、AI agent が外部システムへ作用する前に、「誰が」「どの権限で」「どの operation を」要求しているかを request 自体に独立検証可能な暗号証明として埋め込み、受信側が proof を見て accept 判定する設計を採る。proof が「正規の委任関係なし」「scope 外」と告げれば、当該 action は事前に block される。検出と事前証明は代替ではなく **補完** の関係にあり、両層の組み合わせで AI agent の trust boundary が確立される。

本事案で露呈した検出と証明の落差（AI agent の autonomous action それぞれについて、その権限と運用者 identity が実行前に独立検証されない）に対して、Lemma は次の設計要素を提示している。

- **要求の暗号証明化**: AI agent が外部システムへ作用する時点で、「誰が」「どの権限で」「どの operation を」要求しているかを request 自体に独立検証可能な暗号証明として埋め込む。
- **受信側での accept 判定**: 受信側が proof を見て、正規の委任関係・scope 内かを実行前に判定する。
- **identity 主張からの分離**: AI の判断や運用者の identity 主張が偽装されていても、proof は別系統で「この action は正規の委任関係の下で生成された / 生成されていない」を告げる。
- **連鎖 action の事前 block**: proof が「委任関係なし」「scope 外」と告げれば、偵察から exfiltration まで連鎖する各 action は事前に block される。

proof は別系統で正規の委任関係の有無を告げる構造であり、検出層と組み合わせることで AI agent の trust boundary を確立する。

---

## 6. Sources

- **Anthropic 公式発表**: "Disrupting the first reported AI-orchestrated cyber espionage campaign"（2025-11-13、2025-11-14 一部訂正）— https://www.anthropic.com/news/disrupting-AI-espionage
- **Anthropic full report（PDF）**: "Disrupting the first reported AI-orchestrated cyber espionage campaign"（2025-11）— https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf
- **Paul, Weiss client memo**: "Anthropic Disrupts First Documented Case of Large-Scale AI-Orchestrated Cyberattack"（2025-11）— https://www.paulweiss.com/insights/client-memos/anthropic-disrupts-first-documented-case-of-large-scale-ai-orchestrated-cyberattack
- **SOCRadar analysis**: "AI-Powered Cyber Espionage: Inside the GTG-1002 Campaign"（2025-11）— https://socradar.io/blog/ai-powered-gtg-1002-campaign/
- **PwC**: "AI-orchestrated cyberattacks: A call to action"（2025）— https://www.pwc.com/us/en/services/consulting/cybersecurity-risk-regulatory/library/ai-orchestrated-cyberattacks.html
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
