---
brief_no: 166
title: "LiteLLM：正規名で配布された v1.107.0 が、攻撃者の管理するリポジトリでビルドされ、正規の鍵で署名されていた — 成果物が公式のソースと一致するかを、取り込む前に照合する層は無かった"
title_en: "LiteLLM: v1.107.0, distributed under the official name, was built from an attacker-controlled repository and signed with the genuine key — Nothing checked, before it was pulled, that the artifact matched the official source"
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
og_kicker_ja: "サイバー攻撃事例 · サプライチェーン"
og_kicker_en: "CYBERATTACK · SUPPLY CHAIN"
og_headline_ja: "正規の署名つきで、\n攻撃者の版が\n配布された。\n<accent>PyPI に約 1 時間 44 分</accent>"
og_headline_en: "Attacker-built release,\ngenuine signature.\n<accent>On PyPI for 1 h 44 min.</accent>"
summary_labels: ["何が起きたか", "なぜ見分けられないか", "欠けていた層"]
key_figures:
  - value: "約 4.9"
    unit: "万件"
    label: "v1.107.0 のダウンロード数（Wiz が引用した ClickPy の数値・独立解析）"
    tone: "alert"
  - value: "11:39 → 13:23"
    label: "PyPI での公開から、隔離まで（10-21・UTC）"
  - value: "05-27 → 10-21"
    label: "管理鍵が公開リポジトリに載ってから、悪性の版が公開されるまで（鍵は失効されていなかった）"
glossary:
  - term: "LiteLLM"
    desc: "多数の AI モデルの提供元を、1 つの API で呼び出すための OSS のゲートウェイ。各提供元の API キーを 1 か所に預けて使うことが多い。"
  - term: "署名（cosign）"
    desc: "コンテナイメージに付ける電子署名。そのイメージが、鍵を持つ者のパイプラインから出たことを示す。どのソースからビルドしたかは示さない。"
  - term: "Trusted Publishing"
    desc: "PyPI に、決まった CI のワークフローからだけパッケージを公開させる仕組み。固定のパスワードやトークンを使わずに済み、公開の来歴が残る。"
insight:
  slug: "signed-but-wrong-source"
  label: "署名は正規、ソースは攻撃者"
  quote: "攻撃者のフォークから作られた版にも、正規の鍵の署名と、有効な公開の来歴が付いていた。署名が示したのは、正規のパイプラインを通ったことまでだった。"
industries: ["ai", "developers"]
operations: ["delivery"]
controls:
  - slug: "hold-unverified"
    item: "取り込む版をバージョンとハッシュで固定し、新しい版は確認してから上げる"
  - slug: "ownership-check"
    item: "取り込む成果物の中身を、公式のリポジトリのタグと突き合わせる"
  - slug: "audit-trail"
    item: "どの版をどこで動かし、そのホストからどの資格情報に届くかを記録する"
attack_method: "supply-chain"
impact: "正規の名前とタグで、資格情報を盗む悪性の版が PyPI と Docker Hub・GHCR に公開された（ダウンロード約 4.9 万件・独立解析）"
takeaway: "攻撃者のフォークから作られた版にも、正規の署名と来歴が付いていた。成果物が公式のソースと一致するかを、取り込む前に照合する層は無かった。"
self_check: "取り込む OSS の成果物が、公式のリポジトリのソースと一致するかを照合しているか。"
countries: ["global"]
---

## 1. TL;DR

2026 年 10 月 21 日、AI ゲートウェイ「LiteLLM」の `litellm==1.107.0` が、PyPI（7 つの wheel）と Docker Hub・GHCR に、正規の名前と標準のタグで公開された。LiteLLM の公式発表によれば、GitHub 上の公式 `v1.107.0` タグに悪性ファイルは含まれず、成果物は攻撃者の管理するフォークのソースから、LiteLLM 自身のパイプラインでビルドされていた。中身は、資格情報を盗み、リモートコード実行の道具を読み込む悪性コードである。

攻撃者は、5 月に公開リポジトリに載ったまま失効されていなかった管理鍵から、組織オーナーの GitHub のトークンを得ていた。そのトークンでリリースのワークフローを書き換え、別のメンテナのトークンで本番の承認を通した。できた版には、正規の鍵の署名と、有効な公開の来歴が付いていた。

