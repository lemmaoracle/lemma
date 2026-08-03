---
brief_no: 83
title: "Change Healthcare：MFA のない単一 Citrix アカウントへの侵入が、米国医療請求処理の 3 分の 1 を数週間停止させた — 「パスワードを知っている」ことと「正規の権限者である」ことを切り離す層がなく、盗まれた認証情報が正規アクセスと区別できなかった（UnitedHealth Group 議会証言）"
title_en: "Change Healthcare: a breach of a single Citrix account without MFA halted a third of US medical-claims processing for weeks — with no layer separating \"knows the password\" from \"is the legitimate authorized party,\" stolen credentials were indistinguishable from legitimate access (UnitedHealth Group congressional testimony)"
pillar: "04-regulatory-attribute"
primary_category: "identity-auth"
secondary_categories: ["attribute-proof-bypass"]
incident_date: 2024-02-21
published: 2026-06-26
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "B-regulatory"]
related_briefs: ["046-servicenow-unauthenticated-api", "057-deepseek-clickhouse-exposed-db", "056-mchire-paradox-recruiting-auth"]
status: published
version: "1.0"
og_lead_ja: "Change Healthcare：MFA なしの単一 Citrix アカウントへの侵入が米国医療請求の 3 分の 1 を数週間停止"
og_lead_en: "Change Healthcare: a breach of one Citrix account without MFA halted a third of US medical claims for weeks"
gap_detected: "ランサムウェア展開段階で攻撃を検知し主要システムを停止、議会証言で侵入経路を特定・開示し、医療機関支援と復旧にも動けた。"
gap_missing: "MFA がないため Citrix への最初の不正ログインは正規アクセスと外形上区別できず、「このログインが正規の権限者によるものか」をログイン時点で独立に証明する層がなかった。"
gap_fix: "アクセス要求の時点で要求者の権限属性を Lemma で独立検証し、認証情報の一致だけをゲートとする設計を置き換えて事前に防ぐ。"
---

## 1. TL;DR

2024 年 2 月、医療データ処理会社 Change Healthcare（UnitedHealth Group 傘下）が AlphV/BlackCat ランサムウェアグループに侵害された。侵入経路は、多要素認証（MFA）が設定されていなかった Citrix リモートアクセスポータルの単一アカウントへの、盗まれた認証情報による不正ログインだった。Change Healthcare は米国の医療保険請求処理の約 3 分の 1（40〜50%）を担っており、システム停止は全国の薬局・病院・医師の処方・請求・保険適用確認業務を数週間にわたり麻痺させた。最終的に約 1 億人以上のアメリカ人の医療記録が影響を受けたとされ、米国史上最大規模の医療データ侵害となった。「認証情報を知っている」ことが「その人物が正規の権限者である」ことの証明として機能した設計が、ランサムウェアの侵入を正規のリモートアクセスと区別不可能にした。

---

## 2. 何が起きたか

- **対象**: Change Healthcare（UnitedHealth Group 傘下。米国最大規模の医療請求処理・医療情報交換ネットワーク）
- **攻撃者**: AlphV/BlackCat ランサムウェアグループ（後に RansomHub が別途恐喝に参加）
- **侵入経路**: MFA が設定されていなかった Citrix リモートデスクトップ / VPN ゲートウェイポータルへの、盗まれた認証情報（ID・パスワード）による不正ログイン
- **業務影響**: Change Healthcare のシステム停止により、全米の薬局（チェーン・独立系）での処方薬調剤確認、病院の保険請求、医師の eligibility 確認が数週間にわたり不能または重大な遅延。一部病院では現金払い要求・処方薬の在庫確認不能が発生
- **被害規模（財務）**: UnitedHealth Group が支払った身代金は約 2,200 万ドル（後に RansomHub にも別途支払いがあったとされる）。業務停止・復旧・医療機関支援を含む総損失は数十億ドル規模と報じられる
- **データ被害**: 約 1 億人以上（後の推計では最大 1 億 9,000 万人）の米国人の医療記録・個人情報・保険情報が影響を受けた可能性。米国史上最大の医療データ侵害
- **根本原因（議会証言）**: UnitedHealth Group CEO Andrew Witty が米議会証言（2024 年 5 月）で「単一の Citrix アカウントに MFA が設定されていなかった」ことを侵入経路として明言
- **構造的要点**: MFA なしの認証情報認証は「このパスワードを知っている誰か」にアクセスを与える。「そのパスワードを知っているのが正規の権限者かどうか」は確かめない

事象は次の連鎖で成立している。

