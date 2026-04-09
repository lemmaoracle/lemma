// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LemmaRegistry} from "../src/LemmaRegistry.sol";
import {LemmaRelay} from "../src/LemmaRelay.sol";
import {LemmaProofSettlement} from "../src/LemmaProofSettlement.sol";

contract Deploy is Script {
  function run() external returns (LemmaRegistry, LemmaRelay, LemmaProofSettlement) {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    LemmaRegistry registry = new LemmaRegistry();
    LemmaRelay relay = new LemmaRelay();
    LemmaProofSettlement settlement = new LemmaProofSettlement();
    vm.stopBroadcast();

    console.log("LemmaRegistry deployed at:", address(registry));
    console.log("LemmaRelay deployed at:", address(relay));
    console.log("LemmaProofSettlement deployed at:", address(settlement));
    return (registry, relay, settlement);
  }
}
