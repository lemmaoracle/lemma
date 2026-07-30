---
brief_no: 109
title: "ServiceNow AI Platform：未認証の 1 リクエストが sandbox を抜けてコード実行に達した（CVE-2026-6875）"
title_en: "ServiceNow AI Platform — one unauthenticated request escaped the sandbox to code execution (CVE-2026-6875)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure"]
incident_date: 2026-07-18
published: 2026-07-24
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response", "C-agent-governance"]
related_briefs: ["046-servicenow-unauthenticated-api", "088-kestra-auth-filter-bypass-rce", "094-cursor-duneslide-sandbox-escape", "003-starlette-badhost", "033-f5-bigip-edge-pivot"]
status: published
version: "1.0"
og_lead_ja: "ServiceNow CVE-2026-6875 — 未認証の1リクエストが sandbox を抜け RCE"
og_lead_en: "ServiceNow CVE-2026-6875 — one unauthenticated request escapes the sandbox to RCE"
gap_detected: "Searchlight Cyber が pre-auth sandbox 脱出 RCE を発見・報告し、ServiceNow がパッチを提供、Defused が実地悪用を検出・警告した。"
gap_missing: "実行の可否が「未認証エンドポイントに到達できたか／sandbox の内側か」という表層シグナルで決まり、行動ごとの認可が独立検証されないため、公開 PoC とは別経路でも同じコード実行に到達した。"
gap_fix: "特権実行を始める前に、その行動が認可されていることを到達経路や sandbox 境界とは独立に検証可能な証明として要求し、1 点の到達が管理者作成・MID Server 到達・全体掌握へ波及する連鎖を断つ。"
---

## 1. TL;DR

ServiceNow AI Platform（旧 Now Platform）の未認証 sandbox 脱出 RCE「CVE-2026-6875」の実地悪用が 2026 年 7 月に観測された。Searchlight Cyber が 4 月 1 日に報告した本脆弱性は、認証を経ていない攻撃者が公開到達可能なエンドポイント（`/assessment_thanks.do`）に届いた 1 リクエストで sandbox を抜け、任意コード実行に至るもので、悪用は公開 PoC とは別経路で同じコード実行に達した。ServiceNow はホスト型を 4 月から順次対処・セルフホスト型向け更新を 7 月 13 日に公開し、自社ホスト型での悪用は確認していないとしている。ここで問われるのは、実行が「エンドポイントに到達できたか」で決まり、行動ごとの認可の独立検証で決まっていない点である――とりわけ 1 点の到達が管理者作成・MID Server 到達・インスタンス全体の掌握へ波及する構造にある。

---

## 2. 何が起きたか

- **対象**: ServiceNow AI Platform（旧 Now Platform）。エンタープライズのコアワークフローに AI を統合する PaaS。ServiceNow によれば年 1,000 億件超のワークフローを処理し、Fortune 500 の 85% に採用されているとされる
- **脆弱性**: CVE-2026-6875。未認証（pre-auth）の sandbox 脱出による RCE。一部報道は深刻度を CVSS 9 台（Critical、報道値 9.5）と伝える
- **発見・報告**: Searchlight Cyber が発見し 2026-04-01 に報告（“Smashing the ServiceNow Sandbox: Pre-Authentication RCE”）
- **修正**: ServiceNow はホスト型インスタンスを 4 月から順次対処。セルフホスト型向けの更新を 2026-07-13 に公開
- **悪用**: Defused が週末にかけて実地悪用を確認（最初の試行は金曜）。悪用は Searchlight が記録した未認証の到達点 `/assessment_thanks.do` を突くが、sandbox 脱出の gadget は公開 PoC とは別経路で同じコード実行 primitive に到達
- **影響**: 未認証の攻撃者が sandbox を抜け、インスタンス全体の掌握、テーブル内データへのアクセス、管理者アカウント作成、接続された MID Server プロキシへのコマンド実行に及び得る（高難度攻撃）
- **ベンダー見解**: ServiceNow は公式アドバイザリで「ServiceNow がホストするインスタンスに対する悪用の証拠は観測していない」とし、セルフホスト／ホスト型双方の顧客にパッチ適用を強く推奨

事象は次の連鎖で成立している。

1. **未認証エンドポイントへの到達**: 攻撃者が認証を経ずに、未認証で到達可能な sink（`/assessment_thanks.do`）へ細工した HTTP リクエストを送る
2. **sandbox の脱出**: sandbox 脱出の gadget を用いて、プラットフォームの隔離を抜ける。悪用で用いられた経路は Searchlight の公開 PoC とは別ルートだが、同じコード実行 primitive に到達する
3. **コード実行**: ServiceNow プラットフォーム内で任意コードを実行する。認証を要さないため、到達可能性がそのまま実行可能性に転化する
4. **権限の波及**: インスタンス全体の掌握、テーブル内データへのアクセス、管理者アカウントの作成、接続された MID Server プロキシへのコマンド実行に及び得る

---

## 3. 時系列 — 公表と対応

