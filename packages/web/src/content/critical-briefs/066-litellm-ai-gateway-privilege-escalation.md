---
brief_no: 66
title: "LiteLLM：一般ユーザー権限のまま AI ゲートウェイの管理者権限とサーバーのコード実行に到達できた — 権限チェックの各層が互いの検証を前提にし、行動の前に認可が独立検証されない構造（Obsidian Security）"
title_en: "LiteLLM AI Gateway: from low-privilege user to admin and RCE — authorization not independently verified before action (Obsidian Security)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-11
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["033-f5-bigip-edge-pivot", "064-salesloft-drift-oauth-salesforce", "046-servicenow-unauthenticated-api", "056-mchire-paradox-recruiting-auth", "027-librechat-mcp-url-secrets", "062-claude-code-github-action-bot-trust"]
status: draft
version: "1.0"
og_lead_ja: "一般ユーザーが管理者権限と RCE に到達 — LiteLLM ゲートウェイの連鎖"
og_lead_en: "Low-priv user to admin and RCE — the LiteLLM gateway chain"
gap_detected: "責任ある開示・段階的なパッチ・どのエンドポイントが叩かれたかの事後ログは記録・周知できた。"
gap_missing: "「この呼び出しは、その主体に許された操作か」を操作の前に確かめる層が無く、各段が前段を信頼して認可検証は素通りした。"
gap_fix: "特権操作の前に「この操作は、この主体に、付与された認可の範囲で許されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

LiteLLM（社内の AI 利用を束ねる OSS の AI ゲートウェイ）で、一般ユーザー権限のまま管理者権限を奪い、サーバー上で任意コードを実行できる連鎖を Obsidian Security が公表した（3 件の弱点で最高水準の深刻度）。責任ある開示や事後ログでは、「この呼び出しは、その主体に許された操作か」を操作の前に確かめられない。認可がルート層とハンドラ層に分かれながら、各段が前段の検証を前提にし、行動の時点で認可を独立検証する層が存在しなかった。

---

## 2. 何が起きたか

- **対象**: LiteLLM（BerriAI が開発する OSS の AI ゲートウェイ／プロキシ）。LLM 提供元への接続・認可・予算・ガードレール・監査ログを集約し、MCP / エージェントのゲートウェイとしても動作する
- **公表主体**: Obsidian Security（連鎖の研究公表）。ガードレールのサンドボックス脱出（CVE-2026-40217 に相当）は X41 D-Sec が独立に先行報告（2026-04-08、当時 CVE 未採番）。CVE-2026-47101 / 47102 の採番は VulnCheck が補助
- **脆弱性**: 3 件の連鎖（個別 CVE は CVSS 8.7〜8.8、連鎖時の 9.9 は Obsidian の評価）
  - **CVE-2026-47101**（認可バイパス）: `/key/generate` 等の鍵管理エンドポイントが、呼び出し側の指定した `allowed_routes` を検証せずそのまま保存。一般ユーザーが `["/*"]` を指定した鍵を発行でき、本来は管理者専用のルートに到達できる
  - **CVE-2026-47102**（権限昇格）: `/user/update`・`/user/bulk_update` にフィールドレベルの認可がなく、`user_role` を呼び出し側が書き換え可能。自分自身を `proxy_admin` に昇格できる
  - **CVE-2026-40217**（サンドボックス脱出 / RCE）: カスタムコード・ガードレールが利用者コードを `exec()` で実行する際に `__builtins__` を残すため、`__import__`・`open` 等が使えてサーバー側コード実行に至る
- **影響範囲（blast radius）**: ゲートウェイは AI スタックの要衝に座るため、連鎖の成立で管理者鍵（`LITELLM_MASTER_KEY`）・DB 認証情報・各モデル提供元の API キー・MCP / エージェントの認証情報・通過する会話内容（プロンプト、応答、混入した個人情報や秘密情報）に到達しうる
- **Man-in-the-Gateway**: より重大なのは「読める」ことより「操作できる」こと。乗っ取られたゲートウェイは、エージェントとモデルの間で応答を改変し、エージェント（例: 自動承認モードの Claude Code）に偽のツール呼び出しを実行させられる。Obsidian は、利用者が `hello` と打つだけで開発者端末にリバースシェルが返るデモを示した
- **修正**: BerriAI は段階的に修正し、全修正を含む `v1.83.14-stable`（2026-04-25 リリース）以降で連鎖が塞がれる

