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