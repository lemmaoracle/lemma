---
brief_no: 72
title: "Hugging Face LeRobot：未認証の通信で受け取ったデータを検証せず実行した — 出所を検証しないデータを deserialize（pickle）した時点でコード実行に至る trust boundary 不在の構造（CVE-2026-25874）"
title_en: "Hugging Face LeRobot: a robotics framework executed untrusted data received over an unauthenticated channel — deserializing (pickle) unverified data leads straight to code execution (CVE-2026-25874)"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "code-provenance", "model-supply-chain"]
incident_date: 2026-04-28
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["058-langgraph-checkpoint-rce", "068-universal-robots-polyscope-command-injection", "070-unitree-shared-key-robot-identity", "025-mcp-stdio-config-to-command-rce", "003-starlette-badhost"]
status: draft
version: "1.0"
og_lead_ja: "未認証 gRPC で受けた pickle が即コード実行 — Hugging Face LeRobot"
og_lead_en: "Pickle over an unauthenticated gRPC channel = instant RCE — LeRobot"
gap_detected: "CVE-2026-25874 の採番・公表、影響範囲（v0.4.3〜0.5.1）の検証、pickle/deserialize の危険性の周知、0.6.0 での対応予定までは機能した。"
gap_missing: "認証も TLS も無い gRPC で受け取ったデータを、出所も認可も確かめずに deserialize（pickle）する層しか無く、未認証の到達がそのままロボットの関節制御に直結する RCE になった。"
gap_fix: "deserialize の前に「この入力は信頼境界を越えて正当に持ち込まれた」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Hugging Face の OSS ロボット学習基盤 LeRobot に、認証も TLS も無い gRPC で受け取ったデータを中身を確かめず deserialize（pickle）する脆弱性 CVE-2026-25874 が公表された。未認証の攻撃者が細工した payload を送るだけでホスト上の任意コード実行に至り、経路はロボットの関節制御に直結する。CVE の採番・公表では、その入力が信頼境界を越えて正当に持ち込まれたかを deserialize の前に確かめられない。受け取ったデータの出所・認可を確かめる trust boundary が存在しなかった。

---

## 2. 何が起きたか

- **対象**: Hugging Face の OSS ロボット学習・制御フレームワーク LeRobot。非同期推論（async inference）の PolicyServer（方策計算側）と robot client（ロボット本体側）が gRPC で通信する構成
- **公表**: 2026 年 4 月下旬に CVE-2026-25874 として公表（NVD 公開は 04-23、報道は 04-27〜28）。発見・PoC 公開は Valentin Lobstein（chocapikk）。The Hacker News／Resecurity／Cloud Security Alliance ほかが解説。CWE-502（信頼できないデータの deserialization）
- **脆弱性**: PolicyServer / robot client が、<strong>認証なし・TLS なしの gRPC（`add_insecure_port()`）</strong>で受け取ったデータを `pickle.loads()` で復元。pickle は復元時に任意コードを実行しうるため、未認証の遠隔コード実行（RCE）に至る。CVSS 3.1 で 9.8（CVSS 4.0 で 9.3）
- **必要だったもの**: PolicyServer のネットワークポートへの到達。認証は要求されない。「到達できれば deserialize に届き、deserialize はコード実行になる」
- **影響範囲**: LeRobot は GPU バックエンドの推論環境で、しばしば高権限・ロボットハードウェア・内部ネットワーク・データセット・高価な計算資源にアクセスする。RCE は完全なシステム侵害・データ窃取に加え、**ロボットの関節制御経路に直結する物理的安全リスク**を生む
- **影響バージョン**: 公式 PyPI リリース v0.4.3 を既定の async inference PolicyServer 有効構成で実環境検証。NVD は **0.5.1 まで**を影響範囲とし、同じ `lerobot.async_inference.policy_server` 構成を含む各リリースが未信頼の gRPC 入力を pickle で復元する。本稿時点で修正版は未リリース（0.6.0 で pickle を safetensors/JSON に置換予定）
- **緩和**: pickle を安全な代替（JSON・protobuf ネイティブフィールド・safetensors）に置換、`add_insecure_port()` を `add_secure_port()`＋TLS に、gRPC interceptor とトークンによる認証を全受信に強制

本事象は、ロボット基盤が受け取ったデータの出所・認可を検証せず、deserialize の時点でコード実行に至る構造を示す。経路は以下の通り。