外部の研究者は公開の約 27 分後に指摘し、PyPI は約 1 時間 44 分で版を隔離した。ただ、それまでの間、署名も来歴も正規の版は、そのまま配布先に届いた。効かなかったのは、成果物が公式のソースと一致するかを、取り込む前に照合する層である。

## 2. 何が起きたか

- **対象**: `litellm==1.107.0` の PyPI wheel 7 つ。Docker Hub の `v1.107.0`・`latest`・`main-latest`・`main-stable` と、GHCR の同名のタグ（LiteLLM）。
- **成果物の出所**: 公式の GitHub `v1.107.0` タグに悪性ファイルは無い。成果物は、正規の `BerriAI/litellm` に似せたフォーク `Berri-AI/litellm` のソースからビルドされ、LiteLLM のパイプラインで署名されて公開された（LiteLLM）。
- **署名と来歴**: LiteLLM は 3 月の事案の後、固定の公開用の資格情報を Trusted Publishing に置き換え、コンテナイメージに cosign で署名していた。LiteLLM は 10 月 30 日の公表で、v1.107.0 は有効な署名と有効な Trusted Publishing の来歴を持っていたとし、「パイプラインの管理はオーナーが持つので、オーナーになった攻撃者はパイプラインの統制では防げない」と述べている。署名鍵は 10 月 23 日に入れ替えた。
- **中身**: LiteLLM は、資格情報を盗み、リモートコード実行の道具を読み込む、コンパイル済みの悪性コードと説明している。独立解析の Wiz は、AWS・GCP・Azure の認証情報、AI 提供元の API キー、SSH 鍵などが標的で、盗んだデータを LiteLLM に似せたドメインへ送る挙動を報告している。
- **影響範囲**: LiteLLM は、エンタープライズ向けの非公開レジストリ版は影響を受けず、以前の版は安全としている。ダウンロード数は、Wiz が ClickPy の数値として約 49,000 件と記している（独立解析）。Wiz は、窃取の約 4.5 時間後（16:20〜17:01 UTC）から、盗まれた AWS のロールの資格情報が使われたのを観測している（独立解析）。
- **入口**: 5 月 27 日、内部の試験サービス「Agent Platform」の管理鍵を含む設定ファイルが、公開リポジトリにコミットされた。約 3 時間後に削除されたが、履歴は 10 月 22 日まで公開のままで、鍵は失効されなかった。10 月 10 日、この鍵で呼んだ API の応答に、組織オーナーの GitHub CLI のトークンが含まれていた（LiteLLM）。
- **公表されていないこと**: 盗まれた情報の実数、攻撃者の特定。LiteLLM は、到達されうるトークンをすべて特定したとしているが、これは同社の認識である。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">配布先の止めどころは ⑤。取り込む成果物を公式のタグのソースと突き合わせれば、フォークからのビルドは中身が一致しない。① から ④ は、すべて LiteLLM の内側で起きた。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">攻撃者</div><div class="no">1</div><b>公開リポジトリに残った管理鍵を使う</b><p>10-10。応答にオーナーのトークン。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">2</div><b>CI のシークレットを外へ送る</b><p>10-10・10-12。別のメンテナ 2 人のトークンを含む。</p></div>
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">3</div><b>リリースのワークフローをフォークに向ける</b><p>10-21。ブランチ保護をオーナーのトークンで上書き。</p></div>
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">4</div><b>本番の承認を通す</b><p>別のメンテナのトークンで。パイプラインが署名して公開。</p></div>
<div class="rx-step crit"><div class="who">配布先</div><div class="no">5</div><b>正規の名前とタグで取り込む</b><p>署名も来歴も正規のまま。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2026-05-27**: 管理鍵を含む設定ファイルが公開リポジトリにコミットされる。約 3 時間後に削除。履歴は 10 月 22 日まで公開。
- **2026-10-10**: 鍵で Agent Platform の API が呼ばれ、オーナーのトークンが応答に含まれる。使い捨てのワークフローで CI のシークレットが外へ送られ、実行記録は数分で削除される。12 日にも、非公開の複数のリポジトリで同様に送られる。
- **2026-10-21**: 10:08 UTC、リリースのワークフローの変更がブランチ保護に拒否され、オーナーのトークンで上書きされる。11:11 UTC、別のメンテナのトークンで本番の承認が通る。11:39 UTC から PyPI、11:46 UTC から Docker Hub と GHCR に公開。12:06 UTC、外部の研究者が Issue #47826 で指摘。13:23 UTC までに PyPI が隔離し、14:20 UTC に Docker Hub のタグが削除または差し替えられる。18:20 UTC に最初のインシデント投稿。
- **2026-10-23**: 攻撃の経路の分析を公表。同日、イメージの署名鍵を入れ替える。
- **2026-10-30**: 再発防止策と期日の一覧を公表。インシデント投稿に新しい署名鍵の指紋を載せる。

