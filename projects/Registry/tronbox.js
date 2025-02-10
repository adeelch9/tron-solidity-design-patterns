require('dotenv').config();
const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    mainnet: {
      // Don't put your private key here:
      privateKey: process.env.PRIVATE_KEY_MAINNET,
      /*
Create a .env file (it must be gitignored) containing something like

  export PRIVATE_KEY_MAINNET=4E7FEC...656243

Then, run the migration with:

  source .env && tronbox migrate --network mainnet

      */
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: process.env.PRIVATE_KEY_SHASTA,
      userFeePercentage: 50,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    nile: {
      privateKey: process.env.PRIVATE_KEY_NILE,
      userFeePercentage: 100,
      feeLimit: 1000 * 1e6,
      fullHost: 'https://nile.trongrid.io',
      network_id: '3'
    },
    development: {
      privateKey: "e9675f74084f51d70901e698e4b6cbf34e89f37f1cbff58370156d4ff35e52f3",
      userFeePercentage: 1, // The percentage of resource consumption ratio.
      fullHost: "http://127.0.0.1:9090",
      network_id: '9'
  },
  //   compilers: {
  //     solc: {
  //       version: '0.8.0'
  //     }
  //   }
  // },
  // // solc compiler optimize
  // solc: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 200
  //   },
  //   evmVersion: 'istanbul',
  //   viaIR: true,
  }
}
