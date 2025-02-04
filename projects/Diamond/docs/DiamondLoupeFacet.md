# DiamondLoupeFacet Contract

## Description

The `DiamondLoupeFacet` facet provides information about the diamond, including its facets and functions.

```solidity
    // Gets all facets and their selectors.
    function facets() external override view returns (Facet[] memory facets_);

    // Gets all the function selectors provided by a facet.
    function facetFunctionSelectors(address _facet) external override view returns (bytes4[] memory facetFunctionSelectors_);

    // Gets all the facet addresses used by a diamond.
    function facetAddresses() external override view returns (address[] memory facetAddresses_);

    // Gets the facet that supports the given selector.
    function facetAddress(bytes4 _functionSelector) external override view returns (address facetAddress_);
```