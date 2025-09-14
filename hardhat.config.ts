import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Configuration for Sepolia testnet
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    // Configuration for local development
    hardhat: {
      chainId: 1337
    },
  },
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/artifacts",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};