本事象は、二段に分かれた認可の各層が互いの検証を前提にしていたために、最初のゲートを一度抜けると残りが連鎖で従い、一般ユーザーがサーバーのコード実行に到達する構造を示す。経路は以下の通り。

1. **ルートゲートの突破（CVE-2026-47101）**: 一般ユーザーが `/key/generate` で `allowed_routes: ["/*"]` を指定した仮想鍵を発行する。プロキシは指定値を検証せずそのまま保存し、ルート権限はロールから導かれるはずが、鍵の `allowed_routes` がフォールバックの「付与」として働く。本来は届かない管理者専用ルートに到達できる
2. **ハンドラ層の無防備**: ルートゲートを抜けると、機微なエンドポイントの一部は「ルートゲートが既に選別したはず」と前提し、ハンドラ自身の認可を持たない
3. **権限昇格（CVE-2026-47102）**: `/user/update` でフィールドレベルの認可が欠落しているため、自分のレコードの `user_role` を `proxy_admin` に書き換えて昇格する
4. **サーバー側コード実行（CVE-2026-40217）**: 管理者経路で到達できるカスタムコード・ガードレールが `exec()` を `__builtins__` 付きで実行するため、任意コード実行に至る。MCP（stdio）経由でも、`proxy_admin` を得た時点で実質サーバー側コード実行になる
5. **Man-in-the-Gateway への展開**: RCE で悪性のコールバックを登録すると、ゲートウェイを流れる全リクエスト／レスポンスを読み・書き換えできる。エージェントへ偽のツール呼び出しを差し込み、自動承認の安全判定の文脈ごとすり替え、エージェントにローカル実行させる

---

## 3. 時系列 — 公表と対応

- 2026-02-19: Obsidian Security が 3 件の脆弱性を BerriAI へ報告（開示方針に従いメール／Huntr）
- 2026-02-24: ガードレール CRUD に `proxy_admin` チェックを加え、`exec()` 時に `__builtins__` をクリアする第一弾修正（PR #22095）
- 2026-04-09〜15: `allowed_routes` の非管理者設定を遮断（PR #25445）、フィールドレベル認可を追加（PR #25541）、ガードレールを RestrictedPython サンドボックスへ置換（PR #25818）
- 2026-04-10: CVE-2026-40217（ガードレールのサンドボックス問題）公開
- 2026-04-22〜25: `v1.83.10-stable`（権限昇格修正・サンドボックス）、続いて `v1.83.14-stable`（残る `allowed_routes` バイパス修正）リリース
- 2026-05-20: VulnCheck が CVE-2026-47101（認可バイパス）・CVE-2026-47102（権限昇格）を採番
- 2026-06-11: Obsidian Security が研究を公開（連鎖の全体像と Man-in-the-Gateway を実証）

> 注: 本 Brief が扱うのは Obsidian Security が示した上記 3 件（CVE-2026-47101 / 47102 / 40217）の権限昇格連鎖であり、この連鎖自体に実環境での悪用確認は本稿時点で報告されていない。一方、LiteLLM には本連鎖とは別系統の CVE-2026-42271（MCP プレビュー経由のコマンドインジェクション RCE、v1.83.7 で修正）が存在し、こちらは実環境での悪用が確認され CISA KEV に登録されている。二次報道が併記する「別の CVE 番号」「悪用確認」は多くがこの 42271 を指す。両者は別個の脆弱性であり、混同を避けるため本文の分析対象は前者の連鎖に限る（42271 も `v1.83.14-stable` 以降への更新で併せて塞がれる）。

公表後の対応と業界の動きは次のとおり。

