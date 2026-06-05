---
brief_no: 28
title: "npm 依存関係混乱による開発環境偵察キャンペーン — 内部スコープを偽装した 33 パッケージが、ビルド環境の来歴前提を突いた"
title_en: "The npm Dependency-Confusion Recon Campaign — 33 Packages Impersonating Internal Scopes Exploit the Build Environment's Provenance Assumptions"
pillar: "01-verifiable-origin"
primary_category: "code-provenance"
secondary_categories: ["identity-auth"]
incident_date: 2026-05-28
published: 2026-06-05
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["004-megalodon-github-supply-chain", "014-tanstack-oidc-trusted-publisher", "015-github-vscode-extension-breach"]
version: "1.0"
status: published
og_lead_ja: "内部スコープを偽装した 33 パッケージが、ビルド環境の来歴前提を突いた — npm 依存関係混乱キャンペーン"
og_lead_en: "33 packages impersonating internal scopes exploited the build environment's provenance assumptions — npm dependency-confusion recon campaign"
---

## TL;DR

2026 年 5 月 28–29 日、単一のオペレーターが 3 つの npm メンテナアカウントを使い分け、実在する企業の内部スコープを模した 9 つの組織スコープに 33 個以上の悪性パッケージを公開した。依存関係混乱(dependency confusion)の手口で、`@cloudplatform-single-spa` や `@sber-ecom-core/sberpay-widget`(Sberbank の SberPay 偽装)等の内部名を騙り、`package.json` には実在しそうな社内 GitHub Enterprise / Jira / ドキュメントポータルの URL を偽装記載した。`npm install` 時の `postinstall` フックで難読化されたステージャが起動し、CI 環境を検出すると沈黙、それ以外では C2 から payload を取得して環境変数・認証情報・開発文脈を収集する。現時点では `RECON_ONLY=1` 固定の偵察モードだが、サーバー側でフラグを切り替えれば本格的な搾取へ移行できる二段構成である。Microsoft Threat Intelligence のフィードバックを受け該当パッケージ群は削除された。本キャンペーンは Pillar 01(来歴証明)の `supply-chain-trust` における、**パッケージ名とメタデータの「内部らしさ」が、レジストリ解決における来歴の代わりに使われている**ことを示す事例であり、Brief 004 / 014 / 015 のサプライチェーン群に連なる。

---

## 1. 事案概要

- **対象**: npm 公開レジストリ(被害は dependency confusion を許す設定の開発・ビルド環境)
- **規模**: 3 アカウント(mr.4nd3r50n / ce-rwb / t-in-one)で 33 以上のスコープ付きパッケージ、9 組織スコープ
- **発生日**: 2026-05-28(26+7 パッケージ)・2026-05-29(12 パッケージ)。一部スコープは 2026-05-04 に事前ステージング
- **手口**: 依存関係混乱(内部パッケージ名の模倣)+ 偽装した企業インフラ URL のメタデータ + 異常に高いバージョン番号(`100.100.100` 等)でレジストリ解決を奪取
- **ペイロード**: `postinstall` フックで起動する難読化ステージャ(obfuscator.io 系)。CI 検出で沈黙、Node.js 16+ 確認、キャッシュによる重複実行回避、OS 別 payload を C2(`oob.moika[.]tech`)から取得し、デタッチドプロセスで実行
- **段階設計**: `RECON_ONLY=1` 固定の偵察モード(環境情報・ホスト名・環境変数・開発文脈の収集)。サーバー側でフラグを切替えれば認証情報窃取・バックドア設置の本格搾取へ移行可能
- **帰属**: 全アカウントで共通の X-Secret ヘッダー値・同一 C2・同一テンプレート生成器・publishing ツールチェーンの一致から、単一オペレーターと高確度で評価。1 アカウントは 2024 年にバグバウンティ研究者として活動していた痕跡
- **対処**: Microsoft Threat Intelligence の調査・npm へのフィードバックにより該当 repo / ユーザーは削除

---

## 2. 事象連鎖

(本件は攻撃 incident だが、被害組織の具体的特定は公表されておらず偵察段階のため、事象連鎖として整理する。時刻は UTC、Microsoft Threat Intelligence 公表に基づく)

