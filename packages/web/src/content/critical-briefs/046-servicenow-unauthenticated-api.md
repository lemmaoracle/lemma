---
brief_no: 46
title: "ServiceNow：認証を求めない設定の REST エンドポイントから、一部の顧客のインスタンスが照会された(ServiceNow のアドバイザリ)"
title_en: "ServiceNow: a REST endpoint set not to require authentication let some customers' instances be queried (ServiceNow advisory)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-06-09
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["006-google-api-key-revocation-lag", "033-f5-bigip-edge-pivot", "029-github-dev-oauth-token", "013-coinbase-kyc-insider-breach"]
status: published
layout: "report"
sections: "proof"
gate: "identity"
version: "1.0"
og_lead_ja: "ServiceNow：認証を求めない設定の REST エンドポイントから、一部の顧客のインスタンスのテーブルが照会された"
og_lead_en: "ServiceNow: a REST endpoint set not to require authentication let some customers' instance tables be queried"
og_kicker_ja: "セキュリティ事案 · 認証の無い API"
og_kicker_en: "SECURITY INCIDENT · UNAUTHENTICATED API"
og_headline_ja: "認証の無い API で、\n顧客のテーブルが\n照会されたと公表。\n<accent>一部の顧客で照会が成功</accent>"
og_headline_en: "ServiceNow says an\nendpoint with no auth\nlet tables be queried.\n<accent>Some customers affected</accent>"
search_title: "ServiceNow の未認証 API：顧客データ照会の経緯"
search_description: "ServiceNow の REST エンドポイントが認証を求めない設定のまま動き、一部の顧客のインスタンスのテーブルが未認証で照会された（ServiceNow のアドバイザリ）。何が通ったか、何を照合するか、対策を整理。"
key_figures:
  - value: "06-02 → 06-05"
    label: "不審なアクセスが観測されてから、ServiceNow がエンドポイントを認証必須に変えるまで"
    tone: "alert"
  - value: "04-22"
    label: "ServiceNow が、類似の問題を記述した秘匿のバグバウンティの報告を受け取った日"
  - value: "06-09"
    label: "影響を受けた顧客への通知（サポートポータル内のバルティンと個別のサポートケース）"
glossary:
  - term: "Scripted REST リソース"
    desc: "ServiceNow のインスタンスで、REST の API として呼び出せるリソース。`requires_authentication` の設定で、呼び出しに認証を求めるかが決まる。"
  - term: "インスタンス"
    desc: "ServiceNow が顧客ごとにホストする環境。IT サポートのチケット・従業員の記録・資産の一覧・セキュリティインシデントの記録・ワークフローのデータなどを持つ。"
  - term: "バグバウンティ"
    desc: "外部の研究者から不具合の報告を受け付け、報奨金を払う制度。"
insight:
  slug: "auth-left-to-a-setting"
  label: "設定ひとつに任せた認証"
  quote: "要求を受け付けてよいかを設定の値ひとつに任せる仕組みでは、その値が外れたとき、誰からの要求でも同じように処理される。"
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "要求者の認証を確認できるまで、データを返さない"
impact: "一部の顧客で、インスタンスのテーブルへの未認証の照会が成功（ServiceNow の公表）"
takeaway: "認証を求めない設定のまま、エンドポイントは未認証の要求にも応じた。データを返す前に、要求者がその照会を許されているかを照合する。"
self_check: "顧客のデータを返す API で、要求者がその照会を許されているかを、エンドポイントの設定とは別に、返す前に照合できるか。"
countries: ["global"]
---

## 1. 要点

ServiceNow のホスト型インスタンスで、Scripted REST のリソースが、認証を求めない設定（`requires_authentication=false`）のまま出荷されていた。セッション・トークン・資格情報の検査が無いまま要求が受け付けられ、ServiceNow は、一部の顧客でインスタンスのテーブルへの照会が成功した証跡を確認した。ServiceNow は設定を認証必須に変え、観測された活動は研究者・顧客主導の調査に由来する可能性が高いとしている。<strong>要求を受け付けてよいかを設定の値ひとつに任せる仕組みでは、その値が外れたとき、誰からの要求でも同じように処理される。</strong>

## 2. 通った操作

- **通った操作**: 認証を求めない設定の Scripted REST のリソース（`/api/now/related_list_edit/create`）への、セッション・トークン・資格情報の無い要求と、それによる顧客のインスタンスのテーブルへの照会。一部の顧客で照会が成功した（ServiceNow）。
- **受け付けた側に届くもの**: 一般に、認証を求めない設定のエンドポイントでは、要求は誰から届いたものでも同じ形で処理される。要求の一つひとつはプロトコルの上では正常に見え、設定の欠落は外から見ると正常な応答として現れる。
- **照会のあとに起こりうること**: ServiceNow のインスタンスは、IT サポートのチケット・従業員の記録・資産の一覧・セキュリティインシデントの記録・ワークフローのデータに加え、チケットの本文に貼られた API キーや認証情報を持ちうる。参照されたデータによっては、認証情報の二次的な露出につながりうる。これらは想定で、確認された被害ではない。
- **公表されていないこと**: どのデータが参照されたか。活動の主体（ServiceNow は、バグバウンティに関連する研究者・顧客主導の調査に由来する可能性が高く、悪意のある者によるものとは限らないとした）。CVE を発行するか（検討中とされた）。

