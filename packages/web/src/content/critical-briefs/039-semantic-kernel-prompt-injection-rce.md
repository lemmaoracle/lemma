---
brief_no: 39
title: "Semantic Kernel：プロンプトインジェクションが、ホストのコード実行（RCE）に変わった — エージェントが呼べる関数とパラメータが、実行の前に認可・検証されない構造（CVE-2026-25592／CVE-2026-26030）"
title_en: "Semantic Kernel: Prompt Injection Turned Into Host-Level Remote Code Execution — the functions and parameters an agent can call are not authorized or verified before execution (CVE-2026-25592 / CVE-2026-26030)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["ai-decision-integrity", "code-provenance"]
incident_date: 2026-05-07
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["025-mcp-stdio-config-to-command-rce", "027-librechat-mcp-url-secrets", "003-starlette-badhost", "037-agent-config-auto-execution", "047-openclaw-agent-phishing"]
status: published
version: "1.0"
og_lead_ja: "Semantic Kernel で、プロンプトインジェクションがホストの RCE に直結した"
og_lead_en: "In Semantic Kernel, prompt injection led directly to host-level RCE"
gap_detected: "脆弱性スキャン・CVE 開示・パッチ適用により、既知の悪用経路の特定と遮断はできた。"
gap_missing: "LLM が呼べる関数とパラメータが、実行の前に「この呼び出しは認可・スコープされているか」を独立検証されないまま、注入され得るモデル出力から直接駆動された。"
gap_fix: "関数を実行に移す前に「この呼び出しは、許可された権限の範囲内にある」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Microsoft の AI エージェント基盤 Semantic Kernel に、プロンプトインジェクションがホストレベルのコード実行（RCE）や任意のファイル書き込みに直結し得る二つの脆弱性が見つかり、2026-05-07 に開示された。.NET SDK の CVE-2026-25592（CVSS 10.0）は、`DownloadFileAsync` が意図せず `[KernelFunction]` として露出し、LLM が直接呼び出せたうえ、保存先パス（`localFilePath`）がほぼモデルの制御下で経路検証もなかった。Python SDK の CVE-2026-26030 は、In-Memory Vector Store を Search Plugin の既定設定で使う構成で、注入された一つのプロンプトがホストの RCE に至り得た。エージェントが呼べる関数とそのパラメータが、実行の前に「この呼び出しは認可・スコープされているか」を独立検証されないまま、モデルの出力（注入され得る入力）から直接駆動されていた。検出・パッチは機能したが、行動の前に呼び出しを認可する層が無かった。

---

## 2. 何が起きたか

- **対象**: Microsoft Semantic Kernel（AI エージェント基盤。GitHub スター 27,000 超、エンタープライズで広く利用）。.NET SDK と Python SDK
- **開示**: 2026-05-07、Microsoft が二つの脆弱性を開示（パッチ済み）
- **CVE-2026-25592（.NET SDK、CVSS 10.0、サンドボックス脱出）**: `DownloadFileAsync` が意図せず `[KernelFunction]` 属性付きで露出し、LLM が直接呼び出せる状態だった。保存先パス（`localFilePath`）がほぼモデルの制御下にあり、経路検証がほとんど無かったため、任意のファイル書き込み・サンドボックス脱出に至り得た
- **CVE-2026-26030（Python SDK、ホスト RCE）**: エージェントが In-Memory Vector Store を Search Plugin のバックエンドとして既定のフィルタ挙動で使い、かつ攻撃者がエージェントの入力にプロンプトインジェクションの経路を持つ場合、細工した一つのプロンプトがホストレベルの RCE に至り得た。プロンプトインジェクションを「出力の完全性の問題」から「実行の問題」へと再分類する事例
- **悪用の核心**: いずれも、LLM が呼び出せる関数（とそのパラメータ）が、実行の前に認可・スコープ・検証されていなかった。注入され得るモデル出力が、ホストに触れる関数を直接駆動できた
- **パッチ**: semantic-kernel 1.39.4（Python）、1.71.0（.NET）で修正
- **文脈**: AI エージェント基盤で、ツール／関数呼び出しの設計がプロンプトインジェクションを実行（RCE）に変える経路になる事例が 2026 年に相次いで報告されている