- **BerriAI / LiteLLM**: 報告を受け段階的に修正。ガードレールへの `proxy_admin` チェック追加と `exec()` の `__builtins__` クリア、`allowed_routes` の非管理者設定の遮断、フィールドレベル認可の追加、RestrictedPython サンドボックスへの置換を経て、`v1.83.14-stable` で連鎖を解消
- **自己ホスト運用者への推奨**: `v1.83.14-stable` 以降への更新、`proxy_admin` 保有者の再検証（ホストレベルのアクセスと同等に扱う）、登録済みカスタムコード・ガードレールおよびコールバックの棚卸し（管理 UI に現れないコールバックの整合確認）、提供元 API キー・DB 認証情報・MCP トークンのローテーション
- **AI 基盤の権限境界**: 本事案は「ルート層のチェックは認可の一層であって認可モデルの全体ではない」という防御の多層化（defense in depth）を改めて突きつけた。ガードレール導入や権限フィールド変更のような管理操作は、ルートではなくハンドラで管理者認可を要すべきという論点が共有された
- **業界横断の論点**: AI スタックが旧来の Web の不具合を引き継いでいる実態（Obsidian の Langflow・Flowise 研究と同型）に加え、ゲートウェイという位置が「読む」を超えて「操舵する」脅威面になることが論点に。エージェントとモデルの間に置く中継は、信頼できる経路に限り、未知の第三者リレーを避けることが推奨されている

権限のチェックを「前段が確認済みという前提」ではなく「行動ごとに独立検証される認可の証明」として設計する不在は、特定 OSS の問題ではなく、AI ゲートウェイやエージェント基盤を運用する組織横断の課題として共有されつつある。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「認可がルート層とハンドラ層の二段に分かれていながら、各層が前段の確認を前提にし、行動の時点で呼び出し主体の認可を独立検証していなかった」</strong>点にある。`allowed_routes` という「鍵を狭めるための制約」が、実装上は「ロールを超える付与」に反転し、一度のバイパスが権限昇格とコード実行へ連鎖した。

