---
brief_no: 86
title: "Sumsub：本人確認事業者のサポート環境に悪意ある添付ファイルから入られ、取引先の利用者の氏名・連絡先が約 18 か月気づかれないまま読める状態にあった(同社発表) — 本人確認のために預かった個人データが、中心の外のどこに残り、誰が読めるかを確かめる層が無い"
title_en: "Sumsub: a malicious attachment let attackers into an identity-verification vendor's support environment, where client end-users' names and contact details sat readable and unnoticed for about 18 months (company disclosure) — No layer checks where data held for identity checks lingers outside the core, and who can read it"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-02-04
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["077-idmerit-kyc-data-exposure", "013-coinbase-kyc-insider-breach", "052-discord-age-verification-id-leak"]
status: "published"
version: "2.0"
og_lead_ja: "Sumsub：本人確認事業者のサポート環境に約 18 か月気づかず侵入、利用者の氏名・連絡先が露出"
og_lead_en: "Sumsub: an 18-month undetected breach of a KYC vendor's support environment exposed users' names and contacts"
layout: "report"
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
  quote: "本人確認の中心は守られていたが、問い合わせ対応の環境に残っていた利用者の氏名と連絡先が、約 18 か月気づかれないまま読める状態にあった。"
industries: ["finance"]
operations: ["data-access"]
controls:
  - slug: "hold-unverified"
    item: "問い合わせ対応で利用者のデータを読む操作は、必要が確かめられるまで通さない"
  - slug: "audit-trail"
    item: "預かった個人データをどこに置き、誰が読めたかを記録する"
attack_method: "supply-chain"
impact: "取引先の利用者の氏名・連絡先が露出（人数は非公表）"
takeaway: "本人確認のために預かった個人データが、中心の外のどこに残り、誰が読めるかを確かめる手順が無かった。"
self_check: "本人確認の委託先が、利用者のどの情報をどこに置いているかを把握しているか。"
countries: ["gb"]
---

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。Sumsub の公表と取引先（Ndax・Bitpanda）の通知で事実を取り直した。旧版の「フランスの利用者の連絡先データ」は、出典が低品質の媒体の見出しだけで本文にも根拠が無かったため削除し、出典からも外した。FinCEN の規則案は本件との関係が薄いため削除した。

## 1. TL;DR

本人確認（KYC）事業者の Sumsub は 2026 年 2 月 4 日、2024 年 7 月に社内のサポート環境へ不正にアクセスされていたと公表した。外部の攻撃者が、問い合わせ管理に使う外部のサービスを通じて悪意ある添付ファイルを送ったのが入口だった。露出したのは主に氏名で、一部はメールアドレスや電話番号を含む。取引先の通知によれば、暗号資産取引所 Ndax と Bitpanda の利用者の情報が含まれていた。

顔の画像や身分証の画像、口座の情報は、本人確認の中心の仕組みとともに守られていた。それでも問い合わせ対応の環境には、利用者の氏名と連絡先が残っていた。

侵入は 2026 年 1 月の社内の点検で遡って見つかったが、それまでの約 18 か月、データは読める状態にあった。効かなかったのは、本人確認のために預かった個人データが中心の外のどこに残り、誰が読めるかを確かめ、要らないものを残さない層である。

## 2. 何が起きたか

