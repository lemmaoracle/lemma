---
brief_no: 83
title: "Change Healthcare：盗まれた認証情報でリモートアクセスに入られ、米国の医療請求の処理が数週間止まった(UnitedHealth Group の議会証言)"
title_en: "Change Healthcare: Stolen credentials opened remote access, and US medical-claims processing stalled for weeks (UnitedHealth Group congressional testimony)"
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
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "サイバー攻撃事例 · ランサムウェア"
og_kicker_en: "CYBERATTACK · RANSOMWARE"
og_headline_ja: "盗まれた認証情報で、\n医療請求が止まった。\n<accent>米国の約 3 分の 1</accent>"
og_headline_en: "Stolen credentials\nstalled medical claims.\n<accent>~1/3 of US claims, for weeks</accent>"
key_figures:
  - value: "約 3 分の 1"
    label: "Change Healthcare が担っていた、米国の医療保険の請求処理の割合（40〜50% とも）。停止は数週間に及んだ"
    tone: "alert"
  - value: "約 9 日"
    label: "侵入（2024-02-12・推定）から、ランサムウェアの検知（02-21）まで"
  - value: "1 億人超"
    label: "影響を受けた医療記録（HHS の公表）。後の推計では最大 1 億 9,000 万人"
glossary:
  - term: "Citrix のリモートアクセス"
    desc: "社外から社内のシステムに入るための入口。今回の侵入は、この入口へのログインから始まった。"
  - term: "MFA（多要素認証）"
    desc: "パスワードのほかに、手元の端末や生体など別の要素でも本人を確認するログインの方法。"
  - term: "横展開"
    desc: "入り込んだ攻撃者が、ネットワークの中で別のシステムへ移り、権限を広げていくこと。"
insight:
  slug: "password-is-not-authority"
  label: "知っていることと、権限があること"
  quote: "パスワードが一致しても、ログインしているのが権限を持つ本人かを別に照合しなければ、盗まれた認証情報によるログインは、正規のアクセスとして通る。"
industries: ["healthcare"]
operations: ["account-admin"]
controls:
  - slug: "ownership-check"
    item: "ログインしているのが本人か、パスワード以外の方法でも確認する"
attack_method: "account-takeover"
impact: "約 1 億人以上の医療記録が影響"
takeaway: "盗まれた認証情報で、リモートアクセスの入口から、正規のログインとして入られた。入口で、パスワードの一致とは別に、ログインする主体が権限を持つ本人かを照合する。"
self_check: "リモートアクセスの入口で、パスワードの一致とは別に、ログインする主体が権限を持つ本人かを照合しているか。"
countries: ["us"]
---

## 1. 要点

入口へのログインは、盗まれた ID とパスワードによるもので、正規のリモートアクセスと外形上区別できなかった。検知が働いたのは、ネットワークの中で横展開が進んだ後の、ランサムウェアの展開の段階だった。<strong>パスワードが一致しても、ログインしているのが権限を持つ本人かを別に照合しなければ、盗まれた認証情報によるログインは、正規のアクセスとして通る。</strong>

## 2. 通った操作

- **通った操作**: 盗まれた認証情報（ID・パスワード）による、Citrix のリモートアクセスの入口へのログイン。UnitedHealth Group の CEO は、議会証言で、侵入の経路は MFA が設定されていない単一の Citrix アカウントだったとした。
- **止まった操作**: Change Healthcare は、ランサムウェアの展開の段階で攻撃を検知し、主要なシステムを止めた。止めるまでに、攻撃者はネットワークの中で横展開していた（侵入は 2024-02-12 と推定）。
- **受け付けた側に届くもの**: 一般に、パスワードだけで入れる入口には、ID とパスワードが届く。正規の利用者のログインと、盗まれた認証情報でのログインは、入口からは同じに見える。
- **公表されていないこと**: 認証情報がどう入手されたか（フィッシング、情報を盗むマルウェア、闇市場での購入などが考えられるが、経路は公表されていない）。侵入の日は推定である。

## 3. 実行前の照合

経路を問わず区別できる条件は、入口が、ログインを受け付ける前に、パスワードの一致とは別に、ログインする主体がその範囲の権限を持つ本人かを照合することである。

