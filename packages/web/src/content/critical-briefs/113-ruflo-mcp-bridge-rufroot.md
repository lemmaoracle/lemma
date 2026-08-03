---
brief_no: 113
title: "Ruflo の MCP Bridge：一つの無認証リクエストが 233 の高権限ツールを開き、パッチ後も記憶の汚染が残る — 実行の前に、ツール呼び出しの認可と記憶の来歴が独立検証されない"
title_en: "Ruflo's MCP Bridge: one unauthenticated request opened 233 high-privilege tools, and the memory poisoning survives the patch — tool-call authorization and memory provenance are never verified before execution"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-07-28
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["066-litellm-ai-gateway-privilege-escalation", "088-kestra-auth-filter-bypass-rce", "046-servicenow-unauthenticated-api", "095-amazon-q-mcp-auto-execution", "073-shadowmq-pickle-zmq-pattern"]
status: published
version: "1.0"
og_lead_ja: "Ruflo MCP Bridge に無認証 RCE（CVE-2026-59726）、記憶汚染はパッチ後も残る"
og_lead_en: "Ruflo MCP Bridge unauthenticated RCE: memory poisoning survives the patch"
gap_detected: "脆弱性は責任開示で発見され、メンテナが 24 時間以内にパッチと勧告を公開した。"
gap_missing: "ツール呼び出しごとの認可と、エージェントの記憶（学習ストア）の来歴・完全性を、実行の前に独立に確かめる層。"
gap_fix: "実行前にツール呼び出しを認可で証明し、エージェント記憶の来歴・完全性を独立検証して、無認証実行と汚染の永続化を排除する。"
---

## 1. TL;DR

Ruflo（旧 Claude Flow。Codex や Claude Code 向けに AI エージェントの swarm をホストするオーケストレーション基盤、メンテナ Reuven Cohen）の MCP Bridge に、最大深刻度の脆弱性が見つかった。コードネーム RufRoot、CVE-2026-59726、CVSS 10.0、影響はバージョン 3.16.3 未満である。既定の docker-compose デプロイは、MCP Bridge の `POST /mcp` と `POST /mcp/:group` を無認証のままネットワークに公開し、`terminal_execute` を含む 233 の高権限ツール（シェル実行・DB 操作・エージェント管理・メモリ保存）を露出させる。無認証のネットワーク攻撃者は `tools/call` から `terminal_execute` を呼び、コンテナ内でシェルを取得できる。発見は Noma Security（Noma Labs）、責任開示は 2026-06-30、修正は 24 時間以内に公開された。検出と開示は効いていた。**効かなかったのは、ツール呼び出しの認可と、エージェントの記憶に残った汚染の来歴・完全性を、実行の前に独立に確かめる層である。**

## 2. 何が起きたか

- 脆弱性は Noma Labs が発見し、CVE-2026-59726（CVSS 10.0）として公表された。影響は Ruflo 3.16.3 未満。既定の docker-compose がポート 3001 を `0.0.0.0` にバインドし、MCP Bridge（Express.js サーバ）をすべてのネットワークインターフェースに公開する。
- MCP Bridge は Ruflo におけるすべてのツール呼び出しの単一経路であり、233 のツールを無認証・無トークン・無ヘッダ検査で HTTP に露出する。露出ツールにはシェル実行の `terminal_execute` が含まれる。autopilot フローには危険操作のブロックリストがあるが、`/mcp` エンドポイントはこれを完全に迂回する。
- 攻撃者は被害者のプロバイダ鍵と計算資源を用い、攻撃者制御の swarm を起動できる。さらに AgentDB の学習ストア（pattern store）へ汚染パターンを注入し、将来の AI 応答を攻撃者の指示へ誘導する形で永続化できる点が、この事案の核である。

攻撃は次の連鎖で成立している。

