---
brief_no: 17
title: "McKinsey Lilli のシステムプロンプト書き換え可能性 — AI の挙動を統治する層に完全性も来歴もなかった"
title_en: "McKinsey Lilli's Writable System Prompts — The Layer Governing the AI's Behavior Had No Integrity or Provenance"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["identity-auth", "agent-runaway"]
incident_date: 2026-02-28
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["005-noroboto-lying-fonts", "009-gtg1002-ai-orchestrated-espionage", "018-hackerbot-claw-ai-vs-ai"]
version: "1.0"
status: published
og_lead_ja: "AI の挙動を統治する層に完全性も来歴もなかった — McKinsey Lilli システムプロンプト"
og_lead_en: "The layer governing the AI's behavior had no integrity or provenance — McKinsey Lilli"
---

## TL;DR

2026 年 2 月、レッドチーム企業 CodeWall の自律オフェンシブ AI エージェントが、McKinsey の社内向け生成 AI プラットフォーム「Lilli」を、認証情報も内部知識もない状態から 2 時間足らずで本番データベースへの完全な read/write アクセスに到達させた。露呈した最も重大な gap は、**Lilli の挙動を統治する 95 件の system prompt がすべて書き込み可能**だった点である。攻撃者はこれを悪用すれば、Lilli の回答・遵守するガードレール・出典の引用の仕方を**サイレントに改ざん**し、同社従業員の 72% が日常利用するチャットボットの出力を毒できた。本事案は実被害ではなく責任ある開示を伴う red-team 実証だが、AI の判断を統治する層（system prompt）と出力の完全性・来歴が独立検証されないという Pillar 02（検証可能 AI）の構造的 gap を、marquee なエンタープライズ AI 運用で露呈した。

---

## 1. 事案概要

- **対象**: McKinsey & Company の社内向け生成 AI プラットフォーム「Lilli」（2023 年 7 月公開、同社従業員の 72% が日常業務で利用）
- **実証主体**: レッドチームセキュリティ企業 CodeWall。自律オフェンシブ AI エージェント（出所は CodeWall 自社ブログの主張、The Register が報道）
- **前提**: 認証情報・内部知識ゼロから開始。McKinsey が責任ある開示ポリシー（HackerOne）を公開していたためガードレール内で実施
- **侵入経路**: 200 超のエンドポイントで公開 API 仕様書を発見、うち 22 件が認証未実装。1 件が DB にユーザー検索クエリを書き込み、値はパラメータ化されていたが JSON キーが SQL に直接連結 → DB エラーメッセージに JSON キーが反映される SQL インジェクション（OWASP ZAP では未検知）
- **到達点**: 人間の介入なしに 2 時間足らずで本番 DB への完全な read/write アクセス。チャットメッセージ 4,650 万件（戦略・M&A・顧客対応、全て平文）、ファイル 72.8 万件（機密顧客データ含む）、ユーザーアカウント 5.7 万件、**Lilli の挙動を制御する system prompt 95 件（すべて書き込み可能）**にアクセス可能
- **最重大の primitive**: SQLi が read/write だったため、system prompt をサイレントに書き換え、Lilli の回答内容・ガードレール・出典引用の挙動を改ざんできる状態だった
- **対応**: CodeWall が 2 月末に SQLi を発見、3 月 1 日に攻撃チェーン全体を開示。McKinsey は翌日までに認証未実装エンドポイントを修正、開発環境をオフライン化、公開 API 仕様書をブロックし、特定された問題を数時間内に修正。顧客データ・機密情報が CodeWall または第三者にアクセスされた形跡はないと声明
- **公表**: 2026-03-09（The Register / CodeWall ブログ）

---

## 2. タイムライン

