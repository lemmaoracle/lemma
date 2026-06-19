---
brief_no: 33
title: "1 台のエッジ機器の侵害が、ドメイン全体の侵害に連鎖した — 社内で暗黙に信頼された F5 BIG-IP が、保存された資格情報ごと横展開の足場になった"
title_en: "One Edge Appliance Compromise Cascaded to Full Domain Takeover — An Implicitly Trusted F5 BIG-IP Became the Pivot, Along With the Credentials It Stored"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2026-05-22
published: 2026-06-08
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["006-google-api-key-revocation-lag", "029-github-dev-oauth-token", "003-starlette-badhost"]
version: "1.0"
status: published
og_lead_ja: "1 台のエッジ機器の侵害がドメイン全体へ連鎖 — F5 BIG-IP"
og_lead_en: "One edge-appliance compromise cascaded to full domain takeover — F5 BIG-IP"
gap_detected: "脅威リサーチによる攻撃チェーンの可視化や、危険な機器の露出観測・パッチ対象の特定はできた。"
gap_missing: "横展開の各段階で「この認証情報の持ち主は、この行動をこの範囲で行う認可を持つか」を行動の前に確かめる層が無く、盗まれた認証情報の保有がそのまま権限として通用した。"
gap_fix: "鍵や認証情報の保有ではなく「この行動が、スコープされた認可と来歴を持つ」ことを Lemma で独立検証して、事前に防ぐ。"
---

## TL;DR

セキュリティ企業 Microsoft が、インターネットに面した 1 台のネットワーク機器（F5 BIG-IP）の侵害が、社内の Linux サーバー・社内ツール・認証基盤を経て、最終的に組織のドメイン全体の乗っ取りまで連鎖した攻撃の全体像を公開した。きっかけは、サポート期限切れでパッチが出なくなっていた機器への侵入である。被害が広がった本質は、外部に露出して監視も薄い機器が、社内では「信頼された装置」として扱われ、そこに保存されていた認証情報ごと攻撃者の手に渡った点にある。以降の各段階は、行動ごとに認可を確かめるのではなく、ネットワーク上の位置と手元の認証情報を信頼してそのまま通された。

---

## 1. 事案概要

- **対象**: エンタープライズ環境(インターネット面の F5 BIG-IP エッジ機器を持つ組織)
- **公開**: 2026-05-22、Microsoft Threat Intelligence が攻撃チェーンを公開
- **初期侵入**: Azure 上の F5 BIG-IP Virtual Edition(VE、15.1.201000。Azure ARM テンプレート / Terraform でよく provisioning されるクラウド配備ビルド)への SSH アクセス。当該バージョンは 2024-12-31 に EOL となり、侵害時点でパッチ供給・サポート外だった
- **連鎖**: 侵害したエッジ機器 → 最初の Linux ホストへ SSH → 横展開して内部 Atlassian Confluence サーバー・Windows 認証基盤 → ドメインレベルの侵害(Active Directory)
- **悪用された CVE**:
  - **CVE-2025-53521**(F5 BIG-IP APM): 2025-10 に DoS として公開後、2026-03 に RCE(CVSS 9.8)へ再分類。CISA は 2026-03-27 に KEV へ追加。Shadowserver は当時 17,000 超の脆弱な IP を観測
  - **CVE-2025-33073**(Windows SMB NTLM reflection): 2025-06 に RedTeam Pentesting / Synacktiv が公開。管理者権限の前提を取り除き、SMB 署名が強制されていない任意のドメイン参加マシン上で、ネットワーク到達性と**任意の有効なドメイン資格情報**だけで SYSTEM としての認証付き RCE を成立させる
- **核心**: エッジ機器は外部露出・低監視でありながら社内で暗黙に高信頼に扱われ、1 台の侵害が、保存された資格情報・証明書・ID 統合ごと、永続的で可視性の低い足場を攻撃者に渡した

---

## 2. タイムライン

- 2024-12-31: F5 BIG-IP VE 15.1.x がEOL。以後パッチ供給・サポート外
- 2025-06: CVE-2025-33073(SMB NTLM reflection)を RedTeam Pentesting / Synacktiv が公開
- 2025-10: CVE-2025-53521 が F5 BIG-IP APM の DoS として公開
- 2026-03: CVE-2025-53521 が RCE(CVSS 9.8)へ再分類
- 2026-03-27: CISA が CVE-2025-53521 を KEV へ追加。Shadowserver が 17,000 超の脆弱 IP を観測
- 2026-05-22: Microsoft Threat Intelligence が、F5 BIG-IP を起点とする多段 Linux 侵入の全チェーン(F5 / Confluence 経由)を公開

---

## 3. 攻撃ベクター

1. **エッジ機器への初期侵入**: インターネット面の EOL F5 BIG-IP VE へ SSH アクセスを確立(関連 CVE-2025-53521 の RCE 等、パッチ未適用の機器が標的)
2. **トラステッドな足場の獲得**: エッジ機器に保存された資格情報・証明書・ID 統合を取得。機器が社内で高信頼に扱われるため、低可視性のまま内部到達性を得る
3. **Linux ホストへの横展開**: F5 BIG-IP(ロードバランサ)から最初の Linux ホストへ SSH で移動
4. **内部サービスへの拡大**: 内部 Atlassian Confluence サーバー・Windows 認証基盤へ横展開
5. **ドメイン侵害**: CVE-2025-33073(SMB NTLM reflection)を用い、有効なドメイン資格情報だけで管理者権限なしに SYSTEM RCE を成立させ、Active Directory レベルの侵害に到達

---

## 4. 構造的論点

