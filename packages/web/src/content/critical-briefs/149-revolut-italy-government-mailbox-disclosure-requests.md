---
brief_no: 149
title: "Revolut：イタリア政府の認証メール網から届いた開示要求に応じ、数か月にわたり顧客データを渡し続けた(PEC・伊検察が捜査中) — 国が配達を証明しても、要求者の権限を開示の前に確かめる層が無い"
title_en: "Revolut: It kept handing over customer data for months, answering disclosure requests that arrived through Italy's state-certified email network (PEC; Italian prosecutors investigating) — the state certifies delivery, but nothing verifies the requester's authority before the data goes out"
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
og_lead_ja: "Revolut：伊政府の認証メール網からの開示要求に数か月応じ続けた"
og_lead_en: "Revolut answered data requests from Italy's certified state email"
---

## 1. TL;DR

Revolutは2026年9月12日、顧客情報を第三者に開示していたことを認めた。要求が届いた経路は、イタリアが国として運営する認証メール網**PEC**(Posta Elettronica Certificata)——書留郵便に相当する法的な配達証明を持つ公式チャネルである。内務省の`pec.interno.it`アドレスから、数か月にわたって開示要求が繰り返し届き、そのつど通った。国が配達を証明しているのだから、経路の正しさは疑いようがない。**効かなかったのは、顧客データを渡すという後戻りできない行動の前に、要求を書いた人物が今もその権限を持つのかを独立に確かめる層である。**

## 2. 何が起きたか

- Revolutは2026年9月12日、顧客情報を第三者に開示していたことを認め、「洗練された外部からのなりすまし詐欺」と説明した。
- 経路はRevolutのシステムへの侵入や不正ログインではなく、**イタリアの国営認証メール網PECの、内務省ドメイン(`pec.interno.it`)から届いた情報開示要求への対応**だった。PECは当局・企業・市民が公式文書や法的文書を送るために使う、政府機関の監督下にある網で、書留郵便のデジタル版にあたる。
- 影響を受けた顧客に送られた通知メール(報道各社が確認)によれば、開示されたのは氏名・生年月日・住所・メールアドレス・電話番号・職業と、パスポートおよび運転免許証の写し。本人確認用の自撮り画像、口座明細、取引履歴も含まれた可能性があるとされる。IBAN・口座開設日・出金記録・暗号資産のウォレット参照番号は、調査者ZachXBTの公表と一部報道が挙げている。
- Revolutは通知メールで「生体認証の顔テレメトリは関与も侵害もしていない」と明示している。また「Revolut のシステムおよび顧客の資金は影響を受けていない」として、資金の窃取やコアの銀行システムへの侵入は否定している。
- 影響を受けた顧客数をRevolutは「ごく限られた数」とだけ述べ、具体的な人数・対象国・なりすまされた機関の名称を公表していない。

調査チームDuelが攻撃者から聞き取り、Hudson Rockが公表した内容によれば、一連の経緯は次の流れで成立している。

1. 攻撃者が、イタリア内務省のドメイン(`pec.interno.it`)で使われているメールアカウントの認証情報を手に入れた。攻撃者は当初「自分で感染させた」と説明したが、Hudson Rockはこれを否定し、同ドメインで既に窃取済みのwebmail認証情報を約300件確認した上で、**流通している情報窃取型マルウェアのログを購入・利用した**可能性が高いとしている。
2. 攻撃者は偽の裁判所命令も試したがRevolutには通らないと判断し、標的をRevolutのリトアニア子会社 Revolut Bank UAB に定めた。同社には**欧州捜査令状(European Investigation Order)に応じる法的義務がある**——回避するのではなく、義務そのものを狙ったことになる。
3. その実在アカウントから開示要求を送ると、PECの配達証明が付いたまま届く。Revolutはこれを適法な開示要求として処理し、顧客データを提供した。要求は1回で終わらず、数か月にわたって繰り返し送られ、そのつど通ったと攻撃者は述べている。
4. 攻撃者が誤った書類を送ってしまった場面では、Revolutのサポートがその訂正方法を案内したとされる(攻撃者の主張)。詐欺として扱われていない。
5. Revolutは後にこの要求が正規のものではないと把握し、当該メールアドレスを遮断して、なりすまされた機関・法執行機関・データ保護当局および金融規制当局に連絡した。

## 3. 時系列 — 公表と対応

