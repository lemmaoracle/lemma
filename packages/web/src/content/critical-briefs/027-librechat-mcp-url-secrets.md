---
brief_no: 27
title: "LibreChat：ユーザー指定の MCP URL からサーバーの秘密情報が漏れた — CVE-2026-32625"
title_en: "LibreChat CVE-2026-32625 — User-Supplied MCP Server URLs as an Exfiltration Channel for Server Secrets"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-02
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "ユーザーが指定する MCP サーバー URL が、サーバーの秘密情報を運び出す経路に — LibreChat CVE-2026-32625 CVSS 9.6"
og_lead_en: "User-supplied MCP server URLs became an exfiltration channel for server secrets — LibreChat CVE-2026-32625 CVSS 9.6"
gap_detected: "脆弱性の公開と即日の修正版提供という、正常な開示・是正の流れは機能した。"
gap_missing: "「この接続先設定は誰が登録し、社内の機微情報にアクセスしてよいか」を実行の前に確かめる層が無く、設定が特権の文脈で解釈された。"
gap_fix: "接続先の登録という権限行為について「登録者は、この範囲の情報にアクセスする認可を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

AI チャット基盤 LibreChat に CVE-2026-32625（CVSS 9.6）が公開された。低権限の利用者が MCP サーバー URL に `${MONGO_URI}` 等を仕込むだけで、サーバーが自身の暗号鍵・認証秘密・DB 接続情報を攻撃者へ送出する。欠けていたのは、この接続先設定を誰が登録しどの機微情報を参照する認可を持つかを、解釈の前に確かめる層である。発する通信は正規の outbound 接続と区別がつかず、事後の検出は捉えにくい。

---

## 2. 何が起きたか

- **対象**: LibreChat(danny-avila/LibreChat)0.8.3 以前の MCP サーバー統合
- **識別子**: CVE-2026-32625 / GHSA-4pcc-j6m6-wcwx(CWE-200: 認可されないアクターへの機微情報露出)
- **深刻度**: CVSS 3.1 = 9.6(Critical)。`AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N` — ネットワーク経由・低い攻撃複雑性・低権限で足り・ユーザー操作不要・スコープ変更あり
- **公開日**: 2026-06-02(GitHub Security Advisory 経由、CVE reserve は 2026-03-12)
- **流出対象**: `CREDS_KEY` / `CREDS_IV`(認証情報暗号鍵)、`JWT_SECRET`、`MONGO_URI` 等。これらはインストールの暗号材料と DB 接続情報そのものであり、流出すれば全ユーザーのデータと認証基盤が侵害される
- **悪用状況**: CISA の SSVC 評価で Exploitation: poc(概念実証あり)。修正版 0.8.4-rc1 で対処済み

事象は次の連鎖で成立している。

1. **低権限アカウントの取得**: 攻撃者は対象 LibreChat インスタンスの一般ユーザーアカウントを取得する。多くの公開インスタンスではセルフサインアップが有効である
2. **悪性 MCP サーバー設定の作成**: MCP サーバー URL として、攻撃者支配下のドメインに `${CREDS_KEY}` / `${CREDS_IV}` / `${JWT_SECRET}` / `${MONGO_URI}` 等のプレースホルダを埋め込んだ URL を登録する
3. **検証過程での環境変数展開**: LibreChat サーバーは URL の Zod スキーマ検証時に、プレースホルダを自身の `process.env` の値で置換する。ユーザー入力と運用者設定の区別はない
4. **接続による流出**: 展開済み URL に対して LibreChat サーバーが接続を行い、秘密情報が URL の一部として攻撃者のサーバーのアクセスログに記録される
5. **全面侵害への展開**: 流出した暗号鍵で保存済み認証情報の復号、JWT secret でのトークン偽造、`MONGO_URI` での DB 直接アクセスが可能になる

---

## 3. 時系列 — 公表と対応

- 2026-03-12: CVE 番号が reserve される(GitHub assigner)
- 2026-06-02: GitHub Security Advisory(GHSA-4pcc-j6m6-wcwx)と CVE-2026-32625 が公開。修正版 0.8.4-rc1 が利用可能に
- 2026-06-03: CISA が SSVC 評価(Exploitation: poc / Technical Impact: total)を付与
- 2026-06-04: NVD が解析完了(CVSS 9.6 Critical 確定)

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。

公表後の対応と業界の動きは次のとおり。

- **LibreChat**: GitHub Security Advisory(GHSA-4pcc-j6m6-wcwx)として coordinated disclosure を実施し、修正版 0.8.4-rc1 を公開。修正はユーザー入力 URL に対する環境変数展開の無効化
- **CISA / NVD**: 公開翌日に SSVC 評価(Exploitation: poc / Technical Impact: total)、2 日後に NVD 解析完了と、AI 基盤系 CVE としては早いサイクルで処理された
- **業界横断の論点**: MCP 統合を持つ AI チャット/エージェント基盤は 2026 年に入り CVE の集中領域になっており([Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/) の Starlette/BadHost、各種 MCP server の認証不在の調査報告等)、「エージェント接続層の設定値をどの信頼レベルで扱うか」が共通の設計課題として浮上している

