---
brief_no: 143
title: "非公表の企業：攻撃者が指揮する複数の AI エージェントに、ネットワークを侵害された(Unit 42 の調査)"
title_en: "Undisclosed enterprise: A network breached by multiple AI agents directed by a human attacker (Unit 42 investigation)"
pillar: 03-agent-authority
primary_category: agent-runaway
secondary_categories: [identity-auth, agent-infrastructure]
incident_date: 2026-09-02
published: 2026-09-08
authors: ["Lemma Critical Team"]
related_pack: [A-incident-response]
related_briefs: ["009-gtg1002-ai-orchestrated-espionage", "128-coding-agent-harness-authority-gap", "130-atlassian-rovo-instruction-provenance"]
status: published
layout: "report"
sections: "proof"
gate: "agent-operation"
og_kicker_ja: "インシデント調査 · AI エージェントの攻撃"
og_kicker_en: "INCIDENT RESPONSE · AI-AGENT INTRUSION"
og_headline_ja: "攻撃者が AI に任せ、\n10 時間未満で侵害した。\n<accent>止まったのは 1 か所</accent>"
og_headline_en: "AI agents breached\na network in <10 hours.\n<accent>One step was stopped.</accent>"
key_figures:
  - value: "10 時間"
    unit: "未満"
    label: "侵入の完了までの時間。人手なら約 2 週間かかる規模と Unit 42 は評価した"
    tone: "alert"
  - value: "50"
    unit: "超"
    label: "使われた MITRE ATT&CK の手法の数（Unit 42）"
  - value: "1"
    unit: "か所"
    label: "その場で止まった工程。Terraform の変更を、ブランチ保護が止めた（Unit 42）"
glossary:
  - term: "ブランチ保護"
    desc: "コードの保管庫で、決められた承認がない変更を、主要な枝に入れさせない設定。"
  - term: "Terraform"
    desc: "クラウドの構成をコードで書き、そのコードから基盤を作る道具。構成のコードを書き換えると、基盤も変わる。"
  - term: "シークレット管理"
    desc: "パスワード・トークン・鍵などをまとめて保管し、システムに渡す仕組み。"
insight:
  slug: "valid-key-not-authorization"
  label: "鍵が有効なことと、行動の許可は別"
  quote: "盗まれた鍵やトークンでも形式上有効なら、行動ごとに許可を照合する仕組みが無い工程は、そのまま通る。"
version: "1.0"
og_lead_ja: "Unit 42、AIエージェント主導の侵入が10時間未満で完了と報告"
og_lead_en: "Unit 42: AI-agent-run intrusion completed in under 10 hours"
industries: ["ai"]
operations: ["account-admin"]
controls:
  - slug: "verify-entry"
    item: "トークンや鍵が有効かだけでなく、その主体がその行動をしてよいかを行動ごとに確認する"
  - slug: "bound-automation"
    item: "エージェントが届く範囲を、工程ごとに許可した範囲と上限に収める"
attack_method: "ai-misuse"
impact: "侵入の完了まで 10 時間未満"
takeaway: "5 段階のうち、その場で止まったのは、変更の前に承認を求めるブランチ保護が働いた 1 か所だけだった。"
self_check: "盗まれた鍵やトークンが有効でも、その主体がその操作をしてよいかを、操作の前に照合する工程があるか。"
countries: ["global"]
---

## 1. 要点

人間の攻撃者が、フロンティア AI モデルと攻撃用のエージェント型フレームワークを指揮し、企業のネットワークへの侵入を 10 時間未満で終えた。盗んだトークン・認証情報・クラウドの鍵を次々に使い、シークレット管理への侵入から、AI 基盤の乗っ取りまで進んだ。その場で止まったのは、Terraform の構成へのバックドアの設置を止めたブランチ保護だけだった（Unit 42）。<strong>盗まれた鍵やトークンでも形式上有効なら、行動ごとに許可を照合する仕組みが無い工程は、そのまま通る。</strong>

## 2. 通った操作

- **通った操作**: 盗んだトークンでのシークレット管理への侵入と、管理者の認証情報の取得、root 権限の奪取。社内のコード連携アプリの乗っ取りと、クラウドのアクセス鍵の持ち出し。盗んだクラウドの鍵での、被害組織の AI エンドポイントの転用（Unit 42）。
- **止まった操作**: Terraform の構成へのバックドアの設置。強制されたブランチ保護で止まった（Unit 42）。
- **受け付けた側に届くもの**: 一般に、シークレット管理やクラウドには、有効なトークンや鍵を持つ要求として届く。その鍵が盗まれたものか、その主体がその行動をしてよいかは、鍵の有効性からは分からない。
- **公表されていないこと**: 被害組織の名前と業種、攻撃が起きた日、攻撃者の身元、身代金の要求の中身。公開の Web サービスを、どう突破したか。

