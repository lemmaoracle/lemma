---
brief_no: 34
title: "eKYC の顔認証を破る道具が Telegram で売られていた：仮想カメラで録画や合成の映像を差し込み、銀行・取引所のライブネス検査を通す(MIT Technology Review 調査)"
title_en: "Tools to defeat eKYC face checks were on sale on Telegram: a virtual camera slips recorded or synthetic video into bank and exchange liveness checks (MIT Technology Review investigation)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-04-15
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "022-onlyfake-ai-id-kyc-bypass", "013-coinbase-kyc-insider-breach"]
version: "2.1"
status: published
og_lead_ja: "eKYC の顔認証を破る道具が Telegram で販売、仮想カメラで映像を差し替え"
og_lead_en: "eKYC face-check bypass kits sold on Telegram swap in fake camera video"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "本人確認のカメラの映像を、\n録画や合成に差し替える\n道具が売られていた。\n<accent>22 の Telegram チャネルで販売</accent>"
og_headline_en: "Kits that swap the ID-check camera feed for fake video were on sale.\n<accent>22 Telegram channels selling them.</accent>"
key_figures:
  - value: "22"
    unit: "チャネル"
    label: "突破の道具や盗んだ生体データを売る、公開の Telegram チャネル・グループ（中国語・ベトナム語・英語）"
    tone: "alert"
  - value: "約 25"
    unit: "倍"
    label: "仮想カメラを使った攻撃の、2024 年の件数（2023 年比・iProov）"
  - value: "2027-04-01"
    label: "日本で、写真の画像を送る非対面の本人確認（ホ方式など）が廃止される日"
glossary:
  - term: "eKYC"
    desc: "オンラインで行う本人確認。本人確認書類と、その場で撮った顔の映像を照らし合わせる方法が広く使われている。"
  - term: "ライブネス検査"
    desc: "カメラの前にいるのが、写真や録画ではなく、その場にいる本人かを確認する検査。「頭を動かして」などの指示を出すものが多い。"
  - term: "仮想カメラ"
    desc: "本物のカメラの代わりに、用意した動画や画像をカメラの映像としてアプリに渡すソフト。アプリからは本物のカメラと見分けにくい。"
insight:
  slug: "camera-feed-taken-as-live"
  label: "届いた映像をその場の本人と見なす"
  quote: "映像の中身が本人らしく見えても、実在のカメラでその場で撮られたかは、映像の中身からは確認できない。"
