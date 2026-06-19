---
brief_no: 29
title: "github.dev で OAuth トークンが 1 クリックで窃取された — webview が合成イベントを信頼し、トークンは閲覧リポジトリにスコープされていなかった"
title_en: "One-Click GitHub OAuth Token Theft via github.dev — The Webview Trusted Synthetic Events, and the Token Was Not Scoped to the Repo"
pillar: "03-agent-authority"
primary_category: "agent-infrastructure"
secondary_categories: ["identity-auth"]
incident_date: 2026-06-02
published: 2026-06-06
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["003-starlette-badhost", "027-librechat-mcp-url-secrets", "018-hackerbot-claw-ai-vs-ai"]
version: "1.0"
status: published
og_lead_ja: "OAuth トークンが 1 クリックで窃取 — github.dev webview の合成イベント"
og_lead_en: "One-click GitHub OAuth token theft via github.dev"
gap_detected: "研究者の事前通知と提供元による翌日の暫定修正という、予防的な対応は機能した。"
gap_missing: "「この拡張インストールは誰の認可で実行されるか」「このトークンはどの範囲に委任されているか」を実行の前に確かめる層が無く、過剰な権限がそのまま行使された。"
gap_fix: "拡張インストールのような特権行為の前に「この行為は、委任された権限の範囲内にある」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

セキュリティ研究者が、ブラウザ版の開発環境 github.dev の脆弱性と実証コードを公開した。攻撃者が用意したリンクを 1 クリックさせるだけで、画面内のスクリプトが利用者本人の操作になりすました偽の操作を送り込み、悪性の拡張機能をインストールさせて、github.dev が保持する GitHub のアクセス用トークンを盗み出す。決定的だったのは、このトークンが閲覧中のリポジトリだけに限定されておらず、その利用者がアクセスできる全リポジトリに有効だった点で、実証では盗んだトークンで非公開リポジトリの一覧を取得できた。提供元（Microsoft）は翌日に暫定修正を投入した（本稿執筆時点で CVE 未付番）。

---

## 1. 事案概要

