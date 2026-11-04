---
brief_no: 68
title: "Universal Robots PolyScope：認証なしのネットワーク到達だけで、協働ロボットの OS で任意のコードが実行できた(CVE-2026-8153・CISA)"
title_en: "Universal Robots PolyScope: unauthenticated network access alone allowed arbitrary code to run on the cobot's OS (CVE-2026-8153, CISA)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-05-14
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["003-starlette-badhost", "046-servicenow-unauthenticated-api", "007-pocketos-cursor-db-deletion", "033-f5-bigip-edge-pivot", "025-mcp-stdio-config-to-command-rce", "066-litellm-ai-gateway-privilege-escalation"]
status: published
version: "1.0"
og_lead_ja: "未認証のネット到達だけで産業用ロボットに RCE — UR PolyScope"
og_lead_en: "Unauthenticated network access yields RCE on cobots — UR PolyScope"
layout: "report"
sections: "proof"
gate: "identity"
og_kicker_ja: "脆弱性の公表 · 産業用ロボット"
og_kicker_en: "VULNERABILITY · INDUSTRIAL ROBOTS"
og_headline_ja: "認証なしで、\n協働ロボットの OS に\nコードを実行できた。\n<accent>必要なのはネットワーク到達だけ</accent>"
og_headline_en: "No login was needed to run code on a cobot's OS.\n<accent>Network reach was all it took.</accent>"
key_figures:
  - value: "9.8"
    unit: "CVSS 3.1"
    label: "深刻度（Critical）。CVSS 4.0 では 9.3。認証は要らない"
    tone: "alert"
  - value: "29999"
    unit: "TCP"
    label: "Dashboard Server の既定の待受ポート。ここへのネットワーク到達だけで足りた"
  - value: "5.25.1"
    label: "修正版の PolyScope 5。これより前のバージョンが対象"
glossary:
  - term: "協働ロボット（cobot）"
    desc: "人と同じ空間で働くことを想定した産業用ロボット。Universal Robots の製品は、製造・物流の現場で広く稼働している。"
  - term: "OS コマンドインジェクション"
    desc: "外から受け取った入力が、無害化されないまま OS のコマンドの一部として実行される弱点。"
  - term: "Dashboard Server"
    desc: "PolyScope 5 のネットワーク向けのインターフェース。既定では TCP 29999 で待ち受ける。"
insight:
  slug: "reach-as-authority"
  label: "届けば動く"
  quote: "命令がネットワークから届いたことと、その送り手が操作してよいことは別の事実で、届いたことが権限を兼ねる機器では、入口の穴がそのまま操作権になる。"
industries: ["manufacturing"]
controls:
  - slug: "ownership-check"
    item: "命令の送り手が、ロボットを操作してよい相手かを、物理動作の前に照合する"
impact: "認証なしでネットワーク到達できる攻撃者が、ロボットの OS で任意のコマンドを実行できた（実環境での悪用は報告されていない）"
takeaway: "ネットワークから届いた命令の送り手が、ロボットを操作してよい相手かを、実行の前に照合する手順が、経路上に無かった。"
self_check: "制御機器に届く命令について、送り手が操作してよい相手かを、実行の前に照合できるか。"
countries: ["global"]
---

## 1. 要点

CISA は、協働ロボットの制御ソフト PolyScope 5（5.25.1 より前）に、未認証の攻撃者がロボットの OS で任意のコードを実行できる弱点（CVE-2026-8153）があると警告した。実環境での悪用は、本稿の時点で報告されていない。それでも、修正版を当てていないロボットでは、待受ポートにネットワークから届くだけで、OS のコマンドを実行できた。<strong>命令がネットワークから届いたことと、その送り手が操作してよいことは別の事実だが、届いたことが権限を兼ねる機器では、入口の穴がそのまま操作権になる。</strong>

## 2. 通った操作

- **通った操作**: Dashboard Server のポート（既定は TCP 29999）に届いた、細工された入力と、それによるロボットの OS 上の任意のコマンドの実行。入力は、特殊文字の無害化なしに OS へ渡された。攻撃に必要だったのはネットワーク到達性だけで、認証は要求されなかった（CISA・Universal Robots）。
- **受け付けた側に届くもの**: 一般に、制御ソフトに届いた命令は、送り手に操作してよい権限があるかの情報を持たずに届く。ネットワークから届いた命令が、操作してよい相手のものかは、受け付ける側からは区別がつかない。
- **止まった操作**: 修正版（PolyScope 5.25.1）を当てたロボットでは、この弱点は修正されている（Universal Robots）。Dashboard Server のポートのネットワークでの分離・露出の遮断も、緩和策として示された。
- **公表されていないこと**: 実環境での悪用（本稿の時点で報告されていない）。ロボット OS 上のコード実行の先で起きうる、制御ロジックの改変や運転の妨害は、想定される影響で、確認された被害ではない。

