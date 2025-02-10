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