- **対象**: github.dev(github.com のリポジトリ画面で `.` キー、または URL の github.com → github.dev で開くブラウザ版 VS Code 編集環境)
- **公開**: 2026-06-02、研究者 Ammar Askar が blog と PoC repo・GitHub issue(microsoft/vscode #319593)で公開
- **根本原因(2 つの連鎖)**:
  1. VS Code の webview(Markdown プレビュー・Notebook 表示等に使う隔離領域)が、ショートカット中継のために webview → 本体へキーイベントを転送する際、**スクリプトが生成した合成イベントを実ユーザー操作と区別せず**扱えた
  2. github.com が github.dev へ POST する OAuth トークンが、**操作対象リポジトリにスコープされず、ユーザーがアクセス可能な全リポジトリに有効**だった
- **攻撃成立**: 偽装イベントで「推奨拡張機能の受け入れ」「ワークスペース内拡張のインストール」フローを進め、攻撃者拡張を実行 → github.dev 内の GitHub API トークンを取得 → GitHub API で非公開リポジトリを列挙(実証では情報ボックスに表示、実害版では外部送信が可能)
- **入口の短さ**: デスクトップ版 VS Code にも同種の問題はあるが、リポジトリのクローンと Notebook を開く操作が必要。github.dev はリンク 1 クリックで編集環境が開くため攻撃の入口が極端に短い
- **修正**: Microsoft が 6-03 にブラウザ版 Notebook を開く際の信頼確認追加・拡張インストールコマンドの任意呼び出し元拒否、6-04 に webview からの一部の合成イベント転送停止を投入。Microsoft はデスクトップ版 VS Code への影響を否定
- **CVE**: 本稿執筆時点で未割当

---

## 2. タイムライン

- 2026-06-02: Ammar Askar が GitHub に通知の約 1 時間後、blog・PoC・GitHub issue #319593 で full disclosure。MSRC を経由しない即時公開(過去の VS Code バグ報告で credit なく silent fix された経緯を理由として明示)
- 2026-06-03: Microsoft が暫定修正(Notebook を開く際の信頼確認、拡張インストールコマンドの呼び出し元検証)を投入。BleepingComputer 等が報道、Microsoft が声明
- 2026-06-04: Microsoft が追加修正(webview からの合成イベント転送の一部停止)を投入

---

## 3. 攻撃ベクター

1. **悪性リンクの配布**: 攻撃者が Jupyter Notebook を含むリポジトリの github.dev リンクを用意し、被害者にクリックさせる
2. **webview での JavaScript 実行**: Notebook の表示処理を通じて、webview の隔離領域内でスクリプトが動作
3. **合成イベントの中継**: スクリプトが VS Code のショートカット操作を偽装し、webview → 本体のイベント中継で「実ユーザー操作ではない合成イベント」を本体へ送る
4. **拡張インストールへの誘導**: 推奨拡張機能の受け入れ通知や、ワークスペース内拡張をインストールする仕組みを組み合わせ、攻撃者の拡張を実行に持ち込む
5. **トークン取得と横展開**: 攻撃者拡張が github.dev 内の OAuth トークンを取得。トークンが全リポジトリに有効なため、GitHub API で被害者の非公開リポジトリを列挙・(実害版では)外部送信できる

---

## 4. 構造的論点

本事象は Pillar 03(エージェント権限証明)の `agent-infrastructure` カテゴリに属する。中心的な失敗 primitive は、**github.dev に委任された権限(OAuth トークン)が、実行に必要な最小範囲(閲覧リポジトリ)にスコープされず、かつ拡張インストールという特権行為が「誰の認可で実行されるか」を独立検証されないまま進んだ**点にある。secondary に `identity-auth` を併記する。

Brief 027(LibreChat MCP URL)・003(Starlette/BadHost)と同じくエージェント基盤の信頼境界の問題である。027 は接続先設定がサーバーの特権文脈を参照した「出口」、003 は Host ヘッダー操作で認証を回避した「入口」。本事象は、その中間にある**委任トークンのスコープと特権行為の認可**が欠けた事例で、3 件は「エージェント基盤が、権限の範囲と行使を独立検証せずに実行する」という構造で同根である。とりわけ「トークンが操作対象に最小スコープされていれば、窃取されても被害は当該リポジトリに限定された」点は、権限証明カテゴリの核心(過剰委任は単一の漏洩を全面侵害に変える)を端的に示す。

副次的に、本事象は**合成イベントが信頼境界を越えた**という入力完全性の問題でもある。webview は「実ユーザーが押したキー」と「スクリプトが作ったキー」を区別すべきところで区別しなかった。これは Brief 018(防御側 Claude Code が取り込む指示 CLAUDE.md の完全性/来歴不在)と同じ「取り込む操作・指示の出所が検証されない」系統に属する。ただし本 Brief の主軸は委任権限のスコープと認可に置く。

---

## 5. 検出と証明の落差

研究者による coordinated に近い公開(GitHub への事前通知)と Microsoft の翌日修正は、被害の予防と利用者保護に有効に機能した。本 Brief がその役割を否定するものではない。利用者側も github.dev の Cookie / サイトデータを消去すれば、悪用リンク click 時にサインイン警告が再表示される緩和が示されている。

一方で、検出は「github.dev がどの範囲のトークンを保持し、どの行為を認可なく実行できるか」自体を変えない。窃取された OAuth トークンによる GitHub API 利用は、github.dev が行う正規のトークン利用と区別がつかず、拡張インストールも正規フローを辿る。欠けていたのは「この拡張インストールは誰の認可で実行されるか」「このトークンはどの範囲に委任されているか」という実行前の独立検証であり、これは異常検知とは別系統である。監査の観点でも、流出後に「どの非公開リポジトリへ・誰の委任で・いつアクセスされたか」を立証する独立した証跡は、API アクセスログの突合以上には残りにくい。

事前証明(pre-execution attestation)は、委任トークンに検証可能なスコープ(対象リポジトリ・有効範囲)を埋め込み、拡張インストールのような特権行為を実行前に「登録者の認可」と「委任範囲」に照らして独立検証する設計を採る。proof が「この行為は委任範囲を超える」「このトークンは当該リポジトリ外に有効であってはならない」と告げれば、行為は実行前に block される。特権行為の検出(detection 的な「不審な拡張が動いた」)と委任権限の事前証明(「この行為は認可された範囲内か」)は代替ではなく**補完**の関係にある。

---

## 6. 対応経緯と業界動向

- **Microsoft / GitHub**: CVE 割当前に 6-03・6-04 と段階的に暫定修正を投入。Notebook を開く際の信頼確認、拡張インストールコマンドの呼び出し元検証、webview からの合成イベント転送の一部停止という、信頼境界とイベント来歴の両面に触れる修正
- **開示プロセスの論点**: 研究者は MSRC を経由しない full disclosure を選び、過去に VS Code バグが credit なく silent fix された経緯を理由に挙げた。同時期に別の研究者(Nightmare Eclipse handle)も MSRC の開示対応への不満から複数のゼロデイを公開しており、ブラウザ/エディタ基盤のゼロデイ開示と修正サイクルのあり方が業界の論点になっている
- **業界横断の論点**: ブラウザ内開発環境・AI コーディング基盤・MCP クライアントは、いずれも「外部から読み込むコンテンツ」と「特権操作・委任トークン」が同一プロセスに同居する。委任の最小スコープ化と特権行為の認可検証を基盤の必須要件とする議論が、本事象と Brief 003/027 を通じて重みを増している

---

## 7. Lemma による分析

本事象で露呈した検出と証明の落差(委任トークンが最小権限にスコープされず、特権行為が独立認可なく実行される)に対して、Lemma は、エージェント基盤への権限委任・特権行為を証跡化し、実行前に「誰が・何を・どの範囲で」認可したかを独立検証可能な証明として検証する設計を提示している。OAuth トークンが過剰に有効でも、委任範囲の proof が「この行為は対象外リポジトリに及ぶ」と告げれば行為は事前に reject される。

---

## 8. Sources

- **Ammar Askar**: "1-Click GitHub Token Stealing via a VSCode Bug"(2026-06-02、研究者本人による技術解説)— http://blog.ammaraskar.com/github-token-stealing/
- **PoC repository**: ammaraskar/github-dev-token-steal-poc(2026-06-02)— https://github.com/ammaraskar/github-dev-token-steal-poc/
- **GitHub issue**: microsoft/vscode #319593 — https://github.com/microsoft/vscode/issues/319593
- **BleepingComputer**: "VS Code zero-day lets hackers steal GitHub tokens in one click"(2026-06-03、Microsoft 声明・修正経緯)— https://www.bleepingcomputer.com/news/security/vs-code-zero-day-lets-hackers-steal-github-tokens-in-one-click/
- **The Hacker News**: "One-Click GitHub Dev Attack Lets Attackers Steal Full GitHub OAuth Tokens"(2026-06)— https://thehackernews.com/2026/06/one-click-github-dev-attack-lets.html

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
