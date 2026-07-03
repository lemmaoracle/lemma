---
brief_no: 77
title: "IDMerit：約10億件の KYC データ「露出」が係争に — 認証なしの公開 DB は見つかったが、それが誰の管理下のデータかを、いまも誰も証明できない（Cybernews 報道・IDMerit 否認）"
title_en: "IDMerit: the disputed billion-record KYC exposure — an unsecured database was found, but no one can prove whose data it was (Cybernews report, IDMerit denial)"
pillar: "04-regulatory-attribute"
primary_category: "kyc-aml-disclosure"
secondary_categories: ["data-provenance", "attribute-proof-bypass"]
incident_date: 2026-02-18
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["013-coinbase-kyc-insider-breach", "086-sumsub-support-environment-breach", "021-wirecard-balance-attestation", "052-discord-age-verification-id-leak"]
status: published
version: "2.0"
og_lead_ja: "IDMerit 10億件露出の係争 — 帰属を誰も証明できない"
og_lead_en: "IDMerit's disputed billion-record exposure — custody no one can prove"
gap_detected: "Cybernews が認証なしで公開されていた MongoDB を発見・通報し、翌日に該当データベースは閉鎖された。"
gap_missing: "露出したデータが誰の管理下にあり、どの契約・取得根拠に基づくものか（custody）を、当事者・研究者・規制当局の誰も検証可能な形で証明できない。"
gap_fix: "KYC データの各レコードに管理主体・取得根拠・契約層への検証可能な来歴を同伴させ、露出時に帰属と適法性を証拠ベースで即座に確定できるようにする。"
---

> **改訂（v2.0 / 2026-07-03）**: 初版は Cybernews の報道に基づき、確定した露出として記述していた。IDMerit による公式な否認と係争の状況を踏まえ、本版では両論を併記し、「露出の帰属（custody）を誰も検証可能な形で証明できない」という構造の分析へ再構成した。独立に検証されていない数値には注記を付す。

## TL;DR

セキュリティ媒体 Cybernews は 2026-02-18、認証（パスワード）なしで公開されていた MongoDB から、身元確認（KYC）事業者 IDMerit に紐づくとされる機微個人記録・約 10 億件（総レコード数は 30 億件超、26 か国・約 1TB — いずれも Cybernews の主張で未検証）が露出していたと報じた。IDMerit は「当社は顧客データを保有・管理・保存しない」「精査の結果、露出・脆弱性・不正アクセスは確認されなかった」と全面否認し、調査報告書を求めた際に金銭を要求されたとしてランサム目的の疑いを表明している。本事案の核心は侵害の有無をめぐる水掛け論ではなく、露出した DB の管理責任（custody）が誰に帰属するのかを、当事者・研究者・規制当局の誰も検証可能な形で証明できない点にある。露出の検出は機能したが、帰属の証明が存在しない — 「検出と証明の落差」の純度の高い実例である。

---

## 1. 事案概要

- **報道主体 / 発見**: Cybernews 研究チーム。認証のかかっていない MongoDB を 2025-11-11 に発見し通知、翌 11-12 に該当 DB は閉鎖された。公開開示は 2026-02-18
- **Cybernews の主張（未検証）**: 総計 30 億件超のレコードのうち、機微個人データを含むものが約 10 億件。26 か国・総量約 1TB。露出内容は氏名・住所・生年月日・国民 ID 番号・電話番号・メールアドレス・性別・通信事業者メタデータ、および **KYC / AML の検証ログ**。集中度が高いのは米国・メキシコ・フィリピン・ドイツ・イタリアで、米国約 2.03 億件・メキシコ約 1.24 億件との報道値がある
- **IDMerit の否認（Biometric Update 掲載の公式回答）**: 「当社は SaaS 事業者であり、顧客データを保有・管理・保存しない（検証は API 経由で処理される）」「通知を受けてソフトウェア・セキュリティ管理・構成・ログを包括的に精査したが、露出・脆弱性・不正アクセスは確認されなかった」「露出したとされるデータは、検証時に接続する独立データソース由来であり、パートナー各社も侵害・持ち出しを否定した」。さらに、調査報告書を求めたところ金銭を要求されたとして、**ランサム目的の事案との疑い**を表明している
- **帰属の不確かさ**: 後追い報道（Fox News 等）も、当該 DB を「研究者が IDMerit のものと*考えている*（believe）」と表現しており、帰属は報道段階から確定していない
- **争点の中心（構造）**: 当該 DB が IDMerit のものか、独立データソースのものか、両者の契約下のどの層のものかを、**検証可能な来歴（provenance / custody chain）で裏づけられない**。ゆえに、露出が事実でも否認が事実でも、どちらの側もそれを証明できない

