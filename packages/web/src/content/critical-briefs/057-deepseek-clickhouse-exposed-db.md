---
brief_no: 57
title: "DeepSeek：認証のないデータベースが公開され、ログとチャット履歴が誰でも読める状態だった(Wiz Research)"
title_en: "DeepSeek: An unauthenticated database was exposed, and logs and chat history were readable by anyone (Wiz Research)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass", "data-provenance"]
incident_date: 2025-01-29
published: 2026-06-15
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["056-mchire-paradox-recruiting-auth", "013-coinbase-kyc-insider-breach", "036-commonpool-training-data-pii", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "認証なしの AI バックエンド、到達＝全取得 — DeepSeek / ClickHouse"
og_lead_en: "No auth on the AI backend — reachable meant readable — DeepSeek"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー事例 · 認証のない公開"
og_kicker_en: "CYBER INCIDENT · NO AUTHENTICATION"
og_headline_ja: "認証のないデータベースが、\n公開されていた。\n<accent>ログとチャット履歴が誰でも読める状態</accent>"
og_headline_en: "An unauthenticated database\nwas exposed to the internet.\n<accent>Logs and chat history were readable by anyone.</accent>"
key_figures:
  - value: "100"
    unit: "万行超"
    label: "公開されていたログと、平文のチャット履歴、API キー、秘密トークンなどが露出した（Wiz Research）"
    tone: "alert"
  - value: "8123 / 9000"
    label: "認証なしで到達でき、任意の SQL を実行できた公開ポート（BleepingComputer）"
  - value: "約 30 分"
    label: "Wiz Research の責任ある開示から、DeepSeek が露出を是正するまで"
glossary:
  - term: "ClickHouse"
    desc: "大量のログなどを集めて検索するためのデータベース。今回は、認証なしで外部から SQL を実行できる状態になっていた。"
  - term: "責任ある開示"
    desc: "見つけた弱点を公にする前に、当事者へ先に知らせ、直す時間を渡すやり方。"
insight:
  slug: "reach-is-read"
  label: "到達がそのまま読み取りになる"
  quote: "認証のない基盤では、到達した主体が正当かを見分ける手段が無く、ネットワークに届くことがそのまま読み取りの権限になる。"
industries: ["ai"]
operations: ["data-access"]
controls:
  - slug: "verify-entry"
    item: "データ基盤への到達と、データを読む認可を分け、認証なしの到達を通さない"
impact: "100 万行超のログと平文のチャット履歴が露出"
takeaway: "データ基盤が認証なしで公開され、到達できればそのまま読めた。データを読む前に、主体の認証と権限を、基盤の入口で照合する。"
self_check: "データ基盤は、ネットワークに届くだけで読める状態になっていないか。読む前に、主体の権限を照合しているか。"
countries: ["cn"]
---

## 1. 要点

データ基盤が認証なしでインターネットに公開されると、届くことがそのまま読めることになる。外部からの監視と責任ある開示は、露出が成立した後に働き、約 30 分で是正された。<strong>認証のない基盤では、到達した主体が正当かを見分ける手段が無く、ネットワークに届くことが、そのまま読み取りの権限になる。</strong>

## 2. 通った操作

- **通った操作**: 認証なしの接続による、データベースへの問い合わせ。公開ポート（8123 の HTTP と 9000）から、任意の SQL が実行できた（BleepingComputer）。
- **受け付けた側に届くもの**: 一般に、認証のない基盤は、届いた問い合わせを、誰が送ったかを区別せずに実行する。ネットワークに届いたことと、データを読む権限があることは、基盤の側からは区別がつかない。
- **見つかったもの**: 100 万行超のログ（`log_stream` テーブル）、平文のユーザーのチャット履歴、API キー、秘密のアクセストークン、バックエンドの運用情報（Wiz Research）。
- **公表されていないこと**: 第三者による不正取得の有無（本 Brief は断定しない）。露出した API キー・トークンが、他のシステムで使われたか。

## 3. 何を照合するか

経路を問わず区別できる条件は、データ基盤が、問い合わせを受け付ける前に、その主体がこの範囲のデータを読む権限を持つかを、ネットワークに届いたかどうかとは別に照合することである。

- **誰が承認を出すか**: データの持ち主（組織）。どの主体が、どの範囲を読めるかを、あらかじめ決めておく。
- **どこで照合するか**: データ基盤の入口。外部からの接続でも、内部からの接続でも、読む手前の一か所で照合する。権限と一致しない問い合わせは、実行しない。
- **何が残るか**: どの主体が、どの権限で、どの範囲を読んだかの記録。読んだ後に、その読み取りが正当だったかを辿れる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝データを読む前に、主体がその範囲の権限を持つかを照合し、記録に残すこと。検知＝露出が成立した後に見つけること。下の日付は、公表に基づく経過である。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>読む前に、主体の権限を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>認証なしで 100 万行超のログと<br>平文のチャット履歴に届いた</span></div>
<div class="rx-zone det"><b>検知 · 露出の後に働いた</b>Wiz Research が見つけ、DeepSeek に開示する</div>
<div class="rx-g g1"><div class="t">01-06 以降</div><b>ログが蓄積されている</b></div>
<div class="rx-g g2"><div class="t">2025-01</div><b>2 つのインスタンスが見つかる</b></div>
<div class="rx-g g3"><div class="t">01-29</div><b>責任ある開示</b></div>
<div class="rx-g g4"><div class="t">約 30 分後</div><b>DeepSeek が露出を是正</b></div>
</div>
</figure>

外部からの監視と開示は、露出を見つけて是正を促したが、露出が成立した後に働いた。同じように、権限の照合が無いまま読み取りに至った事案に、[McHire](https://lemma.frame00.com/ja/critical/briefs/056-mchire-paradox-recruiting-auth/)（推測できる資格情報）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、データ基盤を読む入口に組み込む。** 侵入や露出を見つけるのではなく、読む主体がこの範囲の権限を持つかを、読む前に照合する。

### 注意したい業界・業務

- **業界 · AI**: チャット履歴やログなど、機微なデータを基盤に集める AI サービス。急成長する中で、基盤の到達制御と認可が分けられないまま公開される場合がある。
- **業務 · データ基盤の公開・運用**: ログや履歴を集める基盤の公開範囲、接続の認証、API キー・トークンの保管。

### いまの対策と Lemma の違い

今回の経路は、1 列目（認証なしの接続でデータを読む）である。2 列目は、露出した API キー・トークンを使った他のシステムへの移動で、今回そうだったかは公表されていない。

| 対策 | 認証なしの接続でデータを読む | 露出した API キー・トークンでの他のシステムへの移動 |
| --- | --- | --- |
| 外部からの継続的な露出の監視と、責任ある開示 | 一部 | 関係しない |
| 基盤そのものの認証と、権限の検証 | 効く | 関係しない |
| API キー・トークンの管理と入れ替え | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 |

外部からの監視と開示は、露出を見つけて是正を促したが、露出が成立した後に働く。基盤そのものの認証と権限の検証は、この事案で欠けていた層で、働いていれば、到達した主体を区別できる。API キー・トークンの管理と入れ替えは、露出した後の二次的な被害を減らす。Lemma は、データを読む前に、主体の権限を、基盤の外で照合する。鍵そのものを送らず、権限の照合を通ったことだけを示す設計にすれば、鍵を平文で持たずに済む。

注：Lemma の照合が働くのは、データ基盤への問い合わせを受け付ける手前に照合を組み込み、権限の判断が、基盤とは別に管理されている場合に限る。権限を持つ主体の認証情報が盗まれた場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

データ基盤について、組織で確認する 3 項目

- データ基盤が、ネットワークに届くだけで読める状態になっていないか。
- データを読む主体の権限を、読む前に、基盤の入口で照合しているか。
- API キー・トークンを平文で持たず、露出に備えて入れ替えられるか。

## 5. 事実と時系列

- **対象**: DeepSeek（AI / LLM サービス）のバックエンドのインフラ。
- **発見者**: Wiz Research。外部インフラのセキュリティ評価中に見つけた。
- **露出の起点**: ClickHouse のインスタンスが、認証なしで外部に公開されていた（`oauth2callback.deepseek.com:9000`・`dev.deepseek.com:9000`）。公開ポートは 8123（HTTP）と 9000 で、Web のインターフェースから任意の SQL を認証なしで実行できた。
- **露出した内容**: 100 万行超のログ（`log_stream` テーブル）、平文のユーザーのチャット履歴、API キー、秘密のアクセストークン、バックエンドの運用メタデータ。
- **データの範囲**: 少なくとも 2025-01-06 以降のログが蓄積されていた。

### 時系列

- **2025-01-06**: 露出していたデータベースのログが、この日付以降、蓄積されていた。
- **2025-01**: Wiz Research が、外部インフラの評価中に、2 つの ClickHouse インスタンスを見つける。
- **2025-01-29**: Wiz が DeepSeek に責任ある開示をする。DeepSeek は約 30 分で是正する。

> 固有名は一次（研究機関など）に基づく。本件は研究機関による責任ある開示に基づき、第三者による不正取得の有無を断定するものではない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **発見・是正**: Wiz Research の責任ある開示を受け、DeepSeek は約 30 分で露出を是正した。
- **業界の論点**: 急成長する AI サービスで、チャット履歴という機微なデータの基盤が、認証なしで公開されうるという、運用セキュリティの基本が、改めて論点になった。
- **二次的な被害の可能性**: 露出した API キー・秘密トークンは、他のシステムへの移動や権限の昇格の起点になりうるため、シークレットの管理と入れ替えの重要性が再認識された。
- **規制の文脈**: DeepSeek を巡る各国の規制や利用制限の議論とも重なり、AI サービスのデータ保護とガバナンスへの関心を高めた。

## 6. Sources

- **Wiz Research**: "Wiz Research Uncovers Exposed DeepSeek Database Leaking Sensitive Information, Including Chat History"（一次・発見の原典、2025-01） — <https://www.wiz.io/blog/wiz-research-uncovers-exposed-deepseek-database-leak>
- **BleepingComputer**: "DeepSeek exposes database with over 1 million chat records"（ポート・露出内容・是正） — <https://www.bleepingcomputer.com/news/security/deepseek-exposes-database-with-over-1-million-chat-records/>
- **The Register**: "DeepSeek database left open, exposing sensitive info"（2025-01-30、経緯の整理） — <https://www.theregister.com/2025/01/30/deepseek_database_left_open/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
