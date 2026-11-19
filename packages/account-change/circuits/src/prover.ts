/**
 * Prover inputs for AccountChangeV1 (ProofGate · GENIAC v1.1).
 *
 * Turns the pieces a prover actually holds —
 *
 *   - the demo vendor bundle (`demo-vendor.example.json`, TEST-ONLY),
 *   - the gate card payload that CLUBS hands out at
 *     `GET /api/gate-card/{ref}` (fixed inputs + challenge window),
 *   - the vendor's new bank account,
 *   - the bank-side evidence text,
 *
 * into the witness the circuit expects, and pins the 18 public signals
 * the gate will compare. The derivations below mirror
 * `circuits/src/account-change.circom` and are the same ones
 * `circuits/test/account-change.test.ts` uses, so the script and the
 * circuit tests cannot drift.
 *
 * Why a separate module: the CLI in `scripts/prove.ts` needs the same
 * checks as the tests, and the actual `groth16.fullProve` step needs the
 * built artifacts. Keeping the input build pure means it can be tested
 * without the circuit build.
 */
import { createHash } from "node:crypto";
import { poseidon1, poseidon2, poseidon4, poseidon5 } from "poseidon-lite";
import { accountHashOf, credentialCommitmentOf, type CredentialSpec } from "./derivations.js";

export const CIRCUIT_ID = "account-change-v1";

/** Public-signal positions (README「Public signal order (18 signals)」). */
export const SIGNAL = {
  contextHash: 0,
  attestationCommitment: 1,
  nullifier: 2,
  registryRoot: 3,
  credentialCommitment: 4,
  requiredRoleHash: 5,
  vendorId: 6,
  oldAccountHash: 7,
  newAccountHash: 8,
  isFirst: 9,
  audienceHash: 10,
  requestDigest: 11,
  requestReceivedAt: 12,
  challengeId: 13,
  challengeIssuedAt: 14,
  challengeExpiresAt: 15,
  policyHash: 16,
  bankEvidenceHash: 17,
} as const;

export const SIGNALS_LENGTH = 18;

/** Context branch tags (v1 assignments). */
const CONTEXT_DOMAIN_A = 1102n;
const CONTEXT_DOMAIN_B = 1103n;

export interface DemoBundleCredential {
  repSecret: string;
  roleName: string;
  legalName: string;
  credentialStatus: number;
  validFrom: number;
  validUntil: number;
  registeredAt: number;
  credentialSalt: string;
  merklePath: string[];
  merkleIndices: string[];
}

export interface DemoBundleAccount {
  bankCode: string;
  branchCode: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
}

export interface DemoVendorBundle {
  registryRoot: string;
  vendorId: string;
  requiredRoleHash: string;
  credential: DemoBundleCredential;
  oldAccount: DemoBundleAccount;
  oldAccountHash: string;
  circuitId: string;
}

/**
 * The gate-fixed part of a proof request, as handed to the prover.
 * CLUBS' `GET /api/gate-card/{ref}` returns it under `card.gate`;
 * a raw challenge record also carries `oldAccountHash` / `requestDigest`.
 */
export interface GateCardView {
  circuitId: string;
  registryRoot: string;
  vendorId: string;
  requiredRoleHash: string;
  audience: string;
  policy: string;
  requestCanonical: string;
  requestReceivedAt: number;
  challengeId: string;
  challengeIssuedAt: number;
  challengeExpiresAt: number;
  isFirst: 0 | 1;
  /** Present on the raw gate-card record (not in the public GET view). */
  oldAccountHash?: string;
  requestDigest?: string;
  /** Present on the raw gate-card record. */
  ref?: string;
}

export interface AccountFields {
  bankCode: string;
  branchCode: string;
  accountType: string;
  accountNumber: string;
  /** Defaults to the registered legal name (the holder binding requires it). */
  holderName?: string;
}

export interface BuildProverInputArgs {
  bundle: DemoVendorBundle;
  gate: GateCardView;
  account: AccountFields;
  /** fieldScalarOf(evidenceText) — provided by the caller or derived here. */
  bankEvidenceHash?: string;
  /** The text that appeared on the bank side (hashed here when no hash is given). */
  bankEvidenceText?: string;
}

