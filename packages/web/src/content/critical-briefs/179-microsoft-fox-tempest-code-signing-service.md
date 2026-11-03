---
brief_no: 179
title: "Fox Tempest：偽の身元で Microsoft の署名サービスの資格を得て、マルウェアに署名するサービスを売っていた(Microsoft の公表)"
title_en: "Fox Tempest: Using fake identities to obtain access to Microsoft's signing service, it sold signatures for malware (Microsoft disclosure)"
pillar: 01-verifiable-origin
primary_category: code-provenance
secondary_categories: [identity-auth, attribute-proof-bypass]
incident_date: 2026-05-19
published: 2026-11-03
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["178-digicert-ev-code-signing-issuance-hijack", "082-xz-utils-backdoor-identity-provenance", "022-onlyfake-ai-id-kyc-bypass"]
status: draft
version: "1.0"
og_lead_ja: "Microsoft、Fox Tempest を提訴。偽の身元で Artifact Signing の資格を得て、マルウェアに署名するサービスを売っていたと公表"
og_lead_en: "Microsoft sues Fox Tempest, saying it used fake identities to get Artifact Signing access and sold malware signing as a service"
layout: "report"
sections: "proof"
gate: "signing"
og_kicker_ja: "サイバー犯罪事例 · 署名の悪用"
og_kicker_en: "CYBERCRIME · CODE SIGNING ABUSE"
og_headline_ja: "偽の身元で、\n署名の資格を得たと\nMicrosoft が公表。\n<accent>証明書 1,000 枚超</accent>"
og_headline_en: "Fake identities got\ncode-signing access,\nsays Microsoft.\n<accent>1,000+ certificates</accent>"
key_figures:
  - value: "1,000"
    unit: "枚超"
    label: "Fox Tempest が作り、Microsoft が失効させたコード署名の証明書（Microsoft）"
    tone: "alert"
  - value: "72"
    unit: "時間"
    label: "作られた証明書が有効だった期間（Microsoft）"
  - value: "2025-05 → 2026-05"
    label: "サービスが提供されていたとされる期間と、Microsoft が止めた月（Microsoft）"
glossary:
  - term: "コード署名"
    desc: "ソフトウェアに、作った組織の名前と結び付いた電子署名を付けること。OS やセキュリティ製品は、有効な署名のあるファイルを信頼の手がかりにする。"
  - term: "Artifact Signing"
    desc: "Microsoft のコード署名のサービス（旧名 Azure Trusted Signing）。申し込んだ人や組織の身元の確認を経て、Microsoft が発行する証明書で署名できる。"
  - term: "Fox Tempest"
    desc: "Microsoft が、この署名サービスを運営していた集団に付けた呼び名。"
insight:
  slug: "signing-access-by-fake-identity"
  label: "偽の身元で得た、正規の署名の資格"
  quote: "署名の鍵が盗まれていなくても、資格を渡す段で申込者の身元を照合しなければ、偽の身元で得た資格の署名も、正規の署名として通る。"
industries: ["developers"]
operations: ["account-admin", "delivery"]
controls:
  - slug: "ownership-check"
    item: "署名の資格を申し込んだ人が、名乗る組織の本人で、その組織から権限を受けたかを確認する"
  - slug: "limit-and-revoke"
    item: "署名の資格は短い期限で渡し、不正と分かった証明書は失効させる"
  - slug: "audit-trail"
    item: "どの申込みを、誰の承認と何の属性で照合して資格を渡したかを記録する"
attack_method: "impersonation"
impact: "偽の身元で得た資格で、コード署名の証明書 1,000 枚超が作られ、ランサムウェアの集団などのマルウェアに署名されたと Microsoft が公表"
takeaway: "Microsoft によれば、鍵を盗まずに、偽の身元で正規の署名の資格を得ていた。資格を渡す前に、申込者が名乗る組織の本人かを照合する。"
self_check: "署名や公開の資格を渡す前に、申込者が名乗る組織の本人かを、提出された書類とは別に照合しているか。"
countries: ["global"]
search_title: "Fox Tempest のマルウェア署名サービス：経緯と対策"
search_description: "Fox Tempest が偽の身元で Microsoft の署名サービスの資格を得て、マルウェアに署名して売っていた（Microsoft の公表）。何が起きたか、なぜ署名で見分けられないか、対策を整理。"
---

## 1. 要点

