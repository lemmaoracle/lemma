---
brief_no: 1
title: "KelpDAO / rsETH 不正アンロック — DVN 観測層への RPC 改ざん攻撃"
title_en: "KelpDAO / rsETH Unauthorized Unlock — RPC Manipulation Attack on the DVN Observation Layer"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-04-18
published: 2026-05-29
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["002-stakedao-vsdcrv", "016-verus-ethereum-bridge"]
version: "1.0"
status: published
og_lead_ja: "DVN 観測層への RPC 改ざんで不正アンロック — KelpDAO / rsETH"
og_lead_en: "RPC manipulation on the DVN observation layer unlocked the bridge — KelpDAO / rsETH"
gap_detected: "事象後の監視で被害の輪郭を絞り込み、影響範囲の同定に貢献できた。"
gap_missing: "署名の鍵も手続きも正規だったため「署名対象のデータが本物か」を承認の前に確かめる層が無く、改ざんされた入力に正規の承認が下りた。"
gap_fix: "資産を動かす前に「このメッセージは正規の出所から来ている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

KelpDAO / rsETH で、LayerZero Labs の内部 RPC が改ざんされ、DVN が改ざんデータに正規署名を下し、116,500 rsETH（約 460 億円相当）が不正アンロックされた。盗まれたのは署名鍵ではなく、承認が参照する観測層の入力である。署名も手続きも正規だったため、署名鍵の異常使用を見る事後の検出は発火しにくい構造だった。効かなかったのは、承認の前に「署名対象のデータが本物か」を独立に確かめる層である——検出と事前証明は代替でなく、補完の関係にある。

---

## 2. 何が起きたか

- **被害規模**: 116,500 rsETH(約 $292M、当時レート約 ¥460 億)が不正アンロック
- **対象プロトコル**: KelpDAO(rsETH リキッドリステーキング)
- **基盤**: LayerZero v2 を介した cross-chain message
- **被害認識**: 2026-04-18
- **攻撃の起点(LayerZero Labs 公表に基づく)**: LayerZero Labs オペレーション環境への侵入(2026-03 期、社会工学を経由した経路が指摘されている)
- **改ざんされた資産**: LayerZero Labs の内部 RPC クラウド環境(複数の内部 RPC ノード)
- **侵害されなかった資産**: LayerZero Labs DVN 署名鍵そのもの
- **公式情報**: LayerZero Labs incident statement および 5 月の続報 update。「observation layer」の独立カテゴリ化と、LayerZero Labs DVN の 1-of-1 構成署名拒否・3-of-3 default 化を含む

攻撃は次の連鎖で成立している(LayerZero Labs 公表に基づく)。

1. **Initial compromise**: LayerZero Labs オペレーション環境への侵入(社会工学を起点とする経路が指摘されている)
2. **Lateral movement**: 侵入した攻撃者が LayerZero Labs の RPC クラウド環境内の内部 RPC ノードを改ざん
3. **Detection evasion(観測層の分裂)**: 改ざんされた内部 RPC ノードは、監視ツールに対しては正常応答を返し、LayerZero Labs DVN の署名サービスに対しては改ざんされた応答を返す二面構成
4. **DoS による quorum 強制**: 外部 RPC プロバイダーへの DoS により、DVN 署名サービスが結果的に侵害された内部 RPC ノードのみを参照する状態に陥る(failover が poisoned RPC 側へ寄った)
5. **正規署名 × 改ざんデータ**: DVN は改ざんデータに対して正規の署名プロセスを実行。署名鍵そのものは攻撃を受けていないが、署名対象となる入力データが操作されているため、結果として偽メッセージへの「有効な」証明が生成される
6. **Impact realization**: 1-of-1 単一 DVN 構成のもと、この単一証明が KelpDAO 側で承認資格を持ち、rsETH 116,500 が unauthorized unlock として実現

---

## 3. 時系列 — 公表と対応

- 2026-03 期(LayerZero Labs 公表に基づく推定): 社会工学を起点とする LayerZero Labs オペレーション環境への侵入が指摘されている期間
- 2026-04-18: KelpDAO の rsETH 116,500 が不正アンロック
- 2026-04-22 前後: 業界 incident response 開始
- 2026-05 月: LayerZero Labs が incident statement と続報 update を公開。「observation layer」の独立カテゴリ化、LayerZero Labs DVN の 1-of-1 構成署名拒否ポリシー、3-of-3 default 化を発表

LayerZero Labs が公表した対応(2026-05 incident statement 時点)は次のとおり。

