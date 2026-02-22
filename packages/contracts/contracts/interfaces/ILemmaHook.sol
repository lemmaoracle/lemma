// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ILemmaHook
 * @notice Interface for on-chain hooks called after document registration.
 *         Whitepaper §2.7 — Arbitrary Smart-Contract Hooks.
 */
interface ILemmaHook {
  function onLemmaDocumentRegistered(
    bytes32 docHash,
    bytes32 attrCommitmentRoot,
    bytes32 schemaIdHash,
    address issuer,
    address subject,
    bytes32 revocationRoot
  ) external;
}