## 3. 実行前の照合

経路を問わず区別できる条件は、データを返す側が、要求者が誰か、その照会を許されているかを、エンドポイントの設定とは別に、返す前に照合することである。

- **誰が承認を出すか**: インスタンスの管理者など、どの要求者に、どのテーブルの照会を、どの範囲で許すかを決める担当者。許す相手と範囲は、エンドポイントの設定とは別に決めておく。
- **どこで照合するか**: データを返す手前。要求者の認証と、その照会が許された範囲の中かを照合し、照合できない要求には、データを返さない。エンドポイントの設定が外れていても、この照合は残る。
- **何が残るか**: どの要求者が、どの許可で、どのテーブルを照会したかの記録。エンドポイントが応答したという事実とは別に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝データを返す前に、要求者の認証と、その照会が許された範囲の中かを照合し、記録に残すこと。検知＝異常な活動が表に出た後に気づくこと。下の日付は、報告・観測・変更・通知の日で、エンドポイントがこの設定になった日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>データを返す前に、要求者の認証と照会の範囲を照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>認証の無い要求で、<br>一部の顧客のテーブルが照会された</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>異常な活動の検知、ログからの照会の追跡、設定の変更</div>
<div class="rx-g g1"><div class="t">04-22</div><b>類似の問題の報告を受領</b></div>
<div class="rx-g g2"><div class="t">06-02</div><b>不審なアクセスを観測</b></div>
<div class="rx-g g3"><div class="t">06-05</div><b>エンドポイントを認証必須に</b></div>
<div class="rx-g g4"><div class="t">06-09</div><b>影響を受けた顧客に通知</b></div>
</div>
</figure>

