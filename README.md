# Tron Blockchain Solidity Design Patterns

## Purpose
This repository contains various design patterns implemented in Solidity for the Tron blockchain. It serves as a reference for developers looking to understand and utilize design patterns such as the Diamond Pattern, which allows for modular and flexible contract design.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/adeelch9/tron-solidity-design-patterns.git
   ```
2. Copy `.env.example` to `.env` and fill in your credentials.

## Deployment Steps
To deploy the contracts, follow these steps:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variables in the `.env` file.
3. Deploy the contracts using:
   ```bash
   npx tronbox migrate --network nile
   ```

## Folder Structure
```
/projects/Diamond
├── contracts
│   ├── facets          # Facet contracts implementing specific functionalities
│   │   ├── DiamondLoupeFacet.sol
│   │   └── OwnershipFacet.sol
│   ├── interfaces      # Interface contracts
│   │   ├── IDiamondLoupe.sol
│   │   └── IERC165.sol
│   ├── libraries       # Library contracts
│   │   └── LibDiamond.sol
│   └── Diamond         # Main diamond contract
├── migrations           # Migration scripts for deploying contracts
└── tronbox.js          # Configuration for TronBox
```

## Additional Information
Refer to the individual README files in the project directories for more specific instructions and details on each design pattern.
