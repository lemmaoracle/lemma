---
brief_no: 74
title: "Taiko ブリッジ：proof は正しく検証されたのに、署名鍵の漏洩で偽の出金が「有効」と通った — prover の署名鍵が公開リポジトリに漏れ、proof の形式的有効性と prover identity の独立検証が分離した構造（BlockSec / Blockaid）"
title_en: "Taiko Bridge: Forged Withdrawals Passed as Valid After a Prover Signing Key Leaked — a prover signing key leaked to a public repo, splitting a proof's formal validity from independent verification of prover identity (BlockSec / Blockaid)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["code-provenance", "identity-auth"]
incident_date: 2026-06-22
published: 2026-06-23
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["067-syscoin-bridge-spv-proof-parsing", "016-verus-ethereum-bridge", "023-alephium-tokenbridge", "045-humanity-protocol-multisig-key-custody", "002-stakedao-vsdcrv", "001-kelpdao-rseth"]
status: published
version: "1.0"
og_lead_ja: "prover の署名鍵漏洩で偽の出金が「有効」と通った — Taiko ブリッジ"
og_lead_en: "A leaked prover signing key let forged withdrawals pass as valid — Taiko bridge"
gap_detected: "発覚後のブロック生成停止・ブリッジ出金停止・取引所への入金停止要請・攻撃者アドレスの公開は機能し、Blockaid が異常を実時間で検知できた。"
gap_missing: "「この proof に署名した prover は正規の認可された主体か——署名鍵は漏洩していないか」を出金実行の前に独立検証する層が無く、形式上有効な偽 proof は素通りした。"
gap_fix: "出金実行の前に「この proof に署名した prover は認可された主体であり、署名鍵は侵害されていない」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Taiko（Ethereum の Layer 2）のブリッジで、相手チェーンに対応する入金がないのに、約 170 万ドル相当の資産が Ethereum 側の vault から引き出された。暗号方式が破られたのではない。Taiko の proof を生成する prover の署名鍵（Raiko の SGX enclave 用署名鍵）が GitHub 上に公開状態で残されており、攻撃者はその鍵で自分の prover を正規の参加者として登録し、形式上「有効」な偽の出金 proof に署名した。オンチェーンの検証器はこの proof を正しいものとして受理した。発覚後の実時間検知・ブロック生成停止・取引所への入金停止要請・該当アドレスの公開は機能したが、「この proof に署名した prover は、本当に正規の認可された prover か」を出金実行の前に独立検証する層が無かった。proof が暗号的に有効であることと、それに署名した主体の正当性が実在することが分離されていた。

---

## 2. 何が起きたか

- **対象**: Taiko の L1（Ethereum）ブリッジおよび ERC20 Vault。Taiko は Ethereum の Layer 2 で、Raiko と呼ばれる multi-prover スタックを用いて取引の正当性を proof で裏づける設計
- **被害規模**: 約 170 万ドル相当の資産が Ethereum 側 vault から流出（当初は 100 万ドル超と概算、後に約 170 万ドルへ更新）。TAIKO トークンは開示後に 20% 超下落
- **発生日**: 2026-06-22。同日、Taiko はブロック生成を停止し、チェーン上に展開された全ブリッジからの資金引き上げを利用者に呼びかけた
- **根本原因（BlockSec の指摘）**: Raiko の prover が用いる Intel SGX enclave の**署名鍵が GitHub 上に公開状態**で残されていた。本来この鍵はセキュアハードウェア内に封印され、認可された prover だけが有効な proof を生成できる前提だった
- **悪用の核心**: 鍵が露出していたため、攻撃者は**自分の prover をネットワークの正規参加者として登録**し、偽の出金 proof に署名できた。Taiko のオンチェーン検証器はこの proof を「有効」として受理し、ブリッジはそれに基づいて出金を認可した。結果、Taiko 側に対応する `MessageSent` イベント（入金）が無いまま、Ethereum 側で偽の出金要求が通った
- **検知**: ブロックチェーンセキュリティの Blockaid が exploit 検知システムで実時間に検知し、被害コントラクト・攻撃者ウォレット・exploit 取引を共有
- **封じ込め**: Taiko はおよそ米国東部時間 2:08 に封じ込めを確認。L1 Bridge と ERC20 Vault の出金を完全停止。攻撃者は凍結前に約 200 万 TAIKO（約 17 万ドル相当）を取引所 MEXC のアカウントへ移動済み。Security Council（マルチシグのガバナンス体）を起動し、技術・法的措置の両面で対応すると表明。完全なポストモーテムは調査完了後に公表予定
- **文脈**: 2026 年の cross-chain ブリッジ関連 exploit は累計 3 億 4,000 万ドル超に達したとされ、いずれも「相手チェーンで実際に起きたことを、宛先チェーンがどう検証するか」という同じ問いに帰着している

