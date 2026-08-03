---
brief_no: 45
title: "1 台のラップトップにあった鍵だけでマルチシグ閾値を超え、資金が流出した — 分散していたはずのマルチシグ承認が、単一の保管点の侵害で崩れた構造"
title_en: "When One Laptop Meets the Multisig Threshold — Distributed Approval Collapses to a Single Custody Point (Humanity Protocol)"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-08
published: 2026-06-11
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["002-stakedao-vsdcrv", "001-kelpdao-rseth", "023-alephium-tokenbridge", "016-verus-ethereum-bridge"]
status: published
version: "1.0"
og_lead_ja: "1 台の端末から奪われた鍵がマルチシグ閾値を突破 — Humanity Protocol"
og_lead_en: "Keys stolen from one device clear the multisig threshold — Humanity Protocol"
gap_detected: "オンチェーン解析・調査者による帰属の精査・取引所やセキュリティ企業の対応により、資金の動きと侵害の構造は外部から可視化できた。"
gap_missing: "承認が実行される時点で「閾値を満たした署名群が、別個の正規主体による意図的な承認か」を確かめる層が無く、閾値を形式的に満たしたことだけが実行の根拠になった。"
gap_fix: "資金移動やコントラクト変更を実行する前に「この承認は、別個の正規主体によって、このスコープで認可されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Humanity Protocol では、開発者 1 人の業務用ラップトップが感染しただけで、単一の端末に同居していた 7 つの秘密鍵が一度に奪われてマルチシグ閾値を単独で突破され、3,200 万ドル超が流出した。オンチェーン解析・帰属精査・取引所対応は、資金が動いた後に作動する事後の検出にとどまる（本 Brief は帰属を断定しない）。欠けているのは、実行時に「閾値を満たした署名群が、別個の正規主体による意図的な承認か」を独立検証する層であり、閾値の形式的充足だけが実行の根拠になった。

---

## 2. 何が起きたか

- **事象**: 2026-06-08〜09、Humanity Protocol 関連ウォレットから資金が流出。損失は 3,200 万ドル超（報道で $32〜36M）、約 17 ウォレットが空に
- **侵入経路（公式説明）**: 創業者 Terence Kwok によれば、財団メンバーが管理するウォレットの秘密鍵が侵害された。発端は開発者の業務用ラップトップのマルウェア感染で、1 台の端末に保管されていた 7 つの有効な秘密鍵が奪われた
- **閾値の突破**: 奪われた鍵が、Ethereum の Gnosis Safe（6 のうち 3）と BNB Smart Chain（5 のうち 3）の承認閾値を単独で満たした。攻撃者は ProxyAdmin を掌握
- **被害の中身**: Ethereum ブリッジから 141.2M H を流出。悪性のコントラクトアップグレードにより 1 億 H 超を新規発行（発行チェーンは報道で異同）。H は約 $0.70 から一時 $0.05 まで、数時間で 80〜90% 下落
- **帰属の留保**: オンチェーン調査者 ZachXBT は、本件が staged（自作自演）の可能性もあると指摘。攻撃か内部かは未確定であり、本 Brief は断定しない
- **対応**: プロジェクトはクロスチェーンブリッジと流動性プールの利用を一時停止するよう呼びかけ、セキュリティ企業・取引所と対応中とした

本事象は、分散承認の独立性が実行の前に検証されない構造に起因する。失敗が資金流出へ伝播する経路は以下の通り。

1. **承認の前提**: マルチシグ（M-of-N）は、閾値を満たす数の独立した鍵保有者の承認がそろって初めて資金移動・コントラクト変更を許す、という前提に立つ
2. **保管点の収縮**: 実際には、閾値を満たす数の鍵が単一の端末・保管点に同居していた。分散していたはずの承認権限が、1 点の侵害で一括して奪える状態にあった
3. **閾値の形式的充足**: 奪われた鍵で署名がそろうと、オンチェーンの観点では「正規の閾値を満たした承認」が成立する。各署名が別個の正規主体による意図的な承認かは、実行の時点で独立に検証されない
4. **権限の掌握と実行**: ProxyAdmin を握った攻撃者は、ブリッジからの引き出しに加え、コントラクトのアップグレードという最上位の権限を行使し、新規発行まで実行した
5. **影響の確定**: 流出と新規発行が確定すると、トークン価格の暴落・ブリッジ/プールの停止・取引所対応に至り、過去の承認構造（鍵の保管・閾値設計）全体の見直しが必要となる