## 3. 実行前の照合

経路を問わず区別できる条件は、鍵やトークンが有効かとは別に、その主体がその行動をしてよいかを、行動の前に照合することである。

- **誰が承認を出すか**: その操作を許す権限を持つ人。シークレット管理・クラウドの構成・AI 基盤への重要な操作は、鍵を持っていることとは別に、承認を出す。
- **どこで照合するか**: シークレット管理・クラウド・構成のコード・AI 基盤が、操作を受け付ける手前。今回のブランチ保護と同じ位置に、ほかの工程でも置く。
- **何が残るか**: どの操作を、どの主体が、誰の承認で行ったかの記録。後から、攻撃の連鎖を第三者に示せる。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝操作を受け付ける前に、その主体がその操作をしてよいかを、鍵の有効性とは別に照合し、記録に残すこと。検知＝攻撃の後に、痕跡から連鎖を見つけること。攻撃が起きた日は公表されていない。日付は Unit 42 が公表・訂正した日。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 1 か所で働いた</b>Terraform の変更は、変更の前の承認で止まった。ほかの工程の照合は、公表からは分からない</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>盗んだ鍵で、5 段階のうち 4 段階が通った<br>止まったのは Terraform の変更だけ</span></div>
<div class="rx-zone det"><b>検知 · 侵入の後に働いた</b>AI 利用の痕跡から、攻撃の連鎖を再構成した</div>
<div class="rx-g g1"><div class="t">非公表</div><b>侵入（10 時間未満）</b></div>
<div class="rx-g g2"><div class="t">09-02</div><b>Unit 42 が調査を公表</b></div>
<div class="rx-g g3"><div class="t">09-03</div><b>ランサムウェアではなく侵入と訂正</b></div>
<div class="rx-g g4"><div class="t">09-04</div><b>文言の訂正</b></div>
</div>
</figure>

