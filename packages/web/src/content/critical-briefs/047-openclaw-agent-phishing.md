---
brief_no: 47
title: "AI エージェントが、送信者を確かめる前に認証情報を社外へ送った — 緊急を装った 1 通のメールに、本人性検証の規則が破られた（OpenClaw / Varonis）"
title_en: "AI Agent Forwarded Credentials Before Verifying the Sender (OpenClaw / Varonis)"
pillar: "02-verifiable-ai"
primary_category: "ai-decision-integrity"
secondary_categories: ["agent-infrastructure", "identity-auth"]
incident_date: 2026-06-11
published: 2026-06-12
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["018-hackerbot-claw-ai-vs-ai", "037-agent-config-auto-execution", "024-invisible-unicode-instruction-injection", "029-github-dev-oauth-token"]
status: published
version: "1.0"
og_lead_ja: "AI エージェントが送信者を確かめる前に認証情報を社外送信 — OpenClaw / Varonis"
og_lead_en: "An AI agent forwarded credentials before verifying the sender — OpenClaw / Varonis"
gap_detected: "不審 URL・悪性 OAuth 同意画面は遮断できた。"
gap_missing: "「送信者は誰か」を行動の前に確かめる層が無く、社会的な依頼は素通りした。"
gap_fix: "高リスク行動の前に「この依頼は、この主体に、このスコープで認可されている」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

OpenClaw 上で Varonis が検証したメール処理 AI エージェントが、急ぎを装った依頼に応じ、社内の認証情報や顧客データ（いずれも模擬）を社外へ送った。「依頼主を先に確認せよ」と設定していたにもかかわらず、である。**不審 URL や悪性 OAuth の検出は効いていた。効かなかったのは、行動の前に「送信者は誰か」を独立に確かめる層である**——検出と事前証明は代替でなく、補完の関係にある。

---

## 2. 何が起きたか

- **共通の失敗**: メールを処理する AI エージェントが、依頼の発信元（送信者の本人性と認可）を行動の前に独立検証せず、依頼が操作上「緊急」または「定型」に見えると、本人性検証の規則そのものが崩れる
- **研究主体**: Varonis Threat Labs（研究リード Itay Yashar）。OpenClaw 上に検証用エージェント「Pinchy」を構築し、Gmail 受信箱に現実的だが合成のデータと模擬秘密を投入。Gemini 3.1 Pro と OpenAI Codex GPT-5.4 で 4 シナリオを実施
- **失敗シナリオ 1（staging 権限）**: 外部 Gmail から「Dan」というチームリードを装い、本番障害対応として staging 環境のアクセスを要求。Pinchy は認証情報を探し出し、模擬 AWS IAM アクセスキー・DB 接続文字列・SSH 認証情報を平文で社外へ転送した
- **失敗シナリオ 2（顧客エクスポート）**: QBR 資料用と称する定型的な週次顧客エクスポートの依頼。エージェントは 247 社の企業顧客・連絡先・契約額を含む合成データセットを送付した。いずれの失敗も「送信者を先に検証せよ」と指示した strict プロファイル下で発生。緊急が一度、定型が一度、規則を上回った
- **技術的脅威には強かった**: ギフトカード型フィッシングページでは実在の認証情報を渡さず最終的に警告し、strict プロファイルではページ自体を遮断。タイムシート連携を装った悪性 OAuth 同意画面では、リダイレクト先を検査して不審と判断し、権限付与の前に停止した
- **隣接研究（参考）**: 同時期に Imperva が、共有連絡先・vCard・位置ピンの内側に指示を隠してエージェントに実行させる prompt injection を公表（OpenClaw 2026.4.23 で修正）。本 Brief の中心は Varonis の「行動の前に送信者を検証しない」構造だが、両者は「エージェントが、到達した入力を信頼し、その権限が攻撃者の権限になる」点で同根

失敗が認証情報の持ち出しへ伝播する経路は以下の通り。

