---
brief_no: 38
title: "盗んだ認証情報で自分を再公開する npm ワームが、開発者の鍵をまるごと抜いていた — 正規の公開ワークフローには、公開者が本当の作者かを実行時に確かめる層がない"
title_en: "IronWorm — When Stolen Credentials Become Publishing Authority (npm Self-Propagating Implant)"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-04
published: 2026-06-09
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["014-tanstack-oidc-trusted-publisher", "028-npm-dependency-confusion-recon", "004-megalodon-github-supply-chain", "006-google-api-key-revocation-lag"]
status: published
version: "1.0"
og_lead_ja: "盗んだ認証情報で自分を再公開する npm ワーム — IronWorm"
og_lead_en: "A self-propagating npm worm republishes itself with stolen credentials — IronWorm"
gap_detected: "セキュリティ企業 JFrog 等の解析とレジストリの対応で、感染パッケージは特定・無効化できた。"
gap_missing: "公開・コミットの時点で「公開しようとしている者は、その成果物の正規の作者か」を確かめる層が無く、有効な認証情報の提示だけが公開の根拠になった。"
gap_fix: "公開・コミットの前に「この成果物は正規の作者によって認可され、正規の来歴を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

JFrog が報告した npm マルウェア「IronWorm」は、開発環境の認証情報を盗み、その鍵で被害者のリポジトリに自身を書き込み正規の公開手順で再公開する自己増殖ワームである。レジストリの無効化やベンダー解析は、公開され鍵が盗まれた後に作動する事後の検出にとどまる。欠けているのは、公開時に「公開者が本当に正規の作者か」を独立検証する層であり、有効な token の提示だけが公開の根拠になっている。

---

## 2. 何が起きたか

- **報告**: 2026-06-04、JFrog Security Research が npm 上の自己増殖型マルウェア「IronWorm」を報告。約 37 パッケージに感染
- **実装**: Rust で書かれた約 976 KB の ELF を preinstall フックで実行。署名ベースの解凍を妨げる改造 UPX スタブ、呼び出し箇所ごとに固有鍵で文字列を暗号化、eBPF ベースのルートキット機能を備える（eBPF ルートキットの技術詳細は Phoenix Security の分析による）
- **窃取対象**: 86 の環境変数と 20 以上の認証情報ファイルを掃き出す。AWS・GCP・Azure・HashiCorp Vault・Kubernetes・npm・Docker・GitHub に加え、2026 年世代の AI プロバイダ鍵（Anthropic・OpenAI・Gemini・Cohere・Mistral・Groq・Perplexity・xAI）
- **自己増殖**: 盗んだ認証情報を使い、被害者の GitHub リポジトリに自身をコミットし、開発者の正規ワークフローを通じて npm に再公開する。1 つの環境の侵害が、その環境からアクセス可能なリポジトリ・パッケージへ連鎖する
- **C2**: Tor expert bundle を取得し、自前の torrc を書いて秘匿サービスの `/api/agent` にビーコンする
- **評価**: JFrog は、機能と暗号化の組み合わせから「周到に作り込まれた専用実装」であり、本キャンペーンの最終形ではなく予行演習の可能性があるとした。Shai-Hulud 系の血統に連なる（同系統には TeamPCP の Mini Shai-Hulud／Miasma がある）

本事象は、公開ワークフローが公開者の作者性を実行時に検証しない構造に起因する。失敗が増殖へ伝播する経路は以下の通り。

1. **初期実行**: 感染パッケージのインストール時、preinstall フックで Rust 実装が起動する。暗号化・改造 UPX により、署名・パターンベースの検査をすり抜ける
2. **認証情報の窃取**: 開発環境の環境変数・認証情報ファイル（クラウド・レジストリ・GitHub・AI プロバイダ鍵）を掃き出す。盗まれた token は、そのまま公開・コミットの権限を意味する
3. **作者性の不在を突く**: npm への公開も GitHub へのコミットも、「有効な token が提示された」ことを公開の根拠とする。提示者がその成果物の正規の作者かは、公開の時点で独立に検証されない
4. **自己増殖**: 盗んだ認証情報で被害者のリポジトリに自身をコミットし、正規ワークフロー経由で再公開する。下流の利用者には、通常どおり公開された正規パッケージに見える
5. **検出と無効化**: ベンダーリサーチとレジストリの対応で感染パッケージが特定・無効化される。ただしこれは公開され、認証情報が窃取された後に作動する事後の措置である

