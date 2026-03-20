// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LemmaProofSettlement} from "../src/LemmaProofSettlement.sol";

/**
 * @dev Mock verifier that always returns true.
 *      Mimics the snarkjs-generated Groth16Verifier interface.
 */
contract MockVerifierTrue {
  function verifyProof(
    uint256[2] calldata,
    uint256[2][2] calldata,
    uint256[2] calldata,
    uint256[] calldata
  ) external pure returns (bool) {
    return true;
  }
}

/**
 * @dev Mock verifier that always returns false.
 */
contract MockVerifierFalse {
  function verifyProof(
    uint256[2] calldata,
    uint256[2][2] calldata,
    uint256[2] calldata,
    uint256[] calldata
  ) external pure returns (bool) {
    return false;
  }
}

/**
 * @dev Mock verifier that reverts.
 */
contract MockVerifierReverts {
  function verifyProof(
    uint256[2] calldata,
    uint256[2][2] calldata,
    uint256[2] calldata,
    uint256[] calldata
  ) external pure returns (bool) {
    revert("boom");
  }
}

contract LemmaProofSettlementTest is Test {
  LemmaProofSettlement settlement;
  MockVerifierTrue verifierTrue;
  MockVerifierFalse verifierFalse;
  MockVerifierReverts verifierReverts;

  address owner;
  address authorizedCaller;
  address unauthorizedCaller;

  bytes32 constant VERIFICATION_ID = bytes32(uint256(1));
  bytes32 constant DOC_HASH = bytes32(uint256(2));
  bytes32 constant CIRCUIT_ID_HASH = bytes32(uint256(3));

  // Dummy proof components (not validated by mock verifiers)
  uint256[2] pA;
  uint256[2][2] pB;
  uint256[2] pC;

  function _pubSignals() internal pure returns (uint256[] memory) {
    uint256[] memory sigs = new uint256[](1);
    sigs[0] = 42;
    return sigs;
  }

  function setUp() public {
    owner = address(this);
    authorizedCaller = address(0x1);
    unauthorizedCaller = address(0x2);

    settlement = new LemmaProofSettlement();
    verifierTrue = new MockVerifierTrue();
    verifierFalse = new MockVerifierFalse();
    verifierReverts = new MockVerifierReverts();

    settlement.addAuthorizedCaller(authorizedCaller);
  }

  /* ── Constructor ─────────────────────────────────────────────── */

  function test_constructor_setsOwnerAndAuthorizesCaller() public {
    LemmaProofSettlement s = new LemmaProofSettlement();
    assertEq(s.owner(), owner);
    assertTrue(s.authorizedCallers(owner));
  }

  /* ── settle — happy path ─────────────────────────────────────── */

  function test_settle_validProof() public {
    vm.prank(authorizedCaller);
    bool valid = settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierTrue), pA, pB, pC, _pubSignals()
    );
    assertTrue(valid);
    assertTrue(settlement.isSettled(VERIFICATION_ID));

    LemmaProofSettlement.ProofRecord memory rec = settlement.getRecord(VERIFICATION_ID);
    assertEq(rec.docHash, DOC_HASH);
    assertEq(rec.circuitIdHash, CIRCUIT_ID_HASH);
    assertEq(rec.verifier, address(verifierTrue));
    assertTrue(rec.valid);
    assertGt(rec.settledAt, 0);
  }

  function test_settle_invalidProof() public {
    vm.prank(authorizedCaller);
    bool valid = settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierFalse), pA, pB, pC, _pubSignals()
    );
    assertFalse(valid);
    assertTrue(settlement.isSettled(VERIFICATION_ID));

    LemmaProofSettlement.ProofRecord memory rec = settlement.getRecord(VERIFICATION_ID);
    assertFalse(rec.valid);
  }

  function test_settle_revertingVerifier_treatedAsInvalid() public {
    vm.prank(authorizedCaller);
    bool valid = settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierReverts), pA, pB, pC, _pubSignals()
    );
    assertFalse(valid);
    assertTrue(settlement.isSettled(VERIFICATION_ID));
  }

  function test_settle_emitsProofSettled() public {
    vm.prank(authorizedCaller);

    vm.expectEmit(true, true, true, true, address(settlement));
    emit LemmaProofSettlement.ProofSettled(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH, address(verifierTrue), true
    );

    settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierTrue), pA, pB, pC, _pubSignals()
    );
  }

  /* ── settle — access control ─────────────────────────────────── */

  function test_settle_revertsWhenUnauthorized() public {
    vm.prank(unauthorizedCaller);
    vm.expectRevert(LemmaProofSettlement.Unauthorized.selector);
    settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierTrue), pA, pB, pC, _pubSignals()
    );
  }

  /* ── settle — edge cases ─────────────────────────────────────── */

  function test_settle_revertsOnZeroVerifier() public {
    vm.prank(authorizedCaller);
    vm.expectRevert(LemmaProofSettlement.InvalidVerifier.selector);
    settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(0), pA, pB, pC, _pubSignals()
    );
  }

  function test_settle_revertsOnDuplicate() public {
    vm.prank(authorizedCaller);
    settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierTrue), pA, pB, pC, _pubSignals()
    );

    vm.prank(authorizedCaller);
    vm.expectRevert(
      abi.encodeWithSelector(LemmaProofSettlement.AlreadySettled.selector, VERIFICATION_ID)
    );
    settlement.settle(
      VERIFICATION_ID, DOC_HASH, CIRCUIT_ID_HASH,
      address(verifierTrue), pA, pB, pC, _pubSignals()
    );
  }

  /* ── isSettled ───────────────────────────────────────────────── */

  function test_isSettled_returnsFalseBeforeSettlement() public {
    assertFalse(settlement.isSettled(VERIFICATION_ID));
  }

  /* ── Admin: addAuthorizedCaller ──────────────────────────────── */

  function test_addAuthorizedCaller_revertsWhenNotOwner() public {
    vm.prank(unauthorizedCaller);
    vm.expectRevert(LemmaProofSettlement.NotOwner.selector);
    settlement.addAuthorizedCaller(unauthorizedCaller);
  }

  function test_addAuthorizedCaller_revertsOnZeroAddress() public {
    vm.prank(owner);
    vm.expectRevert(LemmaProofSettlement.InvalidAddress.selector);
    settlement.addAuthorizedCaller(address(0));
  }

  function test_addAuthorizedCaller_revertsWhenAlreadyAuthorized() public {
    vm.prank(owner);
    vm.expectRevert(LemmaProofSettlement.AlreadyAuthorized.selector);
    settlement.addAuthorizedCaller(authorizedCaller);
  }

  function test_addAuthorizedCaller_success() public {
    address newCaller = address(0x3);
    vm.prank(owner);
    settlement.addAuthorizedCaller(newCaller);
    assertTrue(settlement.authorizedCallers(newCaller));
  }

  /* ── Admin: removeAuthorizedCaller ───────────────────────────── */

  function test_removeAuthorizedCaller_revertsWhenNotOwner() public {
    vm.prank(unauthorizedCaller);
    vm.expectRevert(LemmaProofSettlement.NotOwner.selector);
    settlement.removeAuthorizedCaller(authorizedCaller);
  }

  function test_removeAuthorizedCaller_revertsWhenNotAuthorized() public {
    vm.prank(owner);
    vm.expectRevert(LemmaProofSettlement.NotAuthorized.selector);
    settlement.removeAuthorizedCaller(unauthorizedCaller);
  }

  function test_removeAuthorizedCaller_revertsWhenOwner() public {
    vm.prank(owner);
    vm.expectRevert(LemmaProofSettlement.CannotRemoveOwner.selector);
    settlement.removeAuthorizedCaller(owner);
  }

  function test_removeAuthorizedCaller_success() public {
    vm.prank(owner);
    settlement.removeAuthorizedCaller(authorizedCaller);
    assertFalse(settlement.authorizedCallers(authorizedCaller));
  }

  /* ── Admin: transferOwnership ────────────────────────────────── */

  function test_transferOwnership_revertsWhenNotOwner() public {
    vm.prank(unauthorizedCaller);
    vm.expectRevert(LemmaProofSettlement.NotOwner.selector);
    settlement.transferOwnership(unauthorizedCaller);
  }

  function test_transferOwnership_revertsOnZeroAddress() public {
    vm.prank(owner);
    vm.expectRevert(LemmaProofSettlement.InvalidAddress.selector);
    settlement.transferOwnership(address(0));
  }

  function test_transferOwnership_success() public {
    address newOwner = address(0x4);
    vm.prank(owner);
    settlement.transferOwnership(newOwner);
    assertEq(settlement.owner(), newOwner);
  }
}
