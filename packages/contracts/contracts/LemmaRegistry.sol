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
        bytes32 attrCommitmentRoot;
        bytes32 schemaIdHash;
        address issuer;
        address subject;
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
        bytes32 attrCommitmentRoot,
        bytes32 indexed schemaIdHash,
        address indexed issuer,
        address subject,
        bytes32 revocationRoot
    );

    event HookExecuted(
        bytes32 indexed docHash,
        address indexed hookTarget,
        bool success
    );

    /* ── Errors ─────────────────────────────────────────────────── */

    error DocumentAlreadyRegistered(bytes32 docHash);
    error InvalidDocHash();

    /* ── External ───────────────────────────────────────────────── */

    /**
     * @notice Register a document's provenance on-chain.
     * @param docHash            SHA3-256 hash of the encrypted document.
     * @param attrCommitmentRoot Pedersen/Poseidon commitment root of normalized attributes.
     * @param schemaIdHash       keccak256 of the schemaId string.
     * @param issuer             Address of the document issuer.
     * @param subject            Address of the document subject/holder.
     * @param revocationRoot     Merkle root for revocation bitmap.
     * @param hooks              Array of hook contracts to call after registration.
     */
    function registerDocument(
        bytes32 docHash,
        bytes32 attrCommitmentRoot,
        bytes32 schemaIdHash,
        address issuer,
        address subject,
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
            attrCommitmentRoot: attrCommitmentRoot,
            schemaIdHash: schemaIdHash,
            issuer: issuer,
            subject: subject,
            revocationRoot: revocationRoot,
            registeredAt: block.timestamp
        });

        emit DocumentRegistered(
            docHash,
            attrCommitmentRoot,
            schemaIdHash,
            issuer,
            subject,
            revocationRoot
        );

        // Execute hooks (Whitepaper §2.7)
        for (uint256 i = 0; i < hooks.length; i++) {
            if (hooks[i].target != address(0)) {
                // Use try/catch to prevent hook failure from reverting registration
                try ILemmaHook(hooks[i].target).onLemmaDocumentRegistered(
                    docHash,
                    attrCommitmentRoot,
                    schemaIdHash,
                    issuer,
                    subject,
                    revocationRoot
                ) {
                    emit HookExecuted(docHash, hooks[i].target, true);
                } catch {
                    emit HookExecuted(docHash, hooks[i].target, false);
                }
            }
        }
    }

    /* ── Views ──────────────────────────────────────────────────── */

    function getDocument(bytes32 docHash)
        external
        view
        returns (DocumentProvenance memory)
    {
        return documents[docHash];
    }

    function isRegistered(bytes32 docHash) external view returns (bool) {
        return documents[docHash].docHash != bytes32(0);
    }
}
