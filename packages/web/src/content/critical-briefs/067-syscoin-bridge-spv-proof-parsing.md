---
brief_no: 67
title: "Syscoin ブリッジ：偽の proof が「有効」と解釈され、burn のないまま 50 億 SYS が発行された — パースの欠陥で偽の proof が「有効な burn の証明」として受理された構造（Halborn）"
title_en: "Syscoin Bridge: an invalid SPV proof was read as \"valid\" and minted 5B SYS with no burn — a parsing flaw in SPV proof verification"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-07
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["016-verus-ethereum-bridge", "023-alephium-tokenbridge", "002-stakedao-vsdcrv", "001-kelpdao-rseth"]
status: draft
version: "1.0"
og_lead_ja: "偽 proof のパース欠陥で burn なく 50 億 SYS 発行 — Syscoin ブリッジ"
og_lead_en: "An invalid SPV proof minted 5B SYS with no burn — Syscoin bridge"
gap_detected: "発覚後のブリッジ停止・資産の凍結と追跡・Halborn の事後解析は実施でき、異常も事後に検知できた。"
gap_missing: "「この証明が指す消却は相手チェーンで実在するか」を発行の前に確かめる層が無く、形式上通る偽の証明は素通りした。"
gap_fix: "発行の前に「この証明が指す消却は相手チェーンで実際に行われた」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Syscoin のブリッジで、相手チェーンでの burn が実在しないのに約 50 億 SYS が裏づけなく発行された。暗号方式が破られたのではなく、攻撃者は proof 検証コードのパースの欠陥を突く偽の proof を送り込み、relay がそれを「有効な burn の証明」と取り違えた。発覚後のブリッジ停止・資産凍結・事後解析では、この証明が指す消却が相手チェーンで実在するかを発行の前に確かめられない。proof が形式上通ることと、それが指す事実が実在することが分離されていた。

---

## 2. 何が起きたか

- **対象**: Syscoin のクロスチェーンブリッジ（Bitcoin 型の UTXO モデルと、EVM 互換チェーン〔NEVM〕を接続）
- **被害規模**: 約 50 億 SYS が不正に発行された。当時の SYS 価格換算で約 850 万ドル相当（事案当日終値ベース。一部報道は約 9 百万〜1,000 万ドルと概算）
- **発生日**: 2026-06-07（同日夜に Syscoin が暫定ポストモーテムを公表、翌 6-08 に Halborn が技術解説を公開）
- **悪用の核心**: Syscoin は SPV proof で「相手チェーンで burn が行われたか」を検証してから mint する設計。だが proof が指す burn が NEVM 側で実在しないにもかかわらず、UTXO 側で mint が承認された。**暗号的に有効であること（proof の形式）と、それが指す事実が実在すること（burn の来歴）が分離されていた**
- **解析**: Halborn が root cause（SPV proof のパース欠陥）と Nomad（2022）との同型性を技術解説で提示
- **事後**: Syscoin はブリッジを停止。コア開発陣が世界各国の取引所・エコシステム各社に連絡し、複数の二次アドレスに分散していた該当資産の凍結・ブラックリスト化・追跡を進めた
- **文脈**: 2026 年のクロスチェーンブリッジ関連 exploit は 5 月までに 8 件・累計約 3 億 2,860 万ドル（PeckShield 集計）に達したとされ、proof の取り扱いに起因する事例が反復している（うち単一最大は 4 月の約 3 億ドル規模事案。[Brief 001](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/) 参照）

事象は次の連鎖で成立している。

1. **偽 proof の構造化**: 攻撃者は、暗号的に有効な proof を偽造するのではなく、relay の proof 検証コードのパースの欠陥を突くように構造化した偽 proof を作成する
2. **パース欠陥の悪用**: relay の proof 検証経路が、構造化された偽 proof を「実在しない burn 取引に対する有効な proof」と解釈する。暗号アルゴリズムそのものは破られていない
3. **burn 不在のまま mint 承認**: NEVM 側で対応する burn が行われていないにもかかわらず、UTXO 側で mint が承認される
4. **巨額発行の実現**: 約 50 億 SYS（当時約 850 万ドル相当）が裏づけなく発行される
5. **資産の分散**: 発行された SYS が複数の二次アドレスへ分散される
6. **停止と封じ込め**: Syscoin がブリッジを停止し、取引所・エコシステム各社と連携して凍結・追跡に動く（mint が承認された後に作動する事後の系列）

