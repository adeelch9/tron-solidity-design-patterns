# Factory Contract Pattern

## Overview
The Factory Contract pattern is a design pattern commonly used in smart contract development to create and manage instances of other contracts. This pattern allows for efficient deployment of contracts and can help in managing complex interactions between them.

## Purpose
The Factory pattern is particularly useful when:
- You need to deploy multiple instances of a contract.
- You want to encapsulate the logic for contract creation in a single contract.
- You aim to reduce the complexity of contract management.

## Implementation
Here is a basic example of how a Factory contract might be structured:

Given below is a Sample contract to be deployed by the Factory contract.

```solidity
pragma solidity ^0.8.0;

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
```

Following is the Factory contract, it deploys the above contract and tracks the deployed contracts. One can get the number of deployed contracts and the addresses of the deployed contracts.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ManagedContract} from "./ManagedContract.sol";

// The factory contract
contract ManagedContractFactory {
    event ManagedContractCreated(address indexed managedContractAddress, address indexed owner, uint256 value);
    
    // Array to store the addresses of the deployed ManagedContracts
    address[] public managedContracts;

    // Deploy a new ManagedContract and return its address
    function createManagedContract(uint256 _value) public returns (address) {
        ManagedContract managedContract = new ManagedContract(msg.sender, _value);
        emit ManagedContractCreated(address(managedContract), msg.sender, _value);

        // Store the address of the newly created ManagedContract
        managedContracts.push(address(managedContract));

        return address(managedContract);
    }

    // Get the number of deployed ManagedContracts
    function getManagedContractsCount() public view returns (uint256) {
        return managedContracts.length;
    }

    // Get the deployed ManagedContracts' addresses
    function getManagedContracts() public view returns (address[] memory) {
        return managedContracts;
    }
}
```

