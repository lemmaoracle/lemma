---
brief_no: 86
title: "Sumsub：本人確認事業者のサポート環境に悪意ある添付ファイルから入られ、取引先の利用者の氏名・連絡先が約 18 か月気づかれないまま読める状態にあった(同社発表)"
title_en: "Sumsub: a malicious attachment let attackers into an identity-verification vendor's support environment, where client end-users' names and contact details sat readable and unnoticed for about 18 months (company disclosure)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-02-04
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: "published"
version: "2.1"
og_lead_ja: "Sumsub：本人確認事業者のサポート環境に約 18 か月気づかず侵入、利用者の氏名・連絡先が露出"
og_lead_en: "Sumsub: an 18-month undetected breach of a KYC vendor's support environment exposed users' names and contacts"
layout: "report"
sections: "proof"
gate: "disclosure"
og_kicker_ja: "サイバー攻撃事例 · 委託先の侵害"
og_kicker_en: "CYBERATTACK · VENDOR BREACH"
og_headline_ja: "本人確認の委託先で、\n利用者の氏名と連絡先が\n読める状態にあった。\n<accent>約 18 か月、気づかれず</accent>"
og_headline_en: "At an ID-check vendor, users' names and contacts sat readable.\n<accent>Unnoticed for about 18 months.</accent>"
key_figures:
  - value: "約 18"
    unit: "か月"
    label: "侵入（2024-07）から、社内の点検で遡って見つかる（2026-01）まで"
    tone: "alert"
  - value: "02-04"
    label: "Sumsub が公表（2026 年）。影響を受けた取引先には、担当者から個別に知らせた"
  - value: "非公表"
    label: "影響を受けた人数。同社は「限られた数の顧客アカウント」とだけ述べている"
glossary:
  - term: "本人確認事業者（KYC ベンダー）"
    desc: "金融機関や暗号資産取引所に代わって、利用者の身分証や顔の確認を行う事業者。利用者の個人データを多く預かる。"
  - term: "サポートチケット"
    desc: "問い合わせ一件ごとの記録。やり取りや添付ファイルとともに、利用者の名前や連絡先が残ることが多い。"
insight:
  slug: "data-lingers-outside-core"
  label: "中心の外に残る個人データ"
  quote: "預かった個人データは、中心の外のどこに残り誰が読めるかを照合していなければ、守っているつもりの外で、読める状態のまま残る。"
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "問い合わせ対応で利用者のデータを読む操作は、必要が確認できるまで通さない"
  - slug: "audit-trail"
    item: "預かった個人データをどこに置き、誰が読めたかを記録する"
attack_method: "supply-chain"
impact: "取引先の利用者の氏名・連絡先が露出（人数は非公表）"
takeaway: "本人確認のために預かった個人データが、中心の外のどこに残り、誰が読めるかを、置く前と読ませる前に照合する。"
self_check: "本人確認の委託先が、利用者のどの情報をどこに置いているかを把握しているか。"
countries: ["gb"]
search_title: "Sumsub の不正アクセス：漏れた情報と経緯・対策"
search_description: "本人確認サービス Sumsub のサポート環境に悪意ある添付ファイルから入られ、取引先の利用者の氏名・連絡先が約18か月気づかれないまま読める状態にあった（同社発表）。何が起きたか、なぜ気づけなかったか、対策を整理。"
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。事実と出典は変えていない。

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。Sumsub の公表と取引先（Ndax・Bitpanda）の通知で事実を取り直した。旧版の「フランスの利用者の連絡先データ」は、出典が低品質の媒体の見出しだけで本文にも根拠が無かったため削除し、出典からも外した。FinCEN の規則案は本件との関係が薄いため削除した。

## 1. 要点

本人確認の中心の仕組みは、守られていた。顔や身分証の画像は露出せず、本人確認の処理も、取引先向けの API も、影響を受けなかった（Sumsub）。それでも、問い合わせ対応の環境には、利用者の氏名と連絡先が残り、その環境が約 18 か月、読める状態のまま気づかれなかった。<strong>預かった個人データは、中心の外のどこに残り誰が読めるかを照合していなければ、守っているつもりの外で、読める状態のまま残る。</strong>

## 2. 通った操作

