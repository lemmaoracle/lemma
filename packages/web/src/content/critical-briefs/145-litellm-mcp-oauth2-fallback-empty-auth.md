---
brief_no: 145
title: "AIゲートウェイLiteLLMで、MCP認証の失敗時フォールバックが「検証なしの許可」として機能していた(CVE-2026-59822、CISAが実悪用を確認しKEV登録) — 認証が失敗したことと、認証情報を検証しなかったことは、この設計では区別されなかった"
title_en: "In the LiteLLM AI gateway, the fallback for a failed MCP authentication check quietly behaved as unconditional access (CVE-2026-59822, confirmed under active exploitation and added to CISA's KEV catalog) — in this design, a failed check and no check at all produced the same outcome"
pillar: 03-agent-authority
primary_category: agent-infrastructure
secondary_categories: [identity-auth]
incident_date: 2026-06-30
published: 2026-09-11
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["003-starlette-badhost", "138-servicenow-ai-platform-quad-cve"]
status: published
version: "1.0"
og_lead_ja: "LiteLLMのMCP認証、失敗時フォールバックが無検証許可に(CVE-2026-59822)"
og_lead_en: "LiteLLM's MCP auth fallback silently granted unchecked access (CVE-2026-59822)"
---

## 1. TL;DR

「AIゲートウェイ」LiteLLM(BerriAI、オープンソース)のMCP Streamable HTTPエンドポイントに、認証バイパスの脆弱性CVE-2026-59822があった。LiteLLM自身のキー検証が失敗したときのフォールバックが、その失敗を「空の(=常に有効とみなされる)認可オブジェクト」に置き換えており、偽造したAuthorizationヘッダを送るだけで、有効なキーを持たない攻撃者が接続先のMCPツールに到達できた。2026年6月30日に公表されv1.84.0で修正されたが、CISAは9月2日、実際の悪用を確認してKEVカタログに追加した。**認証は「失敗する」ようには作られていたが、失敗した先で「拒否する」層はなく、検証されていないことがそのまま許可されたこととして扱われた。**

## 2. 何が起きたか

- LiteLLMは、OpenAI・Anthropic・Google等100以上のLLMプロバイダへのアクセスを単一のAPIで統一するオープンソースのAIゲートウェイ/プロキシで、企業が複数のAIモデル・MCPサーバーへのアクセスを一元管理する目的で広く使われている。
- MCP(Model Context Protocol)は、AIエージェントが外部ツール・データソースに接続するための標準プロトコルであり、LiteLLMはこのMCPサーバー群への接続を仲介するゲートウェイとして機能する。
- 問題はLiteLLMのMCP Streamable HTTPエンドポイントの認証処理にあった。上流のMCPサーバーに対するOAuth2「パススルー」(LiteLLM自身のキー検証に加え、上流のOAuth2トークンをそのまま中継する仕組み)を許可していたが、LiteLLM側のキー検証が失敗した場合のフォールバック処理が、検証失敗という結果を握りつぶし、空の`UserAPIKeyAuth()`オブジェクト(常に有効な認可情報として扱われるオブジェクト)へ置き換えていた。
- この結果、有効なLiteLLMキーを持たない攻撃者が、偽造したAuthorizationヘッダを付けてリクエストを送るだけで、キー検証をすり抜け、LiteLLM経由で設定済みのMCPツール一覧を取得・呼び出すことができた。
- GitHub(BerriAI/litellm)は2026-06-30、セキュリティアドバイザリGHSA-7488-6r32-c95qとしてこの脆弱性を公表し、CVSS 8.8(High、GitHub Security Advisory算定)と評価、v1.84.0で修正済みとした。
- 修正版v1.84.0の公開(2026-06-30、公表と同日)から約2か月後の2026-09-02、CISAはこの脆弱性の実際の悪用を確認したとして、KEV(Known Exploited Vulnerabilities)カタログに追加した。同日追加された7件のうち3件がAI関連基盤の脆弱性(本件LiteLLMに加え、Starlette[CVE-2026-48710、[Lemma Critical Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)で既出]、JFrog Artifactory)であり、セキュリティ研究者からは「KEV追加バッチでAI基盤の脆弱性がまとまった数を占めた最初の例」との指摘が出ている。
- インターネットに公開されたLiteLLM導入は8万件超確認されている、とセキュリティ研究者(FOFA)は報告している。

事案は次の構造で成立した。