- **当事者**: Sumsub（ロンドンを拠点とする本人確認・不正対策の事業者）。暗号資産取引所などの取引先に代わって、利用者の本人確認を行う。
- **入口**: 2024 年 7 月、外部の攻撃者が、問い合わせ管理に使う外部のサービス（名前は非公表）を通じて悪意ある添付ファイルを送り、サポート関連の社内環境に限定的に入った。
- **露出した情報**: 主に氏名。一部の記録はメールアドレスや電話番号を含む。人数は公表されていない（同社は「限られた数の顧客アカウント」とする）。
- **誰の情報か**: Sumsub は明記していないが、取引先の Ndax と Bitpanda は自社の利用者に、氏名・メールアドレス・電話番号が読まれた可能性があると知らせた。
- **露出しなかった情報**: 生体データ、身分証の画像、口座・決済の情報、政府発行の身分証の情報。本人確認の処理、取引先向けの API、中核のシステムにも影響は無かった（同社）。
- **発見**: 2026 年 1 月の社内のセキュリティ点検で、遡って見つかった。2024 年 7 月より後の不正な活動の痕跡は無いという。発見が遅れた要因は調べ続けているとした。
- **対応**: 外部のフォレンジックの専門家を入れ、影響を受けた取引先に担当者から直接知らせた。サポートの担当者のアクセス権を見直し、監視と検知を強めた。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">止めどころは ③。問い合わせ対応に要らない個人データを残さず、誰が何を読めるかを確かめていれば、入られても読めるものは少なかった。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">攻撃者</div><div class="no">1</div><b>問い合わせに、悪意ある添付ファイルを送る</b><p>外部の問い合わせ管理サービスを通じて。</p></div>
<div class="rx-step crit"><div class="who">Sumsub のサポート環境</div><div class="no">2</div><b>添付から、社内のサポート環境に入られる</b><p>本人確認の中核とは別の環境。</p></div>
<div class="rx-step crit"><div class="who">攻撃者</div><div class="no">3</div><b>残っていた利用者の氏名・連絡先が読める状態になる</b><p>2024-07。</p></div>
<div class="rx-step"><div class="who">Sumsub</div><div class="no">4</div><b>約 18 か月後、社内の点検で遡って見つける</b><p>2026-01。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2024-07**: 攻撃者が悪意ある添付ファイルを送り、サポート関連の社内環境に入る。
- **2026-01**: 社内のセキュリティ点検で、遡って見つかる。
- **2026-02-04**: Sumsub が公表。影響を受けた取引先には直接知らせた。
- **2026-02-06**: フランスの暗号資産メディア Cryptoast が、Bitpanda が利用者に送った通知を報じる。
- **2026-02-07**: Ndax が X で利用者に知らせ、フィッシングへの注意を呼びかける。
- **2026-02-09**: Sumsub が X で「10 年の歴史で初めての、この種の事案」と述べる。

> 事実は Sumsub の公表と Ndax の投稿（いずれも一次）、Bitpanda の通知を報じた Cryptoast に拠る。問い合わせ管理サービスの名前、人数、Ndax と Bitpanda 以外の影響先、監督当局への届け出は公表されていない。2026 年 10 月の時点で、公表の内容は更新されていない。

### 公表後の対応

- **Ndax**: 自社のシステムは侵害されておらず、パスワードや身分証、口座の情報は露出していないと説明し、フィッシングへの注意を呼びかけた。
- **Bitpanda**: 利用者に、氏名・メールアドレス・電話番号が影響を受けた可能性があると知らせた（Cryptoast）。

## 4. なぜ止まらなかったか

この事案の失敗は、本人確認の中心の守りの弱さではない。顔や身分証の画像は守られていたが、問い合わせ対応の環境に利用者の氏名と連絡先が残り、そこが約 18 か月、読める状態のまま気づかれなかった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明はデータを置く前と、読ませる前に働き、検出は侵入が表に出た後に働く。その間、中心の外に残ったデータは読める状態のままになる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>預かった個人データが、どこに残り誰が読めるかを確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>約 18 か月、<br>氏名と連絡先は読める状態</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>社内の点検で遡って見つける</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>添付から入られる</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>データが読める状態になる</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>点検で見つかる</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>取引先に知らせる</b></div>
</div>
</figure>

