---
brief_no: 24
title: "不可視 Unicode による指示インジェクション — 目視と AI 入力の乖離"
title_en: "Invisible Unicode Instruction Injection — The Gap Between Human-Read and Model-Read Input"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "data-provenance"]
incident_date: 2026-03-10
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_briefs: ["005-noroboto-lying-fonts", "003-starlette-badhost", "011-synthid-watermark-reverse-engineering", "025-mcp-stdio-config-to-command-rce", "026-adaptive-ai-worm-runtime-exploit"]
version: "1.0"
status: draft
og_lead_ja: "人が読む文字列とモデルが読む文字列が、検証層なしには一致を保証できない"
og_lead_en: "What humans read and what models read cannot be guaranteed identical without a verification layer"
gap_detected: "不可視文字の除去・デコード挙動のフラグ付け・スキル監査といった検出策が、既知の手口を止められた。"
gap_missing: "「人がレビューした入力と、モデルが実際に解釈した入力が同一か」をモデルに渡す前に確かめる層が無く、目視で見えない不可視文字は素通りした。"
gap_fix: "モデルに渡す前に「この入力が、正規の配布元から、人がレビューした版と同一のまま改ざんなく渡っている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

2026 年、CSA が、人の目に見えない Unicode 文字を AI エージェントのスキルやツール定義に仕込んで AI を操る手法を開示した。多くのエディタでは空白に見える文字を、言語モデルは意味ある指示として読む。攻撃者は悪意ある指示を不可視文字に変換し、人間のレビューでは気づけない形で埋め込める。検出と事前証明は代替でなく補完である。

---

## 2. 何が起きたか

- **開示**: 2026 年、CSA AI Safety Initiative が "Hidden Unicode Instruction Injection in AI Agent Skills" として開示。研究者コミュニティ（Embrace The Red 等）も同型手法を報告
- **手法の要点**: Unicode Tag 文字（U+E0000–U+E007F）は人間の目・多くのエディタには不可視だが、LLM は意味内容として処理する。任意の指示をこの不可視文字で符号化し、スキルファイル・ツール記述・MCP メタデータ・文書に埋め込む
- **埋め込み箇所**: 見出し内・行末・空白の中など、人間のレビューで気づけない位置に潜ませられる
- **供給網の裏づけ（関連調査）**: Snyk ToxicSkills（2026-02）が 3,984 スキルを監査し、36.82% に問題、13.4% に重大な問題、76 件の悪意あるペイロードを確認。スキル（再利用される能力パッケージ）が供給網の攻撃面になっていることを定量化
- **位置づけ**: 実被害の特定事案ではなく、手法の開示とエコシステム監査。人間レビューを前提とした安全確認の限界を示す

本 Brief は再現性のあるペイロードを記載しない。構造を理解するための概略のみを示す。

1. **符号化と埋め込み**: 攻撃者が任意の指示を不可視 Unicode 文字で符号化し、スキルファイル・ツール記述・文書などに埋め込む
2. **レビューの素通り**: 配布・導入時の人間レビューでは、当該文字が表示されないため、悪意ある指示の存在に気づけない。「見たものが安全」という前提が崩れる
3. **モデルによる解釈**: エージェントが当該スキル／文書を読み込むと、モデルは不可視文字を意味内容として解釈し、埋め込まれた指示に従い得る
4. **実行**: 指示に従って、認証情報の窃取・外部送信・権限外の操作などが実行され得る
5. **帰結**: 人間が確認した内容とモデルが従った内容が乖離しているため、事後に「なぜそう動いたか」を説明・再現することが難しい

---

## 3. 時系列 — 公表と対応

- **2026-02-05**: Snyk が ToxicSkills 監査を公開 — 3,984 スキル中 36.82% に何らかのセキュリティ問題、13.4% に重大な問題、76 件の悪意あるペイロードを確認
- **2026-03-10**: CSA AI Safety Initiative が不可視 Unicode 指示インジェクションを Research Note として公開。検出フック（claude-hooks 等）や緩和策の研究が相次ぐ
- **2026 継続**: スキル／ツール定義／MCP メタデータを介した間接プロンプトインジェクションが、エージェント時代の主要な入力 integrity 問題として議論

> 注: 固有名・CVE は一次（研究機関・GitHub Advisory・NVD 等）に基づき、各実装の対応状況は時点により異なるため最新情報を参照。本件は研究・ラボでの手法実証であり、実被害の特定事案ではない点を誇張しない。

公表後の対応と業界の動きは次のとおり。

- **研究・業界団体**: CSA・研究者コミュニティが手法を開示し、不可視文字の除去や入力サニタイズ、スキル監査などの緩和策が共有された
- **供給網の認識**: スキル／ツール定義／MCP メタデータが、再利用される「文脈」として供給網の攻撃面になっていることが定量的に裏づけられ（ToxicSkills 等）、配布元の検証とスキルの origin 管理の必要性が高まっている
- **入力 integrity の重心**: 人間レビュー前提の安全確認から、AI が処理する入力そのものの origin・integrity を独立検証する方向へ、関心が移りつつある