> 事実は LiteLLM の公式発表（インシデント投稿、10 月 23 日の攻撃の経路の分析、10 月 30 日の再発防止策）と Wiz の独立解析に拠る。LiteLLM は、10 月 21 日の初期の更新に不正確な推定があったとし、10 月 23 日の分析を正典としている。Wiz は PyPI の隔離を 13:20 UTC、Docker Hub からの削除を 13:53 UTC ごろとしており、本稿は LiteLLM の値を採る。Wiz が記す 08:56 UTC からのコミットは攻撃者のフォークへのもので、10:08 UTC の公式のワークフローへの push とは別の出来事である。12:09〜12:24 UTC には、攻撃者がオーナーのトークンでワークフローの変更を差し戻し、見える履歴から消している。

### 公表後の対応

- **配布先への案内**: 1.106.2 などの事故前の版に固定する。影響を受けた環境では `cook*` と `sitecustomize*` を削除し、常駐プロセスを止め、環境とイメージを作り直す。1.107.0 が外部と通信できるホストで動いた場合は、データが送られたものとして、そのホストから届いた資格情報（IAM ロール、DB 内の提供元キー、マスターキーなど）をすべて入れ替える。旧い鍵の署名は、v1.107.0 より前のイメージに限って信頼する。
- **LiteLLM 側**: GitHub 組織の全メンバーを外し、内部とベンダーのトークンを失効させた。10 月 30 日に、25 項目の再発防止策を期日つきで公表した。本番の承認を事務所の特定の端末に結びついた専用アカウントだけに持たせること、日常のアカウントをオーナーにしないことは完了済みとしている。公開された wheel とイメージを公式のタグと突き合わせ、不一致なら取り下げる検証を GitHub の外で動かすことは、12 月 31 日までの予定としている。

## 4. なぜ止まらなかったか

この事案の失敗は、1 つの鍵の管理漏れだけではない。**成果物が公式のソースと一致するかを、取り込む前に照合する層**が無く、配布先から見えたのは、正規の名前、標準のタグ、正規の署名と来歴だけだったことにある。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">ここでいう証明は、取り込む前に「この成果物は、公式のリポジトリのこのタグのソースから作られた」ことを照合し、記録に残すこと。検出は、悪性の版が出た後に気づくこと。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回無かった</b>成果物を公式のタグのソースと突き合わせる</div>
<div class="rx-zone gapz"><b>落差</b><span>正規の署名と来歴のまま<br>配布先に届いた</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>外部の指摘を受け、隔離して取り下げる</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>フォークからビルドされる</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>正規の名前で公開される</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>12:06 に指摘される</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>13:23 に隔離</b></div>
</div>
</figure>

検出は働き、PyPI の版は 2 時間足らずで隔離された。ただ、「正規の鍵で署名された」と「公式のソースから作られた」は別々の事実で、署名と来歴が示したのは前者までだった。ブランチ保護も本番の承認も、盗まれた人のトークンで通されており、この隔たりが**検出と証明の落差**である。