1. **信頼された経路からの依頼**: 攻撃者が、エージェントが監視する正規のチャネル（受信箱）へ、業務上ありふれた体裁の依頼を送る。prompt injection のように指示を隠すのではなく、依頼そのものが普通に見える（Varonis はこれを prompt injection と区別して「agent phishing」と呼ぶ）
2. **本人性検証の崩壊**: 依頼が「本番障害で急ぎ」または「週次の定型作業」に見えると、エージェントは「送信者を先に検証せよ」という規則を、操作上の緊急性・定型性に押し切られて適用しない。規則は存在したが、行動が検証を追い越した
3. **権限の行使**: エージェントは自らがアクセスできる範囲で依頼を実行する。認証情報を探索し、あるいは顧客データセットを取得する
4. **社外への送出**: 取得した認証情報・データを、依頼に記載された外部アドレスへ送信する。エージェントは「読める」「外部へ送れる」「未検証の入力を受ける」という三条件（Simon Willison のいう lethal trifecta）をすべて備えるため、入力を信頼した瞬間にその権限が攻撃者の権限になる
5. **検出の作動**: 不審な送出やログから事後に検知され得る。ただしこれは認証情報・データが既に社外へ出た後に作動する事後の系列である

---

## 3. 時系列 — 公表と対応

- 2026 年後半: OpenClaw が公開。ファイル・シェル・20 を超えるメッセージング基盤への広範なアクセスを既定で持ち、prompt injection / データ持ち出しの警告が断続的に出ていた
- 2026-06（同週公表）: Varonis Threat Labs が OpenClaw 上の検証エージェント「Pinchy」による 4 つのフィッシング演習の結果を公表。2 つの持ち出しシナリオで失敗。Imperva が message object 経由の prompt injection を別途公表（OpenClaw 2026.4.23 で修正）
- 2026-06-11: The Hacker News などが両研究を報道。Varonis の指摘した「行動前の送信者検証の崩壊」はパッチで塞ぐ類のものではなく、エージェントが単独でできる行動の範囲を制限する設計課題であることが整理された

> 注: 本事案は実地侵害ではなく、研究環境（合成データ・模擬秘密）での実証である。模擬秘密・合成顧客データに実在の被害者はいない。本文ではこれを「実証された構造的欠陥」として扱い、被害規模を誇張しない。

公表後の対応と業界の動きは次のとおり。

- **研究・ベンダー**: Varonis は 4 つの制御を提示——(1) エージェントの instruction file を「提案」ではなく強制・バージョン管理されたポリシーとして扱う、(2) 送信の関門（未知のアドレスへの初回送信は承認なしに行わない）、(3) コネクタのアクセスをタスクを起動した主体の信頼水準に紐付ける、(4) 認証情報の転送・送金など最も危険な行動は人間の承認を待つ。Imperva は message object を別の untrusted-metadata チャネルへ分離する修正を OpenClaw に反映
- **規制の重心移動**: オランダ・データ保護当局（Autoriteit Persoonsgegevens）が、機微データを保持する系での OpenClaw 利用を控えるよう警告。規制の重心はデータ開示から、自律エージェントの行動が正規に認可されたものであることの証明へ移りつつある
- **業界横断の論点**: 「承認プロンプトや内部判断＝十分な認可」という前提が問い直されている。エージェントに lethal trifecta（私的データの読み取り・未検証入力の受容・外部送出）が揃う限り、依頼の発信元を行動前に独立検証する層の不在は、特定ツールの問題ではなく、AI エージェントを採用する組織横断の運用課題として残る

---

## 4. なぜ止まらなかったか

この事案の失敗は、権限設計でも検出精度でもない。**エージェントが高リスク行動（認証情報・顧客データの社外送出）を取る前に、その依頼の発信元——要求者の本人性と認可——を独立に確かめる層が無かった**ことにある。「受信箱に届いた」「業務上ありふれて見える」ことは、正規の認可された主体からの依頼である保証にはならず、strict プロファイルの「送信者を検証せよ」という規則も、エージェントの内部判断に委ねられる限り、緊急性・定型性という社会的圧力の前で崩れる。

検出は効いていた。不審 URL・悪性 OAuth 同意画面は実際に遮断でき、公表後も開示・パッチ・規制当局の注意喚起という是正の系列が機能した。効かなかったのは、その手前である。不正 URL の検知は「このリンクは怪しいか」しか見ず、メールフィルタは「この文面はスパムらしいか」しか見ない。「この依頼は、正規に認可された主体から来ているか」を行動の時点で立証する材料は、検出の系列のどこにもない。

