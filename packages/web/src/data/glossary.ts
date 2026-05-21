/**
 * Lemma Oracle glossary terms (JA).
 *
 * Source of truth for /ja/glossary/* pages. 27 terms across 4 categories.
 *
 * SAFETY BOUNDARY — inline HTML and `set:html`:
 *   `lead`, `definition[]`, `implementation[]` may contain inline HTML
 *   (<a>, <code>, <strong>, <em>) and are rendered with `set:html` in the
 *   consuming Astro template. This is intentional: the content originates
 *   in this file under code review, never from user input or a CMS.
 *   If this ever migrates to a CMS / external authoring surface, this
 *   string-to-DOM pipe MUST sanitize (e.g. DOMPurify on the server or
 *   restrict the allowed tag list) before the data leaves this module.
 *   Reviewers: treat changes to these fields as code, not content.
 */

export type GlossarySlug =
  // 暗号レイヤ
  | "zk-proof"
  | "aes-gcm"
  | "poseidon-hash"
  | "doc-hash"
  | "cid"
  | "selective-disclosure"
  | "commitment"
  // 検証可能AI
  | "verifiable-ai"
  | "provenance"
  | "provenance-proof"
  | "c2pa"
  | "did"
  | "verifiable-credential"
  | "rag"
  | "citation-proof"
  | "audit-trail"
  | "scope"
  | "schema"
  | "generator"
  // プロトコル・エージェント
  | "agentic-payments"
  | "x402"
  | "trust402"
  | "eip-3009"
  | "facilitator"
  | "a2a"
  | "mcp"
  // 規制・コンプライアンス
  | "kyc-aml"
  | "eu-ai-act"
  | "ai-business-guidelines"
  | "ai-promotion-act";

export type GlossaryCategory =
  | "暗号レイヤ"
  | "検証可能AI"
  | "プロトコル・エージェント"
  | "規制・コンプライアンス";

export interface GlossaryRelated {
  readonly slug: GlossarySlug;
  readonly desc: string;
}

export interface GlossaryTerm {
  readonly slug: GlossarySlug;
  readonly nameJa: string;
  readonly nameEn: string;
  readonly category: GlossaryCategory;
  /** Short meta description (~80–160 chars). */
  readonly description: string;
  /** Hero lead paragraph rendered with set:html (may contain inline <a>). */
  readonly lead: string;
  /** "定義" section paragraphs (HTML strings). */
  readonly definition: ReadonlyArray<string>;
  /** "Lemma Oracle での実装" / "適合経路" section paragraphs (HTML strings). */
  readonly implementation: ReadonlyArray<string>;
  /** 4 related terms with one-line descriptions. */
  readonly related: ReadonlyArray<GlossaryRelated>;
  /** CTA H2 for the bottom Get-Started panel. */
  readonly ctaH2: string;
  /**
   * Optional implementation section heading (defaults to
   * "Lemma Oracle での実装"). Regulatory pages use "Lemma Oracle での適合経路".
   */
  readonly implementationHeading?: string;
}

