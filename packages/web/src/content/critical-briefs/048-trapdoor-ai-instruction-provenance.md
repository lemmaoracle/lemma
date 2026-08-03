---
brief_no: 48
title: "AI コーディングアシスタント宛ての指示ファイルに、見えない命令が仕込まれた — 来歴のない `.cursorrules` / `CLAUDE.md` を、AI が正規の指示として実行する構造（TrapDoor）"
title_en: "TrapDoor Plants Hidden Directives in AI Assistant Instruction Files Across npm, PyPI, and Crates.io"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["agent-infrastructure", "ai-decision-integrity", "model-supply-chain"]
incident_date: 2026-05-24
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["037-agent-config-auto-execution", "018-hackerbot-claw-ai-vs-ai", "024-invisible-unicode-instruction-injection", "028-npm-dependency-confusion-recon"]
status: published
version: "1.0"
og_lead_ja: "AI 指示ファイル（.cursorrules/CLAUDE.md）に隠し命令 — TrapDoor"
og_lead_en: "Hidden directives planted in AI instruction files — TrapDoor"
gap_detected: "セキュリティ企業や GitHub は、悪性パッケージと隠し文字を含む PR を検出して除去・却下でき、手口を公表できた。"
gap_missing: "AI が指示ファイルを読んで作業に移る前に、「その指示は正規の作者が正規の認可で置いたものか」を確かめる層が無く、隠された命令はそのまま実行された。"
gap_fix: "AI が指示に従って動く前に「この指示は、この発行元から、この認可で来ている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Socket が公表した認証情報窃取キャンペーン TrapDoor の固有の手口は、AI アシスタント宛ての指示ファイル（`.cursorrules` / `CLAUDE.md`）にゼロ幅 Unicode で見えない命令を仕込み、AI に「セキュリティスキャン」と称する作業をさせて開発環境の秘密を持ち出させる点にある。スキャンや隠し文字の警告で悪性物は除去できたが、AI が指示を読んで動く前に、その指示が正規の作者・認可に由来するかを確かめる層が無い。表示と実体が乖離する以上、内容の妥当性検出だけでは届かない。

---

## 2. 何が起きたか

- **キャンペーン**: Socket が TrapDoor として追跡。npm・PyPI・Crates.io にまたがる 34 超のパッケージと 384 超の版・成果物。crypto・DeFi・Solana・AI コミュニティの開発者を標的とし、SSH 鍵・各種ウォレット・AWS 認証情報・GitHub トークン・ブラウザデータ・環境変数等を窃取
- **公表**: 2026-05-24、Socket Research Team。最古の観測は PyPI の `eth-security-auditor@0.1.0`（2026-05-22 20:20 UTC）。複数アカウントから週末にかけて波状に公開・更新された
- **エコシステム別の実行経路**: npm = postinstall フック（共有ペイロード `trap-core.js`、AWS/GitHub トークンの有効性を API で検証、SSH 鍵で横展開）／ PyPI = import 時に攻撃者の GitHub Pages から JavaScript を取得し `node -e` で実行／ Crates.io = `build.rs` がビルド時にキーストアを XOR 暗号化し GitHub Gists へ送出
- **固有の手口（本 Brief の中心）**: `.cursorrules` / `CLAUDE.md` への AI 標的型インジェクション。これらは AI コーディングツールにプロジェクト固有の指示を与える正規ファイルだが、攻撃者はゼロ幅 Unicode 文字で隠した命令を仕込み、AI アシスタントに「セキュリティスキャン」等の作業を実行させ、秘密の発見・持ち出しに誘導する。攻撃者の GitHub Pages サイトも、AI アシスタントにスキャン実行を促す HTML として機能
- **正規の貢献フローへの混入**: 攻撃者アカウント `ddjidd564` は、`browser-use`・`langchain`・`langflow`・`llama_index`・`MetaGPT`・`OpenHands` 等の実在プロジェクトへ、「dev standards and build verification」等の無害な体裁で `.cursorrules` / `CLAUDE.md` を追加する PR を提出。GitHub は当該ファイルが隠し／双方向 Unicode を含むと警告した
- **攻撃者文書**: 同リポジトリに `AUDIT-MATRIX.md`（自称「Universal AI Agent Extraction Framework」）があり、認証情報窃取を「セキュリティ監査」「ウォレット安全確認」等の無害な作業に見せかける "disguise layer" を記述。キャンペーンマーカー `P-2024-001`

本事象は、AI が従う指示ファイルの来歴・認可を、実行の前に独立検証しない構造に起因する。失敗が秘密の持ち出しへ伝播する経路は以下の通り。