本事案は Pillar 03(エージェント権限証明)を「AI エージェントに限らないアクター一般の権限・ID の証明」として読む観点に属する。中心的な失敗 primitive は、**横展開の各ホップが、行動ごとに認可を証明させるのではなく、ネットワーク上の"位置"と"保存された資格情報"への暗黙の信頼で受理された**点にある。secondary に `agent-infrastructure`(エッジ機器・ID 統合という基盤)と `attribute-proof-bypass`(資格情報という属性が真正性検証なく通用)を併記する。

エッジ機器の信頼モデルが核心である。BIG-IP のような機器は外部に露出しながら社内では「境界の内側の信頼された装置」として扱われ、資格情報・証明書・ID 統合を保持する。この二重性——外から狙いやすく、中では強く信頼される——が、1 台の侵害をドメイン全体の侵害へ増幅した。CVE-2025-33073 が示すのは、ドメイン内の認証が「有効な資格情報を持つ=正規のアクター」という前提に立ち、その資格情報が**どの行動を・誰の認可で行ってよいか**を行動ごとに証明させていないことである。reflection によって、資格情報の保有が即座に SYSTEM 権限へ転化した。

Brief 006(Google API キーの失効という属性が独立検証されず、削除後も有効だった)と同系で、資格情報・属性の状態が信頼の前提にされるのに独立検証されない構造である。Brief 029(github.dev の OAuth トークンが操作対象にスコープされず全リポジトリに有効)とも、「いったん得た資格情報が、行動の範囲に縛られず横断的に通用する」点で同根。本事案は、その primitive が**エッジ機器という物理に近い信頼境界**で、エンタープライズの AD 全体へ波及した実地事例である。

---

## 5. 検出と証明の落差

Microsoft Threat Intelligence による攻撃チェーンの可視化、CISA の KEV 追加、Shadowserver の露出観測、EOL 機器のパッチ・置換は、被害把握・封じ込め・再発防止に不可欠であり、本 Brief がその役割を否定するものではない。露出した EOL 機器の特定とパッチ適用は最優先の実務対応である。

一方で、検出は「各ホップで、その行動を認可してよいか」自体を変えない。本事案の横展開は、正規の SSH・有効なドメイン資格情報・正規の認証フローを通じて進み、各操作は単体では正常に見える。エッジ機器の侵害は外部露出・低監視ゆえに発火が遅れ、検知された時点では資格情報・証明書が既に攻撃者の手にあった。欠けていたのは「この資格情報の保有者は、この行動を・この範囲で行う認可と来歴を持つか」という行動時点の独立検証であり、これはネットワーク監視や事後のログ追跡とは別系統である。NTLM reflection が示すように、資格情報の保有が認可の証明と同一視される限り、検出は侵害の後追いにならざるを得ない。

事前証明(pre-execution attestation)は、認証を「資格情報を持っているか」から「この行動が、スコープされた認可と来歴を持つかの実行前検証」へと反転させる設計を採る。鍵や長期資格情報を送る代わりに、行動ごとに検証可能でスコープされ再利用不能な proof を提示させることで、エッジ機器から盗まれた資格情報や reflection で得た権限があっても、proof が「この行動は正規の認可・来歴を欠く」と告げれば実行は事前に block される。資格情報の検出(detection 的な「これは有効な資格情報か」)と行動の事前証明(「この行動は認可・来歴を持つか」)は代替ではなく**補完**の関係にある。

---

## 6. 対応経緯と業界動向

- **Microsoft Threat Intelligence**: 全攻撃チェーンを公開し、エッジ機器の二重性(外部露出・低監視・社内高信頼)が単一侵害をドメイン侵害へ増幅する構造を明示
- **F5 / CISA**: CVE-2025-53521 は DoS から RCE(CVSS 9.8)へ再分類され CISA KEV に追加。EOL 機器(BIG-IP VE 15.1.x)の継続運用がパッチ不能のまま露出を残す問題が再認識された
- **業界横断の論点**: エッジ機器・ID 統合・保存資格情報を「境界の内側の信頼された装置」として扱う前提が、横展開の増幅器になる。資格情報の保有を認可の証明と同一視せず、行動ごとにスコープされた認可・来歴を検証する(proof-as-auth / per-action attestation)方向へ、エンタープライズのアイデンティティ設計の重心を移す議論が進んでいる。EOL 機器の棚卸しとクラウド配備(ARM/Terraform)の構成管理も実務上の論点

---

## 7. Lemma による分析

本事案で露呈した構造(横展開の各ホップが、行動ごとの認可証明ではなく位置的信頼と保存資格情報への暗黙信頼で受理される)に対して、Lemma は、認証を「資格情報の保有」から「行動ごとのスコープされた認可・来歴の実行前証明」へ反転させる設計を提示している。鍵や長期資格情報を送らずに proof を提示する proof-as-auth の考え方では、エッジ機器から盗まれた資格情報や reflection で得た権限があっても、正規の認可・来歴の proof が成立しなければ行動は事前に reject される。

---

## 8. Sources

- **Microsoft Security Blog (Microsoft Threat Intelligence)**: "From edge appliance to enterprise compromise: Multi-stage Linux intrusion via F5 and Confluence"(2026-05-22、全攻撃チェーン・初期侵入・横展開・CVE)— https://www.microsoft.com/en-us/security/blog/2026/05/22/from-edge-appliance-to-enterprise-compromise-multi-stage-linux-intrusion-via-f5-and-confluence/
- **CISA KEV**: CVE-2025-53521(F5 BIG-IP APM、2026-03-27 追加)— https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- **NVD**: CVE-2025-33073(Windows SMB NTLM reflection)— https://nvd.nist.gov/vuln/detail/CVE-2025-33073

---

## 9. Brief 配布について

本資料は公開情報の構造化分析であり、特定組織への監査・診断・推奨ではありません。

---

(c) 2026 FRAME00, INC. — Built for decisions that matter.