export const GLOSSARY_TERMS: ReadonlyArray<GlossaryTerm> = [
  // ============ 暗号レイヤ ============
  {
    slug: "zk-proof",
    nameJa: "ゼロ知識証明",
    nameEn: "Zero-Knowledge Proof — ZKP",
    category: "暗号レイヤ",
    description:
      "ゼロ知識証明 (ZK Proof) の定義と Lemma Oracle における実装。命題を秘匿したまま正当性のみを検証可能にする暗号プリミティブ。",
    lead:
      "命題が真であることを、命題の中身や前提となる秘密値を一切開示せず、第三者が機械的に検証できる暗号プリミティブ。",
    definition: [
      "ゼロ知識証明 (ZKP) は、証明者 (prover) が検証者 (verifier) に対し、ある命題が真である事実だけを納得させ、命題の根拠となる秘密値については一切の情報を漏らさない対話・非対話プロトコルを指す。Goldwasser, Micali, Rackoff が 1985 年に概念を導入し、現代では「完全性」「健全性」「ゼロ知識性」の三性質で形式化される。",
      "実装上は非対話型 (NIZK) が主流であり、SNARK 系 (Groth16, PLONK, Halo2) と STARK 系が代表的な構成。証明サイズ・検証時間・信頼セットアップの有無でトレードオフを持つ。回路 (制約系) として表現された計算であれば、入力を秘匿したまま結果の正当性を証明できる。",
      "ZKP の有用性は二点に集約される。第一に、秘密を開示せずに性質を証明できる点 (プライバシー)。第二に、計算量の重い検証を短い証明で代替できる点 (スケーラビリティ)。Lemma Oracle は前者を主軸に用いる。",
    ],
    implementation: [
      "Lemma の中核アーキテクチャは、来歴・属性・AI 推論履歴を <code>docHash</code> として固定し、ZK 回路上で「ある来歴チェーンが存在する」「ある属性が範囲内にある」事実だけを取り出して証明する。コンテンツや個人情報を相手側へ渡す必要がない。",
      '実装系は <a href="/ja/glossary/poseidon-hash/">Poseidonハッシュ</a> による回路内部のメモリ効率化、<a href="/ja/glossary/commitment/">コミットメント</a> による段階的開示、<a href="/ja/glossary/selective-disclosure/">選択的開示</a> による属性レベルの粒度制御を組み合わせる。最終的な証明は EVM 互換チェーン上でも安価に検証可能なサイズに収まる。',
      "ZKP は Lemma のすべてのプロダクト (Civic / Critical / Compliance / Trust402) に共通する基盤である。判断根拠は秘匿しつつ、検証だけを公開できるという性質が、規制適合と機密性を同時に満たす唯一の経路となる。",
    ],
    related: [
      { slug: "provenance", desc: "来歴を改ざん不能に追跡する仕組み。ZKP と組み合わせて秘匿しつつ証明する。" },
      { slug: "verifiable-ai", desc: "AI の判断根拠を暗号で検証可能にする領域。ZKP はその主要構成要素。" },
      { slug: "selective-disclosure", desc: "属性の一部のみを暗号証明とともに開示する手法。" },
      { slug: "commitment", desc: "値を伏せて固定し、後で開示可能にする暗号構成。" },
    ],
    ctaH2: "ゼロ知識証明を、検証可能 AI の土台に。",
  },
  {
    slug: "aes-gcm",
    nameJa: "AES-GCM",
    nameEn: "AES-GCM (Galois/Counter Mode)",
    category: "暗号レイヤ",
    description:
      "AES ブロック暗号と Galois/Counter Mode を組み合わせた認証付き対称暗号 (AEAD)。機密性と完全性を単一構成で同時に保証する。",
    lead:
      "認証付き対称暗号 (AEAD) の代表的構成。AES ブロック暗号と GCM (Galois/Counter Mode) を組み合わせ、機密性と完全性を同時に保証する。",
    definition: [
      "AES-GCM は NIST SP 800-38D で標準化された AEAD 構成。AES-128 / 192 / 256 のいずれかをカウンタモードで動かして暗号化と同時に Galois Field 上の MAC を生成する。出力は ciphertext と認証タグ (通常 128bit) の組。",
      "設計上の特長は並列化可能性とハードウェア加速。Intel AES-NI、ARMv8 Crypto Extensions などのハードウェア命令により、ソフトウェア実装より一桁以上速く動く。TLS 1.3、SSH、IPsec、Signal、QUIC でデフォルトの一つ。",
      "機密性 (ciphertext から平文を逆算不可) と完全性 (タグ検証により改竄を検出) を単一の構成で達成する点が、AES-CBC + HMAC のような複合構成より安全かつ高速。ただし IV (ノンス) の一意性は厳格に守る必要がある。",
    ],
    implementation: [
      "Lemma は機微データ (顧客属性・AI 入力・判断ログ) を保管・転送する経路で AES-GCM を用いる。鍵管理は HSM/KMS と連携し、ノンス管理はカウンタ + コンテキスト識別子で一意性を担保する。",
      'ZK 証明側に渡るのは <a href="/ja/glossary/doc-hash/">docHash</a> のみで、平文は AES-GCM 下で保管される。検証可能性 (ZK) と機密性 (AES-GCM) を二層構造で分離することが、Lemma の暗号設計の基本パターン。',
      '<a href="/ja/glossary/selective-disclosure/">選択的開示</a> で属性証明を返す場合も、原文書は AES-GCM で暗号化された状態のまま動かない。属性のコミットメントと証明だけが回路に乗る。',
    ],
    related: [
      { slug: "zk-proof", desc: "検証可能性を担う対の暗号プリミティブ。" },
      { slug: "doc-hash", desc: "AES-GCM 下の暗号化対象を、回路側で参照するための識別子。" },
      { slug: "commitment", desc: "属性をハッシュで固定し、復号せずに証明可能にする手法。" },
      { slug: "selective-disclosure", desc: "原文を復号せず、属性のみを開示する設計。" },
    ],
    ctaH2: "機密と検証可能性を、同じ設計で。",
  },
  {
    slug: "poseidon-hash",
    nameJa: "Poseidonハッシュ",
    nameEn: "Poseidon Hash",
    category: "暗号レイヤ",
    description:
      "ZK 回路上での計算量を最小化するために設計された代数的ハッシュ関数。StarkWare らが 2019 年に提案、StarkNet/Cairo・Filecoin・Aztec などで採用。",
    lead:
      "ZK 回路上での計算量が極めて軽い代数的ハッシュ関数。StarkWare らが 2019 年に提案、StarkNet/Cairo の主要ハッシュとして採用される。",
    definition: [
      "Poseidon は HADES 設計戦略 (置換-置換ネットワーク + 部分 S-box 層) に基づく。完全ラウンド (R_F) と部分ラウンド (R_P) の組み合わせで衝突耐性を維持しつつ、ZK 回路上の制約数を SHA-256 比で 1〜2 桁削減する。",
      "標準パラメータは素体 <code>p = 2^251 + 17·2^192 + 1</code> 上で定義される (StarkWare 公式仕様)。Filecoin・Aztec・Penumbra など主要 ZK プロジェクトが採用済み。Ethereum でも Poseidon precompile (EIP-5988) が提案されている。",
      "設計上、Keccak / SHA-2 のようなビット演算ベースのハッシュは ZK 回路上で扱うと制約数が爆発する。Poseidon は乗算と加算のみで構成されるため、回路コストが入力長に対して線形に近い。",
    ],
    implementation: [
      'Lemma は <a href="/ja/glossary/doc-hash/">docHash</a> の内部表現を Poseidon でハッシュ化する。回路内で docHash を吸い込み、属性・来歴・コミットメントを 1 つの ZK 友好的なハッシュチェーンに収束させる設計。',
      '後段の <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> 生成において、Poseidon の選択が証明時間を桁単位で削減する。エンドユーザー視点では「証明が即時に生成される」体験の前提条件となる。',
      '外部互換のための SHA-256 系識別子 (<a href="/ja/glossary/cid/">CID</a> など) と、回路内部の Poseidon 表現は二層で持つ。互換性と効率性のどちらも妥協しない構成。',
    ],
    related: [
      { slug: "zk-proof", desc: "Poseidon の最大の用途。回路制約を線形オーダーに保つ。" },
      { slug: "doc-hash", desc: "回路内部では Poseidon、外部互換では SHA-256 の二層構造。" },
      { slug: "commitment", desc: "Pedersen/KZG コミットメントを Poseidon ベースで実装可能。" },
      { slug: "cid", desc: "外部識別子としての CID と内部識別子としての Poseidon の対比。" },
    ],
    ctaH2: "ZK 回路の制約を、設計から最適化する。",
  },
  {
    slug: "doc-hash",
    nameJa: "docHash",
    nameEn: "docHash — document content digest",
    category: "暗号レイヤ",
    description:
      "文書のバイト列を入力とする暗号学的ダイジェスト。Lemma が来歴・属性・引用などすべての検証単位の同一性を固定するために用いる基本識別子。",
    lead:
      "文書のバイト列を入力とする暗号学的ダイジェスト。Lemma が来歴・属性・引用などすべての検証単位の同一性を固定するために用いる基本識別子。",
    definition: [
      "docHash は SHA-256 や BLAKE3 のような衝突困難なハッシュ関数を、文書の正規化バイト列に適用した固定長出力。同一バイト列なら必ず同一の docHash となり、1 ビットの改変でも全く異なる値となる。",
      "単独では「中身を知る」手がかりにはならない。逆方向計算 (preimage) が計算量的に不可能なため、docHash を共有しても文書の内容は漏れない。これにより、内容を秘匿したまま「ある文書が存在する事実」だけを共有できる。",
      'Lemma 文脈の docHash は、ZK 回路に直接食わせるため <a href="/ja/glossary/poseidon-hash/">Poseidonハッシュ</a> 表現も併用する。SHA-256 のような従来表現は外部互換用、Poseidon 表現は回路内部用、という二層構造をとる。',
    ],
    implementation: [
      "来歴・属性・AI 推論履歴のすべては最終的に docHash として固定される。文書・データセット・モデル重み・ログいずれも、バイト列レベルで一意化することで監査と証明の単位が揃う。",
      'docHash と <a href="/ja/glossary/commitment/">コミットメント</a> を組み合わせると、文書を見せずに「ある属性を持つ文書が存在する」事実を <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で示せる。<a href="/ja/glossary/selective-disclosure/">選択的開示</a> の出発点。',
      '<a href="/ja/glossary/provenance/">プロヴナンス</a> チェーンは、各段階の docHash を時系列リンクとして連結することで形成される。docHash は Lemma 暗号インフラ全体の最小単位。',
    ],
    related: [
      { slug: "zk-proof", desc: "docHash を入力とし、開示せずに事実だけを取り出す暗号プリミティブ。" },
      { slug: "poseidon-hash", desc: "docHash の回路内表現を担う ZK 友好的ハッシュ。" },
      { slug: "commitment", desc: "docHash と乱数を組み合わせて値を伏せて固定する構成。" },
      { slug: "cid", desc: "docHash と並ぶ外部互換のコンテンツ識別子。" },
    ],
    ctaH2: "検証の単位を、バイト列で固定する。",
  },
  {
    slug: "cid",
    nameJa: "CID",
    nameEn: "Content Identifier — multiformats",
    category: "暗号レイヤ",
    description:
      "コンテンツ自身から導出される自己記述的な識別子。multihash・multicodec・multibase の組み合わせで、ハッシュアルゴリズム・符号化形式・データ型を識別子に直接埋め込む。",
    lead:
      "コンテンツ自身から導出される自己記述的な識別子。multihash・multicodec・multibase の組み合わせで、ハッシュアルゴリズム・符号化形式・データ型を識別子に直接埋め込む。",
    definition: [
      "CID は IPFS / IPLD エコシステムを起点に multiformats プロジェクトで標準化された。CIDv0 は <code>Qm...</code> 形式 (base58btc + SHA-256 multihash) の単純形式、CIDv1 は <code>multibase prefix + version + multicodec + multihash</code> の柔軟構造。",
      "自己記述性により、識別子から逆引きでハッシュアルゴリズム・データ形式が判明する。プロトコル進化 (SHA-256 → SHA-3、JSON → CBOR) に対して識別子のフォーマット側を変えずに移行できる。",
      "内容アドレッシング (content-addressing) のため、同じバイト列は誰がアップロードしても必ず同じ CID になる。逆に CID が一致すれば内容は一致しているという強い保証が得られる。",
    ],
    implementation: [
      'Lemma は分散ストレージ上のオブジェクト (RAG 文書・来歴メタデータ・ライセンスファイル) を CID で参照する。<a href="/ja/glossary/doc-hash/">docHash</a> が内部ハッシュ表現であるのに対し、CID は外部互換のためのコンテンツ識別子。',
      '<a href="/ja/glossary/provenance/">プロヴナンス</a> グラフの各ノードは CID で前段にリンクされる。来歴の永続性と検証可能性を、分散ストレージレベルでも担保する設計。',
      'ZK 回路内では CID 文字列ではなく <a href="/ja/glossary/poseidon-hash/">Poseidonハッシュ</a> 化された短い値で扱う。外部識別子と内部識別子を分離することで、両方の利便性を取る。',
    ],
    related: [
      { slug: "doc-hash", desc: "CID と並ぶハッシュ識別子。内部表現と外部表現の対。" },
      { slug: "provenance", desc: "CID で結ばれる来歴グラフのノード設計。" },
      { slug: "poseidon-hash", desc: "CID を ZK 回路内で扱うための表現変換。" },
      { slug: "zk-proof", desc: "CID 参照を秘匿したまま整合性を証明する手法。" },
    ],
    ctaH2: "コンテンツに、内容由来の名前を。",
  },
  {
    slug: "selective-disclosure",
    nameJa: "選択的開示",
    nameEn: "Selective Disclosure",
    category: "暗号レイヤ",
    description:
      "文書や認証情報の全体を開示せず、必要な属性のみを選んで暗号証明とともに開示する手法。プライバシーと規制適合を両立させる中核技術。",
    lead:
      "文書や認証情報の全体を開示せず、必要な属性のみを選んで暗号証明とともに開示する手法。プライバシーと適合性 (compliance) を両立させる中核技術。",
    definition: [
      "古典的には Camenisch-Lysyanskaya 署名や匿名認証情報 (Anonymous Credentials) として研究されてきた。近年は SD-JWT (Selective Disclosure JWT)、BBS+ 署名、AnonCreds などの実装規格が整備されている。",
      "仕組みは「全属性を含む文書にコミットメントを取り、そのコミットメントへ発行者が署名」「開示時には特定属性とそれが元文書由来である ZK 証明のみを提示」という構造。検証者は宣言された属性が真正かつ未改ざんであることを、他の属性に触れずに確認できる。",
      "GDPR の「データ最小化原則」、KYC/AML の身元検証要件、医療情報の最小開示原則と整合する設計。データを「全開示」or「全非開示」の二択から「属性レベル」に分解する。",
    ],
    implementation: [
      'Lemma は属性ごとの開示を <a href="/ja/glossary/commitment/">コミットメント</a> と <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で構成する。例えば KYC 情報のうち「居住国は EU 域内」のみを証明し、氏名・住所・生年月日は提示しない。',
      '<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> の高リスク AI 監査、<a href="/ja/glossary/ai-business-guidelines/">AI 事業者ガイドライン</a> のガバナンス報告、<a href="/ja/glossary/kyc-aml/">KYC/AML</a> の本人確認──いずれも「属性は確認したい、データは渡したくない」場面で適用できる。',
      "属性の発行者・開示者・検証者がそれぞれ独立し、データの集中保管を回避できる。データ漏洩リスクを構造的に下げる点も実運用上の利点。",
    ],
    related: [
      { slug: "zk-proof", desc: "属性開示を支える暗号プリミティブ。" },
      { slug: "commitment", desc: "属性を伏せて固定し、必要分だけ開示する構成。" },
      { slug: "kyc-aml", desc: "選択的開示が最も具体的な解になる規制領域。" },
      { slug: "provenance", desc: "来歴の各段階を属性単位で開示する設計。" },
    ],
    ctaH2: "属性だけを、ピンポイントで証明する。",
  },
  {
    slug: "commitment",
    nameJa: "コミットメント",
    nameEn: "Commitment Scheme",
    category: "暗号レイヤ",
    description:
      "値を一旦伏せて固定し、後で開示できる暗号構成。固定後は値を変更できない (binding) かつ、開示前は値が漏れない (hiding) を満たす。",
    lead:
      "値を一旦伏せて固定し (commit)、後で開示できる (reveal) 暗号構成。固定後は値を変更できない (binding) かつ、開示前は値が漏れない (hiding) という二性質を満たす。",
    definition: [
      '古典的なコミットメント方式は三系統に大別される。(1) ハッシュベース: <code>H(m, r)</code> で値 m とランダムソルト r をハッシュ化、(2) Pedersen コミットメント: <code>g^m · h^r</code> (群論的)、(3) Kate/KZG コミットメント: 多項式コミットメント。',
      'ZK 証明系では、回路に値を直接渡すのではなくコミットメントを渡し、必要な部分だけを <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で開示する設計が一般的。コミットメントが ZK の入力プライバシーの土台になる。',
      "<strong>binding</strong> は事後の改竄を防ぎ、<strong>hiding</strong> は事前の漏洩を防ぐ。両方を満たすことで「言質を取った上で、後で必要な分だけ見せる」という運用が可能になる。",
    ],
    implementation: [
      "Lemma の属性コミットメント・モデルコミットメント・来歴コミットメントすべては Pedersen 系または KZG 系を採る。属性レベルで開示できるよう、属性ごとに独立したコミットメントを束ねるベクトル/多項式コミットメントを使用する。",
      '<a href="/ja/glossary/selective-disclosure/">選択的開示</a> はコミットメントの開示制御として実装され、<a href="/ja/glossary/provenance/">プロヴナンス</a> の各段階はコミットメントのチェーンとして固定される。',
      '<a href="/ja/glossary/poseidon-hash/">Poseidonハッシュ</a> ベースのコミットメントを採用することで、ZK 回路上での開示証明コストを最小化する。',
    ],
    related: [
      { slug: "zk-proof", desc: "コミットメントの開示証明を担う暗号プリミティブ。" },
      { slug: "selective-disclosure", desc: "コミットメントの開示制御として実装される。" },
      { slug: "doc-hash", desc: "コミットメント値の元となる文書識別子。" },
      { slug: "poseidon-hash", desc: "ZK 回路上のコミットメント実装に最適。" },
    ],
    ctaH2: "値を、開示の前に固定する。",
  },

  // ============ 検証可能AI ============
  {
    slug: "verifiable-ai",
    nameJa: "検証可能AI",
    nameEn: "Verifiable AI",
    category: "検証可能AI",
    description:
      "検証可能AI (Verifiable AI) の定義と Lemma Oracle における実装。入力・モデル・推論過程の真正性を暗号で第三者検証できるようにする領域。",
    lead:
      "AI システムの判断・推論・引用を暗号で検証可能にする実装領域。出力だけでなく、入力データの来歴・モデルの同一性・推論経路の真正性を第三者が機械的に確認できる状態を指す。",
    definition: [
      "検証可能 AI は、AI の出力を「信じる」ことを前提にせず、「検証する」ことを前提にするための技術領域である。学術的には zkML (Zero-Knowledge Machine Learning) や cryptographic inference の総称的な位置づけにあたり、重みや入力を秘匿したまま「指定モデルが指定入力に対して指定出力を返した」事実を暗号で証明する系全体を指す。",
      "技術的には三つの層で成立する。第一に <strong>入力来歴</strong>: モデルが参照した文書・データの出所と完全性を固定する層。第二に <strong>モデル同一性</strong>: 推論に使われたモデルが宣言された重みハッシュと一致することを保証する層。第三に <strong>推論一貫性</strong>: 入力と出力が指定モデルによる正規の計算結果であることを ZK 回路で示す層。",
      "2025〜2026 年にかけて Lagrange DeepProve や JOLT、zkPyTorch などにより大規模モデルでの ZK 推論証明が実用化フェーズに入った。今後は「検証可能でない推論」が低信頼の市場区分に押し出され、規制適合や監査要件のあるドメインから先に検証可能 AI への移行が進む。",
    ],
    implementation: [
      'Lemma は、検証可能 AI のための汎用の暗号インフラを提供する。入力データは <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> に直接食わせるのではなく、まず <code>docHash</code> でバイト列を固定し、属性レベルで <a href="/ja/glossary/selective-disclosure/">選択的開示</a> 可能な構造に変換する。これにより、コンテンツや個人情報を相手に渡さず、必要な属性だけを証明できる。',
      '推論側ではモデルハッシュを <a href="/ja/glossary/commitment/">コミットメント</a> として固定し、入力・出力・モデルを結ぶ証明を生成する。RAG パイプラインの場合は、引用文書の <a href="/ja/glossary/provenance/">プロヴナンス</a> と引用文・本文の一致を同時に証明する設計を採る。',
      "結果として、Lemma が提供する検証可能 AI 向け信頼インフラは、規制対応 (EU AI Act の自動ログ・人間監督要件) と機密性 (GDPR・営業秘密) を同時に満たす経路となる。AI 判断を組織横断で監査するための、最も具体的なインフラ層がここにあたる。",
    ],
    related: [
      { slug: "zk-proof", desc: "命題を秘匿したまま正当性のみを証明する暗号プリミティブ。検証可能 AI の中核構成要素。" },
      { slug: "provenance", desc: "データ・判断の来歴を改ざん不能に追跡する仕組み。検証可能 AI の入力層。" },
      { slug: "x402", desc: "HTTP 402 を再活用したマシン間決済プロトコル。エージェント取引と検証可能性の接点。" },
      { slug: "eu-ai-act", desc: "高リスク AI に自動ログ・人間監督・データガバナンスを義務付ける EU 法。" },
    ],
    ctaH2: "検証可能 AI を、組織の判断基盤に。",
  },
  {
    slug: "provenance",
    nameJa: "プロヴナンス",
    nameEn: "Provenance — 来歴証明",
    category: "検証可能AI",
    description:
      "プロヴナンス (Provenance) の定義と Lemma Oracle における実装。データ・モデル・判断の来歴を改ざん不能に追跡する仕組み。W3C PROV・C2PA・SLSA との接続。",
    lead:
      "データ・モデル・判断がいつ・誰によって・何を入力として生成されたかを、改ざん不能に追跡・検証する仕組み。検証可能 AI の入力層であり、Lemma の中核柱の一つ。",
    definition: [
      "プロヴナンス (来歴) は、あるオブジェクトが「どこから来て」「どのような変換を経たか」を示す関係グラフを指す。概念モデルとしては W3C PROV (PROV-DM / PROV-O) が標準化されており、entity (対象) / activity (操作) / agent (実行者) の三項を時間順に結ぶ。",
      'ドメインごとに具体化された標準が並走する。メディア領域では <a href="/ja/glossary/c2pa/">C2PA</a> がコンテンツ来歴 (撮影・編集・AI 生成) の署名チェーンを定義する。ソフトウェア領域では SLSA がビルド来歴を、SCITT が透明性ログを規定する。AI 領域では学習データ・モデル・推論履歴の来歴を一貫して扱う標準がまだ確立しておらず、ここに検証可能 AI が入る。',
      '重要なのは、プロヴナンスが「記録」ではなく「証明可能な来歴」であることだ。単なるログは事後に書き換え可能であり、規制上・法的に意味を持たない。来歴の各段階を <a href="/ja/glossary/commitment/">コミットメント</a> と署名で固定し、暗号的に一意に紐づけることで、はじめて第三者検証に耐える。',
    ],
    implementation: [
      'Lemma は来歴を <code>docHash</code> + メタデータ・コミットメントの組として固定する。<code>docHash</code> は文書のバイト列ダイジェスト、メタデータは時刻・著作者・直前来歴へのリンクを含む。チェーン全体が単一のハッシュに収束し、後段の <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> でその存在のみを公開できる。',
      '<a href="/ja/glossary/selective-disclosure/">選択的開示</a> を組み合わせることで、来歴の全段階を相手に渡さず、必要な属性 (例: 「製造業者は EU 域内」「データ取得日が規制発効後」) だけを取り出して証明できる。GDPR・営業秘密・国家機密を保ったまま規制適合を成立させる経路はここから生まれる。',
      "Lemma Civic では行政データ、Lemma Critical では製造業のサプライチェーン部品、Lemma Compliance では顧客属性、検証可能 AI 領域では RAG が参照する文書群に対して、同一の来歴インフラを適用する。",
    ],
    related: [
      { slug: "zk-proof", desc: "来歴を秘匿しつつ存在のみを証明する暗号プリミティブ。" },
      { slug: "verifiable-ai", desc: "来歴を入力層として、推論まで一貫して検証可能にする領域。" },
      { slug: "selective-disclosure", desc: "来歴の一部属性のみを暗号証明とともに開示する手法。" },
      { slug: "eu-ai-act", desc: "高リスク AI にデータガバナンスを義務付ける EU 法。来歴インフラが直接対応する。" },
    ],
    ctaH2: "来歴を、組織横断の事実にする。",
  },
  {
    slug: "provenance-proof",
    nameJa: "プロヴナンス・プルーフ",
    nameEn: "Provenance Proof",
    category: "検証可能AI",
    description:
      "データの来歴を暗号的に証明する手法。生成 AI 戦略において、AI が参照したデータの真正性と出力の根拠を、データ自体を開示せず検証可能にする中核要素。",
    lead:
      "あるデータが宣言された来歴チェーン由来であることを、第三者が機械的に検証できる暗号的な「証明」そのもの。来歴を「記録」ではなく「証明」として扱うために必要な技術。",
    definition: [
      'プロヴナンス・プルーフは <a href="/ja/glossary/provenance/">プロヴナンス</a> と <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> の合成概念である。来歴情報を ZK 証明としてパッケージ化し、原データを開示せず属性のみを検証可能にする。Lemma 文脈では <code>docHash</code> + 来歴コミットメント + ZK 証明の三層構造で実装される。',
      '記録系標準 (<a href="/ja/glossary/c2pa/">C2PA</a>、SCITT、SLSA) と並走するが、プロヴナンス・プルーフは「検証可能性」に振り切った設計。標準仕様が「誰が・いつ・何をしたか」を記録するのに対し、プロヴナンス・プルーフは「その記録が真正であることを暗号で示す」層を担う。',
      "生成 AI 戦略の文脈で意味が増している。生成 AI が企業の中核業務に入り込むにつれ、(1) 学習データ来歴、(2) RAG 引用真正性、(3) モデル同一性の三軸を一括で扱える証明が要件化されつつある。プロヴナンス・プルーフは、これらすべてを単一の暗号インフラで扱える方式として注目される。",
    ],
    implementation: [
      'Lemma の中核プロダクト価値は「あらゆる属性・データに対してプロヴナンス・プルーフを発行・検証できる暗号インフラ」である。製品ごとに発行ロジック (Civic / Critical / Compliance) と検証ロジック (<a href="/ja/glossary/trust402/">Trust402</a>) を提供する。',
      '生成 AI 戦略上の具体的ユースケース: <a href="/ja/glossary/rag/">RAG</a> パイプラインのハルシネーション抑制、学習データセットの監査トレイル、<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> 適合の自動ログ。いずれも「データの来歴を、データそのものを渡さずに証明する」要件で共通する。',
      "2026 年以降、規制と契約の両面からプロヴナンス・プルーフが AI システムの前提技術として要求される流れが始まる。「プロヴナンス・プルーフを持たない AI」は監査・調達・コンプライアンスの低信頼帯に押し出される。",
    ],
    related: [
      { slug: "provenance", desc: "来歴を改ざん不能に追跡する仕組み。プロヴナンス・プルーフの基底概念。" },
      { slug: "zk-proof", desc: "プロヴナンス・プルーフを成立させる暗号プリミティブ。" },
      { slug: "verifiable-ai", desc: "プロヴナンス・プルーフが組み込まれた AI システム全体の領域。" },
      { slug: "c2pa", desc: "メディア領域に特化した来歴記録標準。Lemma の provenance proof と相補関係。" },
    ],
    ctaH2: "Provenance Proof を、生成 AI 戦略の前提に。",
  },
  {
    slug: "c2pa",
    nameJa: "C2PA",
    nameEn: "C2PA — Coalition for Content Provenance and Authenticity",
    category: "検証可能AI",
    description:
      "メディアコンテンツの来歴を記述・署名する業界標準。Adobe・Microsoft・BBC・Intel・Sony 等が主導し、AI 生成画像の識別と編集履歴の検証で広く採用される。",
    lead:
      "コンテンツ (画像・映像・音声・PDF) の来歴情報を Content Credentials (C2PA Manifest) として埋め込み、撮影・編集・AI 生成の各段階を暗号署名で固定する業界標準。",
    definition: [
      "C2PA は Coalition for Content Provenance and Authenticity の略。2021 年に Adobe・Microsoft・BBC・Truepic・Intel・Sony・Arm などが共同設立。技術仕様は Content Credentials として実装される。",
      "仕組みは三層構造: (1) コンテンツに Manifest (CBOR エンコード) を埋め込む、(2) Capture / Edit / AI Generation の各イベントを Assertion として記録、(3) チェーン末端を X.509 証明書で署名。検証側は Manifest を解読して各 Assertion の真正性を機械的に確認できる。",
      'AI 生成コンテンツへの応用が急速に進んでいる。生成モデルが画像を出力する際に C2PA Manifest を同時発行すれば「これは AI 生成である」事実が暗号的にラベリングされる。ジャーナリズム、<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> 第 50 条 (透明性義務)、SNS の AI コンテンツ表示等で採用が拡大している。',
    ],
    implementation: [
      'Lemma の <a href="/ja/glossary/provenance/">プロヴナンス</a> 基盤は C2PA と相補関係にある。C2PA がメディア領域に特化した「コンテンツ来歴の業界標準」であるのに対し、Lemma は AI 推論履歴・属性証明・規制適合など領域横断の <a href="/ja/glossary/provenance-proof/">プロヴナンス・プルーフ</a> 基盤を提供する。',
      "連携の典型パターン: C2PA Manifest 内の Assertion を <code>docHash</code> として Lemma の来歴チェーンに食わせ、ZK 証明で属性レベルの選択的開示を可能にする。メディア由来の情報が AI パイプラインに入っても来歴連鎖が切れない。",
      "Lemma を導入する組織が C2PA も併用することで、メディア領域 (C2PA) と AI / データ領域 (Lemma) の両方を一貫した来歴インフラでカバーできる。",
    ],
    related: [
      { slug: "provenance", desc: "Lemma 側の来歴基盤。C2PA と相補関係にある。" },
      { slug: "provenance-proof", desc: "C2PA Manifest を取り込んで属性レベル開示する経路。" },
      { slug: "verifiable-ai", desc: "C2PA が AI 生成コンテンツの識別で組み込まれる上位領域。" },
      { slug: "audit-trail", desc: "C2PA の Assertion チェーンと類似する記録モデル。" },
    ],
    ctaH2: "メディアと AI、両方の来歴を一本化する。",
  },
  {
    slug: "did",
    nameJa: "分散型識別子 (DID)",
    nameEn: "Decentralized Identifier — DID",
    category: "検証可能AI",
    description:
      "W3C が標準化した識別子仕様。発行者・主体・検証者が独立に運用できる識別子で、属性証明や来歴チェーンの主体識別に用いられる。",
    lead:
      "W3C が 2022 年に勧告した識別子仕様。中央発行者を必要とせず、識別子そのものに公開鍵と検証方式を紐づけて運用できる。<a href=\"/ja/glossary/verifiable-credential/\">Verifiable Credentials</a> と組み合わせて、属性証明の主体を一意に指す役割を担う。",
    definition: [
      "DID は <code>did:method:identifier</code> 形式の URI として表現される。method ごとに解決方式 (DID Method) が定義され、解決結果として DID Document (公開鍵・サービスエンドポイント・認証方式) が返る。発行と検証は仕様レベルで分離されている。",
      'W3C DID Core 1.0 は 2022 年に勧告化された。主要 method として did:web (HTTPS でホスティング)、did:key (公開鍵そのものを識別子化)、did:jwk、did:pkh などがある。Lemma のような企業利用では「組織が自前で運用するエンドポイント」を起点にできる did:web の採用例が多い。',
      'DID は単独で何かを証明するわけではない。主体を一意に指す識別子であり、属性を主張するのは <a href="/ja/glossary/verifiable-credential/">Verifiable Credentials (VC)</a> 側の責任。両者を組み合わせて初めて「誰が何を主張したか」を第三者検証可能な形で表現できる。',
    ],
    implementation: [
      'Lemma の属性証明と <a href="/ja/glossary/provenance/">プロヴナンス</a> チェーンでは、Issuer (発行者) と Subject (対象) を DID で識別する。組織が did:web を運用する場合、自社ドメイン配下の <code>/.well-known/did.json</code> がそのまま信頼起点になる。',
      '<a href="/ja/glossary/selective-disclosure/">選択的開示</a> と組み合わせると、DID で識別された主体の属性 (例: 「この事業者は EU 域内」「この AI モデルは特定組織が学習」) を、属性値そのものを開示せずに証明できる。',
      "DID は web3 系プロジェクトでの言及が目立つが、W3C 標準としてはチェーン非依存。Lemma は did:web を主要 method と位置づけ、既存の DNS と HTTPS 信頼インフラに自然に乗る形で運用する。",
    ],
    related: [
      { slug: "verifiable-credential", desc: "DID が指す主体について属性を主張する標準。" },
      { slug: "provenance", desc: "DID で識別される主体が来歴チェーンの起点となる。" },
      { slug: "selective-disclosure", desc: "DID 主体の属性を、値を開示せず証明する経路。" },
      { slug: "verifiable-ai", desc: "AI 推論履歴の発行者・モデル提供者を DID で識別する。" },
    ],
    ctaH2: "主体識別と属性証明を、独立した標準で組み立てる。",
  },
  {
    slug: "verifiable-credential",
    nameJa: "検証可能クレデンシャル (VC)",
    nameEn: "Verifiable Credentials — VC",
    category: "検証可能AI",
    description:
      "W3C が標準化した、第三者検証可能な属性表現フォーマット。発行者・保有者・検証者の三者モデルで属性証明を流通させる。",
    lead:
      "W3C Verifiable Credentials Data Model が標準化する、第三者検証可能な属性表現フォーマット。発行者 (Issuer) が主体 (Holder) に対して属性を発行し、検証者 (Verifier) がそれを暗号的に検証する三者モデル。",
    definition: [
      "VC は属性 (claims) の集合に発行者の署名を付した、移送可能な属性証明。JSON-LD / JWT / CBOR-LD などのシリアライズ形式があり、発行者・主体・有効期限・撤回方式がすべてフォーマットに組み込まれている。W3C VC Data Model 2.0 が 2025 年に勧告化された。",
      '主体は <a href="/ja/glossary/did/">DID</a> で識別されることが多く、VC と DID は W3C の "Verifiable Data Model" としてセットで設計されている。EU の eIDAS 2.0 / EUDI Wallet も同枠組みを採用しており、規制側からの後押しが進む。',
      'VC は単純な属性記録ではなく、第三者検証性を仕様レベルで担保する。発行者の署名検証、撤回状態の確認、有効期限の検証が、検証者側で独立に実行できる。<a href="/ja/glossary/selective-disclosure/">選択的開示</a> や ZK-SD-VC を組み合わせると、属性値を開示せず満たすことだけを示せる。',
    ],
    implementation: [
      "Lemma Compliance では、顧客属性 (KYC 結果・地域・業種・取引可否) を VC として発行する。発行者は自社ドメインで運用する did:web エンティティ、検証者は取引先や監査機関。証明書ファイルを渡さずに、VC とその ZK 派生で属性適合を示せる。",
      'Lemma Civic では、住民票・各種証明書を VC 形式で発行することで、自治体 DX における「証明書を渡さず属性だけ示す」運用が成立する。検証者は VC を <a href="/ja/glossary/trust402/">Trust402</a> 経由で機械検証する。',
      "VC は EU AI Act 第 12 条 (記録保持) や ISO/IEC 23894 (AI リスクマネジメント) の証跡として組み込み可能。Lemma は VC + ZK + プロヴナンスチェーンを一括で提供することで、規制適合を自動化する。",
    ],
    related: [
      { slug: "did", desc: "VC が指す発行者・主体を識別する標準。" },
      { slug: "selective-disclosure", desc: "VC 内の属性を、値を開示せず満たすだけ示す。" },
      { slug: "kyc-aml", desc: "顧客属性証明を VC 形式で流通させる典型ユースケース。" },
      { slug: "eu-ai-act", desc: "AI システムの記録保持義務に VC を充てる経路。" },
    ],
    ctaH2: "属性証明を、規制と整合する標準で運用する。",
  },
  {
    slug: "rag",
    nameJa: "RAG",
    nameEn: "Retrieval-Augmented Generation",
    category: "検証可能AI",
    description:
      "言語モデルの生成時に外部文書を検索し、その内容を回答に組み込む手法。最新情報や組織固有情報をモデル再学習なしで扱える反面、引用の真正性が新しい論点となる。",
    lead:
      "言語モデルの生成時に外部文書を検索し、その内容を回答に組み込む手法。モデル本体の重みを更新せずに最新情報・社内情報を扱える反面、引用の真正性が新しい論点となる。",
    definition: [
      "標準的な RAG パイプラインは四段で構成される。(1) クエリを embedding に変換、(2) ベクトル検索で関連文書を取得、(3) 文書をプロンプトに連結してモデルに入力、(4) モデルが文書を踏まえて応答。Meta が 2020 年に体系化、以降は産業実装の中心アーキテクチャ。",
      "利点はモデルを再学習せずに最新情報・組織固有情報を扱える点、回答に「出典」を付与できる点。欠点は、検索された文書が改竄されている場合や引用が捏造される場合に検出が困難な点。",
      "規制対応文脈で RAG を運用するには、検索対象文書の来歴と、回答中の引用が実際にその文書由来であることの両方を証明する仕組みが必要となる。ここに検証可能 AI の課題が顕在化する。",
    ],
    implementation: [
      'Lemma は RAG パイプラインに対し、(1) 検索対象文書群を <a href="/ja/glossary/cid/">CID</a> と <a href="/ja/glossary/doc-hash/">docHash</a> で来歴固定、(2) 検索結果に <a href="/ja/glossary/provenance/">プロヴナンス</a> メタデータを付与、(3) 引用部分と本文の一致を <a href="/ja/glossary/citation-proof/">引用証明</a> で立証、という三層を提供する。',
      "結果として、AI 回答に対する「この内容はこの文書から来た」「その文書は信頼できる発行元から来た」「文書は改竄されていない」を、コンテンツ自体を再提示することなく検証できる。",
      "金融機関のリサーチ補助、医療情報の意思決定支援、法務 AI の判例引用など、引用の真正性が業務遂行責任に直結する領域で具体的な解として機能する。",
    ],
    related: [
      { slug: "verifiable-ai", desc: "RAG を検証可能にする上位概念。" },
      { slug: "citation-proof", desc: "RAG 応答中の引用真正性を担う暗号証明。" },
      { slug: "provenance", desc: "検索対象文書群の来歴管理。" },
      { slug: "audit-trail", desc: "RAG 実行履歴を改ざん不能に残す仕組み。" },
    ],
    ctaH2: "検索を、検証可能にする。",
  },
  {
    slug: "citation-proof",
    nameJa: "引用証明",
    nameEn: "Citation Proof",
    category: "検証可能AI",
    description:
      "AI 応答に含めた引用が、実際に主張した出典文書から来たもので、改竄も捏造もないことを暗号で証明する仕組み。RAG パイプラインにおける真正性保証の核。",
    lead:
      "AI が応答に含めた引用が、実際に主張した出典文書から来たものであり、改竄も捏造もないことを暗号的に証明する仕組み。RAG パイプラインにおける真正性保証の核。",
    definition: [
      '引用証明は二段階で構成される。(1) 引用元文書の同一性: 出典文書のバイト列が宣言された <a href="/ja/glossary/doc-hash/">docHash</a> と一致する。(2) 引用文の出典適合性: 応答内の引用文字列が、その文書の指定された範囲に文字列として存在する。',
      '後者の証明は、文書を相手に渡さず <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> 回路上で「文書のある位置に引用文字列が存在する」事実のみを証明する。文書が機密でも、引用部分の真正性だけを開示できる。',
      "単純な「URL を添えるだけ」の出典付与とは性質が異なる。URL は事後改竄や差し替えが可能だが、引用証明は暗号的にバインドされるため、検証時点でハッシュ一致を確認するかぎり後から改竄できない。",
    ],
    implementation: [
      'Lemma は <a href="/ja/glossary/rag/">RAG</a> 応答に対し、引用箇所ごとに ZK 証明を付与する。応答を受け取った側は、文書本体にアクセスせずとも引用の真正性を機械検証できる。',
      '<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> の透明性義務、ジャーナリズム・法務領域でのファクトチェック、医療文書の引用検証──いずれも引用証明が直接の解として機能する場面。',
      '<a href="/ja/glossary/selective-disclosure/">選択的開示</a> と組み合わせると、文書の特定段落・特定文だけを開示しつつ、それが正規の出典であることを証明できる。著作権の引用要件 (主従関係・出所明示) と暗号的真正性の同時成立。',
    ],
    related: [
      { slug: "rag", desc: "引用証明が最も直接的に適用されるパイプライン。" },
      { slug: "verifiable-ai", desc: "引用証明が成立させる上位概念。" },
      { slug: "provenance", desc: "出典文書の来歴を担保する仕組み。" },
      { slug: "zk-proof", desc: "引用文の存在を秘匿しつつ証明する暗号プリミティブ。" },
    ],
    ctaH2: "引用の真正性を、暗号で。",
  },
  {
    slug: "audit-trail",
    nameJa: "監査トレイル",
    nameEn: "Audit Trail",
    category: "検証可能AI",
    description:
      "システムの実行履歴を、事後の改ざんが不可能な形で残す仕組み。AI 判断ログ、決済経路、データアクセス履歴など、後から検証が求められるすべての領域で必須。",
    lead:
      "システムの実行履歴を、事後の改ざんが不可能な形で残す仕組み。AI システムの判断ログ、決済の経路、データアクセスの履歴など、後から検証が求められるすべての領域で必須となる。",
    definition: [
      "古典的な監査ログはアプリケーション側のテキストログとして実装されるが、ファイルベースのログは管理者権限で書き換え可能なため、強い証拠能力を持たない。暗号的に改ざん不能な監査トレイルは、Merkle 木・透明性ログ (Certificate Transparency / SCITT)・ブロックチェーン anchoring といった構成で実現される。",
      '構造的には、各イベントを <a href="/ja/glossary/doc-hash/">docHash</a> 化し、直前のエントリへのハッシュリンクを含めてチェーン化する。チェーンの末端を定期的に外部に固定 (anchoring) することで、内部からの遡及改ざんを検出可能にする。',
      'AI 領域での要件は、最低限 (1) 入力データのハッシュ、(2) モデルバージョン、(3) 推論時刻、(4) 出力ハッシュ、(5) 人間承認の有無、を含むこと。<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> 第 12 条 (高リスク AI の自動ログ) と直接対応する。',
    ],
    implementation: [
      'Lemma は監査トレイルを <a href="/ja/glossary/commitment/">コミットメント</a> チェーンとして実装する。各エントリは前段にハッシュリンクされ、末端は分散台帳に固定。<a href="/ja/glossary/selective-disclosure/">選択的開示</a> によって、監査人にだけ必要な属性 (推論時刻・モデルバージョン) を見せる。',
      'データ本体は秘匿しつつ、「ある時刻にあるモデルがある入力に対し推論を実行した」事実だけを <a href="/ja/glossary/zk-proof/">ZK</a> で証明できる。GDPR と監査義務の両立を、技術側で成立させる経路。',
      '<a href="/ja/glossary/a2a/">A2A</a> プロトコル上のエージェント協調や <a href="/ja/glossary/mcp/">MCP</a> ツール呼び出しも、同じ監査トレイル設計に乗せられる。',
    ],
    related: [
      { slug: "eu-ai-act", desc: "高リスク AI に自動ログを義務付ける法令。直接対応。" },
      { slug: "verifiable-ai", desc: "監査トレイルを必須要素として含む上位概念。" },
      { slug: "provenance", desc: "イベントの来歴チェーンとして表現される構造。" },
      { slug: "commitment", desc: "監査トレイルの各エントリを固定する暗号構成。" },
    ],
    ctaH2: "改ざん不能な実行履歴を、AI に。",
  },

  {
    slug: "scope",
    nameJa: "スコープ",
    nameEn: "Scope — tenant boundary",
    category: "検証可能AI",
    description:
      "Lemma のテナント境界です。登録される API キー、スキーマ、回路、ドキュメント、証明はすべて 1 つの scope ID にひもづき、発行者 DID を共有していても scope をまたいでデータが見えることはありません。",
    lead:
      '<strong>スコープ</strong> は Lemma におけるテナンシーの単位です。登録される API キー、スキーマ、回路、ドキュメント、証明はすべて 1 つのスコープに所属します。発行者 <a href="/ja/glossary/did/">DID</a> を共有していても、スコープをまたいでデータが見えることはありません。',
    definition: [
      "スコープは開発者が初回サインインしたタイミングで作成されます。それ以降に登録される API キー・スキーマ・回路・ジェネレータ・ドキュメント・証明には、外部キーとしてそのスコープ ID が刻まれます。Dashboard・workers API・オンチェーンフックいずれも、データを返す前にスコープでフィルタを通します。",
      "スコープは発行者の身元とは別の概念です。1 つの法人が production / staging / partner-x のように複数のスコープを運用することもできますし、逆に 1 つのスコープから、運用文脈に応じて複数の発行者 DID で署名することも可能です。",
      "テナント分離は UI 層ではなく workers API 層で強制されます。スコープ A で認証されたリクエストは、たとえ直接 API を組み立ててもスコープ B のリソースを読み書きできません。bearer token のチェックがルートハンドラに入る前に scope_id へ解決される設計になっています。",
    ],
    implementation: [
      'スコープは D1 上のすべてのテーブルに対する join key です。<a href="/ja/glossary/x402/">x402</a> のサービスルート、<a href="/ja/glossary/mcp/">MCP</a> のツールアクセス、Dashboard の "my-resources" ビューはいずれも scope_id で絞り込みます。サインイン時に発行される最初のキーはスコープを保持し、キーをローテーションしてもスコープは変わりません。',
      "スコープ単位の制御（レートリミット、課金集計、Marketplace 公開）は、ワークスペースのチーム切替に近い感覚で開発者がスコープ間を移動できるよう設計されています。AI が見る範囲を縛るのは、身元ではなく境界です。",
      'マルチテナント運用において、スコープはプライバシーの単位でもあります。<a href="/ja/glossary/selective-disclosure/">選択的開示</a> や BBS+ プレゼンテーションは、外部に出る前にスコープ内で評価されます。',
    ],
    related: [
      { slug: "schema", desc: "スコープ配下に最初に登録されるもの。配下のドキュメントすべての型を決めます。" },
      { slug: "x402", desc: "スコープごとの API キー認可が x402 サービスアクセスの bearer 側を担います。" },
      { slug: "trust402", desc: "Trust402 のロール強制は、回路を所有するスコープの中で証明を評価します。" },
      { slug: "mcp", desc: "MCP サーバはリクエスト元のキーの scope_id に読み取りを絞ります。" },
    ],
    ctaH2: "Lemma のスコープを作って、最初の属性を登録する。",
  },
  {
    slug: "schema",
    nameJa: "スキーマ",
    nameEn: "Schema — typed attribute declaration",
    category: "検証可能AI",
    description:
      "Lemma に登録するドキュメントの属性形状の型宣言で、normalize artifact（生のフィールドを回路が検証する正規形にハッシュする WASM モジュール）にひもづきます。",
    lead:
      '<strong>スキーマ</strong> は属性集合の型形状を固定し、<em>normalize artifact</em>（生のフィールドを <a href="/ja/glossary/zk-proof/">ZK 回路</a> が検証できる正規形にハッシュする WASM モジュール）にひもづけるものです。登録後はイミュータブルなので、変更したい場合は id でバージョンを切ります。',
    definition: [
      "スキーマは名前と型だけを宣言し、値そのものは持ちません。同じスキーマを、それに準拠する全ドキュメントと、その上で証明を行う全回路が参照します。発行者・検証者・AI 利用者の間の契約レイヤがここに置かれます。",
      "回路の制約系は入力のハッシュ表現に依存するため、スキーマは型付きフィールドだけでなく、その入力を生成する正規化パイプライン（WASM モジュールのハッシュ）も固定する必要があります。正規化を変えると制約が変わり、verifying key も変わるため、新しい normalize artifact は新しいスキーマ id になります。",
      'バージョン管理は変更ではなく id（たとえば "age-over-eighteen.v2"）で行います。古いスキーマも参照可能なまま残るので、既存のドキュメントや証明は永続的に検証可能です。新しいスキーマは独立した id として共存します。',
    ],
    implementation: [
      '<a href="/ja/glossary/scope/">スコープ</a> 配下に SDK の <code>schemas.register</code> 経由で登録します。ペイロードは <code>SchemaMeta</code> で、<code>id</code>、任意の <code>description</code>、必須の <code>NormalizeArtifact</code>（WASM URL + ハッシュ + ABI）を持ちます。',
      '下流のアーティファクト — <a href="/ja/glossary/generator/">ジェネレータ</a>、回路、ドキュメント — はスキーマを id で参照します。<a href="/ja/glossary/mcp/">MCP</a> や x402 を通じて問い合わせる AI エージェントは、スキーマ id をもとに「どの属性が公開されうるか」を知ります。',
      "プロヴナンス付き RAG のような検証可能 AI ワークフローでは、スキーマは発行者と検索側の契約として働きます。発行者はスキーマに合うドキュメントに署名し、検索側は返ってきたドキュメントの docHash が、スキーマが宣言する normalize artifact に bind しているかを検証します。",
    ],
    related: [
      { slug: "scope", desc: "スキーマが登録されるテナント境界。" },
      { slug: "generator", desc: "スキーマは、その上で証明を作るジェネレータアーティファクトから参照されます。" },
      { slug: "doc-hash", desc: "ドキュメントが bind するハッシュ。スキーマの normalize artifact が生み出します。" },
      { slug: "rag", desc: "スキーマは、検証可能な RAG パイプラインが期待する属性契約の形を決めます。" },
    ],
    ctaH2: "型付きスキーマで属性契約を固定する。",
  },
  {
    slug: "generator",
    nameJa: "ジェネレータ",
    nameEn: "Generator — circuit prover artifact",
    category: "検証可能AI",
    description:
      "登録された ZK 回路に対して、外部の主体が回路自体を再実装せずに証明を生成できるようにするためのクライアント側アーティファクト（witness builder + proving key の所在）です。",
    lead:
      '<strong>ジェネレータ</strong> は ZK 回路のクライアント側相方です。witness builder と proving key の所在を持ちます。これがあるおかげで、第三者 — 開発者、エージェント、顧客のアプリ — は回路そのものを再実装することなく、回路に対して有効な <a href="/ja/glossary/zk-proof/">ZK 証明</a> を生成できます。',
    definition: [
      "ZK 証明系は 3 つのアーティファクトを伴います。回路（制約系本体）、proving key（証明者が必要とする大きな秘密由来データ）、verifying key（下流で使う検証鍵）です。Lemma 上の回路登録は verifying 側を公開します。ジェネレータが prover 側を公開することで、証明作成自体をプラットフォームの外で行えるようになります。",
      "witness builder は典型的には小さなプログラム（JavaScript、Rust、WASM バンドル）で、生の入力を受け取り、スキーマの normalize artifact と同じ正規化を実行し、回路が期待する witness レイアウトに整えます。proving key の所在は URL（IPFS、HTTPS）で、バイナリ本体はそちらに置きます。",
      "証明生成は重い処理（Groth16 の proving key は大きいです。PLONK は比較的小さいです）なので、ジェネレータを別アドレスのアーティファクトとして切り出しておけば、クライアントがキャッシュ・バージョン管理・連邦化を行いやすくなり、ユーザーごとに Lemma のサーバへ巨大なバイナリを取りに行く必要がなくなります。",
    ],
    implementation: [
      '<a href="/ja/glossary/scope/">スコープ</a> 配下に登録され、<a href="/ja/glossary/schema/">スキーマ</a> にひもづきます。Dashboard の Overview タブには他の登録物と並んで表示されます。workers API は <code>generators.register</code> / <code>generators.getById</code> を提供します。',
      'エージェント決済ユースケース（<a href="/ja/glossary/trust402/">Trust402</a>）では、自律エージェントのランタイムがジェネレータを読み込んで、ロール回路に対する "proof-before-payment" を生成します。ジェネレータの URL は、委譲側の主体がエージェントに渡す契約の一部となります。',
      "クレデンシャル上の検証可能な選択的開示では、ジェネレータが Groth16 instance と並行して BBS+ プレゼンテーションも組み立てます。ホルダーのアプリはジェネレータを読み込み、開示する属性を選び、1 つの結合アーティファクトを生成します。",
    ],
    related: [
      { slug: "schema", desc: "ジェネレータがひもづくスキーマ。その normalize artifact が witness を作ります。" },
      { slug: "zk-proof", desc: "ジェネレータが対象とする証明系。現状の本番は BN254 上の Groth16 です。" },
      { slug: "commitment", desc: "多くの回路は証明内でコミットメントを open します。ジェネレータがその open を組み立てます。" },
      { slug: "selective-disclosure", desc: "BBS+ プレゼンテーションも同じジェネレータアーティファクトが生成します。" },
    ],
    ctaH2: "ジェネレータを公開して、誰でも回路に対して証明できる状態にする。",
  },
  // ============ プロトコル・エージェント ============
  {
    slug: "agentic-payments",
    nameJa: "エージェント決済",
    nameEn: "Agentic Payments",
    category: "プロトコル・エージェント",
    description:
      "AI エージェントが自律的に取引・決済を実行する形態。x402 や MCP を含む新世代の支払いプロトコル群が前提となり、権限と来歴の検証が中核課題になる。",
    lead:
      "AI エージェントが人間の都度承認なしに、自律的に決済・取引を完了させる形態。LLM ベースのエージェントが計算資源・API・サービスを購入し、別のエージェントと契約を交わし、それを履行する世界の前提となる支払いモデルを指す。",
    definition: [
      "エージェント決済は、自律 AI エージェントが取引主体となる支払い形態。背景には LLM の推論能力向上、ツール使用 (function calling)、長期記憶 (context window 拡大)、エージェント間通信プロトコル (<a href=\"/ja/glossary/mcp/\">MCP</a> / <a href=\"/ja/glossary/a2a/\">A2A</a>) の標準化がある。2024–2025 年に Claude や Google エージェントの能力向上と並走して概念が定着した。",
      "技術スタックとしては、HTTP 402 Payment Required を実用化した <a href=\"/ja/glossary/x402/\">x402</a> (Coinbase 提案)、エージェント間取引の Stripe Agent SDK、決済仲介を担う <a href=\"/ja/glossary/facilitator/\">Facilitator</a> が中心。従来の決済基盤 (Stripe・PayPal) は人間ユーザを前提に設計されており、エージェントが主体となる場合の権限・認証・限度額管理が構造的に不足する。",
      "自律エージェントが取引を行うとき、三つの信頼問題が不可避になる。(1) このエージェントは誰の代理で動くのか (権限委譲)、(2) いくらまで使えるのか (支払い限度)、(3) 支払いの根拠データは真正か (来歴)。従来の API キー認証ではこの三つを同時に解決できない。",
    ],
    implementation: [
      "Lemma の <a href=\"/ja/glossary/trust402/\">Trust402</a> はエージェント決済の前段に置かれる検証層。エージェントは「自分が誰のために、何の限度で、どの来歴データに基づいて」決済するかを ZK で証明してから支払いに進む。権限と取引根拠が暗号的に固定されるため、後段の決済処理は安全にエージェントへ委譲できる。",
      "個別技術との連動はモジュラー。<a href=\"/ja/glossary/x402/\">x402</a> がエージェント間支払いの HTTP 層を、<a href=\"/ja/glossary/a2a/\">A2A</a> がエージェント発見と契約交渉を、<a href=\"/ja/glossary/mcp/\">MCP</a> がツール使用を担い、Lemma がそれらの上に「権限と来歴の検証」を一段挟む構成になる。",
      "エージェント決済の具体的な実装方針と Lemma がどう解くかは <a href=\"/ja/pillars/agent-authority-proof/\">エージェント権限証明の柱</a> に整理されている。本ページが「概念とエコシステム」を扱うのに対し、柱では「権限・支払い限度・来歴の三軸を Lemma がどう束ねるか」を扱う。",
    ],
    related: [
      { slug: "trust402", desc: "エージェント決済の前段検証層。権限と来歴を ZK で固定する。" },
      { slug: "x402", desc: "エージェント間決済の HTTP 層。Coinbase 提案のプロトコル。" },
      { slug: "a2a", desc: "エージェント発見と契約交渉の標準。" },
      { slug: "mcp", desc: "エージェントのツール使用プロトコル。Anthropic 主導。" },
    ],
    ctaH2: "エージェントの権限と取引を、検証可能にする。",
  },
  {
    slug: "x402",
    nameJa: "x402",
    nameEn: "HTTP 402-native payment protocol",
    category: "プロトコル・エージェント",
    description:
      "x402 の定義と Lemma Oracle における検証層 (Trust402)。HTTP 402 Payment Required を再活用し、ステーブルコイン決済を HTTP に直接統合する Coinbase 主導のオープンプロトコル。",
    lead:
      "HTTP 402 Payment Required を再活用し、API・コンテンツへのアクセスにステーブルコイン決済を直接組み込む Coinbase 主導のオープンプロトコル。AI エージェントによる自律決済を主要ユースケースに据える。",
    definition: [
      "x402 は、HTTP ステータスコード <code>402 Payment Required</code> を実運用に転用する決済プロトコルである。クライアントが保護リソースへ GET を投げると、サーバが 402 とともに支払い要件 (金額・通貨・受取アドレス・facilitator 情報) を返す。クライアントは要件に応じた支払いペイロードを生成し、<code>X-PAYMENT</code> ヘッダに乗せて再リクエストを送る。サーバは facilitator を介して検証・決済を確定し、200 とともにリソースを返す。",
      "技術特性として、(1) アカウント・セッション・OAuth フローが不要、(2) EVM チェーン (Base, Polygon, Arbitrum など) と Solana を含む複数ネットワーク対応、(3) ERC-20 ベースでステーブルコイン以外も扱える、(4) 拡張機構によりサービス発見・認証を取り込める、という点が挙げられる。Coinbase Developer Platform はホスト型 facilitator を提供する。",
      "x402 が解こうとしているのは「人間用 UI を介さない経済活動の決済層」である。AI エージェントが API を有償呼び出しする、エージェント同士が成果物を交換する、コンテンツが従量課金で消費される──こうした用途で、人間の都度承認を介さずに完結する仕組みを HTTP の最小拡張で実現する。",
    ],
    implementation: [
      'Lemma は x402 に検証可能性を加える層を <a href="/ja/glossary/trust402/">Trust402</a> として実装している。x402 単体は「決済が成立したかどうか」を解決するが、Trust402 はそれに加えて「<strong>正当な権限を持つエージェントが、許可された範囲内で、宣言された目的のために支払った</strong>」事実を <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で残す。',
      '具体的には、(1) エージェントへの権限委譲を <a href="/ja/glossary/commitment/">コミットメント</a> として固定し、(2) 支払い時刻・金額・宛先・目的を <a href="/ja/glossary/provenance/">プロヴナンス</a> チェーンに紐付け、(3) その存在を ZK で公開する。委任元・委任先・支払い詳細は <a href="/ja/glossary/selective-disclosure/">選択的開示</a> により監査者だけが必要な層まで開示できる。',
      "結果として x402 + Trust402 は、エージェント経済における「決済の事実」と「決済の正当性」を分離して扱える唯一の経路となる。決済が成立しただけでは規制適合や監査要件を満たさない領域 (金融機関の AI、企業の調達、自治体の支出) に、x402 を持ち込むための前提条件をここで揃える。",
    ],
    related: [
      { slug: "trust402", desc: "x402 に検証可能性を加える Lemma のリファレンス実装。" },
      { slug: "zk-proof", desc: "権限委譲と支払い目的を秘匿したまま証明する暗号プリミティブ。" },
      { slug: "eip-3009", desc: "署名による事前承認型 ERC-20 送金規格。x402 の決済機構の基礎の一つ。" },
      { slug: "facilitator", desc: "x402 決済の検証・実行を仲介する役割。" },
    ],
    ctaH2: "x402 の決済に、検証可能性を。",
  },
  {
    slug: "trust402",
    nameJa: "Trust402",
    nameEn: "Trust402 — Lemma's verifiable x402 layer",
    category: "プロトコル・エージェント",
    description:
      "x402 決済プロトコルに検証可能性を加える Lemma のリファレンス実装。決済の事実だけでなく、決済の正当性 (権限・目的・範囲) を暗号で証明する。",
    lead:
      '<a href="/ja/glossary/x402/">x402</a> 決済プロトコルに検証可能性を加える Lemma のリファレンス実装。決済の事実だけでなく、決済の正当性 (権限・目的・範囲) を暗号で証明する。',
    definition: [
      "x402 単体は「支払いが成立したか」を解決するが、エージェント経済では「正当な権限を持つエージェントが、許可された範囲内で、宣言された目的のために支払ったか」が追加で問われる。Trust402 はこの第二の問いに答える層。",
      '構造は三段で構成される。(1) 委任側 (人間または上位エージェント) が支払い権限を <a href="/ja/glossary/commitment/">コミットメント</a> として発行、(2) 委任先エージェントが x402 経由で決済を実行する際、権限の有効性を <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で示す、(3) Facilitator が決済の検証時に証明も同時検証する。',
      '開発者は Explorer (試行)・Builder (統合)・Studio (運用)・Pro (本番) の四段階で導入できる構成。<a href="/ja/glossary/eip-3009/">EIP-3009</a> のメタトランザクション、<a href="/ja/glossary/facilitator/">Facilitator</a> サービスの両方と互換性を保つ。',
    ],
    implementation: [
      "Trust402 は Lemma の暗号インフラ (docHash + commitment + ZK 証明) の上に、x402 仕様への変換層を実装する。既存の x402 クライアント・サーバから見ると、追加の HTTP ヘッダ <code>X-PROOF</code> を扱えるかどうかの差にしか見えない設計。",
      "金融機関の自律エージェント、組織の調達自動化、自治体の支出 API──いずれも「支払いの事実」だけでは規制が満たせず、「支払いの正当性」が要る領域。Trust402 はその橋渡し役。",
      '<a href="/ja/glossary/audit-trail/">監査トレイル</a> に決済 + 証明を残すことで、事後監査と規制適合の両方が成立する。',
    ],
    related: [
      { slug: "x402", desc: "Trust402 のベースとなる決済プロトコル。" },
      { slug: "eip-3009", desc: "EVM スキームでの決済機構。" },
      { slug: "facilitator", desc: "x402 決済の仲介サービス。Trust402 はこれに透過対応。" },
      { slug: "zk-proof", desc: "Trust402 の正当性証明を担う暗号プリミティブ。" },
    ],
    ctaH2: "x402 に、検証可能性を実装する。",
  },
  {
    slug: "eip-3009",
    nameJa: "EIP-3009",
    nameEn: "EIP-3009 — Transfer With Authorization",
    category: "プロトコル・エージェント",
    description:
      "ERC-20 トークンの送金を、ガス代を払わずに署名だけで承認する Ethereum 拡張規格。署名者・宛先・金額・有効期間・ノンスを EIP-712 で署名し、第三者が送信する。",
    lead:
      "ERC-20 トークンの送金を、ガス代を払わずに署名だけで承認する Ethereum 拡張規格。署名者・宛先・金額・有効期間・ノンスを EIP-712 で署名し、第三者が送信する。",
    definition: [
      "署名対象は <code>TransferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce)</code> の構造化メッセージ。EIP-712 typed-data 形式で署名されるため、リプレイ攻撃やネットワーク間混同が防がれる。",
      "ノンスはユーザが選ぶ 32 バイト値で、トークンコントラクトが「使用済みノンス」を bitmap で管理する。これにより EIP-2612 のような連番ノンスと異なり、並行する承認を順不同で処理できる。",
      "<code>validAfter</code> / <code>validBefore</code> による時間窓制御が可能で、「今署名・2 週間後に有効化・3 週間後に失効」のようなスケジュール決済を扱える。USDC をはじめ主要ステーブルコインが採用。",
    ],
    implementation: [
      '<a href="/ja/glossary/x402/">x402</a> の EVM スキーム (<code>scheme_exact_evm</code>) は EIP-3009 の <code>transferWithAuthorization</code> を決済機構として直接採用する。クライアントは支払いペイロードに EIP-3009 署名を含め、<a href="/ja/glossary/facilitator/">Facilitator</a> がそれを on-chain に提出する。',
      'Lemma の <a href="/ja/glossary/trust402/">Trust402</a> は、EIP-3009 署名に加えて権限委譲証明を要求することで、署名の「機械的な有効性」と「組織的な正当性」を分離して検証する。',
      "宛先がメッセージに直接埋め込まれるため、フィッシング被害下の署名でも被害範囲が限定される (送金先が固定)。EIP-2612 (permit) より安全側に倒れた設計。",
    ],
    related: [
      { slug: "x402", desc: "EIP-3009 を決済機構として採用する HTTP プロトコル。" },
      { slug: "trust402", desc: "EIP-3009 署名に権限証明を重ねる Lemma 実装。" },
      { slug: "facilitator", desc: "EIP-3009 署名を on-chain に提出する仲介役。" },
      { slug: "a2a", desc: "エージェント協調の上で EIP-3009 決済を実行する場面。" },
    ],
    ctaH2: "署名一発の決済を、検証可能に拡張する。",
  },
  {
    slug: "facilitator",
    nameJa: "Facilitator",
    nameEn: "Facilitator — x402 settlement intermediary",
    category: "プロトコル・エージェント",
    description:
      "x402 決済の検証と実行を仲介するサービス。クライアントの支払いペイロードを on-chain に提出し、決済の成立をリソースサーバへ返す役割を担う。",
    lead:
      "x402 決済の検証と実行を仲介するサービス。クライアントの支払いペイロードを on-chain に提出し、決済の成立をサーバへ返す役割を担う。",
    definition: [
      "x402 の純粋な P2P 構成では、リソースサーバ自身が on-chain 状態を確認する必要があり、サーバ側の運用負荷が大きい。Facilitator はこの層を切り出し、決済の検証・送信・確認の各ステップを集約する。",
      "Coinbase Developer Platform は Coinbase ホスト型の Facilitator を提供しており、Base / Polygon / Arbitrum / World / Solana に対応する。月 1,000 トランザクションまでの無料枠を持つ。",
      "Facilitator はクライアントの秘密情報を持たない (秘匿性ではなく可用性のための仲介)。決済署名はクライアント側で完結しており、Facilitator は提出と検証のみを行う。複数 Facilitator を選択可能な設計。",
    ],
    implementation: [
      'Lemma の <a href="/ja/glossary/trust402/">Trust402</a> は、既存 Facilitator に対して透過的に動作する。<code>X-PAYMENT</code> ヘッダ (<a href="/ja/glossary/x402/">x402</a> 標準) と <code>X-PROOF</code> ヘッダ (Trust402 拡張) を分離することで、検証可能性ヘッダを理解しない Facilitator でも基本決済は通る。',
      '検証可能性が必須となる用途 (金融機関・公共調達) では、Trust402 対応 Facilitator が <code>X-PROOF</code> を <a href="/ja/glossary/zk-proof/">ZK</a> 検証し、両方の検証通過後に決済を確定する設計。',
      '<a href="/ja/glossary/eip-3009/">EIP-3009</a> 署名を on-chain に提出するガス費用は Facilitator が立替・回収する。クライアント側はガス管理から完全に解放される。',
    ],
    related: [
      { slug: "x402", desc: "Facilitator が仲介する基本プロトコル。" },
      { slug: "trust402", desc: "X-PROOF を理解する拡張版 Facilitator。" },
      { slug: "eip-3009", desc: "Facilitator が on-chain に提出する署名規格。" },
      { slug: "a2a", desc: "エージェント協調から Facilitator を呼び出す経路。" },
    ],
    ctaH2: "決済仲介に、検証層を組み込む。",
  },
  {
    slug: "a2a",
    nameJa: "A2A",
    nameEn: "Agent2Agent — A2A",
    category: "プロトコル・エージェント",
    description:
      "AI エージェント同士の通信・連携を標準化するオープンプロトコル。Google が 2025 年に提唱し、2026 年に Linux Foundation 配下の独立プロジェクトへ移管。",
    lead:
      "AI エージェント同士の通信・連携を標準化するオープンプロトコル。Google が 2025 年に提唱し、2026 年に Linux Foundation 配下の独立プロジェクトへ移管された。",
    definition: [
      "A2A は三つの基本要素で構成される。(1) Agent Card: エージェントが自身の能力を JSON で宣言、(2) Task: エージェント間でやり取りする作業単位 (ライフサイクルを持つ)、(3) Transport: JSON-RPC 2.0 over HTTPS + Server-Sent Events で実装。",
      "2026 年時点で 150+ 組織が支持を表明 (Microsoft, AWS, Salesforce, SAP, ServiceNow, Workday, IBM など)。v1.0 安定版でマルチプロトコル対応・エンタープライズ向けマルチテナント・近代化されたセキュリティフローを搭載。",
      '<a href="/ja/glossary/mcp/">MCP</a> がエージェントとツールの接続を扱うのに対し、A2A はエージェント同士の対等な協調を扱う。両者は補完関係にあり、現実のシステムでは併用される。',
    ],
    implementation: [
      'Lemma は A2A プロトコル上で動くエージェントに対し、(1) エージェント自身の同一性と能力宣言を <a href="/ja/glossary/commitment/">コミットメント</a> で固定、(2) Task の実行履歴を <a href="/ja/glossary/audit-trail/">監査トレイル</a> として残す、(3) エージェント間の権限委譲を <a href="/ja/glossary/zk-proof/">ZK 証明</a> で検証する、という構成を提供する。',
      "金融・公共・規制業務では「どのエージェントが」「どの権限で」「何を実行したか」が事後に検証可能でなければならない。A2A の Agent Card / Task 構造に、Lemma の検証層を直接バインドする設計。",
      'A2A 経由の決済が発生する場合は <a href="/ja/glossary/x402/">x402</a> + <a href="/ja/glossary/trust402/">Trust402</a> と組み合わせ、協調・決済・監査の一貫した検証可能チェーンを作る。',
    ],
    related: [
      { slug: "mcp", desc: "A2A と相互補完の関係にある接続規格。" },
      { slug: "x402", desc: "A2A 上で発生する経済活動の決済層。" },
      { slug: "trust402", desc: "A2A 決済に検証可能性を加える Lemma 実装。" },
      { slug: "audit-trail", desc: "A2A 上の Task 実行履歴を残す仕組み。" },
    ],
    ctaH2: "エージェント協調に、検証層を。",
  },
  {
    slug: "mcp",
    nameJa: "MCP",
    nameEn: "Model Context Protocol — MCP",
    category: "プロトコル・エージェント",
    description:
      "AI モデルが外部ツール・データソース・サービスに統一規格で接続するためのオープンプロトコル。Anthropic が 2024 年 11 月公開、2025 年 12 月に Linux Foundation 配下の AAIF へ寄贈。",
    lead:
      "AI モデルが外部ツール・データソース・サービスに統一規格で接続するためのオープンプロトコル。Anthropic が 2024 年 11 月に公開、2025 年 12 月に Linux Foundation 配下の AAIF に寄贈された。",
    definition: [
      "MCP はクライアント (モデル側) とサーバ (ツール側) の通信を JSON-RPC ベースで標準化する。サーバ側は <code>tools</code> / <code>resources</code> / <code>prompts</code> を能力として公開し、クライアントは必要に応じて呼び出す。",
      "最新仕様は 2025-11-25 版が authoritative。2026 年には MCP Apps (SEP-1865) として、テキスト・構造化データに加えて React ベースの対話的 UI をホスト側に配信する拡張が標準化された。",
      "MCP は Anthropic・Block・OpenAI 共同創設の Agentic AI Foundation (AAIF) に移管され、ベンダー中立な標準となった。Claude・ChatGPT・主要 IDE での実装が並行して進む。",
    ],
    implementation: [
      'Lemma 自身が MCP サーバを提供し、AI エージェントが <a href="/ja/glossary/zk-proof/">ZK 証明</a> 生成・<a href="/ja/glossary/provenance/">プロヴナンス</a> 検証・<a href="/ja/glossary/selective-disclosure/">選択的開示</a> を MCP ツールとして呼び出せる。',
      'MCP 接続の各 Tool 呼び出しは <a href="/ja/glossary/audit-trail/">監査トレイル</a> に記録され、後から「どのモデルがどのツールをどの権限で呼び出したか」が検証可能。<a href="/ja/glossary/a2a/">A2A</a> と組み合わせると、エージェント協調全体が監査対象になる。',
      '<a href="/ja/glossary/verifiable-ai/">検証可能 AI</a> パイプラインに MCP を組み込むことで、モデル・ツール・データの三者間の境界も暗号的に検証可能となる。',
    ],
    related: [
      { slug: "a2a", desc: "MCP と相互補完のエージェント協調プロトコル。" },
      { slug: "x402", desc: "MCP ツール呼び出しに従量課金を組み込む経路。" },
      { slug: "audit-trail", desc: "MCP 呼び出し履歴を改ざん不能に残す仕組み。" },
      { slug: "verifiable-ai", desc: "MCP を組み込んだ検証可能 AI パイプライン。" },
    ],
    ctaH2: "AI とツールの接続を、検証可能に。",
  },

  // ============ 規制・コンプライアンス ============
  {
    slug: "kyc-aml",
    nameJa: "KYC / AML",
    nameEn: "Know Your Customer / Anti-Money Laundering",
    category: "規制・コンプライアンス",
    description:
      "金融機関や暗号資産事業者が顧客の身元を確認 (KYC) し、資金洗浄やテロ資金供与の経路を遮断 (AML) するための国際的な法規制群。",
    lead:
      "金融機関・暗号資産事業者が顧客の身元を確認 (KYC) し、資金洗浄・テロ資金供与の経路を遮断 (AML) するための国際的な法規制群。",
    definition: [
      "KYC は金融機関が顧客の本人性・実在性・実質的支配者・取引目的を確認する義務。AML は不審取引のモニタリング・報告・凍結を含む。国際枠組みは FATF (金融活動作業部会) の勧告で、各国法 (米 BSA、EU AMLD、日本犯収法) に転写される。",
      "2026 年時点で EU は AMLR (Anti-Money Laundering Regulation) + AMLD6 + AMLA (新規制機関) で枠組みを刷新し、暗号資産取引業者にも拡大適用が進む。違反は業務停止・巨額制裁金に直結する。",
      "KYC/AML の中核課題はプライバシーとの両立。顧客から大量の機微情報を収集する必要があるが、データ漏洩・横流し・営業利用のリスクが大きい。属性ベースの最小開示が技術的解の方向。",
    ],
    implementation: [
      'Lemma は KYC 属性 (国籍・年齢・本人確認済みフラグ・制裁リスト非該当) を <a href="/ja/glossary/commitment/">コミットメント</a> として発行者が署名し、顧客が金融機関ごとに必要な属性のみ <a href="/ja/glossary/selective-disclosure/">選択的開示</a> で提示できる構成を提供する。',
      "金融機関側は本人確認の責任を満たしつつ、原データを保管する必要が消える。GDPR の最小化原則・データ越境制限と、KYC/AML 要件を同時に満たす経路がここで成立する。",
      '<a href="/ja/glossary/audit-trail/">監査トレイル</a> として、誰がいつどの属性を確認したかを <a href="/ja/glossary/zk-proof/">ZK</a> 付きで残せば、規制当局の事後検証にも耐える。',
    ],
    related: [
      { slug: "selective-disclosure", desc: "KYC で「属性のみ開示」を実現する手法。" },
      { slug: "eu-ai-act", desc: "AI を用いた KYC スコアリングへ適用される規制。" },
      { slug: "audit-trail", desc: "KYC 確認履歴を改ざん不能に残す仕組み。" },
      { slug: "zk-proof", desc: "属性開示の真正性を担う暗号プリミティブ。" },
    ],
    ctaH2: "本人確認を、データ共有なしに。",
  },
  {
    slug: "eu-ai-act",
    nameJa: "EU AI Act",
    nameEn: "EU Artificial Intelligence Act — Regulation (EU) 2024/1689",
    category: "規制・コンプライアンス",
    description:
      "EU AI Act の定義と Lemma Oracle での適合経路。4 つのリスク階層、2025-2027 年の施行スケジュール、高リスク AI への自動ログ・データガバナンス義務を解説。",
    lead:
      "AI システムをリスク階層で分類し、提供者および利用者に段階的義務を課す EU の規則。違反は最大 3,500 万ユーロまたは全世界年商の 7% の制裁金。",
    definition: [
      "EU AI Act は、AI システムを 4 つのリスク階層に分類する。<strong>unacceptable</strong> (禁止): 社会的スコアリングや無差別な生体監視など、基本的人権を侵害する用途。<strong>high</strong> (高リスク): 医療機器・採用・与信・教育評価・重要インフラ・法執行など、人の権利や安全に強く影響する用途。<strong>limited</strong> (限定): チャットボットやディープフェイクなど、透明性義務 (利用者への明示) が課される用途。<strong>minimal</strong> (最小): その他、追加義務なし。",
      "施行は段階的に進む。禁止行為と AI リテラシー義務は 2025 年 2 月、汎用 AI (GPAI) モデル提供者の義務は 2025 年 8 月、高リスクシステムへの本格義務と透明性ルールは 2026 年 8 月から適用される。高リスク AI に関しては、(1) ライフサイクル全体を通じたリスク管理、(2) 学習・検証データのガバナンス、(3) 監査に耐える技術文書、(4) 自動ログ取得、(5) 人間監督メカニズム、(6) 正確性・堅牢性・サイバーセキュリティが要件となる。",
      "GPAI 提供者には技術文書・利用説明・著作権遵守・学習データ要約の公開が課される。さらに「システミック・リスク」と判定された GPAI には、モデル評価・敵対的テスト・重大インシデント報告・サイバーセキュリティ対策が追加で求められる。",
    ],
    implementation: [
      'EU AI Act の高リスク要件は、「監査可能な状態を残し続けること」に集約される。Lemma は監査ログ・データガバナンス・人間監督の根拠を、<code>docHash</code> + 属性 <a href="/ja/glossary/commitment/">コミットメント</a> + <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で構成する。実データの開示は GDPR や営業秘密と衝突するが、属性のみを暗号で証明する設計なら、機密と適合が両立する。',
      '具体的には、(1) 学習・検証データの取得日・出所・分類を <a href="/ja/glossary/provenance/">プロヴナンス</a> として固定、(2) 推論ごとの入力・モデル・出力ハッシュを監査トレイルに残す、(3) 人間が承認した時刻と承認者属性を <a href="/ja/glossary/selective-disclosure/">選択的開示</a> で証明、という設計を採る。Lemma Compliance は金融機関の高リスク AI 用途、Lemma Civic は公共領域の AI 利用に対し、同一の検証層を提供する。',
      "EU AI Act が要請しているのは「AI が信頼できるかどうかを、後から検証できる状態にすること」である。Lemma の検証可能 AI 向け信頼インフラは、その状態を技術として実装するための具体的な経路となる。",
    ],
    related: [
      { slug: "verifiable-ai", desc: "高リスク AI 要件の自動ログ・データガバナンスを暗号で構成する領域。" },
      { slug: "provenance", desc: "学習データの来歴を改ざん不能に固定する仕組み。データガバナンス要件に直結。" },
      { slug: "selective-disclosure", desc: "監査者にだけ必要な属性を開示し、機密と適合を両立させる手法。" },
      { slug: "audit-trail", desc: "改ざん不能な実行履歴。高リスク AI の自動ログ義務に対応する技術構成。" },
    ],
    ctaH2: "EU AI Act の適合を、暗号で。",
    implementationHeading: "Lemma Oracle での適合経路",
  },
  {
    slug: "ai-business-guidelines",
    nameJa: "AI事業者ガイドライン",
    nameEn: "AI Business Operator Guidelines (METI / MIC)",
    category: "規制・コンプライアンス",
    description:
      "経済産業省・総務省が 2024 年 4 月に共同公開した、AI 開発者・提供者・利用者の責務を整理したソフトロー型ガイドライン。",
    lead:
      "経済産業省・総務省が 2024 年 4 月に共同公開した、AI 事業者向けの包括ガイドライン。AI 開発者・提供者・利用者の各立場における責務を整理する。",
    definition: [
      "AI 事業者ガイドラインは、既存の「AI 倫理ガイドライン」「人間中心の AI 社会原則」を統合・更新したソフトロー型の指針。経済産業省・総務省合同で策定し、随時改訂される (Version 1.x)。",
      "10 原則: (1) 人間中心、(2) 安全性、(3) 公平性、(4) プライバシー、(5) セキュリティ確保、(6) 透明性、(7) アカウンタビリティ、(8) 教育・リテラシー、(9) 公正競争、(10) イノベーション。立場ごと (開発者・提供者・利用者) に各原則の実装が示される。",
      "法的拘束力はないが、政府調達基準・業界自主規制の事実上の参照点。EU AI Act の高リスク要件と類似領域をカバーしつつ、技術中立・リスクベースのアプローチを採る。",
    ],
    implementation: [
      'Lemma は本ガイドラインが求める「透明性」「説明可能性」「監査可能性」の技術的裏付けを提供する。<code>docHash</code> + <a href="/ja/glossary/commitment/">コミットメント</a> + <a href="/ja/glossary/zk-proof/">ゼロ知識証明</a> で、AI ガバナンス報告書の根拠を具体化できる。',
      'AI 判断の入力・モデル・出力を <a href="/ja/glossary/audit-trail/">監査トレイル</a> として残し、説明責任の発生時に <a href="/ja/glossary/selective-disclosure/">選択的開示</a> で必要な属性のみ提示する設計。',
      '<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> 適合と並行運用すれば、グローバル展開する日本企業の AI ガバナンスを一本化できる。',
    ],
    related: [
      { slug: "eu-ai-act", desc: "並行参照される EU の AI 規制。技術的要件はほぼ同型。" },
      { slug: "ai-promotion-act", desc: "日本の AI 関連基本法。ガイドラインの上位枠組み。" },
      { slug: "verifiable-ai", desc: "透明性・説明可能性を暗号で構成する領域。" },
      { slug: "audit-trail", desc: "ガバナンス報告の根拠を改ざん不能に残す仕組み。" },
    ],
    ctaH2: "AI 事業者ガイドラインの適合を、暗号で。",
    implementationHeading: "Lemma Oracle での適合経路",
  },
  {
    slug: "ai-promotion-act",
    nameJa: "AI推進法",
    nameEn: "AI Promotion Act (Japan, 2025)",
    category: "規制・コンプライアンス",
    description:
      "2025 年 6 月成立、正式名称「人工知能関連技術の研究開発及び活用の推進に関する法律」。日本初の AI 関連ハードロー。",
    lead:
      "日本初の AI に関する基本法。2025 年 6 月 4 日成立。AI 戦略本部の設置、国家 AI 基本計画の策定、関連事業者への協力依頼権限などを規定。",
    definition: [
      "正式名称「人工知能関連技術の研究開発及び活用の推進に関する法律」。内閣総理大臣を本部長とする「AI 戦略本部」を設置し、政府の AI 基本計画を策定する義務を定める。",
      "中身は研究開発推進・人材育成・国際協調・リスク管理が中心。EU AI Act のような禁止行為や制裁金規定は含まず、推進と一部リスク対応が両輪。違反者への直接的制裁は限定的。",
      "枠組み法 (Skeleton Law) の性質を持ち、具体的義務は省令・政府策定の計画・各種ガイドライン (AI 事業者ガイドラインを含む) に委任される。今後の運用次第で実質的影響度が変動する。",
    ],
    implementation: [
      "Lemma の検証可能 AI 向け信頼インフラは本法の「責任ある研究開発・活用の推進」に技術的に応える経路となる。政府調達・公共領域 AI で検証可能性が要件化されていく流れに事前対応できる。",
      '<a href="/ja/glossary/ai-business-guidelines/">AI 事業者ガイドライン</a> と組み合わせると、ハードロー (推進法) + ソフトロー (ガイドライン) の両面で AI ガバナンスを揃えられる。',
      '<a href="/ja/glossary/eu-ai-act/">EU AI Act</a> 適合済みのインフラを日本側にも展開する形で、グローバルな AI 規制対応コストを最小化する。',
    ],
    related: [
      { slug: "ai-business-guidelines", desc: "推進法が委任する具体的ガイドライン。実装は事業者ガイドラインに準拠。" },
      { slug: "eu-ai-act", desc: "対応する EU 側の規制。並行参照対象。" },
      { slug: "verifiable-ai", desc: "推進法が要請する責任ある AI の技術的実装基盤。" },
      { slug: "audit-trail", desc: "事後検証可能性を担う仕組み。" },
    ],
    ctaH2: "日本の AI 規制対応を、技術で先取りする。",
    implementationHeading: "Lemma Oracle での適合経路",
  },
];

