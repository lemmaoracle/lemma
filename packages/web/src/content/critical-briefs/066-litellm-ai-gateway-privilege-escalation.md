---
brief_no: 66
title: "LiteLLM：一般ユーザーの権限のまま、AI ゲートウェイの管理者権限とサーバーでのコード実行に届く連鎖が報告された(Obsidian Security の研究)"
title_en: "LiteLLM: a low-privilege user could reach admin rights and code execution on the AI gateway, researchers report (Obsidian Security research)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-11
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["033-f5-bigip-edge-pivot", "064-salesloft-drift-oauth-salesforce", "046-servicenow-unauthenticated-api", "056-mchire-paradox-recruiting-auth", "027-librechat-mcp-url-secrets", "062-claude-code-github-action-bot-trust"]
status: published
layout: "report"
sections: "proof"
gate: "permission-change"
version: "1.0"
og_lead_ja: "LiteLLM で、一般ユーザーの権限のまま管理者権限とサーバーでのコード実行に届く 3 件の脆弱性の連鎖を、Obsidian Security が報告"
og_lead_en: "Obsidian Security reports a chain of three LiteLLM flaws that let a low-privilege user reach admin rights and server-side code execution"
og_kicker_ja: "脆弱性の開示 · 権限昇格"
og_kicker_en: "VULNERABILITY · AI GATEWAY"
og_headline_ja: "一般ユーザーの権限で、\nゲートウェイの管理者に\n届く連鎖を研究者が報告。\n<accent>連鎖の評価は CVSS 9.9</accent>"
og_headline_en: "A low-privilege user\ncould reach gateway\nadmin, researchers say.\n<accent>Chain rated CVSS 9.9</accent>"
search_title: "LiteLLM の権限昇格：一般ユーザーが管理者に届く連鎖"
search_description: "AI ゲートウェイの LiteLLM で、一般ユーザーの権限のまま管理者権限とサーバーでのコード実行に届く 3 件の脆弱性の連鎖が報告された（Obsidian Security）。何が通ったか、何を照合するか、対策を整理。"
key_figures:
  - value: "9.9"
    label: "3 件の脆弱性を連鎖させたときの深刻度（CVSS）。Obsidian Security の評価で、個別の CVE は 8.7〜8.8"
    tone: "alert"
  - value: "02-19 → 04-25"
    label: "Obsidian Security が BerriAI へ報告してから、連鎖を塞ぐ修正をすべて含む v1.83.14-stable のリリースまで"
  - value: "3"
    unit: "件"
    label: "連鎖した脆弱性（認可の回避・権限昇格・サンドボックスの脱出）"
glossary:
  - term: "AI ゲートウェイ"
    desc: "社内の AI の利用を束ねる中継。LLM の提供元への接続・認可・予算・ガードレール・監査ログを一か所で扱い、エージェントとモデルの間に座る。LiteLLM は BerriAI が開発する OSS のゲートウェイ。"
  - term: "proxy_admin"
    desc: "LiteLLM の管理者のロール。鍵・ユーザー・ガードレールなどの設定を変えられる。"
  - term: "カスタムコードのガードレール"
    desc: "要求や応答を検査するために、利用者が書いたコードをゲートウェイの上で動かす仕組み。"
insight:
  slug: "earlier-layer-assumed"
  label: "前の層が確認したという前提"
  quote: "特権の操作のたびに、依頼した主体がその操作を許されているかを、前の層を通ったこととは別に照合しなければ、一つの層を抜けた要求は、その先の操作もそのまま通る。"
industries: ["ai", "developers"]
operations: ["account-admin"]
controls:
  - slug: "verify-entry"
    item: "特権操作のたびに、前段の通過を前提とせず、依頼元の認可を自層で確認する"
  - slug: "limit-and-revoke"
    item: "一般ユーザーに管理者の操作を渡さず、権限の範囲を必要な分に絞る"
