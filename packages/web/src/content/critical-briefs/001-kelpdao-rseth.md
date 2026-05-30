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
related_briefs: ["002-stakedao-vsdcrv"]
version: "1.0"
status: published
---

## TL;DR

2026 年 4 月 18 日、KelpDAO のクロスチェーンプロトコル上で 116,500 rsETH(被害規模約 ¥460 億)が不正にアンロックされた。LayerZero Labs の RPC クラウド環境への侵入を起点とする攻撃で、内部 RPC ノードが改ざんされることで LayerZero Labs DVN が参照するメッセージ観測結果が操作された。DVN 署名鍵そのものは侵害されていない。1-of-1 単一 DVN 構成のもと、改ざんされたデータに対する正規署名が単独で承認資格を持ち、偽 cross-chain メッセージが accept された。LayerZero Labs は同年 5 月、本事案の incident statement と続報を公開し、「observation layer」を独立カテゴリとして命名している。

---

## 1. 事案概要

- **被害規模**: 116,500 rsETH(約 $292M、当時レート約 ¥460 億)が不正アンロック
- **対象プロトコル**: KelpDAO(rsETH リキッドリステーキング)
- **基盤**: LayerZero v2 を介した cross-chain message
- **被害認識**: 2026-04-18
- **攻撃の起点(LayerZero Labs 公表に基づく)**: LayerZero Labs オペレーション環境への侵入(2026-03 期、社会工学を経由した経路が指摘されている)
- **改ざんされた資産**: LayerZero Labs の内部 RPC クラウド環境(複数の内部 RPC ノード)
- **侵害されなかった資産**: LayerZero Labs DVN 署名鍵そのもの
- **公式情報**: LayerZero Labs incident statement および 5 月の続報 update。「observation layer」の独立カテゴリ化と、LayerZero Labs DVN の 1-of-1 構成署名拒否・3-of-3 default 化を含む

---

## 2. タイムライン

- 2026-03 期(LayerZero Labs 公表に基づく推定): 社会工学を起点とする LayerZero Labs オペレーション環境への侵入が指摘されている期間
- 2026-04-18: KelpDAO の rsETH 116,500 が不正アンロック
- 2026-04-22 前後: 業界 incident response 開始
- 2026-04-30: Lemma がエッセイ「2026 年のブリッジ事象が示しているもの — 来歴証明というカテゴリについて」を公開(本事案を含む 2026 年上半期のブリッジ事案を構造的にカテゴリ化)
- 2026-05 月: LayerZero Labs が incident statement と続報 update を公開。「observation layer」の独立カテゴリ化、LayerZero Labs DVN の 1-of-1 構成署名拒否ポリシー、3-of-3 default 化を発表
- 同時期(2026-04 〜 05): 日本国内で AI サイバー対策の議論が並走して一段進展(本事案との直接因果ではなく、同時期に顕在化した論点として §6 で扱う)

---

## 3. 攻撃ベクター

LayerZero Labs 公表に基づく chain:

1. **Initial compromise**: LayerZero Labs オペレーション環境への侵入(社会工学を起点とする経路が指摘されている)
2. **Lateral movement**: 侵入した攻撃者が LayerZero Labs の RPC クラウド環境内の内部 RPC ノードを改ざん
3. **Detection evasion(観測層の分裂)**: 改ざんされた内部 RPC ノードは、監視ツールに対しては正常応答を返し、LayerZero Labs DVN の署名サービスに対しては改ざんされた応答を返す二面構成
4. **DoS による quorum 強制**: 外部 RPC プロバイダーへの DoS により、DVN 署名サービスが結果的に侵害された内部 RPC ノードのみを参照する状態に陥る(failover が poisoned RPC 側へ寄った)
5. **正規署名 × 改ざんデータ**: DVN は改ざんデータに対して正規の署名プロセスを実行。署名鍵そのものは攻撃を受けていないが、署名対象となる入力データが操作されているため、結果として偽メッセージへの「有効な」証明が生成される
6. **Impact realization**: 1-of-1 単一 DVN 構成のもと、この単一証明が KelpDAO 側で承認資格を持ち、rsETH 116,500 が unauthorized unlock として実現

