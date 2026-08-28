---
brief_no: 136
title: "x402 決済のファシリテーター 15 社すべてで違反が見つかった — 支払いの検証と決済の確定が、行動の前に結び付いていない"
title_en: "All 15 x402 payment facilitators were found in violation — payment verification is never bound to settlement before the action"
pillar: 03-agent-authority
primary_category: agent-payment-abuse
secondary_categories: [agent-infrastructure, identity-auth]
incident_date: 2026-07-21
published: 2026-08-28
authors: ["Lemma Critical Team"]
related_pack: [C-agent-governance]
related_briefs: ["104-webmcp-mid-session-tool-injection", "047-openclaw-agent-phishing", "135-zombie-cards-visa-contactless-expiry"]
status: published
version: "1.0"
og_lead_ja: "x402 のファシリテーター 15 社すべてで違反、検証と決済確定が未結合"
og_lead_en: "All 15 x402 facilitators in violation; verification isn't bound to settlement"
---

## 1. TL;DR

AI エージェントの自律決済を支える x402 で、決済を仲介する**ファシリテーター 15 社すべてに違反が見つかった**。研究チームが定義した 8 つの検証・決済ルールに対し、違反 49 件・固有の脆弱性 31 個が特定され、うちフリーショッピング 2 件が End-to-End で実証された。検出は効いていた。**効かなかったのは、「支払い証明を検証した」ことと「決済が実際に確定した」ことを、加盟店が行動する前に独立して結び付ける層である。**

## 2. 何が起きたか

- x402 は HTTP のステータスコード 402（Payment Required）を拡張し、Web API や自律 AI エージェントが都度課金でサービスにアクセスできるようにする決済規格である。クライアントの署名付き支払い証明の検証と、オンチェーン決済の実行は、いずれも共有ミドルウェアである「ファシリテーター」に委ねられる。
- EPFL・浙江大学の研究チーム（Qinying Wang, Yong Yang, Yuan Chen, Shouling Ji, Mathias Payer）が、観測取引の 99%・支払額の 98% を占める主要ファシリテーター 15 社を対象に、初の系統的なセキュリティ分析を実施した。評価対象は合計 6 万超の販売者と 36 万超の購入者に利用されていた。
- ファシリテーターが満たすべき 8 つの検証・決済ルールを定義し、実運用環境で違反を調査した結果、**15 社すべてが少なくとも 1 つのルールに違反**していた。違反は 49 件、固有の脆弱性としては 31 個にまとめられた。
- 集中度も高い。約 53,500 件の加盟店サーバーのうち 93% 超が単一のファシリテーターにのみ紐付いており、Coinbase 一社で 7,717 万件・約 2,700 万ドルの取引を処理していた。

違反は次の 4 つの攻撃クラスに整理される。

1. **フリーショッピング**：1 件のクリーンで一意な決済が確定する前に、加盟店側がサービスを提供してしまう。
2. **資産窃取**：攻撃者がファシリテーターの管理する資産に到達する経路を得る。
3. **サービス拒否**：失敗する、または処理負荷の高い決済でファシリテーターの決済レーンを詰まらせる。
4. **ガス濫用**：ファシリテーターが負担するガス代・手数料を、攻撃者の実行コストに転用させる。

研究チームはフリーショッピング 2 件を End-to-End で実証し、さらに 10 件を「加盟店が決済確定を待たずにサービスを提供するかどうかに実害が左右される」高リスク事例として分類した。ガス濫用は 3 件、ERC-6492 経由の資産窃取経路は 1 件確認されたが、後者は制御された PoC の範囲でトークン承認を誘導するにとどめ、**実際の資産移転は行っていない**。

## 3. 時系列 — 公表と対応

- 2025-10-01〜12-26：研究チームが Base・Solana 上の取引 1 億 1,900 万件超を分析し、x402 の普及度とファシリテーターの集中度を測定。
- 2026-01：研究チームが、対象 15 社のうち 14 社に責任開示。
- 2026-07-21：論文「When HTTP 402 Meets the Blockchain: Risks on Emerging x402 Payments」を arXiv に公開。USENIX Security 2026 に採択。

> 本 Brief は、実地の被害でなく、研究チームによる実証を扱う。取引分析期間に観測された約 20 万 2,000 ドルのガス代・手数料（うちリバート関連が約 5,800 ドル）は通常運用の観測値であり、攻撃による実損失ではない。研究チームは、ガス枯渇や可用性低下を実際に引き起こす実験は行っていない。示されたのは経路の存在であり、実害の広がりではない。また論文は結果を匿名化しており、個々の脆弱性がどのファシリテーターのものかは特定されていない。

対応と論点は次のとおり。

- Coinbase・PayAI・Mogami の 3 社が、合計 6 件の脆弱性を認め、一部を修正済み・一部を対応中とした。規格そのものは改善可能であることを示している。
- 一方で、匿名化された報告のままでは、加盟店側は自分が接続しているファシリテーターがどの違反を抱えているかを知る手立てがない。加盟店の判断材料は、依然としてファシリテーターの応答だけである。