---

## 2. タイムライン

- 2025-11-11: Cybernews が認証なしの MongoDB を発見し、IDMerit に通知
- 2025-11-12: 該当 DB が閉鎖される
- 2025-11〜2026-02: 発見から公開開示まで約 99 日の空白（この間隔自体も論点）
- 2026-02-18: Cybernews が公開開示。Fox News、Panda Security 等が後追い報道
- 2026-02 下旬: IDMerit が否認と反論（顧客データ非保存・独立ソース由来・ランサム疑い）。Biometric Update 等の業界専門媒体が、確定事実ではなく**係争中の主張（dispute）**として両論を報道。同時期に、IDMerit の反論に沿って報道を「fake news」と断じる同型の記事群も複数出現した（多くは KYC 関連事業者のブログ等で、独立検証を伴わない）

> 注: 件数・国別内訳・データ内容はいずれも Cybernews の主張に依拠し、独立に検証されていない。IDMerit の否認もまた、外部が検証できる証跡を伴っていない。本 Brief はいずれの主張の真偽も認定せず、双方が証明を提示できないという構造そのものを対象とする。

---

## 3. 事象連鎖（失敗の分解）

本件は悪用の立証ではなく「露出と帰属不能」が主題である。争いのない核と係争部分を分けて整理する。

1. **争いのない核（構成）**: 認証（パスワード）のかかっていない DB が、公開ネットワーク上で到達可能な状態にあった — 到達がそのまま閲覧に直結し得る構成
2. **争いのない核（内容）**: その DB に、KYC 関連とされる大量の個人データが格納されていた
3. **ここから先が係争**: 当該 DB の所有者・管理者が誰か（IDMerit か、独立データソースか、下請・連携先か）を、外部から検証可能な証跡で確定できない
4. **来歴の不在**: データの適法性・出所（本人同意・取得根拠・契約層）も、来歴が同伴していないため事後に再構成できない
5. **帰結**: 侵害の有無・責任の所在・被害範囲のいずれも、当事者の自己申告に依存したまま確定しない。否認する側も、自らの主張を裏づける証明を提示できない

---

## 4. 構造的論点

本事案は Pillar 04（規制属性証明）の `kyc-aml-disclosure` カテゴリに属する。中心的な失敗 primitive は、**データ管理責任（custody）の検証可能な帰属証明の不在**である。KYC / AML 事業は「誰の・どの取得根拠の・どの契約下のデータか」という属性と来歴の塊を扱うが、その custody を証明する仕組みが存在しないため、露出が疑われた瞬間に「誰の責任か」を誰も証明できなくなる。secondary には、来歴が同伴しないため出所・適法性を事後に再構成できない点で `data-provenance` を第一に、保持されたとされる原本属性が本人の制御外で流通し得る点で `attribute-proof-bypass` を併記する。

Brief 013（Coinbase の内部経由 KYC データ漏洩）・Brief 086（Sumsub のサポート環境侵害)は、KYC データの**保有・保護**の失敗だった。本事案はさらにその手前、**そのデータが誰の管理下にあったのかすら証明できない**という層の失敗であり、KYC / AML カテゴリの別側面を補完する。Brief 021（Wirecard の残高証明偽装）とは、「属性・帰属の主張が検証されないまま流通する」点で連続する。Brief 052（年齢確認ベンダー経由の ID 流出）が示した「検証者が原本の集約点になる」リスクは、本事案では「集約点が存在したとして、それが誰の集約点だったのか」という一段深い不確定性として現れている。

KYC / AML や年齢確認の義務化が広がるほど、検証データは事業者・独立データソース・下請の間を流れ、管理責任の境界は増える。custody に証明が同伴しない限り、この境界の数だけ「誰のデータか誰も証明できない」露出が再生産される。

---

## 5. 検出と証明の落差

Cybernews による発見・通知、翌日の DB 閉鎖という**検出は機能した**。公開状態は捕捉され、遮断された。本 Brief はその役割を否定しない。

一方で、検出は帰属を証明しない。露出したデータが誰の管理下にあったか（custody）、どの契約・どの取得根拠に基づくか（来歴）を、当事者・研究者・規制当局の誰も検証可能な形で証明できない。ゆえに IDMerit の否認と Cybernews の主張は平行線をたどり、侵害の有無・責任の所在・被害範囲のいずれも確定しない。規制・監査の観点では、否認が事実であってもそれを立証する材料がなく、露出が事実であっても責任追及の起点が定まらない — **どちらに転んでも、証明の不在だけが確定している**。

