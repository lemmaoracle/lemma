---
brief_no: 166
title: "LiteLLM：攻撃者のフォークからビルドされた v1.107.0 が、正規の署名つきで配布された"
title_en: "LiteLLM: v1.107.0, built from an attacker's fork, was distributed with a genuine signature"
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
og_lead_ja: "LiteLLM：v1.107.0 が攻撃者のリポジトリでビルドされ、署名つきで配布"
og_lead_en: "LiteLLM: v1.107.0 was built from an attacker repo and shipped signed"
search_title: "LiteLLM v1.107.0 の汚染：経緯と対策"
search_description: "AI ゲートウェイ LiteLLM の v1.107.0 が、攻撃者のフォークからビルドされ、正規の署名と来歴つきで PyPI と Docker Hub に公開された（LiteLLM 公式）。経緯と、取り込む側の対策を整理。"
layout: "report"
sections: "proof"
gate: "intake"
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "正規の署名つきで、\n攻撃者の版が\n配布された。\n<accent>PyPI に約 1 時間 44 分</accent>"
og_headline_en: "Attacker-built release,\ngenuine signature.\n<accent>On PyPI for 1 h 44 min.</accent>"
key_figures:
  - value: "約 4.9"
    unit: "万件"
    label: "v1.107.0 のダウンロード数（Wiz が引用した ClickPy の数値・独立解析）"
    tone: "alert"
  - value: "11:39 → 13:23"
    label: "PyPI での公開から、隔離まで（10-21・UTC）"
  - value: "05-27 → 10-21"
    label: "管理鍵が公開リポジトリに載ってから、悪性の版が公開されるまで（鍵は失効されていなかった）"
insight:
  slug: "signed-but-wrong-source"
  label: "署名は正規、ソースは攻撃者"
  quote: "取り込む前に確かめるべきは、署名の有無ではなく、中身がどのソースから作られたかである。"
