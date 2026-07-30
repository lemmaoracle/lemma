---
brief_no: 85
title: "Secret Network：偽のチャネルから届いた入金が検証されず、裏づけのない wrapped トークンが無限に発行された"
title_en: "Secret Network: Deposits From a Forged Channel Went Unverified, Letting Unbacked Wrapped Tokens Be Minted Without Limit"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth", "data-provenance"]
incident_date: 2026-06-19
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["067-syscoin-bridge-spv-proof-parsing", "016-verus-ethereum-bridge", "023-alephium-tokenbridge", "074-taiko-bridge-prover-key-leak"]
status: "published"
version: "1.0"
og_lead_ja: "Secret Network：偽チャネルからの入金が無検証で、裏づけのない wrapped トークンが無限 mint（約$4.67M）"
og_lead_en: "Secret Network: forged-channel deposits went unverified, minting unbacked wrapped tokens (~$4.67M)"
gap_detected: "routine な送金が escrow 残高不足で失敗して異常が発覚し、Axelar emergency committee が Secret / Secret-SNIP 両接続を無効化して追加流出を止めた。"
gap_missing: "mint の前に「このメッセージが正規チャネル由来で、ソースチェーンで対応する burn が起きた」ことを独立検証する層が無く、残高暗号化により担保不足すら約 7 日間観測できなかった。"
gap_fix: "来歴証明を mint の前提条件にし、送信元チャネルと burn イベントの暗号的証明が伴わないメッセージは発行（mint/release）に到達させない。"
---

## 1. TL;DR

Secret Network と Axelar をつなぐ IBC ブリッジで、相手チェーンに対応する裏づけがないのに、約467万ドル（$4.67M）相当の資産が引き出された。暗号方式が破られたのではない。Secret 側の ICS-20 スマートコントラクトが、入金してくる token transfer の「発信元 IBC チャネル」を検証せず、denomination（通貨種別）のパスだけを見ていた。攻撃者は自前の単一バリデータ Cosmos SDK チェーンを立て、脆弱なコントラクトへ新しい IBC チャネルを開き、偽造した入金パケットを送ることで、裏づけのない wrapped トークンを Secret 上で無制限に発行（infinite-mint）し、それを正規の Axelar IBC チャネル経由で本物の資産に交換した。Secret はプライバシーチェーンで残高が暗号化されているため、この流出は約7日間気づかれず、正規の cross-chain 送金が「エスクロー残高不足」で失敗して初めて発覚した。Axelar の緊急委員会が Secret／Secret-SNIP 接続を停止して封じ込めたが、「この入金は正規の発信元チャネルから来たのか」を発行の前に独立検証する層が無かった。

---

## 2. 何が起きたか

- **対象**: Secret Network と Axelar をつなぐ Cosmos IBC ブリッジ。脆弱性は Secret 側の ICS-20 スマートコントラクトに限局
- **被害規模**: 約467万ドル（$4.67M）相当。流出トークンの内訳は公開情報では非開示
- **発生（推定）**: 2026-06-10 頃に流出が始まったとされる。約7日間検知されず、2026-06-19 に Axelar が接続を停止（タイムラインは後述の通り出典により幅があり、公式ポストモーテムで最終確認）
- **手口**: infinite-mint（裏づけのない wrapped トークンの無制限発行）。攻撃者は自前の単一バリデータ Cosmos SDK チェーンを作成し、脆弱なコントラクトへ新しい IBC チャネルを開き、偽造した入金パケットを送付。発信元チャネルと denomination パスの検証を回避して、裏づけのない wrapped トークンを Secret 上で発行し、正規の Axelar IBC チャネル経由で本物の資産に交換した
- **根本原因（外部解析の指摘）**: Secret 側 ICS-20 コントラクトが、入金してくる token transfer の発信元 IBC チャネル（来歴）を検証せず、denomination のパスだけを確認していた。発信元の真正性が検証されないため、攻撃者が用意した偽チャネルからの入金が正規の入金として受理された
- **検知が遅れた理由**: Secret はプライバシーチェーンで残高が暗号化されているため、不正発行・流出が約7日間可視化されなかった。正規の cross-chain 送金がエスクローの残高不足で失敗して初めて異常が表面化した
- **封じ込め**: Axelar の緊急委員会が Secret／Secret-SNIP 接続を停止し、追加流出を防止。関係する取引所・法執行機関に連絡し、調査を継続。現時点の知見では Axelar ネットワークの他の部分に影響はないとされる

事象は次の連鎖で成立している。