export interface ProverBuildResult {
  input: Record<string, string | string[]>;
  /** 18 strings, in the contract order — what snarkjs must return. */
  expectedPublicSignals: string[];
  derivation: {
    credentialCommitment: string;
    newAccountHash: string;
    oldAccountHash: string;
    bankEvidenceHash: string;
    roleHash: string;
    legalNameHash: string;
    audienceHash: string;
    requestDigest: string;
    policyHash: string;
    contextHash: string;
    attestationCommitment: string;
    nullifier: string;
  };
}

const fail = (message: string): never => {
  throw new Error(message);
};

const FIELD_R = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617",
);

/**
 * The SDK's `commitments.toScalar` for strings (SHA-256 of the UTF-8
 * bytes, mod r). Kept byte-identical with `@lemmaoracle/sdk` — the CLI
 * asserts the two agree before proving.
 */
const sha256Hex = (text: string): string => createHash("sha256").update(text, "utf8").digest("hex");

export const scalarOf = (text: string): bigint => BigInt(`0x${sha256Hex(text)}`) % FIELD_R;

/** The demo shared name normalizer (trim + ASCII uppercase). */
export const normalizeName = (name: string): string => name.trim().toUpperCase();

/**
 * The 照合番号 shown on the proof card — same derivation as
 * `ProofCardSubmit.vue` (`shortRef`): alphanumerics only, first 10, upper.
 */
export const displayedRefOf = (ref: string): string =>
  ref
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 10)
    .toUpperCase();

const decimalOf = (value: unknown, what: string): string => {
  const text =
    typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  return /^\d+$/.test(text) ? text : fail(`${what} must be a decimal string, got ${String(value)}`);
};

const intOf = (value: unknown, what: string): number => {
  const text = decimalOf(value, what);
  const n = Number(text);
  return Number.isSafeInteger(n) ? n : fail(`${what} is out of range: ${text}`);
};

const strOf = (value: unknown, what: string): string => {
  if (typeof value !== "string" || value.trim() === "") return fail(`${what} is required (string)`);
  return value;
};

/**
 * Normalize the several shapes a challenge arrives in:
 *   - `{ ok, card: { ..., gate } }`   (GET /api/gate-card/{ref})
 *   - `{ gate: { ... } }`
 *   - `{ circuitId, registryRoot, ... }` (gate object or raw record)
 */
export const gateViewOf = (raw: unknown): GateCardView => {
  const root = (raw ?? {}) as Record<string, unknown>;
  const card = root.card as Record<string, unknown> | undefined;
  const gate = (card?.gate ?? root.gate ?? root) as Record<string, unknown>;
  const picked = (key: string): unknown => gate[key] ?? card?.[key] ?? root[key];
  const isFirstRaw = picked("isFirst");
  const isFirst =
    isFirstRaw === true || isFirstRaw === 1 || isFirstRaw === "1"
      ? 1
      : isFirstRaw === false || isFirstRaw === 0 || isFirstRaw === "0"
        ? 0
        : fail("gate.isFirst must be 0 or 1");
  const out: GateCardView = {
    circuitId: strOf(picked("circuitId"), "gate.circuitId"),
    registryRoot: decimalOf(picked("registryRoot"), "gate.registryRoot"),
    vendorId: decimalOf(picked("vendorId"), "gate.vendorId"),
    requiredRoleHash: decimalOf(picked("requiredRoleHash"), "gate.requiredRoleHash"),
    audience: strOf(picked("audience"), "gate.audience"),
    policy: strOf(picked("policy"), "gate.policy"),
    requestCanonical: strOf(picked("requestCanonical"), "gate.requestCanonical"),
    requestReceivedAt: intOf(picked("requestReceivedAt"), "gate.requestReceivedAt"),
    challengeId: decimalOf(picked("challengeId"), "gate.challengeId"),
    challengeIssuedAt: intOf(picked("challengeIssuedAt"), "gate.challengeIssuedAt"),
    challengeExpiresAt: intOf(picked("challengeExpiresAt"), "gate.challengeExpiresAt"),
    isFirst,
  };
  const oldAccountHash = picked("oldAccountHash");
  if (oldAccountHash !== undefined)
    out.oldAccountHash = decimalOf(oldAccountHash, "gate.oldAccountHash");
  const requestDigest = picked("requestDigest");
  if (requestDigest !== undefined)
    out.requestDigest = decimalOf(requestDigest, "gate.requestDigest");
  const ref = card?.ref ?? root.ref;
  if (typeof ref === "string" && ref.trim() !== "") out.ref = ref.trim();
  return out;
};

