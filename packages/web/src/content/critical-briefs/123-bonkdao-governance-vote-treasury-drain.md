---
brief_no: 123
title: "BonkDAO：約 400 万ドルで議決権を買い、低投票率のガバナンスで約 2,000 万ドルの財庫を抜いた — コントラクトは設計どおり動いた"
title_en: "BonkDAO: about $4M bought the votes to drain a $20M treasury — the contracts worked exactly as designed"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-07-06
published: 2026-08-04
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["108-afx-trade-validator-key-quorum", "045-humanity-protocol-multisig-key-custody", "002-stakedao-vsdcrv", "067-syscoin-bridge-spv-proof-parsing", "016-verus-ethereum-bridge"]
status: published
version: "1.0"
og_lead_ja: "BonkDAO のガバナンス乗っ取りで財庫から約2,000万ドル流出、スマートコントラクトは正常動作"
og_lead_en: "BonkDAO governance attack drained about $20M; the smart contracts ran as designed"
gap_detected: "提案・投票・執行はオンチェーンで検証可能で、コントラクトのチェックはすべて通過した。"
gap_missing: "その決定権限が正当に保持されたものか、一時的に資本で買われたものかを確かめる層が無かった。"
gap_fix: "財庫を動かす決定の権限が正統に成立したことを独立検証可能な証明として要求し、証明を伴わない執行を事前に遮断する。"
---

## 1. TL;DR

2026 年 7 月 6 日、**BonkDAO** は財庫侵害を公表した。攻撃者は約 400 万ドルを投じて BONK の議決権を取得し、参加者の少ない時期に悪性のガバナンス提案を可決させ、財庫から約 4.4 兆 BONK（約 2,000 万ドル相当）を自分の管理する口座へ移した。スマートコントラクトは設計どおりに動作し、あらゆるオンチェーンのチェックは通過している。検証は効いていた。**効かなかったのは、可決という結果ではなく、その決定権限が正統に保持されたものかを確かめる層である。**

## 2. 何が起きたか

- 対象は Solana 上の BONK コミュニティ財庫を統べる BonkDAO のガバナンス。
- 攻撃者は取引所で BONK を買い集めて議決権を確保し、低投票率の期間に悪性提案を可決させ、約 4.426 兆 BONK（約 2,000 万ドル相当）を自身の管理するウォレットへ移転した。
- 欠陥はコード層ではなくガバナンス枠組みにある。参加率の低さが「決定権限の獲得」を安価にした——Immunefi の解析は、低い投票率が影響力を比較的安く買える状態を作ったとする。

攻撃は次の連鎖で成立している。

1. 攻撃者が取引所経由で BONK を取得し、決定に足る議決権を確保する（費用は約 400 万ドル）。
2. 参加者が少ない時期を狙い、財庫を自分の口座へ移す提案を出す。
3. 定足数と賛成多数という形式要件を「正しく」満たし、提案が可決される。
4. コントラクトが可決された提案を設計どおり執行し、約 2,000 万ドル相当が払い出される。

## 3. 時系列 — 公表と対応

- 2026 年 7 月 6 日 — BonkDAO が X 上で財庫侵害を公表。悪性提案により約 2,000 万ドル相当の BONK が流出した。
- 2026 年 7 月 6〜7 日 — 市場が反応。crypto.news は 24 時間で約 8.5% 下落し約 0.0000044 ドルと報じ、他媒体は 8%〜9% 超と幅がある。
- 2026 年 8 月 1 日 — Immunefi の解析が、損失の主軸がコード欠陥から運用・権限層へ移る傾向の一例として本件を取り上げる。

> 金額（約 2,000 万ドル／約 4.426 兆 BONK／取得費用約 400 万ドル）は当事者の公表と Immunefi の解析に基づく。下落率は媒体により 8%〜9% 超と幅がある。攻撃者の身元と最終的な資産回収は継続調査中である。

公表後の対応と業界の動きは次のとおり。

- BonkDAO は当局へ届け出、取引所・ブリッジ・Solana Foundation と協力してフォレンジックと資産回収を進め、提案に先立ち BONK を購入した取引所ウォレットを特定した。
- Immunefi は同種の構図として Humanity Protocol の 3,000 万ドル超の被害を挙げる。そちらはチームメンバーの秘密鍵が侵害された事案で、やはりコントラクトのコードは無傷だった。
- 同社が示す 2021〜2025 年の数百件の集計では、損失の不均衡な部分が中央集権取引所や鍵管理といった運用面の不備に帰属する。2024〜2025 年に限れば、約 200 件の事案で失われた価値の半分超がこの層に由来する。