## 3. 実行前の照合

経路を問わず区別できる条件は、物理動作につながる命令を実行する側が、その命令の送り手が操作してよい相手かを、ネットワークのどこから届いたかに関係なく、実行の前に照合することである。

- **誰が承認を出すか**: ロボットの運用の責任者など、操作してよい相手を決める担当者。起動・運転・プログラムの読み込みのような命令を、誰に、どの範囲で許すかを、ロボットの外で決めておく。
- **どこで照合するか**: 物理動作につながる命令を実行する手前の一か所。内部のネットワークから届いた命令も、外から届いた命令も、同じ照合を通す。許可と一致しない命令は、実行せずに止める。
- **何が残るか**: どの許可で、誰の命令が、どの動作として実行されたかの記録。ネットワーク到達の記録とは別に残す。

<figure class="rx-ex">
<div class="rx-ex-h"><span class="rx-ex-no">図表 1</span><span class="rx-ex-t">「検知」と「実行の前の照合」の違い</span></div>
<p class="rx-ex-cap">実行の前の照合＝物理動作につながる命令を実行する前に、送り手が操作してよい相手かを照合し、記録に残すこと。検知＝弱点や異常が表に出た後に気づくこと。下の日付は、CISA が勧告を公開した日で、弱点が悪用できるようになった日とは限らない。</p>
<div class="rx-gap">
<div class="rx-zone proof"><b>実行の前の照合 · 公表からは分からない</b>命令を実行する前に、送り手が操作してよい相手かを照合する</div>
<div class="rx-zone gapz"><b>確認されたこと</b><span>認証なしで、ネットワーク到達だけで<br>OS のコマンドを実行できた</span></div>
<div class="rx-zone det"><b>検知 · 働いた</b>弱点が見つかり、CISA とメーカーが勧告を出す</div>
<div class="rx-g g1"><div class="t">事前</div><b>入力を OS へ無害化せず渡す欠陥</b></div>
<div class="rx-g g2"><div class="t">05-14</div><b>CISA が勧告を公開</b></div>
<div class="rx-g g3"><div class="t">以降</div><b>5.25.1 への更新と分離を推奨</b></div>
<div class="rx-g g4"><div class="t">本稿の時点</div><b>実環境での悪用は報告なし</b></div>
</div>
</figure>