---

## 3. 時系列 — 公表と対応

- 2026-06-07: Syscoin ブリッジで burn の実在を伴わない約 50 億 SYS が発行される。攻撃者は資産を複数の二次アドレスへ分散
- 2026-06-07（同日夜）: Syscoin が暫定ポストモーテムを公表し、ブリッジを停止
- 2026-06-08: Halborn が root cause（SPV proof のパース欠陥）と Nomad 事件との同型性を技術解説で公開
- 2026-06-07 以降: コア開発陣が取引所・エコシステム各社と連携し、該当資産の凍結・ブラックリスト化・追跡を実施。SYS 価格は一時下落

> 注: Syscoin の暫定ポストモーテムは公式声明として発表された。本 Brief は、技術的事実は Halborn の解説と確立メディアの報道に基づき、規模・手口の断定を避けて出所を明示する。

公表後の対応と業界の動きは次のとおり。

- **Syscoin**: 攻撃当日にブリッジを停止し、暫定ポストモーテムを公表。コア開発陣が世界各国の取引所・エコシステム各社へ連絡し、複数の二次アドレスに分散していた該当資産の凍結・ブラックリスト化・追跡を実施
- **Halborn**: root cause（SPV proof のパース欠陥）と悪用の構造を技術解説で公開し、2022 年 Nomad 事件との同型性を指摘して業界横断で問題を可視化
- **業界横断の論点**: 2026 年のブリッジ関連 exploit は 5 月までに累計約 3 億 2,860 万ドル（PeckShield 集計、8 件）に達したとされ、proof の取り扱いに起因する事例が反復。SPV / Merkle proof の形式的検証だけでは、proof が指す事実（burn・入出力額・イベント来歴）の実在を保証できないという設計上の論点が、ブリッジ運用者の間で再認識された
- **proof 検証の実装品質**: 暗号方式の強度ではなく、proof のパース・実装ロジックの徹底検証が、ブリッジの安全性を左右する論点として共有された

「cross-chain の proof を、形式的受理とは別に、それが指す事実の実在としてどう独立検証するか」は、本事案を契機にブリッジ設計の必須要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、cross-chain で受け渡される proof が、**「形式として構造上受理されること」と「それが指す事実（相手チェーンでの burn）が実在すること」に分離されたまま accept された**点にある。SPV proof が（パースを通って）受理されることは「この proof は形式上有効」を示すが、「対応する burn が実在する」ことを別途独立に保証しない。relay のパースの欠陥が、その分離を突かれる入口になった。

