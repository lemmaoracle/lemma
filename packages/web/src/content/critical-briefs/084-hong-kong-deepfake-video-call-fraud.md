---
brief_no: 84
title: "香港ディープフェイク会議詐欺（Arup）：英国本社の CFO と同僚を装った録画のビデオ会議を信じ、財務担当者が約 HK$2 億を 15 回に分けて送金した(香港政府の立法会答弁・Arup 確認) — 送金の指示が本物かを、指示が届いたのとは別の経路で確かめる手順が無い"
title_en: "Hong Kong deepfake meeting fraud (Arup): trusting a pre-recorded video call that faked the UK CFO and colleagues, a finance employee sent about HK$200 million in 15 transfers (Hong Kong government LegCo reply, Arup confirmation) — Nothing confirms a payment instruction through a channel other than the one it came in on"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2024-01-29
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["034-ekyc-liveness-bypass", "032-booking-payout-account-tampering", "050-grok-deepfake-consent-provenance"]
status: published
version: "2.0"
og_lead_ja: "香港ディープフェイク会議詐欺：偽の CFO の指示で約 HK$2 億を送金（Arup）"
og_lead_en: "Hong Kong deepfake meeting fraud: a fake CFO's instruction moved HK$200M (Arup)"
layout: "report"
og_kicker_ja: "サイバー攻撃事例 · なりすまし"
og_kicker_en: "CYBERATTACK · IMPERSONATION"
og_headline_ja: "本社の CFO と同僚を\n偽の映像で装い、\n送金を指示した。\n<accent>約 HK$2 億を送金</accent>"
og_headline_en: "Fake video of the CFO and colleagues ordered the transfers.\n<accent>About HK$200M sent.</accent>"
key_figures:
  - value: "約 HK$2"
    unit: "億"
    label: "送金された額（約 2,560 万米ドル）。英国本社の CFO を名乗る指示による"
    tone: "alert"
  - value: "15"
    unit: "回"
    label: "1 週間のうちに、香港の 5 つの口座へ分けて送金"
  - value: "01-29 → 05-16"
    label: "警察への届け出から、Arup が被害を認めるまで"
glossary:
  - term: "ディープフェイク"
    desc: "AI で作った、実在の人物に似せた映像や声。公開されている動画や音声が素材になる。"
  - term: "ビジネスメール詐欺（BEC）"
    desc: "経営者や取引先を装い、送金や振込先の変更を指示する詐欺。今回はメールに加えてビデオ会議が使われた。"
  - term: "コールバック"
    desc: "指示が届いたのとは別の、あらかじめ登録した連絡先に、こちらからかけ直して本人に確かめること。"
insight:
  slug: "face-and-voice-as-approval"
  label: "顔と声が指示の根拠になる"
  quote: "見覚えのある顔と声が映った会議が、送金の指示が本物であることの根拠として使われた。"
industries: ["finance"]
operations: ["approval", "payment-change"]
controls:
  - slug: "separate-approval"
    item: "送金の指示は、会議とは別の経路で本人に確かめる"
  - slug: "hold-unverified"
    item: "本人に確かめられるまで、送金を止める"
attack_method: "impersonation"
impact: "約 HK$2 億を 15 回に分けて 5 口座へ送金"
takeaway: "上長を名乗る送金の指示を、指示が届いたのとは別の経路で、送金の前に確かめる手順が無かった。"
self_check: "上長を名乗る送金の指示がビデオ会議で届いたら、送金の前に、会議とは別の経路で本人に確かめられるか。"
countries: ["hk", "gb"]
---

> **改訂（v2.0 / 2026-10-21）**: 一般の読者が読める構成に組み直し、§5 を「対策するには」にした。香港政府の立法会答弁で事実を取り直し、ビデオ会議は「リアルタイムの会話」ではなく対話の無い録画だったこと、送金が 15 回だったこと、警察の公表が 2 月 2 日だったことを訂正した。

## 1. TL;DR

2024 年 1 月、英エンジニアリング大手 Arup の香港オフィスで、財務担当者が英国本社の CFO を名乗る指示を受け、1 週間のうちに 15 回、計約 HK$2 億（約 2,560 万米ドル）を 5 つの口座に送金した。指示を信じさせたのは、CFO と同僚が映ったビデオ会議で、映っていたのは全員、公開された動画と声から作られた偽物だった。香港警察が 2 月 2 日に公表し、Arup は 5 月に被害を認めた。

担当者は最初のメッセージをフィッシングと疑ったが、見覚えのある顔と声が並ぶ会議で疑いは解けた。会議は録画で対話は無く、偽の CFO は口実を付けて会議を終え、その後の指示はメッセージアプリなどで続いた。

担当者は本社に照会して詐欺に気づいたが、その前に 15 回の送金は通った。効かなかったのは、送金の指示が本物かを、指示が届いたのとは別の経路で、実行の前に確かめる層である。

## 2. 何が起きたか