---

## 4. カテゴリと位置

本事案は **bridge-config-trust** カテゴリの代表事例である。Cross-chain bridge における trust source の表明と検証が、observation layer(verifier が「メッセージの origin」を判断する際に参照する入力)を独立に検証する手段を伴わず、その observation layer の入力が単一の主体(本事案では侵害された LayerZero Labs オペレーション環境)で操作可能な状態に置かれていた。

同カテゴリの隣接事案として **Brief 002: Stake DAO vsdCRV 不正ミント**(2026-05-27)がある。共通点は、cross-chain bridge の trust が config 層で集中点を持つこと。差異は、KelpDAO 事案が DVN 観測層への RPC 改ざんを通じて trust を歪めたのに対し、Stake DAO 事案はデプロイヤー秘密鍵による LayerZero v2 trust source 直接書き換えを通じて trust を歪めた点にある。両者は別ベクターで同一カテゴリの primitive に到達している。

LayerZero Labs は post-mortem で本カテゴリを **observation layer** として命名し、独立した運用カテゴリとして扱う方針を示した。Lemma は 2026 年 4 月 30 日のエッセイで同じ gap を **verifiable-origin proof** として、メッセージ層に独立証明を埋め込む別角度から提示している。両者は競合ではなく相補的:LayerZero は観測層を硬化させる(quorum・多重化・人手 review)、Lemma は観測そのものを trust root から外す(message に proof を埋め込み、verifier は config に依存しない検証ができる)。

---

## 5. 検出 vs 事前証明

本事案では、DVN 署名鍵そのものは侵害されておらず、署名プロセスも正規であった。検出側の典型的観測点(署名鍵の異常使用、署名サービスの誤動作)は機能しにくい構造であった。攻撃が成立したのは観測層の入力データが操作されたためであり、署名プロセス自体は仕様通りに動作していた。

検出層強化のみでは構造的に届きにくい gap が本事案で露呈した。「99.7% で異常」型の信頼度スコアは、本事案のように「正規プロセスが操作された入力に対して正規署名を出した」事案では発火しにくい。これは検出ツール / 検出ベンダーの設計が劣っているのではなく、検出と立証(規制報告・行政手続き・訴訟での「許可されていない権限行使があった」立証)の間に独立した層が必要であることを示している。検出は依然として重要な層であり、本事案でも事象後の blast window を狭め、影響範囲の同定に貢献した。

事前証明(pre-execution attestation)は、検出に対する代替ではなく **補完** の関係にある。取引前に「メッセージの出所」を独立に検証可能な形で証跡化することで、検出 + 事前証明の二段構成で trust boundary を確立する設計が成立する。Observation layer に改ざんが入っていても、message に埋め込まれた origin proof は別系統で「この message は正規の origin から来た / 来ていない」を verifier に告げる。

---

## 6. 業界の対応

LayerZero Labs(2026-05-20 post-mortem 公開時に発表):

- LayerZero Labs DVN は今後、1-of-1 構成での署名を拒否
- LayerZero v2 default は ≥3-of-3 DVN 構成
- クラウド環境を全面再構築、短命 credentials、IAM 変更は複数人 review
- 独立 RPC ソース quorum を必須化、RPC プロバイダー・ホスティング環境・地域の多重化
- 業界パートナー数百社に対して 4 週間にわたり security posture 強化の支援を実施、継続予定

日本国内の規制動向(同時期に並走する論点として):

本事案との因果関係を断定するものではないが、cross-chain trust の単一鍵集中という構造的論点は、同時期に動き出した国内 AI サイバー対策議論と接続する文脈にある。

- 金融庁(2026-04-24): 主要金融機関 CEO を緊急招集、AI サイバー対策の方針共有
- 首相指示(2026-05-12)・関係省庁会議(2026-05-18、4 本柱の対策パッケージ)・総務相会合(2026-05-21、電気通信事業者協会・NHK・民放連・日本郵便・全国知事会への直接要請)
- 10 月 1 日施行の能動的サイバー防御法(15 分野・約 250 社対象)

---

## 7. Lemma の応答層