事象は次の連鎖で成立している。

1. **署名鍵の露出**: Raiko（Taiko の multi-prover スタック）の prover が用いる SGX enclave 署名鍵が、公開された GitHub リポジトリ上に残されていた。本来はハードウェア内に封印され外部に出ない前提の鍵
2. **不正 prover の登録**: 露出した鍵を用い、攻撃者は自分の prover をネットワークの正規参加者として登録する。proof を生成する権限の根拠（鍵）そのものが攻撃者の手に渡った
3. **偽 proof への署名**: 攻撃者は、相手チェーンに対応する入金（`MessageSent` イベント）が存在しない出金要求について、形式上「有効」な proof に署名する。暗号アルゴリズム自体は破られていない
4. **検証器による受理**: Taiko のオンチェーン検証器は、正規 prover の鍵で署名された proof として、この偽 proof を有効と受理する
5. **裏づけなき出金の実行**: ブリッジが proof を信頼して出金を認可し、Ethereum 側 ERC20 Vault から約 170 万ドル相当が引き出される
6. **資産の移動と封じ込め**: 攻撃者が約 200 万 TAIKO を取引所へ移動。Blockaid の実時間検知を受け、Taiko が出金停止・ブロック生成停止・Security Council 起動で封じ込めに動く（proof が受理された後に作動する事後の系列）

---

## 3. 時系列 — 公表と対応

- 2026-06-22: Blockaid の検知システムが exploit を実時間で検知し、コミュニティに警告
- 2026-06-22: 偽の出金 proof により Ethereum 側 vault から約 170 万ドル相当が流出。攻撃者は凍結前に約 200 万 TAIKO を MEXC へ移動
- 2026-06-22（米国東部時間 2:08 頃）: Taiko が封じ込めを確認。L1 Bridge / ERC20 Vault の出金を完全停止、ブロック生成を停止、取引所に TAIKO 入金の停止を要請
- 2026-06-22: Taiko が攻撃者アドレスを複数公開し、Security Council を起動。技術・法的措置を表明
- 2026-06-22: BlockSec が root cause（GitHub に露出した Raiko の SGX 署名鍵）を特定
- 以降: Taiko が完全なポストモーテムの公表を予告（本 Brief 作成時点で未公表）

> 注: 本 Brief の技術的事実は BlockSec・Blockaid の解析および確立メディアの報道に基づく。root cause は Taiko の正式ポストモーテム公表前であり、現時点で「GitHub に露出した SGX 署名鍵」がセキュリティ各社により指摘されている段階として記す。規模・帰属の断定は避け、出所を明示する。

公表後の対応と業界の動きは次のとおり。