- **対象**: 英エンジニアリング大手 Arup の香港オフィスの財務部門の社員。指示は、英国本社の CFO を名乗って届いた。
- **被害**: 約 HK$2 億（約 2,560 万米ドル）。1 週間のうちに 15 回に分けて、香港の 5 つの口座へ送金した。
- **手口**: 1 月中旬、CFO を名乗り「秘密の取引」を持ちかけるメッセージが届いた。担当者は疑ったが、招かれたビデオ会議に CFO と同僚が映り、全員が偽物だった。警察によれば、YouTube などで公開された動画と声から作った録画で、担当者との対話は無かった。偽の CFO は口実を付けて会議を終え、以後はメッセージアプリ、メール、1 対 1 のビデオ会議で指示を続けた。
- **発覚**: 担当者が英国本社に照会して分かった。1 月 29 日に警察へ届け出た。
- **社内のシステム**: Arup は、社内のシステムは侵害されておらず、財務と業務への影響も無いと述べた。同社の CIO は後に「技術で強化したソーシャルエンジニアリング」と呼んでいる。
- **捜査**: 2024 年 6 月の時点で捜査中（立法会答弁）。2026 年 10 月の時点で、この事案の逮捕や資金の回収は公表されていない。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">公表された範囲で見た、経過</span></div>
<p class="rx-ex-cap">止めどころは ③ と ④ の間。会議で疑いが解けた後、最初の送金の前に、会議とは別の経路で本社に確かめる機会があった。</p>
<div class="rx-chain">
<div class="rx-step"><div class="who">攻撃者</div><div class="no">1</div><b>公開された動画と声から、CFO と同僚の偽の映像を作る</b><p>YouTube などの公開素材。</p></div>
<div class="rx-step"><div class="who">CFO を名乗る攻撃者</div><div class="no">2</div><b>「秘密の取引」を持ちかけるメッセージを送る</b><p>担当者はフィッシングを疑う。</p></div>
<div class="rx-step crit"><div class="who">偽の CFO と同僚</div><div class="no">3</div><b>録画のビデオ会議で、送金を指示する</b><p>対話は無く、口実を付けて会議を終える。</p></div>
<div class="rx-step crit"><div class="who">担当者</div><div class="no">4</div><b>1 週間で 15 回、5 つの口座へ送金する</b><p>指示はメッセージアプリなどで続いた。</p></div>
</div>
</figure>

## 3. 時系列 — 公表と対応

- **2024-01 中旬**: 担当者に、英国本社の CFO を名乗るメッセージが届く。秘密の取引の話で、担当者はフィッシングを疑う。
- **その後の 1 週間**: ビデオ会議に参加し、指示に従って 15 回、5 つの口座へ送金。
- **2024-01-29**: 担当者が本社に照会して詐欺と分かり、警察に届け出る。
- **2024-02-02**: 香港警察のサイバー犯罪部門（CSTCB）が会見で公表。社名は伏せた。
- **2024-05-16**: Arup が CNN などに、被害企業であることを認める。「偽の声と映像が使われた」。
- **2024-06-26**: 香港政府の保安局長が立法会で答弁。会議は録画で対話は無く、事案は捜査中と説明した。

> 事実は香港政府の立法会答弁（一次）、Arup の声明と CIO の談話、警察の会見の報道に拠る。ビデオ会議の日付は公表されていない。会議に映った人数は報道によって幅がある。

### 公表後の対応

- **香港警察**: 怪しいビデオ会議では、相手に頭を動かしてもらう、会話の内容で試す、家族や知人に送金を頼まれたら電話で確かめる、といった見分け方を勧めた（立法会答弁）。
- **Arup**: 請求書詐欺、フィッシング、WhatsApp の声のなりすまし、ディープフェイクといった攻撃が、数も巧妙さも増えていると述べた。

## 4. なぜ止まらなかったか

この事案の失敗は、担当者の不注意でも、会議のツールの欠陥でもない。送金の指示が本物かを、指示が届いたのと同じ経路（メッセージと会議）の中でしか確かめておらず、その経路ごと偽物だった。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 2</span><span class="rx-ex-t">検出と証明の落差</span></div>
<p class="rx-ex-cap">証明は送金が実行される前に働き、検出は詐欺が表に出た後に働く。その間、会議で見た顔と声が、指示が本物である根拠として扱われる。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>証明の層 · 今回なし</b>送金の前に、会議とは別の経路で指示を確かめる</div>
<div class="rx-zone gapz"><b>落差</b><span>15 回の送金は通った。<br>本社への照会はまだ</span></div>
<div class="rx-zone det"><b>検出の層 · 気づいた</b>本社に照会し、詐欺と分かる</div>
<div class="rx-g g1"><div class="t">STEP 1</div><b>偽の会議で疑いが解ける</b></div>
<div class="rx-g g2"><div class="t">STEP 2</div><b>15 回の送金が通る</b></div>
<div class="rx-g g3"><div class="t">STEP 3</div><b>本社に照会して気づく</b></div>
<div class="rx-g g4"><div class="t">STEP 4</div><b>警察に届け出る</b></div>
</div>
</figure>

検出は働いた。担当者は最初のメッセージを疑い、最後は本社に照会して詐欺に気づいている。ただ、照会は送金の後で、「会議で CFO を見た」と「CFO がこの送金を指示した」は別々の事実なのに、前者が後者の根拠として通った。この隔たりが**検出と証明の落差**であり、構造的な欠落である。

