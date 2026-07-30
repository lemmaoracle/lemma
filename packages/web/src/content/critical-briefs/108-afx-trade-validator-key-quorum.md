---
brief_no: 108
title: "AFX Trade：validator の署名鍵が侵害され、2/3 のクォーラムを「有効に」満たして $24.15M が払い出された"
title_en: 'AFX Trade — compromised validator keys met the two-thirds quorum "validly" and released $24.15M'
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-07-23
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["045-humanity-protocol-multisig-key-custody", "074-taiko-bridge-prover-key-leak", "103-ostium-oracle-signer-key-future-priced-data", "016-verus-ethereum-bridge", "001-kelpdao-rseth", "002-stakedao-vsdcrv"]
status: published
version: "1.0"
og_lead_ja: "AFX Trade — 侵害された署名が 2/3 クォーラムを満たし $24.15M 流出"
og_lead_en: "AFX Trade — compromised signatures met the 2/3 quorum, $24.15M gone"
gap_detected: "Blockaid が 2026-07-22 21:30 UTC に exploit を検出し、Offchain Labs が Arbitrum ネイティブブリッジは無傷・事象は第三者ブリッジ起点と迅速に切り分けた。"
gap_missing: "規定数の有効な署名が揃ったことは検証されたが、その署名を生む鍵が正当・無侵害かは検証されず、侵害された hot 鍵による署名が約 2/3 のクォーラムを「有効に」満たして払い出しが確定した。"
gap_fix: "払い出しを確定させる前に、署名者・鍵の正当性を、署名の有効性・クォーラムの充足とは切り離して独立検証可能な証明として要求し、証明が伴わない払い出しを事前に拒否する。"
---

## 1. TL;DR

AFX Trade（Arbitrum 上で USDC 建て永続先物を扱う分散型取引所）は 2026-07-22〜23、自らが運用するブリッジの validator 署名鍵を侵害され、約 2,415 万ドル（USDC）を流出させた。侵害された 5 つの hot validator 署名がブリッジの要求する約 2/3 のクォーラムを「有効に」満たし、コントラクトは設計どおり署名を検証して払い出しを実行した――Blockaid も「オンチェーンのロジックは破られていない」とし、破られたのは署名を生む秘密鍵の管理だった（署名数・クォーラム比・200 秒の異議申立期間は Blockaid の説明に基づく）。クォーラムは署名の数を検証したが、その署名を生む鍵が正当・無侵害かは検証しない。欠けていたのは、署名の有効性とは切り離して署名者・鍵の正当性を独立検証する層である。

---

## 2. 何が起きたか

- **対象**: AFX Trade。Arbitrum 上で USDC 建ての永続先物を提供する分散型取引所。影響を受けたのは AFX 自身が運用するブリッジ
- **被害額**: 約 2,415 万ドル（24,150,000 USDC）。攻撃者は Ethereum へ移し約 12,467 ETH にスワップ。流出額はプロトコルの TVL のほぼ全額に相当
- **発生日時**: Blockaid は 2026-07-22 21:30 UTC に exploit を検出。報道は 2026-07-23 付
- **手口**: 攻撃者がブリッジの hot validator 署名鍵（ブリッジ運用者／validator がオフチェーンで保持する鍵）を侵害。5 つの hot validator 署名でブリッジが要求する約 2/3 のクォーラムを満たし、24,150,000 USDC の払い出しを承認させた。コントラクトは署名を検証し、200 秒の異議申立期間の後に払い出しを実行した（署名数・クォーラム比・200 秒の異議申立期間の内訳は Blockaid の説明に基づく）
- **オンチェーンロジックの評価**: Blockaid は on-chain logic は回避されていない（設計どおり機能した）と評価。Arbitrum のネイティブブリッジは影響を受けず、事象は AFX が運用する第三者ブリッジに限局（Offchain Labs 共同創業者 Steven Goldfeder）

事象は次の連鎖で成立している。

1. **hot validator 署名鍵の侵害**: 攻撃者が、AFX が運用するブリッジの validator 署名鍵（オフチェーンで保持される hot 鍵）を侵害する。鍵がどう侵害されたかは公式には未確定
2. **クォーラムの充足**: 侵害した鍵で 5 つの署名を生成し、ブリッジが要求する約 2/3 のクォーラムを満たす。個々の署名は暗号的に有効であり、コントラクトの署名検証を通過する
3. **設計どおりの払い出し実行**: コントラクトは払い出しを有効と判定し、200 秒の異議申立期間の後に 24,150,000 USDC を攻撃者ウォレットへ払い出す。オンチェーンロジックは回避されていない
4. **資産の移動**: 攻撃者は USDC を Ethereum へブリッジし約 12,467 ETH にスワップ、単一ウォレットに集約。プロトコルの TVL がほぼ満杯の時点でその大半が流出した

---

## 3. 時系列 — 公表と対応

