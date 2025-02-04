
# LibDiamond Library

## Description

The `LibDiamond` library provides a set of functions for interaction with the diamond contract.

The `LibDiamond` library has the following functions:

```solidity
    // Set the contract owner
    function setContractOwner(address _newOwner) internal;

    // Internal function version of diamondCut (its purpose is to Add/Replace/Remove facets from the diamond)
    function diamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) internal;

    // Add function to the facet
    function addFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal;

    // Replace functions of the facet
    function replaceFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal;

    // Remove functions of the given facet from the diamond
    function removeFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal;

    // Add facet to the diamond
    function addFacet(DiamondStorage storage ds, address _facetAddress) internal;

    // Add function of the given facet to the diamond
    function addFunction(DiamondStorage storage ds, bytes4 _selector, uint96 _selectorPosition, address _facetAddress) internal;

    // Remove function of the given facet from the diamond
    function removeFunction(DiamondStorage storage ds, address _facetAddress, bytes4 _selector) internal;
```