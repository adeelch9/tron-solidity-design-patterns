// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// The contract to be deployed by the factory
contract ManagedContract {
    address public owner;
    uint256 public value;

    constructor(address _owner, uint256 _value) {
        owner = _owner;
        value = _value;
    }

    function doSomething() public pure returns (string memory) {
        return "This is a managed contract.";
    }
}