---
brief_no: 91
title: "Photo ZIP：Calendly の通知を経由した偽の連絡が SPF・DKIM・DMARC を通り、ホテルの受付に届いたと報告された(Microsoft の研究)"
title_en: "Photo ZIP: fake messages relayed through Calendly notifications passed SPF, DKIM and DMARC and reached hotel front desks (Microsoft research)"
pillar: "01-verifiable-origin"
primary_category: "identity-auth"
secondary_categories: ["code-provenance", "attribute-proof-bypass"]
incident_date: 2026-06-25
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "064-salesloft-drift-oauth-salesforce", "062-claude-code-github-action-bot-trust", "047-openclaw-agent-phishing"]
status: "published"
layout: "report"
sections: "proof"
gate: "intake"
version: "1.0"
og_lead_ja: "Microsoft によれば、Calendly の通知を経由した偽の連絡が SPF・DKIM・DMARC を通ってホテルの受付に届き、写真に見せかけたファイルから Node.js のバックドア TonRAT が入った"
og_lead_en: "Per Microsoft, fake messages relayed through Calendly notifications passed SPF, DKIM and DMARC, reached hotel front desks, and a file posing as a photo installed the Node.js backdoor TonRAT"
search_title: "Photo ZIP：認証を通った偽メールとホテルの対策"
search_description: "Microsoft は、Calendly の通知を経由した偽の予約連絡が SPF・DKIM・DMARC を通り、欧州・アジアのホテルの受付に Node.js のバックドアが入ったと報告した。何が起きたか、何を照合するか、対策を整理。"
og_kicker_ja: "フィッシング · 宿泊業の受付"
og_kicker_en: "PHISHING · HOTEL FRONT DESKS"
og_headline_ja: "認証を通った偽の連絡が\nホテルの受付に届いたと\nMicrosoft が報告。\n<accent>3 つの認証を通過</accent>"
og_headline_en: "Fake guest emails passed\nSPF, DKIM and DMARC,\nMicrosoft reports.\n<accent>Hotels in Europe, Asia</accent>"
key_figures:
  - value: "3"
    unit: "つ"
    label: "通ったメール認証（SPF・DKIM・DMARC）。メールは Calendly の基盤から送られていた（Microsoft）"
    tone: "alert"
  - value: "3"
    unit: "言語"
    label: "観測されたルアーの言語。日本語が最も多く、ほかにデンマーク語・オランダ語（Microsoft）"
  - value: "2"
    unit: "波"
    label: "観測された活動の段階。2026-04 に始まり、5 月末に Calendly を経由する配信が加わった（Microsoft）"
glossary:
  - term: "SPF・DKIM・DMARC"
    desc: "メールが、名乗るドメインの正規の送信基盤から送られ、途中で改ざんされていないかを受信側で判定する仕組み。送信の経路を判定するもので、本文を書いた相手が誰かは判定しない。"
  - term: "認証ランダリング（authentication laundering）"
    desc: "正規のサービスの送信基盤を中継させて、攻撃者が作ったメールをメール認証に通す手口を、Microsoft はこう呼んでいる。"
  - term: "LNK ファイル"
    desc: "Windows のショートカットのファイル。開くと、中に書かれた命令やプログラムが動く。既定の設定では拡張子が表示されず、画像などに見せかけられることがある。"
insight:
  slug: "authenticated-path-as-author"
  label: "送信経路の認証を、書いた相手の確認とみなす前提"
  quote: "届いた連絡を予約やゲストの連絡として扱う前に、書いた相手が名乗るとおりの取引先かを、送信経路の認証とは別に管理された記録と照合しなければ、正規の送信基盤を通っただけのメールが、そのまま信頼された連絡になる。"
industries: ["retail"]
operations: ["delivery"]
controls:
  - slug: "ownership-check"
    item: "認証を通ったメールでも、本当に予約サイトからの連絡か確認する"
attack_method: "impersonation"
takeaway: "Microsoft によれば、Calendly の通知を経由した偽の予約連絡は SPF・DKIM・DMARC をすべて通り、ホテルの受付に正規のメールとして届いた。"
self_check: "予約やゲストからの連絡を開いて動く前に、書いた相手が名乗るとおりの取引先かを、メール認証の結果とは別の記録と照合しているか。"
countries: ["global"]
---

## 1. 要点

Microsoft Defender Security Research Team は 2026-06-25、欧州・アジアのホテル・宿泊施設を狙うキャンペーン「Photo ZIP」を公表した。Microsoft によれば、攻撃者は日程調整のサービス Calendly の仕組みで通知を作り、そのメールは Calendly の基盤から送られたため、受信側の SPF・DKIM・DMARC をすべて通って「Booking Manager（via Calendly）」として受付に届いた。写真に見せかけたファイルを開くと、正規の Node.js の上でバックドア TonRAT が動き、Microsoft は複数の組織での侵入を確認している。最終的な目的は確認されていない。<strong>届いた連絡を予約やゲストの連絡として扱う前に、書いた相手が名乗るとおりの取引先かを、送信経路の認証とは別に管理された記録と照合しなければ、正規の送信基盤を通っただけのメールが、そのまま信頼された連絡になる。</strong>

## 2. 通った操作

- **通った操作**: 攻撃者が Calendly の仕組みで作った通知メールの配信。メールは実際に Calendly の基盤から送られたので、SPF・DKIM・DMARC はすべて正規として通り、送信者名は「Booking Manager（via Calendly）」と表示された（Microsoft）。本文には、Calendly と Google のリダイレクトを経由して攻撃者のドメインに着くリンクが入っていた。ルアーは、ゲストの苦情や南京虫の通報などで、日本語のものが最も多かった（Microsoft）。
- **受け付けた側に届くもの**: Microsoft の報告では、リンクから ZIP ファイルが落ち、中の写真に見える LNK ファイルを開くと、PowerShell を経て nodejs.org から正規の Node.js のランタイムが取得され、その上でインプラント TonRAT が動く。TonRAT はレジストリの 2 か所で持続化し、攻撃者のドメインと通信する。侵害の後には、通信の確立、強制シャットダウン、実行ファイルのコンパイルが観測された。予約・フロントの端末（端末名に `reception-`・`frontdesk-`・`accueil`・`recepcja` などを含むもの）が選んで狙われた。
- **公表されていないこと**: 侵入を受けた組織の数と国別の内訳、最終的な目的、既知の攻撃者への帰属。Microsoft は、難読化と持続化への手間から、後の活動に向けた準備の段階と評価している。

## 3. 何を照合するか

経路を問わず区別できる条件は、届いた連絡を予約やゲストの連絡として扱い、リンクや添付を開く前に、書いた相手が名乗るとおりの取引先かを、送信の経路の認証とは別に照合することである。

- **誰が承認を出すか**: 宿泊施設の予約の管理者。どの予約サイト・日程調整のサービス・取引先からの連絡を、予約やゲストの連絡として受け付けるかと、その連絡がどの記録に結び付くかを決める。送信者名の表示や、メール認証が通ったことは、承認に使わない。
- **どこで照合するか**: 受付の端末で、届いた連絡を予約の連絡として表示し、リンクや添付を開ける状態にする直前。連絡が、受け付けると決めた相手の記録（予約サイトの予約番号や、取引先の登録済みの鍵など）と結び付くかを照合し、照合できない連絡は、予約の連絡として扱わず、リンクと添付を照合が済むまで保留する。
- **何が残るか**: どの連絡が、どの相手の記録と照合され、受け付けられたか（または保留されたか）の記録。メールの基盤とは別に、後から示せる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝届いた連絡を予約やゲストの連絡として扱う前に、書いた相手が名乗るとおりの取引先かを照合し、記録に残すこと。検知＝Microsoft が活動を観測し、侵入の痕跡と緩和策を公表したこと。日付は Microsoft の報告による。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>予約の連絡として扱う前に、書いた相手を送信経路とは別の記録と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>メール認証を通った偽の連絡が受付に届き<br>複数の組織で侵入が確認された</span></div>
<div class="rx-zone det"><b>検知 · Microsoft が観測した</b>侵入の痕跡（IoC）と緩和策を公表した</div>
<div class="rx-g g1"><div class="t">2026-04</div><b>活動が始まる（第 1 波）</b></div>
<div class="rx-g g2"><div class="t">2026-05 末</div><b>Calendly を経由する配信に</b></div>
<div class="rx-g g3"><div class="t">第 2 波</div><b>ファイル名と段階が変わる</b></div>
<div class="rx-g g4"><div class="t">06-25</div><b>Microsoft が公表</b></div>
</div>
</figure>

メール認証は働き、メールが Calendly の基盤から送られたことは正しく判定された。Microsoft は活動を観測して、侵入の痕跡と緩和策を公表した。効かなかったのは、その手前で、書いた相手が名乗るとおりの取引先かを照合する層である。信頼された API の基盤がカードの窃取に使われた [Brief 030](https://lemma.frame00.com/ja/critical/briefs/030-stripe-trusted-channel-skimmer/)、信頼された連携の OAuth が悪用された [Brief 064](https://lemma.frame00.com/ja/critical/briefs/064-salesloft-drift-oauth-salesforce/)、`[bot]` の名乗りが起動の権限とみなされた [Brief 062](https://lemma.frame00.com/ja/critical/briefs/062-claude-code-github-action-bot-trust/) と同じ形で、正規の経路や名乗りが、中身を書いた相手の照合の代わりになっている。

## 4. Lemma でできること

**Lemma は、03 の照合を、受付が届いた連絡を予約やゲストの連絡として扱う直前に組み込む。** 悪性のメールやファイルを見つけるのではなく、連絡が、受け付けると決めた相手の記録と結び付くかを、メール認証の結果とは別に照合する。

### 注意したい業界・業務

- **業界 · サービス・小売（宿泊）**: 予約サイト・日程調整のサービス・ゲストから、写真や文書の付いた連絡を日々受け取る、ホテル・宿泊施設の予約とフロント。
- **業務 · 予約・ゲストの連絡の受付**: 外部のサービスを経由して届く通知を、予約の連絡として開き、リンクや添付から次の作業に移る業務。送信者名とメール認証の結果が、そのまま信頼の根拠になりやすい。

### いまの対策と Lemma の違い

今回の中核の経路は、1 列目の、正規のサービスの通知を経由してメール認証を通った偽の連絡である。2 列目は、写真に見せかけたファイルが受付の端末で開かれる段、3 列目は、開かれた後の持続化と通信を比べる。

| 対策 | 正規のサービスを経由し、メール認証を通った偽の連絡 | 写真に見せかけたファイルが開かれる | 開かれた後の持続化と通信 |
| --- | --- | --- | --- |
| SPF・DKIM・DMARC によるメール認証 | 効かない | 関係しない | 関係しない |
| 「Booking Manager（via Calendly）」を名乗るメールの周知と、リダイレクトの最終の行き先の確認（Microsoft の推奨） | 一部 | 関係しない | 関係しない |
| 既知の拡張子の表示、LNK の実行の制限、ASR ルール（Microsoft の推奨） | 関係しない | 一部 | 関係しない |
| 正規のランタイム（Node.js）の普通でない置き場所や外部との通信を見る SIEM・EDR のルールと、公表された IoC の登録（Microsoft の推奨） | 関係しない | 関係しない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 関係しない | 関係しない |

メール認証は、メールが Calendly の基盤から送られたことを正しく判定したので、この経路では偽の連絡を分けられなかった（Microsoft）。周知とリダイレクトの確認は、人が気づけば止まるが、名乗りや文面が変われば頼れない。拡張子の表示と LNK の制限は、ファイルを開く段を狭め、検知のルールと IoC は、開かれた後の動きに気づく手がかりになる。Lemma は、連絡が受け付けると決めた相手の記録と結び付くかを照合するので、Calendly の基盤から届いただけの連絡は、予約の連絡として扱われる前に保留される。一方、ファイルの中身や、端末で動くプログラムは判定しないので、2・3 列目は端末の側の対策と組み合わせて埋める。

注：Lemma の照合が働くのは、受付の仕組みに照合を組み込み、予約サイトや取引先が連絡を自分の記録に結び付けて送り、その記録が、メールの本文や送信者名とは別に管理されている場合に限る。正規の予約サイトや取引先のアカウントや鍵が奪われた場合や、記録に結び付いた正規の連絡にリンクや添付が仕込まれた場合は、通りうる。Lemma はメールの基盤や Calendly の仕組みを変えず、メールやファイルの善悪も判定しない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

ホテル・宿泊施設の予約とフロントで確認する 3 項目

- 「Booking Manager（via Calendly）」のように、日程調整や予約のサービスを経由した送信者名のメールについて、受付の全員に知らせているか。
- 受付の端末で、既知の拡張子を表示し、LNK ファイルの実行を制限しているか。
- 予約やゲストからの連絡を、メールのリンクや添付からでなく、予約サイトの管理画面など、登録済みの経路で確認する手順があるか。

## 5. 事実と時系列

- **報告した主体**: Microsoft Defender Security Research Team（Parth Jomadkar）。2026-06-25 に技術的な報告と、侵入の痕跡（C2 のドメイン・ハッシュなど）を公表した。
- **対象**: 欧州・アジアのホテル・宿泊施設。予約・フロントの担当の端末が選んで狙われた（Microsoft）。
- **規模**: Microsoft が複数の組織での侵入を確認した。組織の数と国別の内訳は公表されていない。
- **配信**: 攻撃者が Calendly の仕組みで通知を作り、Calendly と Google のリダイレクトを経由するリンクを本文に入れた。メールは Calendly の基盤から送られ、SPF・DKIM・DMARC を通った。送信者名は「Booking Manager（via Calendly）」。Microsoft はこれを認証ランダリングと呼んでいる。
- **端末での動き（Microsoft の報告）**: ZIP の中の、写真に見える LNK ファイルを開くと、難読化された PowerShell が正規の Node.js（v24.13.0）をユーザーの領域に取得し、その上で JavaScript のインプラント TonRAT を動かす。TonRAT はレジストリの 2 か所で持続化し、攻撃者のドメインと通信する。
- **ルアー**: ゲストの苦情や南京虫の通報など。言語は日本語が最も多く、ほかにデンマーク語・オランダ語が観測された。`accueil`・`recepcja` などは、狙われた端末名の型として報告されている。
- **帰属と目的**: 既知の攻撃者には帰属されていない。最終的な目的は確認されておらず、Microsoft は後の活動に向けた準備の段階と評価している。

### 時系列

- **2026-04**: 「Photo ZIP」の活動が始まる（第 1 波）。ファイル名は `IMG-` で始まる。
- **2026-05 末**: Calendly の通知の仕組みと Google のリダイレクトを経由する配信が加わる。
- **第 2 波**: ファイル名が `PHOTO-` で始まる形に変わり、.NET の DLL を端末でコンパイルする段と、Cloudflare の後ろのドメインが加わる。
- **2026-06-25**: Microsoft Defender Security Research Team が報告と侵入の痕跡を公表。

> 本件の事実は、Microsoft の脅威インテリジェンスによる観測と公表に拠り、The Hacker News・SC Media・セキュリティ対策Lab はその報告を伝えている。TonRAT の通信の細部のうち、公表の範囲を超えることは書かない。侵入を受けた組織の数・国別の内訳・最新の侵入の痕跡は、Microsoft の一次の公表を参照のこと。本 Brief は、再現の手順を載せない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Microsoft**: 緩和策として、「Booking Manager（via Calendly）」を送信者名とするメールの全スタッフへの周知、リダイレクトの最終の行き先の確認、既知の拡張子の表示、LNK の実行の制限と ASR ルール、正規のランタイム（Node.js）の普通でない置き場所や外部との通信を見る SIEM・EDR のルールの追加、公表した侵入の痕跡の登録を勧め、Microsoft Defender の関連する警告を案内した。

## 6. Sources

- **Microsoft Security Blog（研究・一次）**: "Photo ZIP campaign targeting hospitality industry delivers Node.js implant for persistent access"（Microsoft Defender Security Research Team・Parth Jomadkar、2026-06-25）— <https://www.microsoft.com/en-us/security/blog/2026/06/25/photo-zip-campaign-targeting-hospitality-industry-delivers-node-js-implant-persistent-access/>
- **The Hacker News**: "Microsoft Warns of Photo ZIP Phishing Campaign Targeting Hotels with Node.js Implant" — <https://thehackernews.com/2026/06/microsoft-warns-of-photo-zip-phishing.html>
- **SC Media**: "Photo-themed phishing campaign targets European and Asian hotels with Node.js implant" — <https://www.scworld.com/brief/photo-themed-phishing-campaign-targets-european-and-asian-hotels-with-node-js-implant>
- **セキュリティ対策Lab**: 「Microsoftが『Photo ZIPキャンペーン』を公開」（2026-06-30／日本語解説）— <https://rocket-boys.co.jp/security-measures-lab/hotel-frontdesk-phishing-node-backdoor/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
