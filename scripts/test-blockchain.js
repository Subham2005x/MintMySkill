const { ethers } = require("ethers");
require("dotenv").config();

async function testBlockchainConnection() {
  console.log("🧪 Testing Avalanche C-Chain Connection...");

  try {
    // Test RPC connection
    const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name, "Chain ID:", network.chainId.toString());

    // Test wallet
    if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "0xYOUR_ACTUAL_PRIVATE_KEY_HERE") {
      console.log("⚠️  PRIVATE_KEY not configured in .env");
      return;
    }

    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("✅ Wallet address:", wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "AVAX");

    if (balance === 0n) {
      console.log("⚠️  No AVAX balance. Get test tokens from faucet:");
      console.log("   https://faucet.avax.network/");
    }

    // Test contract connection
    if (process.env.TOKEN_CONTRACT_ADDRESS && process.env.TOKEN_CONTRACT_ADDRESS !== "0x_your_deployed_edutoken_contract_address") {
      const contractABI = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)"
      ];

      const contract = new ethers.Contract(process.env.TOKEN_CONTRACT_ADDRESS, contractABI, provider);
      const name = await contract.name();
      const symbol = await contract.symbol();
      console.log("✅ Contract connected:", name, "(" + symbol + ")");
    } else {
      console.log("⚠️  TOKEN_CONTRACT_ADDRESS not configured. Deploy contract first.");
    }

    console.log("\n🎉 Blockchain configuration test completed!");

  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
  }
}

testBlockchainConnection();