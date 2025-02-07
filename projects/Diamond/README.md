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
   npm install -g tronbox
   npm install
   ```
2. **Set Environment Variables**: Ensure you have the necessary environment variables set, such as `PRIVATE_KEY` for local development and `PRIVATE_KEY_NILE` for Nile Testnet deployment.

3. **Deploying on local network**: 
   1. First install latest docker and docker-compose: https://docs.docker.com/engine/install/
   2. Once docker is installed, get the tron/tre image:
   ```bash
      docker pull tronbox/tre  
   ```
   3. Run the tron/tre image with the following command:
   ```bash
      docker run -it \
      -p 9090:9090 \
      --rm \
      --name tron \
      -e "accounts=20" \
      tronbox/tre
   ```
   4. Now you can run the tronbox migrate command to deploy the contracts to the local network
   ```bash
      tronbox migrate --network development
   ```
   5. **Run the Tests**: To run the tests, use the following command:
   ```bash
      tronbox test
   ```

4. **Deploy the Contracts**: 
   1. Update the `PRIVATE_KEY_NILE` environment variable in the `.env` file with your Nile Testnet private key.
   2. Update the `FULL_HOST` environment variable in the `.env` file with your Nile Testnet full node URL.
   3. Update the `TronWeb` object in the `migrations/2_deploy_contracts.js` file with your Nile Testnet full node URL and private key.
   4. Use the following command to deploy the contracts to Nile Testnet:
   ```bash
   tronbox migrate --network nile
   ```

## Adding New Facets
In the deployment migration script, you can easily add new facets to the diamond. The relevant code snippet is as follows:

```javascript
const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'Test1Facet',
    'Test2Facet'
    /*
    add other facet names here
    */
];
```

Simply add the name of the new facet contract to the `FacetNames` array. When you run the migration, the specified facets will be deployed and added to the diamond contract automatically.

## Overview
The Diamond Pattern allows for multiple facets (contract implementations) to be combined into a single contract. Each facet can implement specific functionalities, making it easier to manage and upgrade contracts.
