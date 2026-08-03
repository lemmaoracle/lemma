---
brief_no: 118
title: "Copilot for Word の文書ワームが、生成された文書を次の運び手に変えた — 編集後の文書が元データを反映しているかを、受け手が確かめられない"
title_en: "A Copilot for Word document worm turned each generated file into the next carrier — recipients cannot verify the edited document reflects the source data"
pillar: "01-verifiable-origin"
primary_category: "data-provenance"
secondary_categories: ["ai-decision-integrity", "agent-infrastructure"]
incident_date: 2026-07-28
published: 2026-08-03
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["055-echoleak-m365-copilot-instruction-provenance", "024-invisible-unicode-instruction-injection", "048-trapdoor-ai-instruction-provenance", "005-noroboto-lying-fonts", "104-webmcp-mid-session-tool-injection"]
status: published
version: "1.0"
og_lead_ja: "Copilot for Word に文書伝播型プロンプト注入、生成文書が次の運び手になる"
og_lead_en: "Copilot for Word document-borne prompt injection; each generated file becomes the next carrier"
gap_detected: "研究者の報告を受けて Microsoft は挙動を確認し、4 月と 7 月の二度にわたり緩和策を投入した。個別のペイロードは遮断された。"
gap_missing: "Copilot が編集した文書が、元データと指示のとおりに生成されたものかを、受け手が独立に確かめる層。"
gap_fix: "文書の生成・編集の履歴を独立検証可能な証明として要求し、証明が伴わない改変を受け手が事前に分別できるようにする。"
---

## 1. TL;DR

2026 年 7 月 28 日、研究者 Håkon Måløy が Microsoft 365 Copilot for Word に対する文書伝播型のプロンプト注入「Context Collapse, Part 3」を公表した。攻撃者は Word 文書に白地に白文字・極小フォントで指示を埋め込む。Copilot は言語モデルに渡す前に色やフォントサイズといった書式を落とすため、人間には見えない指示がモデルには完全に読める。実証では、Copilot がその指示に従って四半期財務報告の数値をすべて半分に書き換えたうえ、**攻撃プロンプト自体を生成先の文書に隠し文字として複写し、生成された文書が次の運び手になった**。Microsoft は 2026 年 4 月と 7 月に二度の緩和策を投入し、個別のペイロードは遮断された。**効かなかったのは、Copilot が編集した文書が元データのとおりに生成されたものかを、受け手が独立に確かめる層である。**

## 2. 何が起きたか

- 報告者は独立研究者の Håkon Måløy。Microsoft Security Response Center（MSRC）との協調開示として、初報から 144 日後に公表された。
- 悪性の指示は、白地に白文字・フォントサイズ 8 という体裁で文書に埋め込まれる。Copilot for Word は色やフォントといった書式を落としてから本文をモデルへ渡すため、隠し文字は人間の目には映らないままモデルには平文として届く。
- 第 1 段は足場の確立で、Copilot が悪性文書を処理した時点で成立する。第 2 段が伝播で、Copilot は攻撃プロンプト全体を生成先の文書に同じ隠し文字として書き込み、その文書を新たな攻撃媒体に変える。
- 実証では、悪性文書を添付した状態で四半期（Q1・Q2）の財務報告を扱わせると、Copilot が数値をすべて半分に書き換えた。研究者は攻撃の目立たなさを示すため、変更箇所を強調表示させる指示を意図的に含めている。
- Microsoft は 2026 年 4 月に「Edit with Copilot」の刷新、7 月にモデルの GPT-5.5 への更新という二度の緩和策を投入した。研究者は、いずれも個別のペイロードを塞いだが脆弱性の class そのものは塞いでいないとし、公表時点で全緩和策の適用下でも改変ペイロードにより完全な攻撃連鎖を再現したと述べている。

攻撃は次の連鎖で成立している。

1. 攻撃者は、正規の業務文書に見える Word 文書に、白地に白文字・極小フォントで指示を埋め込む。受け取った人間の画面には何も見えない。
2. 利用者がその文書を Copilot に処理させると、書式が剥がされた本文が指示ごとモデルに渡り、Copilot は埋め込まれた指示を実行する。
3. Copilot は指示に従って出力内容を改変する（実証では財務数値の半減）。改変された文書は、体裁上は正規の生成物と区別が付かない。
4. 同時に Copilot は攻撃プロンプト自体を生成先の文書へ隠し文字として複写する。その文書が組織内で共有・再編集されるたびに、連鎖が繰り返される。

## 3. 時系列 — 公表と対応

- 2026-03-06：Måløy が MSRC に再現手順と PoC プロンプトを添えて報告。
- 2026-03-09：MSRC が受領を確認。
- 2026-03-31：Microsoft が挙動を確認。
- 2026-04-03：一次緩和として「Edit with Copilot」の刷新を投入。
- 2026-04-09：当初のプロンプトは緩和されたが、研究者が新たな XPIA（外部プロンプト注入）の変種を発見。
- 2026-07-14：二次緩和としてモデルを GPT-5.5 に更新。
- 2026-07-15：GPT-5.6 上でも攻撃の再現に成功し、公表を再延期。
- 2026-07-28：公表。研究者は、脆弱性の class は公表時点でなお悪用可能であるとしている。

> 注：本 Brief の事実は研究者本人の公表記事と、それを受けた確立メディアの報道に基づく。本件は協調開示を経た研究実証であり、実地の侵害被害として確認されたものではない。財務数値の改変は研究者の実証環境における PoC であり、実際の企業文書が改変されたとする報告ではない。本 Brief は特定製品の断罪ではなく、生成された文書の来歴が受け手側で検証されない構造に焦点を当てる。