- 2026-04-01: Searchlight Cyber が CVE-2026-6875 を ServiceNow に報告
- 2026-04〜: ServiceNow がホスト型インスタンスを順次対処
- 2026-07-13: ServiceNow がセルフホスト型インスタンス向けの更新（KB 記事）を公開
- 2026-07-17 前後（金曜）: 実地悪用の最初の試行が観測される
- 2026-07-18〜19（週末）: Defused が実地悪用を確認・公表。悪用は `/assessment_thanks.do` を突き、公開 PoC とは別経路で同じコード実行に到達
- 2026-07-20: 報道（BleepingComputer 等）。ServiceNow は自社ホスト型インスタンスでの悪用証拠は未観測と表明し、パッチ適用を推奨

> 注: 技術的事実は Searchlight Cyber の研究、Defused の実地悪用報告、NVD（CVE-2026-6875）、および確立メディア（BleepingComputer・Help Net Security・SecurityWeek 等）に基づく。深刻度スコア・悪用範囲・被害の有無は出典・時点により幅があり、ServiceNow は自社ホスト型での悪用証拠を未観測としている。最新の一次情報（ベンダーアドバイザリ・NVD）を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **Searchlight Cyber**: 本脆弱性を発見し 4 月 1 日に ServiceNow へ報告。研究（“Smashing the ServiceNow Sandbox: Pre-Authentication RCE”）で未認証 sandbox 脱出 RCE を記録
- **ServiceNow**: ホスト型インスタンスを 4 月から順次対処、セルフホスト型向け更新を 7 月 13 日に公開。公式アドバイザリでは「自社がホストするインスタンスに対する悪用の証拠は観測していない」とし、双方の顧客にパッチ適用を推奨。なお同社は前月、未認証 API 経由で顧客インスタンスのデータが照会された別インシデントを非公開に開示している（後続アドバイザリで bug bounty 関連の研究活動に紐づくと説明。[Brief No.046](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/) 参照）
- **Defused / 報道**: Defused が週末に実地悪用を確認・公表し、`/assessment_thanks.do` を突く悪用が公開 PoC とは別経路で同じコード実行に到達すると指摘。BleepingComputer・Help Net Security・SecurityWeek 等が報道
- **業界横断の論点**: 大規模に AI ワークフローを実行するエンタープライズ基盤において、未認証の到達点＋ sandbox 脱出がインスタンス全体の掌握に直結し得ることが再認識された。パッチで既知経路を塞ぐことと、実行の可否を行動ごとの認可の独立検証に置き換えることは別の層であり、後者がなければ「別経路で同じ実行に到達する」試みは残る

「AI プラットフォーム上のコード実行を、到達したエンドポイントや sandbox の境界ではなく、行動ごとの独立検証可能な認可でどう縛るか」は、本事案を契機にエンタープライズ AI 基盤の要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**プラットフォームがコード実行を「認証を経ない特定エンドポイントに到達できたか」で許し、「この行動がこの主体・このスコープで認可されているか」の独立検証で許していなかった**点にある。認証を要さない sink に届いた 1 リクエストが sandbox を抜けて実行に至るとき、到達可能性と実行権限が事実上一体化している。

本事案に固有なのは、**sandbox という隔離（実行を封じ込める前提の層）自体が脱出され、しかも公開 PoC とは別経路で同じ実行に到達した**点だ。これは、防御を特定の経路や表層シグナル（到達したエンドポイント、認証の有無、sandbox の境界）に依存させる限り、別経路が見つかれば同じ実行に届いてしまうことを示す。求められるのは、経路ではなく行動そのものに紐づく、独立検証可能な認可である。