1. **設計**: MCP接続時、LiteLLM自身のキー検証と上流MCPサーバーのOAuth2検証の双方に対応するため「パススルー」機構を用意。
2. **フォールバックの誤設計**: LiteLLM側のキー検証が失敗した場合の処理が、失敗をエラーとして扱わず、常に有効とみなされる空の認可オブジェクトへ暗黙に置き換わる。
3. **無検証到達**: 偽造したAuthorizationヘッダを送るだけで、この誤ったフォールバックを経由してMCPツール群に到達可能。
4. **公表と修正**: 2026-06-30、GHSAとして公表・v1.84.0で修正。
5. **実悪用の確認と連邦是正義務化**: 2026-09-02、CISAが実悪用を確認しKEVへ追加。連邦機関の是正期限は09-16。

## 3. 時系列 — 公表と対応

- 2026-06-30: GitHub(BerriAI/litellm)がセキュリティアドバイザリGHSA-7488-6r32-c95qを公表。CVE-2026-59822、CVSS 8.8。v1.84.0で修正済みとして公開。
- 2026-09-02: CISAが本脆弱性を含む7件をKEVカタログに追加。同日追加のうちLiteLLM・Starlette(CVE-2026-48710)・JFrog Artifactoryの3件がAI関連基盤の脆弱性だった。
- 2026-09-02: CISAは連邦機関に対する是正期限を、Kestra・Artifactory・Switchvox・SonicWallは09-05、LiteLLM・Starletteは09-16と設定した。

> 未修正版のLiteLLM導入を狙った攻撃キャンペーンとして、Starlette(CVE-2026-48710)とLiteLLMの別のコマンドインジェクション脆弱性(CVE-2026-42271)を組み合わせ、暗号資産マイニングツールXMRigを投下する事例が報じられている(The Hacker News・eSecurity Planet、2026-09)。<strong>この連鎖は本稿が扱うCVE-2026-59822とは異なる脆弱性の組み合わせであり、CVE-2026-59822自体がこの具体的な攻撃に使われたと確認する一次情報は本稿執筆時点で無い。</strong>CISAのKEV追加そのものは、CVE-2026-59822単体について実際の悪用が確認されたことを意味する。

対応・関連動向として次が確認できる。

- LiteLLMはこれ以前にも、SQLインジェクション(CVE-2026-42208)・コマンドインジェクション(CVE-2026-42271)など複数の脆弱性がCISAのKEVカタログに追加されており、本件は同一プロダクトで繰り返し確認されている重大脆弱性の一つである。
- 同じKEVバッチで追加されたStarlette(CVE-2026-48710)は、MCPサーバーの認証をHostヘッダの解釈違いで回避するもので、[Lemma Critical Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)で既に扱っている。

## 4. なぜ止まらなかったか

この事案の失敗は、未知の攻撃手法が使われたことでも、複雑な回避技術を要したことでもない。**認証キーの検証が「失敗した」という結果そのものが、後続処理では「検証されていない」のではなく「常に有効」として扱われる設計になっており、検証の失敗と検証の省略を区別する層がなかった**ことにある。

LiteLLMのMCP Streamable HTTPエンドポイントは、上流MCPサーバー向けのOAuth2パススルーという正当な機能を持っていた。だがそのフォールバック処理は、LiteLLM自身のキー検証が失敗した場合に、空の`UserAPIKeyAuth()`オブジェクトを生成して処理を継続させていた。このオブジェクトは、システムの他の部分から見れば検証済みで有効な認可情報と区別がつかない。偽造したAuthorizationヘッダを送るだけで、検証を通過したわけでも検証を回避したわけでもなく、検証が失敗した結果としてそのまま許可される経路に乗ってしまう。

<strong>「失敗した検証」と「検証をしていないこと」が、システムの振る舞いとしては同じ結果を生んだ。</strong>これは特定の巧妙な回避技術ではなく、フォールバック処理の設計そのものの問題だった。修正版v1.84.0は公表と同じ2026-06-30に出ている。それでもCISAが実悪用を確認しKEVへ追加したのは約2か月後の09-02であり、修正が存在することと、それが現場のゲートウェイに行き渡っていることは別だった。