1. 偵察：無認証で `tools/list` を呼び、利用可能な 233 のツールを列挙する。
2. リモートコード実行：`tools/call` から `terminal_execute` を呼び、ブリッジ・コンテナ内で任意のシェルコマンドを得る。
3. API 鍵の窃取：docker-compose が各プロバイダの鍵を環境変数として渡すため、コンテナ環境変数を読み取って鍵を収集する。
4. エージェントの武器化：被害者の鍵で `swarm_init`・`agent_spawn` を呼び、攻撃者制御の swarm を起動する。
5. 記憶の汚染：`agentdb_pattern-store` を通じて学習パイプラインへ汚染パターンを注入し、将来の応答を攻撃者の指示へ誘導する。汚染はパッチ後も学習ストアに残り得る。
6. 永続化：内部ネットワーク上の認証なしの DB からの会話データ持ち出し、コンテナへのバックドア書き込みにより、再起動をまたいで足場を維持する。

## 3. 時系列 — 公表と対応

- 2026-06-30：Noma Labs がメンテナへ責任開示。
- 2026-06-30（開示後、数時間内）：メンテナが修正を公開。24 時間以内に完全なパッチがマージされ、セキュリティ勧告が発行された。
- 2026-07-28〜29：一般公表と各メディアの報道。CVE-2026-59726（CVSS 10.0）として整理される。

> 注：本 Brief の事実は、発見者（Noma Security / Noma Labs）の一次公表と、確立したセキュリティメディアの報道に基づく。実環境での悪用の有無や被害規模は、公表時点で確定していない。本 Brief は特定の運用者の過失を断罪するものではなく、無認証のツール呼び出しと、学習ストアに残る汚染が、実行の前に独立検証されないという構造に焦点を当てる。CVE 番号・CVSS スコア・影響バージョン・ツール数（233）は一次公表に基づく。

公表後の対応と業界の動きは次のとおり。

- 修正では、MCP Bridge が既定でループバックにバインドされ、認証トークン未設定で公開バインドを試みると fail-closed になる。Bearer 認証、`terminal_execute` の既定オフ化、DB の起動時認証、読み取り専用コンテナなどが導入された。
- メンテナは、露出インスタンスの運用者向けに、ポートの即時閉鎖・全プロバイダ鍵のローテーション・学習ストア（AgentDB pattern store）の注入エントリ監査を勧告した。パッチ適用済みの再デプロイだけでは汚染は取り消されない、と明記されている。

## 4. なぜ止まらなかったか

この事案の失敗は、脆弱性の発見が遅れたことでも、パッチが出なかったことでもない。ツール呼び出しがいま認可されているかと、エージェントの記憶に注入された汚染の来歴・完全性を、実行の前に独立に確かめる層が無かったことにある。検出は効いた。脆弱性は責任開示で見つかり、修正は 24 時間以内に出て、勧告も公開された。効かなかったのは、その手前——ツール呼び出しが成立する瞬間の認可検証と、学習ストアへ書き込まれるパターンの来歴検証である。

無認証の `tools/call` は、経路上では正規のツール呼び出しと見分けがつかなかった。ブリッジに届いたリクエストは、送信元が誰であれ `executeTool()` へ素通しされ、`terminal_execute` を含む高権限ツールがそのまま動いた。呼び出しが届いたことが実行の許可の代用として通り、その呼び出しがいまこの操作を本当に認可されているかは、実行の前に問われなかった。そして一度書き込まれた汚染パターンは、脆弱性そのものをパッチしても学習ストアに残る。単にソフトをパッチすることは、AI システム内部に残る記憶の汚染に対して、信頼の回復を保証しない。

> パッチ後も汚染が残るという点が、この事案を通常の一度きりの RCE と分ける。検出とパッチは、露出した実行経路を塞ぐ。しかし学習ストアに残ったパターンは、将来の応答を攻撃者の指示へ持続的に誘導し続け、その記憶の来歴と完全性は検証されないままである。塞いだ後に残るのは、来歴の分からない記憶である。