---

## 3. 時系列 — 公表と対応

- 2026-05: TeamPCP が Mini Shai-Hulud を OSS 化（npm 自己増殖ワームの系統が拡散）
- 2026-06-01〜: 同系統の Miasma が Red Hat・Microsoft のエコシステムで展開（別実装、[Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/) 系）
- 2026-06-04: JFrog が IronWorm（Rust 製・eBPF ルートキット・Tor C2・約 37 パッケージ）を報告
- 2026-06: 影響パッケージの特定・無効化が進行。JFrog は本キャンペーンの継続・進化の可能性を指摘

> 注: 影響パッケージの正確な総数・ダウンロード規模・帰属は調査の進行に依存するため、本文では断定しない。

公表後の対応と業界の動きは次のとおり。

- **レジストリ・ベンダー**: 感染パッケージの特定・無効化が進み、npm では流出 token だけでは公開できない段階的公開などの対策が導入されている。一方、これらは公開後の検出・公開前のゲートの強化であり、公開者の作者性そのものの独立検証には届いていない
- **認証情報運用**: 窃取された認証情報が増殖の燃料になるため、失効・ローテーションの即時性が論点となる。初回感染後に認証情報を完全にローテーションできていれば断てる連鎖が、運用上の遅れで継続する
- **規制の重心移動**: 規制の重心はデータ開示からコンプライアンス証明へ移りつつある。ソフトウェアサプライチェーンにおいて、成果物の出所と公開者の正当性を、事後のログではなく公開の時点で独立検証可能な形で示す要請が強まっている
- **後続波（Phantom Gyp / Miasma）**: 同系統の後続波（2026-06-03、StepSecurity が "Phantom Gyp" と命名、広域キャンペーン名 Miasma）は、初期実行を `preinstall`/`postinstall` から `binding.gyp` / `node-gyp`（および RubyGems の `extconf.rb`）へ移した。57 パッケージ・286 版超に拡大し、再感染パッケージは Sigstore provenance を偽造して正規署名に見せかけた。いずれも「install/build 時に自動実行されるが、誰も『スクリプト』と分類しないファイル」を突く点で、**自動実行のトリガが移動し続けている**ことを示す。盗んだ認証情報がそのまま公開権限に転化する primitive は本事案と同一のため、独立 Brief として新規採番はしない

成果物の作者性・来歴を公開の時点で独立検証する層の不在は、特定パッケージの問題ではなく、パッケージエコシステムを利用する組織横断の運用課題として残っている。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**盗まれた認証情報がそのまま公開の権限に転化し、公開ワークフローが「公開者が本当にその成果物の正規の作者か」を公開の時点で検証しない**点にある。有効な token の提示が公開の根拠になっている限り、token を盗んだワームは「正規の公開」として自身を配布でき、下流からは通常のパッケージと区別がつかない。

