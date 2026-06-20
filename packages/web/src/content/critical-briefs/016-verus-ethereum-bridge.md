---
brief_no: 16
title: "Verus-Ethereum ブリッジ $11.58M 流出 — Merkle Proof は有効でも、入出力額の整合が検証されなかった"
title_en: "The Verus-Ethereum Bridge Hack ($11.58M) — A Valid Merkle Proof, But No Verification That the Source Amount Matched the Payout"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-18
published: 2026-05-31
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["001-kelpdao-rseth", "002-stakedao-vsdcrv"]
version: "1.0"
status: published
og_lead_ja: "Merkle Proof は有効でも入出力額の整合が未検証 — Verus-Ethereum ブリッジ $11.58M"
og_lead_en: "Valid Merkle proof but no verification of source-vs-payout amount — Verus-Ethereum bridge ($11.58M)"
gap_detected: "事後の技術解析と攻撃者との交渉により、流出額の約 75%（約 4,052 ETH）を取り戻せた。"
gap_missing: "送金データの暗号的な証明はすべて有効だったため検証を通過した一方、「入金額と払出額が一致するか」を払出前に確かめる検証が抜けており、$0.01 の入金で $11.58M を引き出せた。"
gap_fix: "高額な払出の前に「払出額が、相手チェーンで実際に拠出された価値と一致している」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

2026 年 5 月、Verus-Ethereum ブリッジから約 $11.58M が流出した。攻撃者は $0.01 相当の入金に対し巨額払出を指示する blob を構成したが、state root・Merkle Proof 等は有効で署名検証は通過した。欠けていたのは入出力額の整合検証で、異常検知が払出後に発火しても受理済みの払出は止まらない。Merkle Proof は包含しか証さず、整合は別系統で独立検証するほかない。検出と事前証明は代替でなく補完である。

---

## 1. 事案概要

- **対象**: Verus Protocol の Verus-Ethereum クロスチェーンブリッジ
- **被害額**: 約 1,158 万ドル（ETH / tBTC / USDC）
- **発生日**: 2026-05-18
- **根本原因**: ブリッジの両側がそれぞれ検証を行っていたが、「source-chain の入力額が Ethereum 側の払出額と一致するか」を検証する必須ステップが存在せず、Ethereum 側 `checkCCEValues` 関数に当該検証が欠落していた
- **悪用の核心**: 攻撃の transfer blob は入出力の根本的な不整合（$0.01 相当の VRSC 入力 vs $11.58M 相当の ETH / tBTC / USDC 払出）を持っていた。しかし blob の構成要素（state root・関連ハッシュ・Merkle Proof）はすべて有効であり、Verus notary は受理・承認した
- **解析**: Halborn が技術的な root cause 解説を公開
- **事後**: 攻撃者は交渉による bounty 取り決めの下で約 75%（4,052.4 ETH）を返還し、約 1,350 ETH（約 280 万ドル相当）を bounty として保持
- **文脈**: 2026 年のブリッジ関連 exploit は累計で 3 億ドル規模に達しているとの集計

---

## 2. タイムライン

- 2026-05-18: Verus-Ethereum ブリッジから約 $11.58M が流出。攻撃者は $0.01 相当の入力に対し巨額払出を構成
- 2026-05-18 以降: 攻撃者が窃取資産を ETH へスワップ（報道では計約 5,402 ETH 相当）。攻撃が継続中と報じられる
- 2026-05-22 前後: 交渉による bounty 取り決めが成立。攻撃者が約 4,052.4 ETH（約 75%）を返還、約 1,350 ETH を保持
- 2026-05（同時期）: Halborn が root cause の技術解説を公開

---

## 3. 攻撃ベクター

1. **不整合 payload の構成**: 攻撃者は cross-chain import payload を、$0.01 相当の VRSC 入力に対し $11.58M 相当の払出を指示する形で構成
2. **有効な暗号構成要素**: 当該 blob に対応する state root・ハッシュ・Merkle Proof はいずれも有効であった。暗号的検証は通過する
3. **value 整合検証の欠落**: Ethereum 側 `checkCCEValues` に source-amount の検証が欠落していたため、入力額と払出額の不整合が捕捉されなかった
4. **notary による受理**: blob の各構成要素が有効だったため、Verus notary は payload を受理・承認
5. **巨額払出の実現**: 整合検証の不在を突き、$0.01 相当の入力から $11.58M 相当の払出を実現
6. **資産移動**: 窃取資産を ETH 等へスワップ。後に交渉で約 75% を返還

---

## 4. 構造的論点

本事案は Pillar 01（来歴証明）の `bridge-config-trust` カテゴリに属する。中心的な失敗 primitive は、cross-chain の value claim（「この import は source 側でこれだけの価値が拠出された」という主張）が、暗号的構成要素（Merkle Proof 等）の有効性検証とは別に、**入出力額の整合として独立検証されていなかった**点にある。Merkle Proof が有効であることは「この blob が state root に含まれる」ことを示すが、「払出額が source 側の入力額と一致する」ことを示さない。secondary に `identity-auth` を併記する。

