---
brief_no: 115
title: "Workday の AI 応募者スクリーニング差別訴訟：不利益処分は下されたが、その判定が独立に検証・認可されたかは残らない — Mobley v. Workday"
title_en: "AI applicant-screening discrimination suit against Workday: the adverse action was taken, but whether the decision was independently verified and authorized was never recorded — Mobley v. Workday"
pillar: "02-verifiable-ai"
primary_category: "ai-bias-harm"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-06-22
published: 2026-07-31
authors: ["Lemma Critical Team"]
related_pack: ["B-regulatory"]
related_briefs: ["012-williams-frt-wrongful-arrest", "076-dillon-frt-wrongful-arrest", "078-tenncare-connect-medicaid-eligibility", "056-mchire-paradox-recruiting-auth"]
status: published
version: "1.0"
og_lead_ja: "Workday AI 採用差別訴訟：自動不採用の前に判定が独立検証・認可されたか残らない"
og_lead_en: "Workday AI hiring-bias suit: no record the decision was verified before rejection"
gap_detected: "差別の疑いは応募者の経験と統計から浮上し、2026 年に集団訴訟として係争が進んだ。"
gap_missing: "自動不採用という不利益処分の前に、その判定が独立に検証・認可されたかを確かめ、証跡として残す層。"
gap_fix: "不利益処分の前に、どの判定が・どの根拠と信頼性条件で・どの独立検証／認可の下で使われたかを改ざんできない証跡として固定する。"
---

## 1. TL;DR

Mobley v. Workday, Inc.（米カリフォルニア州北部地区連邦地裁、No. 3:23-cv-00770）は、Workday の AI 応募者スクリーニングが人種・年齢・障害に基づき応募者を不利に選別したとする集団訴訟である。筆頭原告 Derek Mobley 氏（黒人・40 歳超・不安症とうつを持つ）は、Workday のプラットフォームを用いる企業で 100 件超の求人に落選し、応募から 1 時間以内や深夜に自動不採用の通知を受け取ったと申し立てている（原告側主張）。2026 年 6 月 22 日、Rita F. Lin 判事は Workday の「ツールを提供したにすぎない」という抗弁を斥け、中核の差別主張の続行を許可した。差別の疑いを浮上させ、法廷に持ち込む手続きは働いた。**検出は効いていた。効かなかったのは、自動不採用という不利益処分の前に、その判定が独立に検証・認可されたかを確かめ、証跡として残す層である。**

## 2. 何が起きたか

- 訴訟は Workday の AI 応募者スクリーニングが、その顧客企業の採用過程で応募者を人種・年齢・障害に基づいて不利に扱ったとする集団訴訟である。筆頭原告は Derek Mobley 氏。
- 原告側は、就業ギャップなどの proxy（代理指標）を通じて応募者が選別され、防御対象の属性と相関する形で不利益が生じたと主張する。数値（100 件超の落選、応募から 1 時間以内や深夜の自動不採用）は原告側の申立てである。
- 2026 年 6 月 22 日、Lin 判事は Workday の抗弁を一部斥け、Workday が「単なるツール提供者」ではなく差別責任の射程に入り得るとして、FEHA（カリフォルニア公正雇用住宅法）に基づく主張と、ADA（米国障害者法）に基づく proxy 差別主張の一部の続行を許可した。

事案は次の連鎖で成立している。

1. Workday の AI スクリーニングが、顧客企業の求人応募に対し合否の判定（選別・不採用への振り分け）を自動で下す。
2. その判定は、就業ギャップ等の proxy を含む要因で応募者を選別したと申し立てられている。
3. 自動不採用という不利益処分が、その判定の根拠・信頼性・独立裏付けを検証できる証跡なく、応募者に対して下される。
4. 判定の妥当性を検証し得るバイアス検査データ（bias-testing data）は、後述のとおり訴訟手続き上も原告側に届かず、判定を独立に検証する材料が遮蔽された。

## 3. 時系列 — 公表と対応

