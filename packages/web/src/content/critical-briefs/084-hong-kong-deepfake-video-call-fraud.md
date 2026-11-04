---
brief_no: 84
title: "香港ディープフェイク会議詐欺（Arup）：英国本社の CFO と同僚を装った録画のビデオ会議を信じ、財務担当者が約 HK$2 億を 15 回に分けて送金した(香港政府の立法会答弁・Arup 確認)"
title_en: "Hong Kong deepfake meeting fraud (Arup): trusting a pre-recorded video call that faked the UK CFO and colleagues, a finance employee sent about HK$200 million in 15 transfers (Hong Kong government LegCo reply, Arup confirmation)"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2024-01-29
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["034-ekyc-liveness-bypass", "032-booking-payout-account-tampering", "050-grok-deepfake-consent-provenance"]
status: published
version: "2.1"
og_lead_ja: "香港ディープフェイク会議詐欺：偽の CFO の指示で約 HK$2 億を送金（Arup）"
og_lead_en: "Hong Kong deepfake meeting fraud: a fake CFO's instruction moved HK$200M (Arup)"
layout: "report"
sections: "proof"
gate: "payment-instruction"
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
    desc: "指示が届いたのとは別の、あらかじめ登録した連絡先に、こちらからかけ直して本人に確認すること。"
insight:
  slug: "face-and-voice-as-approval"
  label: "顔と声が指示の根拠になる"
  quote: "見覚えのある顔と声が映った会議は、それだけでは、送金の指示が本物であることの根拠にならない。"
industries: ["finance"]
operations: ["approval", "payment-change"]
controls:
  - slug: "hold-unverified"
    item: "本人に確認できるまで、送金を止める"
attack_method: "impersonation"
impact: "約 HK$2 億を 15 回に分けて 5 口座へ送金"
takeaway: "上長を名乗る送金の指示を、指示が届いたのとは別の経路で、送金の前に確認する手順が無かった。"
self_check: "上長を名乗る送金の指示がビデオ会議で届いたら、送金の前に、会議とは別の経路で本人に確認できるか。"
countries: ["hk", "gb"]
search_title: "香港ディープフェイク会議詐欺（Arup）：約38億円相当の手口"
search_description: "英国本社の CFO と同僚を装った録画のビデオ会議を信じ、財務担当者が約 HK$2 億（約38億円相当）を15回に分けて送金した（香港政府の立法会答弁・Arup 確認）。手口と、送金の指示を確認する対策を整理。"
---

> **改訂（v2.1 / 2026-11-02）**: 章立てを「通った操作」から始まる並びに組み直した。事実と出典は変えていない。v2.0（2026-10-21）では、香港政府の立法会答弁から事実を取り直し、ビデオ会議が録画で対話の無いものだったこと、送金が 15 回だったこと、警察の公表が 2 月 2 日だったことを訂正している。

## 1. 要点

担当者は最初のメッセージをフィッシングと疑ったが、見覚えのある顔と声が並ぶ会議で、疑いは解けた。会議は録画で対話は無く、偽の CFO は口実を付けて会議を終え、その後の指示はメッセージアプリなどで続いた。担当者が本社に照会して詐欺と分かったのは、送金が通った後だった。<strong>見覚えのある顔と声が映った会議は、それだけでは、送金の指示が本物であることの根拠にならない。</strong>

## 2. 通った操作

- **通った操作**: 英国本社の CFO を名乗る指示に基づく、財務担当者による外部の口座への送金。香港の 5 つの口座へ、1 週間のうちに分けて行われた（香港政府の立法会答弁）。
- **止まった操作**: 担当者は、最初のメッセージをフィッシングと疑った。最後は本社に照会して詐欺に気づいたが、送金の後だった。
- **受け付けた側に届くもの**: 一般に、ビデオ会議で見た顔と聞いた声は、送金の手続きには、指示した本人が承認したことを示すものとして届く。映像と声が本物かは、会議の画面からは区別できない。
- **公表されていないこと**: ビデオ会議の日付、会議に映った人数（報道によって幅がある）。2026 年 10 月の時点で、この事案の逮捕や資金の回収は公表されていない。

## 3. 実行前の照合

経路を問わず区別できる条件は、送金を実行する側が、その送金の指示が本物かを、指示が届いたのとは別の経路で、送金の前に、あらかじめ登録した連絡先で照合することである。

- **誰が承認を出すか**: 指示を出したとされる本人（上長・本社）。社内の名簿などに、あらかじめ登録した電話番号やアカウントで、こちらからかけ直して承認を受ける。指示の中に書かれた連絡先や、同じ会議・同じチャットの中での確認は数えない。
- **どこで照合するか**: 送金を実行する手続き。金額や新しい送金先など、決めた条件に当たる送金は、本人の承認と一致するまで実行せず、止める。「秘密」「急ぎ」は、止める理由として扱う。
- **何が残るか**: 送金ごとに、誰が、どの経路で、いつ確認したかの記録。送金の手続きとは別に、後から第三者に示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝送金を実行する前に、指示が本物かを別の経路で本人に照合し、記録に残すこと。検知＝詐欺が表に出た後に気づくこと。下の日付は、警察・Arup が確認・公表した日で、送金が行われた日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>送金の前に、会議とは別の経路で、登録済みの連絡先で照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>約 HK$2 億が 15 回に分けて送られた<br>本社への照会は送金の後</span></div>
<div class="rx-zone det"><b>検知 · 気づいた</b>担当者が本社に照会し、詐欺と分かる</div>
<div class="rx-g g1"><div class="t">2024-01 中旬</div><b>会議で疑いが解ける</b></div>
<div class="rx-g g2"><div class="t">01-29</div><b>警察に届け出る</b></div>
<div class="rx-g g3"><div class="t">02-02</div><b>警察が公表する</b></div>
<div class="rx-g g4"><div class="t">05-16</div><b>Arup が被害を認める</b></div>
</div>
</figure>

「会議で CFO を見た」と「CFO がこの送金を指示した」は、別々の事実である。作った映像で本人確認の仕組みを通す事案に、[eKYC のライブネス回避](https://lemma.frame00.com/ja/critical/briefs/034-ekyc-liveness-bypass/)がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、送金を実行する側に組み込む。** 侵入を見つけるのではなく、届いた送金の指示が、登録済みの連絡先を通じた本人の承認に基づくかを、送金の前に照合する。

### 注意したい業界・業務

- **業界 · 金融・経理**: 海外の本社や親会社から送金を指示されうる組織の財務・経理。経営層の動画や声が講演や SNS で公開されているほど、偽物を作る素材がそろう。
- **業務 · 承認・決裁**: 上長の指示や承認を根拠に送金する業務。今回は、指示した本人と会議で会ったように見えたことが、承認の代わりになった。

### いまの対策と Lemma の違い

今回の経路は、録画のビデオ会議と、続くメッセージアプリ・メールで届いた送金の指示である。ほかの経路（登録した連絡先そのものが乗っ取られた場合など）は、公表されていないため、列を分けず、注に書く。

| 対策 | ビデオ会議と続く指示で届いた送金の指示（今回の経路） |
| --- | --- |
| 怪しいメッセージへの注意 | 一部 |
| ビデオ会議での上長の確認 | 効かない |
| 複数人での承認 | 一部 |
| 本社への照会 | 一部 |
| **Lemma（実行の前の照合）** | 効く |

怪しいメッセージへの注意は、担当者が最初のメッセージを疑ったが、続く会議で疑いが解けた。ビデオ会議での上長の確認は、確認に使った会議そのものが、偽の映像と声だった。複数人での承認は、承認する人も同じ会議や同じ経路の指示を根拠にすれば、通ってしまう。本社への照会は、詐欺は分かったが、送金の後だった。Lemma は、会議とは別の経路で、登録済みの連絡先を通じて本人の承認を、送金の前に照合する。

注：Lemma の照合が働くのは、送金を実行する手続きに照合を組み込み、承認に使う連絡先が、指示を運ぶ会議やメッセージとは別に管理されている場合に限る。登録した連絡先そのものが乗っ取られていれば、別の経路での確認も通ってしまう。確認に手間がかかる分、急ぎの正規の送金も遅れる。警察の勧める見分け方（頭を動かしてもらう、会話で試す）は、録画の偽物には効くが、映像を作る技術は進んでおり、見分け方だけには頼れない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

上長や本社からの送金の指示について、組織で確認する 3 項目

- 上長を名乗る送金の指示を、指示とは別の経路で本人に確認する手順が決まっているか。
- その確認は、金額や「秘密」の指定にかかわらず、省けない決まりになっているか。
- 担当者が指示を疑ったとき、送金を止めて相談できる相手が決まっているか。

## 5. 事実と時系列

- **対象**: 英エンジニアリング大手 Arup の香港オフィスの財務部門の社員。指示は、英国本社の CFO を名乗って届いた。
- **被害**: 約 HK$2 億（約 2,560 万米ドル）。1 週間のうちに 15 回に分けて、香港の 5 つの口座へ送金した。
- **手口**: 1 月中旬、CFO を名乗り「秘密の取引」を持ちかけるメッセージが届いた。担当者は疑ったが、招かれたビデオ会議に CFO と同僚が映り、全員が偽物だった。警察によれば、YouTube などで公開された動画と声から作った録画で、担当者との対話は無かった。偽の CFO は口実を付けて会議を終え、以後はメッセージアプリ、メール、1 対 1 のビデオ会議で指示を続けた。
- **発覚**: 担当者が英国本社に照会して分かった。1 月 29 日に警察へ届け出た。
- **社内のシステム**: Arup は、社内のシステムは侵害されておらず、財務と業務への影響も無いと述べた。同社の CIO は後に「技術で強化したソーシャルエンジニアリング」と呼んでいる。
- **捜査**: 2024 年 6 月の時点で捜査中（立法会答弁）。2026 年 10 月の時点で、この事案の逮捕や資金の回収は公表されていない。

### 時系列

- **2024-01 中旬**: 担当者に、英国本社の CFO を名乗るメッセージが届く。秘密の取引の話で、担当者はフィッシングを疑う。
- **その後の 1 週間**: ビデオ会議に参加し、指示に従って 15 回、5 つの口座へ送金。
- **2024-01-29**: 担当者が本社に照会して詐欺と分かり、警察に届け出る。
- **2024-02-02**: 香港警察のサイバー犯罪部門（CSTCB）が会見で公表。社名は伏せた。
- **2024-05-16**: Arup が CNN などに、被害企業であることを認める。「偽の声と映像が使われた」。
- **2024-06-26**: 香港政府の保安局長が立法会で答弁。会議は録画で対話は無く、事案は捜査中と説明した。

> 事実は香港政府の立法会答弁（一次）、Arup の声明と CIO の談話、警察の会見の報道に拠る。ビデオ会議の日付は公表されていない。会議に映った人数は報道によって幅がある。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **香港警察**: 怪しいビデオ会議では、相手に頭を動かしてもらう、会話の内容で試す、家族や知人に送金を頼まれたら電話で確認する、といった見分け方を勧めた（立法会答弁）。
- **Arup**: 請求書詐欺、フィッシング、WhatsApp の声のなりすまし、ディープフェイクといった攻撃が、数も巧妙さも増えていると述べた。

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
