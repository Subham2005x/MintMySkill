require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Avalanche Mainnet C-Chain
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Avalanche Testnet (Fuji)
    fuji: {
      url: process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: 25000000000, // 25 gwei
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Local development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      avalanche: "abc", // snowscan doesn't require API key
      avalancheFujiTestnet: "abc",
    },
    customChains: [
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL: "https://api.snowscan.xyz/api",
          browserURL: "https://snowscan.xyz/"
        }
      },
      {
        network: "avalancheFujiTestnet", 
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowscan.xyz/api",
          browserURL: "https://testnet.snowscan.xyz/"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  mocha: {
    timeout: 60000,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};