[Brief No.046](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（[ServiceNow 未認証 API](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)、設定ひとつで認証が外れ未認証のまま顧客インスタンスが照会された）と同一ベンダーで、「未認証の到達がそのまま特権操作になる」構造を反復している（別インシデント・別エンドポイント・sandbox 脱出という点で独立）。[Brief No.088](https://lemma.frame00.com/ja/critical/briefs/088-kestra-auth-filter-bypass-rce/)（[Kestra](https://lemma.frame00.com/ja/critical/briefs/088-kestra-auth-filter-bypass-rce/)、パス末尾で認証が外れ未認証のまま root でコード実行）、[Brief No.003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（[Starlette / BadHost](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)、Host ヘッダー操作で認証回避）とは、認証・認可の表層判定が実行権限に直結する構造で同型。[Brief No.094](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/)（[Cursor / DuneSlide](https://lemma.frame00.com/ja/critical/briefs/094-cursor-duneslide-sandbox-escape/)、仕込まれた 1 つの指示が sandbox を抜けて任意コード実行）とは sandbox 脱出の面で、[Brief No.033](https://lemma.frame00.com/ja/critical/briefs/033-f5-bigip-edge-pivot/)（[F5 BIG-IP](https://lemma.frame00.com/ja/critical/briefs/033-f5-bigip-edge-pivot/)、1 台の侵害がドメイン全体へ連鎖）とは 1 点の到達が全体掌握へ波及する面で連なる。共通する primitive は同じである。すなわち、**到達可能性・表層シグナルが、行動ごとの認可とは独立している**。

Searchlight Cyber による発見・報告、ServiceNow のパッチ提供、Defused による実地悪用の検出・警告、報道を通じた可視化は、被害の抑止に不可欠であり、本 Brief がその役割を否定するものではない。脆弱性の発見からパッチ、実地悪用の観測に至る系列は、防御側が対処するための起点である。検出は確かに役割を果たす。

一方で、パッチ適用と実地悪用の検出は、「いま到達しているこのリクエストが、実行を認可された正規の行動か、未認証のまま sandbox を抜けようとする悪用か」を、**その実行が始まる時点で**行動そのものに紐づけて独立に立証する材料にはならない。悪用が公開 PoC とは別経路で同じ実行に到達したという事実は、防御が特定の経路・シグナルに依存する限り、別経路が同じ結果へ抜け得ることを示している。パッチは既知の経路を塞ぐが、実行の可否が「到達できたか」で決まる構造そのものは、行動ごとの認可を独立検証しない限り残る。監査で「このプラットフォーム上のコード実行は、認可された主体による正規の行動だったか」を立証する材料として、「認証エンドポイントを通っていない・sandbox 内にいるはず」という表層の前提だけでは、行動の認可の独立した証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-action attestation）は、実行を始める前に、その行動が認可されていることを、到達したエンドポイントや sandbox の境界とは独立に検証可能な証明として要求する（proof-as-auth）。証明が伴わなければ、認可なき実行を既定で拒否する（deny-by-default）。これは sandbox 脱出のバグそのものを消すものではなく、認可されていない実行を成立させない設計原則である。ただし本事案は未認証（匿名）の pre-auth 悪用であり、初動の到達点そのものに主体を紐づけることはできない。したがって proof-as-auth が本ケースで最も強く効くのは初動ではなく、**その後の特権波及**――管理者作成・MID Server 到達・テーブルデータ・インスタンス全体の掌握――を「1 点の到達＝全権」に転化させない層としてである。既知経路を塞ぐパッチ・実地悪用の検出（detection 的な「到達した／既知の穴」）と、行動ごとの認可の事前証明（「この実行はいま認可されているか」）は代替ではなく **補完** の関係にある。

本事案で露呈した検出と証明の落差（未認証の到達点＋ sandbox 脱出が、行動ごとの認可を独立検証しないまま実行に至る）に対して、Lemma は、実行を始める前に、その行動がこの主体・このスコープで認可されていることを、到達経路や sandbox の境界とは独立に検証可能な暗号証明として要求する設計を提示している。

- **行動ごとの認可の deny-by-default**: 特権操作を始める前に、「この行動はこのスコープで認可されている」ことを、到達したエンドポイント・認証の有無・sandbox の境界とは切り離して証明させ、証明が伴わない実行を既定で拒否する。「未認証の sink に到達できた」ことを特権実行の根拠にしない
- **経路非依存の認可**: 認可を到達経路ではなく行動そのものに紐づけることで、「別経路で同じ実行に到達する」試みに対しても一貫して拒否の既定が働く
- **スコープ付き権限と最小環境**: MID Server 到達・管理者作成のような特権操作を、行動ごとのスコープ付き認可証明の下でのみ許し、1 点の到達が全体掌握へ波及する連鎖を断つ。本事案のように初動が未認証で主体を持たない場合でも、この波及遮断の層は独立して働く
- **選択的開示**: 「この実行が認可要件を満たす」ことだけを最小開示し、内部の資格情報・秘密は環境外に出さない

なお、未認証・匿名の攻撃者による初動の到達点そのものに proof-as-auth を課すことは、その公開経路の信頼モデルを「到達＝許可」から「認可の証明＝許可」へ変更することを意味し、鍵の窃取が争点となる事案（[Brief No.103](https://lemma.frame00.com/ja/critical/briefs/103-ostium-oracle-signer-key-future-priced-data/) 等）に比べ初動への適用は弱い。本層の主眼は、既知経路を塞ぐパッチと組み合わせつつ、到達後の特権波及を「1 点の到達＝全権」に転化させない補完にある。その射程を正直に見積もったうえで、検出（既知経路を塞ぐパッチ・実地悪用の観測）は既知の穴の封じ込めに、事前証明（特権実行前の行動認可の検証）は波及の遮断に、それぞれ相補的に働く。

---

## 6. Sources

- **Searchlight Cyber（発見元の研究）**: “Smashing the ServiceNow Sandbox: Pre-Authentication RCE” — <https://slcyber.io/research-center/smashing-the-servicenow-sandbox-pre-authentication-rce/>
- **NVD**: CVE-2026-6875 — <https://nvd.nist.gov/vuln/detail/CVE-2026-6875>
- **BleepingComputer**: “Critical ServiceNow code execution flaw now exploited in attacks”（2026-07-20、Defused の実地悪用確認・別経路の sandbox 脱出・ServiceNow 声明）— <https://www.bleepingcomputer.com/news/security/critical-servicenow-code-execution-flaw-now-exploited-in-attacks/>
- **Help Net Security**: “ServiceNow pre-auth RCE exploited in the wild (CVE-2026-6875)”（2026-07-20）— <https://www.helpnetsecurity.com/2026/07/20/servicenow-cve-2026-6875-exploited/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)