- **誰が承認を出すか**: 組織（アクセスの権限を管理する側）。誰が、どの業務上の必要で、どの範囲に入れるかを、あらかじめ決めておく。
- **どこで照合するか**: リモートアクセスの入口。パスワードの一致だけでなく、権限を持つ本人かを、ログインの手前で照合する。照合できないログインは、通さない。
- **何が残るか**: どの主体が、どの権限で、いつ入口を通ったか、医療記録などにどの権限で触れたかの記録。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝リモートアクセスのログインを受け付ける前に、ログインする主体が権限を持つ本人かを照合し、記録に残すこと。検知＝侵入の後に、攻撃に気づくこと。侵入の日（02-12）は推定。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>ログインの前に、権限を持つ本人かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>正規のアクセスと区別できないまま<br>約 9 日、ネットワークの中にいた</span></div>
<div class="rx-zone det"><b>検知 · 侵入の後に働いた</b>ランサムウェアの展開で気づき、主要なシステムを止める</div>
<div class="rx-g g1"><div class="t">02-12（推定）</div><b>盗まれた認証情報でログイン</b></div>
<div class="rx-g g2"><div class="t">02-12〜</div><b>ネットワークの中で横展開</b></div>
<div class="rx-g g3"><div class="t">02-21</div><b>検知し、主要なシステムを止める</b></div>
<div class="rx-g g4"><div class="t">2024-05</div><b>議会証言で侵入の経路を明らかにする</b></div>
</div>
</figure>