止まった 1 か所は、鍵が有効かではなく、変更の前の承認を求める仕組みだった。AI エージェントが攻撃の 80〜90% を自律実行した [GTG-1002](https://lemma.frame00.com/ja/critical/briefs/009-gtg1002-ai-orchestrated-espionage/) や、既定の構成のコーディングエージェントが、権限のない 1 件の指示から CI の実行に届いた [コーディングエージェントの権限](https://lemma.frame00.com/ja/critical/briefs/128-coding-agent-harness-authority-gap/) とも、同じ型である。

## 4. Lemma でできること

**Lemma は、03 の照合を、エージェントが届く工程の操作の手前に組み込む。** 侵入を見つけるのではなく、鍵が有効かとは別に、その主体がその操作をしてよいかを、操作の前に照合する。

### 注意したい業界・業務

- **業界 · AI**: 自社の AI エンドポイントや、モデルの呼び出しを持つ組織。盗まれたクラウドの鍵で、攻撃の基盤に転用されうる。
- **業務 · アカウント・権限の管理**: シークレット管理・クラウドの管理者権限・構成のコードの変更。今回、鍵の有効性だけで通った工程。

### いまの対策と Lemma の違い

今回の経路は、1 列目（盗んだ鍵・トークンでの、シークレット管理・クラウド・AI 基盤への操作）である。2 列目（Terraform の構成の変更）は、その場で止まった工程である。

| 対策 | 盗んだ鍵での、シークレット管理・クラウド・AI 基盤への操作 | Terraform の構成の変更 |
| --- | --- | --- |
| トークン・鍵の有効性の確認 | 効かない | 効かない |
| ブランチ保護（変更の前の承認） | 関係しない | 効く |
| AI 利用の痕跡の解析（事後） | 効かない | 関係しない |
| **Lemma（実行の前の照合）** | 効く | 効く |

トークン・鍵の有効性の確認は、盗まれた鍵でも形式上有効なら通る。シークレット管理への侵入から AI 基盤の乗っ取りまで、この一点で進んだ（Unit 42）。ブランチ保護は、鍵ではなく変更の前の承認を求めたので、Terraform へのバックドアの設置を止めたが、コードの保管庫の外の工程には及ばない。痕跡の解析は、構造化 Markdown やスクリプトから連鎖を再構成できたが、攻撃の後である。Lemma は、ブランチ保護と同じ、行動の前の承認の照合を、シークレット管理・クラウド・AI 基盤の操作にも置く。

注：Lemma の照合が働くのは、シークレット管理・クラウド・AI 基盤が操作を受け付ける手前に照合を組み込み、承認がエージェントや盗まれうる鍵とは別に管理されている場合に限る。承認を出す人の認証情報まで盗まれていれば、この照合を通りうる。公開の Web サービスからの最初の侵入や、コードの保管庫に書き込まれたトークン（侵入の前の管理）は、この照合の対象ではない。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

AI エージェントが届きうる工程について、組織で確認する 3 項目

- 鍵やトークンが有効なことと、その主体がその操作をしてよいことを、分けて照合しているか。
- ブランチ保護のような、操作の前の承認を、シークレット管理やクラウドの管理操作にも求めているか。
- 自社の AI エンドポイントの呼び出しを、API キーの有効性だけでなく、呼び出し元が正規の内部のシステムかで許しているか。

## 5. 事実と時系列

- **公表**: Unit 42（Palo Alto Networks）は 2026 年 9 月 2 日、あるインシデント対応を分析したブログを公開した。攻撃者は交渉の中で、フロンティア AI モデルと攻撃用のエージェント型 AI フレームワークを使ったと、Unit 42 に説明した。
- **規模**: エージェントは、それぞれ防御の異なる層を担当しながら、共通の目標に向かって動いた。複数のレッドチームの協調作業に匹敵し、人手なら約 2 週間かかる規模（50 を超える MITRE ATT&CK の手法）だったと、Unit 42 は評価している。
- **手口**: 新しいゼロデイや卓越した技術は要らず、AI による作業の効率化が際立っていたと、Unit 42 は記している。エージェントは、監視・評価・行動・再計画をリアルタイムで繰り返した。
- **残したもの**: 攻撃者は、エージェントに、被害組織のセキュリティの 80 ページの技術監査レポート（悪用した数十件の問題点）を作らせ、被害組織に残した。
- **AI 利用の痕跡**: 複数のフロンティア AI エージェントへの並行の LLM 呼び出し、エージェントのセッションの間で情報を受け渡す構造化 Markdown、UI の要素から高い確度で AI 生成と判定されたスクリプト（Unit 42）。
- **5 段階**: ① 公開の Web サービスを突破し、偵察エージェントで内部のマイクロサービスを把握 ② サブエージェントがコードの保管庫から、書き込まれたトークンやパスワードを抽出 ③ 盗んだトークンでシークレット管理に入り、管理者の認証情報を取って root 権限を奪取 ④ 社内のコード連携アプリを乗っ取り、クラウドのアクセス鍵を持ち出す。Terraform の構成へのバックドアの設置は、強制されたブランチ保護で止まった ⑤ 盗んだクラウドの鍵で、被害組織の AI エンドポイントを侵害後の基盤に転用した。

### 時系列

- **非公表**: 攻撃の全体が 10 時間未満で完了する。被害組織の名前・業種・攻撃が起きた日は非公表。
- **2026-09-02**: Unit 42 が、ブログで調査を公表する。
- **2026-09-03**: 「ランサムウェア攻撃」ではなく「侵入」だったと明確にする訂正をする。
- **2026-09-04**: 軽い文言の訂正をする。

> 本 Brief は、Unit 42 の自己公表のレポート（2026-09-02 公開、09-03・09-04 訂正）を一次とする。当初は「ランサムウェア攻撃」の文脈で報じられたが、Unit 42 は 09-03 の訂正で「侵入であり、ランサムウェア攻撃ではない」と明確にした。攻撃者は「交渉」の中で AI の使い方を語ったとされるが、身代金の要求の中身・被害組織の業種や規模・攻撃者の身元は公表されていない。本 Brief はこれらを事実として扱わない。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Unit 42**: 次の教訓を示した。AI エージェントは、攻撃の工程の間の時間を縮める。AI エージェントは、構造化 Markdown・Python のキャッシュ・対になったアセットのフォルダなど、見分けられる痕跡を残す。攻撃者は、SSH 鍵・サーバーレス関数・コンテナの再起動の設定・クラウドの ID・CI/CD にまたがる冗長な永続化を、並行して作れる。攻撃者は、被害組織の AI ツールを侵害後の基盤として乗っ取り、通常の通信に紛れて指令の通信を隠し、計算の費用を被害組織に負わせられる。

## 6. Sources

- **Unit 42 / Palo Alto Networks(一次・自己公表レポート)**: "An AI-Assisted Cyber Attack: Inside a Unit 42 Investigation"(2026-09-02公開、09-03/09-04訂正) — <https://unit42.paloaltonetworks.com/ai-assisted-cyber-attack-inside-a-unit-42-investigation/>
- **The Register(独立報道)**: "AI agents carried out every step of this ransomware attack – then left the victim an 80-page security audit"(2026-09-02) — <https://www.theregister.com/security/2026/09/02/ai-agents-carried-out-every-step-of-this-ransomware-attack-then-left-the-victim-an-80-page-security-audit/5294009>
- **Cybernews(独立報道)**: "AI agents speed ransomware breach to under 10 hours" — <https://cybernews.com/security/ai-agents-ransomware-attack-security-audit/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