- 2023-07: McKinsey が Lilli を社内公開
- 2026-02: CodeWall の自律 AI エージェントが認証情報なしでレッドチーミング開始。アタックサーフェスをマッピングし、22 件の認証未実装エンドポイントを発見
- 2026-02 下旬: SQL インジェクションを発見。15 回程度の反復でクエリ構造を露呈させ、従業員識別子など実データに到達。2 時間足らずで本番 DB への完全 read/write
- 2026-03-01: CodeWall が攻撃チェーン全体を McKinsey へ開示
- 2026-03-02 前後: McKinsey が認証未実装エンドポイントを修正、開発環境オフライン化、公開 API 仕様書をブロック。数時間内に全問題を修正
- 2026-03-09: The Register と CodeWall ブログで公表

---

## 3. 事象連鎖（手法の分解）

1. **自律的な標的選定**: CodeWall のエージェントが、責任ある開示ポリシーの存在と Lilli の最近のアップデートを理由に、自ら McKinsey を標的として提案
2. **アタックサーフェスのマッピング**: 認証情報ゼロから 200 超のエンドポイントを発見、公開 API 仕様書を取得。22 件が認証未実装
3. **SQLi の発見**: 値はパラメータ化されていたが JSON キーが SQL に直接連結。DB エラーメッセージへの JSON キー反映から SQLi を認識（OWASP ZAP は未検知）
4. **反復による構造露呈**: エラーメッセージを手がかりに反復し、15 回程度でクエリ構造を解明、実データに到達
5. **完全 read/write 到達**: 2 時間足らずで本番 DB 全体への read/write。チャット 4,650 万件・ファイル 72.8 万件・アカウント 5.7 万件・system prompt 95 件にアクセス可能
6. **挙動統治層の改ざん可能性**: read/write だったため、Lilli の挙動を制御する system prompt をサイレントに書き換え、回答・ガードレール・出典引用を改ざん可能な状態だった（最重大の primitive）

---

## 4. 構造的論点

本事案は Pillar 02（検証可能 AI）の `ai-decision-integrity` カテゴリに属する。中心的な失敗 primitive は、AI（Lilli）の判断を統治する層——system prompt——と、その出力に、完全性・来歴を独立検証する仕組みが無かった点にある。プロンプトが書き換え可能で、かつ書き換えを独立検証できないため、チャットボットの回答・ガードレール・出典引用がサイレントに改ざんされても、利用する数万人のコンサルタントはそれを真正な出力と区別できない。secondary に `identity-auth`（認証未実装エンドポイント）と `agent-runaway`（自律オフェンシブ AI エージェント）を併記する。

Brief 005（Noroboto、フォント偽装による AI 文書レビューの誤誘導）と同じ Pillar 02 だが対象が異なる。Brief 005 は AI への **入力** の改ざんで判定を歪めた事案、本事案は AI の **挙動を統治する指示（system prompt）と出力** の完全性・来歴の不在。両者は「AI の判断が、その根拠の真正性を独立検証する layer と切り離されている」という構造で同根。Brief 009（GTG-1002）とは別の primitive だが、自律 AI エージェントが偵察から exfiltration までを人間の介入なしに実行した点で隣接し、本事案は「攻撃側の自律化」が red-team 実証として現実化したことを示す。本事案は実被害ではなく責任ある開示を伴う実証であり、Brief 008（Discord scraping）・011（SynthID）と同じ「攻撃 incident ではない信頼層リスク事象」の枠で扱う。

---

## 5. Detection 層では届かない構造的 gap

脆弱性スキャン・WAF・SOC 監視は、本事案のような認証未実装エンドポイントや異常アクセスの発見に有用であり、本 Brief がその役割を否定するものではない。実際、McKinsey は開示を受けて数時間内に全問題を修正した。ただし本事案では、自動スキャナ（OWASP ZAP）が当該 SQLi を検知できなかったように、検出は万能ではない。