industries: ["ai", "developers"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "取り込む版をバージョンとハッシュで固定し、新しい版は照合してから上げる"
  - slug: "ownership-check"
    item: "取り込む成果物が、公式のリポジトリのタグのソースから作られた承認済みの版かを照合する"
  - slug: "audit-trail"
    item: "どの版をどこで動かし、そのホストからどの資格情報に届くかを記録する"
attack_method: "supply-chain"
impact: "正規の名前とタグで、資格情報を盗む悪性の版が PyPI と Docker Hub・GHCR に公開された（ダウンロード約 4.9 万件・独立解析）"
takeaway: "攻撃者のフォークから作られた版にも、正規の署名と来歴が付いていた。署名と来歴は、どのソースから作られたかまでは示さない。"
self_check: "本番で使う OSS のパッケージとイメージを、バージョンとハッシュで固定しているか。"
countries: ["global"]
---

## 1. 要点

AI ゲートウェイ LiteLLM の v1.107.0 が、攻撃者のフォークのソースから LiteLLM 自身のパイプラインでビルドされ、正規の名前とタグで PyPI と Docker Hub・GHCR に公開された。版には正規の鍵の署名と有効な公開の来歴が付いており、外部の指摘を受けて、PyPI は約 1 時間 44 分で隔離した。<strong>署名と来歴は、正規のパイプラインを通ったことを示すが、中身がどのソースから作られたかまでは示さない。</strong>

## 2. 通った操作

- **通った操作**: 正規の名前と標準のタグでの、悪性の版 `litellm==1.107.0` の公開と取り込み。PyPI では 10 月 21 日 11:39 UTC から、13:23 UTC に隔離されるまで公開されていた。
- **受け付けた側に届くもの**: 一般に、取り込む側に見えるのは、名前、バージョン、タグ、署名、来歴である。LiteLLM によれば、v1.107.0 には当時の正規の鍵の有効な署名（cosign）と、有効な Trusted Publishing の来歴が付いていた。
- **公表されていないこと**: 盗まれた情報の実数、攻撃者の特定。

## 3. 何を照合するか

経路を問わず区別できる条件は、取り込む側が、成果物が公式のリポジトリのタグのソースから作られた承認済みの版かを、入れる前に照合することである。

- **誰が承認を出すか**: 配布元（発行者）。公式のタグのソースから作った成果物のハッシュを、リリースのパイプラインとは別の鍵で承認する。取り込む側が、自社で確かめた版を承認する形でもよい。
- **どこで照合するか**: 取り込む側の CI やデプロイの、パッケージやイメージを取得する境界。承認されたハッシュと一致しない成果物は、入れない。
- **何が残るか**: どのホストでどの版が動き、その版がどの承認で入ったかの記録。悪性の版と分かったとき、資格情報を入れ替える範囲を後から決められる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝取り込む前に、成果物が公式のタグのソースから作られた承認済みの版かを照合し、記録に残すこと。検知＝悪性の版が出た後に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>取り込む前に、成果物を承認済みの版と照合する</div>
<div class="rx-zone gapz"><b>その間</b><span>正規の署名と来歴のまま<br>配布先に届いた</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>外部の指摘を受け、隔離して取り下げる</div>
<div class="rx-g g1"><div class="t">10-21 11:39</div><b>PyPI に公開される</b></div>
<div class="rx-g g2"><div class="t">〜13:23</div><b>正規の名前のまま取り込まれうる</b></div>
<div class="rx-g g3"><div class="t">12:06</div><b>外部の研究者が指摘</b></div>
<div class="rx-g g4"><div class="t">13:23</div><b>PyPI が隔離</b></div>
</div>
</figure>

検知が止めたのは公開済みの版で、すでに取り込んだ環境ではない。正規の名前のまま悪性の版が配られる点は、[keyv/cacheable の npm 乗っ取り](https://lemma.frame00.com/ja/critical/briefs/125-keyv-cacheable-npm-account-takeover/)（正規の名前のまま悪性の版が配られた）の件とも共通する論点である。

## 4. Lemma でできること

**Lemma は、03 の照合を、パッケージやイメージを取り込む境界に組み込む。** 侵入を見つけるのではなく、入れようとしている成果物が、承認された版かを確かめる。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: AI ゲートウェイやエージェントの基盤を自社で動かす組織。多くのモデル提供元の API キーやクラウドの資格情報を 1 か所に預けるので、そこで悪性の版が動くと、届く範囲が広い。
- **業界 · 開発者・エージェント運用**: OSS のパッケージやコンテナイメージを、CI やデプロイで自動で取り込むチーム。`latest` のような動くタグは、公開と同時に取り込まれる。
- **業務 · 配信・送付**: 自社でパッケージやイメージを公開する側の、リリースの起動と承認の管理。

### いまの対策と Lemma の違い

| 対策 | フォークのソースからのビルド | 公式のタグそのものの書き換え | 正規の承認者が出した悪性の版 |
| --- | --- | --- | --- |
| イメージの署名の検証（cosign） | 効かない | 効かない | 効かない |
| Trusted Publishing の来歴の確認 | 効かない | 効かない | 効かない |
| 外部からの指摘と隔離 | 一部 | 一部 | 一部 |
| バージョンとハッシュの固定 | 一部 | 一部 | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効かない | 効かない |

署名と来歴は正規のパイプラインを通ったことを、固定は新しい版をすぐには入れないことを確かめる。固定は、版を上げるときには別の確認が要る。Lemma が照合するのは、入れようとしている成果物そのものが、公式のタグのソースから作られた承認済みの版かである。

注：Lemma の照合が働くのは、取り込む境界に照合を組み込み、承認の鍵がリリースのパイプラインとは別にある場合に限る。公式のタグのソースそのものを書き換えられた場合や、正規の承認者の権限ごと奪われた場合は通る。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入や悪性コードを検出・防止するものではない。

### 点検チェックリスト

取り込む OSS と、自社のリリースについて、組織で確認する 3 項目

- 新しい版を上げる前に、中身が公式のリポジトリのタグのソースと一致するかを照合しているか。
- 自社のリリースで、起動するアカウントと承認するアカウントを、別の人と別の端末に分けているか。
- 依存パッケージを動かすホストから、どの資格情報に届くかを一覧にしているか。

## 5. 事実と時系列

- **対象**: `litellm==1.107.0` の PyPI wheel 7 つ。Docker Hub の `v1.107.0`・`latest`・`main-latest`・`main-stable` と、GHCR の同名のタグ（LiteLLM）。
- **成果物の出所**: 公式の GitHub `v1.107.0` タグに悪性ファイルは無い。成果物は、正規の `BerriAI/litellm` に似せたフォーク `Berri-AI/litellm` のソースからビルドされ、LiteLLM のパイプラインで署名されて公開された（LiteLLM）。
- **署名と来歴**: LiteLLM は 3 月の事案の後、固定の公開用の資格情報を Trusted Publishing に置き換え、コンテナイメージに cosign で署名していた。Trusted Publishing は、決まった CI のワークフローからだけ PyPI に公開させる仕組みである。LiteLLM は 10 月 30 日の公表で、v1.107.0 は有効な署名と有効な来歴を持っていたとし、「パイプラインの管理はオーナーが持つので、オーナーになった攻撃者はパイプラインの統制では防げない」と述べている。署名鍵は 10 月 23 日に入れ替えた。
- **中身**: LiteLLM は、資格情報を盗み、リモートコード実行の道具を読み込む、コンパイル済みの悪性コードと説明している。独立解析の Wiz は、AWS・GCP・Azure の認証情報、AI 提供元の API キー、SSH 鍵などが標的で、盗んだデータを LiteLLM に似せたドメインへ送る挙動を報告している。
- **影響範囲**: LiteLLM は、エンタープライズ向けの非公開レジストリ版は影響を受けず、以前の版は安全としている。ダウンロード数は、Wiz が ClickPy の数値として約 49,000 件と記している（独立解析）。Wiz は、窃取の約 4.5 時間後（16:20〜17:01 UTC）から、盗まれた AWS のロールの資格情報が使われたのを観測している（独立解析）。
- **入口**: 5 月 27 日、内部の試験サービス「Agent Platform」の管理鍵を含む設定ファイルが、公開リポジトリにコミットされた。約 3 時間後に削除されたが、履歴は 10 月 22 日まで公開のままで、鍵は失効されなかった。10 月 10 日、この鍵で呼んだ API の応答に、組織オーナーの GitHub CLI のトークンが含まれていた。攻撃者は、そのトークンでリリースのワークフローを書き換え、別のメンテナのトークンで本番の承認を通した（LiteLLM）。

### 時系列

- **2026-05-27**: 管理鍵を含む設定ファイルが公開リポジトリにコミットされる。約 3 時間後に削除。履歴は 10 月 22 日まで公開。
- **2026-10-10**: 鍵で Agent Platform の API が呼ばれ、オーナーのトークンが応答に含まれる。使い捨てのワークフローで CI のシークレットが外へ送られ、実行記録は数分で削除される。12 日にも、非公開の複数のリポジトリで同様に送られる。
- **2026-10-21**: 10:08 UTC、リリースのワークフローの変更がブランチ保護に拒否され、オーナーのトークンで上書きされる。11:11 UTC、別のメンテナのトークンで本番の承認が通る。11:39 UTC から PyPI、11:46 UTC から Docker Hub と GHCR に公開。12:06 UTC、外部の研究者が Issue #47826 で指摘。13:23 UTC までに PyPI が隔離し、14:20 UTC に Docker Hub のタグが削除または差し替えられる。18:20 UTC に最初のインシデント投稿。
- **2026-10-23**: 攻撃の経路の分析を公表。同日、イメージの署名鍵を入れ替える。
- **2026-10-30**: 再発防止策と期日の一覧を公表。インシデント投稿に新しい署名鍵の指紋を載せる。

> 事実は LiteLLM の公式発表（インシデント投稿、10 月 23 日の攻撃の経路の分析、10 月 30 日の再発防止策）と Wiz の独立解析に拠る。LiteLLM は、10 月 21 日の初期の更新に不正確な推定があったとし、10 月 23 日の分析を正典としている。Wiz は PyPI の隔離を 13:20 UTC、Docker Hub からの削除を 13:53 UTC ごろとしており、本稿は LiteLLM の値を採る。Wiz が記す 08:56 UTC からのコミットは攻撃者のフォークへのもので、10:08 UTC の公式のワークフローへの push とは別の出来事である。12:09〜12:24 UTC には、攻撃者がオーナーのトークンでワークフローの変更を差し戻し、見える履歴から消している。公表されていないことは、対策が無かったことを意味しない。11 月 1 日時点で、10 月 30 日より後の続報は出ていない。

### 公表後の対応

- **配布先への案内**: 1.106.2 などの事故前の版に固定する。影響を受けた環境では `cook*` と `sitecustomize*` を削除し、常駐プロセスを止め、環境とイメージを作り直す。1.107.0 が外部と通信できるホストで動いた場合は、データが送られたものとして、そのホストから届いた資格情報（IAM ロール、DB 内の提供元キー、マスターキーなど）をすべて入れ替える。旧い鍵の署名は、v1.107.0 より前のイメージに限って信頼する。
- **LiteLLM 側**: GitHub 組織の全メンバーを外し、内部とベンダーのトークンを失効させた。10 月 30 日に、25 項目の再発防止策を期日つきで公表した。本番の承認を事務所の特定の端末に結びついた専用アカウントだけに持たせること、日常のアカウントをオーナーにしないことは完了済みとしている。公開された wheel とイメージを公式のタグと突き合わせ、不一致なら取り下げる検証を GitHub の外で動かすことは、12 月 31 日までの予定としている。

## 6. Sources

- **LiteLLM（一次・企業公式）**: 「Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised」（インシデント投稿、2026-10-21、10-23・10-30 更新） — <https://docs.litellm.ai/blog/security-incident-oct-21-2026>
- **LiteLLM（一次・企業公式）**: 「The attack chain behind the v1.107.0 LiteLLM release」（攻撃の経路の分析、2026-10-23） — <https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain>
- **LiteLLM（一次・企業公式）**: 「What we are changing after October 21」（再発防止策と期日、2026-10-30） — <https://docs.litellm.ai/blog/security-changes-after-oct-21-2026>
- **GitHub（一次・指摘の Issue）**: BerriAI/litellm Issue #47826（2026-10-21 12:06 UTC） — <https://github.com/BerriAI/litellm/issues/47826>
- **Wiz（独立解析）**: 「LiteLLM Compromised, Steals Credentials」（2026-10-21、10-22 追記） — <https://www.wiz.io/blog/litellm-compromised-steals-credentials>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