事前証明（pre-execution attestation）と検証可能な来歴は、この構造を反転させる。KYC データの各レコードに管理主体・取得根拠・契約層への検証可能な参照が同伴していれば、露出発生時に「誰の・どの根拠のデータか」を即座に証明でき、責任の所在と適法性の争いを証拠ベースで決着できる。露出の検出（detection）と、帰属の証明（proof）は代替ではなく**補完**の関係にあり、両者が重なって初めて、検出後の水掛け論は事前の帰属証明へと置き換わる。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **Cybernews**: findings は正当であり、DB は誰でもアクセス可能な状態だったとの立場を維持
- **IDMerit**: 侵害を全面否認。「顧客データを保有・管理・保存しない」「独立データソース由来」とし、報告書要求への金銭要求を根拠にランサム目的の疑いを表明
- **業界専門媒体**: Biometric Update 等は本件を確定事実ではなく**係争（dispute）**として報道。一方、IDMerit の反論に沿って「fake news」と断じる同型記事も複数の KYC 関連事業者ブログ等に出現したが、これらも独立検証を伴わず、反証の証明にはなっていない
- **規制上の論点**: custody の連鎖が不透明であること自体が、通知義務・監督・責任配分といった規制対応を難しくする。KYC / AML における「取得時点の確認」から「データ来歴の伴走」への転換が、本件を契機に論点として浮上している

---

## 7. Lemma による分析

本件が示すのは、「侵害があったか」を事後に争う以前に、**データの管理責任と来歴が証明可能でなければ、責任追及も反証もできない**という構造である。IDMerit の否認（「保存しない」「独立ソース由来」）が事実だとしても、それを裏づける来歴が存在しなければ外部は検証できず、露出が事実であっても同じく証明できない。係争が平行線をたどる原因は、どちらかの不誠実ではなく、証明の層の不在にある。

- **custody の検証可能な帰属**: KYC データの各レコードに、管理主体・契約層への検証可能な参照を同伴させ、露出時に「誰の管理下のデータか」を即座に確定する
- **取得根拠の来歴**: 本人同意・取得根拠・保持期間を検証可能な来歴として刻み、適法性の争いを証拠ベースで決着させる
- **原本を集約しない検証**: 「この属性は確認済み」という結論だけを独立検証可能な証明として受け渡し、検証者・データソースのいずれも原本属性の無帰属な集約点にならないようにする
- **否認可能性の証明**: 「保存していない」という主張自体を、検証可能な形で立証できるようにする — 否認する側にとっても、証明の層は防御になる

設計と適用範囲は、[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) および [Seal](https://lemma.frame00.com/ja/seal/) を参照のこと。

---

## 8. Sources

- **Cybernews（原報道・発見元）**: “IDMerit data breach: 1 billion records of personal data exposed in KYC data leak”（2026-02-18）— <https://cybernews.com/security/global-data-leak-exposes-billion-records/>
- **Biometric Update（IDMerit の公式回答を掲載・係争として報道）**: “IDMerit disputes report of 1B records exposed in unsecured ID verification database”（2026-02）— <https://www.biometricupdate.com/202602/idmerit-disputes-report-of-1b-records-exposed-in-unsecured-id-verification-database>
- **Fox News（後追い報道。DB の帰属を「researchers believe」と表現）**: “1 billion identity records exposed in ID verification data leak”（2026-02）— <https://www.foxnews.com/tech/1-billion-identity-records-exposed-id-verification-data-leak>
- **Panda Security（後追い報道）**: “Over one billion customer records belonging to IDMerit users left unprotected online”（2026-02）— <https://www.pandasecurity.com/en/mediacenter/customer-records-idmerit-unprotected/>
- **Fincrime Central（後追い報道）**: “IDMerit data breach: 1 billion records of personal data exposed in KYC data leak”（2026-02）— <https://fincrimecentral.com/idmerit-kyc-data-one-billion-records-exposed/>
- **KYC Finland（IDMerit の反論に沿う KYC 事業者ブログ。独立検証なし）**: “Why IDMERIT Became a Target for Fake ‘Data of Billions Leaked’ Claims” — <https://www.kycfinland.com/blog/idmerit-became-target-fake-data-billions-leaked-claims/>
- **IDMerit 公式ブログ（同時期の投稿。本事案への直接言及はない）**: “IDMERIT’s Prevent Data Leaks with KYC Compliance Solutions”（2026-02-20）— <https://www.idmerit.com/blog/idmerits-prevent-data-leaks-with-kyc-compliance-solutions/>
- **reference 実装（GitHub）**: regulatory-attribute proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。本件は当事者間で事実関係が係争中であり、本資料はいずれの主張の真偽も認定しません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
