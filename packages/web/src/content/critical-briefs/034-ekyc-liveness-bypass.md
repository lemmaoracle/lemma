---
brief_no: 34
title: "ライブ生体認証が「注入された映像」に突破された — KYC は本人の生体を確認したと信じたが、撮影の来歴は検証されなかった"
title_en: "Live Biometric Verification Defeated by an Injected Video Feed — KYC Believed It Had Captured a Live Person, But the Provenance of the Capture Was Never Verified"
pillar: "04-regulatory-attribute"
primary_category: "attribute-proof-bypass"
secondary_categories: ["ai-decision-integrity", "identity-auth"]
incident_date: 2026-04-15
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["022-onlyfake-ai-id-kyc-bypass", "012-williams-frt-wrongful-arrest", "013-coinbase-kyc-insider-breach"]
version: "1.0"
status: published
og_lead_ja: "ライブ生体認証が注入映像に突破された — eKYC liveness"
og_lead_en: "Live biometric verification defeated by an injected video feed — eKYC"
gap_detected: "合成映像（deepfake）を見破る検出モデルや、liveness の多層化・不正パターンの監視は継続的に強化できている。"
gap_missing: "「この映像は実在のカメラからその場で取得され、すり替えられていないか」という撮影の出所を確かめる層が無く、注入された映像が正規のカメラ映像と同じ経路で素通りした。"
gap_fix: "映像が本物らしいかではなく「この映像は実在のセンサーからライブ取得された来歴を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

MIT Technology Review の調査で、銀行・取引所の顔 liveness 検査を破る既製ツール（仮想カメラ・deepfake・盗難生体バンドル）が Telegram で公然と売られていることが判明した。deepfake 検出や liveness の多層化は強化されているが、検出は生成物との恒常的ないたちごっこで、合成と判定できなければ属性は成立してしまう。欠けていたのは「この映像は実在のセンサーからライブ取得され、注入・差し替えを経ていないか」という撮影来歴の独立検証であり、注入映像は正規のカメラ映像と同じ経路で素通りした。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: 銀行・暗号資産取引所・決済アプリの eKYC / 顔 liveness 検査(Binance・BBVA・Revolut 等が名指しで言及)
- **公表**: 2026-04-15、MIT Technology Review の調査報道(Biometric Update 等も同月報道)
- **規模**: 中国語・ベトナム語・英語で運用される 22 の公開 Telegram チャネル/グループが KYC 突破ツールを公然と販売
- **販売ツール**:
  - 仮想カメラ(VCam): 事前録画/AI 生成動画を端末のカメラフィードに注入し「頭を動かして」等の liveness プロンプトを突破
  - 盗まれた生体バンドル: セルフィー動画・ID 書類スキャン・住所証明・電話番号を国別にパッケージ
  - deepfake 生成器・hooking フレームワーク: rooted Android で対象銀行アプリ内のカメラ API 呼び出しを横取り
- **価格(2026 年前半に観測)**: 基本的な VCam Android ビルドが約 $30–$60、盗難 ID バンドルが $100–$300、特定機関の liveness フローに合わせたカスタム deepfake の「VIP」サービスが $500–$2,000
- **文脈**: Sumsub の集計では 2026 年に deepfake が全不正の 11%(2024 年の 7% から上昇)。本件は単発事故でなく、商用化された KYC 突破エコシステムの可視化
- **核心**: liveness 検査が「カメラに映る顔は実在生体だ」という属性を、撮影フィードの来歴を検証せずに信じたため、注入映像が正規のカメラ映像と同じ経路で素通りした

---

## 2. 事象連鎖

(本件は商用ツール市場の調査報道であり、特定企業1社の単一事故ではない。確認されている構造を記す)

- 2014–継続: 顔 liveness 検査が銀行・取引所のオンボーディングで標準化(セルフィー動画+「頭を動かして」等の能動的 liveness)
- 2026 前半: Telegram 上で VCam・deepfake・hooking フレームワーク・盗難生体バンドルの市場が観測される
- 2026-04-15: MIT Technology Review が 22 チャネルの市場を調査・公表。Binance・BBVA・Revolut 等を標的に挙げる
- 同月: Biometric Update 等が追随報道。Sumsub が deepfake の不正比率上昇を報告

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。本件は商用ツール市場の調査報道・実証であり、特定機関の被害件数や成功率を断定するものではなく、ツールの存在を超えた効果を誇張しない。

---

## 3. 攻撃ベクター

1. **生体素材の入手**: 盗まれた、または AI 生成のセルフィー動画・ID 書類を国別バンドルで取得
2. **撮影フィードの偽装**: VCam ソフトで事前録画/deepfake 映像を端末のカメラフィードに注入。または rooted Android の hooking フレームワークで銀行アプリのカメラ API 呼び出しを横取り
3. **liveness プロンプトの通過**: 「頭を動かして」「まばたきして」等の能動的 liveness に、注入映像/リアルタイム deepfake で応答
4. **属性の偽装成立**: 検証側は「ライブの本人生体を確認した」と判定し、本人性という規制属性が成立
5. **不正口座開設・乗っ取り**: 偽の本人確認で口座を開設、または既存口座へデバイス登録して資金移動

---

## 4. 構造的論点

本事案は Pillar 04(規制属性証明)の `attribute-proof-bypass` を背骨とし、Pillar 02(検証可能 AI)とも交差する。secondary に `ai-decision-integrity`(検証側 AI が注入映像と実映像を識別できない)と `identity-auth` を併記する。

