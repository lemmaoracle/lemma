---
brief_no: 111
title: "Wanchain：署名メッセージの符号化が曖昧だったため、正規の署名 1 つが桁違いの払い出しに再利用された"
title_en: "Wanchain — a non-injective signed-message encoding let one legitimate signature be reused for a vastly larger withdrawal"
pillar: "01-verifiable-origin"
primary_category: "bridge-config-trust"
secondary_categories: ["data-provenance", "identity-auth"]
incident_date: 2026-07-20
published: 2026-07-28
authors: ["Lemma Critical Team"]
related_pack: ["A-incident-response"]
related_briefs: ["016-verus-ethereum-bridge", "107-verus-ethereum-bridge-repeat-exploit", "067-syscoin-bridge-spv-proof-parsing", "074-taiko-bridge-prover-key-leak", "108-afx-trade-validator-key-quorum"]
status: published
version: "1.0"
og_lead_ja: "Wanchain — 曖昧な署名符号化で正規署名が 6.5 万倍の払い出しに再利用"
og_lead_en: "Wanchain — ambiguous signing encoding let one signature move 65,000× more"
gap_detected: "BlockSec の予備解析が非単射な署名符号化を原因として特定し、オンチェーン調査で 4 回の払い出しを追跡、Wanchain がブリッジを停止、Midnight Foundation が影響範囲を切り分けた。"
gap_missing: "署名検証は「このバイト列に対する正しい署名か」を確かめるだけで、符号化が非単射なため「その署名が指す払い出しが唯一これであること」は払い出しの時点で検証されていなかった。"
gap_fix: "払い出しを実行する前に、署名対象が区切り・長さ識別子を備えた正準形式で符号化され、この 1 つの払い出しだけに不可分に束ねられていることを独立検証可能な証明として要求し、証明が伴わない払い出しを事前に拒否する。"
---

## 1. TL;DR

2026-07-20、Wanchain が運用する Cardano–BNB Chain ブリッジで、Cardano 側の準備金から約 5 億 1,520 万 NIGHT（およそ 1,000 万ドル）が 9 分・4 トランザクションで流出した。BlockSec の予備解析によれば、原因は暗号の突破でも署名鍵の窃取でもない。ブリッジの `TreasuryCheck` バリデータが、14 個の可変長フィールドを区切りも長さ識別子もなく連結して署名対象を構成していたため、符号化が非単射（non-injective）——異なる取引データが同じバイト列に化けうる状態だった。結果として、BNB Chain 上で約 3,110 NIGHT の移転を認可した正規の署名が、Cardano 側で 203,001,692 NIGHT（意図した額の 6 万 5,000 倍超）の払い出しに再利用可能になった。Cardano のコンセンサスも Wanchain のバリデータ秘密鍵も侵害されていない。突かれたのは、正しく生成された署名をブリッジがどう解釈したかである。

---

## 2. 何が起きたか

- **対象**: Wanchain が運用する Cardano–BNB Chain 間ブリッジ。Cardano 側の準備金（treasury）が払い出し元
- **流出**: 約 515.2 million NIGHT。4 回の払い出し（約 203M / 129.6M / 120.4M / 62.1M NIGHT、いずれも丸め値）がすべて同一の攻撃者ウォレットへ。損失評価額は評価時点により約 900 万〜1,300 万ドルの幅、広く報じられた値は約 1,000 万ドル
- **時間帯**: 2026-07-20 の 14:46–14:55 UTC（約 9 分）
- **原因（予備解析）**: 非単射な署名メッセージ符号化。`TreasuryCheck` バリデータ（Cardano 側のオンチェーン検証スクリプト。ブリッジのノード運用者＝署名者とは別物）が 14 個の可変長 redeemer フィールドを区切り・長さ識別子なしに `AppendByteString` で連結して署名対象を作っていたため、異なる取引データが符号化後に区別できなくなり得た（フィールド「12」+「3」と「1」+「23」が同じバイト列になる類の曖昧性）
- **再利用の具体**: BNB Chain 上で約 3,110 NIGHT を認可した正規署名が、Cardano 側の 203,001,692 NIGHT の払い出しに再利用された（意図額の約 6 万 5,000 倍）
- **侵害されていないもの**: Cardano のコンセンサス、Midnight のコアプロトコル、Wanchain の署名者（バリデータ）秘密鍵。トークンは新規発行（mint）ではなく、既存の準備金から移動された
- **影響の大きさ**: 流出前に Cardano 側アドレスにあった約 5 億 2,700 万 NIGHT のうち残余は約 1,200 万 NIGHT。BNB Chain 上の Wanchain-wrapped NIGHT を裏づける準備金の約 97.8% が失われた。NIGHT 価格は一時 30〜43%（出典により幅）下落して過去最安値付近（約 $0.016）に達し、その後 24 時間で約 19% 反発した。準備金内の他資産（Mynth・XER・WMT 等）は引き出されておらず、NIGHT が意図的に狙われた
- **状態**: Wanchain はブリッジを停止し調査中。Midnight Foundation は Midnight ブロックチェーン本体は無傷で、事象は Wanchain の第三者ブリッジ基盤に限局と表明