本事案の primitive(observation layer 入力の独立検証不在)に対する Lemma の応答は、4 柱のうち **Pillar 01: 来歴証明(verifiable-origin proof)** に直接位置する。

設計の中核は、cross-chain message そのものに独立検証可能な暗号証明を埋め込むことで、verifier が observation layer の入力(RPC 応答、config 表明)を介さずに message の origin を検証できる構造にある。Observation layer が改ざんされた状態でも、proof は別系統で「この message は正規の origin から来た / 来ていない」を verifier に告げる。

**Reference architecture(参考実装方針):**

- Groth16 over BN254 + Poseidon ハッシュで message origin を ZK 証明として固定
- Circom サーキットで domain 固有のポリシー(replay・custody-path・rehypothecation など)を回路化
- 検証は第三者でも独立に再現可能

本 reference architecture は Lemma の設計方針を示すものであり、現時点で各要素の実装状況および roadmap については別途プロダクトドキュメント / Whitepaper を参照のこと。

製品ライン上の位置付け:

- **Lemma Critical**(基幹インフラ・製造業対象): cross-chain operation を含む産業 IT のための pre-execution attestation 層
- **Pack A: Incident Response**(Critical Tier 2 以上で利用可): 本 Brief で扱った種類の事案発生時の復旧・内部不正対応
- **Pack B: Regulatory**: 能動的サイバー防御法・NCO 様式・EU AI Act 対応の規制報告 envelope
- **Trust402**: x402 経済圏での自律エージェント決済における header 拡張としての来歴証明埋込

実装サンプル(verifiable-origin の最小例):
https://github.com/lemmaoracle/example-origin

関連エッセイ:
- [2026 年のブリッジ事象が示しているもの — 「来歴証明(verifiable origin proof)」というカテゴリについて](https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/)(2026-04-30)
- [AI 時代のサイバー防衛に残された、最後の層](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(2026-05-22)

---

## 8. 関連 Brief

- Lemma Critical Brief No.002: Stake DAO vsdCRV 不正ミント(同 bridge-config-trust カテゴリ、別ベクター)
- Lemma Critical Brief No.003(作成中): AI agent infrastructure(Starlette/BadHost)
- Lemma Critical Brief No.004(作成中): Code provenance(Megalodon supply chain)

---

## 9. Sources

- **LayerZero Labs incident statement**(2026-04-19、LayerZero 公式 blog)— 初期 incident statement。1-of-1 DVN 構成での署名拒否ポリシー、RPC infrastructure poisoning の概要、TraderTraitor 帰属を含む。https://layerzero.network/blog/kelpdao-incident-statement
- **LayerZero Labs KelpDAO Incident Report**(2026-05-18、LayerZero 公式 PDF レポート)— 詳細 post-mortem。Mandiant・CrowdStrike・zeroShadow 協働の forensic 解析、social engineering(2026-03-06)を起点とする経路、RPC node 改ざんと DoS による quorum 強制、3/3 以上の DVN default 化方針を含む。https://layerzero.network/publications/kelpdao-incident-report.pdf
- **KelpDAO Foundation official acknowledgment**(2026-04、KelpDAO 公式 X 投稿)— Arbitrum Security Council・SEAL 911・エコシステム関係者への謝辞、rsETH 保有者支援方針、forged cross-chain message であった旨を含む。公式 blog 単独投稿はなく X が primary statement 経路。https://x.com/KelpDAO/status/2046332070277091807
- **Galaxy Research analytical brief**: "KelpDAO LayerZero Exploit — DeFi Insights"(独立解析)— https://www.galaxy.com/insights/research/kelpdao-layerzero-exploit-defi
- **Lemma Oracle essay**: 「2026 年のブリッジ事象が示しているもの — 来歴証明(verifiable origin proof)というカテゴリについて」(2026-04-30、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/verifiable-origin-bridge-exploits-2026/
- **Lemma Oracle essay**: 「AI 時代のサイバー防衛に残された、最後の層」(2026-05-22、Lemma 自社一次情報)— https://lemma.frame00.com/ja/blog/detection-is-not-proof/
- **Lemma Oracle reference implementation**: verifiable-origin proof sample(Lemma 公開 GitHub)— https://github.com/lemmaoracle/example-origin
