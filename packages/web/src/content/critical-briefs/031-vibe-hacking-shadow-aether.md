---
brief_no: 31
title: "AI エージェントが初期侵入から情報持ち出しまでを実行した — 署名ベースの検出は、AI が標的ごとに作るツールを追えない(SHADOW-AETHER-040 / 064)"
title_en: "AI Agents Drove Intrusions From Initial Access to Exfiltration — Signature-Based Detection Cannot Track Tooling the AI Generates Per Target (SHADOW-AETHER-040 / 064)"
pillar: "03-agent-authority"
primary_category: "agent-runaway"
secondary_categories: ["agent-infrastructure", "identity-auth"]
incident_date: 2026-05-11
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["009-gtg1002-ai-orchestrated-espionage", "026-adaptive-ai-worm-runtime-exploit", "007-pocketos-cursor-db-deletion"]
version: "1.0"
status: published
og_lead_ja: "AI が侵入から情報持ち出しまでを自律実行 — SHADOW-AETHER"
og_lead_en: "AI agents ran intrusions end to end — SHADOW-AETHER"
gap_detected: "脅威リサーチ企業 Trend Micro が、両キャンペーンの手口・痕跡（IOC）を特定して公表し、防御側に共有できた。"
gap_missing: "AI が標的ごとに新しい攻撃ツールを作るため「既知の悪いもの」を照合する検出は後追いになり、社内で何を実行してよいかを行動の前に確かめる層が無かった。"
gap_fix: "未知のツールであっても「この操作は、正規に認可された来歴を持つか」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

セキュリティ企業 Trend Micro が、ラテンアメリカの政府機関・金融機関を狙った 2 つの攻撃キャンペーンを公表した。AI エージェントが、最初の侵入から内部での情報持ち出しまでをほぼ自力でやり遂げた、ごく初期の実地事例である。一方のキャンペーンは 2025 年末から動き、メキシコの 6 政府機関を侵害した。決定的だったのは、AI が出来合いの攻撃ツールを使わず標的ごとに新しいツールを作り続けたため、「既知の悪いツールを照合する」従来型の検出が捕まえにくくなった点である。

---

## 1. 事案概要

- **対象**: ラテンアメリカの政府機関・金融機関(他に航空・小売も含む)
- **公表**: 2026-05-11、Trend Micro(TrendAI Research)
- **キャンペーン**:
  - **SHADOW-AETHER-040**(スペイン語話者): 2025 年末から活動。2025-12-27〜2026-01-04 にメキシコの 6 政府機関を侵害。AI エージェントの支援でキルチェーン全体(初期侵入→横展開→データ窃取)を実行
  - **SHADOW-AETHER-064**(ポルトガル語話者): 2026 年 4 月以降。ブラジルの金融機関を標的。脆弱な JBoss AS サーバーを侵害し webshell 設置、Chisel 等で SOCKS5 トンネルを構築
- **共通点**: ProxyChains と SSH で被害組織内部へトンネルを確立し、AI エージェントが内部ネットワークへ直接攻撃を実行。Chisel / Neo-reGeorg / CrackMapExec / Impacket を共用
- **悪用の核心**: AI エージェントが攻撃ツール・スクリプトを**動的生成**(SHADOW-AETHER-040 は AI 生成の Python バックドア `implante_http` を使用)。既製ツールの署名に依存する検出を回避
- **エージェントの使い方**: SHADOW-AETHER-040 は AI に全委任せず、監督つきのアシスタントとして使用(逸脱時は中断・修正)。Shodan・VulDB を AI に接続して攻撃面・脆弱性情報を取得。被害ごとに専用フォルダを作り、攻撃手順と収集情報を Markdown で文書化して AI の作業記憶(operational knowledge base)とし、文脈を復元しながら作業を継続
- **帰属**: 両者はツール・戦術が酷似するが、スクリプト・バイナリの言語(スペイン語/ポルトガル語)から別グループと判断。AI 支援攻撃が単一アクターでなく複数グループに広がる兆候

---

## 2. タイムライン

- 2025 年末: SHADOW-AETHER-040 の活動開始(Trend Micro が追跡)
- 2025-12-27〜2026-01-04: SHADOW-AETHER-040 がメキシコの 6 政府機関を侵害、AI エージェントの支援でデータ窃取に至るケースを含む
- 2026-04 以降: SHADOW-AETHER-064 がブラジルの金融機関を標的に活動を確認
- 2026-05-11: Trend Micro(TrendAI Research)が両キャンペーンを公表

---

## 3. 攻撃ベクター

1. **初期侵入**: 脆弱な公開サーバー(SHADOW-AETHER-064 は JBoss AS)を侵害し webshell を設置。Shodan / VulDB で攻撃面と脆弱性を特定
2. **トンネル確立**: Chisel 等で SOCKS5 トンネルと ProxyChains + SSH を構築し、AI エージェントが被害内部ネットワークへ直接到達
3. **AI によるツール動的生成**: 既製ツールに頼らず、標的環境に合わせて攻撃ツール・スクリプトを AI が逐次生成(`implante_http` 等)。署名ベース検出を回避
4. **作業記憶の維持**: 被害ごとのフォルダに手順・収集情報を Markdown で蓄積し、AI が文脈を復元して未完了タスクを継続
5. **キルチェーン実行**: 初期侵入→横展開→データ窃取まで、AI エージェントの支援で進行。SHADOW-AETHER-040 は人間が監督し逸脱時に修正

