---
brief_no: 89
title: "SecondFi：監査済みの署名コードが未監査の SDK に差し替えられ、署名のたびに秘密鍵が公開データから再構成できた"
title_en: "SecondFi: Audited Signing Code Was Replaced by an Unaudited SDK, Letting Private Keys Be Reconstructed From Public Data on Every Signature"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-06-23
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "045-humanity-protocol-multisig-key-custody", "030-stripe-trusted-channel-skimmer", "038-ironworm-npm-self-propagation"]
status: "published"
version: "1.0"
og_lead_ja: "SecondFi：未監査SDKへの差し替えで、署名のたびに秘密鍵を公開データから再構成（約240万ドル流出）"
og_lead_en: "SecondFi: an unaudited SDK swap let private keys be rebuilt from public data (~$2.4M drained)"
gap_detected: "SecondFi が根本原因を特定し、攻撃者2グループのアドレス隔離・約129M ADA の緊急退避・復旧基金の設置・外部監査依頼が作動した。"
gap_missing: "本番の署名に入る暗号コードが「正規に監査された来歴を持つか（差し替えられていないか）」を稼働の前に独立検証する層が無く、未監査コードが署名器として動いた。"
gap_fix: "署名器に入る暗号コードが監査済みの正規来歴を持つことを署名の前に Lemma で独立検証し、来歴が確認できなければ署名を実行しない。"
---

## 1. TL;DR

Cardano のウォレット SecondFi（旧 Yoroi、EMURGO 系）の利用者から、6/21〜23 の連続した資金抜き取りで約16M ADA（約240万ドル）が流出し、374 アドレスが影響を受けた。鍵が盗まれたのでも、ウォレットアプリにマルウェアが入ったのでもない。SecondFi の調査によれば、ソフトウェア署名器の「決定論的 nonce 導出」に欠陥があり、影響アドレスがトランザクションに署名するたびに、公開済みのオンチェーンデータだけからその秘密鍵を数学的に再構成できる状態になっていた。外部解析（Tibane Labs／The Block）は、この署名コードが 6/8 に監査済みの EMURGO 署名コードから未監査の第三者 SDK（npm の "trantor"）に差し替えられていたことを指摘している。事後のアドレス特定・資金凍結（約129M ADA を退避）・補償基金の設置・外部監査は機能したが、「本番の署名に入る暗号コードが、正規に監査された来歴を持つか」を稼働の前に独立検証する層が無かった。

---

## 2. 何が起きたか

- **対象**: SecondFi（Cardano のライトウォレット。旧 Yoroi。EMURGO は Cardano 三大設立組織の一つ）の利用者ウォレット
- **被害規模**: 約16M ADA（約240万ドル相当）が 374 アドレスから流出。4回の連続したウォレット抜き取りに分かれて発生
- **発生日**: 2026-06-21〜23。SecondFi が 2026-06-25 に調査アップデートで根本原因を公表
- **根本原因（SecondFi の公表）**: ソフトウェア署名器の決定論的 nonce 導出の欠陥。影響アドレスが署名するたびに、その秘密鍵をオンチェーンの公開データから再構成できる十分な情報が漏れていた。脆弱性はアドレスレベルに存在し、同じリカバリーフレーズを別ウォレットにインポートしても侵害状態は残る
- **来歴上の指摘（外部解析）**: Tibane Labs／The Block は、問題の署名コードが 2026-06-08 に監査済みの EMURGO 署名コードから未監査の第三者 SDK（npm の "trantor"）に差し替えられたと指摘。標準実装が各署名に混ぜるはずの per-key シークレットを落としたため、本来秘密であるべき値が公開トランザクションデータだけから算出可能になった
- **攻撃者**: SecondFi は 2 グループを特定。一方が 2 波で 171 アドレス、もう一方が別の掃引で 203 アドレスを抜き取り。約4.02M ADA が特定済みの集約ウォレットに残存し監視下
- **封じ込め・対応**: 緊急措置として約129M ADA を独立した第三者カストディアンへ退避。専用の復旧基金を設置し、複数の外部セキュリティ企業に監査を依頼。プラットフォームはメンテナンスモードを継続。利用者には「リカバリーフレーズを別ウォレットに復元しない」「ステーキング報酬の引き出しを避ける（mempool 監視で資金が露出し得る）」よう警告

事象は次の連鎖で成立している。

1. **署名コードの差し替え**: 監査済みの EMURGO 署名コードが、2026-06-08 に未監査の第三者 SDK（npm の "trantor"）へ差し替えられる（外部解析の指摘）。本番の署名器に入るコードの来歴が変わった
2. **per-key シークレットの欠落**: 差し替えられた署名器が、標準実装で各署名に混ぜるはずの per-key シークレット（nonce）を落とす。決定論的 nonce 導出が、本来秘密であるべき値を公開データから算出可能にする
3. **署名による情報漏洩**: 影響アドレスがトランザクションに署名するたびに、その秘密鍵を再構成するのに十分な情報がオンチェーンに漏れる
4. **秘密鍵の再構成**: 攻撃者が公開済みのオンチェーンデータから影響アドレスの秘密鍵を数学的に再構成する。脆弱性はアドレスレベルにあり、同じフレーズを別ウォレットに移しても侵害は残る
5. **自動化された抜き取り**: 2 グループの攻撃者が 6/21〜23 に自動化された掃引を実行し、374 アドレスから約16M ADA を抜き取る
6. **封じ込めと復旧**: SecondFi がメンテナンスモードへ移行、約129M ADA を独立カストディアンへ退避、復旧基金を設置し外部監査を依頼（署名が漏洩した後に作動する事後の系列）

