---
brief_no: 88
title: "Kestra：リクエストのパス末尾を「/configs」にするだけで認証が外れ、未認証のまま root でコードが実行できた"
title_en: "Kestra: Ending a Request Path With /configs Bypassed Authentication and Allowed Unauthenticated Code Execution as Root"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "code-provenance"]
incident_date: 2026-06-26
published: 2026-06-30
authors: ["Lemma Critical Team"]
related_pack: ["C-agent-governance"]
related_briefs: ["003-starlette-badhost", "046-servicenow-unauthenticated-api", "066-litellm-ai-gateway-privilege-escalation", "027-librechat-mcp-url-secrets"]
status: "published"
version: "1.0"
og_lead_ja: "Kestra：パス末尾を /configs にするだけで認証回避、未認証 root RCE（CVSS 10.0）"
og_lead_en: "Kestra: a /configs path suffix bypasses auth — unauthenticated root RCE (CVSS 10.0)"
gap_detected: "CVE-2026-53576 として早期に開示され、CVSS 10.0 の深刻度評価・修正版（1.0.45 / 1.3.21）の提供・CISA ADP の補強が作動した。"
gap_missing: "リクエストの認可が「パス末尾が /configs か」という表層シグナルで判定され、その要求が本当に公開対象か（呼び出し側の権限）を実行の前に独立検証する層が無かった。"
gap_fix: "flow の作成・実行のような特権操作の前に、要求主体の権限を URL パスの形式判定とは切り離して Lemma で独立検証し、証明が伴わなければ実行を事前に block する。"
---

## 1. TL;DR

データやワークフローを自動実行するオーケストレーション基盤 Kestra に、未認証のまま root で任意コードを実行できる脆弱性（CVE-2026-53576、CVSS 10.0）が 2026-06-26 に公開された。REST API の認証フィルタが「パス末尾が `/configs` のリクエストは公開設定エンドポイント」と判定して認証をスキップする実装だったため、攻撃者は本来保護されたエンドポイントのパス末尾に文字列 `configs` を付けるだけで認証を素通りできた。バイパスは flow（ワークフロー）の作成・実行トリガにも届くため、未認証の攻撃者が Shell/Process タスクを含む flow を作って実行でき、タスクはコンテナ内で root として動く。公式 `docker-compose.yml` は `/var/run/docker.sock` をマウントするため、コンテナ root からホストの Docker デーモンにまで到達し得た。修正は 1.0.45 / 1.3.21。問題は認証アルゴリズムの強度ではなく、リクエストの認可が「パス末尾の文字列」という表層シグナルで判定され、実行の前に独立検証されなかったことにある。

---

## 2. 何が起きたか

- **対象**: Kestra（オープンソースのイベント駆動オーケストレーション基盤）。データパイプライン・ワークフロー・各種ジョブの自動実行に用いられる
- **識別子**: CVE-2026-53576（GitHub Security Advisory: GHSA-2q47-568g-9h4f）
- **深刻度**: CVSS 3.1 で 10.0（Critical）。ベクター `AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`。CWE-94（コードインジェクション）＋ CWE-288（代替経路による認証バイパス）。SSVC = Exploitation: PoC、Automatable: yes、Technical Impact: total
- **公開日**: 2026-06-26（GitHub_M がアサイン、CISA ADP が 2026-06-29 に補強）。本 Brief 作成時点で「実環境での悪用」報告ではなく脆弱性開示の段階
- **悪用の核心**: Kestra はリソースを呼び出し側が選ぶ URL パスセグメントで指定する（例: `/api/v1/{tenant}/flows/{namespace}`）。攻撃者はパスの最終セグメントに文字列 `configs` を選ぶだけで Basic 認証を完全に回避できる。バイパスは flow-create / execution-trigger ルートに届くため、未認証の攻撃者が Shell または Process タスクを含む flow を作成・実行する
- **影響の連鎖**: タスクは Kestra コンテナ内で root として実行される。公式 `docker-compose.yml` は `/var/run/docker.sock` をマウントするため、コンテナ内 root がホストの Docker デーモンに到達し、ホストレベルの侵害に至り得る
- **影響バージョン**: 1.0.45 未満、および 1.1.0 以上 1.3.21 未満。修正版は 1.0.45 と 1.3.21

事象は次の連鎖で成立している。