## 4. なぜ止まらなかったか

この研究が示した失敗は、暗号署名の検証精度でも、個々のファシリテーターの実装力量でもない。**ファシリテーターが支払い証明を検証したという事実と、決済がオンチェーンで実際に確定したという事実を、加盟店が行動する前に独立して結び付ける層が無かった**ことにある。

x402 はファシリテーターに信頼を一極集中させる設計である。加盟店は自らオンチェーン状態を検証する代わりに、ファシリテーターの応答を根拠にサービス提供を判断する。検出は効いていた——研究チームの黒箱テストツールは、15 社全社の違反を機械的に洗い出せている。効かなかったのはその手前、決済が確定するまでサービスを解放しないという制御を、仲介層の応答だけに頼らず独立に保証する仕組みである。フリーショッピングが 2 件 End-to-End で再現された事実は、この**検出と証明の落差**が理論上の懸念にとどまらないことを示す。

> 「支払い証明が検証された」と「決済が確定した」は、別々の事実である。前者から後者を推定できる設計では、その推定を外させる経路が 1 つあれば、加盟店は対価を受け取らないままサービスを渡す。

エージェントが自ら決済を起こす構図は、[Brief 104](https://lemma.frame00.com/ja/critical/briefs/104-webmcp-mid-session-tool-injection/) が扱ったセッション途中の権限の揺らぎとも重なる。端末が読んだ値が発行者の署名済み記録と照合されていなかった [Brief 135](https://lemma.frame00.com/ja/critical/briefs/135-zombie-cards-visa-contactless-expiry/) も同じ方向にある。共通するのは、行動を許可する側が見ている値と、それを裏付ける原本とが結び付いていないことである。

## 5. 証明があれば、何が変わるか

事前証明は、サービス提供の可否を「ファシリテーターがそう応答したから」ではなく、「決済の確定を独立に検証できたから」に置き換える。ファシリテーターの実装品質を上げるのではない。実装品質に依存しなくても、加盟店が行動の前に確かめられるようにする。

Lemma がこの落差に対して提示する設計は次の通りである。

<ul class="bd-check">
<li><strong>行動前の決済確定証明</strong>：サービス提供という行動の前に、決済が確定した事実を、仲介層の応答から独立した証明として要求する。</li>
<li><strong>一意性の予約と束縛</strong>：ノンスや取引の一意性を検証可能な形で予約・記録し、同一の支払い証明の再利用を行動の前に排除する。</li>
<li><strong>検証と確定の結び付け</strong>：支払い証明の検証結果と決済確定の事実を、単一のファシリテーター応答に頼らず、加盟店側で照合できる形にする。</li>
</ul>

担わないものも、あわせて書いておく。

<ul class="bd-limit">
<li>個々のファシリテーターの実装バグを塞ぐのは、各社と監査の仕事である。この層はその後段で、バグが残っていても加盟店が行動の前に確かめられるようにする。</li>
<li>ガス代の経済設計や手数料ポリシーを決めることはしない。サービス拒否・ガス濫用の経路そのものは、ファシリテーター側の資源設計の領分である。</li>
<li>証明が示せるのは決済が確定したかまでで、その決済が商取引として妥当だったかまでは示せない。</li>
</ul>

事後の取引記録との違いはここにある。記録は決済の後に残るが、その決済が確定する前にサービスを渡してよかったかを、行動の時点で判断する材料にはならない。

検出の層と、この層は代替ではなく補完の関係にある。前者はルール違反を洗い出して経路の数を減らし、後者は「決済が確定するまで、サービスは解放されない」ことを、取引が成立する前に確かめられるようにする。

## 6. Sources

- **arXiv（一次・論文）**: Wang, Yang, Chen, Ji, Payer, "When HTTP 402 Meets the Blockchain: Risks on Emerging x402 Payments"（arXiv:2607.19545、2026-07-21、USENIX Security 2026 採択）— <https://arxiv.org/abs/2607.19545>
- **CryptoSlate（独立報道）**: "31 newly discovered vulnerabilities expose 99% of x402 crypto payments to asset theft and free shopping" — <https://cryptoslate.com/31-newly-discovered-vulnerabilities-expose-99-of-x402-crypto-payments-to-asset-theft-and-free-shopping/>
- **CryptoSlate（独立報道）**: "Coinbase and 14 other x402 facilitators failed security tests built for the coming AI-agent economy" — <https://cryptoslate.com/coinbase-and-14-other-x402-facilitators-failed-security-tests-built-for-the-coming-ai-agent-economy/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)。エージェント権限の証明は[Pillar 03 — エージェント権限](https://lemma.frame00.com/ja/pillars/#authority)。決済に証明を挟む設計は[Trust402](https://lemma.frame00.com/ja/trust402/)。

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。各社の修正状況は公表内容に基づき、論文が結果を匿名化しているため個々の脆弱性と事業者の対応付けは行っていません。