1. **認証情報の取得**: Change Healthcare 従業員の Citrix アカウント認証情報（ID・パスワード）が何らかの手段（フィッシング・インフォスティーラー・ダークウェブ購入等）で入手された（具体的経路は公表されていない）
2. **Citrix ポータルへのログイン**: MFA が設定されていないため、ID・パスワードの入力のみでリモートアクセスが完了する。システムは「正規ユーザーのログイン」と区別できない
3. **ネットワーク内横展開**: 正規のリモートアクセス権限を持つユーザーとして内部ネットワークに侵入。側方移動により権限昇格・重要システムへのアクセスを拡大
4. **ランサムウェアの展開**: 主要システムにランサムウェア（AlphV/BlackCat）を展開・実行。データの暗号化と窃取を実行
5. **身代金要求と二重恐喝**: システム復旧のための復号鍵と、窃取データの非公開を条件とした身代金を要求。約 2,200 万ドルの支払い後も、別グループ（RansomHub）がデータを保持し二次恐喝

---

## 3. 時系列 — 公表と対応

- **2024-02-12（推定）**: 攻撃者が MFA 未設定の Citrix アカウントに盗まれた認証情報でログイン。ネットワーク内での横展開（lateral movement）を開始
- **2024-02-21**: Change Healthcare がランサムウェア攻撃を検知。主要システムをシャットダウン。医療請求・処方処理が全国規模で停止
- **2024-02-21〜03 月**: 全米の薬局・病院・医師がシステム停止の影響を受ける。HHS（米保健福祉省）が緊急対応を発表。AHA（米国病院協会）が壊滅的影響として議会に訴え
- **2024-03 月（推定）**: AlphV/BlackCat が約 2,200 万ドルの身代金を受領し、その後グループを解散。データを保持した関連グループが RansomHub として再登場し Change Healthcare を別途恐喝
- **2024-05（議会証言）**: UnitedHealth Group CEO Andrew Witty が上院・下院委員会で証言。「MFA 未設定の Citrix アカウントが侵入経路だった」ことを公式に認める
- **2024-10 以降**: HHS が影響者数（当初 1 億人超）を公表。最終推計として最大 1 億 9,000 万人超が影響を受けた可能性が報告される

> 注: 本 Brief は一次情報として UnitedHealth Group の議会証言・HHS の公表に基づく。侵入日（2024-02-12）は推定であり、影響者数は公表時点により更新されているため最新情報を参照。

公表後の対応と業界の動きは次のとおり。

- **UnitedHealth Group / Change Healthcare**: 即時システムシャットダウン、医療機関向け緊急資金援助プログラムの設置（数十億ドル）、復旧作業と並行して侵害規模の調査・開示
- **HHS（米保健福祉省）**: 緊急ガイダンス発行。HIPAA 規則の適用に関する臨時の柔軟化措置。最終的な影響者数（1 億人超）の公表
- **AHA（米国病院協会）**: 「壊滅的かつ前例のない」影響として議会に緊急対策を訴え
- **議会**: 2024 年 5 月、上院・下院の両委員会で UnitedHealth Group CEO Andrew Witty が証言。MFA 未設定が侵入経路だったことを明言
- **AlphV/BlackCat**: 約 2,200 万ドルを受領後に事実上の解散。内部告発者によれば身代金はグループリーダーが独占し、関係者がデータを持って RansomHub として再編
- **業界への論点**: 医療 IT における MFA の事実上の義務化議論が加速。HHS が HIPAA セキュリティルールの改訂（MFA 要件明記）に向けた検討を開始。医療インフラのサードパーティ・ベンダーリスク管理への注目が高まる

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「認証が『このパスワードを知っているか』という知識の確認のみに依存し、『このパスワードを入力しているのが正規の権限者かどうか』を独立に証明する層を持っていなかった」</strong>である。

パスワード認証は「秘密の共有」モデルに基づく。パスワードが漏洩した瞬間に、そのパスワードを知っている人間が「正規ユーザー」と「攻撃者」の 2 者に増え、システムはどちらのログインも区別できない。MFA はこの問題に対して「パスワード以外の要素（所持・生体）も確認する」ことで追加の抵抗を設ける設計だが、本事案では医療インフラの外部アクセスゲートウェイにそれが設定されていなかった。