- LayerZero Labs DVN は今後、1-of-1 構成での署名を拒否
- LayerZero v2 default は ≥3-of-3 DVN 構成
- クラウド環境を全面再構築、短命 credentials、IAM 変更は複数人 review
- 独立 RPC ソース quorum を必須化、RPC プロバイダー・ホスティング環境・地域の多重化
- 業界パートナー数百社に対して 4 週間にわたり security posture 強化の支援を実施、継続予定

> 注: 固有名・日付・被害額は LayerZero Labs の公式 incident statement および各社の独立解析（Chainalysis・Halborn・Galaxy Research 等）の一次情報に基づき、各実装の対応状況は時点により異なるため最新情報を参照のこと。

---

## 4. なぜ止まらなかったか

本事案の失敗は、署名鍵の管理でも検出の精度でもない。**cross-chain bridge の verifier が「メッセージの origin」を判断する際に参照する観測層の入力に、独立検証の層が無かった**ことにある。LayerZero Labs DVN が参照する RPC 応答は、侵害されたオペレーション環境内の単一主体で操作可能な状態に置かれていた。

検出は効いていた——事象後の監視は blast window を狭め、影響範囲の同定に貢献した。効かなかったのは、その手前である。署名鍵は侵害されず署名プロセスも正規だったため、検出側の典型的観測点（署名鍵の異常使用、署名サービスの誤動作）には映らない。「99.7% で異常」型の信頼度スコアは、正規プロセスが操作された入力に正規署名を出す事案では発火しにくい。これは検出ツールの設計が劣っているのではなく、承認の前に「署名対象のデータが本物か」を独立に確かめる層が、検出と立証（規制報告・行政手続き・訴訟での「許可されていない権限行使があった」立証）の間に欠けていたということである。

同じ構造の隣接事案として、5 月の **Stake DAO vsdCRV 不正ミント**（[Brief 002](https://lemma.frame00.com/ja/critical/briefs/002-stakedao-vsdcrv/)）がある。共通するのは cross-chain bridge の信頼設定が単一主体の支配下にある点で、本事案は DVN 観測層への RPC 改ざん、Stake DAO 事案はデプロイヤー秘密鍵による trust source 直接書き換えと、別ベクターから同一構造に到達している。

LayerZero Labs は incident statement で本構造を「observation layer」として独立した運用カテゴリと位置付けた。観測層を硬化させる方針（quorum・多重化・人手 review）と、message 自体に独立検証可能な暗号証明を埋め込む方針は、対立軸ではなく補完関係にある。

---

## 5. 証明があれば、何が変わるか

事前証明(pre-execution attestation)は、検出に対する代替ではなく **補完** の関係にある。取引前に「メッセージの出所」を独立に検証可能な形で証跡化することで、検出 + 事前証明の二段構成で trust boundary を確立する設計が成立する。Observation layer に改ざんが入っていても、message に埋め込まれた origin proof は別系統で「この message は正規の origin から来た / 来ていない」を verifier に告げる。

Lemma の設計は、observation layer 入力の独立検証不在という本事案の gap に対し、message 自体に来歴証明を埋め込んで accept 判定を観測層から切り離す点で対置される。

- **発信元の来歴バインド**: cross-chain message 自体に「正規の origin から来た」ことを独立検証可能な暗号証明として束ね、verifier が RPC 応答や config 表明に依存せず origin を検証できる。
- **行動前の認可証明(proof-as-auth)**: 資産を動かす前に proof を検証する設計であり、事後の異常検知ではなく accept の前段で trust boundary を確立する。
- **観測層からの独立**: observation layer が改ざんされた状態でも、proof は別系統で「この message は正規の origin から来た / 来ていない」を verifier に告げる。
- **検出との補完**: 検出が狭めた blast window と、proof が与える事前の origin 保証は、対立軸ではなく二段構成として機能する。

これは「暗号論理的に有効 ≠ 来歴が正しい」という来歴証明カテゴリの設計思想であり、検出層を置き換えるものではなく補完する。

---

## 6. Sources

- **Chainalysis blog**: "KelpDAO Bridge Exploit, April 2026"(blockchain analytics 大手による独立解析、onchain trace を含む)— https://www.chainalysis.com/blog/kelpdao-bridge-exploit-april-2026/
- **Halborn blog**: "Explained: The Kelp DAO Hack, April 2026"(security audit 企業による技術解説、攻撃経路の独立分析)— https://www.halborn.com/blog/post/explained-the-kelp-dao-hack-april-2026
- **Galaxy Research analytical brief**: "KelpDAO LayerZero Exploit — DeFi Insights"(独立解析)— https://www.galaxy.com/insights/research/kelpdao-layerzero-exploit-defi
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、行動前に独立検証する設計は[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（いずれも Lemma、2026-05）。設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) および [Trust402](https://lemma.frame00.com/ja/trust402/)。
