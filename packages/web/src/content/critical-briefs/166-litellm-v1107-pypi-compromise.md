---
brief_no: 166
title: "LiteLLM：正規名で配布された v1.107.0 が、攻撃者の管理するリポジトリでビルドされ、正規の鍵で署名されていた — 署名が、承認されたソースと独立した承認者に結びついているかを、取り込む前に確かめる層は無かった"
title_en: "LiteLLM: v1.107.0, distributed under the official name, was built from an attacker-controlled repository and signed with the genuine key — Nothing let consumers check, before pulling it, that the signature was tied to an approved source and an independent approver"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-21
published: 2026-10-30
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["145-litellm-mcp-oauth2-fallback-empty-auth", "066-litellm-ai-gateway-privilege-escalation", "148-openai-agent-swarm-rubygems-rubydoc-rce", "125-keyv-cacheable-npm-account-takeover"]
status: draft
version: "1.0"
og_lead_ja: "LiteLLM：正規名の v1.107.0 が攻撃者管理のリポジトリでビルドされ、PyPI に約 1 時間 40 分残った"
og_lead_en: "LiteLLM: v1.107.0 under the official name was built from an attacker-controlled repo and stayed on PyPI for about 100 minutes"
industries: ["ai", "developers"]
operations: ["delivery"]
attack_method: "supply-chain"
countries: ["global"]
---

## 1. TL;DR

2026 年 10 月 21 日、AI ゲートウェイ「LiteLLM」の `litellm==1.107.0` が、PyPI（7 つの wheel）と Docker Hub・GHCR に、正規の名前と標準のタグで公開された。LiteLLM の公式発表によれば、GitHub 上の公式 `v1.107.0` タグに悪性ファイルは含まれず、成果物は攻撃者の管理するリポジトリからビルドされていた。LiteLLM は、この版を、資格情報を窃取し、リモートコード実行の道具を読み込む悪性コードを含むものとしている。PyPI での公開は 11:39 UTC から約 1 時間 44 分、Docker Hub は 11:46 UTC から 14:20 UTC までである（いずれも UTC）。

検出は効いた。外部の研究者が 12:06 UTC に Issue で指摘し、13:23 UTC までに PyPI は当該版を隔離した。汚染された版には、正規のパイプラインが付けた正規の鍵の署名が付いていた。<strong>効かなかったのは、署名された成果物が、承認されたソースから、独立した承認者の承認を経て作られたことを、取り込む前に確かめる層である。</strong>

## 2. 何が起きたか

- **対象**: LiteLLM（多数のモデル提供元を 1 つの API で呼び出す OSS のゲートウェイ）。`litellm==1.107.0` の PyPI wheel 7 つ、Docker Hub の `v1.107.0`・`latest`・`main-latest`・`main-stable`、GHCR の同名タグ。
- **成果物の出所**: 公式の GitHub `v1.107.0` タグに悪性ファイルは無い。成果物は攻撃者の管理するリポジトリ（正規の `BerriAI/litellm` に似せた `Berri-AI/litellm`）からビルドされ、正規のパイプラインで署名されて公開された（LiteLLM）。
- **署名**: LiteLLM は 3 月の事案の後、リリースを非公開リポジトリと Trusted Publishers のワークフローに移し、Docker イメージに署名していた。汚染された v1.107.0 のイメージにも、当時の鍵の有効な署名が付いている。LiteLLM は 10 月 23 日に署名鍵を入れ替え、旧い鍵の署名は 10 月 21 日の v1.107.0 より前のイメージに限って信頼するよう案内している。
- **内容**: LiteLLM は、資格情報を窃取し、リモートコード実行の道具を読み込むコンパイル済みの悪性コードと説明している。独立解析の Wiz は、AWS・GCP・Azure の認証情報、AI 提供元の API キー、SSH 鍵などが標的で、窃取データが LiteLLM に似せたドメインへ送られる挙動を報告している。
- **影響範囲**: 公式発表は、エンタープライズ向けの非公開レジストリ版は影響を受けないとし、以前の版は安全としている。ダウンロード数は、Wiz が ClickPy の数値として約 49,000 件と記している（独立解析による数値）。窃取された内容の実数は公表されていない。

攻撃は次の連鎖で成立している。