Brief 001（KelpDAO/rsETH）・Brief 002（Stake DAO/vsdCRV）と同じ `bridge-config-trust` だが primitive が異なる。Brief 001 は DVN 観測層の RPC 改ざん、Brief 002 はデプロイヤー鍵による trust source の書き換え、本事案は value claim の整合検証の欠落。三者は「cross-chain で受け渡される主張が、それを独立検証する layer と切り離されたまま accept される」という構造で同根。本事案は「暗号論理的に有効 ≠ 意味的に正しい」という来歴証明カテゴリの核心を、$0.01 入力 → $11.58M 払出という極端なギャップで具体的に示している。

---

## 5. 検出と証明の落差

ブリッジの監視・異常検知や、Halborn のような事後の root cause 解析は、被害の把握・封じ込め・再発防止議論・交渉による資産回収に不可欠であり、本 Brief がその役割を否定するものではない。本事案でも事後解析と交渉により約 75% が回収された。

一方で、検出は受信側（Ethereum 側コントラクト、notary）が「どの payload を accept するか」自体を変えない。本事案では、blob の暗号構成要素がすべて有効だったため、署名・Merkle Proof の検証は通過した。欠けていたのは「value claim が意味的に正しいか（入力額と払出額が一致するか）」の検証であり、これは暗号的有効性とは別系統の検証である。異常検知が払出後に発火しても、`checkCCEValues` が accept した時点での払出は止まらない。規制報告・監査で「この cross-chain import は正規の value claim だったか」を立証する材料として、Merkle Proof の有効性だけでは入出力整合の独立した証跡にならない。

事前証明（pre-execution attestation）は、cross-chain の value claim を、受信側が実行前に独立検証可能な暗号証明として受け取り、「source 側で実際に拠出された価値」と「払出額」の整合を proof として検証する設計を採る。proof が「入力額と払出額が不整合」と告げれば、払出は事前に block される。Merkle Proof による包含証明（detection 的な「この blob は存在する」）と、value claim の事前証明（「この払出額は source の入力と整合する」）は代替ではなく **補完** の関係にある。

---

## 6. 対応経緯と業界動向

- **Verus Protocol**: 流出後、攻撃者との交渉により bounty 取り決めを成立させ、約 4,052.4 ETH（約 75%）の返還を受けた。攻撃者は約 1,350 ETH を bounty として保持
- **Halborn**: root cause（`checkCCEValues` の source-amount 検証欠如）と悪用手順の技術解説を公開し、業界横断で問題を可視化
- **業界横断の論点**: 2026 年のブリッジ関連 exploit は累計 3 億ドル規模に達したとされ、cross-chain インフラへの攻撃が継続。Merkle Proof / 署名の有効性検証だけでは value claim の整合を保証できないという設計上の論点が、ブリッジ・レンディング運用者の間で再認識された

「cross-chain の value claim を、暗号構成要素の有効性とは別に、入出力整合としてどう独立検証するか」は、本事案を契機にブリッジ設計の必須要件として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（cross-chain の value claim が、Merkle Proof 等の暗号的有効性とは別に、入出力額の整合として独立検証されていない）に対して、Lemma は、cross-chain で受け渡される value claim を、受信側が実行前に独立検証可能な暗号証明として受け取り、「source 側で実際に拠出された価値」と「払出額」の整合を proof として検証する設計を提示している。Merkle Proof が形式上有効でも、value claim の proof が入出力不整合を告げれば払出は事前に reject される。「暗号論理的に有効 ≠ 意味的に正しい」という来歴証明カテゴリの設計思想である。本事案は、既存の reference 実装（ブリッジ来歴の事前証明）が想定する failure mode が直近の現実の損失として顕在化した事例である。

---

## 8. Sources

- **Halborn**: "Explained: The Verus-Ethereum Bridge Hack (May 2026)"（2026-05、root cause・悪用手順の技術解説）— https://www.halborn.com/blog/post/explained-the-verus-ethereum-bridge-hack-may-2026
- **CoinDesk**: "Verus-Ethereum bridge loses $11 million as hackers keep targeting cross-chain infrastructure"（2026-05-18）— https://www.coindesk.com/markets/2026/05/18/yet-another-crypto-bridge-falls-victim-to-an-usd11-million-hack
- **AMBCrypto**: "Verus-Ethereum bridge hack drains $11.58M - Why DeFi trust is eroding"（2026-05）— https://ambcrypto.com/verus-ethereum-bridge-hack-drains-11-58m-why-defi-trust-is-eroding/
- **Crypto Times**: "Verus Hacker Returns $8.5M After Bridge Exploit Deal"（2026-05-22、bounty 取り決め・返還）— https://www.cryptotimes.io/2026/05/22/verus-hacker-returns-8-5m-after-bridge-exploit-deal/
- **reference 実装（GitHub）**: verifiable-origin proof sample — <https://github.com/lemmaoracle/example-origin>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