## 4. なぜ止まらなかったか

この事案の失敗は、コントラクトのバグでも、投票の集計ミスでもない。可決された決定の権限が正当に保持されたものかを、執行の前に確かめる層が無かったことにある。

提案・投票・執行はすべてオンチェーンで検証可能だった。検証は効いていた。効かなかったのは、その手前——票の重みは形式的に足りていても、その決定権限が正統に保持されたものか、一時的に資本で買われたものかを見分ける層——である。

> 定足数は、参加が薄いほど安く買える。形式的に有効な多数は、正統な合意の証明ではない。

これは [Brief 108](https://lemma.frame00.com/ja/critical/briefs/108-afx-trade-validator-key-quorum/)（署名鍵の侵害でクォーラムが「有効に」満たされた事案）のガバナンス投票版である。鍵の漏洩ではなく、決定権限そのものが市場で獲得された点が異なる。財庫という単一の設定層を握れば資金が動く構造は、[Brief 045](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)（単一端末の鍵でマルチシグ閾値を超えた事案）と地続きだ——Immunefi 自身が本件と Humanity Protocol を同じ構図として並べている。

## 5. 証明があれば、何が変わるか

事前証明は、財庫を動かす経路のどこに一段挟まるか。可決の後・執行の前に、その決定の権限が正統に成立したことを証明として要求する。

- **決定権限の事前証明**：財庫を動かす提案の執行前に、決定権限が正統に保持されていることの証明を要求する。
- **定足数・参加の実効性の検証**：形式的な票の重みだけでなく、参加の実効性と取得経路の正統性を独立に確かめる。
- **高影響アクションのスコープ化**：財庫移転など影響の大きい執行に、追加の独立認可を課す（単一のガバナンス経路に全額を委ねない）。
- **来歴バインド**：提案・投票・執行の来歴を、後から改ざんできない形で結びつける。

Lemma はガバナンスの是非を判定する製品ではなく、不正な提案を検知するものでもない。射程は、財庫を動かす決定の権限が正統に成立したことを執行の前に独立検証し、証明を伴わない執行を分別可能にすることにある。オンチェーンの検証性やモニタリング（提案の公開、投票記録、事後のフォレンジック）と、事前証明（執行の前に決定権限の正統性を確かめる証跡）は、代替ではなく補完の関係にある。前者は起きた移転の追跡と説明責任に、後者は「形式的に有効な決定」と「正統な決定」のあいだ——検証が構造的に届かない一点に働く。補完の位置づけは [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) を参照。

## 6. Sources

- **crypto.news（独立報道）**: “BonkDAO reveals $20M treasury raid after malicious governance attack” — <https://crypto.news/bonkdao-reveals-20m-dollars-treasury-raid-attack/>
- **Bitcoin.com News（独立報道・数量）**: “BonkDAO Treasury Loses $20M in Malicious Governance Attack, BONK Slides 8%”（2026-07-06）— <https://news.bitcoin.com/bonkdao-treasury-loses-20m-in-malicious-governance-attack-bonk-slides-8/>
- **FinanceFeeds（独立報道）**: “BonkDAO Hit by Governance Attack Draining $20 Million” — <https://financefeeds.com/bonkdao-hit-by-governance-attack-draining-20-million/>
- **Crowdfund Insider（独立解析・Immunefi）**: Omar Faridi, “DeFi Exploits: Crypto Hacker Spends $4M To Drain $20M From BonkDAO's Treasury, No Smart Contract Failed”（2026-08-01）— <https://www.crowdfundinsider.com/2026/08/294550-defi-exploits-crypto-hacker-spends-4m-to-drain-20m-from-bonkdaos-treasury-no-smart-contract-failed/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）。設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance) · [Brief 108（AFX 署名鍵とクォーラム）](https://lemma.frame00.com/ja/critical/briefs/108-afx-trade-validator-key-quorum/) · [Brief 045（Humanity Protocol の鍵保管）](https://lemma.frame00.com/ja/critical/briefs/045-humanity-protocol-multisig-key-custody/)
