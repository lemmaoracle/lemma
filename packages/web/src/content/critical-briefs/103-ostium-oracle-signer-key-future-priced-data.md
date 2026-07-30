---
brief_no: 103
title: "Ostium：オラクル署名鍵1本の侵害で、「未来の価格」が有効な署名付きで受理され $18M が払い出された"
title_en: "Ostium — one compromised oracle signer key let \"future prices\" be accepted as validly signed, draining $18M"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["identity-auth", "bridge-config-trust"]
incident_date: 2026-07-15
published: 2026-07-21
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["074-taiko-bridge-prover-key-leak", "067-syscoin-bridge-spv-proof-parsing", "001-kelpdao-rseth", "045-humanity-protocol-multisig-key-custody", "023-alephium-tokenbridge", "016-verus-ethereum-bridge"]
status: published
version: "1.0"
og_lead_ja: "Ostium — オラクル署名鍵1本の侵害で「未来の価格」が有効署名で受理され $18M 流出"
og_lead_en: "Ostium — one compromised oracle signer key let \"future prices\" be accepted as validly signed, draining $18M"
gap_detected: "Blockaid が攻撃を進行中に検出し、Ostium が数分で把握して1時間以内に取引を停止、法執行機関・SEAL 911・第三者専門家と連携するという検出・対応の系列が機能し、被害の拡大が抑えられた。オンチェーンの異常監視も損失を約5分間に封じ込める上で役割を果たした。"
gap_missing: "価格レポートが支払いに反映される時点で、その署名者がいま正当・無侵害か、そのデータが真正で妥当（未来日付でない・市場と整合する）かを、署名の有効性とは切り離して独立に立証する層がない。有効な署名を伴う偽レポートは署名検証を正しく通過してしまう。"
gap_fix: "価格レポートを payout に反映する前に、署名者がいま正当・無侵害でこのスコープで認可されていること、およびデータが真正で妥当性境界（タイムスタンプ整合・価格の許容範囲）を満たすことを、署名の有効性とは切り離して Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

2026-07-15、Arbitrum 上で現実資産（RWA）の永続先物を扱う分散型取引所 Ostium が、自らの価格供給インフラを逆手に取られる攻撃で最大約 1,800 万ドル（USDC）を流出させた。攻撃者はオラクルの署名鍵 1 本を侵害し、未来日付のタイムスタンプを付けた価格レポートを提出した。プロトコルはその署名を正しく検証した――署名は有効だった――が、検証したのは「署名が正しいか」であって「その署名者が正当・無侵害か」「その価格データが真正・妥当か」ではなかった。攻撃者は委任アクション（delegated actions）を通じて約 20 回のループ取引を回し、実際の市場リスクを負わずに架空の利益を作り出して、公開流動性ボルト（OLP vault）から支払いを引き出した。流出額は共同創業者が確認した約 1,800 万ドルから、一部報道の最大約 2,400 万ドルまで幅がある。事象は UTC 14:18〜14:23 のおよそ 5 分間で、セキュリティ企業 Blockaid が進行中に検出し、Ostium は数分で把握して 1 時間以内に取引を停止した。欠けていたのは、署名の有効性とは切り離して、署名者の正当性とデータの真正性・妥当性を、支払いが確定する前に独立に立証する層である。

---

## 2. 何が起きたか

- **対象**: Ostium。Arbitrum 上で現実資産（RWA）連動の永続先物を提供する分散型取引所。影響を受けたのは公開流動性ボルト（Ostium Liquidity Provider vault, OLP）
- **発生日時**: 2026-07-15、UTC 14:18〜14:23 のおよそ 5 分間。共同創業者 Kaledora Kiernan-Linn が時間帯と OLP への影響を確認
- **手口**: 攻撃者がオラクルの署名鍵（signer key）を侵害。未来日付のタイムスタンプを付けた価格レポートを提出し、損失取引を利益取引に見せかけた。委任アクションを通じて約 20 回のループ取引を回し、実際の市場エクスポージャーを負わずに架空の利益を作り、ボルトからの支払いを引き出した
- **流出規模**: 共同創業者が確認した約 1,800 万ドル（USDC）から、一部報道の最大約 2,400 万ドルまで出典により幅がある。約 1,800 万ドルはプロトコルの TVL（約 6,300 万ドル）の概ね 28% に相当
- **検出と対応**: ブロックチェーンセキュリティ企業 Blockaid が攻撃の進行中に検出。Ostium は数分で把握し、1 時間以内に取引を停止した。法執行機関・SEAL 911・第三者セキュリティ専門家と連携中

事象は次の連鎖で成立している。