[Brief 016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（Verus-Ethereum、Merkle Proof は有効でも入出力額の整合が未検証）・[Brief 023](https://lemma.frame00.com/ja/critical/briefs/023-alephium-tokenbridge/)（Alephium、guardian の鍵は無事でも署名対象イベントの来歴が未検証）と同じ `bridge-config-trust` であり、primitive がほぼ同型である。016 が「value claim の意味的整合」、023 が「署名対象イベントの来歴」、本事案が「proof が指す burn の実在」と、いずれも **暗号構成要素の有効性検証と、それが主張する事実の独立検証が切り離されている**。[Brief 001](https://lemma.frame00.com/ja/critical/briefs/001-kelpdao-rseth/)（KelpDAO、DVN 観測層の RPC 改ざん）・[Brief 002](https://lemma.frame00.com/ja/critical/briefs/002-stakedao-vsdcrv/)（Stake DAO、デプロイヤー鍵による trust source 書き換え）とは、cross-chain で受け渡される主張が、それを独立検証する層と分離したまま受理される構造で同根。本事案は「暗号論理的に有効 ≠ 指す事実が実在する」という来歴証明カテゴリの核心を、burn 不在のまま 50 億 SYS という形で具体的に示した。

2022 年の Nomad 事件との同型性が示すのは、ブリッジの安全性が暗号アルゴリズムの強度ではなく、**proof の取り扱い・パース・実装の検証**に依存するという論点だ。proof が形式上通っても、それが指す事実の来歴が独立検証されて初めて、cross-chain の発行を業務・決済の現場に安心して載せられる。

ブリッジの監視・異常検知、Syscoin による停止、取引所・エコシステムと連携した凍結・追跡、Halborn の事後解析は、被害の把握・封じ込め・再発防止議論に不可欠であり、本 Brief がその役割を否定するものではない。本事案でも停止と連携により拡散の抑止が図られた。

一方で、検出は受信側（relay、mint を承認するコントラクト）が「どの proof を accept するか」自体を変えない。本事案では、構造化された偽 proof がパースの欠陥を通って受理されたため、形式上の検証は通過した。欠けていたのは「この proof が指す burn は相手チェーンで実在するか」の独立検証であり、これは proof の形式的受理とは別系統の検証である。異常検知が mint の後に発火しても、relay が accept した時点での発行は止まらない。規制報告・監査で「この cross-chain mint は正規の burn に裏づけられていたか」を立証する材料として、proof が形式上有効だったという事実だけでは、burn の実在の独立した証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、cross-chain の proof を、受信側が mint の実行前に独立検証可能な暗号証明として受け取り、「相手チェーンで実際に burn が行われた」事実そのものを proof として検証する設計を採る。proof のパースが通ることと、burn の実在が独立に確かめられることを切り離さず、burn の来歴が確認できなければ mint を事前に block する。proof の形式的受理（detection 的な「この proof は通る」）と、burn の実在の事前証明（「対応する burn は実在する」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、cross-chain の発行を安心して実務に出せる。

本事案で露呈した検出と証明の落差（cross-chain の proof が、形式的受理とは別に、それが指す burn の実在として独立検証されていない）に対して、Lemma は、cross-chain で受け渡される proof を、受信側が mint 実行前に独立検証可能な暗号証明として扱う設計を提示している。

- **burn 来歴の事前証明**: proof のパースが形式上通ることと切り離して、「相手チェーンで実際に burn が行われた」事実そのものを proof として検証し、来歴が確認できなければ mint を事前に reject する
- **形式と事実の分離排除**: 「暗号論理的に有効 ≠ 指す事実が実在する」を設計前提に置き、proof の構造上の受理を、それが指す事実の実在検証と切り離さない
- **受信側での独立検証**: relay や mint 承認コントラクトが accept する判定そのものを、形式的パースではなく独立検証可能な来歴証明に置き換える
- **選択的開示**: 相手チェーンの内部状態を全面開示せずに、「対応する burn は実在する」ことだけを最小開示し、独立検証と機微情報保護を両立する

「暗号論理的に有効 ≠ 指す事実が実在する」という来歴証明カテゴリの設計思想を、その reference 実装が体現しており、本事案はその想定する failure mode が直近の現実の損失として顕在化した事例である。検出（事後の停止・凍結・解析）は被害の是正に、事前証明（mint 実行前の burn 来歴の独立検証）は cross-chain 発行の信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **Halborn（一次・技術解析）**: “Explained: The Syscoin Bridge Hack (June 2026)”（2026-06、root cause＝SPV proof のパース欠陥・Nomad との同型性）— <https://www.halborn.com/blog/post/explained-the-syscoin-bridge-hack-june-2026>
- **Cryptopolitan**: “Syscoin bridge remains paused as 5B token mint exploit threatens project's future”（2026-06）— <https://www.cryptopolitan.com/syscoin-bridge-paused-exploit-project/>
- **AMBCrypto**: “Syscoin — How a validation flaw enabled 5 billion unauthorized SYS”（2026-06）— <https://ambcrypto.com/syscoin-how-a-validation-flaw-enabled-5-billion-unauthorized-sys/>
- **Crypto Times**: “Syscoin Halts Bridge After Exploit Mints 5 Billion SYS Tokens”（2026-06-08）— <https://www.cryptotimes.io/2026/06/08/syscoin-halts-bridge-after-exploit-mints-5-billion-sys-tokens/>
- **Bitcoin.com News（業界文脈）**: “Crypto Bridge Exploits Hit $328 Million by May 2026”（PeckShield 集計、8 件・累計 約 3 億 2,860 万ドル）— <https://news.bitcoin.com/crypto-bridge-exploits-328-million-may-2026-peckshield/>
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/)、[Trust402](https://lemma.frame00.com/ja/trust402/)
