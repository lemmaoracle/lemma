---
brief_no: 149
title: "Revolut：乗っ取られたイタリア内務省の実在メールアカウントから届く開示要求に、約5か月応じ続けた(Hudson Rock 調査) — ドメイン認証は通っても、要求者の権限を開示の前に確かめる層が無い"
title_en: "Revolut: For roughly five months it kept answering disclosure requests sent from a real, compromised Italian Ministry of the Interior mailbox (Hudson Rock analysis) — domain authentication passes, but nothing verifies the requester's authority before the data goes out"
pillar: 04-regulatory-attribute
primary_category: kyc-aml-disclosure
secondary_categories: [attribute-proof-bypass, identity-auth]
incident_date: 2026-09-12
published: 2026-09-21
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["032-booking-payout-account-tampering", "126-starling-bank-sanctions-screening-partial-list"]
status: published
version: "1.0"
og_lead_ja: "Revolut：乗っ取られた政府メールからの開示要求に5か月応じ続けた"
og_lead_en: "Revolut answered fake government data requests for five months"
---

## 1. TL;DR

Revolutは2026年9月12日、政府機関の正規メールドメインから届いた第三者の要求に応じ、顧客の本人確認書類(パスポート・運転免許証の写し)、本人確認用の自撮り画像、IBAN、口座明細、取引履歴を提供していたと公表した。調査会社Hudson Rockは9月15日、その送信元はイタリア内務省の実在アカウント(`pec.interno.it`)で、情報窃取型マルウェアで漏れた認証情報から乗っ取られたものであり、要求は約5か月にわたって繰り返し通っていたとする分析を公表した。ドメイン認証は通る。なりすましメールではなく、本物の経路から本当に届いていたからである。**効かなかったのは、顧客データを渡すという後戻りできない行動の前に、要求を書いた人物が今もその権限を持つのかを原本と照合する層である。**

## 2. 何が起きたか

- Revolutは2026年9月12日、第三者への顧客情報の開示を確認・公表した。同社はこれを「洗練された外部からのなりすまし詐欺」と説明している。
- 経路はRevolutのシステムへの侵入や不正ログインではなく、**政府機関の正規のメールドメインから届いた情報開示要求への対応**だった。
- 提供された情報には、氏名・生年月日・住所・メールアドレス・電話番号・職業、パスポートおよび運転免許証の写し、本人確認用の自撮り画像、IBAN、口座開設日、口座明細、出金記録、暗号資産を含む取引履歴が含まれると報じられている。
- Revolutは「Revolut のシステムおよび顧客の資金は影響を受けていない」としており、資金の窃取やコアの銀行システムへの侵入は否定している。
- 影響を受けた顧客数をRevolutは「ごく限られた数」とだけ述べ、具体的な人数・対象国・なりすまされた政府機関の名称を公表していない。

Hudson Rockの分析によれば、一連の経緯は次の流れで成立している。

1. 攻撃者が、イタリア内務省の職員が使うメールアカウント(`pec.interno.it`)の認証情報を手に入れた。Hudson Rockは同ドメインで既に窃取済みの webmail 認証情報を約300件確認しており、攻撃者が職員を自ら感染させたのではなく、**流通している情報窃取型マルウェアのログを購入・利用した**可能性が高いとみている。
2. 攻撃者はその実在アカウントから、Revolutのリトアニア子会社 Revolut Bank UAB に対し、顧客情報の開示を求める要求を送付した。送信元は本物の政府メール基盤なので、ドメイン認証は正規のものとして通過した。
3. Revolutはこれを規制・法執行上の適法な開示要求として処理し、求められた顧客データを提供した。要求は1回で終わらず、**約5か月にわたって繰り返し送られ、そのつど通った**。
4. Hudson Rockによれば、攻撃者が誤った書類を送ってしまった場面では、Revolutのサポートがその訂正方法を案内したとされる。詐欺として扱われていない。
5. Revolutは後にこの要求が正規のものではないと把握し、当該メールアドレスを遮断して、なりすまされた政府機関・法執行機関・データ保護当局および金融規制当局に連絡した。

