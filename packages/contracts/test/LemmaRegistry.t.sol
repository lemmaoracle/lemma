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

  address issuer;
  address subject;

  function setUp() public {
    registry = new LemmaRegistry();
    issuer = address(this);
    subject = address(0x1);
  }

  function _emptyHooks() internal pure returns (LemmaRegistry.HookCall[] memory) {
    return new LemmaRegistry.HookCall[](0);
  }

  function _register() internal {
    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuer,
      subject,
      REVOCATION_ROOT,
      _emptyHooks()
    );
  }

  function test_registerDocument_emitsDocumentRegistered() public {
    vm.expectEmit(true, true, true, true, address(registry));
    emit LemmaRegistry.DocumentRegistered(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuer,
      subject,
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
    assertEq(prov.issuer, issuer);
    assertEq(prov.subject, subject);
    assertEq(prov.revocationRoot, REVOCATION_ROOT);
    assertGt(prov.registeredAt, 0);
  }

  function test_registerDocument_revertsOnDuplicate() public {
    _register();

    vm.expectRevert(
      abi.encodeWithSelector(LemmaRegistry.DocumentAlreadyRegistered.selector, DOC_HASH)
    );
    registry.registerDocument(
      DOC_HASH,
      ROOT,
      SCHEMA_HASH,
      issuer,
      subject,
      REVOCATION_ROOT,
      _emptyHooks()
    );
  }

  function test_registerDocument_revertsOnZeroDocHash() public {
    vm.expectRevert(LemmaRegistry.InvalidDocHash.selector);
    registry.registerDocument(
      bytes32(0),
      ROOT,
      SCHEMA_HASH,
      issuer,
      subject,
      REVOCATION_ROOT,
      _emptyHooks()
    );
  }

  function test_isRegistered() public {
    assertFalse(registry.isRegistered(DOC_HASH));

    _register();

    assertTrue(registry.isRegistered(DOC_HASH));
  }
}