本事案が既存 Brief との比較で示す固有論点は**規模**と**インフラ影響**にある。[Brief No.046](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（ServiceNow 設定ミスで認証が外れた）・No.057（DeepSeek ClickHouse 未認証公開）・No.056（McHire Paradox 採用 AI 認証欠如）はいずれも「認証ゲートが機能しなかった」事案だが、本事案は「正規のゲートに認証情報でログインされた」点が異なる。攻撃はシステムの欠陥を突いたのではなく、**認証の前提（「このパスワードを入力しているのは権限者だ」）を崩した**。

HIPAA の文脈では、PHI（保護対象医療情報）へのアクセスは「正規の業務上の必要性を持つ権限者」に限定されるべきだが、PHI アクセスの権限属性を独立検証する層が不在であり、侵害者が正規アクセスと区別できない状態でその制約は機能しなかった。

検出は本事案でも機能した。Change Healthcare はランサムウェアの展開段階で攻撃を検知し、主要システムをシャットダウンした。事後のフォレンジクスで侵入経路が特定され、議会証言でも明示され、業界横断での医療機関支援と復旧作業も進んだ。インシデント検知・封じ込め・フォレンジクスの役割を本 Brief が否定するものではない。

一方で、検出は「正規のゲートに認証情報でログインできてしまう」という構造そのものを変えない。Citrix ポータルへの最初の不正ログインは、正規のリモートアクセスと外形上区別できなかった——MFA がないため、「正規ユーザーのログイン」と「盗まれた認証情報でのログイン」は同じ見た目を持つ。検出が発火した時点では、攻撃者はすでに約 9 日間ネットワーク内を横展開していた（2 月 12 日侵入、2 月 21 日検知）。「このログインが正規の権限者によるものか」を、ログイン時点で独立に証明する層がなかった以上、検知は事後の封じ込めにしかならない。

---

## 5. 証明があれば、何が変わるか

事前証明（attribute attestation）は、「パスワードを知っている」という知識の証明を、「この人物が正規の権限者である」ことの独立した属性証明と組み合わせる設計を採る。アクセス要求の時点で、要求者のアイデンティティ来歴と権限属性を事前証明として検証し、認証情報の一致だけをゲートとする設計を置き換える。これにより、認証情報が漏洩しても、要求者が正規の権限属性を証明できなければアクセスは成立しない。検出（ランサムウェア検知・横展開監視等）と事前証明（attribute proof）は代替ではなく **補完** の関係にある。

本事案で露呈した検出と証明の落差（認証情報の一致が権限者の証明として機能せず、侵害ログインが正規アクセスと区別できなかった）に対して、Lemma は以下を提示する。

- **アクセス要求の属性証明**: ログイン時に「このアクセス要求者が正規の権限属性（業務上の必要性・雇用関係・権限委譲の来歴）を持つか」を独立検証可能な暗号証明として事前に確認する
- **認証情報の知識と権限の分離**: 「パスワードを知っている」という証明と「正規の権限者である」という証明を別の命題として扱い、後者を独立に検証する層を設ける
- **PHI アクセスの来歴連鎖**: 医療記録へのアクセスが「正規の業務上権限を持つ者によるアクセスか」を、アクセス要求の時点で証明可能な記録として残す。HIPAA の「必要最小限アクセス（Minimum Necessary）」の原則を、事後申告でなく事前証明として実装する
- **選択的開示**: アクセス者の完全な個人情報を開示せずに、「この者はこのシステムへのアクセス権限属性を持つ」ことだけを証明する

検出（インシデント検知・封じ込め）と事前証明（access の権限属性の独立検証）は代替ではなく補完であり、事後の検知を否定せずに、認証情報の一致だけに依存しないゲートを設計の前段に置く。設計と適用範囲は [Pillar 04 — 規制属性証明](https://lemma.frame00.com/ja/pillars/#attribute) および [Seal](https://lemma.frame00.com/ja/seal/) を参照のこと。

---

## 6. Sources

- **UnitedHealth Group 議会証言（一次）**: CEO Andrew Witty による米上院財政委員会・下院エネルギー商業委員会での証言（2024-05-01、05-08 前後）。侵入経路として MFA 未設定の Citrix アカウントを明言 — https://www.finance.senate.gov/hearings/hacking-americas-health-care-assessing-the-change-healthcare-cyber-attack-and-whats-next （Witty 証言 PDF: https://www.finance.senate.gov/imo/media/doc/0501_witty_testimony.pdf ）
- **HHS（米保健福祉省）**: 侵害通知・影響者数の公表（2024-10 以降）。Change Healthcare Breach Substitute Notice
- **AHA（米国病院協会）**: "Change Healthcare Cyberattack"（2024-02〜）— https://www.aha.org/change-healthcare-cyberattack
- **Wired**: "The Change Healthcare Hack: How It Happened and What It Means"（2024 年）
- **CISA / FBI 共同勧告**: AlphV/BlackCat ランサムウェアグループに関する技術勧告（2024-02-27）— https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-353a

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
