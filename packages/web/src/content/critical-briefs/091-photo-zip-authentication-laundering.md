---
brief_no: 91
title: "Photo ZIP：認証ランダリングで SPF・DKIM・DMARC を全通過した「Calendly 発」のメールは、攻撃者が書いた偽物だった — ホテル受付に Node.js バックドア（TonRAT）"
title_en: "Photo ZIP: 'Authentication Laundering' Cleared SPF/DKIM/DMARC So a Fake 'via Calendly' Email Looked Legitimate — a Node.js Backdoor (TonRAT) at Hotel Front Desks"
pillar: "01-verifiable-origin"
primary_category: "identity-auth"
secondary_categories: ["code-provenance"]
incident_date: 2026-06-25
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["030-stripe-trusted-channel-skimmer", "064-salesloft-drift-oauth-salesforce", "062-claude-code-github-action-bot-trust", "047-openclaw-agent-phishing"]
status: "published"
version: "1.0"
og_lead_ja: "Photo ZIP：Calendly+Google リダイレクトの認証ランダリングで SPF/DKIM/DMARC を全通過。メール認証は経路を確かめ authorship を確かめない（ホテル受付に Node.js バックドア TonRAT）"
og_lead_en: "Photo ZIP: authentication laundering via Calendly+Google redirects cleared SPF/DKIM/DMARC. Email auth checks the path, not authorship (a Node.js backdoor, TonRAT, at hotel front desks)"
gap_detected: "メール認証 SPF・DKIM・DMARC は 3 つとも作動して完走し、メールが正規の送信基盤（Calendly）から送られたことは確かに検証された。"
gap_missing: "認証が確かめたのは送信経路の正当性だけで、「その予約・苦情連絡を書いたのが正規の取引相手か（authorship）」を実行の前に証明する層が無かった。"
gap_fix: "正規の予約・ゲスト連絡に作成主体の暗号的な来歴証明を付与し、それを欠くメッセージを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

Microsoft 脅威インテリジェンスは 2026-06-25、欧州・アジアのホテル・宿泊施設業界を狙う多段階キャンペーン「Photo ZIP」を公表した。技術的核心は、正規スケジュール SaaS（Calendly）の通知基盤と Google のリダイレクトを中継させ、SPF・DKIM・DMARC の 3 認証をすべて正規として通過させる「認証ランダリング（authentication laundering）」である。受信者に表示される送信者名は「Booking Manager（via Calendly）」。PNG 画像に偽装した LNK ファイル（`photo-<乱数>.zip` 内）を受付担当が開くと、PowerShell 経由で正規の Node.js ランタイムが落とされ、インプラント TonRAT が二重レジストリ持続化と C2 を確立する。日本語のルアー（ゲスト苦情・南京虫通報等）が最多で観測され、日本の宿泊施設も射程に入る。メール認証は完走したが、それは皮肉にも攻撃を「正規」と裏書きしただけだった——認証は送信経路を確かめ、authorship を確かめない。検出と事前証明は代替ではなく補完である。

---

## 1. 事案概要

- **研究主体**: Microsoft Defender Security Research Team（Parth Jomadkar）。2026-06-25 に技術レポートと IoC（C2 ドメイン・ハッシュ等）を公表
- **対象**: 欧州・アジアのホテル・宿泊施設業界。とくに予約・フロント担当（端末名に `reception-`・`frontdesk-`・`accueil`・`recepcja` 等を含むアカウント）が選別的に標的化された
- **被害規模**: Microsoft が複数組織での侵入を確認。最終目的は現時点で不明で、難読化・持続化への投資から「後続活動の準備段階（staging）」と評価。帰属は既知の脅威アクターになし（要確認: 被害組織数・国別内訳）
- **根本原因**: メール認証（SPF・DKIM・DMARC）が「送信経路の正当性」のみを検証し、「文面の作成主体・権限（authorship）」を証明しない構造的盲点。攻撃者はこの盲点を、正規 SaaS の送信基盤を中継させる「認証ランダリング」で突いた
- **構造的要点**: ①信頼された SaaS 送信元という"真の属性"を、攻撃文面の"偽の authorship"の隠れ蓑に使った点、②PNG 偽装 LNK による実行ファイルの来歴隠蔽、③正規ランタイム（Node.js）への偽装による検知回避、が重なった
- **核心**: メッセージの伝送経路は検証されたが、作成主体（誰が・どの権限で書いたか）の来歴は検証されず、認証を全通過したまま受付端末にバックドアが到達した