attack_method: "privilege-abuse"
takeaway: "一般ユーザーの権限のまま、鍵の範囲の拡大・ロールの書き換え・コードの実行へと進む連鎖が、研究者に報告された。特権の操作のたびに、その主体に許された操作かを照合する。"
self_check: "ロールの変更やコードの登録のような特権の操作の前に、依頼した主体がその操作を許されているかを、前の層を通ったこととは別に照合しているか。"
countries: ["global"]
---

## 1. 要点

Obsidian Security の報告によれば、LiteLLM の認可は、要求をどのルートに通すかを見る層と、各処理（ハンドラ）の層に分かれ、一部の機微な処理は「ルートの層が選別したはず」という前提で、自身の認可を持たなかった。鍵の発行で呼び出し側が指定した範囲の値は検証されずに保存され、一般ユーザーが管理者向けのルートに届き、自分のロールの書き換えと、管理者が登録できるコードの実行へ進めた、とされる。この連鎖が実環境で悪用されたという報告は、本稿の時点で無い。修正は、研究の公開の前に提供されている。<strong>特権の操作のたびに、依頼した主体がその操作を許されているかを、前の層を通ったこととは別に照合しなければ、一つの層を抜けた要求は、その先の操作もそのまま通る。</strong>

## 2. 通った操作

- **通った操作**: 一般ユーザーの権限での、届く範囲を検証されない鍵の発行と、それによる管理者向けのルートへの到達。続いて、欄ごとの認可が無いユーザーの更新による、自分のロールの管理者（`proxy_admin`）への書き換えと、管理者の経路で届くカスタムコードのガードレールでの、サーバーでのコード実行（Obsidian Security）。
- **受け付けた側に届くもの**: 一般に、AI ゲートウェイは、モデルの提供元の API キーや、通過する会話の内容を一か所に持つ。Obsidian の報告では、連鎖が成立すると、管理者鍵（`LITELLM_MASTER_KEY`）・DB の認証情報・各提供元の API キー・MCP やエージェントの認証情報・通過するプロンプトと応答に届きうる。さらに、乗っ取られたゲートウェイは、エージェントとモデルの間の応答を書き換え、エージェント（自動承認のモードの Claude Code など）に偽のツール呼び出しを実行させうるとして、Obsidian は開発者の端末でコマンドが実行されるデモを示した。
- **公表されていないこと**: この連鎖が、実環境の標的に使われた事例。本稿の時点で報告されていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、ロールの変更やコードの登録のような特権の操作の前に、その処理自身が、依頼した主体がその操作を許されているかを、前の層を通ったことや、鍵に書かれた範囲とは別に照合することである。

- **誰が承認を出すか**: ゲートウェイの運用者（管理者のロールを付与する側）。誰に管理者の操作を許し、鍵にどの範囲を与えるかは、依頼する側が指定する値ではなく、運用者が決めた記録で決まる。
- **どこで照合するか**: 特権の操作を実行する各処理の直前。ルートの層を抜けたことを根拠にせず、ロールや権限の欄の変更、ガードレールやコールバックの登録のたびに、依頼した主体の権限を照合する。照合できない操作は、実行しない。
- **何が残るか**: 誰が、どの権限で、どの範囲の鍵を作り、どのロールを変え、どのコードを登録したかの記録。ゲートウェイの管理画面とは別に残す（Obsidian によれば、悪性のコールバックは管理画面に現れない）。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝ロールの変更やコードの登録の前に、依頼した主体がその操作を許されているかを、その処理で照合し、記録に残すこと。検知＝研究者が連鎖を見つけて報告すること。日付は、報告・修正・公開の日で、連鎖が使われた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>特権の操作の前に、依頼した主体の権限を、その処理で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>一般ユーザーの権限のまま、<br>管理者権限とコード実行に届くと示された</span></div>
<div class="rx-zone det"><b>検知 · 研究者が見つけた</b>Obsidian Security が報告し、BerriAI が段階的に修正した</div>
<div class="rx-g g1"><div class="t">02-19</div><b>Obsidian が BerriAI へ報告</b></div>
<div class="rx-g g2"><div class="t">02-24</div><b>最初の修正</b></div>
<div class="rx-g g3"><div class="t">04-25</div><b>v1.83.14-stable で連鎖を塞ぐ</b></div>
<div class="rx-g g4"><div class="t">06-11</div><b>研究を公開</b></div>
</div>
</figure>

