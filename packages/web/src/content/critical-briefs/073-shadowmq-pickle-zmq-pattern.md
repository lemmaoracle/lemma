---
brief_no: 73
title: "ShadowMQ：未認証 pickle を即実行する同一実装が AI 推論基盤に次々コピーされていた — 再利用でエコシステム規模に広がった構造（Oligo Security）"
title_en: "ShadowMQ: one unsafe pattern (unauthenticated ZMQ + pickle) copied across AI inference frameworks — the same flaw spread at ecosystem scale through reuse (Oligo Security)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["code-provenance", "identity-auth"]
incident_date: 2025-11-14
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["072-lerobot-pickle-grpc-rce", "058-langgraph-checkpoint-rce", "025-mcp-stdio-config-to-command-rce", "028-npm-dependency-confusion-recon", "003-starlette-badhost"]
status: published
version: "1.0"
og_lead_ja: "ShadowMQ：未認証 pickle の同一実装が AI 推論基盤に拡散した — 再利用でエコシステム規模に"
og_lead_en: "ShadowMQ: one unauthenticated ZMQ + pickle implementation, copied across inference stacks — at ecosystem scale"
gap_detected: "Oligo・Orca の研究公表、各ベンダーの CVE 採番と修正、pickle 自体の危険性の周知は機能し、事後の検出・報告・パッチの系列は回った。"
gap_missing: "未認証 ZMQ ソケットに届いた pickle を「正当な送り手か・正当な内容か」を確かめずに復元する層しか無く、受信の瞬間に任意コードが実行され、同型実装が検証なく複数基盤へコピーされて同じ欠陥が拡散した。"
gap_fix: "deserialize の前に「この入力は信頼境界を越えて正当に持ち込まれた」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

多くの LLM 推論基盤は内部プロセス間を未認証の ZeroMQ で繋ぎ、データを pickle でやり取りする。届いた pickle を検証せず即復元するため、ソケットに到達できれば誰でもコードを実行できる。2025 年 11 月、Oligo Security はこの同一実装が Meta の Llama Stack を起点に主要フレームワークへ広がっていたと「ShadowMQ」として公表した。trust boundary 不在の実装が再利用で拡散した構造である。

---

## 2. 何が起きたか

