require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "your-private-key-here";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "your-infura-api-key";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "your-etherscan-api-key";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "your-polygonscan-api-key";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "your-private-key-here" ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "your-private-key-here" ? [PRIVATE_KEY] : [],
      chainId: 137,
    },
    polygonMumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY !== "your-private-key-here" ? [PRIVATE_KEY] : [],
      chainId: 80001,
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: PRIVATE_KEY !== "your-private-key-here" ? [PRIVATE_KEY] : [],
      chainId: 43114,
      gasPrice: 25000000000, // 25 gwei
    },
    avalancheFuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: PRIVATE_KEY !== "your-private-key-here" ? [PRIVATE_KEY] : [],
      chainId: 43113,
      gasPrice: 25000000000, // 25 gwei
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY,
      avalanche: process.env.SNOWTRACE_API_KEY || "your-snowtrace-api-key",
      avalancheFuji: process.env.SNOWTRACE_API_KEY || "your-snowtrace-api-key",
    },
    customChains: [
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL: "https://api.snowtrace.io/api",
          browserURL: "https://snowtrace.io/"
        }
      },
      {
        network: "avalancheFuji",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};