- 2026-09-11: Revolutが、影響を受けた顧客に通知メールを送付した。
- 2026-09-12: 調査者ZachXBTがその通知メールをTelegramで公開し、本件が外部に出た。同日Revolutが報道各社への声明で事実関係を認めた。
- 2026-09-15: Hudson Rockが、Duelの聞き取りと自社の分析を公表した。送信元ドメインを`pec.interno.it`と特定し、同ドメインの窃取済み認証情報を約300件確認したとしている。
- 2026-09-16: Financial Timesが攻撃者への取材を報じた。イタリア当局は捜査が進行中であることを認めた。同日、'IAmNotAVillain'を名乗る人物が6,000 XMR(約300万ドル)を24時間の期限付きで公然と要求し、応じなければデータを他の犯罪集団へ売却すると述べた。
- 2026-09-17: レッジョ・カラブリア検察庁が立件し、反マフィア・反テロ国家総局も本件に関与していることが報じられた。

> 出所の限定について。**侵害されたのが内務省本体の端末か、レッジョ・カラブリア県庁の端末かは、伊捜査当局も本Brief執筆時点で確定していない**(県庁は内務省の地方出先機関で、いずれも`pec.interno.it`を使う)。アカウントが乗っ取られたのか複製されたのかも捜査中である。期間についても確定していない——攻撃者はDuelには「約5か月」、Financial Timesには「2か月ほど前から」、別の連絡では「6か月」と述べており一致しない。本Briefが「数か月」と書くのはこのためである。人数「約680人」とその性格づけ(オンチェーン分析で選別した暗号資産の大口保有者)は**攻撃者自身がFinancial Timesに語った主張**であり、Revolutは人数を公表していない。対象はスイスとフランスが中心で、他31か国に及ぶとされる。

公表後の対応と業界の動きは次のとおり。

- Revolutは詐欺に使われたメールアドレスを遮断し、影響を受けた顧客に直接連絡した上で、なりすまされた機関・法執行機関・データ保護当局および金融規制当局に連絡した。
- イタリアの郵便警察・国家警察・内務省・サイバーセキュリティ庁はコメントを拒否したが、当局者は捜査が進行中であることを認めた。イタリアのデータ保護当局も直ちに確認を開始した。
- Revolutは、身代金の要求について「この主張を行っている個人または集団から、直接の連絡や要求は受けていない」としている。
- 攻撃者は別の連絡で、イタリアの法執行機関から147GBを超えるデータを窃取したとも主張している(未確認)。

## 4. なぜ止まらなかったか

この事案の失敗は、なりすましメールが巧妙だったことでも、Revolutの技術的な防御が甘かったことでもない。**要求は偽装ですらなかった。** イタリアが国として運営し法的な証拠能力を与えている認証メール網から、内務省の実在アドレスで、本当に届いている。**失敗は、国が配達を証明しているという事実の上に、開示してよいという判断が乗ってしまい、要求者が今もその権限を持つのかを独立に確かめる層が経路のどこにも無かったことにある。**

PECが証明するのは、そのメールがいつ、どのアドレスから、誰に届いたかである。書いた人物がその機関の職員であること、まして特定の顧客の特定の種類のデータを求める権限を今も持っていることは、証明の範囲の外にある。攻撃者が狙ったのもそこだった。偽の裁判所命令が通らないと見るや、欧州捜査令状に応じる義務を負うリトアニア法人に標的を移している——義務を回避したのではなく、義務そのものを入口にした。

検出は、数か月遅れて効いた。Revolutは最終的に要求が正規のものではないと把握し、メールアドレスを遮断して当局へ連絡している。だがその間、要求は通り続け、誤送信された書類の訂正をサポートが手伝う場面まであったとされる。効かなかったのはその手前——人が見て怪しむための材料が、開示の経路のどこにも置かれていなかったことである。