---

## 2. タイムライン

- 2026-04: 「Photo ZIP」キャンペーンの活動開始（Wave 1）。`IMG-<乱数>.png.lnk` を用いる初期手口
- 2026-05 末: 配信手法が進化。Calendly 通知基盤＋Google リダイレクトによる「認証ランダリング」を導入。送信者名「Booking Manager（via Calendly）」
- Wave 2: ファイル名プレフィックスが `IMG-` → `PHOTO-` に変化。PowerShell から `csc.exe` で .NET DLL を動的コンパイルするステージを追加。Cloudflare 背後の `photo-<数字>.cfd` ドメインを追加
- 2026-06-25: Microsoft Defender Security Research Team が技術レポートと IoC を公表

> 注: 本事案は Microsoft 脅威インテリジェンスによる公表に基づく研究・観測であり、最終目的は本 Brief 作成時点で未確認（後続活動への準備段階と評価）。帰属は既知の脅威アクターになされていない。ルアー言語は日本語（最多）・デンマーク語・オランダ語が観測され、`accueil`・`recepcja` 等は端末名のパターンとして報告されている。インプラントは TonRAT として追跡されているが、その C2 解決の細部（ドメイン以外の経路）は公表範囲を超える主張をしない。被害規模・国別内訳・ドメイン/ハッシュ等の IoC は一次情報（Microsoft 公式）の最新を参照されたい。誇張しない。

---

## 3. 攻撃ベクター（認証ランダリング → Node.js インプラント）

1. **正規 SaaS を中継させる**: 攻撃者が Calendly のシステムでメール通知を生成し、Calendly の `/url` リダイレクト → Google の share リダイレクト → `photo-<数字>.cfd` という多段リンクを本文に埋め込む
2. **メール認証を全通過**: メールは実際に Calendly のインフラから送出されるため、受信側の SPF・DKIM・DMARC をすべて通過し、「Booking Manager（via Calendly）」として受信トレイに届く。認証は「正規の送信基盤を経由したか」を確かめ、「誰が書いたか」は確かめない
3. **PNG 偽装 LNK を開かせる**: 受付担当がリンクをクリックすると `photo-<乱数>.zip` がダウンロードされ、中の `IMG/PHOTO-<乱数>.png.lnk`（既定設定では PNG 画像に見える）を写真と誤認して開く
4. **正規ランタイムへの偽装**: LNK 実行 → 難読化 PowerShell（BigInt 演算で隠した URL を復号）→ nodejs.org から正規の Node.js v24.13.0 ランタイムをユーザー空間に取得 → その上で JavaScript インプラント TonRAT を実行
5. **持続化と C2**: Windows レジストリ 2 か所（`HKCU\Run` と `HKCU\RunOnce`）への二重持続化を確立し、キャンペーンドメインとの C2 通信を確立。侵害後活動として C2 ビーコニング・強制シャットダウン・PE ペイロードのコンパイル（Wave 2 では `csc.exe` 経由の .NET DLL 生成）を観測。最終目的は未確認

これはメール認証の盲点をついた **authentication laundering（認証ランダリング）** の事例である。SPF・DKIM・DMARC は送信ドメイン／経路の真正性を保証するが、authorship（文面の作成主体）の真正性は保証しない。

---

## 4. 構造的論点