1. **オラクル署名鍵の侵害**: 攻撃者が Ostium の価格供給に用いられるオラクルの署名鍵を侵害する。鍵がどう侵害されたか（漏洩・窃取・管理不備等）は公式には未確定
2. **未来日付データの提出**: 侵害した鍵で、未来日付のタイムスタンプを付けた価格レポートに署名して提出する。署名は有効であり、プロトコルの署名検証を通過する
3. **架空利益の生成**: 未来の価格を先取りすることで、損失取引を利益取引に見せかける。委任アクションを通じて約 20 回のループ取引を回し、実際の市場リスクを負わずに架空の利益を積み上げる
4. **ボルトからの支払い**: 架空の利益に対する支払いが、公開流動性ボルト（OLP）から引き出される。約 5 分間で最大約 1,800〜2,400 万ドルが流出する

---

## 3. 時系列 — 公表と対応

- 2026-07-15 14:18〜14:23 UTC: 攻撃が発生。約 5 分間の窓で、未来日付の価格レポートを用いた約 20 回のループ取引が実行され、OLP ボルトから支払いが引き出される
- 2026-07-15: Blockaid が進行中の攻撃を検出・フラグ。Ostium が数分で把握し、1 時間以内に全取引を停止
- 2026-07-15〜16: 共同創業者が時間帯・OLP 影響を確認。法執行機関・SEAL 911・第三者専門家と連携中と表明。ただし損失総額の確定値、根本原因（鍵がどう侵害されたか）、最終ポストモーテム、補償計画はこの時点で未公表

> 注: 技術的事実は Blockaid の検出、Ostium 共同創業者の確認、および確立メディア（CoinDesk・Decrypt 等）の報道に基づく。損失額は出典により約 1,800 万〜最大約 2,400 万ドルの幅があり、署名鍵がどう侵害されたかを含む根本原因は本稿執筆時点で公式ポストモーテム待ちである。最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **Ostium の対応**: 攻撃を数分で把握し、1 時間以内に全取引を停止。共同創業者が事象の時間帯（14:18〜14:23 UTC）と OLP ボルトへの影響を確認。法執行機関・SEAL 911・第三者セキュリティ専門家と連携中と表明。ただし損失総額の確定値、鍵侵害の根本原因、最終ポストモーテム、補償計画は本稿執筆時点で未公表
- **検出（Blockaid）**: ブロックチェーンセキュリティ企業 Blockaid が攻撃を進行中に検出・フラグし、取引停止につなげた
- **業界横断の論点**: 本件は 2026 年に続くオラクル／署名鍵起点の DeFi 攻撃の系列に位置づけられる。暗号的検証（署名・proof）自体は機能しても、その検証が前提とする署名者の正当性と外部データの真正性が独立に確かめられない限り、有効な署名を伴う偽入力が資産の払い出しに直結し得る。署名の検証に加えて、署名者の正当性とデータの妥当性を支払い前に独立検証する層の必要性が業界横断で共有されつつある

署名者の正当性と外部データの真正性を、支払いの時点で署名の有効性とは独立に検証する層の不在は、特定プロトコルの問題ではなく、外部オラクルに依拠するプロトコル横断の運用課題として残っている。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**プロトコルの信頼が「価格レポートが正しく署名されているか」で確立され、「その署名者が正当・無侵害か」「そのデータが真正・妥当か」では確立されなかった**点にある。署名は有効だった。検証されなかったのは、署名の一段上――署名者の正当性とデータの真正性――だった。

