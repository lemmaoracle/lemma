---
brief_no: 141
title: "IDScan.net：本人確認のために窓口へ渡した運転免許証のスキャン画像が、1 億 5,300 万件超ダークウェブで売られていた — 確認は一度で終わるが、画像は残り続ける"
title_en: "IDScan.net: More than 153 million scanned driver's licenses handed over at counters were being sold on the dark web — the check ends in a moment, the image does not"
pillar: 04-regulatory-attribute
primary_category: attribute-proof-bypass
secondary_categories: [kyc-aml-disclosure, data-provenance]
incident_date: 2026-09-01
published: 2026-09-04
authors: ["Lemma Critical Team"]
related_pack: [B-regulatory]
related_briefs: ["052-discord-age-verification-id-leak", "077-idmerit-kyc-data-exposure", "086-sumsub-support-environment-breach", "034-ekyc-liveness-bypass"]
status: published
version: "1.0"
og_lead_ja: "IDScan.net、運転免許証 1.5 億件超がダークウェブで検索可能に"
og_lead_en: "IDScan.net: 153M+ scanned driver's licenses sold on the dark web"
---

## 1. TL;DR

ダークウェブの新興サービス「Nexus」が、北米の運転免許証 1 億 5,300 万件超を日時付きのスキャン画像ごと検索・購入できる状態にした。Brian Krebs と研究者 Zach Edwards は自分の免許証を見つけ、画像のタイムスタンプが窓口で免許証を手渡した日時と一致することから、身分証確認事業者 IDScan.net を発生源として指し示した。FBI は同日に捜査へ入り、Nexus は報道の数時間後に止まった。**効かなかったのは、確認のために一度渡した原本画像が、そのあと誰の手元にどれだけ残るのかを確かめる層である。**

## 2. 何が起きたか

- Nexus は 2026 年 8 月 31 日、ロシア語のサイバー犯罪フォーラム「Exploit」で広告が出された身分証データの検索サービスである。出品者は「北米 1 億 7,000 万人超の身分証明書のデジタルスキャン」を持つと謳っていた。
- 掲載件数は運転免許証 1 億 5,300 万件超、ID カード 1,000 万件超、旅行文書・国際 ID 300 万件超、医療カード 57 万 9,000 件超である。Krebs は掲載開始からの 24 時間で運転免許証の件数が 40 万件近く増えたことを確認し、新しく盗まれたデータが継続的に投入されているとみている。
- 出品者は「1 年以上にわたり新しいデータを継続的に抽出し、非公開データベースへ入れてきた」と主張している。これは売り手側の言い分であり、独立に確認された事実ではない。
- 1 件の記録には最大 6 枚の画像が含まれる。免許証の表裏を、通常のスキャン・赤外線・紫外線の 3 通りで撮ったもので、ファイル名には日付と時刻が付いている。

発生源の特定は、次の連鎖で成立した。

1. Krebs が自分の免許証を Nexus 上で検索したところ、自分と母親の記録が見つかった。二人は同じときに Hertz のレンタカー窓口で免許証を手渡していた。
2. 画像のタイムスタンプは、その手渡しの日時と一致した。
3. 研究者 Zach Edwards の記録も同様に見つかった。Edwards はラスベガスで車を借りてはいないが、TSA の保安検査場、市内の大麻販売店、宿泊先の Aria で免許証を渡していた。
4. 共通するのは、赤外線・紫外線を含むスキャンを行う店頭の身分証確認である。IDScan.net は自社の技術が月間 2,100 万件超・世界 2 万か所超で稼働していると公表しており、2022 年 8 月には Planet 13 の大麻販売店との ID 検証契約をプレスリリースで告知していた。
5. IDScan.net の Jillian Kossman 氏は Krebs に対し「現時点で追加の情報を共有することはできないが、提供された更新は歓迎するもので、当社チームの調査に役立っている」とのみ回答した。
6. 同社が自社サイトで取引先として挙げていた Caesars Entertainment は、自社は IDScan.net の顧客ではなく、2025 年 2 月以降 VeriScan を使用していないと述べ、掲載そのものを否定した。
7. FBI ニューオーリンズ支局は 9 月 1 日、IDScan.net をめぐる侵害について正式な捜査を開始したと Krebs に伝えた。

## 3. 時系列 — 公表と対応

- 2026-08-31：Nexus がサイバー犯罪フォーラム「Exploit」で広告を出す。情報提供者が Krebs に連絡する。
- 2026-09-01：Krebs が調査結果を公開。同日、FBI ニューオーリンズ支局が正式な捜査を開始したと同氏に伝える。
- 2026-09-01：記事公開の数時間後、Nexus のログインページが「このサービスは利用できません」の表示に置き換わり、サイトが停止する。
- 2026-09-02：TechCrunch が独自取材を加え、記録の中に米国防長官 Pete Hegseth 氏の運転免許証があったと報じる。国防総省は「報道を把握し、評価している」、FBI は「本件を調べている」と回答した。

> 発生源の特定は、IDScan.net の認めた事実ではなく、Krebs と Edwards による独立検証——自分と家族の免許証記録を実際に見つけ、画像のタイムスタンプを免許証を手渡した日時と突き合わせた——に基づく。件数はいずれも Nexus 側の掲載値であり、実在する記録の数として独立に検証されたものではない。本 Brief 執筆時点（2026-09-04）で、IDScan.net による侵害の確定・影響範囲を示す公式声明は確認できていない。

公表後の対応と業界の動きは次のとおり。

