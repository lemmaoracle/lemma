// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LemmaRelay
 * @notice Generic relay contract for forwarding calls with access control.
 *         Only authorized senders can relay calls to any target contract.
 */
contract LemmaRelay {
    address public owner;
    mapping(address => bool) public authorizedSenders;

    event AuthorizedSenderAdded(address indexed sender);
    event AuthorizedSenderRemoved(address indexed sender);
    event RelayedCall(address indexed target, bytes4 indexed selector, bool success);

    modifier onlyOwner() {
        require(msg.sender == owner, "LemmaRelay: not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedSenders[msg.sender], "LemmaRelay: unauthorized sender");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedSenders[msg.sender] = true;
        emit AuthorizedSenderAdded(msg.sender);
    }

    /**
     * @notice Relay a call to any target contract with the provided calldata.
     * @param target The target contract address to call.
     * @param data The calldata to forward.
     * @return result The return data from the target contract.
     */
    function relayCall(address target, bytes calldata data)
        external
        onlyAuthorized
        returns (bytes memory result)
    {
        require(target != address(0), "LemmaRelay: invalid target");

        (bool success, bytes memory returnData) = target.call(data);

        emit RelayedCall(
            target,
            data.length >= 4 ? bytes4(data[:4]) : bytes4(0),
            success
        );

        if (!success) {
            // Revert with the reason from the target contract
            assembly {
                revert(add(returnData, 32), mload(returnData))
            }
        }

        return returnData;
    }

    /**
     * @notice Add an authorized sender.
     * @param sender The address to authorize.
     */
    function addAuthorizedSender(address sender) external onlyOwner {
        require(sender != address(0), "LemmaRelay: invalid address");
        require(!authorizedSenders[sender], "LemmaRelay: already authorized");

        authorizedSenders[sender] = true;
        emit AuthorizedSenderAdded(sender);
    }

    /**
     * @notice Remove an authorized sender.
     * @param sender The address to deauthorize.
     */
    function removeAuthorizedSender(address sender) external onlyOwner {
        require(authorizedSenders[sender], "LemmaRelay: not authorized");
        require(sender != owner, "LemmaRelay: cannot remove owner");

        authorizedSenders[sender] = false;
        emit AuthorizedSenderRemoved(sender);
    }

    /**
     * @notice Transfer ownership.
     * @param newOwner The new owner address.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "LemmaRelay: invalid address");
        owner = newOwner;
    }
}