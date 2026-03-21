// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/ILemmaProofSettlement.sol";

/**
 * @title LemmaProofSettlement
 * @notice Verifies a ZK proof via a caller-specified verifier contract
 *         and records the result on-chain.
 *
 *         Whitepaper §3.1 Layer 1 — extends the on-chain provenance layer
 *         to include proof verification results alongside document registration.
 *
 *         The verifier address is passed at call time (not stored in a registry)
 *         because the same algorithm (e.g. groth16-bn254-snarkjs) produces
 *         a unique verifier contract per circuit — snarkjs embeds the
 *         circuit-specific verification key into the generated Solidity.
 *
 *         Access is restricted to authorized callers (LemmaRelay, Workers wallet, etc.).
 *
 *         Note: The settle function is overloaded for different pubSignals lengths
 *         because snarkjs-generated verifiers use fixed-size arrays (uint256[N]),
 *         which have different ABI encoding than dynamic arrays (uint256[]).
 */
contract LemmaProofSettlement is ILemmaProofSettlement {
  /* ── Types ───────────────────────────────────────────────────── */

  struct ProofRecord {
    bytes32 docHash;
    bytes32 circuitIdHash;
    address verifier;
    bool    valid;
    uint256 settledAt;
  }

  /* ── State ───────────────────────────────────────────────────── */

  address public owner;
  mapping(address => bool) public authorizedCallers;
  mapping(bytes32 => ProofRecord) public records;

  /* ── Events ──────────────────────────────────────────────────── */

  event ProofSettled(
    bytes32 indexed verificationId,
    bytes32 indexed docHash,
    bytes32 indexed circuitIdHash,
    address verifier,
    bool    valid
  );

  event AuthorizedCallerAdded(address indexed caller);
  event AuthorizedCallerRemoved(address indexed caller);

  /* ── Errors ──────────────────────────────────────────────────── */

  error NotOwner();
  error Unauthorized();
  error InvalidVerifier();
  error AlreadySettled(bytes32 verificationId);
  error InvalidAddress();
  error AlreadyAuthorized();
  error NotAuthorized();
  error CannotRemoveOwner();

  /* ── Modifiers ───────────────────────────────────────────────── */

  modifier onlyOwner() {
    if (msg.sender != owner) revert NotOwner();
    _;
  }

  modifier onlyAuthorized() {
    if (!authorizedCallers[msg.sender]) revert Unauthorized();
    _;
  }

  /* ── Constructor ─────────────────────────────────────────────── */

  constructor() {
    owner = msg.sender;
    authorizedCallers[msg.sender] = true;
    emit AuthorizedCallerAdded(msg.sender);
  }

  /* ── Admin ───────────────────────────────────────────────────── */

  function addAuthorizedCaller(address caller) external onlyOwner {
    if (caller == address(0)) revert InvalidAddress();
    if (authorizedCallers[caller]) revert AlreadyAuthorized();
    authorizedCallers[caller] = true;
    emit AuthorizedCallerAdded(caller);
  }

  function removeAuthorizedCaller(address caller) external onlyOwner {
    if (!authorizedCallers[caller]) revert NotAuthorized();
    if (caller == owner) revert CannotRemoveOwner();
    authorizedCallers[caller] = false;
    emit AuthorizedCallerRemoved(caller);
  }

  function transferOwnership(address newOwner) external onlyOwner {
    if (newOwner == address(0)) revert InvalidAddress();
    owner = newOwner;
  }

  /* ── Core: Overloaded settle functions ───────────────────────── */

  /// @dev Pre-computed selectors for verifyProof(uint256[2],uint256[2][2],uint256[2],uint256[N])
  bytes4 private constant S1 = 0x43753b4d;
  bytes4 private constant S2 = 0xf5c9d69e;
  bytes4 private constant S3 = 0x11479fea;
  bytes4 private constant S4 = 0x5fe8c13b;
  bytes4 private constant S5 = 0x34baeab9;
  bytes4 private constant S6 = 0xf398789b;
  bytes4 private constant S7 = 0xc894e757;
  bytes4 private constant S8 = 0xc9219a7a;
  bytes4 private constant S9 = 0xc542c93b;
  bytes4 private constant S10 = 0xf3bb70f6;

  /// @dev Core verification logic - shared by all overloads
  function _settleCore(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    bytes memory data
  ) internal returns (bool valid) {
    if (verifier == address(0)) revert InvalidVerifier();
    if (records[verificationId].settledAt != 0) revert AlreadySettled(verificationId);

    (bool success, bytes memory ret) = verifier.staticcall(data);
    valid = success && ret.length >= 32 && abi.decode(ret, (bool));

    records[verificationId] = ProofRecord({
      docHash:       docHash,
      circuitIdHash: circuitIdHash,
      verifier:      verifier,
      valid:         valid,
      settledAt:     block.timestamp
    });

    emit ProofSettled(verificationId, docHash, circuitIdHash, verifier, valid);
  }

  /// @dev Settle with 1 public signal
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[1] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S1, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 2 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[2] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S2, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 3 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[3] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S3, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 4 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[4] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S4, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 5 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[5] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S5, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 6 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[6] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S6, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 7 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[7] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S7, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 8 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[8] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S8, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 9 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[9] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S9, pA, pB, pC, pubSignals)
    );
  }

  /// @dev Settle with 10 public signals
  function settle(
    bytes32 verificationId,
    bytes32 docHash,
    bytes32 circuitIdHash,
    address verifier,
    uint256[2] calldata pA,
    uint256[2][2] calldata pB,
    uint256[2] calldata pC,
    uint256[10] calldata pubSignals
  ) external onlyAuthorized returns (bool valid) {
    valid = _settleCore(
      verificationId, docHash, circuitIdHash, verifier,
      abi.encodeWithSelector(S10, pA, pB, pC, pubSignals)
    );
  }

  /* ── Views ───────────────────────────────────────────────────── */

  /// @inheritdoc ILemmaProofSettlement
  function isSettled(bytes32 verificationId) external view returns (bool) {
    return records[verificationId].settledAt != 0;
  }

  function getRecord(bytes32 verificationId) external view returns (ProofRecord memory) {
    return records[verificationId];
  }
}