異常の検知と設定の変更は、未認証の要求が処理されうる状態が生じた後に働くもので、要求者がその照会を許されているかを、データを返す前に照合する仕組みではない。同じように、認証・認可の状態が信頼の前提にされた事案に、[Google API キーの失効](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)（削除した後もキーが有効だった）と [github.dev の OAuth トークン](https://lemma.frame00.com/ja/critical/briefs/029-github-dev-oauth-token/)（閲覧するリポジトリに範囲を絞られていなかった）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、データを返す側に組み込む。** 弱点や異常な活動を見つけるのではなく、要求者がその照会を許されているかを、エンドポイントの設定とは別に、データを返す前に照合する。

### 注意したい業界・業務

- **業界 · 業種を問わない**: ServiceNow のように、IT サポート・従業員・資産の記録を一か所に集める SaaS を使う組織。チケットの本文に、API キーや認証情報が混じることがある。
- **業務 · 照会・参照**: 顧客のデータを返す API。認証を求めるかをエンドポイントごとの設定に任せると、設定がひとつ外れただけで、要求者の確認ごと無くなる。

### いまの対策と Lemma の違い

今回の事案で確認されたのは 1 列目で、2 列目は認証を通った要求での照会、3 列目は照会されたデータからの二次的な露出である。

| 対策 | 未認証の要求での、テーブルの照会 | 認証済みの要求での、許された範囲を超える照会 | 照会されたチケットに含まれる認証情報の露出 |
| --- | --- | --- | --- |
| エンドポイントの設定を認証必須に変える | 一部 | 関係しない | 関係しない |
| 構成のずれの継続的な検査 | 一部 | 関係しない | 関係しない |
| 異常の検知・ログの追跡（受け付けた後） | 効かない | 効かない | 効かない |
| チケット・ワークフローに認証情報を保存しない運用 | 関係しない | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効く | 関係しない |

設定を認証必須に変えると未認証の要求は受け付けられなくなるが、エンドポイントごとの設定が正しく保たれていることが前提になる。構成のずれの検査は、外れた設定に気づく間隔を縮めるが、気づくまでの要求は処理される。異常の検知とログの追跡は、要求が処理された後になる。チケットに認証情報を置かない運用は、照会された場合の二次的な露出を小さくするが、照会そのものは止めない。Lemma は、データを返す前に、要求者の認証と照会の範囲を照合する。どの要求者が、どの許可で、どのテーブルを照会したかの記録も残る。

注：Lemma の照合が働くのは、データを返す処理の手前に照合を組み込み、許可の記録がエンドポイントの設定とは別に管理されている場合に限る。許す範囲の決め方が緩ければ、緩いまま通る。Lemma は、すでに参照されたデータや、チケットに残った認証情報を消したり入れ替えたりはしない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

顧客のデータを返す SaaS の API について、組織で確認する 3 項目

- 自社のインスタンスで、認証を求めない設定のリソースを一覧にして把握しているか。
- チケットやワークフローの本文に、API キーやパスワードを貼らない運用になっているか。
- どの要求が、誰の許可で、どのテーブルを照会したかの記録を、インスタンスの外で見られるか。

## 5. 事実と時系列

- **対象**: ServiceNow のホスト型の顧客インスタンス（Australia のプラットフォームリリース、または旧いリリースで特定の構成の変更を行った顧客）。
- **確認されたこと**: Scripted REST のリソースが `requires_authentication=false` で出荷され、セッション・トークン・資格情報の検査なしに要求を受け付けた。該当するエンドポイントは `/api/now/related_list_edit/create`。
- **観測された活動**: ServiceNow は本件に関連する「異常な活動」を検知し、一部の顧客でインスタンスのテーブルへの照会が成功した証跡を確認した。活動は 6 月 2〜3 日にさかのぼり、外部の IP `51.159.98.241` が当該のエンドポイントに到達していた。
- **是正**: 2026-06-05、ServiceNow がエンドポイントの構成を変え、アクセスを認証済みの利用者に限った（`requires_authentication` を `true` に）。
- **情報**: インスタンスは、IT サポートのチケット・従業員の記録・資産の一覧・セキュリティインシデントの記録・ワークフローのデータに加え、チケットの本文に貼られた API キーや認証情報を持ちうる。どのデータが参照されたかは開示されていない。
- **開示**: 2026-06-09、ServiceNow がサポートポータル内のバルティン（顧客のログインの内側）と個別のサポートケースで、影響を受けた顧客に通知した。6 月 10 日に Trust ポータルで追加のアドバイザリを公開した。

### 時系列

- **2026-04-22**: ServiceNow が、類似の問題を記述した秘匿のバグバウンティの報告を受け取った。
- **2026-06-02**: 当該のエンドポイントへの不審なアクセスが観測された（6 月 3 日まで・外部の IP `51.159.98.241`）。一部の顧客で、インスタンスのテーブルへの照会の成功が確認された。
- **2026-06-05**: ServiceNow が、エンドポイントの構成を認証必須に変える更新を、ホスト型のインスタンスに適用した。
- **2026-06-09**: 影響を受けた顧客に、サポートのバルティンと個別のケースで通知された。BleepingComputer が報じた。
- **2026-06-10**: ServiceNow が Trust ポータルのアドバイザリを更新した。観測された活動は、バグバウンティに関連する研究者・顧客主導の調査に由来する可能性が高く、悪意のある者によるものとは限らないと表明した。CVE の発行は検討中とした。

> 本件の事実は、ServiceNow の Trust ポータルのアドバイザリと BleepingComputer・SOCRadar の報道に拠る。ServiceNow は CVE の発行を検討中で、活動の主体と参照されたデータの範囲は調査の進み具合によるため、本 Brief では断定しない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **ServiceNow**: 異常な活動の検知の後、6 月 5 日に当該のエンドポイントを認証必須に変える更新を適用した。6 月 9〜10 日に影響を受けた顧客に通知し、Trust ポータルのアドバイザリを更新した。観測された活動はバグバウンティに関連する研究者・顧客主導の調査に由来する可能性が高いと表明し、CVE の発行は検討中とした。
- **開示の論点**: 当初のバルティンが顧客のログインの内側に置かれ、広く見えなかったことと、4 月 22 日のバグバウンティの報告から 6 月 5 日の更新の適用までの期間が、外部から論点として挙げられている。
- **業界の論点**: SaaS の API で、認証・認可をエンドポイントの設定に任せる構成では、設定がひとつ欠けただけで認可の検査そのものが無くなる。設定の状態を認可の根拠とみなさず、要求ごとに範囲を絞った認可と来歴を検証する方向への議論がある。チケットやワークフローに認証情報を保存しない運用と、構成のずれの継続的な検査も、実務の論点に挙げられている。

## 6. Sources

- **ServiceNow Trust（一次）**: セキュリティ通知（2026-06、未認証アクセスに関するアドバイザリ・観測された活動とバグバウンティ報告） — <https://trust.servicenow.com/notifications/1205429e-fea3-4cbf-b37b-8cd3a4e07aef>
- **BleepingComputer**: “ServiceNow discloses security incident exposing customer data”（2026-06-09／6-10 更新、エンドポイント・構成・タイムライン） — <https://www.bleepingcomputer.com/news/security/servicenow-discloses-security-incident-exposing-customer-data/>
- **SOCRadar**: “ServiceNow Breach: Customer Data Exposed Through Unauthenticated API Access”（2026-06、影響範囲・対応） — <https://socradar.io/blog/servicenow-breach-customer-api-access/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
