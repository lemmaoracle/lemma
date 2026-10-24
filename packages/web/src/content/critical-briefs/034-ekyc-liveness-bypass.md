---
brief_no: 34
title: "eKYC の顔認証を破る道具が Telegram で売られていた：仮想カメラで録画や合成の映像を差し込み、銀行・取引所のライブネス検査を通す(MIT Technology Review 調査) — 届いた映像が、実在のカメラでその場で撮られたかを確かめる層が無い"
title_en: "Tools to defeat eKYC face checks were on sale on Telegram: a virtual camera slips recorded or synthetic video into bank and exchange liveness checks (MIT Technology Review investigation) — No layer checks that the video came from a real camera, live"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-04-15
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["084-hong-kong-deepfake-video-call-fraud", "022-onlyfake-ai-id-kyc-bypass", "013-coinbase-kyc-insider-breach"]
version: "2.0"
status: published
og_lead_ja: "eKYC の顔認証を破る道具が Telegram で販売、仮想カメラで映像を差し替え"
og_lead_en: "eKYC face-check bypass kits sold on Telegram swap in fake camera video"
layout: "report"
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
    desc: "カメラの前にいるのが、写真や録画ではなく、その場にいる本人かを確かめる検査。「頭を動かして」などの指示を出すものが多い。"
  - term: "仮想カメラ"
    desc: "本物のカメラの代わりに、用意した動画や画像をカメラの映像としてアプリに渡すソフト。アプリからは本物のカメラと見分けにくい。"
insight:
  slug: "camera-feed-taken-as-live"
  label: "届いた映像をその場の本人と見なす"
  quote: "アプリに届いた映像が、実在のカメラでその場で撮られたものかを確かめないまま、本人の顔として受け入れられた。"