1. 2026 年 5 月 27 日、内部の試験サービス「Agent Platform」の管理鍵を含む設定ファイルが、公開リポジトリにコミットされた。約 3 時間後に削除されたが、履歴は 10 月 22 日まで公開のままで、鍵は失効されなかった（LiteLLM はこれを人為ミスとしている）。
2. 10 月 10 日、この鍵で Agent Platform の API が呼ばれ、応答に組織オーナーの GitHub CLI の OAuth トークンが含まれていた。
3. 10 月 10 日と 12 日、使い捨てのワークフローで、CI のシークレット（別のメンテナ 2 人のトークンを含む）が外部へ送られた。10 日の実行記録は数分で削除された。
4. 10 月 21 日 10:08 UTC、リリースのワークフローを変更する push が分岐保護に拒否されたが、オーナーのトークンで保護を上書きして成立した。ワークフローは、ビルド元として別のフォークを受け付けるようになった。
5. 10:46 UTC、似せたフォークからステージングが実行された。11:11 UTC、別のメンテナのトークンが本番の承認ゲートを通過し、パイプラインはフォークのコミットからビルドした v1.107.0 に署名して公開した。
6. 11:39〜11:40 UTC に PyPI へ 7 つの wheel、11:46 UTC に Docker Hub と GHCR へイメージが公開された。11:53〜11:54 UTC、第三のメンテナのトークンで実行記録が削除された。

この連鎖で取り返しがつかなくなった実行は、4 から 6 である。保護も承認も、人の資格情報を持つ者として通過され、配布先から見える成果物は、正規の名前とタグのままだった。

## 3. 時系列 — 公表と対応

- **2026-05-27**: 管理鍵を含む設定ファイルが公開リポジトリにコミットされる。約 3 時間後に削除。履歴は 10-22 まで公開。
- **2026-10-10**: 鍵で Agent Platform の API が呼ばれ、オーナーのトークンが応答に含まれる。CI のシークレットが外部へ送られる。
- **2026-10-12**: 非公開の複数リポジトリで、同様にシークレットが送られる。
- **2026-10-21 10:08 UTC**: 分岐保護が拒否し、オーナーのトークンで上書きされる。
- **2026-10-21 11:11 UTC**: 本番の承認ゲートが、別メンテナのトークンで通過する。
- **2026-10-21 11:39〜11:46 UTC**: PyPI の wheel 7 つ、Docker Hub と GHCR のイメージが公開される。
- **2026-10-21 12:06 UTC**: 外部の研究者が Issue #47826 で指摘する。
- **2026-10-21 12:09〜12:24 UTC**: 攻撃者がオーナーのトークンで、ワークフローの変更を差し戻し、強制 push で見える履歴から消す。
- **2026-10-21 13:02 UTC**: LiteLLM が対応を開始。13:23 UTC までに PyPI が隔離。13:51 UTC に GHCR のタグが利用不能。14:19〜14:20 UTC にリリースワークフローの権限が全て外され、Docker Hub のタグが削除または差し替えられる。
- **2026-10-21 18:20 UTC**: 初回のインシデント投稿。20:30 UTC に更新。
- **2026-10-23 21:00 UTC**: 攻撃の経路の分析を公表。同日、Docker イメージの署名鍵を入れ替え。
- **2026-10-30**: インシデント投稿を更新し、新しい署名鍵の指紋を掲載。

> 本件の事実は、LiteLLM の公式発表（インシデント投稿と 10-23 公表の攻撃経路の分析）と、Wiz の独立解析に拠る。LiteLLM は、10-21 の初期の更新に不正確または不完全な推定があったと自ら述べており、10-23 の分析を正典としている。10-21 の更新は、最初のトークンの出所を内部デプロイのログと推定していたが、分析では Agent Platform の API 応答と訂正されている。「攻撃者が監査ログを目立たせないために別々のトークンを使った」、および「アクセスされうるトークンを全て特定した」ことは、LiteLLM の推定または認識であり、確認された事実ではない。Wiz は PyPI の隔離を 13:20 UTC、Docker Hub からの削除を 13:53 UTC ごろとしており、LiteLLM の 13:23 UTC、14:20 UTC と異なる。本稿は LiteLLM の値を採る。Wiz が記す 08:56 UTC からのコミットは攻撃者のフォークへのもので、10:08 UTC の公式のリリース用ワークフローへの push とは別の出来事である。「公開の約 27 分後」は時系列の値（11:39:51 と 12:06:41）から計算したもので、LiteLLM の謝辞は「公開から 20 分以内」と書いている。

公表後の対応と業界の動きは次のとおり。

- **配布先への案内**: 1.106.2 などの事故前の版に固定する。影響を受けた環境では、`cook*` と `sitecustomize*` を削除し、常駐プロセスを止める。環境とイメージは作り直しを推奨。1.107.0 が外部通信できるホストで動いた場合は、データが送られたものとして、到達できた認証情報（IAM ロール、DB 内の提供元キー、マスターキーなど）を入れ替える。
- **LiteLLM 側**: 内部システムとベンダーの全トークンの失効を進め、GitHub 組織の全メンバーを外した。Docker イメージの署名鍵を入れ替えた。プロセス改善は 10 月 23 日に「来週」公表するとしていたが、10 月 31 日の時点で公表されていない。

## 4. なぜ止まらなかったか

この事案の失敗は、「誰も気づかなかった」ことでも、「1 つの鍵の管理漏れ」だけでもない。配布先が、取り込む成果物の出所を、取り込む前に独立に確かめる層が無かったことにある。