- **Taiko**: 攻撃当日にブロック生成を停止し、L1 Bridge / ERC20 Vault の出金を完全停止。取引所に TAIKO 入金の停止を要請し、Security Council を起動。攻撃者アドレスを公開し、技術・法的措置を表明。完全なポストモーテムを調査完了後に公表予定
- **Blockaid**: exploit を実時間で検知し、被害コントラクト・攻撃者ウォレット・exploit 取引を共有して早期警告
- **BlockSec**: root cause（GitHub に露出した Raiko の SGX 署名鍵）を特定し、鍵管理がブロックチェーン基盤の運用上もっとも重要な課題の一つであることを改めて可視化
- **業界横断の論点**: 2026 年のブリッジ関連 exploit は累計 3 億 4,000 万ドル超に達したとされ、「偽の cross-chain proof」を核とする事例が反復。proof の暗号強度ではなく、proof を生成する権限（署名鍵）の管理・来歴と、署名者の正当性検証が、ブリッジの安全性を左右する論点として再認識された
- **鍵管理の実務**: CI/CD パイプラインでの secret スキャン、commit 前の認証情報検出フック、HSM（ハードウェアセキュリティモジュール）連携など、鍵が本番に到達する前に露出を捕捉する運用が、防御の第一線として共有された

「cross-chain の proof を、形式的有効性とは別に、署名者の正当性・鍵の健全性としてどう独立検証するか」は、本事案を契機に multi-prover / TEE ブリッジ設計の必須要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、cross-chain の出金を認可する根拠である proof が、**「暗号的に有効に検証されること」と「その proof に署名した prover が正規の認可された主体であること」に分離されたまま受理された**点にある。検証器は「この proof は正規 prover の鍵で署名され、形式上有効」を確認したが、「その鍵を握る prover が本当に認可された主体か（鍵が漏れていないか）」を独立に保証しなかった。署名鍵という信頼アンカーの来歴・管理状態が検証から切り離されていたため、鍵の露出が proof 体系全体を素通りする入口になった。