---

## 3. 時系列 — 公表と対応

- 2026-06-08: 開発者の業務用ラップトップがマルウェアに感染、1 台から 7 つの秘密鍵が奪われたとされる
- 2026-06-08〜09: Ethereum・BSC をまたいで資金流出。ProxyAdmin 掌握、ブリッジ流出、悪性アップグレードによる新規発行
- 2026-06-09: H トークンが数時間で 80% 超下落（一時 $0.05 圏）。約 17 ウォレットが空に
- 2026-06-09 前後: 創業者が秘密鍵侵害を表明。ZachXBT が staged の可能性を指摘。プロジェクトがブリッジ・流動性プールの一時停止を呼びかけ

> 注: 損失総額・新規発行量・帰属（外部攻撃か内部か）は調査の進行に依存するため、本文では幅を示し断定しない。

公表後の対応と業界の動きは次のとおり。

- **プロジェクト対応**: ブリッジ・流動性プールの一時停止を呼びかけ、セキュリティ企業・取引所と対応。秘密鍵の保管と多重署名の設計が論点となった
- **鍵管理・運用**: 2026 年の大型損失は、コードの欠陥よりも鍵の窃取に起因するパターンが目立つ（例: 同年の Drift の管理鍵侵害による約 2.85 億ドル流出）。閾値を満たす鍵が単一保管点に集まる運用そのものがリスク源として議論されている
- **規制の重心移動**: 規制の重心はデータ開示からコンプライアンス証明へ移りつつある。資金移動・コントラクト変更の承認について、署名の形式的成立ではなく、主体の独立性と操作の正当性を実行前に独立検証可能な形で示す要請が強まっている

承認主体の独立性と操作スコープを、実行の時点で独立検証する層の不在は、特定プロジェクトの問題ではなく、マルチシグを用いる組織横断の運用課題として残っている。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**M-of-N の分散承認が、各署名を「別個の正規主体による、この操作への意図的な承認」として独立に証明しないまま、閾値の形式的充足だけで実行に直結する**点にある。閾値を満たす鍵が単一の保管点に収縮していれば、その 1 点を侵害（または内部で掌握）した者が「正規の多重承認」を一括して成立させられる。