- 2023-02: Mobley 氏が Workday を相手取り連邦地裁に提訴（No. 3:23-cv-00770、N.D. Cal.）。
- 2024（前後）: 早期の申立て段階で、Workday の「agent（代理人）」該当性をめぐる判断が示され、原告に補正の機会が与えられた。
- 2025-05: ADEA（年齢差別禁止法）に基づく全国規模の集団（collective）の暫定認証が認められる。
- 2026-05-29（前後）: Laurel Beeler 治安判事が、Workday のバイアス検査データの開示強制を却下。弁護士・依頼者間の秘匿特権が当該データを保護すると判断（同時に、顧客の応募者データも Rule 34 の「支配」要件を満たさないとして開示強制を却下）。
- 2026-06-22: Rita F. Lin 判事が、Workday の抗弁を一部斥け、FEHA 主張および ADA proxy 差別主張の一部の続行を許可。

> 注：本 Brief の事実は連邦地裁の命令・法律事務所の分析・確立メディアの報道に基づく。訴訟は係争中であり、応募者が受けた不利益や自動不採用の態様に関する記述は原告側の申立てを含む。集団認証の範囲や数値の細部には未確定の要検証事項がある。本 Brief は当事者の断罪ではなく、不利益処分の前にその判定が独立に検証・認可されたかを証明できる層が欠けているという構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- 事案は現在 discovery（証拠開示）段階にあり、判定の根拠や検査データの扱いをめぐる争いが続いている。
- Lin 判事の 6 月命令は、AI スクリーニングの提供者が「単なるツール提供者」を超えて差別責任の射程に入り得るとの判断として、HR・法務の実務で広く参照されている。

## 4. なぜ止まらなかったか

この事案の失敗は、応募者側の対応が不足していたことでも、特定の担当者が悪意を持っていたことでもない。自動化された合否判定が、不利益処分（自動不採用）に直結する経路のどこにも、その判定が「どの根拠で・どの信頼性条件で・誰の独立検証と認可の下で」下されたかを確かめ、後から立証できる証跡が置かれていなかったことにある。検出は効いていた。差別の疑いは応募者の経験と統計から浮上し、集団訴訟という手続きに乗った。効かなかったのは、その手前——不採用が確定する瞬間の検証である。

判定が正規に見えることと、その判定がいま不利益処分を認可されていることは、別の問いである。自動応答は速く、大量で、一見一貫していた。だが速さと一貫性は、その一件ごとの判定が独立に裏付けられ認可されたことの証明ではない。しかも本事案では、判定の妥当性を検証し得るバイアス検査データが秘匿特権で遮蔽され、判定を独立検証する材料が手続き上も原告側に届かなかった。判定の結果は残るが、その判定が検証・認可された事実（あるいはされなかった事実）は残らない。

> 自動不採用が象徴的である。通知は届くが、その一件がどの根拠と信頼性条件で、どの独立検証の下で下されたかは、処分を受けた側にも、後の手続きにも示されない。判定の結果は速く伝わり、判定の裏付けは伝わらない。