本事案は Pillar 01（来歴証明）の `identity-auth` カテゴリに属する。中心的な失敗 primitive は、**「経路が正規である（channel_is_legitimate）」を「文面が真正である（message_is_authentic）」と取り違えた**点にある。信頼の単位が「伝送経路」に置かれ、「作成主体（authorship）」に置かれていなかった。メール認証は確かに作動したが、それが立証したのは「正規の SaaS 送信基盤を経由した」ことだけで、「この予約・苦情連絡を、主張どおりの取引相手が、その権限で書いた」ことではない。正規 SaaS を中継した瞬間、検出はむしろ攻撃を「認証済み」と裏書きした。

本事案は、信頼された経路・送信元が攻撃に転用された一連の Brief と同じ系列で連なる。Brief No.030（Stripe、信頼された API インフラがカード窃取の配送・保管に転用された）は、信頼された経路そのものが内容の真正性を保証しない点で本件と同型である。Brief No.064（Salesloft Drift、信頼された連携の OAuth が悪用された）は、確立済みの信頼関係が悪意ある操作の隠れ蓑になった点で連なる。Brief No.062（Claude Code GitHub Action、`[bot]` の名乗りを信頼して特権実行された）は、「主張された identity」を検証せずに信頼した点で同じ失敗 primitive を共有する。Brief No.047（OpenClaw、送信者を確かめる前に認証情報を送出した）とは、予約・宿泊まわりで authorship 検証が欠落した点で隣接する。いずれも、**信頼の根拠が「経路・名乗り」に置かれ、「作成主体の来歴」が独立検証されていなかった**。

secondary に、PNG 偽装 LNK と正規 Node.js への偽装によって実行ファイルの来歴が隠蔽された点で `code-provenance` を併記する。メール認証や送信元レピュテーションは前提として有用だが、メッセージの作成主体が「主張どおりの主体か」を来歴として独立検証して初めて、予約・ゲスト連絡を受付業務の現場で安心して扱える。

---

## 5. 検出と証明の落差

SPF・DKIM・DMARC の 3 認証がすべて作動し完走したこと自体は、なりすましメール対策に不可欠であり、本 Brief がその役割を否定するものではない。メールが正規の送信基盤（Calendly）から送出されたことは確かに検証された。検出（送信ドメイン／経路の認証）は確かに機能した。

一方で、メール認証が確かめたのは「Calendly から送られたか（経路の正当性）」だけで、「この予約・苦情連絡を書いたのが正規の取引相手か（authorship）」は誰も証明できなかった。欠けていたのは、メッセージの作成主体が「主張どおりの主体・正規の権限か」を実行（受付担当の開封・クリック）の前に独立検証する層であり、これは経路の認証とは別系統の検証である。正規 SaaS を中継した瞬間、認証はむしろ攻撃を「認証済み」と裏書きし、受信者の警戒を下げた。事後にこのメールを悪性と判定し直しても、すでに開封・実行へ到達したバックドアは止まらない。

事前証明（pre-execution attestation）は、メッセージの「経路の正当性」ではなく「作成主体の正当性」を、実行の前に独立検証可能な形で立証する。正規の予約・ゲスト連絡に作成主体の暗号的な来歴証明（Seal 等）を付与すれば、受付担当・メール基盤は「期待される authorship 証明を欠くメッセージ」を即座に識別できる。経路の認証（detection 的な「正規基盤から届いた」）と、作成主体の来歴の事前証明（「主張どおりの主体が書いた」）を切り離さず、両者が重なって初めて、予約・ゲスト連絡を実務で安心して扱える。信頼の単位が「経路」から「作成主体」へ移り、認証ランダリングが成立しなくなる。検出と事前証明は代替ではなく **補完** の関係にある。

事後の検知が証明にならない論点は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）、行動の前に独立検証する設計は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）を参照。

---

## 6. 対応経緯と業界動向