AI に渡る入力の origin と integrity を独立検証する層の不在は、特定のツールの問題ではなく、エージェント・RAG・スキル供給網を横断する運用課題として浮上している。

---

## 4. なぜ止まらなかったか

本事象は、**人が読む入力とモデルが読む入力が同一であることを、検証層なしには保証できない**構造の代表例である。AI の安全確認の多くは「人間がレビューした」ことに依存するが、人間の知覚とモデルの解釈の間に乖離が作れるなら、レビューは安全性の保証にならない。問題は文字の見え方ではなく、AI に渡る入力の origin（どこから来たか）と integrity（途中で何が混入したか）が独立に検証されていないことにある。

見えない ≠ 無い

[Brief 005](https://lemma.frame00.com/ja/critical/briefs/005-noroboto-lying-fonts/)（Noroboto、フォント偽装で「画面の文字」と「AI が処理する文字列」を乖離させる）と同じ primitive に属し、本件はそれを**不可視 Unicode** という別経路で成立させる。入力 integrity というクラスタにおいて両者は相互リンクすべき対をなす。また、スキル／メタデータ経由という点で [Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（BadHost）や MCP 設計の問題（別 Brief）とエージェント基盤の入力境界で隣接する。

本事象では、不可視文字の除去・プログラム的なデコード挙動のフラグ付け・スキル監査など、検出側の対策が研究と共に提示されている。これらは攻撃コストを上げ、既知パターンを止める層として有効であり、本 Brief がその役割を否定するものではない。

一方で、検出は「人間がレビューした入力と、モデルが実際に解釈した入力が同一だったか」を、事後に独立して立証する材料にはならない。不可視文字の除去は既知の符号化に有効でも、入力の origin と integrity を保証する層ではない。新たな符号化・難読化が現れれば、検出は再び後手に回る。これは検出層の射程外にある、構造的に独立した層の gap である。

現状、AI の入力検証の運用モデル全体において、モデルが解釈した入力の origin と integrity を独立に固定する層は、まだ独立した層として扱われていない。事前証明（pre-execution attestation）は、入力の取り込みの経路に来歴・整合性の証明を 1 段挟むことで、この gap を埋める。検出が「危険な入力を見つけて除く」のに対し、事前証明は「モデルが処理した入力が、正規の origin から改ざんなく渡ったこと」を固定する。両者は相補的である。

---

## 5. 証明があれば、何が変わるか

本事象で露呈した検出と証明の落差（人が読む入力とモデルが読む入力の同一性が、検証層なしには保証されない）に対して、Lemma は、AI に渡る入力の origin と integrity を独立検証可能な暗号証明として commit する設計を提示している。

- **入力の origin 固定**: スキル・ツール定義・文書などの入力を、配布元（発行者）の署名付きで発行し、docHash で原本に紐付ける。取り込み時に、正規の origin から来たものかを検証する
- **integrity の証明**: 取り込んだ入力を Poseidon over BN254 でコミットし、人間がレビューした版とモデルが処理する版の同一性を Groth16（Circom 回路）で証明する。不可視文字を含む改変は、コミットとの不整合として可視化される
- **最小開示**: BBS+ over BLS12-381 により、「この入力は正規 origin から改ざんなく渡った」ことだけを検証側に開示する。入力の中身全体を渡す必要はない

これにより、不可視 Unicode のような「見えない改変」も、人間がレビューした版と照合した時点で不整合として現れる。検出（不可視文字の除去・監査）は既知手口の遮断に、事前証明（origin・integrity の固定）は入力の同一性の独立検証に、それぞれ相補的に働く。

Models change. Proofs remain.

---

## 6. Sources

研究・業界団体の公表資料を出典として示す。再現に資する具体的ペイロードは引用しない。

- **CSA AI Safety Initiative（一次情報）**: "Hidden Unicode Instruction Injection in AI Agent Skills"（2026-03-10）— <https://labs.cloudsecurityalliance.org/research/csa-research-note-unicode-instruction-injection-ai-skills-20/>
- **研究者開示（二次情報）**: Embrace The Red "Scary Agent Skills: Hidden Unicode Instructions in Skills"（2026）— <https://embracethered.com/blog/posts/2026/scary-agent-skills/>
- **供給網監査（一次情報）**: Snyk "ToxicSkills: Comprehensive Security Audit of AI Agent Skills"（2026-02-05、3,984 スキル・36.82%・13.4% CRITICAL・76 悪性ペイロード）— <https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/#inference)、[Trust402](https://lemma.frame00.com/ja/trust402/)
