// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LemmaRegistry} from "../src/LemmaRegistry.sol";

contract Deploy is Script {
    function run() external returns (LemmaRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        LemmaRegistry registry = new LemmaRegistry();
        vm.stopBroadcast();

        console.log("LemmaRegistry deployed at:", address(registry));
        return registry;
    }
}
