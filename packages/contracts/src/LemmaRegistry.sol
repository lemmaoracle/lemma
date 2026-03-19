// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ILemmaHook.sol";

/**
 * @title LemmaRegistry
 * @notice On-chain provenance for encrypted documents.
 *         Whitepaper §2.7, §3.1 Layer 1.
 *
 *         Stores (docHash → DocumentProvenance) and emits events.
 *         Optionally calls hook contracts after registration.
 */
contract LemmaRegistry {
  /* ── Types ──────────────────────────────────────────────────── */

  struct DocumentProvenance {
    bytes32 docHash;
    bytes32 commitmentRoot;
    bytes32 schemaIdHash;
    bytes32 issuerHash;
    bytes32 subjectHash;
    bytes32 revocationRoot;
    uint256 registeredAt;
  }

  struct HookCall {
    address target;
    // If target == address(0), the hook is skipped.
  }

  /* ── State ──────────────────────────────────────────────────── */

  mapping(bytes32 => DocumentProvenance) public documents;

  /* ── Events ─────────────────────────────────────────────────── */

  event DocumentRegistered(
    bytes32 indexed docHash,
    bytes32 commitmentRoot,
    bytes32 indexed schemaIdHash,
    bytes32 indexed issuerHash,
    bytes32 subjectHash,
    bytes32 revocationRoot
  );

  event HookExecuted(bytes32 indexed docHash, address indexed hookTarget, bool success);

  /* ── Errors ─────────────────────────────────────────────────── */

  error DocumentAlreadyRegistered(bytes32 docHash);
  error InvalidDocHash();

  /* ── External ───────────────────────────────────────────────── */

  /**
   * @notice Register a document's provenance on-chain.
   * @param docHash            SHA3-256 hash of the encrypted document.
   * @param commitmentRoot     Pedersen/Poseidon commitment root of normalized attributes.
   * @param schemaIdHash       keccak256 of the schemaId string.
   * @param issuerHash         keccak256 of the issuer identifier (DID, address, etc.).
   * @param subjectHash        keccak256 of the subject/holder identifier.
   * @param revocationRoot     Merkle root for revocation bitmap.
   * @param hooks              Array of hook contracts to call after registration.
   */
  function registerDocument(
    bytes32 docHash,
    bytes32 commitmentRoot,
    bytes32 schemaIdHash,
    bytes32 issuerHash,
    bytes32 subjectHash,
    bytes32 revocationRoot,
    HookCall[] calldata hooks
  ) external {
    if (docHash == bytes32(0)) {
      revert InvalidDocHash();
    }
    if (documents[docHash].docHash != bytes32(0)) {
      revert DocumentAlreadyRegistered(docHash);
    }

    documents[docHash] = DocumentProvenance({
      docHash: docHash,
      commitmentRoot: commitmentRoot,
      schemaIdHash: schemaIdHash,
      issuerHash: issuerHash,
      subjectHash: subjectHash,
      revocationRoot: revocationRoot,
      registeredAt: block.timestamp
    });

    emit DocumentRegistered(docHash, commitmentRoot, schemaIdHash, issuerHash, subjectHash, revocationRoot);

    // Execute hooks (Whitepaper §2.7)
    for (uint256 i = 0; i < hooks.length; i++) {
      if (hooks[i].target != address(0)) {
        // Use try/catch to prevent hook failure from reverting registration
        try
          ILemmaHook(hooks[i].target).onLemmaDocumentRegistered(
            docHash,
            commitmentRoot,
            schemaIdHash,
            issuerHash,
            subjectHash,
            revocationRoot
          )
        {
          emit HookExecuted(docHash, hooks[i].target, true);
        } catch {
          emit HookExecuted(docHash, hooks[i].target, false);
        }
      }
    }
  }

  /* ── Views ──────────────────────────────────────────────────── */

  function getDocument(bytes32 docHash) external view returns (DocumentProvenance memory) {
    return documents[docHash];
  }

  function isRegistered(bytes32 docHash) external view returns (bool) {
    return documents[docHash].docHash != bytes32(0);
  }
}