中心的な**失敗 primitive は「liveness 検査が、カメラに映る顔がその場の実在生体だという属性を、撮影フィードの来歴を検証せずに信じること」**にある。検証側が見ているのは「処理されたカメラフィード」であり、それが実在のセンサーからライブ取得されたものか、VCam で注入されたものか、API フックで差し替えられたものかは、フィードの内容からは判別できない。属性(本人の生体)の真正性が、撮影の来歴(実在生体からのライブ取得である証明)と切り離されている。

Brief 022(OnlyFake、AI 生成の静止 ID 書類で KYC 突破)と同じ「見た目は正しいが来歴は偽」の系譜だが、本件は**静止文書でなくライブ映像/生体**を対象とし、能動的 liveness という"動的な検証"すら来歴の代わりにならないことを示す点で一段進んでいる。Brief 012(顔認識 AI の判定が独立検証なく行政処分に直結)とも、生体 AI 判定が独立検証を欠くと重大な結果に直結する点で同根。「人間オペレータにも検証 AI にも本物に見えるが、来歴的には偽」という乖離は、Brief 005(Noroboto、人間と AI が見る入力の乖離)の生体・映像版でもある。

---

## 5. 検出と証明の落差

deepfake 検出モデルの高度化、liveness の多層化、不正パターンの監視、Telegram チャネルの摘発は、被害抑止に不可欠であり、本 Brief がその役割を否定するものではない。検出側も継続的に強化されている。

一方で、検出は「検証側が受け取る映像を、何を根拠に"ライブの本人"と認めるか」自体を変えない。VCam 注入や API フックは、検証側から見れば正規のカメラフィードと同じ経路で届く。deepfake 検出は生成物の品質向上と恒常的ないたちごっこになり、検出が「これは合成だ」と判定できなければ属性は成立してしまう。欠けていたのは「この映像は実在のセンサーからライブ取得され、注入・差し替えを経ていない」という撮影来歴の独立検証であり、これは合成検出とは別系統である。規制(KYC/AML)の観点でも、後から「この本人確認は実在生体に基づいたか」を立証する独立した証跡は、検証ログ以上には残りにくい。

事前証明(pre-execution attestation)は、liveness を「映像が本物らしいかの判定」から、「撮影が実在のセンサーからライブ取得され、改ざん・注入されていないことの来歴証明」へと反転させる設計を採る。端末・撮影経路の attestation により、フィードの来歴が証明できなければ、映像がどれほど自然でも本人確認は成立しない。deepfake 検出(detection 的な「これは合成か」)と撮影来歴の事前証明(「これは実在生体からのライブ取得か」)は代替ではなく**補完**の関係にある。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **MIT Technology Review / Biometric Update**: 商用化された KYC 突破市場(VCam・deepfake・hooking・盗難生体バンドル)を可視化し、標的機関と価格帯を提示
- **業界横断の論点**: 能動的 liveness(頭を動かす・まばたき)という"動的検証"も、撮影フィードの来歴を検証しない限り注入で突破される。deepfake 検出の高度化だけでは恒常的ないたちごっこになるため、撮影経路・端末の attestation で「ライブ取得の来歴」を証明する方向へ、本人確認設計の重心を移す議論が進む。生体は再発行できないため、盗難生体バンドルの流通は長期のリスクを残す

「本人性という属性を、映像の見た目でなく撮影の来歴として証明する」必要性が、本事案を契機に金融・FinTech・取引所の間で再認識される見込み。

---

## 7. Lemma による分析

本事案で露呈した構造(本人性という規制属性が、撮影の来歴を検証せず映像の見た目で受理される)に対して、Lemma は、本人確認を「映像が本物らしいかの判定」から「撮影が実在センサーからライブ取得された来歴の独立検証」へ反転させる設計を提示している。

- **見た目から来歴への反転**: 本人確認を「映像が本物らしいか」から「撮影が実在センサーからライブ取得された来歴を持つか」の独立検証へ反転させる。
- **撮影経路・端末の attestation**: フィードの来歴を端末・撮影経路の attestation で証明させ、VCam 注入や API フックでの差し替えを来歴の段階で断つ。
- **来歴欠落時の事前 block**: フィードがどれほど自然でも、撮影来歴の proof が成立しなければ属性を確立させず、本人確認を事前に reject する。
- **検出との補完**: deepfake 検出(合成か否か)と撮影来歴の事前証明(ライブ取得か否か)を別系統として併置し、いたちごっこに依存しない。

撮影来歴の proof が成立しなければ属性は確立されず、検出は事前の証明によって補完される。Brief 022(OnlyFake)と合わせ、「見た目は正しいが来歴は偽」の系譜として参照されたい。

設計と適用範囲は、[Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/regulatory-attribute-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 8. Sources

- **MIT Technology Review**: "Cyberscammers are bypassing banks' security with illicit tools sold on Telegram"(2026-04-15、22 チャネルの市場・ツール・標的機関・価格)— https://www.technologyreview.com/2026/04/15/1135898/cyberscammers-bypassing-bank-telegram/
- **Biometric Update**: "KYC bypass tools sold on Telegram to defeat biometric checks"(2026-04)— https://www.biometricupdate.com/202604/kyc-bypass-tools-sold-on-telegram-to-defeat-biometric-checks

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