同じKEVバッチで追加された[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)のStarletteも、経路は異なるが同じ構図を持つ。Hostヘッダの解釈のずれが、経路ベースの認証チェックを「通過したことになっている」状態にすり替え、MCPサーバーという同じ種類のAI基盤コンポーネントの認証層に穴を開けた。LiteLLMとStarletteが同じCISAバッチで揃って実悪用として確認されたことは、単発の実装ミスではなく、MCP周辺の認証処理に共通する設計パターン——検証の失敗や迂回を、明示的な拒否ではなく暗黙の許可として扱ってしまう——が繰り返し現れていることを示している。未認証の1リクエストがコード実行・権限昇格に届いたServiceNow AI Platformの事案([Brief 138](https://lemma.frame00.com/ja/critical/briefs/138-servicenow-ai-platform-quad-cve/))とも、認可判断が行動の直前に独立して確かめ直されていない点で連なる。

## 5. 証明があれば、何が変わるか

事前証明は、「認証チェックが失敗した、あるいは実行されなかった」という状態を、暗黙に「許可された」状態へ変換させない設計に置き換える。MCPゲートウェイがOAuth2パススルーのような柔軟な接続方式を持つこと自体を止めるのではない。検証が通らなかった経路が既定で拒否側に倒れることを、行動のたびに確かめられるようにする。

Lemmaがこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>フェイルクローズドな認可証明</strong>: 認証キー・トークンの検証が失敗、または実行されなかった場合、その状態自体を明示的な「未認可」として扱い、既定で許可される空のオブジェクトへ暗黙に置き換わることを防ぐ。</li>
<li><strong>行動ごとのMCPツール呼び出し認可</strong>: ゲートウェイを経由したMCPツールの呼び出しを、上流のOAuth2パススルーやLiteLLM自身のキーいずれか一方が形式上存在することではなく、呼び出し元がその時点でそのツールを呼んでよい主体であることを独立に確認した上で許可する。</li>
<li><strong>フォールバック処理自体の来歴</strong>: 認証フォールバック・例外処理のコードパスが、本来の検証経路と同等の検証水準を満たしているかを、実装段階で独立に検証可能にする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>LiteLLM・MCPサーバーの実装そのものの脆弱性修正(パッチ適用)を代替しない。</li>
<li>OAuth2パススルーという設計方針自体の是非を判定しない。</li>
<li>本脆弱性が実際にどの攻撃キャンペーンで使われたかの特定・帰属を代替しない。</li>
</ul>

事後の脆弱性スキャン・KEV登録との違いはここにある。CISAのKEV追加は、脆弱性が実際に悪用されたことを事後に確認し公表する仕組みである。修正は公表と同日に出ていたにもかかわらず、更新されないMCPゲートウェイの中でこの設計は動き続け、その悪用が確認されるまでに約2か月を要した。

検出の層と、この層は代替ではなく補完の関係にある。前者は脆弱性の存在と実悪用の事実を事後に明らかにし、後者は「検証が失敗した、または行われなかった」ことが次のツール呼び出しを許可する根拠にならないことを、行動が起きる前に確かめられるようにする。

## 6. Sources

- **GitHub / BerriAI(一次・公式セキュリティアドバイザリ)**: "MCP Authentication Bypass via OAuth2 Passthrough Fallback"(GHSA-7488-6r32-c95q、2026-06-30公開) — <https://github.com/BerriAI/litellm/security/advisories/GHSA-7488-6r32-c95q>
- **CISA(一次・公式KEVカタログ)**: "CISA Adds Seven Known Exploited Vulnerabilities to Catalog"(2026-09-02) — <https://www.cisa.gov/news-events/alerts/2026/09/02/cisa-adds-seven-known-exploited-vulnerabilities-catalog>
- **The Hacker News(独立報道)**: "CISA Adds Seven Exploited Flaws as Attackers Deploy Reverse Shells and Crypto Miners"(2026-09) — <https://thehackernews.com/2026/09/cisa-adds-seven-exploited-flaws-as.html>
- **eSecurity Planet(独立報道)**: "CISA Adds 7 Exploited Flaws as Attackers Target AI Infrastructure" — <https://www.esecurityplanet.com/news/news-cisa-exploited-ai-flaws/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェントの権限は[Pillar 03 — エージェントの権限](https://lemma.frame00.com/ja/pillars/#authority)。

数値・経緯はGitHub公式セキュリティアドバイザリ(GHSA-7488-6r32-c95q、2026-06-30)およびCISA公式KEVカタログ公表(2026-09-02)に基づく。CVSSスコアは発行元(GitHub Security Advisory)の8.8を採用し、一部二次情報が示す8.2表記は本文で採用しない。暗号資産マイニングキャンペーンとの関連は未確認である旨、本文中に明記した。