検知は、システムを止めて被害の拡大を抑えたが、侵入から約 9 日後だった。[DeepSeek](https://lemma.frame00.com/ja/critical/briefs/057-deepseek-clickhouse-exposed-db/)（認証のないデータベース）のように入口に認証が無かった事案と違い、今回は、認証のある正規の入口に、認証情報でログインされた。

## 4. Lemma でできること

**Lemma は、03 の照合を、リモートアクセスの入口に組み込む。** 侵入を見つけるのではなく、ログインする主体が権限を持つ本人かを、パスワードの一致とは別に、ログインの前に照合する。

### 注意したい業界・業務

- **業界 · 医療**: 医療請求や医療情報の交換など、多くの医療機関がつながる基盤を運営する組織。1 つの入口から、全国の業務が止まりうる。
- **業務 · アカウント管理・リモートアクセス**: 社外から入る入口のアカウント、ログインの方法、保護対象の医療情報（PHI）へのアクセスの権限。

### いまの対策と Lemma の違い

今回の経路は、1 列目（盗まれた認証情報によるリモートアクセスのログイン）である。2 列目は、ログインの後の横展開とランサムウェアの展開で、今回はこの段階で検知された。

| 対策 | 盗まれた認証情報によるリモートアクセスのログイン | ログインの後の横展開とランサムウェアの展開 |
| --- | --- | --- |
| MFA（パスワード以外の要素） | 一部 | 関係しない |
| ランサムウェアの検知とシステムの停止 | 効かない | 一部 |
| **Lemma（実行の前の照合）** | 効く | 一部 |

MFA は、パスワード以外の要素も確認することで、盗まれたパスワードだけでのログインに抵抗を加える。今回、侵入の経路とされた Citrix のアカウントには、設定されていなかった（UnitedHealth Group の議会証言）。ランサムウェアの検知は、展開の段階で働いて主要なシステムを止めたが、最初のログインは正規のアクセスと区別できず、侵入から約 9 日後だった。Lemma は、ログインの前に、主体が権限を持つ本人かを、パスワードの一致とは別に照合する。医療記録へのアクセスも、どの権限によるかを、アクセスの時点で照合し、記録に残せる。

注：Lemma の照合が働くのは、リモートアクセスの入口に照合を組み込み、権限の判断が、パスワードとは別に管理されている場合に限る。権限を持つ本人の端末やセッションごと奪われた場合は、この照合を通りうる。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

リモートアクセスについて、組織で確認する 3 項目

- 社外から入る入口が、パスワードだけで入れる状態になっていないか。
- ログインする主体が、その範囲の権限を持つ本人かを、入口で照合しているか。
- 医療記録など機微なデータに、誰がどの権限で触れたかを、記録に残しているか。

## 5. 事実と時系列

- **当事者**: Change Healthcare（UnitedHealth Group の傘下。米国最大規模の医療請求処理と医療情報の交換のネットワーク）。
- **攻撃者**: AlphV/BlackCat ランサムウェアグループ。後に RansomHub が別に恐喝した。
- **侵入の経路**: MFA が設定されていなかった Citrix のリモートデスクトップ／VPN ゲートウェイの入口への、盗まれた認証情報（ID・パスワード）によるログイン（UnitedHealth Group の CEO の議会証言）。
- **業務への影響**: 全米の薬局での処方薬の調剤の確認、病院の保険請求、医師による保険の適用の確認が、数週間にわたり、できないか大きく遅れた。一部の病院では、現金払いの要求や、処方薬の在庫の確認ができない状態が起きた。
- **財務の被害**: UnitedHealth Group が支払った身代金は約 2,200 万ドル（後に RansomHub にも別に支払いがあったと報じられた）。業務の停止、復旧、医療機関の支援を含む総損失は、数十億ドル規模と報じられている。
- **データの被害**: 約 1 億人以上（後の推計では最大 1 億 9,000 万人）の米国人の医療記録、個人情報、保険の情報が影響を受けた可能性がある。米国史上最大の医療データの侵害とされる。

### 時系列

- **2024-02-12（推定）**: 攻撃者が、MFA が設定されていない Citrix のアカウントに、盗まれた認証情報でログインする。ネットワークの中で横展開を始める。
- **2024-02-21**: Change Healthcare がランサムウェアの攻撃を検知し、主要なシステムを止める。医療請求と処方の処理が、全国で止まる。
- **2024-02-21〜03**: 全米の薬局、病院、医師が影響を受ける。HHS（米保健福祉省）が緊急の対応を発表する。AHA（米国病院協会）が、壊滅的な影響として議会に訴える。
- **2024-03（推定）**: AlphV/BlackCat が約 2,200 万ドルの身代金を受け取り、その後、解散する。データを持っていた関係者が RansomHub として現れ、Change Healthcare を別に恐喝する。
- **2024-05**: UnitedHealth Group の CEO Andrew Witty が、上院と下院の委員会で証言し、MFA が設定されていない Citrix のアカウントが侵入の経路だったと述べる。
- **2024-10 以降**: HHS が影響を受けた人数（当初 1 億人超）を公表する。後の推計で、最大 1 億 9,000 万人超が影響を受けた可能性が報じられる。

> 本 Brief は、一次として UnitedHealth Group の議会証言と HHS の公表に拠る。侵入の日（2024-02-12）は推定で、影響を受けた人数は公表の時点で更新されているため、最新の情報を参照のこと。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **UnitedHealth Group / Change Healthcare**: すぐにシステムを止め、医療機関向けの緊急の資金援助（数十億ドル）を設けた。復旧と並行して、侵害の範囲を調べ、開示した。
- **HHS（米保健福祉省）**: 緊急のガイダンスを出し、HIPAA の規則の適用を一時的に柔軟にした。影響を受けた人数（1 億人超）を公表した。
- **AHA（米国病院協会）**: 「壊滅的かつ前例のない」影響として、議会に緊急の対策を求めた。
- **AlphV/BlackCat**: 約 2,200 万ドルを受け取った後、事実上解散した。内部告発者によれば、身代金はグループのリーダーが独占し、関係者がデータを持って RansomHub として再編した。
- **業界の論点**: 医療の IT で MFA を事実上の義務にする議論が進んだ。HHS は、HIPAA セキュリティルールの改訂（MFA の要件の明記）の検討を始めた。医療の基盤の委託先のリスク管理に、注目が集まった。

## 6. Sources

- **UnitedHealth Group 議会証言（一次）**: CEO Andrew Witty による米上院財政委員会・下院エネルギー商業委員会での証言（2024-05-01、05-08 前後）。侵入経路として MFA 未設定の Citrix アカウントを明言 — https://www.finance.senate.gov/hearings/hacking-americas-health-care-assessing-the-change-healthcare-cyber-attack-and-whats-next （Witty 証言 PDF: https://www.finance.senate.gov/imo/media/doc/0501_witty_testimony.pdf ）
- **HHS（米保健福祉省）**: 侵害通知・影響者数の公表（2024-10 以降）。Change Healthcare Breach Substitute Notice
- **AHA（米国病院協会）**: "Change Healthcare Cyberattack"（2024-02〜）— https://www.aha.org/change-healthcare-cyberattack
- **Wired**: "The Change Healthcare Hack: How It Happened and What It Means"（2024 年）
- **CISA / FBI 共同勧告**: AlphV/BlackCat ランサムウェアグループに関する技術勧告（2024-02-27）— https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-353a

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