セルフホスト型 AI 基盤の普及により、同種の「設定値経由の特権文脈アクセス」は LibreChat 固有ではなく、MCP クライアント実装一般の検証項目になりつつある。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「エージェントの接続先を記述する設定値が、登録者の権限を確かめないまま、ユーザー由来の未検証入力としてサーバーの特権文脈(`process.env`)で解釈された」</strong>点にある。

Brief 003(Starlette/BadHost)と同じくエージェント基盤の信頼境界の問題だが、方向が異なる。003 は外部からの HTTP Host ヘッダー操作で MCP server への**入口**(認証)が回避された事例、本事象はユーザーが指定する接続先設定という**出口**側で、接続行為そのものが秘密情報の搬出経路になった事例である。両者に共通するのは、MCP というエージェント接続層が、従来の Web アプリケーションでは入力検証の対象として確立していた境界(ヘッダー、ユーザー入力 URL)を、エージェント設定という新しい皮をかぶせたまま特権的に処理してしまう構造である。

エージェント基盤の文脈では、MCP サーバーの登録は「エージェントに新しい能力と接続先を与える」権限行為に相当する。本事象は、その権限行為が誰の認可で・どの範囲の文脈にアクセスして実行されるのかが検証されないとき、設定の記述形式(プレースホルダ)ひとつで権限境界が崩れることを示している。

脆弱性スキャナや依存関係監査、egress の監視は、既知 CVE への対処と異常通信の発見に不可欠であり、本 Brief がその役割を否定するものではない。本事象も advisory 公開と修正版の即日提供という、coordinated disclosure の正常系で処理された。

一方で、検出は「サーバーがどの接続先に・何を載せて接続するか」の決定自体を変えない。本事象の悪用通信は、LibreChat サーバー自身が発する正規の outbound HTTPS 接続であり、宛先は攻撃者ドメインだが通信パターンとしては MCP サーバーへの正常な接続試行と区別がつかない。秘密情報は暗号化された TLS の URL パスに載って出ていくため、内容検査でも捕捉は難しい。欠けていたのは「この MCP 接続設定は誰が登録し、どの環境文脈にアクセスすることが認可されているか」の実行前検証であり、これは通信の監視とは別系統である。監査の観点でも、流出後に「どの秘密が・いつ・誰の登録した設定で送出されたか」を立証する独立した証跡は、アクセスログの突合以上のものが残らない。

なお、ユーザー指定の MCP URL がサーバーの秘密情報を搬出するような事案において、事後の検知・修正（detection）と、行動の前に出所・認可を独立検証する事前証明（pre-execution attestation）は代替ではなく **補完** の関係にある。接続先設定が解釈される前に登録者の権限と参照しうる文脈を証明することは、脆弱性スキャンや egress 監視を置き換えるものではなく、これを補って機能するものである。

---

## 5. 証明があれば、何が変わるか

事前証明(pre-execution attestation)は、エージェント基盤への接続先登録を権限行為として扱い、設定値が解釈される前に「登録者の権限」「設定が参照しうる文脈の範囲」を独立検証可能な証明として要求する設計を採る。proof が「この設定は登録者の権限を超える文脈(サーバー環境変数)を参照する」と告げれば、接続は実行前に block される。

本事象で露呈した検出と証明の落差(エージェントの接続先設定が、登録者の権限と参照可能な文脈の範囲について独立検証されないまま特権文脈で解釈される)に対して、Lemma は、エージェント基盤への接続先登録・能力付与を権限行為として証跡化し、実行前に「誰が・何を・どの範囲で」認可したかを独立検証可能な証明として検証する設計を提示している。

- **接続先登録の権限行為化**: MCP サーバー URL の登録を「エージェントに新しい接続先と能力を与える」権限行為として扱い、登録者と委任スコープを発行者署名付きで証跡化する
- **解釈前の権限検証**: 設定値が `process.env` に対して展開・解釈される前に、登録者がその文脈を参照する認可を持つことを実行前に独立検証する。スコープ外の参照は検出ではなく実行前の拒否として止まる
- **参照文脈の最小開示**: 「この設定は登録者の権限の範囲内にある」ことだけを検証側に開示し、サーバーの秘密情報や環境変数の全容は渡さない

これにより、設定の記述形式(プレースホルダ)ひとつで権限境界が崩れる構造を、検出に頼らず実行前の拒否として塞ぐ。検出(脆弱性スキャン・egress 監視)と事前証明(登録者権限の実行前検証)は相補的に働く。

---

## 6. Sources

- **GitHub Security Advisory**: "LibreChat Exfiltrates Server Secrets via MCP Server URL Injection"(GHSA-4pcc-j6m6-wcwx、2026-06-02)— https://github.com/danny-avila/LibreChat/security/advisories/GHSA-4pcc-j6m6-wcwx
- **NVD**: CVE-2026-32625(CVSS 9.6 Critical、2026-06-04 解析完了)— https://nvd.nist.gov/vuln/detail/cve-2026-32625
- **CIRCL Vulnerability-Lookup**: CVE-2026-32625(CISA SSVC 評価を含む集約レコード)— https://vulnerability.circl.lu/vuln/cve-2026-32625

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