同じ構造は、[eKYC のライブネス回避](https://lemma.frame00.com/ja/critical/briefs/034-ekyc-liveness-bypass/)（作った映像で本人確認の仕組みを通す）にも現れている。

## 5. 対策するには

**送金の指示は、届いた経路とは別の経路で、送金の前に確かめる。** 偽の映像の出来がどれほど良くなっても、あらかじめ登録した連絡先で本人に確かめれば、指示が本物かは映像と関係なく分かる。高額の取引や「秘密」「急ぎ」と言われる指示ほど、この確認を省かない決まりにする。

### 注意したい業界・業務

- **業界 · 金融・経理**: 海外の本社や親会社から送金を指示されうる組織の財務・経理。経営層の動画や声が講演や SNS で公開されているほど、偽物を作る素材がそろう。
- **業務 · 承認・決裁**: 上長の指示や承認を根拠に送金する業務。今回は、指示した本人と会議で会ったように見えたことが、承認の代わりになった。

### いまの対策で埋まるか

| 対策 | 今回 | 理由 |
| --- | --- | --- |
| 怪しいメッセージへの注意 | 一部 | 担当者は最初のメッセージを疑ったが、続く会議で疑いが解けた。 |
| ビデオ会議での上長の確認 | 効かない | 確認に使った会議そのものが、偽の映像と声だった。 |
| 複数人での承認 | 一部 | 承認する人も、同じ会議や同じ経路の指示を根拠にすれば通ってしまう。 |
| 本社への照会 | 一部 | 詐欺は分かったが、照会したのは送金の後だった。 |

### 必要になるもの

1. **指示とは別の経路で、本人に確かめる。** 社内の名簿など、あらかじめ登録した電話番号やアカウントに、こちらからかけ直す。指示の中に書かれた連絡先や、同じ会議・同じチャットの中での確認は数えない。
2. **確かめられるまで、送金を止める。** 金額や新しい送金先など、決めた条件に当たる送金は、確認が済むまで実行しない。「秘密」「急ぎ」は、止める理由として扱う。
3. **誰が、どの経路で確かめたかを残す。** 送金ごとに、確かめた人・経路・日時を記録し、後から第三者に示せる形、つまり証明として残す。

### 点検チェックリスト

上長や本社からの送金の指示について、組織で確かめる 3 項目

- 上長を名乗る送金の指示を、指示とは別の経路で本人に確かめる手順が決まっているか。
- その確認は、金額や「秘密」の指定にかかわらず、省けない決まりになっているか。
- 担当者が指示を疑ったとき、送金を止めて相談できる相手が決まっているか。

注：登録した連絡先そのものが乗っ取られていれば、別の経路での確認も通ってしまう。また、確認に手間がかかる分、急ぎの正規の送金も遅れる。警察の勧める見分け方（頭を動かしてもらう、会話で試す）は、録画の偽物には効くが、映像を作る技術は進んでおり、見分け方だけには頼れない。

## 6. Sources

- **香港特別行政区政府 保安局（一次・立法会答弁）**: 「LCQ9: Combating frauds involving deepfake」（2024-06-26） — <https://www.info.gov.hk/gia/general/202406/26/P2024062600192.htm>
- **世界経済フォーラム（一次・Arup CIO の談話）**: 「'This happens more frequently than people realize': Arup chief on the lessons learned from a $25m deepfake crime」（2025-02-04） — <https://www.weforum.org/stories/2025/02/deepfake-ai-cybercrime-arup/>
- **CNN（報道・Arup の声明を引用）**: 「Arup revealed as victim of $25 million deepfake scam involving Hong Kong employee」（2024-05-16） — <https://edition.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk>
- **Fortune（報道・Arup の声明を引用）**: 「A deepfake 'CFO' tricked the British design firm behind the Sydney Opera House in $25 million fraud」（2024-05-17） — <https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo/>
- **The Standard（報道・警察の会見）**: 「HK's first deepfake video conference scam involving HK$200 million」（2024-02-04） — <https://www.thestandard.com.hk/news/article/213122/HKs-first-deepfake-video-conference-scam-involving-HK200-million>
- **Hong Kong Free Press（報道・AFP）**: 「Multinational loses HK$200 million to deepfake video scam」（2024-02-05） — <https://hongkongfp.com/2024/02/05/multinational-loses-hk200-million-to-deepfake-video-conference-scam-hong-kong-police-say/>
- **CNN（報道）**: 「Finance worker pays out $25 million after video call with deepfake 'chief financial officer'」（2024-02-04） — <https://edition.cnn.com/2024/02/04/asia/deepfake-cfo-scam-hong-kong-intl-hnk>
- **South China Morning Post（報道）**: 「'Everyone looked real': multinational firm's Hong Kong office loses HK$200 million after scammers stage deepfake video meeting」（2024-02-04） — <https://www.scmp.com/news/hong-kong/law-and-crime/article/3250851/everyone-looked-real-multinational-firms-hong-kong-office-loses-hk200-million-after-scammers-stage>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
