# DiamondCutFacet Contract

## Description
One can add/replace/remove functionality to the Diamond contract by adding/replacing/removing facets to the diamond.

The `contracts/facets` folder contains the implementations of the facets.

The `DiamondCutFacet` facet allows one to add, replace, and remove facets from the diamond.

```solidity
    // Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

```