公表後の対応と業界の動きは次のとおり。

- Microsoft の二度の緩和は、いずれも「悪性に見えるプロンプト」を遮断する方向のものであり、研究者はそれを class の除去ではないと位置付けている。
- 研究者は、公表時点でこの類型に対する包括的な緩和策は存在しないと述べている。
- 報道は本件を「自己伝播するワーム的挙動」として扱い、通常の企業文書ワークフローが伝播経路になりうる点を論点として取り上げている。

## 4. なぜ止まらなかったか

この事案の失敗は、フィルタが甘かったことでも、利用者が不注意だったことでもない。Copilot が生成・編集した文書について、**それが元データと利用者の指示のとおりに作られたものかを、受け手が独立に確かめる層が無かった**ことにある。数値が半分になった財務報告は、体裁上、正しく生成された報告と一切区別が付かない。

検出は効いていた。研究者は挙動を特定して報告し、Microsoft は確認して二度の緩和を投入し、個別のペイロードは遮断された。効かなかったのはその手前——文書がモデルの前に置かれる時点で、そこに含まれる指示が誰の権限に由来するのかを分別する層と、出来上がった文書が何を根拠に生成されたのかを受け手が確かめる層である。書式を落として本文をモデルに渡す処理は機能として正しいが、その結果として、人間が見ている文書とモデルが読んでいる文書は別物になる。

> 「悪性に見えるプロンプト」を弾く対策は検出であって、証明ではない。文言を変えれば通る余地が残り、実際に研究者は全緩和策の適用下で連鎖を再現した。塞ぐべきは特定の文言ではなく、指示の出どころが検証されないまま実行に至る経路である。

同じ構造は、文書に埋め込まれた指示の出どころが検証されないまま Copilot に実行された [Brief 055（EchoLeak — M365 Copilot の指示来歴）](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/)、人間の目に見えない文字が指示として機能した [Brief 024（不可視 Unicode による指示注入）](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)、そして人間が読む文字列と機械が読む文字列を乖離させた [Brief 005（フォント偽装）](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/) に連なる。いずれも、内容が「正しく見える」ことと、その内容が「いま検証された来歴を持つ」ことが別の問いであることを示している。

## 5. 証明があれば、何が変わるか

事前証明（proof-as-auth）は、文書が生成・編集され、次の受け手に渡る一つひとつの行動の前に、その来歴を独立に検証する層を経路に一段挟む。体裁の正しさを正確さの代用にせず、「この文書は、どの原資料と、誰の権限に由来する指示から生成されたか」を確かめられる形にする。答えが「来歴不明」であれば、受け手はその文書を根拠として扱う前に分別できる。

Lemma がこの primitive に対して提示する設計は次の通りである。

- **生成来歴のバインド**：生成・編集された文書に、どの原資料に基づき、どの指示のもとで作られたかの来歴を改ざん耐性のある形で結び付ける。数値が改変された文書は、原資料との対応を欠くものとして受け手側で分別される。
- **指示の権限分別**：文書本文に含まれる文字列と、利用者が与えた指示を、権限の出どころで分別する。文書由来の文字列が、利用者の指示と同じ権限で実行されることを構造的に排除する。
- **原資料の完全性検証**：報告や集計の根拠となる原資料をハッシュで束ね、生成物が参照した原資料が改ざんされていないことを検証可能にする。
- **配布経路での検証**：文書が共有・再編集されて回る経路に来歴検証を組み込み、来歴を欠く文書が次の生成の入力になる前に止める。伝播の連鎖はここで断たれる。

Lemma はプロンプト注入を検知する製品ではなく、モデルの出力品質を保証するものでもない。射程は、生成された文書が次の判断や配布の根拠になる前に、その来歴を独立に検証し、来歴を欠く文書の通過を事前に排除することにある。検出（研究による特定、ベンダーの緩和、注入パターンの遮断）と、事前証明（生成と受領の前に来歴を独立検証する証跡）は、代替ではなく補完の関係にある。前者は既知の攻撃の封じ込めに、後者は改変が根拠として通用する前の信頼確立に働く。設計の詳細は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) を参照。

## 6. Sources

- **Håkon Måløy（一次）**: “Context Collapse, Part 3 — AI Worming through Word”（2026-07-28）— <https://enklypesalt.com/posts/context-collapse-part3-ai-worming-through-word/>
- The Register, “Word worm crawls into Copilot, spreads chaos”（2026-07-29）— <https://www.theregister.com/security/2026/07/29/word-worm-crawls-into-copilot-spreads-chaos/5280588>
- iTnews, “Microsoft can't kill dogged researcher's Copilot for Word worm”（2026-07）— <https://www.itnews.com.au/news/microsoft-cant-kill-dogged-researchers-copilot-for-word-worm-627830>
- Malwarebytes, “Hidden prompt turns Microsoft Copilot into an AI worm”（2026-07）— <https://www.malwarebytes.com/blog/ai/2026/07/hidden-microsoft-copilot-ai-worm>
- CyberInsider, “Microsoft Copilot for Word vulnerable to self-propagating worm-like attack”（2026-07）— <https://cyberinsider.com/microsoft-copilot-for-word-vulnerable-to-self-propagating-worm-like-attack/>

参照: [AI 時代のサイバー防衛に残された、最後の層](https://lemma.frame00.com/ja/blog/detection-is-not-proof/) · [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) · [Brief 055（EchoLeak — M365 Copilot の指示来歴）](https://lemma.frame00.com/ja/critical/briefs/055-echoleak-m365-copilot-instruction-provenance/) · [Brief 024（不可視 Unicode による指示注入）](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)