## 3. 時系列 — 公表と対応

- 最初の開示要求が送付された正確な日付は、本Brief執筆時点で公表されていない。Hudson Rockは「約5か月前」と述べている。
- 2026-09-12:Revolutが本件を公式に確認・公表した。
- 2026-09-15:Hudson Rockが、送信元は`pec.interno.it`(イタリア内務省)の実在アカウントであり、情報窃取型マルウェアのログ経由で侵害されたとする分析を公表した。
- 2026-09-17:'IAmNotAVillain'を名乗る人物がRevolutに300万ドルを公然と要求したことが報じられた。Revolutは「この主張を行っている個人または集団から、直接の連絡や要求は受けていない」としている。イタリア警察が捜査を開始した。

> なりすまされた機関をイタリア内務省とするのは**Hudson Rockの分析**であり、Revolut自身は機関名も対象国も公表していない。被害人数についても、Revolutは「ごく限られた数」と述べるのみで、報じられている「約680人(暗号資産の大口保有者とされる)」はHudson Rockの調査および報道側の理解によるもので、Revolutは確認していない。本Briefではこれらを、出所を明示した上での未確認情報として扱う。

公表後の対応と業界の動きは次のとおり。

- Revolutは詐欺に使われたメールアドレスを遮断し、影響を受けた顧客に直接連絡した。
- Revolutは、なりすまされた政府機関、法執行機関、データ保護当局および金融規制当局に連絡した。
- イタリア警察が捜査を開始した。
- Revolutは、自社のアプリやコアの銀行インフラへの侵入はなく、顧客の資金にも影響がないとしている。

## 4. なぜ止まらなかったか

この事案の失敗は、なりすましメールが巧妙だったことでも、Revolutの技術的な防御が甘かったことでもない。**要求は偽装ですらなかった**。本物の政府メール基盤から、本物のアカウントで、本当に送られてきている。SPF・DKIM・DMARCの類いはすべて正しく通る。失敗は、その正しさが「送信の経路が本物である」ことしか語らないのに、**開示の判断がそこに寄りかかっていた**ことにある。

金融機関は、KYC/AMLの規制枠組みのもとで、政府機関・捜査機関からの適法な情報開示要求に応じる義務を負っている。この義務は変わらない。欠けていたのは、届いた個々の要求について「これを書いた人物が、その機関の職員であり、かつこの顧客のこの種類のデータを求める権限を今も持っているか」を、要求の見た目ではなく発行元の記録と照合する手段が、開示の経路に組み込まれていなかった点である。

検出は効かなかった。5か月のあいだ要求は通り続け、誤送信された書類の訂正をサポートが手伝う場面まであった。人が見て怪しむための材料が、経路のどこにも置かれていなかったということである。最終的に遮断と当局への連絡には至ったが、それは顧客データが渡り終えたあとだった。