1. **パス末尾による公開判定**: Kestra の REST API 認証フィルタ `@Filter("/api/v1/**")` が、パス末尾 `/configs` を公開設定エンドポイントと判定し、認証をスキップする
2. **末尾セグメントの偽装**: Kestra はリソースを呼び出し側指定の URL パスセグメントで扱うため、攻撃者は本来保護されたパスの最終セグメントに文字列 `configs` を付けるだけで Basic 認証を回避する
3. **保護ルートへの到達**: バイパスが flow-create（ワークフロー作成）と execution-trigger（実行トリガ）に届く。未認証のまま、これらの特権操作に到達できる
4. **悪性 flow の作成・実行**: 攻撃者が Shell または Process タスクを含む flow を作成し、実行をトリガする
5. **root での実行**: 作成されたタスクが Kestra コンテナ内で root として実行される
6. **ホストへの到達**: 公式 `docker-compose.yml` が `/var/run/docker.sock` をマウントしているため、コンテナ root がホストの Docker デーモンを操作でき、ホストレベルの侵害に拡大し得る

---

## 3. 時系列 — 公表と対応

- 2026-06-09: CVE-2026-53576 が予約される（dateReserved）
- 2026-06-26: GitHub Security Advisory GHSA-2q47-568g-9h4f として公開。NVD にも登録（CVSS 10.0）。修正版 1.0.45 / 1.3.21 が提供
- 2026-06-29: CISA ADP（Vulnrichment）が SSVC を補強（Exploitation: PoC、Automatable: yes、Technical Impact: total）
- 本 Brief 作成時点: NVD は「Undergoing Analysis」。実環境での悪用は確認報告の段階を注視

> 注: 技術的事実は GitHub Security Advisory（GHSA-2q47-568g-9h4f）および NVD/CIRCL の登録に基づく。本 Brief 作成時点で公開されているのは脆弱性開示と PoC 段階の評価であり、実環境での大規模悪用を断定しない。最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **Kestra（kestra-io）**: GitHub Security Advisory GHSA-2q47-568g-9h4f を公開し、修正版 1.0.45 / 1.3.21 を提供。認証フィルタのパス判定を修正
- **NVD / CIRCL**: CVE-2026-53576 を CVSS 10.0 で登録。CWE-94（コードインジェクション）＋ CWE-288（代替経路による認証バイパス）に分類
- **CISA ADP（Vulnrichment）**: SSVC を補強（Exploitation: PoC、Automatable: yes、Technical Impact: total）。自動化された悪用が容易で技術的影響が全面的である点を可視化
- **運用上の論点**: 公式 `docker-compose.yml` が `/var/run/docker.sock` をマウントする既定構成のため、コンテナ侵害がホスト侵害に直結し得る。socket マウントの最小化・コンテナ権限の絞り込み・即時のバージョン更新が緊急対応として共有された
- **業界横断の論点**: オーケストレーション／エージェント基盤で「認証の判定を、攻撃者が操作できるリクエストの表層属性に依存させない」設計と、行動ごとの権限の独立検証が、基盤の安全性を左右する論点として再認識された

---

## 4. なぜ止まらなかったか

中心的な失敗 primitive は、**リクエストの認可が「パス末尾の文字列」という表層シグナルで判定され、その要求が本当に公開対象か（呼び出し側に権限があるか）を実行の前に独立検証していなかった**点にある。認証フィルタは「このパスは公開だから通す」と判定したが、「この呼び出し側は、この flow-create / execution-trigger を実行する権限を持つか」を確かめなかった。認可の根拠が、検証可能な権限の証明ではなく、攻撃者が自由に選べる URL の見た目に置かれていた。

