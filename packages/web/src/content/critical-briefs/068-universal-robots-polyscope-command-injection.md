---
brief_no: 68
title: "Universal Robots PolyScope：未認証のネットワークアクセスだけで産業用ロボットの OS で任意コードが実行できた — ロボットが命令の送り手の権限を物理動作の前に検証しない構造（CISA）"
title_en: "Universal Robots PolyScope: unauthenticated network access yields RCE on industrial robots — the robot doesn't verify the commander's authority before physical action (CVE-2026-8153)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-05-14
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["003-starlette-badhost", "046-servicenow-unauthenticated-api", "007-pocketos-cursor-db-deletion", "033-f5-bigip-edge-pivot", "025-mcp-stdio-config-to-command-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: draft
version: "1.0"
og_lead_ja: "未認証のネット到達だけで産業用ロボットに RCE — UR PolyScope"
og_lead_en: "Unauthenticated network access yields RCE on cobots — UR PolyScope"
gap_detected: "CISA・メーカーの勧告、パッチの提供、ネットワーク分離による露出の遮断は周知・実施できた。"
gap_missing: "「この命令の送り手は、このロボットを操作する正当な権限を持つか」を物理動作の前に確かめる層が無く、ネットワークから届いた命令は素通りした。"
gap_fix: "物理動作の前に「この命令は、正当な権限を持つ送り手の指示か」を Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

協働ロボット Universal Robots の制御ソフト PolyScope 5（5.25.1 より前）に、未認証の攻撃者がロボットの OS で任意コードを実行できる弱点（CVE-2026-8153）があると CISA が警告した。制御ソフトが外部入力を確かめず OS に渡し、ネットワーク到達だけで操作できた。CISA 勧告・パッチ・分離では、この命令の送り手がロボットを操作する正当な権限を持つかを物理動作の前に確かめられない。命令の認可を検証する層そのものが経路上に存在しなかった。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: Universal Robots の協働ロボット（cobot）用制御ソフト PolyScope 5（5.25.1 より前のバージョン）。製造・物流の現場で広く稼働する産業用ロボットの制御基盤
- **公表主体**: CISA（産業用制御システム勧告 ICSA-26-134-17、2026-05-14）。Universal Robots 自身も同脆弱性のセキュリティ勧告を公開。発見者は Claroty Team82 の Vera Mens
- **脆弱性**: CVE-2026-8153（OS コマンドインジェクション、CWE-78 系）。CVSS 3.1 基本値 9.8（Critical）、CVSS 4.0 基本値 9.3
- **手口の核心**: PolyScope の Dashboard Server インターフェースが、利用者の与えた入力を特殊文字の無害化なしに OS へ渡していた。Dashboard Server のポート（既定の待受は TCP 29999）へネットワーク到達できる**未認証の攻撃者**が、細工した入力でロボットの OS 上の任意コマンドを実行できる
- **必要だったもの**: 「ロボットを操作する正当な権限」ではなく「Dashboard Server ポートへのネットワーク到達性」のみ。認証は要求されない
- **想定される影響**: ロボット OS 上での任意コード実行は、制御ロジックの改変・運転の妨害・横展開の足場化につながりうる。製造ラインの実体エージェントが攻撃者の指示で動作する余地が生じる（cyber-physical な安全性に直結）
- **修正**: Universal Robots が PolyScope 5.25.1 で修正をリリース
- **核心**: ロボットは、ネットワーク越しの命令を物理動作として実行する実体エージェントである。その命令の送り手が正当な制御者かを、**動作の前に独立検証していなかった**——認可の検証そのものが経路上に存在しなかった

---

## 2. タイムライン

- （事前）: Universal Robots PolyScope 5 の Dashboard Server に、入力を OS へ無害化せず渡す欠陥が存在
- 2026-05-14: CISA が産業用制御システム勧告 ICSA-26-134-17 を公開し、CVE-2026-8153（CVSS 9.8）を警告。Universal Robots も同脆弱性の勧告を公開し、PolyScope 5.25.1 での修正を案内
- 以降: 運用者に対し、5.25.1 への更新と、Dashboard Server ポートのネットワーク露出の遮断・分離が推奨される

> 注: 本 Brief が扱うのは CVE-2026-8153 の脆弱性とその構造であり、本稿時点で実環境での悪用確認は報告されていない。CISA 勧告と Universal Robots の勧告を名指し・日付の基点とし、規模・手口は一次に基づいて記述する。

---

## 3. 攻撃ベクター

1. **ネットワーク到達**: 攻撃者が、ロボットの PolyScope Dashboard Server が待ち受けるポートへネットワーク経由で到達する。認証は要求されない
2. **無害化されない入力**: Dashboard Server が、利用者の与えた入力を特殊文字の無害化なしに OS のコマンド文字列へ渡す
3. **OS コマンドインジェクション**: 攻撃者が細工した入力で、ロボットの OS 上の任意コマンドを実行する（CVE-2026-8153）
4. **実体エージェントへの影響**: ロボット OS 上のコード実行を足場に、制御ロジックの改変・運転の妨害・保存情報の取得・横展開が成立しうる。物理動作を伴う実体エージェントが、正当な制御者でない指示で動く余地が生じる
5. **修正と緩和**: PolyScope 5.25.1 への更新、および Dashboard Server ポートのネットワーク分離・露出遮断が緩和策となる（露出を断つ事後・周辺の系列）

---

## 4. 構造的論点

本事案は Pillar 03（エージェント権限証明）に属する。中心的な失敗 primitive は、**ロボットという実体エージェントが、物理動作につながる命令の送り手の権限・主体を、動作の前に独立検証していなかった**点にある。Dashboard Server は「ネットワークから届いた命令」を受理して OS に渡すが、「その命令の送り手は、このロボットを操作する正当な権限を持つか」を検証する層を欠いていた。攻撃に必要だったのが権限ではなくネットワーク到達性だけだった、という事実がそれを端的に示す。primary に `identity-auth`（命令ごとの認可）、secondary に `agent-infrastructure`（ロボット制御基盤）と `attribute-proof-bypass`（操作主体の権限属性の独立検証不在）を併記する。

Brief 003（Starlette/BadHost、Host ヘッダー操作で MCP の認証が回避された）・Brief 046（ServiceNow の未認証 API が要求者の認可を実行前に証明していなかった）と同じく、**認可が動作の前に独立検証されないまま特権側に通る**構造で同根。本事案はそれを、ソフトウェア応答ではなく**ロボットの物理動作**という出口で示した点が異なる。Brief 007（AI コーディングエージェントが破壊的権限を独立検証されないまま本番 DB を削除した）とは、エージェントの破壊的・不可逆な行動が認可の独立検証を欠く点で接続する。Brief 033（暗黙に信頼されたエッジ機器の侵害が横展開の足場になった）・Brief 025（MCP の標準設計が広範な RCE 経路になった）とは、基盤上の一点が認可検証を欠いて足場化する構造で連なる。

本事案が際立たせるのは、**エージェント権限証明が、ソフトウェア上のエージェントに限らない**ことだ。Brief 066（乗っ取られた AI ゲートウェイがエージェントの実行フローを操舵する）はソフトウェア側で同じ問いを示したが、本事案は、製造・物流の現場で物理動作を行う実体エージェント（embodied agent）にも、「この動作は、正当な権限を持つ送り手の指示か」を動作の前に独立検証する層が必要であることを示す。命令の送り手の権限が行動ごとに独立検証されて初めて、自律化が進むロボットを工場・倉庫の現場に安心して載せられる。

---

## 5. 検出と証明の落差

CISA・Universal Robots による勧告、PolyScope 5.25.1 への更新、Dashboard Server ポートのネットワーク分離は、露出の抑止に不可欠であり、本 Brief がその役割を否定するものではない。パッチ適用とネットワーク分離は、到達経路を断つ重要な歯止めである。

一方で、ネットワーク監視やパッチは、ロボット側が「いま受け取った命令を、送り手の権限に照らして実行してよいか」を、**動作の前に**独立に検証する材料にはならない。本事案の中核は、Dashboard Server が命令の送り手の認可を検証せず OS に渡したこと——認可の検証そのものが経路上に存在しなかったことにある。ネットワーク分離は「誰が到達できるか」を狭めるが、到達できた相手が正当な制御者かをロボットが確かめるわけではない。異常検知が動作の後に発火しても、コマンドが実行され物理動作が起きた時点での結果は戻せない。監査・安全報告で「このロボットの動作は、正当な権限を持つ指示に基づいていたか」を立証する材料として、ネットワーク到達の記録だけでは、命令の認可の独立した証跡にならない。

事前証明（pre-execution attestation）は、ロボットが受け取る命令を「ネットワークから届いたという事実」ではなく「正当な権限を持つ送り手による、独立検証可能な認可の証明」として扱う設計を採る。起動・運転・プログラム読込のような物理動作につながる命令を、付与者の認可の範囲に対して動作の前に検証すれば、ネットワーク到達だけでは動作は成立しない。ネットワーク到達の検出（detection 的な「誰が届いたか」）と、命令の認可の証明（「その命令は正当な権限に基づくか」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、自律化するロボットを製造・物流の現場に安心して載せられる。

---

## 6. 対応経緯と業界動向

- **Universal Robots**: CVE-2026-8153 のセキュリティ勧告を公開し、PolyScope 5.25.1 で修正をリリース。運用者に更新を案内
- **CISA**: 産業用制御システム勧告 ICSA-26-134-17 を発出し、未認証 RCE のリスクと緩和策（更新・ネットワーク分離・露出最小化）を周知
- **OT / 産業ロボット運用者への推奨**: PolyScope 5.25.1 以降への更新、Dashboard Server ポートのネットワーク露出遮断・分離、制御ネットワークの最小権限化。ロボット制御面を、信頼された内部網だからと無検証で開かない
- **業界横断の論点**: 産業現場でロボットや自律システムの導入が進み、AI エージェントが運転判断に関与する流れの中で、cyber-physical システムの「命令の送り手の権限を動作の前にどう独立検証するか」が安全要件として論点化している。ネットワーク到達性に依拠した暗黙の信頼（位置的信頼）から、行動ごとの認可検証への移行が求められている

命令の送り手の権限を「ネットワークに到達できた＝正当」とみなす暗黙の信頼から、「行動ごとに独立検証される認可の証明」へ移す設計の不在は、特定製品の問題ではなく、ロボット・自律システムを運用する組織横断の課題として共有されつつある。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（実体エージェントが、命令の送り手の権限を物理動作の前に独立検証していない）に対して、Lemma は、エージェント——ソフトウェアか実体かを問わず——の行動を「ネットワーク到達やトークンの提示」ではなく「行動ごとにスコープされ独立検証可能な認可の証明」として裏づける設計を提示している。

- **行動ごとのスコープ認可（proof-as-auth）**: 起動・運転・プログラム読込のような物理動作につながる命令を、付与者の認可の範囲に対して動作の前に独立検証する。ネットワークに到達できたという事実では満たせない、命令ごとの証明に置き換える
- **位置的信頼の排除**: 「内部網から届いた＝正当」という暗黙の信頼を断ち、命令の送り手の権限属性を行動の前に独立検証する設計とする（Brief 033 の位置的信頼・横展開と接続）
- **実体エージェントへの一貫適用**: ソフトウェア上のエージェント（Brief 066 のゲートウェイ）と同じ認可証明の枠組みを、物理動作を伴う実体エージェントにも一貫して適用する
- **選択的開示**: 内部データを出さずに、「この命令は付与者の認可の範囲内である」ことだけを最小開示し、独立検証と運用情報の保護を両立する

これにより、行為の時点で固定された証明が、「このロボットの動作は、正当な権限を持つ送り手の指示に基づくか」を、事後のネットワークログに依存せず独立検証可能なトレイルとして機能させる。検出（事後の監視・パッチ・分離）は露出の是正に、事前証明（動作前の認可の独立検証）は実体エージェントの信頼確立に、それぞれ相補的に働く。

---

## 8. Sources

- **Universal Robots（一次・ベンダー勧告）**: “CVE-2026-8153: Command Injection in the PolyScope 5 Dashboard Server” — <https://www.universal-robots.com/articles/ur/cybersecurity/cve-2026-8153-command-injection-in-the-polyscope-5-dashboard-server/>
- **CISA（一次・ICS 勧告）**: “Universal Robots PolyScope 5”（ICSA-26-134-17、2026-05-14）— <https://www.cisa.gov/news-events/ics-advisories/icsa-26-134-17>（cisa.gov は環境により 403。CIRCL 安定ミラー: <https://vulnerability.circl.lu/vuln/icsa-26-134-17>）
- **SecurityWeek**: “Critical Vulnerability Exposes Industrial Robot Fleets to Hacking” — <https://www.securityweek.com/critical-vulnerability-exposes-industrial-robot-fleets-to-hacking/>
- **SC Media**: “Critical vulnerability in Universal Robots' PolyScope OS allows remote command execution” — <https://www.scworld.com/brief/critical-vulnerability-in-universal-robots-polyscope-os-allows-remote-command-execution>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