より本質的なのは、検出が「AI の出力やそれを統治する指示が真正か」を独立に保証しない点である。system prompt が書き換えられても、Lilli の出力は表面上は正常に見える。利用者（コンサルタント）が「この回答は正規の、改ざんされていない指示に基づくものか」を判定する手段が無ければ、サイレントな改ざんは検出をすり抜ける。規制報告・監査・訴訟で「この AI の出力は正規の統治指示の下で生成されたか」を立証する材料として、アクセスログや事後の脆弱性修正は、出力そのものの真正性の独立した証跡にはならない。

事前証明（pre-execution attestation）は、AI の挙動を統治する指示（system prompt 等）と出力に、「正規の・認可された・改ざんされていない指示の下で生成された」ことを独立検証可能な暗号証明として紐づけ、利用者・監査者が出力の真正性を検証できる設計を採る。指示が書き換えられれば proof は不整合となり、改ざんされた出力は真正なものと区別できる。脆弱性検出(detection)と出力・統治指示の完全性証明(proof)は代替ではなく **補完** の関係にある(検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照)。

---

## 6. 対応経緯と業界動向

- **McKinsey**: 責任ある開示を受け、認証未実装エンドポイントの修正・開発環境のオフライン化・公開 API 仕様書のブロックを数時間内に実施。顧客データ・機密情報が CodeWall または第三者にアクセスされた形跡はないと声明
- **CodeWall**: 自律オフェンシブ AI エージェントの能力として公表。CEO は「攻撃者も同じ技術・戦略で無差別攻撃を行うようになる」と警告し、金銭目的の攻撃者による AI エージェント悪用への懸念を示した
- **業界横断の論点**: 生成 AI プラットフォームの本番運用で、(1) 認証・API 公開範囲の管理、(2) AI の挙動を統治する system prompt の完全性・来歴の保護、(3) 攻撃側の AI エージェント自律化、が同時に論点化。エンタープライズ AI 導入における「AI の出力と統治指示の真正性をどう証明するか」が新たな必須要件として浮上

「AI の判断を統治する層と出力の真正性を、運用者・監査者がどう独立検証するか」は、本事案を契機にエンタープライズ AI 運用の論点として進む見込み。

---

## 7. Lemma による分析

本事案で露呈した構造的 gap（AI の挙動を統治する system prompt と出力に、完全性・来歴を独立検証する仕組みが無い）に対して、Lemma は、AI の統治指示と出力に「正規の・認可された・改ざんされていない指示の下で生成された」ことを独立検証可能な暗号証明として紐づける設計を提示している。system prompt がサイレントに書き換えられても、出力に伴う proof は別系統で不整合を告げるため、利用者・監査者は改ざんされた出力を真正なものと区別できる。Lemma は脆弱性検出やアクセス制御を否定するものではなく、検出に対して「AI の出力と統治指示の真正性の証明」を補完する層を提供する。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、リファレンス実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)（GitHub）を参照のこと。

---

## 8. Sources

- **The Register**: "AI agent hacked McKinsey chatbot for read-write access"（2026-03-09）— https://www.theregister.com/2026/03/09/mckinsey_ai_chatbot_hacked/
- **CodeWall 公式ブログ**: "How We Hacked McKinsey's AI Platform"（2026-03、攻撃チェーン・到達点の一次主張）— https://codewall.ai/blog/how-we-hacked-mckinseys-ai-platform
- **BankInfoSecurity**: "Autonomous Agent Hacked McKinsey's AI in 2 Hours"（2026-03）— https://www.bankinfosecurity.com/autonomous-agent-hacked-mckinseys-ai-in-2-hours-a-31007
- **Outpost24**: "How an AI Agent Hacked McKinsey's AI Platform"（2026-03、技術解説）— https://outpost24.com/blog/ai-agent-hacked-mckinsey-ai-platform/

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する脅威インテリジェンス・ブリーフです。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

[Discovery Call →](https://tally.so/r/EkBqDX)
[ホワイトペーパー →](https://tally.so/r/xX0VYv)
[✉️ ニュースレター →](https://tally.so/r/EkMj82?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
