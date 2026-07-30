---
brief_no: 70
title: "Unitree（UniPwn）：全機が同じ鍵を共有していたため、1 台の乗っ取りが機体群ごと崩せた — per-device の identity がなく、共有された 1 つの秘密が機体群全体の信頼を兼ねていた構造（Alias Robotics）"
title_en: "Unitree (UniPwn): one shared key across the fleet — per-device identity absent, so one compromise broke the whole fleet (Alias Robotics)"
pillar: "03-agent-authority"
primary_category: "identity-auth"
secondary_categories: ["agent-infrastructure", "attribute-proof-bypass"]
incident_date: 2025-09-20
published: 2026-06-19
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["068-universal-robots-polyscope-command-injection", "033-f5-bigip-edge-pivot", "003-starlette-badhost", "006-google-api-key-revocation-lag", "025-mcp-stdio-config-to-command-rce"]
status: draft
version: "1.0"
og_lead_ja: "全機共通の鍵で 1 台の乗っ取りが機体群ごと崩せた — Unitree / UniPwn"
og_lead_en: "One shared key let a single takeover collapse the whole fleet — Unitree / UniPwn"
gap_detected: "研究者による責任ある開示、ファームウェア更新や鍵管理の見直し、ネットワーク分離は周知・実施できた。"
gap_missing: "「いま接続してきた相手は、この機体ごとに固有の本人性に照らして正当か」を動作の前に確かめる層が無く、全機共通の合言葉は素通りした。"
gap_fix: "操作の前に「この機体は固有に正当な相手と向き合っており、この操作は認可の範囲内である」ことを Lemma で独立検証して、事前に防ぐ。"
---

## 1. TL;DR

Alias Robotics らが、Unitree の人型・四足ロボットを Bluetooth 初期設定から乗っ取る手法「UniPwn」を公開した。全機が同じ 1 本の鍵を共有しており、合言葉を送れば認証を通過し、送り込んだプログラムを最上位権限で実行できた。鍵が全機共通ゆえ 1 台の手口が他機にも通用し、自己伝播しうる。機体ごとの identity がなく、1 つの共有秘密が機体群全体の信頼を兼ねていた。検出と事前証明は代替でなく補完である。

---

## 2. 何が起きたか

- **対象**: Unitree の人型ロボット G1・H1、四足ロボット Go2・B2。米国でも普及価格帯で販売される普及機を含む
- **公表主体**: 独立研究者 Andreas Makris（Bin4ry）・Kevin Finisterre・Konstantin Severov が発見・公開（exploit 名「UniPwn」）。Alias Robotics（Víctor Mayoral-Vilches）が解析論文を公表（arXiv:2509.14139）
- **CVE 採番**: 主要なものに CVE-2025-35027（SSID/パスワードに偽装した入力のコマンドインジェクション→root 実行）、CVE-2025-60250（BLE の暗号鍵・IV がハードコードで全機共通）、CVE-2025-60251（ハンドシェイクが復号後に `unitree` の部分文字列を含めば受理）。ほかに CVE-2025-60017 を含む
- **手口の核心**: Wi-Fi 接続のための BLE 初期設定（プロビジョニング）インターフェースが、送られてきた入力を検証しない。**全機が同一のハードコード AES 鍵を共有**しており、文字列 `unitree` をその鍵で暗号化して送れば「認証済みユーザー」として扱われる。続いて Wi-Fi の SSID・パスワードに偽装したコードを送ると、ロボットは接続試行時にそれを検証なしに **root 権限で実行**する
- **必要だったもの**: BLE の近接と、機体から抽出できる「全機共通」の鍵だけ。機体ごとに固有の本人性検証は存在しなかった
- **fleet 規模の波及**: 鍵が全機共通のため、1 台の侵害手法がそのまま他機に通用する。攻撃者は認証情報の変更やリモートアカウント追加で支配を維持でき、近接する機体へ自己伝播しうる（wormable な botnet 化の懸念）
- **設定暗号の弱さ**: 設定ファイルの保護も、全機同一の 128bit 鍵（ソフトウェアから復元可能）に依存。外層は反復パターンの出る脆弱なモードの Blowfish、内層も予測可能な生成器ベースで、1 台の解読が全機の解読につながる
- **付随事項（文脈）**: ネットワーク解析では、機体が利用者への通知・同意なく外部サーバー（中国所在と報告）へ定期送信し、一部経路は TLS 証明書検証を無効化していた。本 Brief はこの送信先の地理ではなく、**送信・接続が独立検証・同意なく行われる構造**を論点とする