兄弟事案の [Brief 067](https://lemma.frame00.com/ja/critical/briefs/067-syscoin-bridge-spv-proof-parsing/)（Syscoin、SPV proof のパース欠陥で偽 proof が「有効な burn の証明」と受理）と表裏の関係にある。067 は proof の**検証ロジック**が偽 proof を取り違えた事案、本事案は proof は正しく検証されたが**署名者の正当性**が独立検証されなかった事案である。いずれも「形式上の有効性」と「それが指す事実・主体の実在」が切り離されている。[Brief 016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（Verus-Ethereum、Merkle Proof は有効でも入出力額の整合が未検証）・[Brief 023](https://lemma.frame00.com/ja/critical/briefs/023-alephium-tokenbridge/)（Alephium、guardian の鍵は無事でも署名対象イベントの来歴が未検証）とも同じ `bridge-config-trust` で primitive が同型。とりわけ [Brief 045](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)（Humanity Protocol、単一の保管点に置かれた鍵がマルチシグ閾値を超えて資金流出）とは、**鍵という信頼アンカーの保管・来歴が独立に検証されないまま、その鍵への信頼だけで資金移動が認可される**点で直接連なる。

multi-prover や TEE（SGX のような信頼実行環境）は、proof の生成を分散・堅牢化する設計だが、その安全性は最終的に「署名鍵がハードウェア内に封印され続けている」前提に依存する。鍵が公開リポジトリに漏れた時点で、どれほど洗練された暗号構成も信頼モデルごと崩れる。proof が通っても、それに署名した prover の正当性が独立検証されて初めて、cross-chain の出金を決済・運用の現場に安心して載せられる。

Blockaid による実時間の exploit 検知、Taiko の即時のブリッジ停止・ブロック生成停止、取引所への入金停止要請、攻撃者アドレスの公開、Security Council を通じた封じ込めは、被害の早期把握と拡大抑止に不可欠であり、本 Brief がその役割を否定するものではない。実際、検知の速さが損失を約 170 万ドルにとどめ、ネットワーク停止で追加流出を防いだ。

一方で、検出は受信側（オンチェーン検証器、出金を認可するブリッジ）が「どの proof を、誰の署名として accept するか」自体を変えない。本事案では、攻撃者の prover が露出鍵で正規参加者として登録され、その署名は形式上有効だったため、検証器の検証は通過した。欠けていたのは「この proof に署名した prover は、本当に認可された主体か——署名鍵は漏洩していないか」を出金実行の前に独立検証する層であり、これは proof の形式的検証とは別系統の検証である。異常検知が出金の後に発火しても、検証器が accept した時点の認可は止まらない。規制報告・監査で「この cross-chain 出金は、正規の認可された prover による proof に裏づけられていたか」を立証する材料として、proof が形式上有効だったという事実だけでは、署名者の正当性の独立した証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、cross-chain の proof を、受信側が出金実行の前に独立検証可能な形で受け取り、proof の形式的有効性と切り離して「この proof に署名した prover は認可された主体であり、その署名鍵は侵害されていない」ことを検証する設計を採る。署名者の正当性が確認できなければ、proof が形式上通っても出金を事前に block する。proof の形式的受理（detection 的な「この proof は通る」）と、署名者の正当性の事前証明（「署名した prover は正規で、鍵は無事」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、cross-chain の出金を安心して実務に出せる。

本事案で露呈した検出と証明の落差（cross-chain の proof が、形式的有効性とは別に、署名した prover の正当性・鍵の健全性として独立検証されていない）に対して、Lemma は、cross-chain で受け渡される proof を、受信側が出金実行の前に独立検証可能な形で扱う設計を提示している。

- **署名者正当性の事前証明**: proof の形式的有効性と切り離して、「この proof に署名した prover は認可された主体であり、その署名鍵は侵害されていない」ことを検証し、確認できなければ出金を事前に reject する
- **鍵を送らない認可**: 署名鍵そのものを共有・露出させる前提を排し、鍵を一度も送らずに「認可された prover である」ことだけを証明する Proof-as-Auth の設計に寄せる
- **信頼アンカーの来歴固定**: prover の登録・鍵の管理状態を、改ざんできない来歴として固定し、露出・無認可の prover を出金認可の経路から排除する
- **選択的開示**: prover の内部状態や鍵そのものを開示せずに、「この署名者は正規で侵害されていない」ことだけを最小開示し、独立検証と機微情報保護を両立する

「暗号論理的に有効 ≠ 署名した主体が正規である」という来歴証明カテゴリの設計思想に対し、本事案はその想定する failure mode が直近の現実の損失として顕在化した事例である。検出（事後の停止・凍結・解析）は被害の是正に、事前証明（出金実行前の署名者正当性の独立検証）は cross-chain 出金の信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **thirdweb（技術解説・BlockSec / Blockaid を引用）**: “Taiko Bridge Exploit Explained: How a Leaked Key Led to $1.7M in Forged Withdrawals”（2026-06-22）— <https://blog.thirdweb.com/taiko-bridge-exploit-explained-how-a-leaked-key-led-to-1-7m-in-forged-withdrawals/>
- **CoinDesk**: “Taiko halts its Ethereum layer 2 network after a bridge exploit, token dives 10%”（2026-06-22）— <https://www.coindesk.com/tech/2026/06/22/taiko-halts-its-ethereum-layer-2-network-after-a-bridge-exploit-token-dives-10>
- **The Block**: “Ethereum Layer 2 Taiko halts block production following exploit; urges users to withdraw funds”（2026-06-22）— <https://www.theblock.co/post/405486/taiko-confirms-exploit>
- **Crypto Times**: “$1.7M Gone: Taiko Bridge Exploited After SGX Signing Key Leak”（2026-06-22）— <https://www.cryptotimes.io/2026/06/22/1-7m-gone-taiko-bridge-exploited-after-sgx-signing-key-leak/>
- **Bankless Times**: “Taiko Halts Blocks After $1.7M Exploit, Urges Users to Exit Bridges”（2026-06-22）— <https://www.banklesstimes.com/articles/2026/06/22/taiko-halts-blocks-after-1-7m-exploit-urges-users-to-exit-bridges/>
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