industries: ["finance"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "映像が実在のカメラでその場で撮られたものかを、映像とは別に確認する"
  - slug: "hold-unverified"
    item: "映像の出どころを確認できないときは、口座を開かない"
attack_method: "impersonation"
impact: "22 の Telegram チャネル・グループで突破の道具を販売"
takeaway: "映像が実在のカメラでその場で撮られたかを、映像とは別に確認してから、本人の顔として受け入れる。"
self_check: "本人確認の顔の映像が、録画や合成に差し替えられていたら、口座を開く前に気づけるか。"
countries: ["global"]
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直し、題から「欠けている層」の後半を外した。v2.0（2026-10-21）で、MIT Technology Review の記事で事実を取り直し、記事に無かった価格帯と、出典を確認できなかった「不正の 11% がディープフェイク」の数字を削除している。事実と出典は、v2.1 では変えていない。

## 1. 要点

差し替えた映像は、アプリから見れば、正規のカメラの映像と同じ経路で届く。各社は試みを把握しており、合成の痕跡を探す検出も強まっているが、iProov の検証では、root 化していない Android でも、仮想カメラによる差し替えはライブネス検査に気づかれなかった。<strong>映像の中身が本人らしく見えても、実在のカメラでその場で撮られたかは、映像の中身からは確認できない。</strong>

## 2. 通った操作

- **通った操作**: eKYC のライブネス検査への、仮想カメラで差し替えた映像の入力。iProov の検証では、root 化していない Android で、仮想カメラのアプリと顔の差し替えにより、ライブネス検査を通った（2025-12-16・MITRE ATLAS に掲載）。
- **止まった操作**: Binance は、突破の試みを観測し、防いでいると答えた（MIT Technology Review）。BBVA と Revolut は、自社の防御が破られたかへのコメントを控えた。
- **受け付けた側に届くもの**: 一般に、仮想カメラの映像は、アプリからは正規のカメラの映像と同じ経路で届く。映像の中身がどれほど本人らしくても、実在のカメラでその場で撮られたかは、中身からは区別できない。
- **公表されていないこと**: 道具を使った被害の件数や成功率。各社の防御が、実際に破られたかどうか。

## 3. 何を照合するか

経路を問わず区別できる条件は、本人確認の映像を受け付ける側が、その映像が実在のカメラでその場で撮られたかを、映像の中身とは別に、受け付ける前に照合することである。

- **誰が承認を出すか**: 本人確認を行う事業者。端末とアプリが正規のものであることは、端末の側の仕組み（端末の正当性の確認・アテステーションなど）が示し、事業者がそれを受け付ける前に照合する。映像を送る側が自分で名乗る形では出さない。
- **どこで照合するか**: 本人確認の映像を受け付けて判定する手前。端末とアプリが改ざんされていないか、カメラの映像が仮想カメラやフッキングを経ていないかを確認する。確認できなければ、映像がどれほど自然でも、本人確認を通さない。
- **何が残るか**: 映像の出どころを確認した結果と、判定の記録。後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝映像を受け付ける前に、映像が実在のカメラでその場で撮られたかを、映像とは別に照合し、記録に残すこと。検知＝合成の痕跡や不正な取引が表に出た後に気づくこと。下の日付は、各社・各機関が確認・公表した日で、攻撃が起きた日ではない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>受け付ける前に、映像の出どころを映像とは別に照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>映像を差し替える道具が売られていた<br>iProov の検証でライブネス検査を通った</span></div>
<div class="rx-zone det"><b>検知 · 強化中</b>合成の痕跡や取引の異常で気づく</div>
<div class="rx-g g1"><div class="t">2024-11-13</div><b>FinCEN がディープフェイクの詐欺を警告</b></div>
<div class="rx-g g2"><div class="t">2025-02-27</div><b>iProov が仮想カメラの攻撃の増加を報告</b></div>
<div class="rx-g g3"><div class="t">2025-12-16</div><b>iProov の検証が MITRE ATLAS に載る</b></div>
<div class="rx-g g4"><div class="t">2026-04-15</div><b>MIT Technology Review が調査を報じる</b></div>
</div>
</figure>

検知は強まっている。ただ、合成の痕跡を探す検知は、作る技術との追いかけっこで、見分けられなければ通る。同じように、見覚えのある顔と声の録画が送金の指示の根拠になった事案に、[香港ディープフェイク会議詐欺](https://lemma.frame00.com/ja/critical/briefs/084-hong-kong-deepfake-video-call-fraud/)がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、本人確認の映像を受け付ける側に組み込む。** 侵入を見つけるのではなく、映像が実在のカメラでその場で撮られたかを、映像とは別に、受け付ける前に照合する。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 銀行、暗号資産取引所、決済アプリなど、オンラインで口座を開く事業者。開いた口座は、詐欺の受け皿や資金の移動に使われる。
- **業務 · アカウント・権限の管理**: 口座の開設と、新しい端末の登録。どちらも顔の映像が本人の確認として使われる。

### いまの対策と Lemma の違い

今回の経路は 1 列目（仮想カメラによる映像の差し替え）である。2 列目は、端末そのものが攻撃者の手にある場合で、今回そうだったかは公表されていない。

| 対策 | 仮想カメラによる映像の差し替え | 端末そのものが攻撃者の手にある場合 |
| --- | --- | --- |
| 顔の照合（本人確認書類の写真と比べる） | 効かない | 関係しない |
| 動きの指示（頭を動かす、まばたき） | 一部 | 関係しない |
| 合成の痕跡の検出 | 一部 | 関係しない |
| IC チップの読み取り・公的個人認証 | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 効かない |

顔の照合は、盗んだ顔や合成の顔が、書類の写真と一致するように用意されるので効かない。動きの指示は、ただの録画には効くが、合成の映像は指示に応えうる。合成の痕跡の検出は、見分けられれば止まるが、作る技術との追いかけっこになる。IC チップの読み取りと公的個人認証は、顔の映像に頼らずに確認できるが、カードと暗証番号を一緒に奪われれば通る。Lemma は、映像の中身ではなく、映像の出どころを、受け付ける前に照合する。

注：Lemma の照合が働くのは、映像を受け付ける仕組みに照合を組み込み、端末の正当性の確認が、映像を送る側が自分で名乗れない形で出る場合に限る。端末そのものが攻撃者の手にあれば、出どころの確認も破られうる。また確認を厳しくすれば、正規の利用者が途中でやめることも増える。道具を使った被害の件数は公表されておらず、この Brief は市場の存在と、検証で示された手口に基づく。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

オンラインの本人確認について、組織で確認する 3 項目

- 本人確認の映像が仮想カメラから来たとき、それを見分ける仕組みがあるか。
- 2027 年 4 月の制度の変更に向けて、写真の画像を送る方式から移る計画があるか。
- 口座を開いた直後に、短期間の大きな取引など不正の兆候が出たら、本人確認をやり直す手順があるか。

## 5. 事実と時系列

- **調査**: MIT Technology Review が 2026 年初めに 2 か月かけて調べ、4 月 15 日に報じた。中国語・ベトナム語・英語の公開 Telegram チャネル・グループ 22 で、突破の道具と盗んだ生体データの販売を確認した。
- **道具**: 仮想カメラ（カメラの映像を、実在や合成の人物の動画・写真に差し替える）。金融機関のアプリに「フッキング」と呼ぶコードを差し込み、カメラを開くと仮想カメラが動くようにするもの。スマートフォンの脱獄の請け負い。盗んだ生体データと合成映像の組み合わせ。
- **標的**: 大手暗号資産取引所の Binance、スペインの BBVA、英 Revolut が、チャネル上で名指しされていた。
- **各社の反応**: 3 社ともこうした突破を把握しており、業界全体の課題だと述べた。Binance は試みを観測し、防いでいると答えた。BBVA と Revolut は、自社の防御が破られたかへのコメントを控えた。
- **被害**: 道具による被害の件数や成功率は分かっていない。Telegram は記者が示したチャネル・グループを規約違反で削除したが、同様のものは残っている。
- **広がり**: iProov は、仮想カメラを使った攻撃が 2024 年に 2023 年の約 25 倍（2,665% 増）になったと報告している。

### 時系列

- **2024-06-18**: 日本政府が「国民を詐欺から守るための総合対策」を決定。非対面の本人確認をマイナンバーカードの公的個人認証に原則一本化し、運転免許証などの画像を送る方法は廃止するとした。
- **2024-11-13**: 米 FinCEN が、ディープフェイクを使った金融機関への詐欺について警告。ライブの本人確認でサードパーティのウェブカメラのプラグインを使う、などの兆候を挙げた。
- **2025-02-27**: iProov が、仮想カメラを使った攻撃が 2023 年比 2,665% 増えたと報告。
- **2025-06-24**: 犯罪収益移転防止法の施行規則の改正命令を公布。写真の画像を送る非対面の本人確認（ホ方式など）は、2027-04-01 から使えなくなる。
- **2025-10-10**: 香港警察が、紛失した身分証の写真に AI で顔を合成してネットの本人確認を通し、銀行口座を開いていたグループの 22 人を逮捕したと発表。
- **2025-12-16**: iProov の検証が MITRE ATLAS に載る。root 化していない Android で、仮想カメラのアプリと顔の差し替えにより、ライブネス検査を通した。
- **2026-04-15**: MIT Technology Review が、22 の Telegram チャネル・グループの調査を報じる。

> 事実は MIT Technology Review の調査報道と、FinCEN・日本政府・iProov などの公表に拠る。本件は特定の 1 社の事故ではなく、売られている道具の市場の調査である。道具を使った被害の件数や成功率は公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Telegram**: 記者が示したチャネル・グループを、規約違反として削除した。同様のものは残っている。
- **Binance**: 突破の試みを観測し、防いでいると説明した。突破を売るサービスの一部は、それ自体が詐欺だとも述べた。

## 6. Sources

- **MIT Technology Review（一次・独自調査の報道）**: 「Cyberscammers are bypassing banks' security with illicit tools sold on Telegram」（2026-04-15） — <https://www.technologyreview.com/2026/04/15/1135898/cyberscammers-bypassing-bank-telegram/>
- **米財務省 FinCEN（一次・警告）**: 「FinCEN Alert on Fraud Schemes Involving Deepfake Media Targeting Financial Institutions」（2024-11-13） — <https://www.fincen.gov/sites/default/files/shared/FinCEN-Alert-DeepFakes-Alert508FINAL.pdf>
- **犯罪対策閣僚会議（一次・政府の決定）**: 「国民を詐欺から守るための総合対策」（2024-06-18） — <https://www.cas.go.jp/jp/seisakukaigi/hanzai/kettei/240618/honbun.pdf>
- **警察庁 JAFIC（一次・法令）**: 犯罪による収益の移転防止に関する法律施行規則の一部を改正する命令（2025-06-24） — <https://www.npa.go.jp/sosikihanzai/jafic/hourei/250624/anbun02.pdf>
- **iProov（一次・調査主体の自己公表）**: 「iProov Issues Annual Identity Verification Threat Intelligence Report」（2025-02-27） — <https://www.iproov.com/press/annual-identity-verification-threat-intelligence-report>
- **iProov（一次・調査主体の自己公表）**: 「MITRE ATLAS Publishes Critical Vulnerability in the KYC Identity Process Discovered by iProov」（2025-12-16） — <https://www.iproov.com/press/mitre-atlas-publishes-critical-vulnerability-in-the-kyc-identity-process>
- **Biometric Update（報道）**: 「KYC bypass tools sold on Telegram to defeat biometric checks」（2026-04-17） — <https://www.biometricupdate.com/202604/kyc-bypass-tools-sold-on-telegram-to-defeat-biometric-checks>
- **The Standard（報道・香港警察の発表）**: 「Police dismantle AI-driven fraud syndicate, arresting 22」（2025-10-10） — <https://www.thestandard.com.hk/news/article/313790/Police-dismantle-AI-driven-fraud-syndicate-arresting-22>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