勧告と修正版の公開は、見つかった弱点に対するもので、届いた命令の送り手を照合する仕組みではない。同じように、認証のない入口から業務基盤の操作に届いた事案に、[ServiceNow の未認証 API](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（要求者の認可が、実行の前に照合されなかった）がある。

## 4. Lemma でできること

**Lemma は、実行前の照合を、物理動作につながる命令を実行する側に組み込む。** 弱点や侵入を見つけるのではなく、届いた命令の送り手が操作してよい相手かを、ネットワークの経路と関係なく、実行の前に照合する。

### 注意したい業界・業務

- **業界 · 製造**: 協働ロボットを、製造や物流の現場で動かしている組織。ロボットの制御ソフトに、ネットワークから届く入口がある。
- **業務 · ロボットの起動・運転・プログラムの読み込み**: 物理動作につながる命令。送り手がネットワークに届いたことだけでは、操作してよい相手かは分からない。

### いまの対策と Lemma の違い

今回の経路は、ネットワークから届いた、物理動作につながる命令である。

| 対策 | ネットワークから届いた、物理動作につながる命令 |
| --- | --- |
| 修正版の適用（PolyScope 5.25.1 以降） | 一部 |
| ネットワークの分離・露出の遮断 | 一部 |
| 異常の検知（動作の後） | 効かない |
| **Lemma（実行の前の照合）** | 効く |

修正版の適用は、この弱点を塞ぐが、届いた命令の送り手を照合する仕組みではない。ネットワークの分離は、誰が届けるかを狭めるが、届いた相手が操作してよい相手かを、ロボットが照合するわけではない。異常の検知は、命令が実行され、動作が起きた後になり、結果は戻せない。Lemma は、物理動作につながる命令を、実行の前に、送り手が操作してよい相手かで照合する。実行の記録も残るので、ネットワーク到達の記録だけに頼らずに、どの動作が、どの許可で行われたかを確認できる。

注：Lemma の照合が働くのは、起動・運転・プログラムの読み込みのような命令を実行する手前に照合を組み込み、許可の記録がロボットの外で管理されている場合に限る。ロボットの OS 上でコードが動く位置にいる相手は、この照合を通らずに動作を起こせる可能性がある。表は何を照合しているかの比較で、今回の事案で止まったかどうかを示すものではない。Lemma は、侵入を検出・防止するものではない。

### 点検チェックリスト

制御機器（ロボット）について、組織で確認する 3 項目

- PolyScope 5 のロボットが、5.25.1 以降になっているか。
- Dashboard Server のポートに、ネットワークのどこから届くかを把握し、必要のない範囲を閉じているか。
- 内部のネットワークから届いた命令も、送り手が操作してよい相手かを、実行の前に確認する手順があるか。

## 5. 事実と時系列

- **対象**: Universal Robots の協働ロボット（cobot）用の制御ソフト PolyScope 5（5.25.1 より前のバージョン）。製造・物流の現場で広く稼働する産業用ロボットの制御基盤。
- **公表主体**: CISA（産業用制御システム勧告 ICSA-26-134-17、2026-05-14）。Universal Robots も同じ脆弱性の勧告を公開した。発見者は Claroty Team82 の Vera Mens。
- **脆弱性**: CVE-2026-8153（OS コマンドインジェクション、CWE-78 系）。CVSS 3.1 の基本値は 9.8（Critical）、CVSS 4.0 の基本値は 9.3。
- **手口の核心**: PolyScope の Dashboard Server のインターフェースが、利用者の与えた入力を、特殊文字の無害化なしに OS へ渡していた。Dashboard Server のポート（既定の待受は TCP 29999）へネットワーク到達できる未認証の攻撃者が、細工した入力で、ロボットの OS 上の任意のコマンドを実行できた。
- **必要だったもの**: ロボットを操作する権限ではなく、Dashboard Server のポートへのネットワーク到達性だけ。認証は要求されない。
- **想定される影響**: ロボット OS 上の任意のコードの実行は、制御ロジックの改変、運転の妨害、横展開の足場につながりうる。製造ラインの実体のロボットが、攻撃者の指示で動く余地が生じる。
- **修正**: Universal Robots が PolyScope 5.25.1 で修正をリリースした。

### 時系列

- **（事前）**: PolyScope 5 の Dashboard Server に、入力を OS へ無害化せず渡す欠陥が存在した。
- **2026-05-14**: CISA が産業用制御システム勧告 ICSA-26-134-17 を公開し、CVE-2026-8153（CVSS 9.8）を警告した。Universal Robots も同じ脆弱性の勧告を公開し、PolyScope 5.25.1 での修正を案内した。
- **以降**: 運用者に対し、5.25.1 への更新と、Dashboard Server のポートのネットワーク露出の遮断・分離が推奨されている。

> 本 Brief が扱うのは CVE-2026-8153 の脆弱性とその構造で、本稿の時点で、実環境での悪用は報告されていない。CISA の勧告と Universal Robots の勧告を日付の基点とし、規模・手口は一次に基づいて記述した。公表されていないことは、対策が無かったことを意味しない。

### 公表後の対応

- **Universal Robots**: CVE-2026-8153 のセキュリティ勧告を公開し、PolyScope 5.25.1 で修正をリリースした。運用者に更新を案内した。
- **CISA**: 産業用制御システム勧告 ICSA-26-134-17 を出し、未認証でコードを実行されるリスクと、緩和策（更新・ネットワークの分離・露出の最小化）を周知した。
- **OT・産業ロボットの運用者への推奨**: PolyScope 5.25.1 以降への更新、Dashboard Server のポートのネットワーク露出の遮断・分離、制御ネットワークの最小権限化。

## 6. Sources

- **Universal Robots（一次・ベンダー勧告）**: “CVE-2026-8153: Command Injection in the PolyScope 5 Dashboard Server” — <https://www.universal-robots.com/articles/ur/cybersecurity/cve-2026-8153-command-injection-in-the-polyscope-5-dashboard-server/>
- **CISA（一次・ICS 勧告）**: “Universal Robots PolyScope 5”（ICSA-26-134-17、2026-05-14）— <https://www.cisa.gov/news-events/ics-advisories/icsa-26-134-17>（cisa.gov は環境により 403。CIRCL 安定ミラー: <https://vulnerability.circl.lu/vuln/icsa-26-134-17>）
- **SecurityWeek**: “Critical Vulnerability Exposes Industrial Robot Fleets to Hacking” — <https://www.securityweek.com/critical-vulnerability-exposes-industrial-robot-fleets-to-hacking/>
- **SC Media**: “Critical vulnerability in Universal Robots' PolyScope OS allows remote command execution” — <https://www.scworld.com/brief/critical-vulnerability-in-universal-robots-polyscope-os-allows-remote-command-execution>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)
