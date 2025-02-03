# Diamond Pattern Documentation

## Description
This project implements the Diamond Pattern using Solidity and provides a set of tools for deploying and interacting with the contracts.

## How To Use

The `Diamond` contract has the following functions:

```solidity
// Diamond constructor that takes the address of the contract owner and the address of the diamondCutFacet
    constructor(address _contractOwner, address _diamondCutFacet) payable {        
        LibDiamond.setContractOwner(_contractOwner);

        // Add the diamondCut external function from the diamondCutFacet
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
        bytes4[] memory functionSelectors = new bytes4[](1);
        functionSelectors[0] = IDiamondCut.diamondCut.selector;
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _diamondCutFacet, 
            action: IDiamondCut.FacetCutAction.Add, 
            functionSelectors: functionSelectors
        });
        LibDiamond.diamondCut(cut, address(0), "");        
    }

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        // get diamond storage
        assembly {
            ds.slot := position
        }
        // get facet from function selector
        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");
        // Execute external function from facet using delegatecall and return any value.
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
                case 0 {
                    revert(0, returndatasize())
                }
                default {
                    return(0, returndatasize())
                }
        }
    }

    receive() external payable {}
```

The `Diamond` contract implements the `IDiamondCut` interface.

The `IDiamondCut` interface provides a function declaration for adding, replacing, or removing facets from the diamond.

The `IDiamondCut` interface has the following functions,enums and structs:

```solidity
    enum FacetCutAction {Add, Replace, Remove}
    // Add=0, Replace=1, Remove=2

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

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

    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
```
One can add functionality to the Diamond contract by adding different facets to the diamond.

The `contracts/facets` folder contains the implementations of the facets.
The `DiamondCutFacet` facet allows one to add, replace, and remove facets from the diamond.
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

The `OwnershipFacet` facet provides functionality to manage the ownership of a diamond.

```solidity
    // Transfers ownership of the diamond to the given address.
    function transferOwnership(address _newOwner) external override;

    // Gets the address of the owner of the diamond.
    function owner() external override view returns (address owner_);
```

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
