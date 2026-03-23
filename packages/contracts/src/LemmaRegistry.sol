// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LemmaRegistry
 * @notice On-chain provenance for encrypted documents.
 *         Whitepaper §2.7, §3.1 Layer 1.
 *
 *         Stores (docHash → DocumentProvenance) and emits events.
 *         Optionally publishes normalized data (attrNames/attrValues) on-chain.
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

  event NormalizedDataPublished(
    bytes32 indexed docHash,
    bytes32 indexed schemaIdHash,
    string[] attrNames,
    string[] attrValues
  );

  /* ── Errors ─────────────────────────────────────────────────── */

  error DocumentAlreadyRegistered(bytes32 docHash);
  error InvalidDocHash();
  error MismatchedAttributeArrays();

  /* ── External ───────────────────────────────────────────────── */

  /**
   * @notice Register a document's provenance on-chain.
   * @param docHash            SHA3-256 hash of the encrypted document.
   * @param commitmentRoot     Pedersen/Poseidon commitment root of normalized attributes.
   * @param schemaIdHash       keccak256 of the schemaId string.
   * @param issuerHash         keccak256 of the issuer identifier (DID, address, etc.).
   * @param subjectHash        keccak256 of the subject/holder identifier.
   * @param revocationRoot     Merkle root for revocation bitmap.
   * @param attrNames          Array of normalized attribute names.
   * @param attrValues         Array of normalized attribute values (as strings).
   */
  function registerDocument(
    bytes32 docHash,
    bytes32 commitmentRoot,
    bytes32 schemaIdHash,
    bytes32 issuerHash,
    bytes32 subjectHash,
    bytes32 revocationRoot,
    string[] calldata attrNames,
    string[] calldata attrValues
  ) external {
    if (docHash == bytes32(0)) {
      revert InvalidDocHash();
    }
    if (documents[docHash].docHash != bytes32(0)) {
      revert DocumentAlreadyRegistered(docHash);
    }
    if (attrNames.length != attrValues.length) {
      revert MismatchedAttributeArrays();
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

    // Emit normalized data if present
    if (attrNames.length > 0) {
      emit NormalizedDataPublished(docHash, schemaIdHash, attrNames, attrValues);
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