- 2026-07（攻撃前）: AFX の永続先物の取引高が 7 月半ばに数か月来の高水準へ急上昇し、預入（TVL）も増加（DefiLlama）
- 2026-07-22 21:30 UTC: Blockaid が AFX が運用するブリッジに対する exploit を検出。約 2,415 万 USDC が流出し始める
- 2026-07-22〜23: 5 つの hot validator 署名が約 2/3 のクォーラムを満たし、24,150,000 USDC の払い出しが承認される。コントラクトは 200 秒の異議申立期間の後に払い出しを実行
- 2026-07-23: 攻撃者が USDC を Ethereum へ移し約 12,467 ETH にスワップ、単一ウォレットに集約。Offchain Labs 共同創業者が「Arbitrum ネイティブブリッジは侵害されていない」「事象は第三者プロトコル起点」と表明

> 注: 技術的事実は Blockaid の検出、Offchain Labs 共同創業者の表明、およびオンチェーン記録（Arbiscan）と確立メディア（CoinDesk・crypto.news 等）の報道に基づく。鍵がどのように侵害されたか（漏洩・窃取・運用不備等）の詳細、最終ポストモーテム、資産回収・補償の状況は本稿執筆時点で未確定。最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **検出（Blockaid）／影響範囲の切り分け（Offchain Labs）**: Blockaid が 07-22 21:30 UTC に exploit を検出。Offchain Labs 共同創業者兼 CEO の Steven Goldfeder が「Arbitrum ネイティブブリッジは侵害されていない」「事象は第三者プロトコル起点」と表明し、L2 全体への波及リスクと個別プロトコルの障害を切り分けた
- **AFX の対応**: 攻撃者への資産返還を促す働きかけが報じられている。鍵侵害の詳細な根本原因、最終ポストモーテム、補償計画は執筆時点で未公表
- **業界横断の論点**: 本件は 2026 年に入って続く「スマートコントラクトのバグではなく、オフチェーン構成要素（鍵管理・権限スコープ・検証ロジック）の侵害」という攻撃の重心移動を示す代表例である。CoinDesk は、Solana 上で数か月かけて特権アクセスに至った 4 月の Drift Protocol 事案（約 2.85 億ドル・別チェーン）と、攻撃クラス（コントラクトのバグではなくオフチェーンの特権／鍵の侵害）の面で同型と位置づけた。閾値署名を用いていても、署名者・鍵の正当性を払い出し前に独立検証する層がなければ、規定数の有効な署名が揃った偽の払い出しがそのまま通り得る、という設計上の論点が再認識されている

「閾値署名の充足に加えて、署名者・鍵の正当性を払い出しの時点でどう独立検証するか」は、本事案を契機にブリッジ設計の要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**ブリッジの信頼が「規定数の有効な署名が揃ったか」で確立され、「その署名を生む鍵が正当・無侵害か」では確立されなかった**点にある。個々の署名は有効であり、コントラクトは設計どおりに機能した。検証されなかったのは署名の一段上――署名者・鍵の正当性――だった。

本事案に固有なのは、**クォーラム（署名の閾値）そのものが署名者の正当性に対する防御にならなかった**点だ。閾値署名は、単一鍵の侵害では払い出しを承認できないようにする仕組みである。しかし本件では侵害された鍵による 5 つの署名で閾値が「正しく」満たされた（各鍵の侵害態様は未確定）。閾値は署名の数を検証するが、それらの署名を生む鍵が同一の侵害エクスポージャを共有していないかは検証しない。[Brief No.045](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)（[Humanity Protocol](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)、1 台のラップトップの鍵だけで閾値を超えた）が「単一の保管点が閾値を無効化する」ことを示したのに対し、本件は「複数鍵が揃って侵害されれば閾値は正しく通過してしまう」という、閾値署名の裏面を示している。いずれも共通する primitive は同じである。すなわち、**署名の有効性（と規定数の充足）が、署名者・鍵の正当性とは独立している**。