---

## 4. 構造的論点

本事案は Pillar 03(エージェント権限証明)の `agent-runaway` カテゴリに属する。中心的な失敗 primitive は、**攻撃に使われるツール・操作が標的ごとに AI 生成され固有の署名を持たないため、「既知の悪性物を照合する」という検出の前提が崩れる**点にある。secondary に `agent-infrastructure`(AI に接続された Shodan/VulDB・トンネル基盤)と `identity-auth` を併記する。

Brief 009(GTG-1002)・026(自律 AI ワーム)と同じ「AI が攻撃の実行主体になる」系統である。009 は Anthropic が公表した国家支援アクターによる Claude Code 悪用(攻撃の 80–90% を自律実行)、026 は実行時に攻撃戦略を生成する脅威モデル。本事案は、その primitive が**Trend Micro により実地で観測された複数の独立キャンペーン**として確認された点で、009/026 を現実の損失・侵害として裏づける。とりわけ「ツールを使い回さず標的ごとに生成する」という運用は、検出が依拠する IOC・ツール署名・既知 TTP の安定性そのものを掘り崩しており、防御側が「何が悪性か」を事前に列挙できないことを示す。

また、SHADOW-AETHER-040 と 064 が言語以外で酷似していた事実は、AI 支援攻撃が単一の高度アクターの専有でなく、**異なるグループに同型の運用として拡散**していることを示す。これは「AI が攻撃のコストと再現性を変えた」というシグナルであり、単発の脆弱性ニュースより射程が長い。

---

## 5. 検出と証明の落差

Trend Micro のような脅威リサーチによるキャンペーン特定・IOC 提供・MITRE ATT&CK へのマッピングは、被害把握・封じ込め・防御強化に不可欠であり、本 Brief がその役割を否定するものではない。本事案でも詳細な TTP と IOC が公開された。

一方で、検出は「環境内で何が実行されてよいか」自体を変えない。本事案の核心は、AI が標的ごとに生成するツールに安定した署名がなく、IOC や既知ツール照合が原理的に後追いになる点にある。生成されたバックドアやスクリプトは、観測・解析されて初めて IOC 化されるが、次の標的では別物が生成される。欠けていたのは「この環境で実行されようとしている操作・ツールは、正規に認可され来歴が確認されたものか」という実行前の独立検証であり、これは既知物の検出とは別系統である。監査の観点でも、侵害後に「どの操作が・誰の認可で・どの経路で実行されたか」を立証する独立した証跡は、ログとフォレンジックの突合以上には残りにくい。

事前証明(pre-execution attestation)は、検出を「既知の悪性物の照合」から、「実行されようとしている操作・コードが認可され来歴を持つかの実行前検証」へと反転させる設計を採る。ツールが未知・新規生成であっても、proof が「この操作は正規に認可された来歴を持たない」と告げれば実行は事前に block される。署名ベースの検出(detection 的な「既知の悪性か」)と操作の事前証明(「これは認可・来歴のある実行か」)は代替ではなく**補完**の関係にあり、攻撃ツールが AI 生成で署名を持たない世界では後者の比重が増す。

---

## 6. 対応経緯と業界動向

- **Trend Micro(TrendAI Research)**: 両キャンペーンを特定・公表し、MITRE ATT&CK の TTP と IOC を提示。継続追跡を表明。AI エージェントが初期侵入から持ち出しまでを実行した最初期の観測事例と位置づけ
- **業界横断の論点**: 攻撃側の AI 活用は予測されてきたが、本事案は「予測」から「複数の独立キャンペーンとして観測」へ移行した点で節目となる。ツールの動的生成による署名検出の回避は、IOC・シグネチャ中心の防御モデルの限界を実地で示し、実行時の認可・来歴検証へ防御の重心を移す議論を後押しする
- **位置づけの注意**: 本事案は、別途公表されている国家支援アクターによる AI 自律攻撃(Brief 009 = GTG-1002)とは別個のキャンペーンである。両者は「AI が攻撃の実行主体になる」点で同根だが、アクター・標的・公表元が異なるため related で結ぶ

---

## 7. Lemma による分析

本事案で露呈した構造的な問題(攻撃ツールが標的ごとに AI 生成され固有署名を持たないため、既知物照合に依拠する検出が後追いになる)に対して、Lemma は、検出を「既知の悪性物の照合」から「実行されようとする操作・コードの認可と来歴の実行前検証」へ反転させる設計を提示している。ツールが未知でも、操作の認可・来歴の proof が成立しなければ実行は事前に reject される。

---

## 8. Sources

- **Trend Micro (TrendAI Research)**: "Vibe Hacking: Two AI-Augmented Campaigns Target Government and Financial Sectors in Latin America"(2026-05-11、キャンペーン詳細・TTP・IOC・MITRE ATT&CK)— https://www.trendmicro.com/en_us/research/26/e/vibe-hacking-two-ai-augmented-campaigns-target-government-and-financial-sectors-in-latin-america.html
- **Dark Reading**: "LatAm Vibe Hackers Generate Custom Hacking Tools on the Fly"(2026-05)— https://www.darkreading.com/cloud-security/ai-agents-generate-custom-hacking-tools

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