1. **未認証の到達**: 攻撃者が、LeRobot の PolicyServer が待ち受ける gRPC ポートに到達する。チャネルは TLS も認証もない（`add_insecure_port()`）
2. **未検証データの受領**: PolicyServer が、送られてきたデータを「正当な送り手か・正当な内容か」を検証せずに受け取る
3. **deserialize＝コード実行**: 受け取ったデータを `pickle.loads()` で復元する。pickle は復元の最中に任意コードを実行しうるため、この時点でホスト上のコマンドが走る（CVE-2026-25874）
4. **制御経路への波及**: PolicyServer / robot client は方策計算とロボット制御の経路にあるため、RCE はデータ窃取に加え、ロボットの関節制御という物理動作に波及しうる
5. **緩和**: pickle の置換、TLS・認証の付与、interceptor によるアクセス制御が、deserialize に未検証で到達する経路を断つ（事後・周辺の系列）

---

## 3. 時系列 — 公表と対応

- （事前）: LeRobot の async inference PolicyServer / robot client が、認証・TLS なしの gRPC で受け取ったデータを `pickle.loads()` で復元する実装
- 2026-04-28 前後: CVE-2026-25874 が公表される。研究者が v0.4.3 を実環境で脆弱と検証。複数のセキュリティ媒体・研究機関が技術解説を公開
- 以降: pickle の安全な代替への置換、TLS・認証の付与、gRPC interceptor によるアクセス制御の必要性が論点化