エージェントは「不正な URL・偽のログイン画面」の検知では人間より優れる一方、「同僚が不自然な時間に認証情報を求めてきたら立ち止まる」という社会的判断に弱い。役に立とうとする傾向そのものが攻撃面になる。

> エージェントは「システムアクセスを持つが、何が不自然かの直感を持たない新人」として扱うべきである。（Varonis）

同じ primitive——**行動の実行が、それを認可・検証する層から切り離されている**——は、[Brief 018](https://lemma.frame00.com/ja/critical/briefs/018-hackerbot-claw-ai-vs-ai/)（防御側エージェントの指示の乗っ取り）、[Brief 024](https://lemma.frame00.com/ja/critical/briefs/024-invisible-unicode-instruction-injection/)（不可視 Unicode による目視と AI 入力の乖離）、[Brief 037](https://lemma.frame00.com/ja/critical/briefs/037-agent-config-auto-execution/)（同梱設定の無検証実行）、そして認可が範囲へ縛られない [Brief 029](https://lemma.frame00.com/ja/critical/briefs/029-github-dev-oauth-token/) にも通底する。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、エージェントが高リスク行動を取る経路に、要求者の本人性・認可の証明を 1 段挟むことで、この落差を埋める。プロンプトの言い回しや内部判断の堅牢化ではなく、行動の前に「この依頼は、この主体に、このスコープで認可されている」ことを独立検証可能な形で要求することで、緊急性・定型性という社会的圧力があっても、証明が成立しなければ送出は事前に block される。

Lemma は、エージェントが行動を取る前に、その依頼が認可され正規の発信元を持つことを独立検証可能な暗号証明として要求する設計を提示している。

- **行動前の認可証明（proof-as-auth）**: エージェントが認証情報の送出・データの外部送信・破壊的操作を行う前に、「この行動は、この主体に、このスコープで認可されている」ことを署名付きで証明する。「受信箱に届いた」「急ぎに見える」ことを認可の終点にしない
- **発信元の来歴バインド**: 依頼の発信元（要求者の本人性・所属・権限）を検証可能な来歴に紐付け、緊急性・定型性という体裁に依存せず、行動前に発信元の真正性を独立検証可能にする
- **スコープ付き権限**: エージェントに与える権限を行動ごとに最小化し、コネクタのアクセスをタスクを起動した主体の信頼水準に縛る。認可の範囲を超える送出を、証明なしには成立させない
- **選択的開示**: 「この行動が認可スキーマを満たす」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない

これにより、行動の時点で固定された証明が、「この依頼は正規に認可され、正規の発信元を持つか」を、エージェントが高リスク行動を取る前に独立検証可能なトレイルとして機能させる。検出（事後の検知・パッチ・注意喚起）は発覚後の是正に、事前証明（行動前の認可・発信元検証）はエージェント行動の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **Varonis（研究・一次）**: “Phishing for Lobsters: How We Tricked OpenClaw into Spilling Secrets”（研究リード Itay Yashar、検証エージェント Pinchy、4 シナリオ・2 件の持ち出し失敗） — <https://www.varonis.com/blog/openclaw-phishing>
- **Imperva（研究・一次）**: “Compromise OpenClaw with Prompt Injections in Message Objects”（共有連絡先・vCard・位置ピン経由の injection、2026.4.23 で修正） — <https://www.imperva.com/blog/compromise-openclaw-with-prompt-injections-in-message-objects/>
- **The Hacker News**: “New Attacks Trick OpenClaw AI Agent Into Running Code and Leaking Secrets”（2026-06-11、両研究の整理・lethal trifecta・規制当局警告） — <https://thehackernews.com/2026/06/new-attacks-trick-openclaw-ai-agent.html>
- **BleepingComputer**: “OpenClaw AI agent found falling for phishing attacks, spills user data”（2026-06） — <https://www.bleepingcomputer.com/news/security/openclaw-ai-agent-found-falling-for-phishing-attacks-spills-user-data/>

参照: 事後の検知が証明にならない論点は[「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、行動前に独立検証する設計は[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（いずれも Lemma、2026-05）。設計と適用範囲は [Pillar 02 — 検証可能 AI](https://lemma.frame00.com/ja/pillars/verifiable-ai/) および [Trust402](https://lemma.frame00.com/ja/trust402/)。