Microsoft によれば、Fox Tempest は署名の鍵を盗んだのではなく、偽の身元と正規の組織へのなりすましで、Microsoft の署名サービスの正規の資格を得ていた。その資格で作った証明書で、顧客が持ち込んだマルウェアに署名し、署名済みのマルウェアは正規のソフトウェアを装って配られた。顧客には、ランサムウェアを使う集団が含まれていたと Microsoft はしている。<strong>署名の鍵が盗まれていなくても、資格を渡す段で申込者の身元を照合しなければ、偽の身元で得た資格の署名も、正規の署名として通る。</strong>

## 2. 通った操作

- **通った操作**: Artifact Signing の身元の確認を経た、コード署名の資格の発行。Microsoft によれば、Fox Tempest は偽の身元と正規の組織へのなりすましで数百の Microsoft アカウントと Azure のテナントを作り、1,000 枚を超える証明書を作った。身元の確認を通すのに、米国とカナダの盗まれた身元を使った可能性が非常に高い、というのが Microsoft の見立てである。
- **その後に通った操作**: 顧客が持ち込んだマルウェアへの署名。署名済みのファイルは、偽の Microsoft Teams のダウンロードのページなどで配られた（Microsoft）。
- **受け付けた側に届くもの**: 一般に、署名済みのファイルを受け取る側に届くのは、有効な署名と、証明書に書かれた名前である。署名が有効なら、その証明書の資格で署名されたことは分かるが、資格を得た人が名乗った組織の本人だったかは、署名からは分からない。
- **公表されていないこと**: 身元の確認のどの段がどう通されたか。感染した組織の数と名前。訴訟の被告の名前と請求の中身（Microsoft のブログには書かれていない）。

## 3. 何を照合するか

経路を問わず区別できる条件は、署名の資格を発行する側が、申込者が名乗る組織の本人で、その組織から署名の権限を受けたかを、提出された書類とは別に、資格を渡す前に照合することである。受け取る側は、署名が有効かだけでなく、署名した者がそのソフトの発行元として登録した組織かを、実行の前に照合する。

- **誰が承認を出すか**: 名乗られた組織。登録済みの連絡先（申込みに書かれた連絡先ではない）で、署名の資格の申込みを承認する。個人の身元は、発行元が署名付きで出した属性で示し、申込者が自分で名乗る形では出さない。
- **どこで照合するか**: 署名の資格を渡す手前（発行する側）と、署名済みのソフトを社内で実行・配布する手前（受け取る側）。受け取る側は、署名者の名前が、そのソフトの発行元として登録した名前と一致するかを照合し、一致しなければ実行しない。
- **何が残るか**: どの申込みを、誰の承認と何の属性で照合して資格を渡したかの記録。同じ身元や同じ組織の名前で、多くのアカウントや証明書が作られていないかを後から辿れる形で残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝署名の資格を渡す前に、申込者が名乗る組織の本人かを照合し、記録に残すこと。検知＝不正な証明書や、署名済みのマルウェアを後から見つけ、証明書を失効させること。下の日付は Microsoft の公表と報道に拠る。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>資格を渡す前に、申込者が名乗る組織の本人かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>偽の身元で数百のアカウントが作られた<br>証明書 1,000 枚超がマルウェアの署名に使われた</span></div>
<div class="rx-zone det"><b>検知 · 署名の後に働いた</b>不正な証明書を見つけて失効させ、サービスを止める</div>
<div class="rx-g g1"><div class="t">2025-05</div><b>サービスの提供が始まる（少なくともこの月から）</b></div>
<div class="rx-g g2"><div class="t">2025-10</div><b>偽の Teams の署名に使われた証明書 200 枚超を失効（報道）</b></div>
<div class="rx-g g3"><div class="t">2026-02</div><b>運営者が第三者の仮想マシンへ移る</b></div>
<div class="rx-g g4"><div class="t">2026-05-19</div><b>Microsoft が訴訟を公にし、サイトを差し押さえる</b></div>
</div>
</figure>