---

## 3. 時系列 — 公表と対応

- 2026-06-08: 外部解析（Tibane Labs／The Block）の指摘によれば、監査済みの EMURGO 署名コードが未監査の第三者 SDK（npm の "trantor"）に差し替えられる
- 2026-06-21〜23: 2 グループの攻撃者が自動化された抜き取りを実行。374 アドレス（171＋203）から約16M ADA が流出
- 2026-06-23 頃: 連続抜き取りが顕在化。SecondFi がメンテナンスモードへ移行し封じ込めに着手
- 2026-06-25: SecondFi が調査アップデートを公表。根本原因（決定論的 nonce 導出の欠陥でアドレスレベルに秘密鍵が露出）と攻撃者 2 グループの特定、約129M ADA の退避、復旧基金の設置を発表
- 2026-06-27: Tibane Labs がフォレンジック報告を公表し、署名コードの差し替え（未監査 SDK "trantor"）を来歴上の指摘として提示
- 以降: 外部セキュリティ企業による監査と復旧プログラムが進行（本 Brief 作成時点でメンテナンス継続）

> 注: 根本原因（決定論的 nonce 導出の欠陥、アドレスレベルの秘密鍵露出）は SecondFi の公表に基づく。署名コードが 2026-06-08 に未監査 SDK（"trantor"）へ差し替えられたとの来歴上の指摘は外部解析（Tibane Labs の 2026-06-27 フォレンジック報告／The Block）による。Tibane Labs は自社で競合ウォレットを開発する立場であり、利害関係を踏まえ、SecondFi/EMURGO の公式見解と併置して扱う。EMURGO は本 Brief 作成時点でポストモーテムを公表していない。規模・日付は最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **SecondFi / EMURGO**: 根本原因（決定論的 nonce 導出の欠陥、アドレスレベルの秘密鍵露出）を公表。約129M ADA を独立カストディアンへ退避し、復旧基金を設置。複数の外部セキュリティ企業に監査を依頼し、メンテナンスモードを継続。約2週間での資産返還を目標と表明。なお EMURGO は本 Brief 作成時点で正式なポストモーテムを公表していない
- **利用者への警告**: 影響アドレスのリカバリーフレーズを別ウォレットに復元しない（侵害はアドレスレベルで残る）。ステーキング報酬の引き出しを避ける（mempool 監視で資金が露出し得る）。公式の復旧プロセスを待ち、サポートポータルから申請する
- **外部解析（Tibane Labs／The Block）**: 監査済み EMURGO 署名コードが 2026-06-08 に未監査の第三者 SDK（npm の "trantor"）へ差し替えられた来歴を、Tibane Labs が 2026-06-27 のフォレンジック報告で指摘。署名器が per-key シークレットを落としていた点を技術的に説明。ただし Tibane Labs は自社で競合ウォレットを開発する立場であり、利害関係を踏まえて公式見解と併置する
- **業界横断の論点**: ウォレットの署名器という最も信頼に依存する層で、本番に投入される暗号コードの来歴検証（CI/CD での署名・来歴固定、依存差し替えの検出、監査済みビルドの証明）が、防御の第一線として改めて共有された

「本番署名に入る暗号コードの来歴を、稼働の前にどう独立検証するか」は、本事案を契機にウォレット／署名基盤設計の論点として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**本番の署名に入る暗号コードが「正規に監査された来歴を持つか（差し替えられていないか）」を稼働の前に独立検証していなかった**点にある。決定論的 nonce 導出の欠陥そのものは proximate cause（直接の引き金）だが、その欠陥を本番署名器に持ち込んだのは、監査済みコードが未監査 SDK に置き換わったという来歴の断絶である。利用者から見れば、ウォレットは正規のまま動いていた。署名器の中身がどの来歴のコードかは、署名のたびに検証されてはいなかった。