同じ構造は、権限の境界が実行の前に検証されず通過した [Brief 066（LiteLLM AI ゲートウェイの権限昇格）](https://lemma.frame00.com/ja/critical/briefs/066-litellm-ai-gateway-privilege-escalation/)・[Brief 088（Kestra の認証フィルタ迂回による RCE）](https://lemma.frame00.com/ja/critical/briefs/088-kestra-auth-filter-bypass-rce/)・[Brief 046（ServiceNow の無認証 API）](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)、エージェントがツール呼び出しを検証なく実行した [Brief 095（Amazon Q の MCP 自動実行）](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/)、汚染が実行時に持ち込まれ持続した [Brief 073（ShadowMQ の pickle/ZMQ パターン）](https://lemma.frame00.com/ja/critical/briefs/073-shadowmq-pickle-zmq-pattern/) と連なる。いずれも、経路に届いたことと、その行動がいま認可されていること・その記憶が正しい来歴を持つことが、別の問いであることを示している。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、エージェントがツールを呼び、記憶を書き込む一つひとつの行動の前に、その認可の状態と記憶の来歴を独立に検証する層を経路に一段挟む。呼び出しが届いた事実を実行の許可の代用にせず、「この呼び出しは、いまこの操作を、この範囲で認可されているか」を実行が成立する前に確かめる。答えが「認可なし」「来歴不明」であれば、実行も書き込みも事前に保留される。学習ストアへ入る前にパターンの来歴が検証されるため、汚染はパッチの有無に依存せず、実行の前に分別される。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **ツール呼び出しごとの認可証明**：`tools/call` を、ネットワーク到達性の有無ではなく、その操作をいま認可されていることの独立検証可能な証明に結び付ける。無認証のツール呼び出しは、実行の前に成立しない。
- **エージェント記憶の来歴・完全性検証**：学習ストア（AgentDB 等）へ書き込まれるパターンを、来歴の検証を経たものだけに限る。注入された汚染パターンは、書き込みの前に来歴を欠くものとして分別され、パッチ後も残り続けない。
- **最小権限と秘密の分離**：シェル実行・鍵・DB へのアクセスを、単一のブリッジに束ねず、行動ごとの認可の下で分離する。一つの無認証リクエストが全権限に到達する経路を、設計として断つ。
- **選択的な実行記録**：どのツールが・どの認可の下で呼ばれ、どのパターンが・どの来歴で記憶に入ったかを、後から改ざんできない証跡として残す。事後に、実行経路と記憶の来歴を独立に立証できる。

Lemma は脆弱性そのものをパッチする製品ではなく、露出したエンドポイントを塞ぐものでもない。射程は、ツール呼び出しと記憶の書き込みが起きる前に、認可と来歴を独立に検証し、無認証実行と汚染パターンの通過を実行前に排除することにある。検出（脆弱性の発見、パッチ、経路の閉鎖）と、事前証明（実行の前に認可と記憶の来歴を独立検証する証跡）は、代替ではなく補完の関係にある。前者は露出した経路の把握と閉鎖に、後者はパッチ後も残る記憶の汚染を実行前に断つことに働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、適用範囲は [Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority) を参照。

## 6. Sources

- Noma Security（Noma Labs）, “RufRoot: The MCP Bridge Vulnerability That Turns Agents Into Rogue Admins (CVE-2026-59726)”（2026-07-29、一次）— <https://noma.security/blog/rufroot-the-mcp-bridge-vulnerability-that-turns-agents-into-rogue-admins-cve-2026-59726/>
- The Hacker News, “Ruflo MCP Flaw Lets Unauthenticated Attackers Run Commands and Poison AI Memory”（2026-07）— <https://thehackernews.com/2026/07/ruflo-mcp-flaw-lets-unauthenticated.html>
- Dark Reading, “Patch-Resistant RufRoot Flaw Enables Malicious AI Agent Swarms”（2026-07）— <https://www.darkreading.com/cyber-risk/patch-resistant-rufroot-flaw-malicious-ai-agent-swarms>
- SecurityWeek, “Critical Ruflo Flaw Lets Attackers Spawn Rogue AI Swarms”（2026-07）— <https://www.securityweek.com/critical-ruflo-flaw-lets-attackers-spawn-rogue-ai-swarms/>
- NVD, “CVE-2026-59726”（2026-07）— <https://nvd.nist.gov/vuln/detail/CVE-2026-59726>

参照: [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority) · [Brief 095（Amazon Q の MCP 自動実行）](https://lemma.frame00.com/ja/critical/briefs/095-amazon-q-mcp-auto-execution/) · [Brief 066（LiteLLM の権限昇格）](https://lemma.frame00.com/ja/critical/briefs/066-litellm-ai-gateway-privilege-escalation/)