- FBI がニューオーリンズ支局主導で捜査に着手し、サイバー部門の担当者が Krebs に説明を行った。
- IDScan.net は「調査中」との回答にとどまり、侵害の有無・範囲についての公表を行っていない。同社が Planet 13 との契約を告知したプレスリリースの URL は、本 Brief 執筆時点で自動取得に応答しない。
- 取引先として掲載されていた Caesars Entertainment が、自社は顧客ではないと掲載内容そのものを否定した。
- Nexus は自らサービスを停止したが、すでに抽出されたデータが別の経路で再流通するかどうかは、本 Brief 執筆時点で不明である。

## 4. なぜ止まらなかったか

この事案の失敗は、暗号の破れでも、単純な設定ミスでもない。**窓口で身分証を一度確認するという行為が、赤外線・紫外線まで含む原本画像を蓄え続ける行為に置き換わっており、その画像がどこにどれだけ残り誰が触れるのかを、渡した本人にも確認を頼んだ店舗にも確かめる手段が無かった**ことにある。

窓口が必要としているのは「この人物はこの ID の保有者であり、条件を満たしている」という一瞬の判定である。実際に生成され保存されるのは、その判定の根拠になった原本画像そのものである。判定は一度で終わるが、画像は期限を持たない。Krebs と Edwards が過去に自分が行った手渡しを日時付きで見つけられたこと自体が、判定のあとも画像が残り続けていたことの証拠になっている。

検出は効いていた。研究者は自分の免許証を手がかりに発生源を数日で指し示し、FBI は同日に捜査へ入り、Nexus は報道の数時間後に止まった。効かなかったのはその手前——手渡した瞬間から侵害が公になるまでの間、その画像に誰が触れられるのかを、本人にも取引先にも独立に確かめる術が無かったことである。

> 「Caesars は IDScan.net の顧客ではなく、2025 年 2 月以降 VeriScan を使用していない。にもかかわらず IDScan.net は自社サイトで当社を取引先として掲載している」——Caesars Entertainment。本人確認を担う事業者が公開する取引先一覧でさえ、独立に確かめられないまま古い状態で残っていた。

年齢を証明するために渡した政府 ID が第三者から流出した [Brief 052](https://lemma.frame00.com/ja/critical/briefs/052-discord-age-verification-id-leak/)、KYC データを保有する側の内部露出を扱った [Brief 077](https://lemma.frame00.com/ja/critical/briefs/077-idmerit-kyc-data-exposure/) と [Brief 086](https://lemma.frame00.com/ja/critical/briefs/086-sumsub-support-environment-breach/) は、いずれも同じ失敗の型——確認のために原本を渡す設計——を別の業種で示している。

## 5. 証明があれば、何が変わるか

本人確認の目的は「この人物がこの条件を満たしている」という判定であって、判定の根拠になった原本画像ではない。事前証明は、この区別を経路に一段挟む。窓口が受け取るものを原本の複製から、確かめられる属性の証明に置き換える。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>属性の証明として発行する</strong>：確認のたびに生成するものを原本画像ではなく、「年齢条件を満たす」「この ID は真正である」といった、確認したい属性そのものの証明にする。</li>
<li><strong>スコープと有効期限を持たせる</strong>：証明が答える範囲と有効な期間を証明自体に束縛し、確認が終わった後まで原本相当の情報が残らないようにする。</li>
<li><strong>受け手の資格も検証対象にする</strong>：証明を受け取る側が今も正当な受け手かを検証できるようにし、契約の切れた相手が取引先として扱われ続ける状態を防ぐ。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>すでに流出した画像を回収したり、ダークウェブ上のデータを削除したりはしない。</li>
<li>侵害の発生自体を防ぐものではない。検出・通報・法執行の対応は引き続き人と当局の仕事である。</li>
<li>証明が示せるのは、確認の根拠として何が渡されたかまでである。窓口が業務上の判断として原本の提示を求める場面まで無くすものではない。</li>
</ul>

検出の層と、この層は代替ではなく補完の関係にある。前者は流出が起きた後にその範囲を特定し、後者は確認のたびに原本画像が積み上がらない状態を、次の窓口が開く前に確かめられるようにする。露出しうるものを最小にしておくことは、検出が働くまでの時間を待てるようにすることでもある。

## 6. Sources

- **Krebs on Security（一次・独自調査報道）**: Brian Krebs, "FBI Probes Service Selling 153M+ Drivers Licenses"（2026-09-01）— <https://krebsonsecurity.com/2026/09/fbi-probes-service-selling-153m-drivers-licenses/>
- **TechCrunch（独立報道）**: "It sure looks like hackers breached a major ID card verification service"（2026-09-02）— <https://techcrunch.com/2026/09/02/it-sure-looks-like-hackers-breached-a-major-id-card-verification-service/>
- **IDScan.net（一次・企業公式）**: "Business risk skyrockets as ID fraud rises, according to 2025 ID Fraud Report"（2025-05-28。月間 2,100 万件超・2 万か所超の稼働規模の出典）— <https://idscan.net/press-release/2025-id-fraud-report/>
- **IDScan.net（一次・企業公式）**: "World's largest cannabis dispensary, Planet 13, partners with IDScan.net for ID verification"（2022-08-04）— <https://idscan.net/press-release/planet-13-partners-with-idscan-net/>（原文が自動取得に応答しないため、保存版: <http://web.archive.org/web/20260902204050/https://idscan.net/press-release/planet-13-partners-with-idscan-net/>）

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。属性の証明は[Pillar 04 — 規制属性](https://lemma.frame00.com/ja/pillars/#attribute)。

件数はいずれも Nexus 側の掲載値であり、独立に検証されたものではありません。発生源としての IDScan.net の特定は Krebs と Edwards による独立検証に基づくもので、同社は本 Brief 執筆時点で侵害の有無・範囲を公表していません。