本事案は [Brief No.074](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（Taiko、prover の署名鍵が公開リポジトリに漏れ、proof の形式的有効性と署名者の正当性が分離した）と来歴で連なる。074 が「署名鍵という信頼アンカーの管理状態」の来歴不在なら、本事案は「署名する暗号コードそのもの」の来歴不在である。いずれも署名体系の根が、その来歴を独立検証されないまま信頼されていた。[Brief No.045](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)（Humanity Protocol、単一の保管点に置かれた鍵がマルチシグ閾値を超えて資金流出）とは、署名・鍵まわりの信頼アンカーが独立検証されないまま資金移動を認可した点で隣接する。[Brief No.030](https://lemma.frame00.com/ja/critical/briefs/030-stripe-trusted-channel-skimmer/)（Stripe、信頼されたチャネルに載るコードの来歴が汚染）・[Brief No.038](https://lemma.frame00.com/ja/critical/briefs/038-ironworm-npm-self-propagation/)（IronWorm、盗んだ認証情報で自分を再公開する npm ワームが開発者の鍵を抜いた）とは、本番に到達するコード／パッケージの来歴が検証されないまま実行された点で同じ `code-provenance` の系列にある。

決定論的 nonce のような暗号実装の正しさは前提として重要だが、その実装が「監査された正規の来歴を持つコードか」が稼働前に独立検証されて初めて、ウォレット署名を資産運用の現場に安心して載せられる。

SecondFi による根本原因の特定、攻撃者 2 グループのアドレス隔離、約129M ADA の緊急退避、復旧基金の設置、外部セキュリティ企業への監査依頼、利用者への具体的警告（フレーズを復元しない・ステーキング報酬を引き出さない）は、被害の把握・封じ込め・是正に不可欠であり、本 Brief がその役割を否定するものではない。実際、これらの検知・解析によって追加流出の抑止と復旧の枠組みが立ち上がった。検出は確かに機能した。

一方で、検出は受信側（署名を生成する署名器、その署名を信頼する利用者・ネットワーク）が「どのコードで署名するか」自体を変えない。本事案では、署名器に入ったコードが未監査 SDK であっても、ウォレットは正規に動作し、署名は通常通り生成された。欠けていたのは「いま署名している暗号コードは、正規に監査された来歴を持つか——差し替えられていないか」を署名の前に独立検証する層であり、これは署名そのものの実行とは別系統の検証である。異常検知が抜き取りの後に発火しても、署名のたびに漏れた情報からの秘密鍵再構成は止まらない。監査で「このウォレットの署名は、監査済みの正規コードによって生成されたか」を立証する材料として、ウォレットが正常に動作していたという事実だけでは、署名コードの来歴の独立した証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、本番の署名に入る暗号コードの来歴を、署名の前に独立検証可能な形で固定する。署名器が「正規に監査された来歴を持つコードである」ことを事前証明し、来歴が確認できなければ署名を実行しない。ウォレットの正常動作の確認（detection 的な「アプリは普通に動いている」）と、署名コードの来歴の事前証明（「署名している実装は監査済みの正規物だ」）を切り離さず、両者が重なって初めて、ウォレット署名を実務に安心して載せられる。検出と事前証明は代替ではなく **補完** の関係にある。

本事案で露呈した検出と証明の落差（本番署名に入る暗号コードの来歴が、稼働の前に独立検証されていない）に対し、Lemma は以下の設計を提示する。

- **署名コードの来歴証明**: ウォレットの署名器に入る暗号コードが「正規に監査された来歴を持つビルドである」ことを、署名の前に独立検証可能な来歴証明として固定し、差し替えられた未監査コードを稼働前に排除する
- **依存差し替えの来歴固定**: 署名に関わる依存・SDK の変更を、改ざんできない来歴として固定し、監査を経ていない差し替えが本番署名器に到達する経路を断つ
- **正常動作 ≠ コード来歴**: 「ウォレットが正常に動いている」事実と「署名している実装が正規の来歴を持つ」事実を切り離さず、後者を事前証明の対象とする
- **選択的開示**: 署名実装やビルドパイプライン全体を開示せずに、「この署名器は監査済みの正規来歴を持つ」ことだけを最小開示で証明する

検出（事後の原因特定・資金退避・補償・監査）は被害の是正に、事前証明（署名前の署名コードの来歴の独立検証）はウォレット署名の信頼確立に、それぞれ相補的に働く。設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) および [Seal](https://lemma.frame00.com/ja/seal/) を参照のこと。

---

## 6. Sources

- **The Block**: "SecondFi maps recovery path after $2.4 million Cardano wallet exploit, aims to return funds within two weeks"（2026-06）— <https://www.theblock.co/post/406457/secondfi-maps-recovery-path-after-2-4-million-cardano-wallet-exploit-aims-to-return-funds-within-two-weeks>
- **AMBCrypto**: "Cardano wallet exploit: SecondFi traces attack to private key flaw, warns users not to restore seed phrases"（2026-06-25）— <https://ambcrypto.com/cardano-wallet-exploit-secondfi-traces-attack-to-private-key-flaw-warns-users-not-to-restore-seed-phrases/>
- **crypto.news**: "SecondFi keeps two-week recovery plan after $2.4M Cardano wallet exploit"（2026-06）— <https://crypto.news/secondfi-keeps-two-week-recovery-plan-after-2-4m-cardano-wallet-exploit/>
- **Crypto Briefing**: "SecondFi wallet vulnerability drains $2.4M in Cardano assets"（2026-06）— <https://cryptobriefing.com/secondfi-wallet-vulnerability-cardano-drain/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
