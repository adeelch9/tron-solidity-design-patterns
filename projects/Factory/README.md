# Factory Contract Project

## Introduction
This projects demonstrates Factory Contract pattern in Solidity smart contracts.

## Folder Structure
```
/projects/Factory
├── contracts
│   └── ManagedContract.sol         # Sample contract
│   └── ManagedContractFactory.sol  # Factory contract
├── test
│   └── FactoryTests.js             # Test cases   
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
      tronbox compile
      tronbox migrate --network development
   ```
   5. **Run the Tests**: To run the tests, use the following command:
   ```bash
      tronbox test
   ```

4. **Deploy the Contracts**: 
   1. Update the `PRIVATE_KEY_NILE` environment variable in the `.env` file with your Nile Testnet private key.
   2. Update the `FULL_HOST` environment variable in the `.env` file with your Nile Testnet full node URL.
   3. Use the following command to deploy the contracts to Nile Testnet:
   ```bash
   tronbox compile
   tronbox migrate --network nile
   ```

