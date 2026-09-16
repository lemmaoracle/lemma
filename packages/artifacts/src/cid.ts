/**
 * Plausible IPFS CID check. The worker only proxies content-addressed
 * IPFS objects — never arbitrary URLs.
 *
 * CIDv0: 46-char base58btc sha2-256 multihash prefixed `Qm`.
 * CIDv1: multibase base32 (`b` prefix). sha2-256 CIDv1 is 59 chars
 * (`bafybei…` / `bafkrei…`); the length floor rejects `b` / trivial tokens.
 */

const CID_V0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
const CID_V1 = /^b[a-z2-7]{50,}$/;

export const isIpfsCid = (cid: string): boolean =>
  CID_V0.test(cid) || CID_V1.test(cid);