Microsoft は不正な証明書を見つけて失効させていたが、失効は署名の後で、運営者はアカウントや基盤を移して続けた（Microsoft）。署名の証明書が正規の手続きの段で渡った事案に、[DigiCert](https://lemma.frame00.com/ja/critical/briefs/178-digicert-ev-code-signing-issuance-hijack/)（審査を通った注文の証明書を、サポートの画面から攻撃者が受け取った）がある。有効な署名の持ち主の照合では [xz utils](https://lemma.frame00.com/ja/critical/briefs/082-xz-utils-backdoor-identity-provenance/)、偽の身元で本人確認を通った型では [OnlyFake](https://lemma.frame00.com/ja/critical/briefs/022-onlyfake-ai-id-kyc-bypass/) が近い。

## 4. Lemma でできること

**Lemma は、03 の照合を、署名の資格を渡す側と、署名済みのソフトを受け入れる側に組み込む。** マルウェアを見つけるのではなく、資格の申込みが名乗る組織の承認と発行元の署名付きの属性で照合できたものか、署名者が登録した発行元と一致するかを、実行の前に確認する。

### 注意したい業界・業務

- **業界 · 開発者・OSS**: コード署名の証明書や、パッケージ・アプリの公開の資格を発行するサービス。資格を得た者の署名は、受け取る側で正規の発行元の印として扱われる。
- **業務 · アカウント・権限の管理**: 署名や公開の資格を持つアカウントの作成と発行。同じ身元や組織の名前で、アカウントが多く作られうる。
- **業務 · 配信・配布**: 社内で入れるソフトの受け入れと配布。署名が有効かどうかで、実行してよいかを決めている組織。

### いまの対策と Lemma の違い

今回の経路は 1 列目（署名の資格の発行）である。2 列目は署名済みのファイルを受け取る側、3 列目は不正と分かった後の証明書の扱いで、今回の経路の後の段にあたる。

| 対策 | 署名の資格の発行（申込者の身元） | 署名済みのファイルを実行・配布する前 | 不正と分かった後の証明書 |
| --- | --- | --- | --- |
| 署名サービスの申込者の身元の確認（Artifact Signing） | 一部 | 関係しない | 関係しない |
| 証明書の失効（Microsoft が 1,000 枚超を失効） | 関係しない | 一部 | 効く |
| 端末のマルウェア対策（Defender の検知・SmartScreen など、Microsoft の推奨） | 関係しない | 一部 | 関係しない |
| **Lemma（実行の前の照合）** | 一部 | 一部 | 関係しない |

身元の確認は、偽の身元や盗まれた身元で通りうることを、Microsoft の公表が示している（盗まれた身元を使ったというのは Microsoft の見立て）。証明書の失効は、不正と分かった後には効くが、失効の前に署名されて配られたファイルには間に合わない場合がある。端末のマルウェア対策は、マルウェアとして見分けられれば止めるが、署名が有効なファイルは信頼の手がかりを持って届く。Lemma は、資格の申込みを名乗る組織の承認と照合し、受け入れる側では署名者を登録した発行元と照合する。

注：Lemma の照合が働くのは、署名の資格を発行する手続きに照合を組み込み、名乗られる組織の登録済みの連絡先や、発行元の署名付きの属性が、申込みとは別に管理されている場合に限る。盗まれた本物の身元や本物のクレデンシャルが使われた場合や、組織の登録済みの連絡先そのものが乗っ取られている場合は、この照合を通りうる。受け入れる側の照合は、そのソフトの発行元を登録している場合にだけ働く。Lemma は、証明書を失効させたり、マルウェアを消したりはしない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

署名と、署名済みのソフトについて、組織で確認する 3 項目

- 署名の資格を渡した後も、同じ身元や同じ組織の名前で、多くのアカウントや証明書が作られていないかを確認しているか。
- 社内で入れるソフトの署名者が、そのソフトの発行元として登録した名前と一致するかを、実行の前に確認しているか。
- 証明書が失効したとき、その証明書で署名されたファイルを社内で止める手順があるか。

## 5. 事実と時系列

- **サービス**: Fox Tempest（Microsoft の呼び名）が、少なくとも 2025 年 5 月から、マルウェアに署名するサービスを提供していた。顧客がマルウェアを持ち込むと、Artifact Signing に結び付いたものを含む正規のコード署名の資格で署名した（Microsoft）。
- **資格の得方**: 偽の身元と正規の組織へのなりすましで、数百の Microsoft アカウントを作った。数百の Azure のテナントとサブスクリプションも使った。Artifact Signing の身元の確認を通すのに、米国とカナダの盗まれた身元を使った可能性が非常に高いと Microsoft は見ている。
- **証明書**: Fox Tempest は 1,000 枚を超える証明書を作り、Microsoft は Fox Tempest に結び付く 1,000 枚を超える証明書を失効させた。証明書は 72 時間だけ有効だった（Microsoft）。
- **料金**: 顧客は数千ドルを払い、高い額ほど早く使えた。Microsoft の技術の解説の本文では 5,000・7,500・9,000 ドルの 3 つの額とされている（図の注記の額とは違う）。Microsoft は、収益が数百万にのぼるとしている。
- **顧客**: Vanilla Tempest が、Oyster、Lumma Stealer、Vidar と、ランサムウェアの Rhysida を配るのに使った。Microsoft の調査は、INC、Qilin、Akira などのランサムウェアとも Fox Tempest を結び付けている（Microsoft）。
- **配り方**: 署名済みのマルウェアは、検索の操作と悪意のある広告で配られ、AI がこうした手口を磨くのに使われた。偽の Microsoft Teams のダウンロードのページも使われた（Microsoft）。
- **影響**: 数千台の機器が感染し、世界の組織のネットワークが侵害された（Microsoft）。
- **2025 年 10 月の失効**: Microsoft は 2025 年 10 月上旬、Vanilla Tempest の偽の Teams のインストーラーの署名に使われた証明書 200 枚超を失効させた。Trusted Signing のほか、SSL.com・DigiCert・GlobalSign の証明書も使われていた（報道）。

### 時系列

- **2025-05**: Fox Tempest のサービスの提供が始まる（少なくともこの月から・Microsoft）。
- **2025-06**: Vanilla Tempest がサービスを使い始める（Microsoft）。
- **2025-09**: Microsoft が Fox Tempest の追跡を始める（Microsoft）。
- **2025-10**: Microsoft が、偽の Teams のインストーラーの署名に使われた証明書 200 枚超を失効させる（報道）。
- **2026-02**: アカウントの停止と証明書の失効を受けて、運営者が第三者が提供する仮想マシンへ移る。その後、顧客を別のコード署名のサービスへ移そうとした（Microsoft）。
- **2026-05-19**: Microsoft が、ニューヨーク南部地区の連邦地裁での訴訟を公にし、サイト signspace[.]cloud を差し押さえ、運営に使われた数百の仮想マシンを止める（Microsoft）。

> 本件の事実は、Microsoft の公表（Digital Crimes Unit のブログと、Microsoft Threat Intelligence の解説）に拠る。Fox Tempest の行為と顧客との結び付きは、Microsoft の調査と訴訟での主張で、裁判所が認定したものではない。訴訟は Fox Tempest の基盤を対象にし、Vanilla Tempest を共謀者に挙げている（Microsoft）。被告の名前、請求の中身、裁判所の命令の日付は、ブログには書かれていない。盗まれた身元を使ったというのは Microsoft の見立てである。2025 年 10 月の失効は報道に拠り、その証明書を Microsoft が Fox Tempest の 1,000 枚超に数えているかは公表されていない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Microsoft**: 不正なアカウントを消し、身元の確認を強め、この種の資格が使い回されないように制限したとしている。運営者が移った先の基盤について、Cloudzy と協力している。Resecurity、Europol の欧州サイバー犯罪センター（EC3）、FBI と協力した。
- **Microsoft の推奨**: クラウドからの保護、Defender for Office 365 の Safe Links と Safe Attachments、SmartScreen に対応したブラウザー、改ざん防止、攻撃面の縮小のルールを有効にすること。

## 6. Sources

- **Microsoft On the Issues（一次・当事者）**: "Disrupting Fox Tempest: A cybercrime service that turned 'verified' software into a pathway for ransomware"（Steven Masada、2026-05-19） — <https://blogs.microsoft.com/on-the-issues/2026/05/19/disrupting-fox-tempest-a-cybercrime-service/>
- **Microsoft Security Blog（一次・Microsoft Threat Intelligence）**: "Exposing Fox Tempest: A malware-signing service operation"（2026-05-19） — <https://www.microsoft.com/en-us/security/blog/2026/05/19/exposing-fox-tempest-a-malware-signing-service-operation/>
- **CSO Online（報道）**: "Microsoft disrupts malware code-signing service used by ransomware gangs"（2026-05-19） — <https://www.csoonline.com/article/4173417/microsoft-disrupts-malware-code-signing-service-used-by-ransomware-gangs.html>
- **SecurityWeek（報道）**: "Microsoft Revokes Over 200 Certificates to Disrupt Ransomware Campaign"（2025-10-16） — <https://www.securityweek.com/microsoft-revokes-over-200-certificates-to-disrupt-ransomware-campaign/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