[Brief 014](https://lemma.frame00.com/ja/critical/briefs/014-tanstack-oidc-trusted-publisher/)（正規 OIDC trusted publisher で署名されても成果物は悪性）、[Brief 028](https://lemma.frame00.com/ja/critical/briefs/028-npm-dependency-confusion-recon/)（内部スコープを偽装した依存関係混乱）、[Brief 004](https://lemma.frame00.com/ja/critical/briefs/004-megalodon-github-supply-chain/)（CI/CD 認証情報窃取によるサプライチェーン汚染）と対象は異なるが、共通する primitive は同じである。すなわち、**ある成果物の公開・配布が、その作者性・来歴を検証する layer と切り離されている**。IronWorm が際立たせるのは、盗んだ認証情報が「窃取 → 再公開 → さらなる窃取」の自己増殖ループを駆動する点であり、認証情報の失効・ローテーションが追いつかない限り被害が連鎖する（認証情報の失効属性の独立検証不在は [Brief 006](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/) と接続する）。

本事象では、ベンダーリサーチ（JFrog ほか）とレジストリの無効化という検出の系列が機能し、実装と感染が外部から可視化された。これは検出の典型的成功であり、本 Brief が検出層の役割を否定するものではない。検出は、実装の解析、感染範囲の特定、無効化と是正に不可欠である。

一方で、検出は「いま公開されようとしている成果物が、正規の作者によって認可されたものか」を、**公開の時点で**独立に立証する材料にはならない。レジストリは「有効な token による公開」としか見えず、IronWorm は暗号化と改造 UPX で署名・パターン検査をすり抜けるよう作られている。ベンダーリサーチもレジストリの無効化も、公開され認証情報が窃取された後に作動する事後の系列である。これは検出層の射程外にある、構造的に独立した層の落差である。

現状、パッケージエコシステム全体において、公開者の作者性の独立検証は、「有効な token が提示された」ことへの信頼に依存しており、まだ独立した層として扱われていない（npm の段階的公開のように、流出 token だけでは公開できない仕組みの導入は始まっているが、作者性そのものの証明には至っていない）。事前証明（pre-execution attestation）は、公開・コミットの経路に作者性証明を 1 段挟むことで、この落差を埋める。事前証明は検出に対する代替ではなく **補完** であり、両層の組み合わせで成果物の trust boundary が確立される。

---

## 5. 証明があれば、何が変わるか

本事象で露呈した落差（盗まれた認証情報がそのまま公開権限に転化し、公開者の作者性が公開の時点で独立検証されない）に対して、Lemma は、公開・コミットの時点で「この成果物は正規の作者によって認可されている」ことを独立検証可能な暗号証明として要求する設計を提示している。

- **作者性のアテステーション**: 公開・コミットを、token の提示ではなく、正規の作者に紐づく署名付き証明で裏づける。盗んだ token だけでは、作者性の証明を満たせないようにする
- **成果物の来歴バインド**: 公開される成果物を docHash でその出所・ビルド過程に紐付け、改ざん・差し替えを公開前に検証可能にする
- **失効の即時反映**: 認証情報・鍵の有効性属性を独立検証可能にし、失効・ローテーションが公開判断に即時反映される設計とする（窃取された認証情報による再公開の連鎖を断つ）
- **選択的開示**: 「公開者が正規の作者性要件を満たす」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない

これにより、公開の時点で固定された証明が、「この成果物は正規に認可され、正規の来歴を持つか」を、下流が取り込む前に独立検証可能なトレイルとして機能させる。検出（事後のベンダーリサーチ・無効化）は発覚後の是正に、事前証明（公開時点の作者性・来歴検証）はサプライチェーンの独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **JFrog Security Research（一次）**: “IronWorm: Shai-Hulud's rustier cousin”（2026-06-04、Rust 実装・eBPF ルートキット・Tor C2・認証情報窃取と自己増殖）— <https://research.jfrog.com/post/iron-worm-shai-hulud-rustier-cousin/>
- **Dark Reading（二次）**: “Rust-Written IronWorm Hits NPM Supply Chain” — <https://www.darkreading.com/cyberattacks-data-breaches/rust-written-ironworm-npm-supply-chain>
- **BleepingComputer（二次）**: “New IronWorm malware hits 36 packages in npm supply-chain attack” — <https://www.bleepingcomputer.com/news/security/new-ironworm-malware-hits-36-packages-in-npm-supply-chain-attack/>
- **Phoenix Security（二次・技術詳細）**: “IronWorm (No CVE): Rust-Built npm Worm Ships an eBPF Rootkit, Tor C2, and a Self-Propagating Supply Chain Implant Across 37 Packages” — <https://phoenix.security/ironworm-npm-supply-chain-worm-rust-ebpf-rootkit-tor/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/#provenance)、[Trust402](https://lemma.frame00.com/ja/trust402/)