同じ構造は、確率的な AI 出力が独立裏付けなく不可逆な強制処分に直結した [Brief 012（Robert Williams 誤認逮捕）](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/)・[Brief 076（Robert Dillon 誤認逮捕）](https://lemma.frame00.com/ja/critical/briefs/076-dillon-frt-wrongful-arrest/)、行政の AI 判定が給付の可否に直結した [Brief 078（TennCare Connect の資格判定）](https://lemma.frame00.com/ja/critical/briefs/078-tenncare-connect-medicaid-eligibility/)、採用領域で判定の帰属と認可が問われた [Brief 056（McHire の応募者データ露出）](https://lemma.frame00.com/ja/critical/briefs/056-mchire-paradox-recruiting-auth/) と連なる。いずれも、判定が「実在すること」と、その判定がいま不利益処分を認可されていることが、別の問いであることを示している。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、自動判定が不利益処分（自動不採用など）に用いられる前に、「どの判定が・どの根拠と信頼性条件で・どの独立検証／認可の下で」使われるのかを、後から改ざんできない証跡として固定する層を経路に一段挟む。判定が速く一貫して見えることを認可の代用にせず、その一件が不利益処分を認可されているかを、処分が確定する前に確かめる。答えが「独立裏付けなし」「認可なし」であれば、当該判定に基づく不利益処分は事前に保留される。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **不利益処分ごとの認可証明**：自動不採用のような処分を、判定モデルの出力の所持ではなく、その処分がいま独立に検証・認可されていることの検証可能な証明に結び付ける。裏付けのない判定の自動適用を、処分の前に排除する。
- **判定根拠と信頼性条件の固定**：どの判定が、どの入力・どの proxy・どの信頼性条件の下で下されたかを、処分の時点で検証可能な形で固定する。後から根拠を再構成できないまま結果だけが残る状態を避ける。
- **独立検証の証跡化**：判定が人間または独立の層によって検証・認可されたか（あるいはされなかったか）を、当事者・監査・司法手続きが後から独立に立証できる証跡として残す。検証材料が手続き上も届かない状態を、設計として塞ぐ。
- **選択的な処分記録**：誰の・どの判定が・どの認可の下で不利益処分に用いられたかを、改ざんできない記録として保持する。争いが生じた場合に、処分の経路と認可の状態を独立に示せる。

Lemma は判定の公平性そのものを保証する製品ではない。射程は、判定が不利益処分に用いられる前に独立に検証・認可された事実（あるいはされなかった事実）を、後から改ざんできない証跡として残すことにある。差別の有無や適否の判断は、あくまで手続きと法が行う。検出（差別の疑いの把握、統計的分析、係争を通じた事後の救済）と、事前証明（処分の前に判定の裏付けと認可を独立検証する証跡）は、代替ではなく補完の関係にある。前者は起きた不利益の把握と回復に、後者は不利益が確定する前の信頼確立に働く。設計の詳細は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) を参照。

## 6. Sources

- Seyfarth Shaw LLP, “Mobley v. Workday: Court Holds AI Service Providers Could Be Directly Liable for Employment Discrimination Under ‘Agent’ Theory”（2026-06）— <https://www.seyfarth.com/news-insights/mobley-v-workday-court-holds-ai-service-providers-could-be-directly-liable-for-employment-discrimination-under-agent-theory.html>
- Akin, “Court Allows Discrimination Claims Against AI Hiring Tool to Proceed (Mobley v. Workday, Inc.)”（AI Law and Regulation Tracker、2026）— <https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/court-allows-discrimination-claims-against-ai-hiring-tool-to-proceed-or-mobley-v-workday-inc>
- Duane Morris LLP, “California Federal Court Clarifies Limits On AI Bias Testing And Applicant Data Disclosure In Mobley v. Workday”（Class Action Defense、2026-06-02）— <https://blogs.duanemorris.com/classactiondefense/2026/06/02/california-federal-court-clarifies-limits-on-ai-bias-testing-and-applicant-data-disclosure-in-mobley-v-workday/>
- HR Executive, “Judge refuses to dismiss most Workday hiring bias allegations”（2026-06）— <https://hrexecutive.com/judge-refuses-to-dismiss-most-workday-hiring-bias-allegations/>
- Norton Rose Fulbright, “Behind the privilege shield: Safeguarding AI bias-testing data in employment decisions”（Inside Tech Law、2026-06）— <https://www.insidetechlaw.com/blog/2026/06/behind-the-privilege-shield-safeguarding-ai-bias-testing-data-in-employment-decisions>
- Mobley v. Workday, Inc., No. 3:23-cv-00770（N.D. Cal.）— 事件ドケット（一次） — <https://www.courtlistener.com/docket/66831340/mobley-v-workday-inc/>

参照: [Proof-as-Auth: 鍵を一度も送らずにサインインする](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/) · [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference) · [Brief 012（Robert Williams 誤認逮捕）](https://lemma.frame00.com/ja/critical/briefs/012-williams-frt-wrongful-arrest/) · [Brief 076（Robert Dillon 誤認逮捕）](https://lemma.frame00.com/ja/critical/briefs/076-dillon-frt-wrongful-arrest/)