- **対象**: LLM 推論を高速化する OSS フレームワーク群。プロセス間通信に ZeroMQ（ZMQ）を用い、データを Python pickle で受け渡す構成
- **公表**: Oligo Security が一連の同型脆弱性を「ShadowMQ」として 2025-11-14 に公表（The Hacker News ほかが報道）。以後も同型の個別 CVE が継続して採番されている
- **共通の失敗 primitive**: ZMQ ソケットが認証なしで（しばしば全インターフェースに）バインドし、受け取ったデータを `pickle.loads()` で即復元。pickle は復元時に任意コードを実行しうるため、ソケットに到達できる**未認証の攻撃者**が RCE に至る
- **広がり（同型実装の再利用）**: 起点とされる Meta Llama Stack から、NVIDIA TensorRT-LLM・Microsoft Sarathi-Serve・Modular Max Server・vLLM・SGLang へ、ほぼ同一の危険な実装が伝播。[Brief 072](https://lemma.frame00.com/ja/critical/briefs/072-lerobot-pickle-grpc-rce/) の LeRobot（gRPC 上の同型）も同じ系統
- **ShadowMQ の CVE（Oligo）**: Llama Stack **CVE-2024-50050**、vLLM **CVE-2025-30165**、NVIDIA TensorRT-LLM **CVE-2025-23254<strong>（CVSS 9.3）、Modular Max Server </strong>CVE-2025-60455**（Sarathi-Serve は CVE 未採番）。いずれも未認証 ZMQ ＋ `pickle.loads()` の同型
- **後続・別系統との区別**: 同型の ZMQ/pickle RCE は後に SGLang でも **CVE-2026-3059 / 3060<strong>（CVSS 9.8、Orca が 2026-03 に別途公表）として現れた。一方、vLLM </strong>CVE-2026-22778<strong>（動画処理のヒープオーバーフロー）・</strong>CVE-2025-62164**（`torch.load` のテンソル破損、CVSS 8.8）は別系統の脆弱性で、ShadowMQ の ZMQ/pickle パターンとは異なる
- **影響範囲**: 推論基盤は GPU 付き・高権限・モデル資産・内部ネットワークに接する。RCE は基盤の完全侵害、モデル・データの窃取、横展開につながりうる

本事象は、複数フレームワークに共通する同一の経路を持つ。代表として未認証 ZMQ ＋ pickle の経路を示す。

1. **未認証の到達**: 攻撃者が、推論基盤の ZMQ ソケットに到達する。ソケットは認証なしで、しばしば全ネットワークインターフェースにバインドされている
2. **未検証データの受領**: ソケットが、送られてきたデータを「正当な送り手か・正当な内容か」を検証せず受け取る
3. **deserialize＝コード実行**: 受け取ったデータを `pickle.loads()` で即復元する。pickle は復元の最中に任意コードを実行しうるため、この時点でホスト上のコマンドが走る（例: TensorRT-LLM CVE-2025-23254、後続では SGLang CVE-2026-3059 / 3060）
4. **基盤の掌握**: 推論基盤は高権限・GPU・モデル資産・内部ネットワークに接するため、RCE が基盤の完全侵害・モデル/データ窃取・横展開に波及する
5. **再利用による拡散**: 同型実装が複数フレームワークにコピーされているため、同じ経路が基盤を横断して通用する（パターンとしての広がり）

---

## 3. 時系列 — 公表と対応

- （事前）: 複数の推論フレームワークが、認証なし ZMQ ソケットで受けたデータを `pickle.loads()` で復元する同型実装を採用（起点は Meta Llama Stack とされる）
- 2025-11-14: Oligo Security が一連の同型脆弱性を「ShadowMQ」として公表。Meta（Llama Stack、CVE-2024-50050）を起点に NVIDIA・Microsoft・Modular・vLLM へ同じパターンが及ぶことを示す
- 2026-03: 同型の ZMQ/pickle RCE が SGLang でも CVE-2026-3059 / 3060（CVSS 9.8）として別途公表される（Orca Security）。再利用パターンが継続して顕在化
- 以降: pickle の安全な代替、ZMQ ソケットの認証・バインド範囲の最小化、未信頼境界の明示が、推論基盤の運用者に共有される

> 注: 本 Brief は ShadowMQ として束ねられた同型脆弱性の「パターン」を分析対象とし、各フレームワークの個別の悪用主体を断罪するものではない。固有名・CVE は一次（研究機関・GitHub Advisory・NVD）に基づき、各実装の修正状況は時点により異なるため最新の各ベンダー情報を参照のこと。

公表後の対応と業界の動きは次のとおり。

- **各フレームワーク / コミュニティ**: pickle を安全な形式へ置換し、ZMQ ソケットの認証・バインド範囲（全インターフェース公開の回避）を見直す方向が推奨されている。SGLang・vLLM 等で個別 CVE への修正が継続
- **Oligo Security**: 同型脆弱性を ShadowMQ として体系化し、Meta・NVIDIA・Microsoft 等の推論フレームワークに及ぶパターンとして可視化。「個別バグ」ではなく「再利用された設計の前提」が問題であることを示した
- **OSS 基盤の trust boundary**: 未信頼境界で実行を伴う形式（pickle）を使わない、受け取ったデータの出所・認可を実行前に検証する、という基本原則が、推論基盤の設計要件として論点化
- **業界横断の論点**: 便利な実装の再利用が欠陥の前提ごと拡散させること（[Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)・028 と同型）が、AI 基盤エコシステム固有のリスクとして共有された。基盤の trust boundary をどう設計・検証し、再利用に耐えさせるかが課題

「受け取ったデータを検証せず実行する」前提が再利用を通じて広がる構造は、特定フレームワークの問題ではなく、AI 推論基盤エコシステム横断の課題として共有されつつある。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**trust boundary を欠いた同一実装——未認証 ZMQ ソケットで受けたデータを検証せず `pickle.loads()` で実行する——が、フレームワーク間でコピーされ、エコシステム規模で同じ欠陥を広げた**点にある。pickle は「復元」と「実行」が不可分であり、未信頼境界でこれを使うことは、ソケット到達をコード実行に直結させる。

[Brief 072](https://lemma.frame00.com/ja/critical/briefs/072-lerobot-pickle-grpc-rce/)（LeRobot、gRPC 上の同型「未認証＋ pickle」）はこのパターンのロボット基盤版であり、本 Brief はその推論基盤・横断版である。[Brief 058](https://lemma.frame00.com/ja/critical/briefs/058-langgraph-checkpoint-rce/)（来歴も完全性も検証せず永続状態を deserialize した LangGraph）とは、**未検証データの deserialize＝コード実行**という primitive で同根。[Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)（MCP の標準設計が、特定実装でなくリファレンス設計に内在して広範な RCE 経路になった）とは、**設計・実装のパターンが製品横断で同じ欠陥を広げる**構造でほぼ同型。[Brief 028](https://lemma.frame00.com/ja/critical/briefs/028-npm-dependency-confusion-recon/)（内部スコープを偽装した依存が build 環境の来歴前提を突いた）とは、再利用・依存を通じて欠陥が伝播する点で、[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（Host ヘッダー操作で認証が回避された）とは、入力経路が検証なく特権側に通る点で連なる。

本事案がとりわけ示すのは、**OSS 基盤の trust boundary 不在は「再利用」を通じて増幅する**ことだ。便利な実装がコピーされるたびに、その前提（受け取ったデータ＝実行してよい）も一緒に運ばれる。基盤が「受け取ったデータは正当な出所・内容か」を実行の前に独立検証する設計を持って初めて、推論基盤をエコシステム規模で安心して土台にできる。

各 CVE の公表、pickle の置換、ZMQ の認証・バインド範囲の見直し、ネットワーク分離は、露出の抑止に不可欠であり、本 Brief がその役割を否定するものではない。パッチと最小権限化は、未認証の到達経路を断つ重要な歯止めである。

一方で、ネットワーク監視やパッチは、基盤が「いま受け取ったデータは正当な送り手の正当な内容か」を、**実行の前に**独立に検証する材料にはならない。本事案の中核は、受け取ったデータの出所・認可を検証する層が無く、deserialize がそのままコード実行になっていたこと、しかもそれが**再利用で横断的に広がっていた**ことにある。事後のログ解析は「どのソケットに何が来たか」を再構成するが、「その payload は正当な出所・内容か」を実行の前に独立検証する材料にはならない。同型実装が複数基盤に渡っているため、1 つの検知パターンでは全体を覆えない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、基盤が受け取る入力を「ソケットに届いた」ことではなく「正当な出所・認可を持つ、独立検証可能なもの」として扱い、未信頼境界では実行を伴わない安全な形式で受ける設計を採る。これを基盤の標準パターンとして共有すれば、再利用されても危険な前提は運ばれない。到達の検出（detection 的な「何が来たか」）と、入力の出所・認可の証明（「正当な送り手の正当な内容か」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、推論基盤をエコシステム規模で安心して土台にできる（検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、処理前に出所・認可を独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照）。

本事案で露呈した検出と証明の落差（trust boundary を欠いた同一実装が再利用で広がり、未検証データの deserialize＝コード実行が横断的に存在する）に対して、Lemma は、基盤が受け取る入力を「届いた」ことではなく「正当な出所・認可を持つ、独立検証可能なもの」として裏づける設計を提示している。

- **入力の出所・認可の証明（proof-as-auth）**: 推論基盤が受け取るプロセス間・ネットワーク入力を、送り手の認可と内容の出所に対して処理（deserialize・実行）の前に独立検証する。ソケットに届いたという事実では満たせない、入力ごとの証明に置き換える
- **trust boundary を再利用に耐えさせる**: 未信頼境界では実行を伴う形式を使わず、安全な形式＋独立検証を「基盤の標準パターン」として共有する。コピーされても危険な前提が運ばれない設計にする（[Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)・072 と接続）
- **横断的な完全性**: 同型実装が複数基盤に渡っても通用する経路を、入力の出所・認可の証明で一様に塞ぐ。1 つの検知パターン頼みにしない
- **選択的開示**: 内部データを出さずに、「この入力は正当な出所・認可を持つ」ことだけを最小開示し、独立検証と運用情報の保護を両立する

これにより、行為の時点で固定された証明が、「この入力は正当な出所・認可を持つか」を、事後のログ照合に依存せず独立検証可能なトレイルとして機能させる。検出（事後の解析・パッチ）は露出の是正に、事前証明（処理前の出所・認可の独立検証）は AI 推論基盤エコシステムの信頼確立に、それぞれ相補的に働く。設計と適用範囲は、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 6. Sources

- **Oligo Security（一次・パターン公表）**: “ShadowMQ: How Code Reuse Spread Critical Vulnerabilities Across the AI Ecosystem”（2025-11、Llama Stack 起点・5 基盤への伝播・CVE-2024-50050 / 2025-30165 / 2025-23254 / 2025-60455） — <https://www.oligo.security/blog/shadowmq-how-code-reuse-spread-critical-vulnerabilities-across-the-ai-ecosystem>
- **The Hacker News**: “Researchers Find Serious AI Bugs Exposing Meta, Nvidia, and Microsoft Inference Frameworks”（2025-11） — <https://thehackernews.com/2025/11/researchers-find-serious-ai-bugs.html>
- **NVD**: CVE-2025-23254（NVIDIA TensorRT-LLM、ShadowMQ、CVSS 9.3） — <https://nvd.nist.gov/vuln/detail/CVE-2025-23254>
- **Orca Security（後続・別公表）**: “Pickle in the Pipeline: Critical RCE Vulnerabilities in SGLang's LLM Serving Framework”（SGLang CVE-2026-3059 / 3060、2026-03） — <https://orca.security/resources/blog/sglang-llm-framework-rce-vulnerabilities/>