const parseBundle = (bundle: DemoVendorBundle): DemoVendorBundle => {
  if (bundle.circuitId !== CIRCUIT_ID)
    fail(`bundle.circuitId is ${bundle.circuitId}, expected ${CIRCUIT_ID}`);
  if (!Array.isArray(bundle.credential.merklePath) || bundle.credential.merklePath.length !== 20)
    fail("bundle.credential.merklePath must have 20 elements");
  if (
    !Array.isArray(bundle.credential.merkleIndices) ||
    bundle.credential.merkleIndices.length !== 20
  )
    fail("bundle.credential.merkleIndices must have 20 elements");
  return bundle;
};

/**
 * Build the witness and the expected public signals.
 *
 * Every gate-fixed input is cross-checked against the bundle, so a
 * re-seeded registry (`seed:demo-vendor`) fails here with an actionable
 * message instead of a witness error deep inside snarkjs.
 */
export const buildProverInput = (args: BuildProverInputArgs): ProverBuildResult => {
  const bundle = parseBundle(args.bundle);
  const gate = args.gate;
  if (gate.circuitId !== CIRCUIT_ID)
    fail(`gate.circuitId is ${gate.circuitId}, expected ${CIRCUIT_ID}`);

  /* Gate-fixed values must be the ones this bundle was issued for. */
  if (BigInt(gate.registryRoot) !== BigInt(bundle.registryRoot))
    fail(
      "registryRoot mismatch: the gate was re-seeded after this bundle was made.\n" +
        "Re-run `pnpm seed:demo-vendor`, update GATE_REGISTRY_ROOT (and the other " +
        "GATE_* values) on the CLUBS side, then request a new proof card.",
    );
  if (BigInt(gate.vendorId) !== BigInt(bundle.vendorId))
    fail("vendorId mismatch: the bundle and the gate card disagree");
  if (BigInt(gate.requiredRoleHash) !== BigInt(bundle.requiredRoleHash))
    fail("requiredRoleHash mismatch: the bundle and the gate card disagree");
  if (gate.oldAccountHash !== undefined) {
    if (BigInt(gate.oldAccountHash) !== BigInt(bundle.oldAccountHash))
      fail(
        "oldAccountHash mismatch: the gate card was issued for a different " +
          "registered account than this bundle carries",
      );
  }

  const cred = bundle.credential;
  const roleHash = poseidon1([scalarOf(`lemma:role:${cred.roleName}`)]);
  if (roleHash !== BigInt(gate.requiredRoleHash))
    fail(
      `credential role "${cred.roleName}" does not match the gate's requiredRoleHash ` +
        '(keep DEMO_ROLE_NAME="account-change" for the demo bundle)',
    );

  const legalNameHash = scalarOf(normalizeName(cred.legalName));
  const holderNameHash = scalarOf(normalizeName(bundle.oldAccount.holderName));
  if (legalNameHash !== holderNameHash)
    fail(
      "holder binding impossible: the registered legal name and the old account " +
        "holder normalize to different hashes (demo normalizer: trim + ASCII uppercase)",
    );

  const accountHolder = args.account.holderName ?? cred.legalName;
  const newHolderHash = scalarOf(normalizeName(accountHolder));
  if (newHolderHash !== legalNameHash)
    fail(
      `the new account must be held in the registered legal name ` +
        `("${cred.legalName}"); "${accountHolder}" hashes differently`,
    );

  const oldAccountHash = accountHashOf({
    bankCode: BigInt(bundle.oldAccount.bankCode),
    branchCode: BigInt(bundle.oldAccount.branchCode),
    accountType: BigInt(bundle.oldAccount.accountType),
    accountNumber: BigInt(bundle.oldAccount.accountNumber),
    holderNameHash,
  });
  if (oldAccountHash !== BigInt(bundle.oldAccountHash))
    fail(
      "bundle.oldAccountHash does not match the old account fields in the bundle " +
        "(the bundle was edited by hand?)",
    );

  const isFirst = oldAccountHash === 0n ? 1 : 0;
  if (gate.isFirst !== isFirst)
    fail(
      `gate.isFirst is ${gate.isFirst} but the old account is ` +
        `${oldAccountHash === 0n ? "empty (isFirst must be 1)" : "registered (isFirst must be 0)"}. ` +
        "Update GATE_IS_FIRST on the CLUBS side (or request a first-registration bundle).",
    );

  /* Time window (the circuit rejects these; fail early with the reason). */
  if (BigInt(cred.registeredAt) > BigInt(gate.requestReceivedAt))
    fail("the credential was registered after the change request was received");
  if (BigInt(cred.validFrom) > BigInt(gate.challengeIssuedAt))
    fail("the credential was not valid yet when the challenge was issued");
  if (BigInt(gate.challengeExpiresAt) > BigInt(cred.validUntil))
    fail("the credential expires before the challenge window ends");
  if (gate.challengeIssuedAt >= gate.challengeExpiresAt)
    fail("the challenge window is empty (issuedAt >= expiresAt)");
  if (gate.requestReceivedAt > gate.challengeIssuedAt)
    fail("the challenge was issued before the request was received");

  const credentialCommitment = credentialCommitmentOf({
    repSecret: BigInt(cred.repSecret),
    vendorId: BigInt(bundle.vendorId),
    roleHash,
    legalNameHash,
    credentialStatus: BigInt(cred.credentialStatus),
    validFrom: BigInt(cred.validFrom),
    validUntil: BigInt(cred.validUntil),
    registeredAt: BigInt(cred.registeredAt),
    credentialSalt: BigInt(cred.credentialSalt),
  } satisfies CredentialSpec);

  const newAccountHash = accountHashOf({
    bankCode: BigInt(args.account.bankCode),
    branchCode: BigInt(args.account.branchCode),
    accountType: BigInt(args.account.accountType),
    accountNumber: BigInt(args.account.accountNumber),
    holderNameHash: newHolderHash,
  });

  const bankEvidenceHash =
    args.bankEvidenceHash !== undefined
      ? BigInt(decimalOf(args.bankEvidenceHash, "bankEvidenceHash"))
      : args.bankEvidenceText !== undefined
        ? scalarOf(args.bankEvidenceText)
        : fail("bankEvidenceText or bankEvidenceHash is required");

  const audienceHash = scalarOf(gate.audience);
  const requestDigest = scalarOf(gate.requestCanonical);
  const policyHash = scalarOf(gate.policy);
  if (gate.requestDigest !== undefined && BigInt(gate.requestDigest) !== requestDigest)
    fail(
      "requestDigest mismatch: the gate card and this prover derive a different " +
        "digest from requestCanonical",
    );

  const ctxA = poseidon4([CONTEXT_DOMAIN_A, audienceHash, BigInt(gate.vendorId), requestDigest]);
  const ctxB = poseidon4([
    CONTEXT_DOMAIN_B,
    BigInt(gate.challengeId),
    BigInt(gate.challengeIssuedAt),
    BigInt(gate.challengeExpiresAt),
  ]);
  const contextHash = poseidon4([ctxA, ctxB, BigInt(gate.registryRoot), policyHash]);
  const attestationCommitment = poseidon5([
    credentialCommitment,
    oldAccountHash,
    newAccountHash,
    bankEvidenceHash,
    contextHash,
  ]);
  const nullifier = poseidon2([credentialCommitment, BigInt(gate.challengeId)]);

  const input: Record<string, string | string[]> = {
    repSecret: cred.repSecret,
    roleHash: roleHash.toString(),
    legalNameHash: legalNameHash.toString(),
    credentialStatus: String(cred.credentialStatus),
    validFrom: String(cred.validFrom),
    validUntil: String(cred.validUntil),
    registeredAt: String(cred.registeredAt),
    credentialSalt: cred.credentialSalt,
    merklePath: [...cred.merklePath],
    merkleIndices: [...cred.merkleIndices],
    bankCode: BigInt(args.account.bankCode).toString(),
    branchCode: BigInt(args.account.branchCode).toString(),
    accountType: BigInt(args.account.accountType).toString(),
    accountNumber: BigInt(args.account.accountNumber).toString(),
    holderNameHash: newHolderHash.toString(),
    registryRoot: gate.registryRoot,
    credentialCommitment: credentialCommitment.toString(),
    requiredRoleHash: gate.requiredRoleHash,
    vendorId: gate.vendorId,
    oldAccountHash: oldAccountHash.toString(),
    newAccountHash: newAccountHash.toString(),
    isFirst: String(gate.isFirst),
    audienceHash: audienceHash.toString(),
    requestDigest: requestDigest.toString(),
    requestReceivedAt: String(gate.requestReceivedAt),
    challengeId: gate.challengeId,
    challengeIssuedAt: String(gate.challengeIssuedAt),
    challengeExpiresAt: String(gate.challengeExpiresAt),
    policyHash: policyHash.toString(),
    bankEvidenceHash: bankEvidenceHash.toString(),
  };

  const expectedPublicSignals: string[] = Array.from({ length: SIGNALS_LENGTH }, () => "0");
  expectedPublicSignals[SIGNAL.contextHash] = contextHash.toString();
  expectedPublicSignals[SIGNAL.attestationCommitment] = attestationCommitment.toString();
  expectedPublicSignals[SIGNAL.nullifier] = nullifier.toString();
  expectedPublicSignals[SIGNAL.registryRoot] = gate.registryRoot;
  expectedPublicSignals[SIGNAL.credentialCommitment] = credentialCommitment.toString();
  expectedPublicSignals[SIGNAL.requiredRoleHash] = gate.requiredRoleHash;
  expectedPublicSignals[SIGNAL.vendorId] = gate.vendorId;
  expectedPublicSignals[SIGNAL.oldAccountHash] = oldAccountHash.toString();
  expectedPublicSignals[SIGNAL.newAccountHash] = newAccountHash.toString();
  expectedPublicSignals[SIGNAL.isFirst] = String(gate.isFirst);
  expectedPublicSignals[SIGNAL.audienceHash] = audienceHash.toString();
  expectedPublicSignals[SIGNAL.requestDigest] = requestDigest.toString();
  expectedPublicSignals[SIGNAL.requestReceivedAt] = String(gate.requestReceivedAt);
  expectedPublicSignals[SIGNAL.challengeId] = gate.challengeId;
  expectedPublicSignals[SIGNAL.challengeIssuedAt] = String(gate.challengeIssuedAt);
  expectedPublicSignals[SIGNAL.challengeExpiresAt] = String(gate.challengeExpiresAt);
  expectedPublicSignals[SIGNAL.policyHash] = policyHash.toString();
  expectedPublicSignals[SIGNAL.bankEvidenceHash] = bankEvidenceHash.toString();

  return {
    input,
    expectedPublicSignals,
    derivation: {
      credentialCommitment: credentialCommitment.toString(),
      newAccountHash: newAccountHash.toString(),
      oldAccountHash: oldAccountHash.toString(),
      bankEvidenceHash: bankEvidenceHash.toString(),
      roleHash: roleHash.toString(),
      legalNameHash: legalNameHash.toString(),
      audienceHash: audienceHash.toString(),
      requestDigest: requestDigest.toString(),
      policyHash: policyHash.toString(),
      contextHash: contextHash.toString(),
      attestationCommitment: attestationCommitment.toString(),
      nullifier: nullifier.toString(),
    },
  };
};