検出は働いた。Sumsub は自社の点検で侵入を見つけ、取引先に知らせている。ただ、見つけたのは約 18 か月後で、「中心の仕組みは守られている」と「預かったデータは要る所にしか無い」は別々の事実なのに、前者しか確かめられていなかった。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[阿波銀行](https://lemma.frame00.com/ja/critical/briefs/142-awa-bank-test-environment-repurposed-leak/)（役目を終えたテスト環境に、消すはずの顧客データが残っていた）にも現れている。

## 5. 対策するには

**本人確認のために預かった個人データは、要る所にだけ置き、どこに残っているかを確かめ続ける。** 問い合わせ対応のように中心の外にある環境には、必要な分しか残さない。委託する側も、委託先がどこに何を置いているかを聞き、漏れたときに何人分のどの情報かを言えるようにしておく。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 暗号資産取引所や決済サービスなど、本人確認を外部の事業者に任せている組織。漏れた連絡先は、利用者を狙うフィッシングに使われうる。
- **業務 · 照会・参照**: サポートの担当者が、問い合わせに応じて利用者の情報を参照する業務。中心の仕組みより守りが薄くなりやすい。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 本人確認の中核の保護 | 一部 | 顔や身分証の画像は守られた。問い合わせ対応の環境に残った氏名と連絡先は、その外にあった。 |
| 委託先の認証・監査（SOC 2、ISO など） | 一部 | 委託先の管理の仕組みは確かめられるが、どの環境にどのデータが残るかまでは示さない。 |
| 侵入の監視 | 一部 | 社内の点検で見つかったが、約 18 か月後だった。 |
| 利用者へのフィッシングの注意喚起 | 一部 | 漏れた後の被害は減らせるが、漏れたことは戻らない。 |

### 必要になるもの

1. **問い合わせ対応に、要らない個人データを置かない。** サポートの担当者が見るのは、問い合わせに応じるのに要る項目だけにし、残す期間を決める。
2. **どこに何が残り、誰が読めるかを確かめる。** 委託先にも、預けたデータを置く環境と、読める人を聞いておく。
3. **何を確かめたかを残す。** データの置き場所と読めた人の記録を、後から第三者に示せる形、つまり証明として残す。漏れたときに、何人分のどの情報かをすぐ言える。

### 点検チェックリスト

本人確認を外部に任せている組織で確かめる 3 項目

- 委託先に渡す利用者の情報を、本人確認に要るものだけに絞っているか。
- 委託先で漏えいが起きたとき、何人分のどの情報かを、委託先からすぐに受け取れる取り決めがあるか。
- 利用者の連絡先が漏れたとき、利用者にフィッシングへの注意を伝える手順があるか。

注：要る所にだけ置いても、その要る所が侵害されれば漏れる。また、残すデータを減らすほど、サポートの担当者が問い合わせに答えにくくなることもある。

## 6. Sources

- **Sumsub（一次・当事者の公表）**: 「Security Incident Update」（2026-02-04） — <https://sumsub.com/newsroom/security-incident-update/>
- **Ndax（一次・取引先の通知、X の投稿）**: Sumsub の事案についての利用者への知らせ（2026-02-07） — <https://x.com/ndaxio/status/2020187936889659691>
- **Sumsub（一次・X の投稿）**: 「10 年の歴史で初めての、この種の事案」とする返信（2026-02-09） — <https://x.com/sumsub/status/2020897419911684165>
- **Cryptoast（報道・Bitpanda の通知を引用）**: 「Bitget, Bybit, MoonPay, Bitpanda : des données personnelles de clients pourraient avoir fuité à cause de ce fournisseur de KYC」（2026-02-06） — <https://cryptoast.fr/bitget-bybit-moonpay-bitpanda-donnees-personnelles-clients-pourraient-avoir-fuite-a-cause-fournisseur-kyc/>
- **Univers Freebox（報道）**: 「Fuite de données : un des principaux tiers de confiance pour vérifier l'identité touché... il s'en rend compte avec un an et demi de retard」（2026-02-10） — <https://www.universfreebox.com/article/591322/fuite-de-donnees-un-des-principaux-tiers-de-confiance-pour-verifier-lidentite-touche-et-sen-rend-compte-avec-un-an-et-demi-de-retard/amp>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