- 2026-05-04: `@capibar.chat/ui-kit`・`@sber-ecom-core/sberpay-widget` を 99.0.7 で事前ステージング
- 2026-05-28 18:47–18:51: mr.4nd3r50n が `@cloudplatform-single-spa` スコープに 26 パッケージを公開(全て v100.100.100)
- 2026-05-28 19:02–19:03: ce-rwb が 7 パッケージを公開(v3.5.22、別スコープ)。前バッチとの 12 分差はアカウント切替えと整合
- 2026-05-29 09:01:56–09:02:39: t-in-one が `@t-in-one` の認証/トークン名 10 パッケージを 43 秒の自動バーストで公開。直後に `@capibar.chat`・`@sber-ecom-core` を再公開
- 公開後: 各 payload は同一 C2(`oob.moika[.]tech`)へ接続、同一 X-Secret ヘッダーを送出
- 2026-05-29 以降: Microsoft Threat Intelligence が能動的なサプライチェーン攻撃として特定・公表(ブログは 5/29 付、5/30 更新)。npm へのフィードバックで該当パッケージ群が削除

---

## 3. 攻撃ベクター

1. **ネームスペーススクワッティング**: 実在企業の内部名を模したスコープ(`@cloudplatform-single-spa`、`@payments-widget`、`@sber-ecom-core` 等)にパッケージを登録
2. **メタデータ偽装**: `package.json` の homepage / repository / bugs / author を、実在しそうな社内 GitHub Enterprise・Jira・docs ポータルの URL に設定し、コードレビューでの一見の正当性を演出
3. **バージョン番号の吊り上げ**: `100.100.100` 等の異常高バージョンで、誤設定された npm の解決順序において実在の内部パッケージに勝つ
4. **install 時コード実行**: `postinstall` フックにより、被害コードからの `require()` を待たず `npm install` の瞬間に実行
5. **難読化ステージャの動作**: CI 環境変数を検出すると沈黙(監視の濃い CI を回避)、Node バージョン確認、`~/.cache/<scope>_init/` による重複実行回避、プロジェクトルート特定、OS 判定の後、C2 から payload を取得
6. **デタッチド実行と偵察**: payload を `tmpdir` に書き出し、`npm install` 終了後も生存する独立プロセスで起動。環境変数・認証情報・開発文脈を収集。`RECON_ONLY` フラグはサーバー側で本格搾取へ切替え可能

---

## 4. 構造的論点

本キャンペーンは Pillar 01(来歴証明)の `supply-chain-trust` カテゴリに属する。中心的な失敗 primitive は、**パッケージ解決が「名前の一致」と「メタデータの内部らしさ」を、そのパッケージが本当に正規の内部発行元から来たかという来歴の代わりに使っている**点にある。secondary に `code-provenance`(コード成果物の発行元来歴)と `identity-auth` を併記する。

Brief 004(Megalodon)・014(TanStack OIDC)・015(VS Code 拡張)と同じサプライチェーン群だが primitive が異なる。004 は窃取した CI/CD 認証情報での大量汚染、014 は正規の trusted publisher を乗っ取り**有効な署名のまま**悪性公開、015 は審査をすり抜けた毒入り拡張の掲載。本件は署名や正規発行元の乗っ取りを伴わず、**そもそも発行元が攻撃者である新規パッケージ**を、内部名の模倣だけで解決させる。014/015 が「正規の来歴を奪う」のに対し、本件は「来歴の検証が最初から行われていない隙(dependency confusion)を突く」。両者は「ビルドが取り込む成果物の発行元来歴が独立検証されていない」という点で同根である。

`@sber-ecom-core/sberpay-widget` による Sberbank の決済ウィジェット偽装は、金融セクターを明示的に狙ったことを示し、偵察で得た内部構成情報が後続の標的型搾取に使われる二段設計と合わせ、単発の typosquat より射程が長い。

---

## 5. Detection 層では届かない構造的 gap

Microsoft Defender 等によるステージャの検疫、IOC ベースの egress 遮断、レジストリへの通報と削除は、本キャンペーンの封じ込めに有効に機能した(該当パッケージ群は削除済み)。本 Brief がその役割を否定するものではない。