- **通った操作**: 問い合わせ管理に使う外部のサービスを通じて送られた悪意ある添付ファイルの受け取りと、そこから入った、サポート関連の社内環境に残る利用者データの参照。2024 年 7 月、外部の攻撃者が添付ファイルから、この環境に限定的に入った（Sumsub）。
- **守られたもの**: 生体データ、身分証の画像、口座・決済の情報、政府発行の身分証の情報は露出しなかった。本人確認の処理、取引先向けの API、中核のシステムにも影響は無かった（同社）。
- **受け付けた側に届くもの**: 一般に、問い合わせの添付ファイルは、通常の問い合わせの一部として届く。サポートの担当者が参照できる環境のデータは、中心の仕組みの外にあるため、中心の保護とは別に、何を置き、誰が読めるかが管理されている必要がある。
- **公表されていないこと**: 問い合わせ管理のサービスの名前、影響を受けた人数（同社は「限られた数の顧客アカウント」とする）、Ndax と Bitpanda 以外の影響先、監督当局への届け出、発見が遅れた要因（調査中）。

## 3. 実行前の照合

経路を問わず区別できる条件は、個人データを問い合わせ対応のような中心の外の環境に置く側、読ませる側が、置く項目が要るものか、読む人が必要な範囲の人かを、置く前と読ませる前に、あらかじめ決めた台帳と照合することである。

- **誰が承認を出すか**: 預けた側（取引先）と預かった側が、どの環境に、どの項目を置いてよいか、誰が読めるかを、あらかじめ台帳に決めておく。問い合わせの担当者の申告だけには頼らない。
- **どこで照合するか**: 問い合わせ対応の環境に、データを置く・読む仕組み。台帳に無い項目は置かず、台帳に無い人には読ませない。問い合わせが終われば、残す期間を過ぎたものを消す。
- **何が残るか**: どの環境に、どの項目が、いつまで残り、誰が読めたかの記録。漏えいのとき、何人分のどの情報かをすぐ言えるよう、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝データを置く前と読ませる前に、台帳と照合し、記録に残すこと。検知＝侵入が起きた後に気づくこと。下の 2024-07 と 2026-01 は、Sumsub が公表した侵入と発見の時期で、02-04 以降は公表・通知の日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>置く前と読ませる前に、台帳と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>利用者の氏名・連絡先が<br>約 18 か月、読める状態</span></div>
<div class="rx-zone det"><b>検知 · 約 18 か月後に働いた</b>社内の点検で、遡って見つける</div>
<div class="rx-g g1"><div class="t">2024-07</div><b>添付ファイルから入られる</b></div>
<div class="rx-g g2"><div class="t">2026-01</div><b>社内の点検で見つかる</b></div>
<div class="rx-g g3"><div class="t">02-04</div><b>Sumsub が公表</b></div>
<div class="rx-g g4"><div class="t">02-07</div><b>Ndax が利用者に知らせる</b></div>
</div>
</figure>

