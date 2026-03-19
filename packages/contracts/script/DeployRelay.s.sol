// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LemmaRelay} from "../src/LemmaRelay.sol";

contract DeployRelay is Script {
  function run() external returns (LemmaRelay) {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    LemmaRelay relay = new LemmaRelay();
    vm.stopBroadcast();

    console.log("LemmaRelay deployed at:", address(relay));
    return relay;
  }
}