事象は次の連鎖で成立している。

1. **正規署名の入手**: 攻撃者は、BNB Chain 上で約 3,110 NIGHT の移転を認可する正規の署名（バリデータが正しく生成したもの）を起点に用いる
2. **符号化の曖昧性の悪用**: `TreasuryCheck` バリデータが署名対象メッセージを、14 個の可変長フィールドを区切り・長さ識別子なしで連結して構成していたため、フィールド境界が一意に定まらない。攻撃者は、同じバイト列に符号化される別の取引データ（桁違いに大きな払い出し）を構成できた
3. **署名の再利用**: 元の署名を、Cardano 側の 203,001,692 NIGHT という別の払い出しに対して有効なものとして提示する。署名検証は通る——署名自体は正しく、検証しているメッセージのバイト列が一致するため
4. **準備金の払い出し**: 4 トランザクションで準備金の約 97.8% を攻撃者ウォレットへ移す。バリデータの秘密鍵も、Cardano/Midnight のプロトコルも侵害せずに、である

---

## 3. 時系列 — 公表と対応

- 2026-07-20 14:46–14:55 UTC: Cardano 側準備金から 4 回の払い出しで約 515.2M NIGHT が攻撃者ウォレットへ流出
- 2026-07-21: BlockSec の予備解析と複数媒体の報道。非単射な署名符号化による署名再利用が原因と示される
- 2026-07-21 前後: Wanchain がブリッジを停止し調査を開始。Midnight Foundation が Midnight 本体・Cardano コンセンサスの無傷を表明。NIGHT 価格が急落後に一部反発
- 以降: Wanchain の最終ポストモーテム・補償方針は本稿執筆時点で未公表

> 注: 技術的事実は BlockSec の予備解析、およびそれを伝える確立メディア・分析（CoinDesk、The Crypto Times、blockchainreporter 等）に基づく。損失評価額（約 900 万〜1,300 万ドル）は評価時点により幅がある。原因分析は「予備（preliminary）」であり、Wanchain 自身の最終ポストモーテムで確定される見込み。最新の一次情報を参照されたい。

公表後の対応と業界の動きは次のとおり。

- **Wanchain**: ブリッジを停止し調査中。最終ポストモーテム・補償方針は本稿執筆時点で未公表
- **Midnight Foundation**: Midnight のプロトコル・バリデータネットワーク・コンセンサス等の本体、および Cardano は無傷で、事象は Wanchain の第三者ブリッジに限局と表明。主要取引所に協力を要請した
- **取引所の対応**: Midnight Foundation の要請を受け、Binance・OKX・Kraken・KuCoin・Bybit・Gate・MEXC の 7 取引所が攻撃者ウォレットのブラックリスト登録、関連アカウントの一時凍結、NIGHT の入出金停止を実施し、流出資金の移動を封じた
- **BlockSec / 調査コミュニティ**: 非単射な署名メッセージ符号化を予備的原因として特定し、Wanchain の署名鍵は侵害されていない（正規に生成された署名の再利用である）と分析。正準シリアライゼーション（区切り・長さ識別子の付与）の必要性を指摘
- **業界横断の論点**: 本件は「鍵を守れば安全」でも「proof を検証すれば安全」でもない、第三の失敗類型——**署名対象の符号化の一意性**を欠くと、正しい鍵・正しい署名のままで桁違いの認可が成立する——を具体化した。ブリッジ実装において、署名を「この一意な行動」に不可分に束ねる正準符号化と、その検証を払い出しの前提に置くことが要件として再認識される