本事象は、機体ごとに固有の本人性がなく、全機共通の秘密が初期設定の認証を兼ねていたために、1 台の侵害手法が機体群全体へ波及する構造を示す。経路は以下の通り。

1. **BLE 近接**: 攻撃者が、対象ロボットの BLE 初期設定インターフェースに近接して接続する
2. **共有鍵での認証通過**: 文字列 `unitree` を全機共通のハードコード鍵で暗号化して送ると、「認証済みユーザー」として受理される。機体ごとに固有の本人性検証は働かない
3. **検証なき root 実行**: Wi-Fi の SSID・パスワードに偽装して送り込んだコードを、ロボットが接続試行時に検証なしに root 権限で実行する
4. **支配の維持**: 攻撃者が認証情報の変更やリモートアカウント追加で支配を保持する
5. **fleet への波及**: 鍵が全機共通のため、同じ手法が他機にも通用し、近接機へ自己伝播しうる（wormable）。設定暗号も全機同一鍵のため、1 台の解読が全機の解読につながる

---

## 3. 時系列 — 公表と対応

- 2025-05: 研究者が Unitree へ責任ある開示を開始（以後、対応は限定的と報告）
- 2025-09-20: 研究者が UniPwn を一般公開（BLE 近接＋共有鍵で root 取得、fleet 波及・wormable 性を指摘）
- 2025-09〜10: Alias Robotics が解析論文（arXiv:2509.14139）と、監視・攻撃の二つのケーススタディを公表。確立メディアが報道
- 以降: 機体ごとの固有鍵・per-device identity、初期設定経路の入力検証、テレメトリの同意・検証の必要性が業界で論点化

> 注: 本 Brief が扱うのは UniPwn が示した脆弱性と構造であり、悪用主体・国籍の断罪ではない。送信先の地理は文脈として一行触れるに留め、分析は per-device identity と入力検証の不在に限定する。検証できない主張は採らない。

公表後の対応と業界の動きは次のとおり。

- **研究者 / Alias Robotics**: UniPwn の手法と fleet 波及・wormable 性を公開し、解析論文（arXiv:2509.14139）で監視・攻撃の二ケーススタディを提示。業界横断で実体エージェントの設計上の問題を可視化
- **per-device identity の要請**: 全機共通のハードコード鍵ではなく、機体ごとに固有で独立検証可能な本人性（鍵・証明書）と、初期設定経路の入力検証の必要性が論点に
- **テレメトリの同意・検証**: 利用者への通知・同意なく外部送信が行われ、一部経路で TLS 証明書検証が無効化されていた点から、送信・接続の独立検証と同意取得が論点化（送信先の地理ではなく、検証・同意の構造が論点）
- **業界横断の論点**: 家庭・工場・公共空間に入る自律機が増える中、実体エージェントの本人性・命令認可をどう機体ごとに独立検証するかが安全要件として共有されつつある。[Brief 068](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/) と合わせ、ソフトウェア／物理を問わずエージェントの権限証明が必要という認識が広がっている

実体エージェントの本人性を「全機共通の秘密」ではなく「機体ごとに固有で独立検証される証明」として設計する不在は、特定メーカーの問題ではなく、自律機を社会に迎え入れる産業横断の課題として共有されつつある。