1. **偽チャネルの用意**: 攻撃者が自前の単一バリデータ Cosmos SDK チェーンを立て、Secret 側の脆弱な ICS-20 コントラクトへ新しい IBC チャネルを開く
2. **偽造入金パケットの送付**: 用意したチャネルから、偽造した入金（token transfer）パケットを脆弱なコントラクトへ送る
3. **発信元検証の不在**: ICS-20 コントラクトは入金の denomination パスだけを確認し、発信元 IBC チャネルの真正性を検証しない。偽チャネルからの入金が正規の入金として受理される
4. **裏づけなき発行（infinite-mint）**: 受理された偽入金に応じて、裏づけのない wrapped トークンが Secret 上で発行される。供給を担保する実資産は存在しない
5. **正規チャネル経由の交換**: 発行された無裏づけ wrapped トークンを、正規の Axelar IBC チャネル経由で本物の資産（約467万ドル相当）に交換・引き出す
6. **不可視期間**: Secret の残高暗号化により、約7日間流出が検知されない
7. **発覚と封じ込め**: 正規送金がエスクロー残高不足で失敗して発覚。Axelar 緊急委員会が接続を停止（発行・流出が起きた後に作動する事後の系列）

---

## 3. 時系列 — 公表と対応

- 2026-06-10 頃（推定）: Secret 側 ICS-20 コントラクトへの偽造入金により infinite-mint が始まり、裏づけのない wrapped トークンが正規チャネル経由で本物の資産に交換される
- 〜約7日間: 残高暗号化により流出が検知されない
- 2026-06-17 頃（推定）: 正規の cross-chain 送金がエスクロー残高不足で失敗し、異常が発覚
- 2026-06-19: Axelar の緊急委員会が Secret／Secret-SNIP 接続を停止。取引所・法執行機関へ連絡し調査を開始

> 注: 流出開始日（推定2026-06-10）と発覚日（推定2026-06-17 頃）は外部解析・報道に基づく推定であり、出典により幅がある（接続停止の 2026-06-19 は複数ソースで一致）。「7日間検知されず」「発信元チャネル未検証で infinite-mint」「単一バリデータ Cosmos SDK チェーンからの偽造入金」は The Block ほか外部解析が一致して指摘している。コントラクトの脆弱性が混入した時期は公開情報では未特定（fork／カスタム ICS-20 実装の段階で発信元検証が欠落したとみられる）。規模・日付・根本原因の最終確定は公式ポストモーテムを参照されたい。

公表後の対応と業界の動きは次のとおり。

- **Axelar**: 緊急委員会が Secret／Secret-SNIP 接続を停止し、追加流出を防止。関係取引所・法執行機関に連絡し調査を継続。現時点の知見では Axelar ネットワークの他部分に影響はないとした
- **Secret Network**: ICS-20 コントラクトの発信元チャネル検証の欠落が外部解析で指摘される。公式ポストモーテムでの根本原因・規模・タイムラインの確定が待たれる
- **外部解析（The Block ほか）**: infinite-mint の手口（偽チャネルからの偽造入金で無裏づけ wrapped トークンを発行→正規チャネルで実資産に交換）と、約7日間の不可視性（残高暗号化）を一致して指摘
- **業界横断の論点**: 2026 年の cross-chain ブリッジ関連 exploit は累計で $340.7M／14 件に達したとされ（PeckShield、2026-06-01 時点）、いずれも「相手チェーンで実際に起きたこと（発信元・額・イベント）を、宛先チェーンがどう独立検証するか」という同じ問いに帰着している。IBC のような汎用 cross-chain 規格でも、受信側コントラクトが発信元チャネルの真正性を検証することが、ブリッジ安全性の要として再認識された

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**受信側が wrapped トークンを発行する根拠である「入金」が、その発信元チャネルの真正性（どこから来たか＝来歴）を独立検証されないまま受理された**点にある。コントラクトは denomination の整合（何のトークンか）は見たが、発信元チャネルの真正性（正規のブリッジ経路から来たか）を見なかった。来歴の検証が欠けていたため、攻撃者が用意した偽チャネルからの入金が正規の入金として通り、無裏づけの発行に直結した。

