// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LemmaRelay} from "../src/LemmaRelay.sol";
import {LemmaRegistry} from "../src/LemmaRegistry.sol";

contract LemmaRelayTest is Test {
  LemmaRelay relay;
  LemmaRegistry registry;

  address owner;
  address authorizedSender;
  address unauthorizedSender;

  bytes32 constant DOC_HASH = bytes32(uint256(1));
  bytes32 constant ROOT = bytes32(uint256(2));
  bytes32 constant SCHEMA_HASH = bytes32(uint256(3));
  bytes32 constant REVOCATION_ROOT = bytes32(uint256(4));

  function setUp() public {
    owner = address(this);
    authorizedSender = address(0x1);
    unauthorizedSender = address(0x2);

    relay = new LemmaRelay();
    registry = new LemmaRegistry();

    // Authorize the sender
    vm.prank(owner);
    relay.addAuthorizedSender(authorizedSender);
  }

  function test_constructor_setsOwnerAndAuthorizesSender() public {
    LemmaRelay newRelay = new LemmaRelay();
    assertEq(newRelay.owner(), owner);
    assertTrue(newRelay.authorizedSenders(owner));
  }

  function test_relayCall_revertsWhenUnauthorized() public {
    vm.prank(unauthorizedSender);
    vm.expectRevert("LemmaRelay: unauthorized sender");

    bytes memory callData = abi.encodeCall(
      registry.registerDocument,
      (DOC_HASH, ROOT, SCHEMA_HASH, authorizedSender, authorizedSender, REVOCATION_ROOT, new LemmaRegistry.HookCall[](0))
    );

    relay.relayCall(address(registry), callData);
  }

  function test_relayCall_revertsWhenZeroTarget() public {
    vm.prank(authorizedSender);
    vm.expectRevert("LemmaRelay: invalid target");

    relay.relayCall(address(0), "");
  }

  function test_relayCall_forwardsCallSuccessfully() public {
    vm.prank(authorizedSender);

    bytes memory callData = abi.encodeCall(
      registry.registerDocument,
      (DOC_HASH, ROOT, SCHEMA_HASH, authorizedSender, authorizedSender, REVOCATION_ROOT, new LemmaRegistry.HookCall[](0))
    );

    bytes memory result = relay.relayCall(address(registry), callData);

    // Verify the document was registered
    LemmaRegistry.DocumentProvenance memory prov = registry.getDocument(DOC_HASH);
    assertEq(prov.docHash, DOC_HASH);
    assertEq(prov.commitmentRoot, ROOT);
    assertEq(prov.schemaIdHash, SCHEMA_HASH);
    assertEq(prov.issuer, authorizedSender);
    assertEq(prov.subject, authorizedSender);
    assertEq(prov.revocationRoot, REVOCATION_ROOT);
  }

  function test_relayCall_emitsRelayedCall() public {
    vm.prank(authorizedSender);

    bytes memory callData = abi.encodeCall(
      registry.registerDocument,
      (DOC_HASH, ROOT, SCHEMA_HASH, authorizedSender, authorizedSender, REVOCATION_ROOT, new LemmaRegistry.HookCall[](0))
    );

    vm.expectEmit(true, true, false, true, address(relay));
    emit LemmaRelay.RelayedCall(address(registry), bytes4(keccak256("registerDocument(bytes32,bytes32,bytes32,address,address,bytes32,(address,bytes)[])")), true);

    relay.relayCall(address(registry), callData);
  }

  function test_addAuthorizedSender_revertsWhenNotOwner() public {
    vm.prank(unauthorizedSender);
    vm.expectRevert("LemmaRelay: not owner");
    relay.addAuthorizedSender(unauthorizedSender);
  }

  function test_addAuthorizedSender_revertsWhenZeroAddress() public {
    vm.prank(owner);
    vm.expectRevert("LemmaRelay: invalid address");
    relay.addAuthorizedSender(address(0));
  }

  function test_addAuthorizedSender_revertsWhenAlreadyAuthorized() public {
    vm.prank(owner);
    vm.expectRevert("LemmaRelay: already authorized");
    relay.addAuthorizedSender(authorizedSender);
  }

  function test_addAuthorizedSender_success() public {
    address newSender = address(0x3);
    vm.prank(owner);
    relay.addAuthorizedSender(newSender);
    assertTrue(relay.authorizedSenders(newSender));
  }

  function test_removeAuthorizedSender_revertsWhenNotOwner() public {
    vm.prank(unauthorizedSender);
    vm.expectRevert("LemmaRelay: not owner");
    relay.removeAuthorizedSender(authorizedSender);
  }

  function test_removeAuthorizedSender_revertsWhenNotAuthorized() public {
    vm.prank(owner);
    vm.expectRevert("LemmaRelay: not authorized");
    relay.removeAuthorizedSender(unauthorizedSender);
  }

  function test_removeAuthorizedSender_revertsWhenOwner() public {
    vm.prank(owner);
    vm.expectRevert("LemmaRelay: cannot remove owner");
    relay.removeAuthorizedSender(owner);
  }

  function test_removeAuthorizedSender_success() public {
    vm.prank(owner);
    relay.removeAuthorizedSender(authorizedSender);
    assertFalse(relay.authorizedSenders(authorizedSender));
  }

  function test_transferOwnership_revertsWhenNotOwner() public {
    vm.prank(unauthorizedSender);
    vm.expectRevert("LemmaRelay: not owner");
    relay.transferOwnership(unauthorizedSender);
  }

  function test_transferOwnership_revertsWhenZeroAddress() public {
    vm.prank(owner);
    vm.expectRevert("LemmaRelay: invalid address");
    relay.transferOwnership(address(0));
  }

  function test_transferOwnership_success() public {
    address newOwner = address(0x4);
    vm.prank(owner);
    relay.transferOwnership(newOwner);
    assertEq(relay.owner(), newOwner);
  }
}
