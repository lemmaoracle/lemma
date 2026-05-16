/**
 * Live Oracle Pipeline fixtures.
 *
 * 24 pre-populated documents that the demo renders on first load, so the
 * dashboard view never reads as empty/staged. The mock pipeline animation
 * progresses a subset of these through Received → Verifying → Verified /
 * On-chain so the table visibly moves while the user is looking at it.
 *
 * Sample-driven rows (the 6 chips in the topbar) are appended at runtime
 * and not stored here; see `data/fixtures.ts` for the Sample fixtures.
 */

export type PipelineStatus =
  | "received"
  | "verifying"
  | "verified"
  | "onchain"
  | "rejected";

export type PipelineSchema =
  | "identity-v1"
  | "kyc-aml-v2"
  | "credit-score-v1"
  | "asset-proof-v1"
  | "income-v1"
  | "education-v1";

export type PipelineChain =
  | "Monad Testnet"
  | "Ethereum"
  | "Base"
  | "Polygon"
  | "Arbitrum";

export type CommitmentScheme =
  | "rescue-prime"
  | "sha256-placeholder"
  | "poseidon";

export type SignatureFormat = "bbs+" | "opaque" | "ed25519";

/** Family token used for the coloured square in the SCHEMA column. */
export type SchemaFamily =
  | "identity"
  | "kyc"
  | "credit"
  | "asset"
  | "income"
  | "education";

export const SCHEMA_FAMILY: Readonly<Record<PipelineSchema, SchemaFamily>> = {
  "identity-v1": "identity",
  "kyc-aml-v2": "kyc",
  "credit-score-v1": "credit",
  "asset-proof-v1": "asset",
  "income-v1": "income",
  "education-v1": "education",
};

export const SCHEMA_LABEL: Readonly<Record<PipelineSchema, string>> = {
  "identity-v1": "Identity",
  "kyc-aml-v2": "KYC/AML",
  "credit-score-v1": "Credit Score",
  "asset-proof-v1": "Asset Proof",
  "income-v1": "Income",
  "education-v1": "Education",
};

export interface PipelineEntry {
  /** docHash, displayed as 0xabc…1234 in the DOCUMENT column. */
  readonly docHash: string;
  readonly schema: PipelineSchema;
  /** Initial status. The mock pipeline may transition this at runtime. */
  readonly status: PipelineStatus;
  readonly chain: PipelineChain;
  /** ISO 8601. The UI renders "Nh ago" relative to load time. */
  readonly updatedAt: string;
  readonly ipfsCid: string;
  readonly issuer: string;
  readonly subject: string;
  readonly commitmentScheme: CommitmentScheme;
  readonly commitmentRoot: string;
  readonly revocationRoot: string;
  readonly signatureFormat: SignatureFormat;
  /** Optional hook executions surfaced in the detail panel. */
  readonly hooks?: ReadonlyArray<{
    readonly name: string;
    readonly status: "succeeded" | "failed";
  }>;
  /**
   * Reason text shown when status === "rejected". The detail panel reads
   * this verbatim under the failing pipeline step.
   */
  readonly rejectionReason?: string;
}

/**
 * Deterministic 24 entries matching the screenshot reference.
 *
 * Timestamps use an `updatedAtOffsetMin` interpretation at render time
 * (load time minus N minutes) so the relative labels stay realistic
 * across reloads without baking real dates in.
 */