本事案は [Brief No.003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（Starlette / BadHost、MCP サーバーの認証が Host ヘッダー操作で回避された）と同型である。いずれも「認証の判定が、攻撃者の制御下にあるリクエストの表層属性（Host ヘッダー／パス末尾）に依存し、行動の前に権限が独立検証されなかった」構造だ。[Brief No.046](https://lemma.frame00.com/ja/critical/briefs/046-servicenow-unauthenticated-api/)（ServiceNow、設定ひとつで認証が外れ未認証のまま顧客インスタンスが照会された）とは、認証の有無が表層の設定・判定で切り替わり、未認証の到達がそのまま特権操作になった点で連なる。[Brief No.066](https://lemma.frame00.com/ja/critical/briefs/066-litellm-ai-gateway-privilege-escalation/)（LiteLLM、一般ユーザー権限のまま AI ゲートウェイの管理者権限とサーバーのコード実行に到達）・[Brief No.027](https://lemma.frame00.com/ja/critical/briefs/027-librechat-mcp-url-secrets/)（LibreChat、ユーザー指定の MCP URL からサーバーの秘密情報が漏れた）とは、オーケストレーション／ゲートウェイ基盤において「到達＝実行」になり、権限の事前検証層が欠けていた点で同じ系列にある。

Kestra のようなオーケストレーション基盤は、ソフトウェアエージェントやデータパイプラインに「行動を実行する権限」を集約する層であり、その認可が破られると、基盤が束ねる全ての実行権限が攻撃者に渡る。flow の作成・実行という「行動」ごとに、それを要求する主体の権限が独立検証されて初めて、オーケストレーション基盤を実務に安心して載せられる。

脆弱性の早期開示、CVSS/SSVC による深刻度評価、修正版（1.0.45 / 1.3.21）の提供、CISA ADP による補強は、影響範囲の把握と緊急パッチ適用の判断に不可欠であり、本 Brief がその役割を否定するものではない。署名ベースの検知や WAF ルールも、既知のバイパスパターンの観測には寄与する。検出は確かに役割を果たす。

一方で、検出は受信側（リクエストを処理する Kestra の認証フィルタ、flow を実行するランタイム）が「どの要求を、誰の権限で accept するか」自体を変えない。本事案では、パス末尾 `configs` を持つリクエストは認証フィルタの判定を正規に通過したため、未認証の要求が flow-create / execution-trigger に到達した。欠けていたのは「この呼び出し側は、この特権操作を実行する権限を持つか」を実行の前に独立検証する層であり、これはパスの形式的判定とは別系統の検証である。異常検知が実行の後に発火しても、フィルタが accept した時点の root 実行は止まらない。監査で「この flow 実行は、正規の認可された主体によるものか」を立証する材料として、リクエストが認証フィルタを通過したという事実だけでは、呼び出し側の権限の独立した証跡にならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、特権操作（flow の作成・実行）の前に、それを要求する主体の権限を、パスの形式的判定とは切り離して独立検証可能な形で確認する。権限の証明が伴わなければ、リクエストがどんなパスを持っていても実行を事前に block する。認証フィルタの通過（detection 的な「このパスは通る」）と、呼び出し側権限の事前証明（「この主体はこの flow を実行する権限を持つ」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、オーケストレーション基盤での自動実行を安心して実務に出せる。

本事案で露呈した検出と証明の落差（リクエストの認可がパス末尾の文字列で判定され、行動の前に権限が独立検証されない）に対し、Lemma は以下の設計を提示する。

- **行動ごとの権限の事前証明**: flow の作成・実行のような特権操作の前に、それを要求する主体の権限を、URL パスやヘッダーの形式的判定とは切り離して独立検証し、証明が伴わなければ実行を事前に reject する（proof-as-auth）
- **表層シグナルへの非依存**: 認可の根拠を、攻撃者が自由に選べるパス末尾・ヘッダーなどの表層属性に置かず、検証可能な権限の証明に置く
- **実行物の来歴固定**: 実行される flow / タスクの来歴を改ざんできない形で固定し、未認証で注入された実行物を認可経路から排除する
- **選択的開示**: 主体の権限属性そのものを開示せずに、「この主体はこの操作を実行する権限を持つ」ことだけを最小開示で証明する

検出（事後のパッチ適用・異常検知・深刻度評価）は被害の是正に、事前証明（特権操作の前の権限の独立検証）はオーケストレーション基盤の信頼確立に、それぞれ相補的に働く。

---

## 6. Sources

- **GitHub Security Advisory**: GHSA-2q47-568g-9h4f “Kestra: Unauthenticated RCE via /configs path-suffix auth-filter bypass” — <https://github.com/kestra-io/kestra/security/advisories/GHSA-2q47-568g-9h4f>
- **NVD**: CVE-2026-53576 — <https://nvd.nist.gov/vuln/detail/cve-2026-53576>
- **CIRCL Vulnerability-Lookup**: CVE-2026-53576（CVSS 10.0、SSVC、CWE-94/288）— <https://vulnerability.circl.lu/vuln/cve-2026-53576>
- **Help Net Security**: agentic AI セキュリティ失敗の文脈（OWASP、2026-06-11）— <https://www.helpnetsecurity.com/2026/06/11/owasp-prompt-injection-ai-security-failures/>

参照: [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)、[「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/#authority)、[Trust402](https://lemma.frame00.com/ja/trust402/)