一方で、検出は「ビルドがどのパッケージを正規の内部発行元のものとして受け入れるか」の決定自体を変えない。本件のステージャは CI 検出で沈黙し、キャッシュで重複実行を避け、難読化と無害な build/test スクリプトで正当な開発ワークフローを装う——いずれも検知を遅らせる設計である。検知が成立した時点では、すでに `npm install` 時に偵察 payload が走り、環境変数や開発文脈が C2 へ送出されうる。欠けていたのは「このパッケージは、騙っている内部スコープの正規発行元から実際に発行されたか」という取り込み前の来歴検証であり、これはマルウェア検知とは別系統である。規制報告・監査で「ビルドが取り込んだ依存が正規来歴を持つか」を立証する材料として、事後のスキャン結果は独立した来歴証跡にならない。

事前証明(pre-execution attestation)は、ビルドが依存を取り込む前に、パッケージの発行元来歴(主張するスコープの正規発行者か、想定経路で発行されたか)を独立検証可能な暗号証明として要求する設計を採る。proof が「この `@sber-ecom-core` パッケージは正規発行元の来歴を持たない」と告げれば、解決・インストールは事前に block される。マルウェア検知(detection 的な「この payload は悪性だ」)と発行元来歴の事前証明(「この成果物は正規発行元から来た」)は代替ではなく**補完**の関係にある(検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)(Lemma、2026-05)を参照)。

---

## 6. 対応経緯と業界動向

- **Microsoft Threat Intelligence**: 能動的キャンペーンとして特定・公表し、IOC(C2 ドメイン、X-Secret 値、ドロップされる payload のパターン)とハンティングクエリ、緩和策(`--ignore-scripts`、スコープロック、認証情報ローテーション)を提示。npm へのフィードバックで該当パッケージ群を削除に導いた
- **業界横断の論点**: 同時期に Mini Shai-Hulud 系の typosquat キャンペーン(Brief 014/015 と同根の TeamPCP クラスタ)も観測されており、npm エコシステムが 2026 年に入りサプライチェーン攻撃の集中領域になっている。dependency confusion・typosquat・trusted publisher 乗っ取りという複数 primitive が並行する状況で、「ビルドが取り込む成果物の来歴をどう独立検証するか」が共通課題として固まりつつある

スコープロック(`.npmrc` で内部スコープを私設レジストリに固定)や install スクリプトの無効化は有効な緩和だが、いずれも運用者の正しい設定に依存する。発行元来歴の検証をビルドの必須ステップに組み込むという論点が、本件を含む 2026 年のサプライチェーン事案を通じて重みを増している。

---

## 7. Lemma による分析

本キャンペーンで露呈した構造的 gap(パッケージ解決が名前とメタデータの内部らしさを来歴の代わりに使い、発行元来歴を独立検証しない)に対して、Lemma は、ビルドが依存を取り込む前に成果物の発行元来歴を独立検証可能な暗号証明として検証する設計を提示している。パッケージ名やメタデータが内部発行元を騙っていても、来歴の proof が正規発行元の不在を告げれば取り込みは事前に reject される。「名前が内部らしい ≠ 正規発行元から来た」という来歴証明カテゴリの設計思想と、その reference 実装は [verifiable-origin proof sample](https://github.com/lemmaoracle/example-origin)(GitHub)に示している。サプライチェーン来歴の設計背景は Brief 014 / 015(TeamPCP クラスタ)と合わせて参照のこと。

---

## 8. Sources

- **Microsoft Security Blog (Microsoft Defender Security Research Team)**: "Malicious npm packages abuse dependency confusion to profile developer environments"(2026-05-29、攻撃チェーン・帰属・IOC・緩和策)— https://www.microsoft.com/en-us/security/blog/2026/05/29/33-malicious-npm-packages-abuse-dependency-confusion-profile-developer-environments/
- **Microsoft Security Blog**: "Typosquatted npm packages used to steal cloud and CI/CD secrets"(2026-05-28、同時期の Mini Shai-Hulud キャンペーン、隣接事案)— https://www.microsoft.com/en-us/security/blog/2026/05/28/typosquatted-npm-packages-used-steal-cloud-ci-cd-secrets/

---

## 9. Brief 配布について

Lemma Critical Brief は Lemma が発行する threat intelligence brief です。本資料は公開情報の構造化分析であり、特定の組織への監査・診断・推奨ではありません。意思決定の参考として用いる場合は、貴組織の Lemma Critical 担当に直接ご相談ください。

[Discovery Call →](https://tally.so/r/EkBqDX)
[ホワイトペーパー →](https://tally.so/r/xX0VYv)
[✉️ ニュースレター →](https://tally.so/r/EkMj82?ref=brief-cta)

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
