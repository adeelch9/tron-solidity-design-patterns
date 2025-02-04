# OwnershipFacet Contract

## Description

The `OwnershipFacet` facet provides functionality to manage the ownership of a diamond.

```solidity
    // Transfers ownership of the diamond to the given address.
    function transferOwnership(address _newOwner) external override;

    // Gets the address of the owner of the diamond.
    function owner() external override view returns (address owner_);
```