[Brief 064](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/)（信頼された連携の OAuth が行動ごとにスコープ・失効検証されない）と同じ proof-as-auth の系譜にある。064 が「立ったままの権限」が窃取されエコシステムへ広がった事例だったのに対し、本事案は **権限のチェックそのものが層をまたいで前提に寄りかかり、内部から崩された**点が異なる。[Brief 046](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（ServiceNow の未認証 API が要求者の認可を実行前に証明していなかった）・[Brief 056](https://lemma.frame00.com/ja/critical/briefs/056-mchire-paradox-recruiting-auth/)（採用 AI がアクセス主体の権限属性を検証しなかった）とは、行動の前に「この主体はこの操作を行ってよいか」を独立検証しない点で同根。[Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)（ユーザー指定の MCP URL から秘密が漏れた LibreChat）・[Brief 062](https://lemma.frame00.com/ja/critical/briefs/062-claude-code-github-action-bot-trust/)（`[bot]` を名乗る入力を検証せず特権実行した Claude Code GitHub Action）とは、AI 基盤が入力・主体の出所を検証せず特権側に通す点で接続する。とりわけ [Brief 033](https://lemma.frame00.com/ja/critical/briefs/033-f5-bigip-edge-pivot/)（暗黙に信頼された F5 BIG-IP エッジ機器の侵害が、保存資格情報ごとドメイン全体へ横展開した）とは、カテゴリ（Pillar 03／identity-auth・agent-infrastructure・attribute-proof-bypass）を共有し、**基盤上の「信頼された一点」の突破が保存資格情報を巻き込んで連鎖する**構造で最も近い——LiteLLM ではゲートウェイが、033 ではエッジ機器が、その一点にあたる。

本事案がとりわけ際立たせるのは、**ゲートウェイの位置そのものが脅威面になる**ことだ。ゲートウェイはエージェントとモデルの間に座るため、乗っ取られると「読める」だけでなく、エージェントの実行フローを「操作できる」。鍵・秘密の露出に留まらず、エージェントの行動の操舵権が攻撃者に移る。AI 基盤の権限は、提示されたトークンやロールの名目ではなく、行動ごとに独立検証可能な認可として扱われて初めて、業務に安心して載せられる。

脆弱性の責任ある開示、BerriAI による段階的修正、`v1.83.14-stable` への更新、管理者ロール・ガードレール・コールバックの棚卸しは、被害の抑止と是正に不可欠であり、本 Brief がその役割を否定するものではない。パッチ適用と認証情報のローテーションは、露出を断つ重要な歯止めである。

一方で、検出やパッチは「いまこの呼び出しが、その主体に許された操作か」を、**操作の実行前に**独立に立証する材料にはならない。本事案の中核は、各層が「前段が確認したはず」と前提し、行動の時点での認可検証が存在しなかったことにある。ログ解析は「どのエンドポイントが叩かれたか」を事後に再構成するが、「その呼び出しは、主体に与えられた認可の範囲内だったか」を行動の前に独立検証する材料にはならない。とりわけ Man-in-the-Gateway では、コールバックは管理 UI に現れず、改変されたツール呼び出しは下流エージェントには正規の応答に見える。事後の照合では区別がつきにくい。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、エージェントやゲートウェイの各操作を「ロールやトークンの提示」ではなく「行動ごとにスコープされ独立検証可能な認可の証明」として扱う設計を採る。ガードレールの登録・権限フィールドの変更・ツール呼び出しといった特権操作を、付与者の認可の範囲に対して行為の時点で検証すれば、ルートゲートを一度抜けても、ハンドラ側の操作は認可の証明なしには成立しない。検出（事後の調査・パッチ・棚卸し）と認可の証明（行為時点での独立検証）は代替ではなく **補完** の関係にあり、両者が重なって初めて、AI ゲートウェイを監査・規制・業務の現場に安心して載せられる。

本事象で露呈した検出と証明の落差（権限が層をまたいで前提に寄りかかり、行動の時点で独立検証されない）に対して、Lemma は、エージェントやゲートウェイの行動を「ロール・トークンの提示」ではなく「行動ごとにスコープされ独立検証可能な認可の証明」として裏づける設計を提示している。

- **行動ごとのスコープ認可（proof-as-auth）**: 特権操作（ガードレール登録、権限フィールド変更、ツール呼び出し）を、付与者の認可の範囲に対して行為の時点で独立検証する。ルートゲートを抜けたという事実では満たせない、操作ごとの証明に置き換える
- **層をまたぐ前提の排除**: 「前段が確認済み」という連鎖前提を断ち、各操作が自層で認可の証明を要求する設計とする。一度のバイパスが権限昇格・コード実行へ連鎖する経路を、行動の前に塞ぐ
- **ゲートウェイ経路の完全性**: エージェントとモデルの間を流れる要求・応答の出所と完全性を独立検証可能にし、改変されたツール呼び出しや不可視のコールバックを、下流エージェントが受理する前に弾く（[Brief 062](https://lemma.frame00.com/ja/critical/briefs/062-claude-code-github-action-bot-trust/) の入力主体検証、[Brief 027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/) の MCP 経路と接続）
- **選択的開示**: 内部データを出さずに、「この操作は付与者の認可の範囲内である」ことだけを最小開示し、独立検証と機微情報保護を両立する

これにより、行為の時点で固定された証明が、「このゲートウェイ／エージェントの操作は、認可の範囲内か」を、事後のログ照合に依存せず独立検証可能なトレイルとして機能させる。検出（事後の調査・パッチ・棚卸し）は被害の是正に、事前証明（行為時点の認可の独立検証）は AI 基盤の信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **Obsidian Security（一次・研究）**: “Breaking LiteLLM: From Low-Privilege User to Admin and RCE (CVE-2026-47101, CVE-2026-47102, CVE-2026-40217)”（2026-06-11、連鎖の全体像・開示タイムライン・Man-in-the-Gateway 実証）— <https://www.obsidiansecurity.com/blog/litellm-privilege-escalation-rce>
- **X41 D-Sec（一次・独立報告）**: “X41-2026-001 LiteLLM”（ガードレール `/guardrails/test_custom_code` のサンドボックス脱出、2026-04-08 公表・当時 CVE 未採番）— <https://www.x41-dsec.de/lab/advisories/x41-2026-001-litellm/>
- **NVD**: CVE-2026-40217（ガードレールのサンドボックス脱出）— <https://nvd.nist.gov/vuln/detail/CVE-2026-40217>
- **The Hacker News**: “LiteLLM Vulnerability Chain Lets Low-Privilege Users Take Over AI Gateway Servers”（2026-06）— <https://thehackernews.com/2026/06/litellm-vulnerability-chain-lets-low.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