正規のプラットフォーム内で受領口座の情報が書き換えられた [Brief 032](https://lemma.frame00.com/ja/critical/briefs/032-booking-payout-account-tampering/) と同じく、見た目が正規であることは行動の許可を出してよいことの証明にはならない、という型をこの事案は開示という行動で示している。同じく銀行の開示判断を扱った [Brief 126](https://lemma.frame00.com/ja/critical/briefs/126-starling-bank-sanctions-screening-partial-list/) は制裁リスト照合の不完全さが論点だったが、今回はリストの網羅性ではなく、要求そのものが名乗る権限を照合する層が無かった点が異なる。

> 「本件は、正規の権限による要求になりすますために、**公式な、国が規制する法的通信チャネル**が不正に悪用されたものである。」——Revolut

## 5. 証明があれば、何が変わるか

政府機関からの適法な情報開示要求に応じること自体は金融機関の規制上の義務であり、なくすことはできない。攻撃者はその義務を入口として選んでいる。事前証明が経路に一段挟まるとすれば、それは「開示するかどうか」の判断ではなく、「この要求者が、今も名乗る権限を保持しているか」を発行元の記録と照合する一段である。メールアカウントが乗っ取られても、権限の証明までは一緒に盗めない。

Lemmaがこの落差に対して提示する設計は次の通りである。

- **要求元の権限を属性証明として検証する**: 配達の証明ではなく、要求者が主張する機関・役職・権限そのものを、発行元の記録と照合できる証明として検証する。メールアカウントの支配は、権限の保持を意味しない。
- **証明にスコープと有効期限を持たせる**: 証明が答える範囲(どの顧客の、どの種類のデータについての要求か)と有効な期間を証明自体に束縛し、一度通った経路が数か月にわたる万能の鍵にならないようにする。
- **開示の判断と権限の検証を分離する**: 開示担当者の目視確認だけに権限判定を委ねず、証明の検証を情報開示フローの必須ステップとして組み込む。

担わないものも、あわせて書いておく。

- 職員の端末が情報窃取型マルウェアに感染することを防ぐものではない。端末の防御と認証情報の衛生は引き続き必要である。
- 適法な政府機関からの情報開示要求に応じる義務を無くすものではない。証明があっても、正当な要求には応じる必要がある。
- すでに提供されてしまったデータを回収するものではない。

検出の層と、この層は代替ではなく補完の関係にある。前者は侵害されたアカウントや不審な要求を事後に察知する。後者は、顧客データの開示という後戻りのできない行動を起こす前に、要求者の権限を独立に確かめられるようにする。

## 6. Sources

- **Revolut(一次・企業公式声明、TechCrunch経由で引用)**: "Revolut confirms customer data breach through fake government requests" (2026-09-12) — <https://techcrunch.com/2026/09/12/revolut-confirms-customer-data-breach-through-fake-government-requests/>
- **Financial Times(一次・攻撃者への取材、Irish Times転載)**: "Hackers say they breached Italian state email to target Revolut 'crypto whales'" (2026-09-16) — <https://www.irishtimes.com/business/2026/09/16/hackers-say-they-breached-italian-state-email-to-target-revolut-crypto-whales/>
- **Duel / Hudson Rock(攻撃者への聞き取りと分析、InfoStealers掲載)**: "Revolut Hackers Used Infostealers for Elaborate Social Engineering" (2026-09-15) — <https://www.infostealers.com/article/revolut-hackers-used-infostealers-for-elaborate-social-engineering/>
- **Euronews(独立報道・伊捜査の状況)**: "Revolut hack: Criminals steal data of 700 European clients, demand $3m ransom" (2026-09-17) — <https://www.euronews.com/business/2026/09/17/revolut-hack-criminals-steal-data-of-700-european-clients-demand-3m-ransom>
- **SecurityWeek(独立報道・続報)**: "Revolut Data Breach: 5 Months, 680 High-Profile Accounts, $3M Ransom" (2026-09-17) — <https://www.securityweek.com/revolut-data-breach-5-months-680-high-profile-accounts-3m-ransom/>
- **SecurityWeek(独立報道)**: "Personal, Financial Info Exposed in Revolut Data Breach" (2026-09-14) — <https://www.securityweek.com/personal-financial-info-exposed-in-revolut-data-breach/>
- **Infosecurity Magazine(独立報道)**: "Revolut Confirms Data Breach Through Fake Government Requests" (2026-09-14) — <https://www.infosecurity-magazine.com/news/revolut-data-breach-fake-government/>
- **BankInfoSecurity(独立報道)**: "Revolut Reveals Data Breach Tied to Faked Official Request" (2026-09-14) — <https://www.bankinfosecurity.com/revolut-reveals-data-breach-tied-to-faked-official-request-a-32808>

参照: 検出と証明の違いについては[「AI時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。設計の位置づけは[Pillar 04 — 規制属性](https://lemma.frame00.com/ja/pillars/#attribute)。

> 本Brief執筆時点で、Revolutは影響人数・対象国・なりすまされた機関を公表していない。侵害された端末の所属、アカウントが乗っ取られたのか複製されたのか、要求が続いた期間は、伊捜査当局も確定していない。人数「約680人」は攻撃者がFinancial Timesに語った主張であり、Revolutの確認を経ていない。