脆弱性の発見と、修正の後の公開は働き、BerriAI は報告を受けて段階的に修正した。ログは、どのエンドポイントが呼ばれたかを後からたどれる。効かなかったのは、その手前で、特権の操作のたびに、依頼した主体の権限を照合する層である。行動ごとに範囲と失効が照合されなかった [Salesloft Drift の OAuth](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/)、要求者の認証を設定に任せた [ServiceNow の API](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)、信頼されたエッジ機器の侵害が保存された認証情報ごと広がった [F5 BIG-IP](https://lemma.frame00.com/ja/critical/briefs/033-f5-bigip-edge-pivot/) と同じ形で、特権の操作が、操作の時点での権限の照合に結び付いていない。

## 4. Lemma でできること

**Lemma は、03 の照合を、ゲートウェイの特権の操作を実行する処理の直前に組み込む。** 脆弱性や不審な呼び出しを見つけるのではなく、依頼した主体がその操作を許されているかを、前の層を通ったこととは別に、実行の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 社内の AI の利用を AI ゲートウェイに束ね、モデルの提供元の鍵・予算・ガードレール・監査ログを一か所で扱う組織。ゲートウェイは、エージェントとモデルの間に座る。
- **業界 · 開発者・エージェント運用**: LiteLLM のような OSS のゲートウェイを自分でホストし、エージェントや MCP の経路にしている開発・運用のチーム。
- **業務 · アカウント・権限の管理**: 鍵の発行、ユーザーのロールの変更、ガードレールやコールバックの登録。一般ユーザーにも開いた入口から、管理者の操作に届く経路になりうる。

### いまの対策と Lemma の違い

今回の連鎖の入口は、1 列目の、一般ユーザーによる管理者の操作である。2 列目は、その先の、管理者の権限でのコードの登録と実行、3 列目は、Obsidian がデモで示した、乗っ取られたゲートウェイを経たエージェントの操作である。

| 対策 | 一般ユーザーによる管理者の操作（鍵の範囲の拡大・ロールの書き換え） | 管理者の権限での、コードの登録と実行 | 乗っ取られたゲートウェイが書き換えた応答による、エージェントの操作 |
| --- | --- | --- | --- |
| ルートの層での選別（修正の前） | 効かない | 関係しない | 関係しない |
| 修正を含む版（v1.83.14-stable 以降）への更新 | 一部 | 一部 | 一部 |
| 管理者のロール・ガードレール・コールバックの棚卸し（操作の後・推奨） | 効かない | 効かない | 一部 |
| エージェントとモデルの間の中継を、信頼できる経路に限る（推奨） | 関係しない | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 | 効かない |

ルートの層での選別は、範囲の値が検証されない鍵で満たせた（Obsidian Security）。修正を含む版への更新は、報告された 3 件の経路を塞ぐが、同じ前提を持つ別の処理が残れば、そこは塞がない。棚卸しは、昇格した利用者や登録されたコード・コールバックを後から見つけて外すが、操作そのものは止めない。中継を信頼できる経路に限ることは、未知の第三者のリレーを避けるが、信頼していたゲートウェイが乗っ取られた場合は残る。Lemma は、鍵の範囲の拡大やロールの書き換えを、依頼した主体が運用者の記録で許されているかに照合するので、一般ユーザーによる管理者の操作は、実行の前に止まる。管理者として許された主体によるコードの登録は、照合が一致して通り、登録されたコードがサンドボックスを抜けるかどうかは、照合の対象ではない。

注：Lemma の照合が働くのは、ゲートウェイの特権の操作を実行する各処理に照合を組み込み、ロールと権限の記録が、依頼する側が指定できる値とは別に管理されている場合に限る。管理者の鍵や端末が奪われた場合や、ゲートウェイの上でコードが実行され照合を通らない経路ができた場合は、通りうる。Lemma は、ゲートウェイを流れる応答の中身の善悪を判定せず、すでに露出した鍵を入れ替えることもしない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI ゲートウェイを自分でホストしている組織で確認する 3 項目

- 使っている AI ゲートウェイが、報告された脆弱性の修正を含む版（LiteLLM なら v1.83.14-stable）以降になっているか。
- 管理者のロール（`proxy_admin` など）を持つ利用者を一覧で把握し、ホストへのアクセスと同じ重さで扱っているか。
- 登録済みのカスタムコードのガードレールとコールバックを、管理画面とは別の一覧と照合しているか。

## 5. 事実と時系列

- **対象**: LiteLLM（BerriAI が開発する OSS の AI ゲートウェイ／プロキシ）。LLM の提供元への接続・認可・予算・ガードレール・監査ログを集約し、MCP やエージェントのゲートウェイとしても動く。
- **報告者**: Obsidian Security（連鎖の研究の公表）。ガードレールのサンドボックスの脱出（CVE-2026-40217 に相当）は、X41 D-Sec が独立に先に報告した（2026-04-08、当時は CVE が未採番）。CVE-2026-47101／47102 の採番は VulnCheck が補助した。
- **研究者の報告（3 件の脆弱性）**: 個別の CVE は CVSS 8.7〜8.8 で、連鎖させたときの 9.9 は Obsidian の評価。
  - **CVE-2026-47101（認可の回避）**: 鍵の管理のエンドポイント（`/key/generate` など）が、呼び出し側が指定した鍵の届く範囲（`allowed_routes`）を検証せずに保存した。ルートの権限はロールから決まるはずが、鍵の範囲が付与として働き、一般ユーザーが管理者向けのルートに届いた。
  - **CVE-2026-47102（権限昇格）**: ユーザーの更新のエンドポイント（`/user/update`・`/user/bulk_update`）に欄ごとの認可が無く、呼び出し側が自分のロールを `proxy_admin` に書き換えられた。
  - **CVE-2026-40217（サンドボックスの脱出）**: カスタムコードのガードレールが、利用者のコードを、実行環境の標準の機能を制限しないまま実行したため、サーバーでのコード実行に至った。
- **研究者の報告（ハンドラの層）**: ルートの層を抜けると、一部の機微なエンドポイントは、ルートの層が選別したことを前提に、自身の認可を持たなかった。
- **研究者の報告（Man-in-the-Gateway）**: コード実行で悪性のコールバックを登録すると、ゲートウェイを流れる要求と応答を読み、書き換えられる。Obsidian は、エージェントに偽のツール呼び出しを差し込み、開発者の端末でコマンドが実行されるデモを示した。
- **修正**: BerriAI が段階的に修正し、すべての修正を含む `v1.83.14-stable`（2026-04-25 リリース）以降で連鎖が塞がれる。

### 時系列

- **2026-02-19**: Obsidian Security が 3 件の脆弱性を BerriAI へ報告（開示の方針に従い、メール／Huntr で）。
- **2026-02-24**: 最初の修正。ガードレールの作成・変更に `proxy_admin` の確認を加え、コードの実行環境を制限した（PR #22095）。
- **2026-04-08**: X41 D-Sec が、ガードレールのサンドボックスの脱出を公表（当時は CVE が未採番）。
- **2026-04-09〜15**: 非管理者による `allowed_routes` の設定を遮断（PR #25445）、欄ごとの認可を追加（PR #25541）、ガードレールを RestrictedPython のサンドボックスへ置き換え（PR #25818）。
- **2026-04-10**: CVE-2026-40217（ガードレールのサンドボックスの問題）が公開。
- **2026-04-22〜25**: `v1.83.10-stable`（権限昇格の修正・サンドボックス）、続いて `v1.83.14-stable`（残る `allowed_routes` の回避の修正）がリリース。
- **2026-05-20**: VulnCheck が CVE-2026-47101（認可の回避）・CVE-2026-47102（権限昇格）を採番。
- **2026-06-11**: Obsidian Security が研究を公開（連鎖の全体像と Man-in-the-Gateway のデモ）。

> 本 Brief が扱うのは、Obsidian Security が示した 3 件（CVE-2026-47101／47102／40217）の権限昇格の連鎖で、この連鎖が実環境で悪用されたという報告は、本稿の時点で無い。LiteLLM には、この連鎖とは別系統の CVE-2026-42271（MCP のプレビューを経由するコマンドインジェクション、v1.83.7 で修正）があり、こちらは実環境での悪用が確認され、CISA KEV に登録されている。二次報道が併記する「別の CVE 番号」「悪用の確認」は、多くが 42271 を指す。両者は別の脆弱性で、本 Brief の分析は前者の連鎖に限る（42271 も `v1.83.14-stable` 以降への更新で併せて塞がれる）。手法の事実は Obsidian Security の研究と X41 D-Sec の報告に拠り、本 Brief は再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **BerriAI / LiteLLM**: 報告を受けて段階的に修正した。ガードレールへの `proxy_admin` の確認の追加と実行環境の制限、非管理者による `allowed_routes` の設定の遮断、欄ごとの認可の追加、RestrictedPython のサンドボックスへの置き換えを経て、`v1.83.14-stable` で連鎖を塞いだ。
- **自己ホストの運用者への推奨（Obsidian Security）**: `v1.83.14-stable` 以降への更新、`proxy_admin` を持つ利用者の見直し（ホストへのアクセスと同じ重さで扱う）、登録済みのカスタムコードのガードレールとコールバックの棚卸し（管理画面に現れないコールバックとの照合）、提供元の API キー・DB の認証情報・MCP のトークンの入れ替え。
- **権限の境界の論点**: 「ルートの層の確認は認可の一層で、認可の仕組みの全体ではない」という多層の防御の論点が挙げられ、ガードレールの導入や権限の欄の変更のような管理の操作は、ルートではなくハンドラで管理者の認可を求めるべきだとされた。
- **業界の論点**: AI のスタックが旧来の Web の不具合を引き継いでいること（Obsidian の Langflow・Flowise の研究と同じ型）に加え、ゲートウェイという位置が「読む」を超えて「操る」脅威の面になることが論点に挙げられた。エージェントとモデルの間に置く中継は信頼できる経路に限り、未知の第三者のリレーを避けることが推奨されている。

## 6. Sources

- **Obsidian Security（一次・研究）**: “Breaking LiteLLM: From Low-Privilege User to Admin and RCE (CVE-2026-47101, CVE-2026-47102, CVE-2026-40217)”（2026-06-11、連鎖の全体像・開示タイムライン・Man-in-the-Gateway 実証）— <https://www.obsidiansecurity.com/blog/litellm-privilege-escalation-rce>
- **X41 D-Sec（一次・独立報告）**: “X41-2026-001 LiteLLM”（ガードレール `/guardrails/test_custom_code` のサンドボックス脱出、2026-04-08 公表・当時 CVE 未採番）— <https://www.x41-dsec.de/lab/advisories/x41-2026-001-litellm/>
- **NVD**: CVE-2026-40217（ガードレールのサンドボックス脱出）— <https://nvd.nist.gov/vuln/detail/CVE-2026-40217>
- **The Hacker News**: “LiteLLM Vulnerability Chain Lets Low-Privilege Users Take Over AI Gateway Servers”（2026-06）— <https://thehackernews.com/2026/06/litellm-vulnerability-chain-lets-low.html>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
