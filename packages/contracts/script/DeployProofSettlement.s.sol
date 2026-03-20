// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LemmaProofSettlement} from "../src/LemmaProofSettlement.sol";

contract DeployProofSettlement is Script {
  function run() external returns (LemmaProofSettlement) {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    LemmaProofSettlement settlement = new LemmaProofSettlement();
    vm.stopBroadcast();

    console.log("LemmaProofSettlement deployed at:", address(settlement));
    return settlement;
  }
}