1. **来歴のない指示の配置**: 攻撃者が、悪性パッケージのインストール時、または正規プロジェクトへの PR を通じて、リポジトリに `.cursorrules` / `CLAUDE.md` を置く。中身にはゼロ幅 Unicode で隠した命令が含まれ、画面上は無害な開発ガイドラインに見える
2. **「プロジェクト固有の指示」として信頼**: AI コーディングアシスタントは、これらのファイルをプロジェクトの正規指示として読み込む。「リポジトリに同梱されている」ことを、その指示が正規の作者・正規の認可に由来する保証と取り違える
3. **偽装された作業の実行**: 隠し命令が、認証情報窃取を「セキュリティスキャン」「ウォレット安全確認」「クラウド設定検証」等の無害な作業に偽装して AI に実行させる（攻撃者文書の "disguise layer" が対応）
4. **秘密の発見と送出**: 実行により、開発環境がアクセスできる秘密（SSH 鍵・クラウド/GitHub 認証情報・ウォレット・環境変数）が探索・収集され、攻撃者基盤（GitHub Pages / Gists 等）へ送出される。npm ペイロードは AWS/GitHub トークンの有効性を API で検証し、SSH 鍵で横展開する
5. **検出と無効化**: 悪性パッケージ・PR が検出されると、レジストリ削除や PR 却下が作動する。ただしこれは指示が AI に読まれ実行され得た後に作動する事後の措置である

---

## 3. 時系列 — 公表と対応

- 2026-05-22: 最古の観測パッケージ `eth-security-auditor@0.1.0` を PyPI に公開（20:20 UTC）。以後、複数アカウントから npm・PyPI・Crates.io へ波状に展開
- 2026-05-24: Socket が TrapDoor を公表。クロスレジストリの基盤・挙動の重なりから単一キャンペーンとして関連付け
- 2026-05（同時期）: 攻撃者 `ddjidd564` が実在の AI/開発ツールプロジェクトへ `.cursorrules` / `CLAUDE.md` 追加の PR を提出。GitHub が隠し Unicode を警告
- 継続: Socket が全特定パッケージを悪性と分類し各レジストリへ通報、関連パッケージ・基盤を継続監視

> 注: 攻撃者文書 `AUDIT-MATRIX.md` は自ら「部分的にしか実装されていない設計文書」と述べており、記述すべてが稼働中の挙動とは限らない。本文では、観測された npm ペイロードの挙動と整合する範囲に限って扱い、未確認の主張は断定しない。

公表後の対応と業界の動きは次のとおり。

- **ベンダー・プラットフォーム**: Socket が全特定パッケージを悪性と分類し各レジストリへ通報、関連基盤を継続監視。GitHub は PR の `.cursorrules` / `CLAUDE.md` が隠し／双方向 Unicode を含むと警告し、貢献フロー経由の AI 指示混入が検知対象に挙がった
- **AI 開発環境の論点**: `.cursorrules` / `CLAUDE.md` のような AI 指示ファイルが、コードと同等の信頼境界を持つべき対象として再認識された。AI アシスタントがプロジェクト同梱の指示を読む前に、その来歴・認可・隠し文字の有無を検証する仕組みが課題として挙がっている
- **業界横断の論点**: 供給網攻撃が「パッケージのインストール」を起点に、AI アシスタント設定・シェル環境・Git フック・SSH・ブラウザプロファイル・クラウド認証情報・ウォレットへと開発ワークフロー全体へ広がっている。指示の表面的妥当性を信頼の終点にせず、AI が従う指示の来歴・認可を実行前に検証する（provenance / pre-execution attestation）方向へ、AI 開発ツールの信頼設計の重心を移す議論が進んでいる

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「AI アシスタントが従う指示ファイル（`.cursorrules` / `CLAUDE.md`）の来歴と認可が、AI がそれを読んで実行する前に独立検証されない」</strong>であり、ここに実害への直結がある。「リポジトリに同梱されている」「プロジェクト固有の指示に見える」ことは、その指示が正規の作者・正規の認可に由来するという保証にはならない。ゼロ幅 Unicode による隠蔽は、画面上の表示と AI が実際に読む内容を乖離させ、人間のレビューでも見落とされる。