- **Microsoft（研究主体）**: 緩和策として、「Booking Manager（via Calendly）」を送信者名とするメールへの全スタッフ周知、リダイレクト URL の最終リンク先確認、既知拡張子の表示設定、LNK 実行制限・ASR ルール、正規ランタイム（Node.js）の非標準な配置や外部通信を検知する SIEM・EDR ルール追加、公開 IoC の登録を推奨。Microsoft Defender の関連アラートを案内
- **業務特性の悪用**: 本件は、ホテル業界を狙う一連のフィッシング（Booking.com 偽装、宿泊業界向けの繰り返しの注意喚起等）の延長線上にあり、宿泊業の「写真・文書添付を日常的に扱う受付」という業務特性が標的選定に利用されている。日本語ルアーが最多であり、日本の宿泊施設も対象に含まれる
- **業界横断の論点**: 「正規 SaaS の送信基盤を中継させて経路認証を通す」手口は、Calendly に限らずスケジュール・予約・通知系 SaaS 全般に一般化しうる。特定ツールの問題ではなく、メール認証が authorship を保証しないという組織横断の運用課題として捉えるべきである

「メッセージの作成主体の来歴を、開封・実行の前にどう独立検証するか」は、本事案を契機にメールセキュリティ／業務コミュニケーション設計の論点として議論が進む見込み。

---

## 7. Lemma による分析

本事案で露呈した検出と証明の落差（メッセージの経路は認証されたが、作成主体の来歴が実行の前に独立検証されていない）に対し、Lemma は以下の設計を提示する。

- **作成主体の来歴証明**: 正規の予約システムやゲスト連絡に Seal による authorship 証明を付し、受信側が「この連絡は、主張どおりの主体が、その権限で作成したか」を機械的に検証できるようにする
- **経路 ≠ 作成主体**: 「正規の SaaS 送信基盤を経由した」という経路の事実と、「主張どおりの主体が書いた」という作成主体の事実を切り離し、後者を事前証明の対象とする。Calendly 等を中継して SPF/DKIM/DMARC を通過させても、期待される authorship 証明を欠けば"正規に見えるが証明されていない"メッセージとして浮かび上がる
- **不在の可視化**: 全フィッシングの遮断を約束するのではなく、正規コミュニケーションに検証可能な来歴を付与し、その不在を異常として可視化する。信頼の単位を「経路」から「作成主体」へ移すことで、認証ランダリングが成立しなくなる
- **選択的開示**: 送信者の内部情報や全権限を開示せずに、「この連絡は主張どおりの主体・権限で作成された」ことだけを最小開示で証明する

検出（メール認証・事後の悪性判定）はなりすまし経路の発見に、事前証明（作成主体の来歴の実行前の独立検証）は業務コミュニケーションの信頼確立に、それぞれ相補的に働く。落差は「メール認証を強化する」ことではなく「信頼の単位を経路から作成主体へ移す」ことで埋まる。設計と適用範囲は [Pillar 01 — 来歴証明](https://lemma.frame00.com/ja/pillars/verifiable-origin/) および [Seal](https://lemma.frame00.com/ja/seal/) を参照のこと。

---

## 8. Sources

- **Microsoft Security Blog（研究・一次）**: "Photo ZIP campaign targeting hospitality industry delivers Node.js implant for persistent access"（Microsoft Defender Security Research Team・Parth Jomadkar、2026-06-25）— <https://www.microsoft.com/en-us/security/blog/2026/06/25/photo-zip-campaign-targeting-hospitality-industry-delivers-node-js-implant-persistent-access/>
- **The Hacker News**: "Microsoft Warns of Photo ZIP Phishing Campaign Targeting Hotels with Node.js Implant" — <https://thehackernews.com/2026/06/microsoft-warns-of-photo-zip-phishing.html>
- **SC Media**: "Photo-themed phishing campaign targets European and Asian hotels with Node.js implant" — <https://www.scworld.com/brief/photo-themed-phishing-campaign-targets-european-and-asian-hotels-with-node-js-implant>
- **セキュリティ対策Lab**: 「Microsoftが『Photo ZIPキャンペーン』を公開」（2026-06-30／日本語解説）— <https://rocket-boys.co.jp/security-measures-lab/hotel-frontdesk-phishing-node-backdoor/>

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