**検出と証明の落差**は、ここにある。検出は効いていた。外部の研究者は公開の約 27 分後に指摘し、PyPI は約 1 時間 44 分で隔離した。しかし効かなかったのは、その手前である。分岐保護は拒否したが、オーナーの資格情報で上書きされた。本番の承認ゲートは、別のメンテナの資格情報で通過した。実行記録は削除された。配布先から見えるのは、正規の名前、標準のタグ、正規の鍵の署名である。署名は、正規のパイプラインを通ったことを示すが、そのパイプラインがどのリポジトリからビルドしたか、承認したのが起動した者と独立した主体かは示さない。

LiteLLM の分析によれば、攻撃者は直近で緩められていた「2 人のエンジニアでリリースを起動・承認できる」ルールに沿って、別々のトークンで起動と承認を通した。ただし LiteLLM は、オーナーのトークンがあれば、このルール自体を攻撃者が緩められたとも述べている。承認が成立したことと、承認者が独立した別の主体であることは、別々の事実である。

同じ構造は、これまでの Brief にも現れている。[LiteLLM の MCP 認証の失敗時の挙動](https://lemma.frame00.com/ja/critical/briefs/145-litellm-mcp-oauth2-fallback-empty-auth/)と[権限昇格の連鎖](https://lemma.frame00.com/ja/critical/briefs/066-litellm-ai-gateway-privilege-escalation/)は、同じ製品の別の事案である。[keyv/cacheable の npm 乗っ取り](https://lemma.frame00.com/ja/critical/briefs/125-keyv-cacheable-npm-account-takeover/)と[RubyGems の悪性パッケージ](https://lemma.frame00.com/ja/critical/briefs/148-openai-agent-swarm-rubygems-rubydoc-rce/)でも、正規の名前で配布された成果物の出所を、取り込む側が確かめる手段は示されていない。

> 「正規の鍵で署名された」と「承認されたソースから、独立した承認を経て作られた」は、別々の事実である。前者は配布先から見え、後者は取り込む前に確かめなければ見えない。

## 5. 証明があれば、何が変わるか

この事案で、配布先が成果物を取り込む直前に一段挟まるとすれば、「この成果物が、承認されたソースと承認されたパイプラインから作られた」ことの確認である。Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">

- **ビルド来歴の証明**：成果物ごとに、ソースのリポジトリ、コミット、ビルドのワークフロー、ビルド元を、発行元名義の証明として登録し、取り込む側が実行の前に照合する。登録された来歴と照合すれば、似た名前のフォークからのビルドは不一致になる（来歴の登録そのものを書き換えられる権限が奪われた場合は、下の注記のとおり通ってしまう）。
- **承認の独立性の証明**：本番の承認を、ビルドを起動した主体とは別の、登録された承認者の署名として扱い、同じ資格情報で起動と承認が通らないようにする。
- **改変できない記録**：どの証明に基づいて、どの成果物が取り込まれたかを、配布元の実行記録とは別の記録として残し、配布元の側で削除できないようにする。

</ul>

> 注記: 証明が示すのは、成果物が登録された来歴と承認に一致することまでである。登録された承認者の資格情報そのものが奪われた場合や、来歴の登録先が侵害された場合は、通ってしまう。悪性コードの内容の判定は、証明の対象に含まれない。

事後の検出、隔離、鍵の入れ替えとの違いはここにある。検出の層と、この層は代替ではなく補完の関係にある。前者は悪性の版に気づいて取り下げ、後者は出所の確認できない成果物を、取り込みの前に止められるようにする。

## 6. Sources

- **LiteLLM（一次・企業公式）**: "Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised"（インシデント投稿、2026-10-21 公開、10-23・10-30 更新） — <https://docs.litellm.ai/blog/security-incident-oct-21-2026>
- **LiteLLM（一次・企業公式）**: "The attack chain behind the v1.107.0 LiteLLM release"（攻撃の経路の分析、2026-10-23） — <https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain>
- **GitHub（一次・指摘の Issue）**: BerriAI/litellm Issue #47826（2026-10-21 12:06 UTC） — <https://github.com/BerriAI/litellm/issues/47826>
- **Wiz（独立解析）**: "LiteLLM Compromised, Steals Credentials"（2026-10-21、10-22 追記） — <https://www.wiz.io/blog/litellm-compromised-steals-credentials>

LiteLLM は調査を続けており、トークンの特定範囲とプロセス改善は続報で変わりうる。Wiz のダウンロード数は ClickPy の数値の引用であり、LiteLLM の公式発表には無い。窃取された情報の実数と、攻撃者の特定は、公表されていない。日本の報道・ブログは出典に含めていない。

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[Pillar 01 — 検証可能な出所](https://lemma.frame00.com/ja/pillars/#provenance)