本事案は [Brief No.016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（Verus-Ethereum、Merkle Proof は有効でも入出力額の整合が未検証）・[Brief No.067](https://lemma.frame00.com/ja/critical/briefs/067-syscoin-bridge-spv-proof-parsing/)（Syscoin、SPV proof のパース欠陥で偽 proof が「有効な burn の証明」として受理）・[Brief No.023](https://lemma.frame00.com/ja/critical/briefs/023-alephium-tokenbridge/)（Alephium、guardian の鍵は無事でも署名対象イベントの来歴が未検証）と同型である。いずれも cross-chain で受け渡される「相手チェーンで実際に起きたこと」の一部分（額・形式・イベント・チャネル）だけが検証され、全体としての真正性・来歴が独立検証されていない。本事案はそのうち「入金の発信元チャネル」という来歴の次元が欠けた事例だ。[Brief No.074](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（Taiko、署名鍵の漏洩で署名者の正当性が独立検証されないまま proof が受理）とは、cross-chain の資産移動を認可する根拠の真正性が独立検証されなかった点で連なる。

本事案にはもう一つの層がある。Secret のプライバシー設計（残高暗号化）により、不正発行・流出が約7日間検知されなかった。これは「検出の強化」では届きにくい構造を示している——監視を厚くしても、残高が暗号化されていれば異常は見えにくい。だからこそ、入金の来歴を発行の前に独立検証する層が要る。

Axelar 緊急委員会による接続停止、取引所・法執行機関への連絡、被害範囲の特定、ネットワーク他部分の無影響の確認は、追加流出の抑止と被害把握に不可欠であり、本 Brief がその役割を否定するものではない。実際、これらの対応が損失を約467万ドルにとどめ、接続停止で追加発行を止めた。検出と事後対応は確かに機能した。

一方で、本事案では検出そのものが二重に難しかった。第一に、受信側（ICS-20 コントラクト）が「どの入金を、どの発信元から accept するか」自体を変えない限り、偽チャネルからの入金は正規の入金として受理され続ける。第二に、Secret の残高暗号化により、不正発行・流出は約7日間そもそも可視化されなかった。欠けていたのは「この入金は正規の発信元チャネルから来たのか」を発行の前に独立検証する層であり、これは denomination の整合確認とは別系統の検証である。異常検知が——たとえ可視だったとしても——発行の後に発火しても、コントラクトが受理した時点の無裏づけ発行は止まらない。監査で「この wrapped トークンは正規の入金に裏づけられて発行されたか」を立証する材料として、denomination が整合していたという事実だけでは、発信元の来歴の独立した証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、cross-chain の入金を、受信側が wrapped トークンを発行する前に独立検証可能な形で受け取り、denomination の整合とは切り離して「この入金は正規の発信元チャネルから来た真正なものである」ことを検証する。発信元の真正性が確認できなければ、denomination が整合していても発行を事前に block する。形式的な受理（detection 的な「この入金は通る」）と、発信元チャネルの来歴の事前証明（「この入金は正規の経路から来た」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、cross-chain ブリッジの発行・交換を安心して実務に出せる。

本事案で露呈した検出と証明の落差（cross-chain 入金の発信元チャネルの来歴が、wrapped トークン発行の前に独立検証されていない）に対し、Lemma は以下の設計を提示する。

- **入金来歴の事前証明**: 受信側が wrapped トークンを発行する前に、入金の発信元チャネルが「正規の経路から来た真正なものである」ことを、denomination の整合とは切り離して独立検証し、確認できなければ発行を事前に reject する
- **発信元真正性の固定**: 正規のブリッジ経路（チャネル）の identity を改ざんできない来歴として固定し、攻撃者が用意した偽チャネルからの入金を発行経路から排除する
- **可視性に依存しない防御**: 残高が暗号化され事後の異常検知が効きにくい環境でも、発行の前に来歴を検証することで、不可視期間中の無裏づけ発行そのものを起こさせない
- **選択的開示**: 入金経路の内部状態を開示せずに、「この入金は正規の発信元から来た」ことだけを最小開示で証明する

検出（事後の接続停止・追跡・封じ込め）は被害の是正に、事前証明（発行前の入金来歴の独立検証）は cross-chain ブリッジの信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **The Block**: “Secret Network’s Axelar bridge drained for $4.67 million in infinite-mint exploit that went unnoticed for seven days”（2026-06）— <https://www.theblock.co/post/405459/secret-networks-axelar-bridge-drained-for-4-67-million-in-infinite-mint-exploit-that-went-unnoticed-for-seven-days>
- **crypto.news**: “Axelar shuts down Secret Network bridge routes after $4.7M exploit”（2026-06）— <https://crypto.news/axelar-shuts-down-secret-network-bridge-routes-after-4-7m-exploit/>
- **CryptoTimes**: “$4.67M Exploit Hits Axelar-Secret Network Bridge, Links Disabled”（2026-06-19）— <https://www.cryptotimes.io/2026/06/19/4-67m-exploit-hits-axelar-secret-network-bridge-links-disabled/>
- **Bitcoinist**: “Secret Network Bridge Exploited for $4.67M in Infinite-Mint Attack”（2026-06）— <https://bitcoinist.com/02-secret-network-axelar-bridge-drained-in-infinite-mint/>
- **BanklessTimes**: “Secret Network Bridge Exploit Drains $4.67M From Axelar Link”（2026-06-20）— <https://www.banklesstimes.com/articles/2026/06/20/secret-network-bridge-exploit-drains-4-67m-from-axelar-link/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/)、[Seal](https://lemma.frame00.com/ja/seal/)
