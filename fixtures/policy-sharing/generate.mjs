// Independent reference generator, using the pinned Poseidon dependency directly.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(new URL("../../packages/verify/package.json", import.meta.url));
const { poseidon1, poseidon2, poseidon4, poseidon7 } = require("poseidon-lite");
const field = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const empty = poseidon1([0n]);
const zeros = [empty];
for (let i = 0; i < 20; i++) zeros.push(poseidon2([zeros[i], zeros[i]]));
function reference(leaves) {
  const rows = [leaves];
  for (let level = 0; level < 20; level++) {
    const next = [];
    for (let i = 0; i < rows[level].length; i += 2)
      next.push(poseidon2([rows[level][i], rows[level][i + 1] ?? zeros[level]]));
    rows.push(next);
  }
  return {
    leaves,
    root: rows[20][0] ?? zeros[20],
    paths: leaves.map((_, index) => ({
      index,
      siblings: rows
        .slice(0, 20)
        .map((row, level) => row[Math.floor(index / 2 ** level) ^ 1] ?? zeros[level]),
      directions: Array.from({ length: 20 }, (_, level) => Math.floor(index / 2 ** level) % 2),
    })),
  };
}
const member = Array.from({ length: 3 }, (_, i) => {
  const subjectSecret = BigInt(101 + i),
    subjectId = BigInt(201 + i),
    roleId = BigInt(1 + i);
  const idCommitment = poseidon2([subjectSecret, subjectId]);
  return {
    input: { idCommitment, roleId },
    hash: poseidon2([idCommitment, roleId]),
    subjectSecret,
    subjectId,
  };
});
const grant = Array.from({ length: 3 }, (_, i) => {
  const input = {
    roleId: BigInt(i + 1),
    templateId: 11n,
    dbTargetId: 12n,
    actionId: 13n,
    maxAmount: 1000n,
    startDay: 20000n,
    endDay: 21000n,
  };
  return { input, hash: poseidon7(Object.values(input)) };
});
const trees = Object.fromEntries(
  ["member", "grant"].map((axis) => {
    const hashes = (axis === "member" ? member : grant).map((v) => v.hash);
    return [
      axis,
      {
        empty: reference([]),
        single: reference(hashes.slice(0, 1)),
        odd: reference(hashes),
        revoked: reference([hashes[0], empty, hashes[2]]),
      },
    ];
  }),
);
const names = [
  "nullifier",
  "requestTag",
  "subjectRoot",
  "permRoot",
  "epoch",
  "today",
  "maxAmount",
  "actionId",
  "dbTargetId",
  "requestDigestLo",
  "requestDigestHi",
  "challenge",
  "idCommitment",
];
const witness = {
  subjectSecret: member[2].subjectSecret,
  subjectId: member[2].subjectId,
  roleId: 3n,
  templateId: 11n,
  amount: 999n,
  startDay: 20000n,
  endDay: 21000n,
  subjectPathElements: trees.member.odd.paths[2].siblings,
  subjectPathIndices: trees.member.odd.paths[2].directions,
  permPathElements: trees.grant.odd.paths[2].siblings,
  permPathIndices: trees.grant.odd.paths[2].directions,
  subjectRoot: trees.member.odd.root,
  permRoot: trees.grant.odd.root,
  epoch: 7n,
  today: 20500n,
  maxAmount: 1000n,
  actionId: 13n,
  dbTargetId: 12n,
  requestDigestLo: 301n,
  requestDigestHi: 302n,
  challenge: 303n,
  idCommitment: member[2].input.idCommitment,
};
const values = [
  poseidon2([witness.subjectSecret, witness.epoch]),
  poseidon4([
    witness.subjectSecret,
    witness.requestDigestLo,
    witness.requestDigestHi,
    witness.challenge,
  ]),
  ...names.slice(2).map((name) => witness[name]),
];
const fixture = {
  version: 1,
  warning: "TEST ONLY: contains public test secrets. Never use these credentials in production.",
  circuitStatus:
    "NOT CONNECTED: production artifacts and circuit-side fixture consumption are pending. Expected outcomes are requirements, not measured proof results.",
  tools: { circom: "2.2.3", circomlib: "2.0.5", "poseidon-lite": "0.3.0", snarkjs: "0.7.6" },
  artifacts: {
    circuit: null,
    wasm: null,
    zkey: null,
    vkey: null,
    digestAlgorithm: "sha256",
    status: "pending production artifacts; no digests available",
  },
  regeneration: "fixtures/policy-sharing/README.md",
  constants: {
    scheme: "member-grant-v1",
    field,
    depth: 20,
    emptyInput: "0",
    empty,
    arities: {
      empty: 1,
      member: 2,
      grant: 7,
      parent: 2,
      idCommitment: 2,
      nullifier: 2,
      requestTag: 4,
    },
    grantOrder: Object.keys(grant[0].input),
  },
  member,
  grant,
  trees,
  snapshot: {
    version: 1,
    scheme: "member-grant-v1",
    scope: "test-issuer",
    epoch: "7",
    publishedAt: "2026-10-17T00:00:00.000Z",
    member: { root: trees.member.odd.root, leafCount: 3, revokedCount: 0 },
    grant: { root: trees.grant.odd.root, leafCount: 3, revokedCount: 0 },
  },
  publicSignals: {
    status: "experimental design section 5; not a permanent production ABI",
    names,
    values,
  },
  witness,
  cases: [
    {
      name: "valid",
      patch: {},
      expected: true,
      check: "inclusion and experimental range requirements",
    },
    {
      name: "roleMismatch",
      patch: { roleId: "1" },
      expected: false,
      check: "role 1 leaf at role 3 positions does not match either root",
    },
    { name: "notStarted", patch: { today: "19999" }, expected: false, check: "period" },
    { name: "expired", patch: { today: "21001" }, expected: false, check: "period" },
    { name: "amountExceeded", patch: { amount: "1001" }, expected: false, check: "amount" },
    {
      name: "amountOverflow",
      patch: { amount: "18446744073709551616" },
      expected: false,
      check: "64-bit amount",
    },
    {
      name: "omittedPosition",
      patch: { subjectPathIndices: [] },
      expected: false,
      check: "path shape",
    },
    {
      name: "nonBitDirection",
      patch: { subjectPathIndices: [2, ...witness.subjectPathIndices.slice(1)] },
      expected: false,
      check: "TS inclusion rejects; production circuit must independently constrain bits",
    },
  ],
};
writeFileSync(
  new URL("./v1.json", import.meta.url),
  JSON.stringify(fixture, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2) + "\n",
);