---

## 4. なぜ止まらなかったか

中心的な<strong>失敗 primitive は「実体エージェントに per-device の identity（機体ごとに固有で独立検証できる本人性）がなく、共有された 1 つのハードコード秘密が機体群全体の認証を兼ねていた」</strong>点にある。「全機が同じ鍵を持つ」とは、1 台の信頼と機体群の信頼が分離されていないことを意味し、1 台の侵害がそのまま fleet の侵害になる。さらに初期設定経路は、その共有秘密で「認証済み」とされた相手の入力を検証なく root 実行した。

[Brief 068](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/)（Universal Robots PolyScope、命令の送り手の権限を物理動作の前に検証しない産業用ロボット）の姉妹事例であり、対エージェントの物理クラスタを成す。068 が「命令の認可検証が経路上に存在しない」事例だったのに対し、本事案は **認証は存在するが、それが全機共通の単一秘密で、機体ごとの固有性・独立検証を欠く**点が異なる。[Brief 033](https://lemma.frame00.com/ja/critical/briefs/033-f5-bigip-edge-pivot/)（暗黙に信頼された一点の侵害が、保存資格情報ごと全体へ横展開した）とは、信頼された一点（共有鍵）の突破が機体群全体へ連鎖する構造で同根。[Brief 006](https://lemma.frame00.com/ja/critical/briefs/006-google-api-key-revocation-lag/)（認証情報の失効属性が独立検証されず削除後も有効だった）とは、認証情報の属性（ここでは「機体ごとに固有か」）が独立検証されない点で、[Brief 003](https://lemma.frame00.com/ja/critical/briefs/003-starlette-badhost/)（Host ヘッダー操作で認証が回避された）・[Brief 025](https://lemma.frame00.com/ja/critical/briefs/025-mcp-stdio-config-to-command-rce/)（設定→コマンド実行が広範な RCE 経路になった）とは、認証・設定経路の入力が検証なく特権側に通る点で連なる。

本事案がとりわけ際立たせるのは、**実体エージェントの「本人性」をどう独立検証するか**という問いだ。家庭・工場・公共空間に入る自律機が増えるほど、機体は単なる製品ではなく、行動の主体（agent）になる。その主体の本人性が機体ごとに固有でなく、全機共通の秘密に集約されていれば、1 台の綻びが機体群全体の信頼を崩す。機体ごとに固有で独立検証可能な identity が備わって初めて、自律機を生活・業務の空間に安心して迎え入れられる。

研究者による責任ある開示、ファームウェア更新や鍵管理の見直し、ネットワーク分離は、露出の抑止に不可欠であり、本 Brief がその役割を否定するものではない。脆弱性の可視化と修正の促進は、被害を未然に防ぐ重要な歯止めである。

一方で、ファームウェア更新やネットワーク監視は、機体側が「いま初期設定経路に接続してきた相手は、この機体を正当に設定・操作できる主体か」を、**動作の前に**機体ごとの本人性に照らして独立検証する材料にはならない。本事案の中核は、認証が全機共通の単一秘密に依存し、機体ごとの固有性・独立検証が存在しなかったことにある。共有鍵が一度抽出されれば、どの機体も同じ手法で通過でき、近接機へ波及する。事後のトラフィック解析は「どの機体が何を送ったか」を再構成するが、「その設定・命令は、この機体に対する正当な権限に基づくか」を行動の前に独立検証する材料にはならない。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-execution attestation）は、機体の本人性と、それに対する命令の認可を、「全機共通の秘密の提示」ではなく「機体ごとに固有で独立検証可能な証明」として扱う設計を採る。初期設定・運転・更新のような特権操作を、機体固有の identity と付与者の認可に対して行為の時点で検証すれば、共有秘密の抽出だけでは認証は通らず、1 台の綻びが機体群へ波及する経路を断てる。露出の検出（detection 的な「どの機体が何をしたか」）と、本人性・認可の証明（「この機体に対する正当な権限に基づくか」）は代替ではなく **補完** の関係にあり、両者が重なって初めて、自律機を生活・業務の空間に安心して迎え入れられる（行為の時点で認可を独立検証する考え方は [「Proof-as-Auth: 鍵を一度も送らずにサインインする」](https://lemma.frame00.com/ja/blog/proof-as-auth-sign-in-without-sending-your-key/)（Lemma、2026-05）、検出と事前証明の thesis は [「AI 時代のサイバー防衛に残された、最後の層」](https://lemma.frame00.com/ja/blog/detection-is-not-proof/)（Lemma、2026-05）を参照）。

本事案で露呈した検出と証明の落差（実体エージェントに per-device の identity がなく、共有された 1 つの秘密が機体群の信頼を兼ねていた）に対して、Lemma は、エージェント——ソフトウェアか実体かを問わず——の本人性と行動を、「共有秘密やトークンの提示」ではなく「固有で独立検証可能な証明」として裏づける設計を提示している。

- **per-device の identity**: 機体ごとに固有で独立検証可能な本人性を与え、1 台の信頼と機体群の信頼を分離する。共有された単一秘密の抽出が fleet 全体の突破に直結する構造を断つ
- **行動ごとのスコープ認可（proof-as-auth）**: 初期設定・運転・更新のような特権操作を、機体固有の identity と付与者の認可に対して行為の時点で独立検証する。共有秘密の提示では満たせない、操作ごとの証明に置き換える（[Brief 068](https://lemma.frame00.com/ja/critical/briefs/068-universal-robots-polyscope-command-injection/) の物理命令認可と接続）
- **入力・経路の完全性**: 初期設定経路やテレメトリ経路で受け取る入力・接続の出所を独立検証可能にし、検証なき root 実行や証明書検証を欠いた接続を、実行・確立の前に弾く
- **選択的開示**: 内部データを出さずに、「この機体は固有の正当な主体であり、この操作は認可の範囲内である」ことだけを最小開示し、独立検証と機体・利用者情報の保護を両立する

これにより、行為の時点で固定された証明が、「この機体は固有に正当か、この操作は認可の範囲内か」を、事後のトラフィック解析に依存せず独立検証可能なトレイルとして機能させる。検出（事後の解析・更新・分離）は露出の是正に、事前証明（機体固有の本人性・認可の独立検証）は実体エージェントの信頼確立に、それぞれ相補的に働く。設計と適用範囲は、[Pillar 03 — エージェント権限証明](https://lemma.frame00.com/ja/pillars/agent-authority-proof/) および [Trust402](https://lemma.frame00.com/ja/trust402/) を参照のこと。

---

## 6. Sources

- **Alias Robotics / 研究者（一次・解析論文）**: “Cybersecurity AI: Humanoid Robots as Attack Vectors”（UniPwn、共有ハードコード鍵・BLE root 取得・fleet 波及、arXiv:2509.14139）— <https://arxiv.org/abs/2509.14139>
- **NVD（CVE）**: CVE-2025-35027（コマンドインジェクション→root 実行。関連: CVE-2025-60250 / 60251 / 60017）— <https://nvd.nist.gov/vuln/detail/CVE-2025-35027>
- **Help Net Security**: “Humanoid robot found vulnerable to Bluetooth hack”（2025-10-16、手口と影響の概説）— <https://www.helpnetsecurity.com/2025/10/16/unitree-g1-humanoid-robot-vulnerability/>
- **IEEE Spectrum**: “Unitree Robot Hack: What You Need to Know” — <https://spectrum.ieee.org/unitree-robot-exploit>
- **Hackaday**: “Unitree Humanoid Robot Exploit Looks Like A Bad One”（2025-09-30） — <https://hackaday.com/2025/09/30/unitree-humanoid-robot-exploit-looks-like-a-bad-one/>