正規のプラットフォーム内で受領口座の情報が書き換えられた [Brief 032](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/) と同じく、見た目が正規であることは行動の許可を出してよいことの証明にはならない、という型をこの事案は開示という行動で示している。同じKYC/AML開示のカテゴリでは [Brief 126](https://lemma.frame00.com/ja/critical/briefs/126-starling-bank-sanctions-screening-partial-list/) が制裁リスト照合の不完全さを扱ったが、今回はリストの網羅性ではなく、要求そのものが名乗る権限を照合する層が無かった点が異なる。

> "Revolut recently identified a sophisticated external impersonation scam where an unauthorised third party utilised a legitimate government agency domain email to submit fraudulent requests for information."(Revolutは最近、第三者が政府機関の正規ドメインのメールを使って不正な情報開示要求を送るという、洗練された外部からのなりすまし詐欺を確認した)——Revolut

## 5. 証明があれば、何が変わるか

政府機関からの適法な情報開示要求に応じること自体は金融機関の規制上の義務であり、なくすことはできない。事前証明が経路に一段挟まるとすれば、それは「開示するかどうか」の判断ではなく、「この要求者が、今も名乗る権限を保持しているか」を原本と照合する一段である。メールアカウントが乗っ取られていても、権限の証明までは一緒に盗めない。

Lemmaがこの落差に対して提示する設計は次の通りである。

- **要求元の権限を属性証明として検証する**:送信ドメインの見た目や認証結果ではなく、要求者が主張する機関・役職・権限そのものを、発行元の記録と照合できる証明として検証する。メールアカウントの支配は、権限の保持を意味しない。
- **証明にスコープと有効期限を持たせる**:証明が答える範囲(どの顧客の、どの種類のデータについての要求か)と有効な期間を証明自体に束縛し、一度通った経路が5か月にわたる万能の鍵にならないようにする。
- **開示の判断と権限の検証を分離する**:開示担当者の目視確認だけに権限判定を委ねず、証明の検証を情報開示フローの必須ステップとして組み込む。

担わないものも、あわせて書いておく。

- 職員の端末が情報窃取型マルウェアに感染することを防ぐものではない。端末の防御と認証情報の衛生は引き続き必要である。
- 適法な政府機関からの情報開示要求に応じる義務を無くすものではない。証明があっても、正当な要求には応じる必要がある。
- すでに提供されてしまったデータを回収するものではない。

検出の層と、この層は代替ではなく補完の関係にある。前者は侵害されたアカウントや不審な要求を事後に察知する。後者は、顧客データの開示という後戻りのできない行動を起こす前に、要求者の権限を独立に確かめられるようにする。

## 6. Sources

- **Revolut(一次・企業公式声明、TechCrunch経由で引用)**: “Revolut confirms customer data breach through fake government requests”(2026-09-12)— <https://techcrunch.com/2026/09/12/revolut-confirms-customer-data-breach-through-fake-government-requests/>
- **Hudson Rock(一次・調査元の公表)**: “Revolut Hackers Used Infostealers for Elaborate Social Engineering”(2026-09-15)— <https://www.infostealers.com/article/revolut-hackers-used-infostealers-for-elaborate-social-engineering/>
- **SecurityWeek(独立報道・続報)**: “Revolut Data Breach: 5 Months, 680 High-Profile Accounts, $3M Ransom”(2026-09-17)— <https://www.securityweek.com/revolut-data-breach-5-months-680-high-profile-accounts-3m-ransom/>
- **SecurityWeek(独立報道)**: “Personal, Financial Info Exposed in Revolut Data Breach”(2026-09-14)— <https://www.securityweek.com/personal-financial-info-exposed-in-revolut-data-breach/>
- **Infosecurity Magazine(独立報道)**: “Revolut Confirms Data Breach Through Fake Government Requests”(2026-09-14)— <https://www.infosecurity-magazine.com/news/revolut-data-breach-fake-government/>
- **BankInfoSecurity(独立報道)**: “Revolut Reveals Data Breach Tied to Faked Official Request”(2026-09-14)— <https://www.bankinfosecurity.com/revolut-reveals-data-breach-tied-to-faked-official-request-a-32808>
- **Malwarebytes(独立解説)**: “Revolut gave customer IDs and financial data to a government impostor”(2026-09-14)— <https://www.malwarebytes.com/blog/news/2026/09/revolut-gave-customer-ids-and-financial-data-to-a-government-impostor>

なりすまされた機関の名称・対象国、被害人数、最初の開示要求が送付された正確な日付は、本Brief執筆時点でRevolutから公表されていません。イタリア内務省の実在アカウントが使われたとする点、および「約680人」という人数は、Hudson Rockの調査と報道側の理解によるもので、Revolut自身は確認していません。本文ではこれらを、出所を明示した上での未確認情報として扱っています。

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

参照:検出と証明の違いについては[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。設計の位置づけは[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/#attribute)。