industries: ["finance"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "映像が実在のカメラでその場で撮られたものか確かめる"
  - slug: "hold-unverified"
    item: "映像の出どころを確かめられないときは、口座を開かない"
attack_method: "impersonation"
impact: "22 の Telegram チャネル・グループで突破の道具を販売"
takeaway: "アプリに届いた映像が、実在のカメラでその場で撮られたものかを確かめる手順が無かった。"
self_check: "本人確認の顔の映像が、録画や合成に差し替えられていたら、口座を開く前に気づけるか。"
countries: ["global"]
---

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。MIT Technology Review の記事で事実を取り直し、記事に無かった価格帯と、出典を確認できなかった「不正の 11% がディープフェイク」の数字を削除した。「root 化した Android」は記事の記述（スマートフォンの脱獄の請け負い）に合わせて改めた。FinCEN の警告、日本の制度の変更、iProov の検証を加えた。

## 1. TL;DR

MIT Technology Review は 2 か月の調査で、銀行や暗号資産取引所のオンライン本人確認（eKYC）の顔のライブネス検査を破る道具と、盗んだ生体データを売る公開の Telegram チャネル・グループを 22 見つけ、2026 年 4 月に報じた。中心は仮想カメラで、端末のカメラの映像を、用意した録画や合成（ディープフェイク）の映像に差し替える。Binance、スペインの BBVA、英 Revolut が標的として名指しされていた。

差し替えた映像は、アプリから見れば正規のカメラの映像と同じ経路で届く。映像の中身がどれほど本人らしくても、それが実在のカメラでその場で撮られたかは、中身からは分からない。

各社は試みを把握しており、合成の痕跡を探す検出も強まっているが、iProov の検証では、root 化していない Android でも仮想カメラによる差し替えはライブネス検査に気づかれなかった。効かなかったのは、届いた映像が実在のカメラでその場で撮られたものかを確かめる層である。

## 2. 何が起きたか

- **調査**: MIT Technology Review が 2026 年初めに 2 か月かけて調べ、4 月 15 日に報じた。中国語・ベトナム語・英語の公開 Telegram チャネル・グループ 22 で、突破の道具と盗んだ生体データの販売を確認した。
- **道具**: 仮想カメラ（カメラの映像を、実在や合成の人物の動画・写真に差し替える）。金融機関のアプリに「フッキング」と呼ぶコードを差し込み、カメラを開くと仮想カメラが動くようにするもの。スマートフォンの脱獄の請け負い。盗んだ生体データと合成映像の組み合わせ。
- **標的**: 大手暗号資産取引所の Binance、スペインの BBVA、英 Revolut が、チャネル上で名指しされていた。
- **各社の反応**: 3 社ともこうした突破を把握しており、業界全体の課題だと述べた。Binance は試みを観測し、防いでいると答えた。BBVA と Revolut は、自社の防御が破られたかへのコメントを控えた。
- **被害**: 道具による被害の件数や成功率は分かっていない。Telegram は記者が示したチャネル・グループを規約違反で削除したが、同様のものは残っている。
- **広がり**: iProov は、仮想カメラを使った攻撃が 2024 年に 2023 年の約 25 倍（2,665% 増）になったと報告している。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">仮想カメラによる差し替えの流れ</span></div>
<p class="rx-ex-cap">販売されている道具の使い方と、iProov の検証で示された流れ。止めどころは ③：届いた映像が実在のカメラから来たかを、映像とは別に確かめる。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">販売者</div><div class="no">1</div><b>仮想カメラや盗んだ生体データを Telegram で売る</b><p>脱獄の請け負いも。</p></div>
<div class="rx-step"><div class="who">攻撃者</div><div class="no">2</div><b>他人の顔の動画や、合成の映像を用意する</b><p>盗んだデータや公開された写真から。</p></div>
<div class="rx-step crit"><div class="who">仮想カメラ</div><div class="no">3</div><b>アプリが開いたカメラの映像を差し替える</b><p>正規のカメラと同じ経路で届く。</p></div>
<div class="rx-step crit"><div class="who">本人確認</div><div class="no">4</div><b>「その場の本人」と判定し、口座を開く</b><p>口座は詐欺の受け皿や資金の移動に使われる。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2024-06-18**: 日本政府が「国民を詐欺から守るための総合対策」を決定。非対面の本人確認をマイナンバーカードの公的個人認証に原則一本化し、運転免許証などの画像を送る方法は廃止するとした。
- **2024-11-13**: 米 FinCEN が、ディープフェイクを使った金融機関への詐欺について警告。ライブの本人確認でサードパーティのウェブカメラのプラグインを使う、などの兆候を挙げた。
- **2025-02-27**: iProov が、仮想カメラを使った攻撃が 2023 年比 2,665% 増えたと報告。
- **2025-06-24**: 犯罪収益移転防止法の施行規則の改正命令を公布。写真の画像を送る非対面の本人確認（ホ方式など）は、2027-04-01 から使えなくなる。
- **2025-10-10**: 香港警察が、紛失した身分証の写真に AI で顔を合成してネットの本人確認を通し、銀行口座を開いていたグループの 22 人を逮捕したと発表。
- **2025-12-16**: iProov の検証が MITRE ATLAS に載る。root 化していない Android で、仮想カメラのアプリと顔の差し替えにより、ライブネス検査を通した。
- **2026-04-15**: MIT Technology Review が、22 の Telegram チャネル・グループの調査を報じる。

> 事実は MIT Technology Review の調査報道と、FinCEN・日本政府・iProov などの公表に拠る。本件は特定の 1 社の事故ではなく、売られている道具の市場の調査である。道具を使った被害の件数や成功率は公表されていない。

### 公表後の対応

- **Telegram**: 記者が示したチャネル・グループを、規約違反として削除した。同様のものは残っている。
- **Binance**: 突破の試みを観測し、防いでいると説明した。突破を売るサービスの一部は、それ自体が詐欺だとも述べた。

## 4. なぜ止まらなかったか

この事案の失敗は、顔の照合の精度でも、ライブネスの指示の種類でもない。アプリに届いた映像を、実在のカメラでその場で撮られたものと見なしたまま、その出どころを確かめていなかった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は口座が開く前に働き、検出は合成の痕跡や不正な取引が表に出た後に働く。その間、届いた映像は「その場の本人」として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>映像が実在のカメラからその場で届いたかを確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>口座は開いた。<br>偽物と分かるのは使われた後</span></div>
<div class="rx-zone det"><b>検出の層 · 強化中</b>合成の痕跡や取引の異常で気づく</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>映像が差し替えられる</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>本人確認が通る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>口座が使われる</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>異常に気づく</b></div>
</div>
</figure>

検出は強まっている。ただ、合成の痕跡を探す検出は作る技術との追いかけっこで、見分けられなければ通る。「映像が本人らしい」と「映像が実在のカメラでその場で撮られた」は別々の事実で、後者は映像の中身からは確かめられない。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[香港ディープフェイク会議詐欺](https://lemma.frame00.com/ja/critical/briefs/084-hong-kong-deepfake-video-call-fraud/)（見覚えのある顔と声の録画が送金の指示の根拠になった）にも現れている。

## 5. 対策するには

**映像の中身ではなく、映像の出どころを確かめる。** 端末とアプリが正規のもので、映像が実在のカメラからその場で届いたことを、映像とは別に確かめる。日本では 2027 年 4 月から、写真の画像を送る非対面の本人確認が使えなくなり、マイナンバーカードの IC チップを読む方法が中心になる。画像の見た目に頼らない方向へ、制度も動いている。

### 注意したい業界・業務

- **業界 · 金融・FinTech**: 銀行、暗号資産取引所、決済アプリなど、オンラインで口座を開く事業者。開いた口座は、詐欺の受け皿や資金の移動に使われる。
- **業務 · アカウント・権限の管理**: 口座の開設と、新しい端末の登録。どちらも顔の映像が本人の確認として使われる。

### いまの対策で防げるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 顔の照合（本人確認書類の写真と比べる） | 効かない | 盗んだ顔や合成の顔は、書類の写真と一致するように用意される。 |
| 動きの指示（頭を動かす、まばたき） | 一部 | ただの録画には効くが、合成の映像は指示に応えうる。 |
| 合成の痕跡の検出 | 一部 | 見分けられれば止まるが、作る技術との追いかけっこになる。 |
| IC チップの読み取り・公的個人認証 | 一部 | 顔の映像に頼らずに確かめられる。カードと暗証番号を一緒に奪われれば通る。 |

### 必要になるもの

1. **映像の出どころを、映像とは別に確かめる。** 端末とアプリが改ざんされていないか、カメラの映像が仮想カメラやフッキングを経ていないかを、端末の正当性の証明（アテステーション）などで確かめる。確かめられなければ、映像がどれほど自然でも本人確認を通さない。
2. **映像に頼らない確認を足す。** 日本では IC チップの読み取りや公的個人認証に寄せる。本人確認の途中で不具合を理由に連絡手段を変えたがる、などの兆候があれば、追加の確認に回す。
3. **何を確かめて通したかを残す。** 映像の出どころを確かめた結果と判定を、後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

オンラインの本人確認について、組織で確かめる 3 項目

- 本人確認の映像が仮想カメラから来たとき、それを見分ける仕組みがあるか。
- 2027 年 4 月の制度の変更に向けて、写真の画像を送る方式から移る計画があるか。
- 口座を開いた直後に、短期間の大きな取引など不正の兆候が出たら、本人確認をやり直す手順があるか。

注：端末そのものが攻撃者の手にあれば、出どころの確認も破られうる。また確認を厳しくすれば、正規の利用者が途中でやめることも増える。道具を使った被害の件数は公表されておらず、この Brief は市場の存在と、検証で示された手口に基づく。

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
