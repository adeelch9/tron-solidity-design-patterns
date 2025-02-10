# Registry Pattern in Solidity

## Overview
The Registry pattern in Solidity involves using a central contract to manage and store the addresses of other contracts in the system. This pattern enables a flexible, upgradeable architecture by allowing you to easily swap out or update the contract addresses in the registry.

## Registry Contract

The `Registry` contract is responsible for storing and managing the addresses of other contracts. It uses a mapping to associate unique keys with contract addresses.

### Code Example
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Registry {
    mapping(bytes32 => address) public contracts;

    function getContract(bytes32 _key) external view returns (address) {
        return contracts[_key];
    }

    function setContract(bytes32 _key, address _contractAddress) external {
        contracts[_key] = _contractAddress;
    }
}
```
### UserStorage Contract

The `UserStorage` contract is a simple example of a contract that can be managed by the registry. It stores user names associated with user addresses.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
contract UserStorage {
    mapping(address => string) private users;

    function addUser(address _userAddress, string memory _userName) external {
        users[_userAddress] = _userName;
    }

    function getUser(address _userAddress) external view returns (string memory) {
        return users[_userAddress];
    }
}
```
### UserLogic Contract

The `UserLogic` contract interacts with the `Registry` and `UserStorage` contracts to add, retrieve, and greet users. It uses the `Registry` contract to get the address of the `UserStorage` contract before interacting with it.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
contract UserLogic {
    Registry private registry;

    constructor(Registry _registry) {
        registry = _registry;
    }

    function addUser(address _userAddress, string memory _userName) external {
        UserStorage userStorage = UserStorage(registry.getContract(keccak256("UserStorage")));
        userStorage.addUser(_userAddress, _userName);
    }

    function getUser(address _userAddress) external view returns (string memory) {
        UserStorage userStorage = UserStorage(registry.getContract(keccak256("UserStorage")));
        return userStorage.getUser(_userAddress);
    }

    function greetUser(address _userAddress) external view returns (string memory) {
        UserStorage userStorage = UserStorage(registry.getContract(keccak256("UserStorage")));
        string memory userName = userStorage.getUser(_userAddress);
        return string(abi.encodePacked("Hello, ", userName, "!"));
    }
}
```
### Benefits of the Registry Pattern

- Flexibility: The registry pattern allows you to easily swap out or update the addresses of other contracts in the system.
- Upgradeability: The registry contract can be easily upgraded or modified to add or remove contracts without affecting the rest of the system.
- Centralized Management:  A single point of reference for contract addresses simplifies interactions between contracts.

### Conclusion
The Registry pattern provides a robust framework for managing multiple contract instances in Solidity. By utilizing this pattern, you can enhance the modularity and maintainability of your smart contract architecture.