export const PIPELINE_FIXTURES: ReadonlyArray<PipelineEntry> = [
  {
    docHash: "0x47c339d18b21bb5a7c012cd1474ecf",
    schema: "kyc-aml-v2",
    status: "rejected",
    chain: "Polygon",
    updatedAt: relative(240),
    ipfsCid: "bafybeigwl4f3bd9aa1d2",
    issuer: "0x12a4b6dcf2d42ba9af31",
    subject: "0x3a3b29c69aa4779b86ca",
    commitmentScheme: "sha256-placeholder",
    commitmentRoot: "0x9a217d0c63a31a05ce914cc2b8c0c0bd",
    revocationRoot: "0x00c2ce3d28c51ab58aa8971b8d29e87b",
    signatureFormat: "opaque",
    rejectionReason: "Sanction list hit at registration time.",
  },
  {
    docHash: "0xf14a29ea301cc7c33d4ea1cecf",
    schema: "identity-v1",
    status: "verifying",
    chain: "Base",
    updatedAt: relative(120),
    ipfsCid: "bafybeibq3afe1290cd",
    issuer: "0x78e1a6dcf2d42ba10d3a",
    subject: "0x740bfc925de9cd93b009",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xc70cc5f1ac957ca903e64ce63396bfb5",
    revocationRoot: "0xccb055138d09d782d8b20c4cbbd29764",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xe545eed3aa1c66da7172b7e6",
    schema: "identity-v1",
    status: "verifying",
    chain: "Polygon",
    updatedAt: relative(300),
    ipfsCid: "bafybeigff3aa7fcde2",
    issuer: "0xa68a3d72c8421e9ffaa3",
    subject: "0x1290c83cb71afa2c50ed",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xbb1e2c30b87c901c98c1ae5e0118f4ab",
    revocationRoot: "0x55ac3e2d11ce80a04b5e34a991c79f33",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xb1a227e3a44d0e6d09aa",
    schema: "education-v1",
    status: "rejected",
    chain: "Base",
    updatedAt: relative(240),
    ipfsCid: "bafybeigdd9bc1163fb4",
    issuer: "0x7a4bd7c372859f22322f",
    subject: "0xae01ef3291cefb1b5855",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xab1881e6c1b72d625ead694acf9e9e25",
    revocationRoot: "0x1e56e44f0314ed1c1e68e29b75d2998a",
    signatureFormat: "bbs+",
    rejectionReason: "Circuit validation failed.",
  },
  {
    docHash: "0xe7715f9b3e0c6c41a704942c",
    schema: "kyc-aml-v2",
    status: "rejected",
    chain: "Polygon",
    updatedAt: relative(13),
    ipfsCid: "bafybeigp1cc8f9dbe4",
    issuer: "0xb290c3da7124ea001271",
    subject: "0x6e91b3829ad0c5a0917b",
    commitmentScheme: "sha256-placeholder",
    commitmentRoot: "0xaa3122c61f0db1a0c1ba1c9c0019cf12",
    revocationRoot: "0x1a3322c11c7ab9019d710bdc01ee2718",
    signatureFormat: "opaque",
    rejectionReason: "Schema version downgrade not allowed.",
  },
  {
    docHash: "0xa67b5d916ec01a05579773",
    schema: "asset-proof-v1",
    status: "rejected",
    chain: "Base",
    updatedAt: relative(660),
    ipfsCid: "bafybeigaa7fcdaeb1c",
    issuer: "0xc9a01fb27d8932ea118a",
    subject: "0xf81a89b2c10d33ea71e0",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xbb2a219c1118a3001a5b1eaa2f88c021",
    revocationRoot: "0x44d3192c918aa007cd1ba4b81e7a3c01",
    signatureFormat: "bbs+",
    rejectionReason: "Asset attestation expired.",
  },
  {
    docHash: "0x698351da50a2ab2dafb5f0",
    schema: "income-v1",
    status: "verifying",
    chain: "Polygon",
    updatedAt: relative(240),
    ipfsCid: "bafybeiha7cce2ddd2",
    issuer: "0xfa8c1b39e1a72eda9b0c",
    subject: "0xd11c0bfa92e8c0a3f12c",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xda98e530056fc9afca76799e8bfe69ca",
    revocationRoot: "0xfb47a306bfdaaa38094883484d8b9dde",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xc3f9e89f7eaa10d50bcd",
    schema: "identity-v1",
    status: "rejected",
    chain: "Monad Testnet",
    updatedAt: relative(600),
    ipfsCid: "bafybeicc8eecd0915",
    issuer: "0x21f10bd5172cda01b21f",
    subject: "0x8bb1c2cd0a30be91cb22",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xb01e23e10bef27c3d09a18c87c5e1f3a",
    revocationRoot: "0xa18372c7e10ce9d8c01b88a3f0c19eee",
    signatureFormat: "bbs+",
    rejectionReason: "Issuer signature did not verify.",
  },
  {
    docHash: "0x29316d7d4ec0c25024ac",
    schema: "asset-proof-v1",
    status: "received",
    chain: "Ethereum",
    updatedAt: relative(540),
    ipfsCid: "bafybeib3aef4cdaa1c",
    issuer: "0x108e92a37ae012a0a1bb",
    subject: "0xa01382bc12cd0987c1e1",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xbb2a01e23ec1ed1cb0a91a2e8f1ca029",
    revocationRoot: "0x99e0a1c728eb5102be8aab37c41ec2c0",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0x9c0d3f5ea3c896b373",
    schema: "identity-v1",
    status: "received",
    chain: "Base",
    updatedAt: relative(480),
    ipfsCid: "bafybeiec8c44eef72",
    issuer: "0x328b1c01edf7c2a39102",
    subject: "0x4c91dc0a2c01bd91c81e",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0x10b1c2c9e8cdb16ca72cd3119a30c08e",
    revocationRoot: "0xc721918a3c1b00c0c01a59ad0c83d18c",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0x4501a9a52ec0d08a20",
    schema: "asset-proof-v1",
    status: "received",
    chain: "Base",
    updatedAt: relative(60),
    ipfsCid: "bafybeiba1c0e7c0192",
    issuer: "0x99a0c12eda32cba1cd9f",
    subject: "0xc1a3782b54e8ad12c331",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xc11a0b1ad4dc9100b0bd1c12c7a818aa",
    revocationRoot: "0xf831c012c10ad991ce71b3a9d2cda812",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0x79b8c6b1cee0c2e40e4a",
    schema: "kyc-aml-v2",
    status: "onchain",
    chain: "Ethereum",
    updatedAt: relative(540),
    ipfsCid: "bafybeic7110a91dc02",
    issuer: "0x91aa01ce72b1c0ad32f1",
    subject: "0x32eaa0c11ee2c19f7301",
    commitmentScheme: "sha256-placeholder",
    commitmentRoot: "0x88c1290dab7c1cd0001a98c220d11abf",
    revocationRoot: "0x12ddc3001ac81bef10c000a78e1c8edb",
    signatureFormat: "opaque",
    hooks: [
      { name: "onLemmaDocumentRegistered", status: "succeeded" },
      { name: "onLemmaProofVerified", status: "succeeded" },
    ],
  },
  {
    docHash: "0xbd5a3ceb1cf8e337cbc",
    schema: "kyc-aml-v2",
    status: "verified",
    chain: "Monad Testnet",
    updatedAt: relative(120),
    ipfsCid: "bafybeigge70aa7fcdc52",
    issuer: "0xa6c42acaa7704eff4972",
    subject: "0x3a3b29c69aa4779b86ca",
    commitmentScheme: "sha256-placeholder",
    commitmentRoot: "0x86355b9d86b05525b194d495a069c590",
    revocationRoot: "0x00c2ce3d28c51ab58aa8971b8d29e87b",
    signatureFormat: "opaque",
    hooks: [{ name: "onLemmaDocumentRegistered", status: "succeeded" }],
  },
  {
    docHash: "0x40cc764fef3a3f9e2b",
    schema: "education-v1",
    status: "verifying",
    chain: "Ethereum",
    updatedAt: relative(480),
    ipfsCid: "bafybeicedf1c44e02b",
    issuer: "0x119a3b29c89aa477983e",
    subject: "0xfee10c2ad0f7a8bf3aa1",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xfa90c1a9c9a0ce29ad81100be9c89099",
    revocationRoot: "0xae0c00911aa31f17ae001d291ce7c2cd",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0x27508dc2e2e3151e75",
    schema: "credit-score-v1",
    status: "verifying",
    chain: "Ethereum",
    updatedAt: relative(480),
    ipfsCid: "bafybeicgg7a3cce2eee",
    issuer: "0x07a2fc8e7f92fdaf6727",
    subject: "0x609b18a68c6dafa8cd19",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xda98e530056fc9afca76799e8bfe69ca",
    revocationRoot: "0xfb47a306bfdaaa38094883484d8b9dde",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xc2570f89cef25e0c",
    schema: "identity-v1",
    status: "rejected",
    chain: "Base",
    updatedAt: relative(420),
    ipfsCid: "bafybeibcc8eecd0883",
    issuer: "0x42e8a0bf9b1c0dab9b3e",
    subject: "0xaa291cd0bda1eccc8312",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xb01ea11ec02d12c1b9a081ed0010c0a1",
    revocationRoot: "0xc8c2c19df0a311abc00bd92ea0f3c81d",
    signatureFormat: "bbs+",
    rejectionReason: "BBS+ revocation list flagged subject.",
  },
  {
    docHash: "0x6d5556745b92f59e",
    schema: "asset-proof-v1",
    status: "received",
    chain: "Base",
    updatedAt: relative(240),
    ipfsCid: "bafybeiacc1199ee01b",
    issuer: "0xbb1a01cc09ed3a82c012",
    subject: "0xcd9132ea0a1b9871adcb",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xbb22019dcd1011a82c11df1010aa0b91",
    revocationRoot: "0x10aa1c3ae22c0b1ed91ef10aa7e21cd1",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xa4f19728c9dbe60b",
    schema: "credit-score-v1",
    status: "onchain",
    chain: "Ethereum",
    updatedAt: relative(300),
    ipfsCid: "bafybeibcdcd0aac192",
    issuer: "0x18a0cb12e9d0aab21c91",
    subject: "0xc01b1ea0e7c9712ed1ad",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xfde910c8a2cd4b1c0a91d7c12a78d013",
    revocationRoot: "0xab012c79e108cd1eaa00b3ad0c1c0c01",
    signatureFormat: "bbs+",
    hooks: [
      { name: "onLemmaDocumentRegistered", status: "succeeded" },
      { name: "onLemmaProofVerified", status: "succeeded" },
    ],
  },
  {
    docHash: "0x08da3cb7c1eee9",
    schema: "identity-v1",
    status: "verified",
    chain: "Arbitrum",
    updatedAt: relative(120),
    ipfsCid: "bafybeib7cee93dcc92",
    issuer: "0xb01c91ea1d72c0b1a1cd",
    subject: "0xaa0b1c2ed911d2e0aa19",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0x110a91bc01eef10018c2c01aef1f1c91",
    revocationRoot: "0xfa01ce0b2c12ed01aa01b3c91fde0c5c0",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xdf96007ec440eb",
    schema: "identity-v1",
    status: "verifying",
    chain: "Polygon",
    updatedAt: relative(45),
    ipfsCid: "bafybeicc8aecd9b1ee",
    issuer: "0xc70a91e1c1a91bc12e87",
    subject: "0xaa01c8b1e3c0aa0913de",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xcc1a8b3791ed00ca2c11a9100bdec812",
    revocationRoot: "0x10c11ae7c891a91b3c01ee0ae791c012",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0xbf69bc18f0c0900f35",
    schema: "credit-score-v1",
    status: "verifying",
    chain: "Base",
    updatedAt: relative(20),
    ipfsCid: "bafybeicc91ad0aaba1",
    issuer: "0x7891c1a9c0db091e2ca0",
    subject: "0xea91cd012a8c9b3c0eea",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xab2c8b9ad0aa8b91e3c1a0bd91eea0c12",
    revocationRoot: "0x10c1a92c0bdc01ec91a3c0ea91fcae87",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0x81154bc9aabbfbdc92",
    schema: "identity-v1",
    status: "received",
    chain: "Ethereum",
    updatedAt: relative(8),
    ipfsCid: "bafybeic8c8e0bb01ba",
    issuer: "0xaa01bc01edf9c11a91e0",
    subject: "0xbb01c2ea91d0a3c01b9c",
    commitmentScheme: "rescue-prime",
    commitmentRoot: "0xcc0aa1a9b3c01edff1019d0aae2ca12c",
    revocationRoot: "0x10c2a91b8c001a91e7c0aabd91ea2c01",
    signatureFormat: "bbs+",
  },
  {
    docHash: "0x19c721fa0bf3bd9e55",
    schema: "kyc-aml-v2",
    status: "rejected",
    chain: "Polygon",
    updatedAt: relative(5),
    ipfsCid: "bafybeib0e3a1ee9871",
    issuer: "0xea11b3c01ae8c91d0c08",
    subject: "0xb31d2e0aa1c0c01b9301",
    commitmentScheme: "sha256-placeholder",
    commitmentRoot: "0xaa01e2c01b9bd0e91a8b3c0aa01e0fa1",
    revocationRoot: "0x10c0a9b3c01eef0aa1d28ea91c01edc0",
    signatureFormat: "opaque",
    rejectionReason: "Schema validation failed: missing `tier` field.",
  },
  {
    docHash: "0x0a66ffb6fad7269",
    schema: "income-v1",
    status: "verified",
    chain: "Monad Testnet",
    updatedAt: relative(180),
    ipfsCid: "bafybeib3a1cee70a91",
    issuer: "0xb19a1cd11ec0a91b3c01",
    subject: "0xea01e2c01a93cd01eea1",
    commitmentScheme: "poseidon",
    commitmentRoot: "0xbe9c00a91ce0bd91a8c001aef10c8aa1",
    revocationRoot: "0x10a91cd0e21ec0aa01b3ce91d0a01c8b",
    signatureFormat: "bbs+",
    hooks: [{ name: "onLemmaDocumentRegistered", status: "succeeded" }],
  },
];

/**
 * Render-time helper: given "minutes ago", return the ISO timestamp the
 * mock pipeline should claim. Keeps the relative labels honest even
 * when the page sits idle for hours.
 */
function relative(minutesAgo: number): string {
  const now = Date.now();
  return new Date(now - minutesAgo * 60_000).toISOString();
}

export function formatRelative(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const sec = Math.max(1, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

/**
 * Truncate a 0x-hash into the 0xabc…1234 form the table uses. Returns
 * the input untouched if it's already short enough.
 */
export function truncateHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