事象は次の連鎖で成立している。

1. **関数の意図せぬ露出**: `DownloadFileAsync` のようなホストに触れる関数が、意図せず `[KernelFunction]` として LLM から呼び出し可能な状態で露出する
2. **パラメータのモデル制御**: 呼び出しのパラメータ（保存先パス等）がほぼモデルの制御下にあり、経路検証・スコープ制限がほとんど無い
3. **注入経路の確立**: 攻撃者が、エージェントの入力（ドキュメント・検索結果・外部データ等）にプロンプトインジェクションの経路を持つ
4. **注入から実行へ**: 細工された一つのプロンプトが、露出した関数を呼ばせ、モデル制御のパラメータと検証不在を突いて、ホストレベルの RCE・任意ファイル書き込みに至る
5. **影響の拡大**: 基盤が広く使われているため、同型の構成を持つエージェント実装に横展開し得る（パッチ前）

---

## 3. 時系列 — 公表と対応

- 2026-05-07: Microsoft が Semantic Kernel の二つの脆弱性（CVE-2026-25592／CVE-2026-26030）を開示。プロンプトインジェクションが RCE・任意ファイル書き込みに至り得ることを公表
- 2026-05-07: 修正版（Python 1.39.4／.NET 1.71.0）が提供される
- 2026-05 以降: AI エージェント基盤のツール呼び出し設計が、注入から実行への経路になる構造的論点として業界で議論

> 注: 本 Brief の事実は Microsoft Security Blog および NVD / CVE の記載に基づく。CVSS・条件・影響バージョンは開示時点の値であり、出所を明示する。

公表後の対応と業界の動きは次のとおり。

- **Microsoft**: 二つの脆弱性を開示し、修正版（Python 1.39.4／.NET 1.71.0）を提供。プロンプトインジェクションが実行（RCE）に至り得る経路を可視化
- **影響範囲**: Semantic Kernel は広く使われており、同型の構成（ホストに触れる関数の露出・モデル制御パラメータ・検証不在）を持つエージェント実装に注意が促された
- **業界横断の論点**: AI エージェント基盤において、ツール／関数呼び出しの設計が「注入を実行に変える」最大の攻撃面になりつつあることが、複数フレームワークの事例とともに共有された。プロンプトインジェクションを「出力の完全性」ではなく「実行の認可」の問題として扱う視点が広がった
- **設計上の要件**: 関数の公開範囲の最小化、パラメータの厳格な検証、そして実行前の認可検証が、エージェント基盤の必須要件として議論が進む

「エージェントが呼べる関数と権限を、実行の前にどう認可・スコープ・証明するか」は、本事案を契機にエージェント基盤設計の必須要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「LLM が呼び出せる関数とそのパラメータを、実行の前に認可・スコープを独立検証しないまま、注入され得るモデル出力から直接駆動すること」</strong>である。プロンプトインジェクションは入力側の問題に見えるが、実害は「注入された指示が、ホストに触れる関数をそのまま実行できた」ことから生じた。

[Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)（MCP の標準設計が広範な RCE の経路になった）・[Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)（LibreChat でユーザー指定の MCP URL からサーバーの秘密情報が漏れた）・[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（Starlette / BadHost で MCP 認証が Host ヘッダー操作で回避された）と同じ `agent-infrastructure` であり、いずれも **エージェント基盤の設計（ツール呼び出し・設定の取り扱い）が、外部入力を特権実行に変える**構造で同型である。[Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)（AI コーディングエージェントがリポジトリ同梱の設定ファイルを無検証で自動実行）・[Brief 047](https://lemma.frame00.com/ja/critical/briefs/047-openclaw-agent-phishing/)（OpenClaw、エージェントが送信者を確かめる前に認証情報を社外へ送出）とも、**エージェントの行動が、行動の前の認可検証から切り離されている**点で連なる。本事案は「プロンプトインジェクション＝出力の問題」という見方を、「呼び出しの認可が無ければ実行の問題になる」と具体的に示した。

エージェント基盤の安全性は、モデルが賢く振る舞うかではなく、モデルが呼べる関数と権限が、実行の前に独立に認可・スコープされているかに依存する。注入は完全には防げない前提で、注入された出力が特権実行に届かない境界を引けるかが論点になる。

脆弱性のスキャン、CVE 開示、パッチ適用は、既知の経路を塞ぐために不可欠であり、本 Brief がその役割を否定するものではない。本事案でも迅速な開示と修正版の提供で既知の悪用経路は塞がれた。

一方で、検出・パッチは、エージェントが「どの関数を、どの認可の下で呼び出せるか」という設計自体を変えない。本事案では、ホストに触れる関数が LLM から呼び出し可能で、パラメータがモデル制御・検証不在だったため、注入された出力がそのまま実行に届いた。欠けていたのは「この関数呼び出しは、今この文脈で認可・スコープされているか」を実行の前に独立検証する層であり、これはパッチで個別の経路を塞ぐこととは別系統の問題である。次の未知の露出（別の関数・別の構成）が現れれば、同じ構造が再び突かれ得る。規制報告・監査で「このエージェントの特権操作は、認可された範囲で行われたか」を立証する材料として、パッチ適用済みという事実だけでは、各実行時点での認可の証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、エージェントが関数を実行する前に、「この呼び出しは、今この文脈・権限の下で認可されているか」を推論ループの外側で独立検証し、認可が無ければ実行そのものを block する。鍵やトークンの保有ではなく、行動ごとに必要な範囲だけを証明して認可することで、注入された出力がホストに触れる関数へ直接届かないようにする。脆弱性の検出（detection）と、実行前の認可の事前証明（proof）は代替ではなく **補完** の関係にあり、両者が重なって初めて、AI エージェントをエンタープライズの本番に安心して載せられる。

本事案で露呈した検出と証明の落差（LLM が呼べる関数とパラメータが、実行の前に認可・検証されない）に対して、Lemma は、エージェントの関数実行を、実行前の独立した認可検証に結びつける設計を提示している。

- **実行前の認可の強制境界**: 関数を実行する前に「この呼び出しは、今この文脈・権限の下で認可されているか」を推論ループの外側で独立検証し、認可が無ければ実行を構造的に block する
- **鍵・トークンを送らない認可**: エージェントに広範な権限の bearer を持たせる前提を排し、行動ごとに必要な範囲だけを証明して認可する Proof-as-Auth の設計に寄せる
- **最小権限と関数スコープ**: ホストに触れる関数の公開範囲を最小化し、パラメータの範囲を認可と結びつけて、注入された出力が特権関数へ直接届かないようにする
- **行為の来歴**: どの関数が、どの認可の下で呼ばれたかを改ざんできない来歴として残し、事後の監査・立証を可能にする

「注入は防ぎ切れない、しかし実行の認可は分離できる」というエージェント権限証明カテゴリの設計思想に対し、本事案はその想定する failure mode が CVSS 10.0 の RCE として顕在化した事例である。検出（脆弱性スキャン・パッチ）は既知経路の遮断に、事前証明（実行前の認可の独立検証）はエージェント運用の信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **Microsoft Security Blog**: “When prompts become shells: RCE vulnerabilities in AI agent frameworks”（2026-05-07）— <https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/>
- **NVD**: CVE-2026-25592（.NET Semantic Kernel SDK、サンドボックス脱出）— <https://nvd.nist.gov/vuln/detail/CVE-2026-25592>
- **NVD**: CVE-2026-26030（Python Semantic Kernel、In-Memory Vector Store 経由の RCE）— <https://nvd.nist.gov/vuln/detail/CVE-2026-26030>
- **reference 実装（GitHub）**: agent-authority proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