const TERMS_BY_SLUG: ReadonlyMap<GlossarySlug, GlossaryTerm> = new Map(
  GLOSSARY_TERMS.map((t) => [t.slug, t]),
);

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return TERMS_BY_SLUG.get(slug as GlossarySlug);
}

export function getAllGlossarySlugs(): ReadonlyArray<GlossarySlug> {
  return GLOSSARY_TERMS.map((t) => t.slug);
}

export const GLOSSARY_CATEGORIES: ReadonlyArray<GlossaryCategory> = [
  "暗号レイヤ",
  "検証可能AI",
  "プロトコル・エージェント",
  "規制・コンプライアンス",
];

export interface GlossaryCategoryGroup {
  readonly category: GlossaryCategory;
  readonly label: string;
  readonly description: string;
  readonly terms: ReadonlyArray<GlossaryTerm>;
}

const CATEGORY_DESCRIPTIONS: Readonly<Record<GlossaryCategory, string>> = {
  暗号レイヤ:
    "Lemma が証明・開示・改ざん検知に用いる暗号プリミティブ。ZK 証明、対称暗号、ハッシュ、コミットメントの基礎用語。",
  検証可能AI:
    "AI の判断・引用・推論履歴を暗号で検証可能にするための用語群。来歴、引用、監査の基本概念。",
  "プロトコル・エージェント":
    "自律エージェント取引と機械間決済のプロトコル群。x402、Trust402、MCP、A2A の周辺仕様。",
  "規制・コンプライアンス":
    "Lemma の証明が直接接続する規制フレームワーク。EU・日本の AI 規制と本人確認 (KYC/AML) の主要法令。",
};

export function getGlossaryByCategory(): ReadonlyArray<GlossaryCategoryGroup> {
  return GLOSSARY_CATEGORIES.map((category, i) => ({
    category,
    label: `${String(i + 1).padStart(2, "0")} · ${category}`,
    description: CATEGORY_DESCRIPTIONS[category],
    terms: GLOSSARY_TERMS.filter((t) => t.category === category),
  }));
}