「有効な署名を、それが認可する唯一の払い出しにどう不可分に束ねるか」は、本事案を契機にクロスチェーン・ブリッジ設計の要件として議論が進む見込み。

---

## 4. なぜ止まらなかったか

中心となる失敗 primitive は、**署名が有効かどうか（暗号的な正しさ）と、その署名が「この 1 つの払い出しだけを一意に認可している」こと（符号化の単射性）が、ブリッジの検証において分離していなかった**点にある。署名検証は「このバイト列に対する正しい署名か」を確かめるが、符号化が非単射であれば、異なる払い出しが同一バイト列に化けうる。つまりブリッジは「有効な署名がある」ことは確認したが、「その署名が指す払い出しが唯一これであること」は確認していなかった。これは鍵の管理や暗号アルゴリズムの問題ではなく、**署名対象の正準化（canonical serialization）＝来歴の一意性**の問題である。

この構造は、proof や署名が形式的に有効でも、それが認可する中身の整合が独立検証されないブリッジ事案の系譜に連なる。[Brief No.016](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)（[Verus-Ethereum ブリッジ](https://lemma.frame00.com/ja/critical/briefs/016-verus-ethereum-bridge/)、Merkle Proof は有効でも入出力額の整合が未検証）および [Brief No.107](https://lemma.frame00.com/ja/critical/briefs/107-verus-ethereum-bridge-repeat-exploit/)（[Verus 再侵害](https://lemma.frame00.com/ja/critical/briefs/107-verus-ethereum-bridge-repeat-exploit/)）とは「証明・署名の有効性と、それが認可する額の整合が別物」という点で同型。[Brief No.067](https://lemma.frame00.com/ja/critical/briefs/067-syscoin-bridge-spv-proof-parsing/)（[Syscoin ブリッジ](https://lemma.frame00.com/ja/critical/briefs/067-syscoin-bridge-spv-proof-parsing/)、偽の proof が解析の甘さで「有効」と解釈された）とは、検証系がバイト列の解釈で欺かれる点で近い。一方、[Brief No.074](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)（[Taiko ブリッジ](https://lemma.frame00.com/ja/critical/briefs/074-taiko-bridge-prover-key-leak/)、proof は正しく検証されたが署名鍵が漏洩）や [Brief No.108](https://lemma.frame00.com/ja/critical/briefs/108-afx-trade-validator-key-quorum/)（[AFX Trade](https://lemma.frame00.com/ja/critical/briefs/108-afx-trade-validator-key-quorum/)、バリデータ署名鍵の侵害でクォーラムを満たした）とは**対照的**である——本件は鍵の侵害を一切伴わず、正しく生成された署名の**解釈**だけで成立した。求められるのは、署名を「この一意な行動」に不可分に束ねる、正準で単射な符号化の独立検証である。

BlockSec の予備解析、オンチェーン調査者による払い出しの追跡、Wanchain によるブリッジの即時停止、Midnight Foundation による影響範囲の切り分けという検出・対応の系列は、被害の拡大抑止と原因究明に不可欠であり、本 Brief がその役割を否定するものではない。異常な払い出しはオンチェーンに刻まれ、事後に追跡・可視化できた。検出は確かに役割を果たす。

一方で、署名検証それ自体は、「いま検証しているこの署名が、唯一この払い出し（この額・この宛先）だけを認可しているか」を保証しない。符号化が非単射である限り、署名検証は「バイト列に対する正しい署名」を確認するだけで、そのバイト列がどの取引に一意対応するかを確認しない。異常検知や事後のオンチェーン追跡は、払い出しが起きてから相関として浮上したのであって、払い出しが実行される時点で「この署名が指す行動はこれ以外にない」ことを立証したわけではない。監査で「このブリッジ払い出しは、正規に認可された唯一の取引だったか」を立証する材料として、「有効な署名が存在した」という事実だけでは、認可された行動の一意性の証跡にならない。これは検出層の射程外にある、構造的に独立した層の落差である。

---

## 5. 証明があれば、何が変わるか

事前証明（pre-action attestation）は、払い出しを実行する前に、署名が正準で単射な符号化を通じて「この 1 つの払い出しだけ」に不可分に束ねられていることを、独立に検証可能な証明として要求する。具体的には、署名対象を長さ識別子付き・区切り付きの正準形式で符号化し、異なる取引が同一バイト列に化けないことを保証したうえで、その正準性の検証を払い出しの許可条件にする（proof-as-auth）。証明が伴わなければ払い出しを既定で拒否する（deny-by-default）。事前証明は署名検証の代替ではなく、「署名が有効か」に「署名が指す行動が一意か」を重ねる **補完** である。両層の組み合わせで、ブリッジの払い出しが認可された唯一の行動に対応することが担保される。

本事案で露呈した検出と証明の落差（署名の有効性は検証されたが、署名が指す払い出しの一意性＝符号化の単射性は検証されなかった）に対して、Lemma は、認可された行動を実行する前に、その行動が唯一のものとして証明可能に束ねられていることを要求する設計を提示している。

- **正準・単射な符号化の検証**: 署名対象を、区切り・長さ識別子を備えた正準形式で符号化し、異なる取引が同一バイト列に化けないことを検証可能にする。「有効な署名がある」ことに「その署名が指す行動はこれ以外にない」ことを重ねる
- **行動ごとの認可の deny-by-default（proof-as-auth）**: 払い出しを始める前に、署名が特定の額・宛先・チェーンに不可分に束ねられていることを証明させ、証明が伴わない払い出しを既定で拒否する。署名の有効性だけを払い出しの根拠にしない
- **来歴の一意性の固定**: 認可の対象（払い出しの中身）を、署名の時点で一意に固定し、後段での再解釈・再利用を成立させない
- **選択的開示**: 「この払い出しが正準な認可に対応する」ことだけを最小開示し、内部の鍵・資格情報は環境外に出さない

Lemma の主張の射程は、ブリッジの暗号や鍵管理を置き換えることではなく、署名・proof が認可する**行動の一意性と来歴**を、実行の前に独立検証可能な証跡として固定することにある。検出（事後のオンチェーン追跡・原因解析）は発覚後の是正に、事前証明（払い出し前の符号化・一意性の検証）は認可された行動の独立検証に、それぞれ相補的に働く。

---

## 6. Sources

- **The Crypto Times（BlockSec 予備解析を伝える技術解説）**: “The Signature Flaw Behind Wanchain's $10M NIGHT Exploit”（2026-07-22）— <https://www.cryptotimes.io/insights/wanchain-night-bridge-exploit-signature-flaw/>
- **CoinDesk**: “Midnight token rebounds 19% after Wanchain bridge hack, Hoskinson calls for ZK revamp”（2026-07-22、価格下落・反発と業界側の反応。流出量は 290M NIGHT・下落 43% と報じており、BlockSec 系の 515M とは数値が異なる）— <https://www.coindesk.com/business/2026/07/22/midnight-token-rebounds-after-wanchain-bridge-hack-hoskinson-calls-for-industry-overhaul>
- **blockchainreporter**: “Wanchain Cardano Bridge Exploit Drains 515M NIGHT, Token Plunges 30% To Record Low”（2026-07）— <https://blockchainreporter.net/wanchain-cardano-bridge-exploit-drains-515m-night-token-plunges-30-to-record-low/>
- **CoinGape**: “Wanchain Cardano Bridge Breached in $13M Hack, 515M NIGHT Tokens Drained”（2026-07）— <https://coingape.com/wanchain-cardano-bridge-breached-in-13m-hack-515m-night-tokens-drained/>
- **U.Today**: “515 Million NIGHT Exploit Update: 7 Major Exchanges Lock Down Stolen Funds for Cardano's Privacy Network”（2026-07、取引所 7 社の凍結対応）— <https://u.today/515-million-night-exploit-update-7-major-exchanges-lock-down-stolen-funds-for-cardanos-privacy>