同じ構造は、[keyv/cacheable の npm 乗っ取り](https://lemma.frame00.com/ja/critical/briefs/125-keyv-cacheable-npm-account-takeover/)（正規の名前のまま悪性の版が配られた）にも現れている。

## 5. 対策するには

**取り込む OSS の版は固定し、新しい版は、その中身が公式のリポジトリのソースと一致するかを照合してから上げる。** 署名や来歴が正しいことは、正規のパイプラインを通ったことを示すが、そのパイプラインがどのソースを使ったかまでは示さない。照合できない版を取り込まないでおけば、配布元の内側で何が起きても、悪性の版は自社の環境まで届きにくくなる。検出の代わりではなく、検出の手前に置く層である。

### 注意したい業界・業務

- **業界 · AI導入（業種横断）**: AI ゲートウェイやエージェントの基盤を自社で動かす組織。多くのモデル提供元の API キーやクラウドの資格情報を 1 か所に預けるので、そこで悪性の版が動くと、届く範囲が広い。
- **業界 · 開発者・エージェント運用**: OSS のパッケージやコンテナイメージを、CI やデプロイで自動で取り込むチーム。`latest` のような動くタグは、公開と同時に取り込まれる。
- **業務 · 配信・送付**: 自社でパッケージやイメージを公開する側の、リリースの起動と承認の管理。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| イメージの署名の検証（cosign） | 効かない | 汚染されたイメージにも、当時の正規の鍵の有効な署名が付いていた。 |
| Trusted Publishing の来歴の確認 | 効かない | LiteLLM は、v1.107.0 も有効な来歴を持っていたとしている。 |
| 外部からの指摘と隔離 | 一部 | 公開の約 27 分後に指摘され、約 1 時間 44 分で隔離された。その間に取り込んだ環境には届いた。 |
| バージョンとハッシュの固定 | 効く | 事故前の版にハッシュやダイジェストで固定した環境は、1.107.0 を取り込まない。LiteLLM も事故前の版への固定を案内している。 |

### 必要になるもの

1. **版を固定し、新しい版はすぐには上げない。** 本番で使う OSS は、バージョンとハッシュ（イメージはダイジェスト）で固定する。`latest` のような動くタグを、そのまま本番に取り込まない。
2. **取り込む成果物を、公式のソースと突き合わせる。** 新しい版を上げる前に、パッケージやイメージの中身が、公式のリポジトリのタグのソースと一致するかを照合する。署名と来歴の確認は、その手前の確認として続ける。
3. **どの版をどこで動かしたかを残す。** どのホストでどの版が動き、そのホストからどの資格情報に届くかを、後から照合できる形、つまり証明として残す。悪性の版と分かったとき、入れ替える範囲をすぐに決められる。

### 点検チェックリスト

取り込む OSS と、自社のリリースについて、組織で確認する 3 項目

- 本番で使う OSS のパッケージとイメージを、バージョンとハッシュで固定しているか。
- 自社のリリースで、起動するアカウントと承認するアカウントを、別の人と別の端末に分けているか。
- 依存パッケージを動かすホストから、どの資格情報に届くかを一覧にしているか。

注：配布元の側で、ソースのタグそのものを書き換えられた場合は、突き合わせても一致してしまう。今回は公式のタグが改ざんされていなかったので、中身の突き合わせで食い違いが出る形だった。悪性コードがどう動くかの判定は、この照合の対象に含まれない。LiteLLM の調査は続いており、続報で判明したことがあれば、この Brief を改訂する。

## 6. Sources

- **LiteLLM（一次・企業公式）**: 「Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised」（インシデント投稿、2026-10-21、10-23・10-30 更新） — <https://docs.litellm.ai/blog/security-incident-oct-21-2026>
- **LiteLLM（一次・企業公式）**: 「The attack chain behind the v1.107.0 LiteLLM release」（攻撃の経路の分析、2026-10-23） — <https://docs.litellm.ai/blog/security-incident-oct-21-2026-attack-chain>
- **LiteLLM（一次・企業公式）**: 「What we are changing after October 21」（再発防止策と期日、2026-10-30） — <https://docs.litellm.ai/blog/security-changes-after-oct-21-2026>
- **GitHub（一次・指摘の Issue）**: BerriAI/litellm Issue #47826（2026-10-21 12:06 UTC） — <https://github.com/BerriAI/litellm/issues/47826>
- **Wiz（独立解析）**: 「LiteLLM Compromised, Steals Credentials」（2026-10-21、10-22 追記） — <https://www.wiz.io/blog/litellm-compromised-steals-credentials>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