本事案は [Brief No.074](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（[Taiko ブリッジ](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)、proof は正しく検証されたのに署名鍵の漏洩で偽の出金が「有効」と通った）の直系である。いずれも、暗号的検証（署名・proof）は正しく機能したが、その検証が前提とする「署名者・prover の正当性」が独立に確かめられていなかった。本件はそれを価格オラクルの面で反復した。[Brief No.067](https://lemma.frame00.com/ja/critical/briefs/067-syscoin-bridge-spv-proof-parsing/)（[Syscoin ブリッジ](https://lemma.frame00.com/ja/critical/briefs/067-syscoin-bridge-spv-proof-parsing/)、偽の proof が「有効」と解釈された）、[Brief No.001](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/)（[KelpDAO / rsETH](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/)、観測層の RPC が改ざんされ信頼される入力が偽られた）とは、プロトコルが依拠する外部入力の真正性が独立検証されない構造で連なる。[Brief No.045](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)（[Humanity Protocol](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)、1 台のラップトップの鍵だけで閾値を超えた）とは、鍵の保管・正当性が資産移動の単一障害点になる点で通じる。[Brief No.023](https://lemma.frame00.com/ja/critical/briefs/023-alephium-tokenbridge/)（[Alephium](https://lemma.frame00.com/ja/critical/briefs/023-alephium-tokenbridge/)）・[Brief No.016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（[Verus-Ethereum](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)）とは、有効な検証を通過した入力が入出力整合の面で偽られる点で隣接する。

本事案に固有なのは、攻撃が**プロトコル自身の価格供給インフラを逆手に取り、しかも「未来の価格」という、署名が有効であっても本来ありえないデータの妥当性を、検証層が問わなかった**点だ。署名検証は「このレポートは登録済みの署名者によるものか」を答えたが、「この署名者はいま正当・無侵害か」「このタイムスタンプ・価格は妥当か」は答えなかった。共通する primitive は同じである。すなわち、**署名の有効性が、署名者の正当性およびデータの真正性とは独立している**。

Blockaid による進行中の検出、Ostium の迅速な取引停止（数分で把握・1 時間以内に停止）、法執行機関・SEAL 911・第三者専門家との連携という検出・対応の系列は、被害の拡大抑止に不可欠であり、本 Brief がその役割を否定するものではない。オンチェーンの異常監視は、本件でも損失を約 5 分間に封じ込める上で役割を果たした。検出は確かに役割を果たす。

一方で、検出は「いま受理しようとしている価格レポートが、正当・無侵害の署名者による真正なデータなのか、侵害された鍵で署名された未来日付の偽データなのか」を、**その支払いが確定する時点で**独立に立証する材料にはならない。偽レポートは有効な署名を伴い、署名検証を正しく通過する。オンチェーン監視は取引が異常な結果を生み始めてから検出したのであって、入力が支払いに接続される前にその真正性を証明したわけではない。監査で「このボルトからの支払いは、来歴が検証された真正な価格データによるものか」を立証する材料として、「登録済みの署名者による、署名検証を通過したレポートである」という事実だけでは、データの真正性と署名者の正当性の独立した証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-action attestation）は、外部データが支払いに接続される経路に、来歴と署名者正当性の証明を 1 段挟むことでこの落差を埋める。価格レポートを payout に反映する前に「この署名者はいま正当・無侵害で、このスコープで認可されているか」「このデータは真正で、妥当性境界（タイムスタンプの整合・価格の許容範囲）を満たすか」を、署名の有効性とは切り離して検証し、証明が伴わなければ支払いを事前に block する。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせでオラクル依存プロトコルの trust boundary が確立される。

本事象で露呈した検出と証明の落差（有効な署名を伴いながら、署名者が侵害され、データが未来日付の偽物だった）に対して、Lemma は、外部データが支払いに接続される前に、署名者の正当性とデータの真正性を、署名の有効性とは独立に検証可能な暗号証明として要求する設計を提示している。

- **署名者正当性の行動前証明（proof-as-auth）**: 価格レポートを payout に反映する前に、「この署名者はいま正当・無侵害で、このスコープで認可されている」ことを署名の有効性とは切り離して証明する。「登録済みの鍵で署名されている」ことを受理の終点にしない
- **データ来歴と妥当性境界の検証**: 受理するデータが真正の来歴を持ち、妥当性境界（タイムスタンプの整合・価格の許容範囲）を満たすことを、反映前に検証する。未来日付・市場乖離のような、署名が有効でも本来ありえない入力を事前に排除する
- **単一鍵依存の排除**: 署名者の正当性を単一鍵の保持に還元せず、鍵侵害が有効署名の偽造にそのまま連ならないよう、認可を独立検証可能な証明に置き換える
- **選択的開示**: 「この入力が来歴・妥当性要件を満たす」ことだけを最小開示し、内部の署名鍵・資格情報は環境外に出さない

これにより、支払いの時点で固定された証明が、「この署名者は正当か」「このデータは真正・妥当か」を、外部入力が資産移動に反映される前に独立検証可能なトレイルとして機能させる。検出（事後のオンチェーン異常監視・取引停止）は発覚後の封じ込めに、事前証明（反映前の署名者・データ検証）はオラクル入力の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **CoinDesk（一次報道）**: “Ostium loses $18 million in oracle attack that gamed its own price-feed infrastructure”（2026-07-15）— <https://www.coindesk.com/business/2026/07/15/ostium-suffers-usd18-million-exploit-as-oracle-attack-wave-continues-to-hit-defi>
- **crypto.news（Blockaid 検出）**: “Blockaid uncovers $18M exploit that forces Ostium halt”（2026-07-15）— <https://crypto.news/blockaid-uncovers-18m-exploit-that-forces-ostium-halt/>
- **Decrypt**: “Another DeFi Exploit: Perp DEX Ostium Loses $18 Million in Oracle Attack”（2026-07-15）— <https://decrypt.co/373566/defi-exploit-ostium-oracle-hack>
- **The Defiant**: “Ostium Halts Trading After Oracle Exploit Drains up to $18M from Vault”（2026-07）— <https://thedefiant.io/news/hacks/ostium-halts-trading-after-oracle-exploit-drains-up-to-usd18m-from-vault>
- **CryptoSlate（手口解説）**: “How prices from the future fooled a crypto oracle into paying out up to $24 million”（2026-07）— <https://cryptoslate.com/how-prices-from-the-future-fooled-a-crypto-oracle-into-paying-out-up-to-24-million/>
