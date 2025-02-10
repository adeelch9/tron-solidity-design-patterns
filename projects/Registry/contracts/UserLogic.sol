// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Registry} from "./Registry.sol";
import {UserStorage} from "./UserStorage.sol";

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