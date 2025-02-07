# Event-Driven Architecture Project

## Introduction
This projects demonstrates Event-Driven Architecture (EDA) in Solidity smart contracts, showcasing how events enable efficient communication between smart contracts and external applications.

## Folder Structure
```
/projects/SimpleToken
├── contracts
│   └── SimpleToken         # Simple token contract
├── migrations         # Migration scripts for deploying contracts
└── tronbox.js        # Configuration for TronBox
└── README.md         # Project documentation
```

## How to Run the Project
1. **Install Dependencies**: Make sure you have Node.js and Yarn installed. Then, run:
   ```bash
      npm install -g tronbox
      yarn install
   ```
2. **Set Environment Variables**: Ensure you have the necessary environment variables set, such as `PRIVATE_KEY`.

3. **Deploy the Contracts**: Use the following command to deploy the contracts to Nile Testnet:
   ```bash
      tronbox migrate --network nile
   ```

4. **Deploying on local network**: 
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
       test
   ```
