// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ILemmaProofSettlement
 * @notice Interface for on-chain proof verification settlement.
 *         Whitepaper §3.1 Layer 1 — ZK Verifier integration.
 *
 *         The verifier address is passed at call time because the same
 *         algorithm (e.g. groth16-bn254-snarkjs) produces a unique verifier
 *         contract per circuit — snarkjs embeds the circuit-specific
 *         verification key into the generated Solidity.
 *
 *         Note: settle is overloaded for pubSignals lengths 1-10.
 *         Additional overloads can be added as needed.
 */
interface ILemmaProofSettlement {
  /**
   * @notice Verify a Groth16 proof and record the result on-chain.
   * @param verificationId Unique ID from Workers (keccak256 of the string ID).
   * @param docHash        Document hash the proof pertains to.
   * @param circuitIdHash  keccak256 of the circuitId string.
   * @param verifier       Address of the circuit-specific Groth16Verifier.
   * @param pA             Groth16 proof component A.
   * @param pB             Groth16 proof component B.
   * @param pC             Groth16 proof component C.
   * @param pubSignals     Public inputs array.
   * @return valid         Whether the proof verified successfully.
   */
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[1] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[2] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[3] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[4] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[5] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[6] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[7] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[8] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[9] calldata pubSignals
  ) external returns (bool valid);

  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[10] calldata pubSignals
  ) external returns (bool valid);

  function isSettled(bytes32 verificationId) external view returns (bool);
}