[Brief 002](https://lemma.frame00.com/ja/critical/briefs/002-stakedao-vsdcrv/)（デプロイヤー鍵による信頼設定の書き換え）、[Brief 001](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/)（KelpDAO の観測層への改ざん）、[Brief 023](https://lemma.frame00.com/ja/critical/briefs/023-alephium-tokenbridge/)（guardian の鍵は無事でも署名対象イベントの来歴が未検証）、[Brief 016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（Merkle Proof は有効でも入出力額の整合が未検証）と対象は異なるが、共通する primitive は同じである。すなわち、**ある承認・証明の形式的成立が、その背後の正規性（誰が・何を・どの権限で）を検証する layer と切り離されている**。本事案は、その落差が「分散承認」という安全装置そのものの内部で起きた点に特徴がある。なお帰属が外部攻撃か内部かにかかわらず、この落差は同じである——外部攻撃なら 1 台の侵害で閾値が崩れ、内部なら閾値が独立主体性を保証しないことが突かれる。

本事象では、オンチェーン解析（The Block ほか）、調査者による帰属の問い直し（ZachXBT）、取引所・セキュリティ企業の対応という検出の系列が機能し、資金の動きと構造が外部から可視化された。これは検出の典型的成功であり、本 Brief が検出層の役割を否定するものではない。検出は、流出の追跡、帰属の精査、発覚後の是正範囲の特定に不可欠である。

一方で、検出は「いま閾値を満たした署名群が、別個の正規主体による意図的な承認か」を、**承認が実行される時点で**独立に立証する材料にはならない。オンチェーンからは「正規の閾値を満たした承認」としか見えず、鍵が単一保管点に収縮していたか、署名主体が独立していたかは、事後のオフチェーン調査でしか分からない。価格暴落も取引所対応も、資金が動いた後に作動する事後の系列である。これは検出層の射程外にある、構造的に独立した層の落差である。

現状、マルチシグ運用の全体において、承認主体の独立性の検証は、「閾値を満たす署名がそろった」ことへの信頼に依存しており、まだ独立した層として扱われていない。事前証明（pre-execution attestation）は、承認・実行の経路に主体独立性と操作スコープの証明を 1 段挟むことで、この落差を埋める。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせで承認権限の trust boundary が確立される。

---

## 5. 証明があれば、何が変わるか

本事象で露呈した落差（分散承認の形式的成立が、主体の独立性・操作の正当性の独立検証から切り離されたまま実行に直結する）に対して、Lemma は、承認・実行の時点で「この操作は、別個の正規主体によって、このスコープで認可されている」ことを独立検証可能な暗号証明として要求する設計を提示している。

- **承認主体の独立性証明**: 閾値を構成する各署名を、別個の正規主体による承認として証明する。閾値を満たす鍵が単一保管点に収縮している場合に、それを「独立した多重承認」として成立させない
- **操作スコープの事前認可（proof-as-auth）**: ProxyAdmin 掌握・コントラクトのアップグレード・ブリッジからの引き出しといった操作を、鍵の提示ではなく、操作ごとのスコープ付き認可証明で縛る。最上位権限の行使を、証明なしには成立させない
- **鍵保管の分離証明**: 閾値を構成する鍵が、独立した保管・主体に属することを検証可能にする。保管の収縮を、実行前に検出可能にする
- **選択的開示**: 「承認が正規の閾値・独立性の要件を満たす」ことだけを最小開示し、個々の鍵・内部構成は外に出さない

これにより、実行の時点で固定された証明が、「この承認は別個の正規主体による、認可された操作か」を、資金が動く前に独立検証可能なトレイルとして機能させる。検出（事後のオンチェーン解析・帰属精査）は発覚後の是正に、事前証明（承認時点の主体独立性・操作認可の検証）は承認権限の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **CoinDesk（一次報道・オンチェーン）**: “Humanity Protocol token crashes more than 80% after a $32 million private-key hack”（2026-06-09、流出規模・閾値突破・ProxyAdmin 掌握）— <https://www.coindesk.com/tech/2026/06/09/humanity-protocol-token-crashes-more-than-80-after-a-usd32-million-private-key-hack>
- **The Block（オンチェーン解析）**: “Wallets linked to Humanity Protocol drained for over $32 million, token plunges 89%: onchain analyst” — <https://www.theblock.co/post/404053/humanity-protocol-exploit>
- **Decrypt（二次）**: “Humanity Protocol Loses $36M After Private Keys 'Compromised,' Token Crashes 73%” — <https://decrypt.co/370485/humanity-protocol-loses-36m-after-private-keys-compromised-token-crashes-73>
- **crypto.news（二次）**: “Humanity Protocol says attacker stole seven keys from one device”（1 台の端末・7 鍵） — <https://crypto.news/humanity-protocol-says-attacker-stole-seven-keys-from-one-device/>
- **Bitcoin.com News（二次・帰属の留保）**: “Humanity Protocol Loses $32M in Private Key Hack as ZachXBT Calls Incident 'Possibly Staged'” — <https://news.bitcoin.com/humanity-protocol-exploit-zachxbt-staged/>
- **Chainalysis（参考・比較事例 §6 の Drift）**: “Lessons from the Drift hack”（2026 年最大級・管理鍵侵害による約 $285M 流出、DPRK 関連の指摘） — <https://www.chainalysis.com/blog/lessons-from-the-drift-hack/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance)、[Trust402](https://lemma.frame00.com/ja/trust402/)