供給網汚染の運搬手段（npm postinstall・PyPI import 時実行・Crates.io `build.rs`）は従来型だが、本キャンペーンの新しさは、**運搬の終点を「AI アシスタントが読む指示ファイル」に置いた**点にある。[Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)（AI コーディングエージェントが同梱設定を無検証で自動実行した）と同じく「同梱されている＝認可されている」という取り違えだが、本事案は実行対象が設定ではなく**AI への自然言語指示**であり、その指示が改ざんされていても AI は正規のガイドラインとして従う。[Brief 018](https://lemma.frame00.com/ja/critical/briefs/018-hackerbot-claw-ai-vs-ai/)（リポジトリの CLAUDE.md を書き換え、防御側 AI の指示を乗っ取ろうとした）の供給網版であり、[Brief 024](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)（不可視 Unicode により目視と AI 入力が乖離する）の隠蔽手口を、指示ファイルの来歴問題へ接続する。[Brief 028](https://lemma.frame00.com/ja/critical/briefs/028-npm-dependency-confusion-recon/)（内部スコープを偽装したパッケージがビルド環境の来歴前提を突いた）とも、来歴の前提を突く点で連なる。本事案が示すのは、AI 開発環境そのものが供給網汚染の標的レイヤーになったという、来歴検証の不在から実害への直結である。

本事象では、ベンダーリサーチ（Socket のクロスレジストリ検出、平均 6 分弱での新規版検出）、レジストリへの通報と削除、GitHub による隠し Unicode の警告と PR 却下という検出・是正の系列が機能し、手口が外部から可視化された。これは検出の典型的成功であり、本 Brief が検出層の役割を否定するものではない。検出は、手口の公表、悪性パッケージの除去、貢献フローの審査に不可欠である。

一方で、検出は「AI が読もうとしている指示ファイルが、正規に認可され、正規の作者に由来するか」を、**AI がその指示を読んで実行する時点で**独立に立証する材料にはならない。レジストリのスキャンは「このパッケージは悪性か」しか見えず、PR レビューは「この変更は妥当か」しか見えない。いずれも、指示ファイルにゼロ幅 Unicode で隠された命令を、AI が実行する前に来歴の側から区別できない。削除・却下も、指示が読まれ得た後に作動する事後の系列である。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、AI アシスタントが指示ファイルを読んで作業を実行する経路に、その指示の来歴と認可の証明を 1 段挟むことで、この落差を埋める。表示と実体が乖離していても、指示・成果物をその発行元（正規の作者・配布元）に紐付け、来歴を docHash で検証することで、ゼロ幅 Unicode で改ざんされた指示や、正規プロジェクトへ無断で混入した指示を、実行前に「正規の来歴・認可を欠く」として区別できる。指示の表面的な妥当性の検出（detection 的な「この内容は妥当に見えるか」）と、指示の来歴・認可の事前証明（「この指示は正規の発行元・認可を持つか」）は代替ではなく **補完** の関係にある。

本事象で露呈した落差（AI が従う指示ファイルの来歴・認可が、AI の実行から切り離されている）に対して、Lemma は、AI アシスタントが指示・作業を実行する前に、その指示が正規に認可され正規の来歴を持つことを独立検証可能な暗号証明として要求する設計を提示している。

- **指示の来歴バインド**: 実行対象の指示ファイル・成果物を、その発行元（正規の作者・配布元）に紐付け、来歴を docHash で検証する。ゼロ幅 Unicode による表示と実体の乖離を、実行前に検出可能にする
- **行動前の認可証明（proof-as-auth）**: AI が指示に基づく作業（秘密の探索・外部送出・破壊的操作）を行う前に、「この作業は、この主体に、このスコープで認可されている」ことを署名付きで証明する。「リポジトリに同梱されている」ことを認可の終点にしない
- **スコープ付き権限**: AI アシスタントに与える権限を作業ごとに最小化し、認可の範囲を超える秘密の収集・送出を、証明なしには成立させない。正規の作業と、改ざん指示による作業とを証跡で区別する
- **選択的開示**: 「この作業が認可スキーマを満たす」ことだけを最小開示し、内部の鍵・認証情報は環境外に出さない

これにより、実行の時点で固定された証明が、「この指示は正規に認可され、正規の来歴を持つか」を、AI が指示を実行する前に独立検証可能なトレイルとして機能させる。検出（事後の悪性パッケージ除去・PR 却下）は発覚後の是正に、事前証明（実行前の来歴・認可検証）は AI 指示の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **Socket（研究・一次）**: “TrapDoor Crypto Stealer Supply Chain Attack Hits 34 Packages and Hundreds of Versions Across npm, PyPI, and Crates.io”（2026-05-24、エコシステム別実行経路・AI インジェクション・攻撃者文書・IOC） — <https://socket.dev/blog/trapdoor-crypto-stealer-npm-pypi-crates>
- **The Hacker News**: “TrapDoor Supply Chain Attack Spreads Credential-Stealing Malware via npm, PyPI, and CratesIO”（2026-05、概要・標的） — <https://thehackernews.com/2026/05/trapdoor-supply-chain-attack-spreads.html>
- **Phoenix Security**: “TrapDoor Supply Chain Campaign: Cross-Ecosystem Credential Theft and AI Assistant Poisoning via npm, PyPI, and Crates.io”（2026-05、AI アシスタント汚染の整理） — <https://phoenix.security/trapdoor-supply-chain-ai-poisoning-npm-pypi-crates/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance)、[Trust402](https://lemma.frame00.com/ja/trust402/)
