# Diamond Pattern Project

## Introduction
The Diamond Pattern is a design pattern used in smart contract development that allows for flexible and modular contract design. This project implements the Diamond Pattern using Solidity and provides a set of tools for deploying and interacting with the contracts.

## Folder Structure
```
/projects/Diamond
├── contracts
│   ├── facets          # Facet contracts implementing specific functionalities
│   │   ├── DiamondLoupeFacet.sol
│   │   └── OwnershipFacet.sol
│   |
│   ├── interfaces      # Interface contracts
│   │   ├── IDiamondLoupe.sol
│   │   └── IERC165.sol
│   |
│   ├── libraries       # Library contracts
│   │   └── LibDiamond.sol
│   └── Diamond         # Main diamond contract
├── migrations         # Migration scripts for deploying contracts
└── tronbox.js        # Configuration for TronBox
└── README.md         # Project documentation
```

## How to Run the Project
1. **Install Dependencies**: Make sure you have Node.js and Yarn installed. Then, run:
   ```bash
   yarn install
   ```
2. **Set Environment Variables**: Ensure you have the necessary environment variables set, such as `PRIVATE_KEY_NILE`.

3. **Deploy the Contracts**: Use the following command to deploy the contracts:
   ```bash
   yarn run migrate --network nile
   ```

## Adding New Facets
In the deployment migration script, you can easily add new facets to the diamond. The relevant code snippet is as follows:

```javascript
const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    /*
    add other facet names here
    e.g.
    'Test1Facet',
    'Test2Facet'
    */
];
```

Simply add the name of the new facet contract to the `FacetNames` array. When you run the migration, the specified facets will be deployed and added to the diamond contract automatically.

## Overview
The Diamond Pattern allows for multiple facets (contract implementations) to be combined into a single contract. Each facet can implement specific functionalities, making it easier to manage and upgrade contracts.