[Brief No.074](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（[Taiko ブリッジ](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)、proof は正しく検証されたのに署名鍵の漏洩で偽の出金が「有効」と通った）、[Brief No.103](https://lemma.frame00.com/ja/critical/briefs/103-ostium-oracle-signer-key-future-priced-data/)（[Ostium](https://lemma.frame00.com/ja/critical/briefs/103-ostium-oracle-signer-key-future-priced-data/)、オラクル署名鍵 1 本の侵害で「未来の価格」が有効な署名付きで受理された）とは、暗号的検証は機能したがその前提たる署名者・鍵の正当性が独立に確かめられていない構造で直系。[Brief No.016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（[Verus-Ethereum](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)）・[Brief No.001](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/)（[KelpDAO / rsETH](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/)）・[Brief No.002](https://lemma.frame00.com/ja/critical/briefs/002-stakedao-vsdcrv/)（[Stake DAO / vsdCRV](https://lemma.frame00.com/ja/critical/briefs/002-stakedao-vsdcrv/)）とは、ブリッジが依拠する検証・信頼設定が資産の払い出しに直結する構造で連なる。

Blockaid による攻撃検出、Offchain Labs による影響範囲（Arbitrum ネイティブブリッジは無傷、事象は第三者プロトコル起点）の迅速な切り分けは、被害の把握・波及の限定に不可欠であり、本 Brief がその役割を否定するものではない。オンチェーン監視と関係者の連携は、本件でも影響範囲の確定に役割を果たした。検出は確かに役割を果たす。

一方で、検出は「いま 2/3 のクォーラムを満たしているこれらの署名が、正当・無侵害の鍵によるものか、それとも同時に侵害された hot 鍵によるものか」を、**その払い出しが確定する時点で**独立に立証する材料にはならない。侵害された鍵による署名は暗号的に有効であり、コントラクトの署名検証と閾値判定を正しく通過する。200 秒の異議申立期間は、異議を唱える独立した根拠（署名者・鍵の正当性の証明）が別途なければ、有効な署名が揃っている以上は素通りする。監査や規制報告で「このブリッジの払い出しは、正当な validator による正規の承認だったか」を立証する材料として、「規定数の有効な署名が揃った」という事実だけでは、署名者・鍵の正当性の独立した証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-action attestation）は、払い出しを承認する経路に、署名者・鍵の正当性の証明を 1 段挟むことでこの落差を埋める。払い出しを確定させる前に「この署名を生む鍵はいま正当・無侵害で、このスコープで認可されているか」を、署名の有効性・クォーラムの充足とは切り離して検証し、証明が伴わなければ払い出しを事前に遮断する。閾値署名（detection 的な「規定数の署名が揃った」）と、署名者正当性の事前証明（「これらの鍵はいま正当か」）は代替ではなく **補完** の関係にあり、両層の組み合わせでブリッジの trust boundary が確立される。

本事案で露呈した検出と証明の落差（規定数の有効な署名が揃いながら、その鍵が同時に侵害されていた）に対して、Lemma は、払い出しを承認する前に、署名者・鍵の正当性を、署名の有効性・クォーラムの充足とは独立に検証可能な暗号証明として要求する設計を提示している。

- **署名者正当性の行動前証明（proof-as-auth）**: 払い出しを確定させる前に、「この署名を生む鍵はいま正当・無侵害で、このスコープで認可されている」ことを、署名の有効性・閾値の充足とは切り離して証明する。「規定数の有効な署名が揃っている」ことを承認の終点にしない
- **鍵の保持と正当性の分離**: 正当性を「署名鍵を持っていること」に還元せず、鍵を実行環境・デバイスに束縛し（非エクスポータブル資格）、スコープと時刻に縛る。これにより、署名鍵の複製・持ち出しだけでは正当性証明を偽装できず、複数 hot 鍵の窃取がそのまま「有効なクォーラム」の偽装に連なる経路を狭める
- **異議根拠の独立化**: 異議申立期間を、有効な署名の有無だけでなく、署名者・鍵の正当性の証明に基づいて機能させ、証明が伴わない払い出しを事前に拒否する
- **選択的開示**: 「この承認が署名者正当性の要件を満たす」ことだけを最小開示し、内部の署名鍵・資格情報は環境外に出さない

ただし、事前証明は万能ではない。proof-as-auth の主眼は、鍵を伝送・サーバ保管しないことで漏洩・傍受・フィッシングといった鍵の窃取経路を閉じ、正当性を鍵の単なる保持から切り離す点にある。署名環境そのものが実行環境ごと完全に侵害された場合まで無条件に防ぐものではない。すなわち本層は閾値署名を置き換えるのではなく、その上に残余リスクを縮減する補完層として働く――署名鍵の窃取を「正当性の証明」に転化させないことで、鍵侵害が「有効なクォーラム」の偽装にそのまま直結する経路を断つ。

これにより、払い出しの時点で固定された証明が、「これらの鍵はいま正当か」を、資産移動が確定する前に独立検証可能なトレイルとして機能させる。検出（事後のオンチェーン監視・影響範囲の切り分け）は発覚後の封じ込めに、事前証明（承認前の署名者・鍵の検証）は署名者正当性の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **CoinDesk（一次報道）**: “Arbitrum-based AFX Trade drained of $24 million after bridge keys compromised”（2026-07-23、hot validator 署名・クォーラム・200 秒異議期間・Offchain Labs 表明）— <https://www.coindesk.com/tech/2026/07/23/arbitrum-based-afx-trade-drained-of-usd24-million-after-bridge-keys-compromised>
- **crypto.news**: “AFX bridge exploit drains $24.15M USDC as attacker buys 12,467 ETH”（2026-07-23）— <https://crypto.news/afx-bridge-exploit-drains-24-15m-usdc-as-attacker-buys-12467-eth/>
- **Crypto Briefing**: “AFX Trade drained of $24M, offers hacker 30% bounty to return stolen funds”（2026-07-23）— <https://cryptobriefing.com/afx-trade-24m-exploit-hacker-bounty/>
- **Blockonomi**: “Dual Crypto Bridge Exploits Drain $31.6M Within Seven Hours”（2026-07-23、同日事案群の文脈）— <https://blockonomi.com/dual-crypto-bridge-exploits-drain-31-6m-within-seven-hours>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