> 注: 本 Brief が扱うのは CVE-2026-25874 の脆弱性と、その背後にある「未検証データの deserialize ＝コード実行」という構造である。本稿時点で実環境での悪用確認の有無にかかわらず、論点は基盤の trust boundary 不在にある。AI コーディング基盤・推論基盤に共通する同型事案は [Brief 073](https://lemma.frame00.com/ja/critical/briefs/073-shadowmq-pickle-zmq-pattern/)（ShadowMQ パターン）を参照。

公表後の対応と業界の動きは次のとおり。

- **LeRobot / コミュニティ**: pickle を JSON・protobuf ネイティブフィールド・safetensors 等の安全な代替へ置換し、`add_secure_port()`＋TLS、gRPC interceptor とトークン認証を導入する方向が推奨されている
- **OSS 基盤の trust boundary**: 「受け取ったデータを検証せず deserialize する」設計が、ネットワーク到達をコード実行に直結させるという論点が、推論・ロボット基盤の運用者に共有された。pickle のような実行を伴う形式を未信頼境界で使わないことが基本
- **物理安全への接続**: ロボットの推論・制御経路に RCE が届くため、サイバー侵害が物理動作の安全リスクに転じる点が、cyber-physical の固有の論点として強調された
- **業界横断の論点**: 同型の「未認証チャネル＋ pickle」は LeRobot 単独ではなく、推論フレームワーク全体に広がるパターン（[Brief 073](https://lemma.frame00.com/ja/critical/briefs/073-shadowmq-pickle-zmq-pattern/)＝ShadowMQ）として観測されている。OSS 基盤の trust boundary をどう設計・検証するかが、エコシステム規模の課題になっている

「受け取ったデータを検証せず deserialize する」設計の不在は、特定 OSS の問題ではなく、AI 推論・ロボット基盤を土台にする組織横断の課題として共有されつつある。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**OSS のロボット基盤が、受け取ったデータの出所・認可を検証する trust boundary を持たず、deserialize（pickle）の時点でコード実行に至っていた**点にある。pickle は「データの復元」と「コードの実行」が不可分な形式であり、未認証・未検証の入力をそのまま復元することは、ネットワーク到達をコード実行に直結させる。

[Brief 058](https://lemma.frame00.com/ja/critical/briefs/058-langgraph-checkpoint-rce/)（LangGraph、来歴も完全性も検証せず永続状態〔チェックポイント〕を読み込みサーバーを乗っ取られた）と同根で、**未検証データの deserialize＝コード実行**という primitive を、エージェントの状態ではなく**ロボットの推論・制御経路**で示した点が異なる。[Brief 068](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/)（命令の送り手の権限を物理動作の前に検証しない産業用ロボット）・[Brief 070](https://lemma.frame00.com/ja/critical/briefs/070-unitree-shared-key-robot-identity/)（機体ごとの identity が無い人型・四足ロボット）とは、対エージェントの実体クラスタを成し、いずれも「ロボットの行動につながる入力・本人性が動作の前に独立検証されない」点で連なる。[Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)（MCP の標準設計が設定→コマンド実行で広範な RCE 経路になった）・[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（Host ヘッダー操作で認証が回避された）とは、基盤の入力経路が検証なく特権側に通る点で同型。

本事案が際立たせるのは、**OSS の基盤がエコシステムに広がるほど、その trust boundary 不在も広がる**ことだ。LeRobot のように多くのロボット実装が依存する基盤が、未検証データを deserialize する設計を持てば、同じ欠陥が依存先すべてに行き渡る。基盤が「受け取ったデータは正当な送り手の正当な内容か」を deserialize の前に独立検証して初めて、OSS を土台にしたロボットを現場に安心して載せられる。

CVE の公表、安全な代替への置換、TLS・認証の付与、ネットワーク分離は、露出の抑止に不可欠であり、本 Brief がその役割を否定するものではない。パッチと最小権限化は、未認証の到達経路を断つ重要な歯止めである。

一方で、ネットワーク監視やパッチは、基盤が「いま受け取ったデータは、正当な送り手による正当な内容か」を、**deserialize の前に**独立に検証する材料にはならない。本事案の中核は、受け取ったデータの出所・認可を検証する層が存在せず、deserialize がそのままコード実行になっていたことにある。事後のログ解析は「どの接続が来たか」を再構成するが、「その payload は正当な出所・内容だったか」を実行の前に独立検証する材料にはならない。pickle が復元の最中にコードを実行してしまえば、その時点の侵害もロボットの物理動作も遡って取り消せない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、基盤が受け取るデータを「ネットワークから届いた」ことではなく「正当な出所・認可を持つ、独立検証可能なもの」として扱う設計を採る。推論・制御の入力を、送り手の認可と内容の出所に対して deserialize の前に検証し、安全な（コード実行を伴わない）形式で受ければ、未認証の到達だけではコードは走らない。到達の検出（detection 的な「誰が来たか」）と、入力の出所・認可の証明（「正当な送り手の正当な内容か」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、OSS を土台にしたロボット・推論基盤を現場に安心して載せられる。

本事案で露呈した検出と証明の落差（OSS 基盤が、受け取ったデータの出所・認可を検証せず deserialize＝コード実行に至る）に対して、Lemma は、基盤が受け取る入力を「届いた」ことではなく「正当な出所・認可を持つ、独立検証可能なもの」として裏づける設計を提示している。

- **入力の出所・認可の証明（proof-as-auth）**: 推論・制御の入力を、送り手の認可と内容の出所に対して、処理（deserialize・実行）の前に独立検証する。ネットワークに届いたという事実では満たせない、入力ごとの証明に置き換える
- **trust boundary の明示**: 未信頼境界では、コード実行を伴う形式（pickle 等）を使わず、安全な形式と独立検証を前提にする。到達＝実行に直結させない（[Brief 058](https://lemma.frame00.com/ja/critical/briefs/058-langgraph-checkpoint-rce/) の未検証状態ロードと接続）
- **制御経路の完全性**: ロボットの関節制御に届く経路の入力・出所を独立検証可能にし、未検証 payload が物理動作に転じる前に弾く（[Brief 068](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/)・070 の実体エージェント認可と接続）
- **選択的開示**: 内部データを出さずに、「この入力は正当な出所・認可を持つ」ことだけを最小開示し、独立検証と運用情報の保護を両立する

これにより、行為の時点で固定された証明が、「この入力は正当な出所・認可を持つか」を、事後のログ照合に依存せず独立検証可能なトレイルとして機能させる。検出（事後の解析・パッチ）は露出の是正に、事前証明（処理前の出所・認可の独立検証）は OSS 基盤・ロボットの信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **The Hacker News**: “Critical CVE-2026-25874 Leaves Hugging Face LeRobot Open to Unauthenticated RCE”（2026-04） — <https://thehackernews.com/2026/04/critical-cve-2026-25874-leaves-hugging.html>
- **Resecurity**: “CVE-2026-25874: Hugging Face LeRobot Unauthenticated RCE via Pickle Deserialization” — <https://www.resecurity.com/blog/article/cve-2026-25874-hugging-face-lerobot-unauthenticated-rce-via-pickle-deserialization>
- **Cloud Security Alliance（Lab Space）**: “LeRobot CVE-2026-25874: Unauthenticated RCE via Pickle”（2026-04-29） — <https://labs.cloudsecurityalliance.org/research/csa-research-note-lerobot-cve-2026-25874-unauth-rce-20260429/>
- **NVD**: CVE-2026-25874 — <https://nvd.nist.gov/vuln/detail/CVE-2026-25874>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority)、[Trust402](https://lemma.frame00.com/ja/trust402/)
