const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying EduToken to Avalanche...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "AVAX");

  // Deploy EduToken
  const EduToken = await ethers.getContractFactory("EduToken");
  console.log("📦 Deploying EduToken...");
  
  const eduToken = await EduToken.deploy();
  await eduToken.waitForDeployment();

  const contractAddress = await eduToken.getAddress();
  console.log("✅ EduToken deployed to:", contractAddress);

  // Verify deployment
  const name = await eduToken.name();
  const symbol = await eduToken.symbol();
  const totalSupply = await eduToken.totalSupply();
  
  console.log("📋 Contract Details:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", ethers.formatEther(totalSupply), "EDU");
  console.log("   Owner:", await eduToken.owner());

  console.log("\n🔧 Add this to your .env file:");
  console.log(`TOKEN_CONTRACT_ADDRESS=${contractAddress}`);

  console.log("\n🌐 View on Explorer:");
  const network = await deployer.provider.getNetwork();
  if (network.chainId === 43113n) {
    console.log(`https://testnet.snowscan.xyz/address/${contractAddress}`);
  } else if (network.chainId === 43114n) {
    console.log(`https://snowscan.xyz/address/${contractAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });