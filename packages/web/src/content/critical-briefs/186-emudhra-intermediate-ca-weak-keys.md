---
brief_no: 186
title: "eMudhra：中間 CA の秘密鍵が、鍵を作る手順の誤りで弱く作られ、誰でも求められる状態で信頼されていた(Mozilla の報告)"
title_en: "eMudhra: Intermediate CA private keys were generated weak through a flaw in the key-generation procedure, and stayed trusted while anyone could recover them (Mozilla report)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth]
incident_date: 2026-10-17
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["178-digicert-ev-code-signing-issuance-hijack", "179-microsoft-fox-tempest-code-signing-service", "074-taiko-bridge-prover-key-leak"]
status: draft
version: "1.0"
og_lead_ja: "インドの認証局 eMudhra、鍵を作る台本の誤りで中間 CA 8 本の秘密鍵が弱く作られ、研究者がその鍵で署名してみせて失効"
og_lead_en: "eMudhra: a key-ceremony script flaw left 8 intermediate CA keys weak; a researcher signed with them and the CAs were revoked"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "認証局の事故 · 弱く作られた鍵"
og_kicker_en: "CA INCIDENT · WEAK CA KEYS"
og_headline_ja: "中間 CA の秘密鍵が、\n誰でも求められたと報告。\n<accent>8 本を失効</accent>"
og_headline_en: "Intermediate CA keys\nanyone could recover,\nMozilla reports.\n<accent>8 CAs revoked</accent>"
key_figures:
  - value: "8"
    unit: "本"
    label: "秘密鍵が求められた中間 CA。うち 6 本は TLS 用、2 本はコード署名用（Mozilla の報告）"
    tone: "alert"
  - value: "2025-04-30 → 2026-10-17"
    label: "鍵を作った日から、研究者の届け出まで（Mozilla の報告）"
  - value: "約 30,000"
    unit: "枚"
    label: "ルートの信頼が外されるため、別の階層へ移す必要がある証明書（eMudhra の見積もり）"
glossary:
  - term: "中間 CA"
    desc: "ルート CA の下で、利用者向けの証明書に署名する認証局。ルートが中間 CA の公開鍵に署名することで、中間 CA の署名がブラウザに信頼される。"
  - term: "鍵を作る儀式（Key Generation Ceremony）"
    desc: "認証局が CA の鍵を、決めたスクリプト（手順を書いた台本）と立会いのもとで、専用の装置（HSM）の中で作る手順。"
  - term: "クロス署名"
    desc: "別の認証局のルートが、同じ中間 CA の公開鍵に署名すること。中間 CA が、その認証局のルートからも信頼される。"
  - term: "失効"
    desc: "認証局が、発行した証明書を無効にすること。その証明書の鍵による署名は、信頼されなくなる。"
insight:
  slug: "valid-key-not-sole-holder"
  stop: true
  label: "本人だけのものでない正規の鍵"
  quote: "ルートが中間 CA の公開鍵に署名する前に、申請の公開鍵を、鍵の名前ではなく儀式で承認した鍵の記録と照合する。"
industries: ["developers", "supply-chain"]
operations: ["approval"]
controls:
  - slug: "check-origin"
    item: "ルートが中間 CA の公開鍵に署名する前に、その鍵が、承認した手順と装置で作られた鍵として記録されたものかを照合する"
  - slug: "hold-unverified"
    item: "作られた記録と結び付かない鍵には、署名もクロス署名の依頼もせずに保留する"
  - slug: "audit-trail"
    item: "どの鍵が、どの装置で、どの手順で作られ、誰の承認で署名されたかを残す"
attack_method: "human-error"
impact: "鍵を作る手順の誤りで中間 CA 8 本の秘密鍵が弱く作られ、失効した。ブラウザの各社は中間 CA を遮断し、Mozilla と Chrome は上のルートの信頼を外すとした"
takeaway: "署名は正規の鍵で付いたが、その鍵は eMudhra だけのものではなかった。鍵を使い始める前に、その鍵が承認した手順で作られた鍵かを照合する。"
self_check: "署名に使う鍵を使い始める前に、その鍵が承認した手順と装置で作られたものかを、鍵の名前とは別に照合しているか。"
countries: ["in"]
search_title: "eMudhra の中間 CA 鍵の危殆化：弱い鍵 8 本の経緯"
search_description: "インドの認証局 eMudhra で、鍵を作るスクリプトの誤りから中間 CA 8 本の秘密鍵が弱く作られ、誰でも求められる状態だった（Mozilla の報告）。何が起きたか、なぜ通ったか、対策を整理。"
---

## 1. 要点

鍵が盗まれたのではない。Mozilla の報告では、2025 年 4 月の鍵を作る儀式で作られた中間 CA の秘密鍵は、十分な乱数を持たない弱い鍵だった。公開鍵から誰でも短い時間で求められた。eMudhra の説明では、手順のスクリプト（台本）の誤りで、弱い鍵の組がもう 1 つ作られた。名前が似ていたために、その鍵がルートの署名とクロス署名に回された。届け出た研究者は、求めた鍵で署名してみせた。その署名は、正規の中間 CA の鍵による有効な署名として検証できる。<strong>署名が正規の鍵で検証できても、その鍵を持つのが本人だけでなければ、署名は本人が付けたことを示さない。</strong>

## 2. 通った操作

- **通った操作**: eMudhra のルートによる、中間 CA 8 本の公開鍵への署名と、Sectigo によるクロス署名。eMudhra の説明では、署名を受けた公開鍵は、儀式で本来使うはずだった鍵ではなく、誤って作られた弱い鍵のものだった。その後、鍵を求めた第三者は、この中間 CA の鍵で署名できる状態になった。
- **受け付けた側に届くもの**: 一般に、ルートや別の認証局が署名するときに届くのは、署名を求める申請（CSR）に入った公開鍵と、申請の名義である。鍵がどの手順で、どの装置で作られたか、ほかに同じ鍵を持つ者がいないかは、申請からは分からない。ブラウザなど署名を確認する側にも、正規の中間 CA の鍵による有効な署名が届き、署名からは誰が付けたかを見分けられない。
- **公表されていないこと**: スクリプトのどの部分が、どのように誤っていたか（eMudhra は調べているとし、KPMG に独立の調査を頼んで、報告の全文は 11-09 までに出すとしている）。届け出の前に、誰かがこの鍵を求めて署名に使ったか。弱い鍵が、なぜ装置の中で作られえたか（Bugzilla で参加者が問い、答えは出ていない）。

## 3. 何を照合するか

経路を問わず区別できる条件は、ルートが中間 CA の公開鍵に署名する前に、申請の公開鍵を鍵の名前ではなく儀式で承認した鍵の記録と照合することである。

- **誰が承認を出すか**: 鍵を作る儀式の責任者と立会人。作った鍵の公開鍵と指紋を、装置とスクリプトの版と合わせて記録し、承認する。鍵の名前（ラベル）が合っていることや、申請を出した担当者の操作は、この承認にならない。
- **どこで照合するか**: ルートが中間 CA の申請に署名する前と、別の認証局にクロス署名を頼む前。申請の公開鍵が儀式で承認した鍵の記録と結び付かなければ、署名せずに保留する。
- **何が残るか**: どの鍵が、どの装置で、どのスクリプトで作られ、誰の承認で署名に回されたかの記録。あとから、同じ手順で作られた中間 CA を分けて、調べる範囲と失効の範囲を決められる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝ルートが中間 CA の公開鍵に署名する前に、申請の公開鍵を儀式で承認した鍵の記録と照合し、記録に残すこと。検知＝署名され、公開された後に、鍵の弱さや悪用に気づくこと。日付は Mozilla の報告と Bugzilla の記録による（UTC）。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>署名の前に、申請の公開鍵を儀式で承認した鍵の記録と照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>弱く作られた鍵に、ルートとクロス署名が付き<br>誰でも求められる状態で信頼されていた</span></div>
<div class="rx-zone det"><b>検知 · 公開の後に働いた</b>研究者の届け出、ブラウザの遮断、失効</div>
<div class="rx-g g1"><div class="t">2025-04-30</div><b>鍵を作る儀式で、中間 CA の鍵が作られる</b></div>
<div class="rx-g g2"><div class="t">10-17</div><b>研究者が鍵を求め、署名を付けて届け出る</b></div>
<div class="rx-g g3"><div class="t">10-18</div><b>eMudhra が 8 本を失効する</b></div>
<div class="rx-g g4"><div class="t">10-20</div><b>Mozilla と Chrome が、上のルートの信頼を外すとする</b></div>
</div>
</figure>

検知は働いていた。研究者の届け出から 3 時間足らずで Firefox は中間 CA を遮断し、翌日には eMudhra が失効したが、それは鍵が求められる状態で約 1 年半、信頼されていた後である。正規の鍵で付いた署名が、鍵の持ち主の行為として受け入れられた事案に、[Taiko](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（公開のリポジトリに漏れた署名鍵で、偽の出金が有効として通った）と、[DigiCert](https://lemma.frame00.com/ja/critical/briefs/178-digicert-ev-code-signing-issuance-hijack/)（審査済みの注文の証明書を、攻撃者が受け取ったと報告された）がある。

## 4. Lemma でできること

**Lemma は、03 の照合を、ルートが中間 CA の公開鍵に署名する段に組み込む。** 鍵を作る装置の安全性の確認や、公開された鍵の弱さの検査の代わりではなく、その手前で、署名に回された鍵が、儀式で承認した鍵の記録と結び付くかを、署名の前に確認する。

### 注意したい業界・業務

- **業界 · 開発者・エージェント運用**: コード署名や API の署名の鍵を自社で作り、使う組織。鍵を作る手順を変えたとき、意図しない鍵が使われうる。
- **業界 · 調達・サプライチェーン**: 認証局や、別の組織の鍵に署名して信頼を渡すサービス（クロス署名・鍵の登録など）。
- **業務 · 承認・決裁**: 鍵や証明書に署名して、使ってよいと認める段。署名の前に、何に署名するかの出どころを照合する。

### いまの対策と Lemma の違い

今回の経路は、1 列目で弱い鍵に署名が付き、2 列目で、その鍵を求めた者が署名できる状態になった。3 列目は、発覚の後の対応である。

| 対策 | ルートによる中間 CA の公開鍵への署名（クロス署名を含む） | 求められた鍵による、第三者の署名 | 発覚の後の失効と遮断 |
| --- | --- | --- | --- |
| 鍵を作る儀式の手順と年次の監査 | 一部 | 効かない | 関係しない |
| 公開された CA の鍵の、弱さの検査 | 関係しない | 一部 | 一部 |
| 失効とブラウザの遮断（OneCRL・CRLSet・ルートの削除） | 関係しない | 一部 | 効く |
| **Lemma（実行の前の照合）** | 効く | 効かない | 一部 |

儀式の手順は、eMudhra の説明では承認を経た変更のもとで行われたが、誤って作られた鍵が申請に使われ、その後の監査でも見つからなかった。公開された鍵の弱さの検査は、今回、研究者の調査で鍵を見つけたが、Chrome の説明では、それまでの検査は小さな値の楕円曲線の鍵を対象にしておらず、証明書を発行していない中間 CA も対象から外れていた。失効と遮断は、ブラウザでは早く働いたが、Bugzilla の参加者の報告では、失効の情報を見ない端末では、公表の後に第三者が付けた署名が通りうる。Lemma は、申請の公開鍵が儀式で承認した鍵と結び付くかを、署名の前に照合する。鍵がすでに第三者の手にある場合の署名は止めない。鍵を失効させることもしないが、どの鍵がどの手順で作られたかの記録は、調べる範囲と失効の範囲を決めるのに使える。

注：Lemma の照合が働くのは、儀式で承認した鍵の記録（公開鍵の指紋・装置・スクリプトの版）を申請を出す担当者とは別に管理し、ルートの署名とクロス署名の依頼の前に組み込む場合に限る。承認した鍵そのものが弱い場合や、記録が誤った鍵で作られている場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、鍵の弱さや侵入を検出・防止するものではなく、鍵や証明書を失効させるものでもない。

### 点検チェックリスト

署名に使う鍵を作り、使い始める組織で確認する 3 項目

- 鍵を作る手順を変えたとき、変えた手順で作った鍵を、使い始める前に点検する工程があるか。
- 署名に使う鍵ごとに、どの装置で、どの手順で作り、誰の承認で使い始めたかを、後から辿れる記録に残しているか。
- 自社の鍵で付いた署名や、自社の名前で発行された証明書の一覧を、自社が付けた・発行したものと突き合わせる手順があるか。

## 5. 事実と時系列

- **当事者**: eMudhra（インドの認証局。emSign の名前で CA を運用する）。Sectigo も、これらの中間 CA の鍵にクロス署名していた。
- **影響を受けた鍵**: 2025-04-30 に作られた 24 本の中間 CA の鍵のうち、B と C の系列の楕円曲線（P-384）の鍵 8 本。6 本は TLS 用で Chrome・Mozilla・Microsoft・Apple に信頼され、2 本はコード署名用で Microsoft に信頼されていた（Mozilla の報告）。同じ 8 本の鍵に、Sectigo のクロス署名による証明書もあった（研究者の報告）。
- **鍵の弱さ**: Mozilla は、届け出た研究者の方法を知らないまま、自ら鍵を求められたとし、鍵を作る手順に欠陥があり、たやすく悪用できると述べた。署名の仕組みそのものではなく、鍵の作り方の問題だとしている（Mozilla の報告）。
- **eMudhra の説明**: 鍵は Utimaco の HSM の中で作られた。この儀式では、鍵を外へ移すための試しとして、承認を経た手順の変更が入った。スクリプトの誤りで、弱い鍵の組がもう 1 つ作られ、名前が似ていたために、その鍵で申請を作ってルートが署名し、Sectigo にもクロス署名を頼んだ。RSA の鍵は別の経路で作られ、影響は無いとしている。装置そのものの問題ではないとみている。
- **使われ方**: eMudhra は、8 本のうち本番で動いていたのは 1 本だけで、どれからも利用者向けの証明書は発行しておらず、コード署名用の 2 本も使っていなかったとしている。Bugzilla の参加者の報告では、10-20 から 10-21 に、6 本の鍵で署名された約 10 万 7,000 枚の証明書が、第三者によって証明書の公開ログ（CT ログ）に登録された（多くは試しのためのもの）。
- **悪用の証拠**: 届け出の前に鍵が悪用されたかについて、Mozilla の公表は触れていない。BleepingComputer は、悪用の証拠は無いと伝えている（報道）。
- **ほかの兆し**: Mozilla は、同じ 6 本の TLS 用の中間 CA の失効リスト（CRL）が、2025 年 5 月から署名の検証に失敗していた件（Bugzilla 1970728）を挙げた。eMudhra は、失効リストは本来の鍵で署名したが検証に失敗したため、弱い鍵で署名し直したと答えた。

### 時系列

- **2025-04-30**: 鍵を作る儀式で、24 本の中間 CA の鍵が作られる。
- **2026-10-17**: 研究者が、公開された CA の鍵を調べる中で弱い鍵を見つけ、各鍵で署名したものを付けて、Apple・Chrome・Microsoft・Mozilla・eMudhra に届け出る（18:05）。Mozilla は 20:06 に受け取り、22:59 に Firefox の遮断（OneCRL）を終える。eMudhra は 21:29 に受け取りを返す。
- **2026-10-18**: eMudhra が、8 本を鍵の危殆化を理由に失効する（09:24〜09:38）。Mozilla が Bugzilla に記録を立てる。
- **2026-10-19**: Sectigo が、クロス署名の証明書の失効を終える。
- **2026-10-20**: Mozilla が、複数の人が鍵を独自に求めたとして、上のルート（emSign ECC Root CA - G3）の信頼を外すとし、Chrome も同じ方針を示す。eMudhra は、このルートの下での発行を止める。Mozilla が、Firefox 158.0.1 などの更新を出す。
- **2026-10-27**: Chrome の新しいルートの一覧が、安定版に入る予定とされた日。
- **2026-11-02**: eMudhra が、KPMG に独立の調査を頼み、報告の全文を 11-09 までに出すとする。

> 本件の事実は、Mozilla が Bugzilla に立てた記録と、そこでの Mozilla・Chrome・eMudhra・Sectigo・研究者の書き込み、Mozilla のセキュリティのブログ（一次）に拠る。鍵が弱く作られた経緯は eMudhra の説明による。調査は続いている。第三者による証明書の登録は、Bugzilla の参加者の報告である。悪用の証拠が無いとの記述は BleepingComputer の報道で、一次資料には無い。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **eMudhra**: 8 本を失効し、上のルートの下での発行を止めた。約 3 万枚の証明書を、RSA のルートの下の階層へ移すとした（eMudhra によれば 97% が自動の発行の仕組み ACME で発行されたもの）。Bugzilla の参加者が引いた発表では、世界向けの TLS 証明書の事業から退くとしている。
- **Mozilla**: OneCRL で中間 CA を遮断し、Firefox 158.0.1 と ESR の更新、上のルートを外した NSS 3.131.1 を出した。ほかの信頼の一覧の運営者に知らせた。
- **Chrome**: CRLSet で中間 CA を遮断し、上のルートの信頼を外すとした。それまでの弱い鍵の検査が小さな値の楕円曲線の鍵を対象にしていなかったこと、証明書を発行していない中間 CA を検査していなかったことを挙げ、CA の証明書を CCADB に登録する前に、弱い鍵の検査を通す仕組みを提案した。
- **業界の論点**: eMudhra は、鍵が約 18 か月公開され、クロス署名と監査を経ても誰も気づかなかったとして、ほかの確認の仕組みも問うとした。Bugzilla の参加者は、2025 年 5 月の失効リストの問題が最初の兆しだったと指摘した。

## 6. Sources

- **Mozilla ほか（一次・Bugzilla の記録）**: "eMudhra: Private key compromise of Intermediate Certificates"（Mozilla Bugzilla 2083449、2026-10-18〜11-02） — <https://bugzilla.mozilla.org/show_bug.cgi?id=2083449>
- **Mozilla（一次・公表）**: "Protecting Firefox users following the compromise of eMudhra intermediate certificates"（2026-10-20、10-21 更新） — <https://blog.mozilla.org/security/2026/10/20/protecting-firefox-users-following-the-compromise-of-emudhra-intermediate-certificates/>
- **BleepingComputer（報道）**: "Mozilla, Google, Apple block compromised eMudhra CA certificates"（2026-10-20） — <https://www.bleepingcomputer.com/news/security/mozilla-google-apple-block-compromised-emudhra-ca-certificates/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