検知は働いたが、見つけたのは約 18 か月後だった。同じように、役目を終えたテスト環境に顧客データが残っていた事案に、[阿波銀行](https://lemma.frame00.com/ja/critical/briefs/142-awa-bank-test-environment-repurposed-leak/)がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、問い合わせ対応のような中心の外の環境に、個人データを置く・読ませる側に組み込む。** 侵入を見つけるのではなく、置く項目と読む人が台帳どおりかを、置く前と読ませる前に照合する。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 暗号資産取引所や決済サービスなど、本人確認を外部の事業者に任せている組織。漏れた連絡先は、利用者を狙うフィッシングに使われうる。
- **業務 · 照会・参照**: サポートの担当者が、問い合わせに応じて利用者の情報を参照する業務。中心の仕組みより守りが薄くなりやすい。

### いまの対策と Lemma の違い

今回、入られた経路は 2 列目（悪意ある添付ファイルの受け取り）で、読める状態で残っていたのは 1 列目（問い合わせ対応の環境のデータ）である。3 列目は、漏れた後の利用者へのフィッシングである。

| 対策 | 問い合わせ対応の環境のデータの保持と参照 | 悪意ある添付ファイルの受け取り | 漏れた後の利用者へのフィッシング |
| --- | --- | --- | --- |
| 本人確認の中核の保護 | 一部 | 関係しない | 関係しない |
| 委託先の認証・監査（SOC 2、ISO など） | 一部 | 関係しない | 関係しない |
| 侵入の監視 | 一部 | 一部 | 関係しない |
| 利用者へのフィッシングの注意喚起 | 関係しない | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 効かない | 関係しない |

本人確認の中核の保護は、顔や身分証の画像を守ったが、問い合わせ対応の環境に残った氏名と連絡先は、その外にあった。委託先の認証・監査は、管理の仕組みは確認できるが、どの環境にどのデータが残るかまでは示さない。侵入の監視は、社内の点検で見つかったが、約 18 か月後だった。フィッシングの注意喚起は、漏れた後の被害を減らせるが、漏れたことは戻らない。Lemma は、問い合わせ対応の環境に、置く項目と読む人を、台帳どおりか照合する。

注：Lemma の照合が働くのは、問い合わせ対応の環境のデータを置く・読む仕組みに照合を組み込み、台帳が、サポートの担当者とは別に管理されている場合に限る。台帳に載った人の正規のアカウントが乗っ取られれば、読める範囲のデータは読まれる。要る所にだけ置いても、その要る所が侵害されれば漏れる。また、残すデータを減らすほど、サポートの担当者が問い合わせに答えにくくなることもある。悪意ある添付ファイルからの侵入そのものは、この照合では止まらない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

本人確認を外部に任せている組織で確認する 3 項目

- 委託先に渡す利用者の情報を、本人確認に要るものだけに絞っているか。
- 委託先で漏えいが起きたとき、何人分のどの情報かを、委託先からすぐに受け取れる取り決めがあるか。
- 利用者の連絡先が漏れたとき、利用者にフィッシングへの注意を伝える手順があるか。

## 5. 事実と時系列

- **当事者**: Sumsub（ロンドンを拠点とする本人確認・不正対策の事業者）。暗号資産取引所などの取引先に代わって、利用者の本人確認を行う。
- **露出した情報**: 主に氏名。一部の記録はメールアドレスや電話番号を含む。人数は公表されていない（同社は「限られた数の顧客アカウント」とする）。
- **誰の情報か**: Sumsub は明記していないが、取引先の Ndax と Bitpanda は自社の利用者に、氏名・メールアドレス・電話番号が読まれた可能性があると知らせた。
- **発見**: 2026 年 1 月の社内のセキュリティ点検で、遡って見つかった。2024 年 7 月より後の不正な活動の痕跡は無いという。発見が遅れた要因は調べ続けているとした。
- **対応**: 外部のフォレンジックの専門家を入れ、影響を受けた取引先に担当者から直接知らせた。サポートの担当者のアクセス権を見直し、監視と検知を強めた。

### 時系列

- **2024-07**: 攻撃者が悪意ある添付ファイルを送り、サポート関連の社内環境に入る。
- **2026-01**: 社内のセキュリティ点検で、遡って見つかる。
- **2026-02-04**: Sumsub が公表。影響を受けた取引先には直接知らせた。
- **2026-02-06**: フランスの暗号資産メディア Cryptoast が、Bitpanda が利用者に送った通知を報じる。
- **2026-02-07**: Ndax が X で利用者に知らせ、フィッシングへの注意を呼びかける。
- **2026-02-09**: Sumsub が X で「10 年の歴史で初めての、この種の事案」と述べる。

> 事実は Sumsub の公表と Ndax の投稿（いずれも一次）、Bitpanda の通知を報じた Cryptoast に拠る。問い合わせ管理サービスの名前、人数、Ndax と Bitpanda 以外の影響先、監督当局への届け出は公表されていない。2026 年 10 月の時点で、公表の内容は更新されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Ndax**: 自社のシステムは侵害されておらず、パスワードや身分証、口座の情報は露出していないと説明し、フィッシングへの注意を呼びかけた。
- **Bitpanda**: 利用者に、氏名・メールアドレス・電話番号が影響を受けた可能性があると知らせた（Cryptoast）。

## 6. Sources

- **Sumsub（一次・当事者の公表）**: 「Security Incident Update」（2026-02-04） — <https://sumsub.com/newsroom/security-incident-update/>
- **Ndax（一次・取引先の通知、X の投稿）**: Sumsub の事案についての利用者への知らせ（2026-02-07） — <https://x.com/ndaxio/status/2020187936889659691>
- **Sumsub（一次・X の投稿）**: 「10 年の歴史で初めての、この種の事案」とする返信（2026-02-09） — <https://x.com/sumsub/status/2020897419911684165>
- **Cryptoast（報道・Bitpanda の通知を引用）**: 「Bitget, Bybit, MoonPay, Bitpanda : des données personnelles de clients pourraient avoir fuité à cause de ce fournisseur de KYC」（2026-02-06） — <https://cryptoast.fr/bitget-bybit-moonpay-bitpanda-donnees-personnelles-clients-pourraient-avoir-fuite-a-cause-fournisseur-kyc/>
- **Univers Freebox（報道）**: 「Fuite de données : un des principaux tiers de confiance pour vérifier l'identité touché... il s'en rend compte avec un an et demi de retard」（2026-02-10） — <https://www.universfreebox.com/article/591322/fuite-de-donnees-un-des-principaux-tiers-de-confiance-pour-verifier-lidentite-touche-et-sen-rend-compte-avec-un-an-et-demi-de-retard/amp>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
