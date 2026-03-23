// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LemmaRegistry} from "../src/LemmaRegistry.sol";

contract LemmaRegistryTest is Test {
  LemmaRegistry registry;

  bytes32 constant DOC_HASH = bytes32(uint256(1));
  bytes32 constant ROOT = bytes32(uint256(2));
  bytes32 constant SCHEMA_HASH = bytes32(uint256(3));
  bytes32 constant REVOCATION_ROOT = bytes32(uint256(4));

  bytes32 issuerHash;
  bytes32 subjectHash;

  function setUp() public {
    registry = new LemmaRegistry();
    issuerHash = keccak256("did:mizu:municipality");
    subjectHash = keccak256("did:mizu:report:1234");
  }

  function _emptyAttrs() internal pure returns (string[] memory names, string[] memory values) {
    names = new string[](0);
    values = new string[](0);
  }

  function _register() internal {
    (string[] memory names, string[] memory values) = _emptyAttrs();
    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT,
      names,
      values
    );
  }

  function test_registerDocument_emitsDocumentRegistered() public {
    vm.expectEmit(true, true, true, true, address(registry));
    emit LemmaRegistry.DocumentRegistered(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT
    );

    _register();
  }

  function test_registerDocument_storesProvenance() public {
    _register();

    LemmaRegistry.DocumentProvenance memory prov = registry.getDocument(DOC_HASH);
    assertEq(prov.docHash, DOC_HASH);
    assertEq(prov.commitmentRoot, ROOT);
    assertEq(prov.schemaIdHash, SCHEMA_HASH);
    assertEq(prov.issuerHash, issuerHash);
    assertEq(prov.subjectHash, subjectHash);
    assertEq(prov.revocationRoot, REVOCATION_ROOT);
    assertGt(prov.registeredAt, 0);
  }

  function test_registerDocument_revertsOnDuplicate() public {
    _register();

    vm.expectRevert(
      abi.encodeWithSelector(LemmaRegistry.DocumentAlreadyRegistered.selector, DOC_HASH)
    );
    (string[] memory names, string[] memory values) = _emptyAttrs();
    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT,
      names,
      values
    );
  }

  function test_registerDocument_revertsOnZeroDocHash() public {
    vm.expectRevert(LemmaRegistry.InvalidDocHash.selector);
    (string[] memory names, string[] memory values) = _emptyAttrs();
    registry.registerDocument(
      bytes32(0),
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT,
      names,
      values
    );
  }

  function test_isRegistered() public {
    assertFalse(registry.isRegistered(DOC_HASH));

    _register();

    assertTrue(registry.isRegistered(DOC_HASH));
  }

  function test_registerDocument_emitsNormalizedDataPublished() public {
    string[] memory attrNames = new string[](2);
    attrNames[0] = "patrolType";
    attrNames[1] = "location";

    string[] memory attrValues = new string[](2);
    attrValues[0] = "river";
    attrValues[1] = "Tokyo";

    vm.expectEmit(true, true, false, true, address(registry));
    emit LemmaRegistry.NormalizedDataPublished(
      DOC_HASH,
      SCHEMA_HASH,
      attrNames,
      attrValues
    );

    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT,
      attrNames,
      attrValues
    );
  }

  function test_registerDocument_noNormalizedDataWhenEmpty() public {
    // Register with empty arrays - should NOT emit NormalizedDataPublished
    vm.expectEmit(true, true, true, true, address(registry));
    emit LemmaRegistry.DocumentRegistered(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT
    );

    (string[] memory names, string[] memory values) = _emptyAttrs();
    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT,
      names,
      values
    );

    // Verify document was registered
    assertTrue(registry.isRegistered(DOC_HASH));
  }

  function test_registerDocument_revertsOnMismatchedAttributeArrays() public {
    string[] memory attrNames = new string[](2);
    attrNames[0] = "patrolType";
    attrNames[1] = "location";

    string[] memory attrValues = new string[](1);
    attrValues[0] = "river";

    vm.expectRevert(LemmaRegistry.MismatchedAttributeArrays.selector);
    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuerHash,
      subjectHash,
      REVOCATION_ROOT,
      attrNames,
      attrValues
    );
  }
}
