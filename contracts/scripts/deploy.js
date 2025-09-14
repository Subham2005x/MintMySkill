const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting MintMySkill smart contract deployment...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy EDUToken
  console.log("📄 Deploying EDUToken...");
  const EDUToken = await ethers.getContractFactory("EDUToken");
  const eduToken = await EDUToken.deploy(
    "MintMySkill Education Token",
    "EDU",
    deployer.address
  );
  await eduToken.deployed();
  console.log("✅ EDUToken deployed to:", eduToken.address);
  console.log("🔗 Transaction hash:", eduToken.deployTransaction.hash);

  // Deploy EDUCertificate
  console.log("\n📄 Deploying EDUCertificate...");
  const EDUCertificate = await ethers.getContractFactory("EDUCertificate");
  const eduCertificate = await EDUCertificate.deploy(
    "MintMySkill Course Certificate",
    "EDUCERT",
    deployer.address
  );
  await eduCertificate.deployed();
  console.log("✅ EDUCertificate deployed to:", eduCertificate.address);
  console.log("🔗 Transaction hash:", eduCertificate.deployTransaction.hash);

  // Verify deployment
  console.log("\n🔍 Verifying deployments...");
  
  // Check EDUToken
  const tokenName = await eduToken.name();
  const tokenSymbol = await eduToken.symbol();
  const tokenDecimals = await eduToken.decimals();
  const tokenTotalSupply = await eduToken.totalSupply();
  const tokenMaxSupply = await eduToken.MAX_SUPPLY();
  
  console.log("📊 EDUToken Details:");
  console.log("   Name:", tokenName);
  console.log("   Symbol:", tokenSymbol);
  console.log("   Decimals:", tokenDecimals);
  console.log("   Initial Supply:", ethers.utils.formatEther(tokenTotalSupply), "EDU");
  console.log("   Max Supply:", ethers.utils.formatEther(tokenMaxSupply), "EDU");
  console.log("   Owner:", await eduToken.owner());

  // Check EDUCertificate
  const certName = await eduCertificate.name();
  const certSymbol = await eduCertificate.symbol();
  const certTotalSupply = await eduCertificate.totalSupply();
  
  console.log("\n🎓 EDUCertificate Details:");
  console.log("   Name:", certName);
  console.log("   Symbol:", certSymbol);
  console.log("   Total Certificates:", certTotalSupply.toString());
  console.log("   Owner:", await eduCertificate.owner());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      EDUToken: {
        address: eduToken.address,
        name: tokenName,
        symbol: tokenSymbol,
        transactionHash: eduToken.deployTransaction.hash
      },
      EDUCertificate: {
        address: eduCertificate.address,
        name: certName,
        symbol: certSymbol,
        transactionHash: eduCertificate.deployTransaction.hash
      }
    }
  };

  // Write deployment info to file
  const fs = require("fs");
  const deploymentPath = `./deployments/${hre.network.name}-deployment.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Environment variables for backend
  console.log("\n🔧 Environment Variables for Backend:");
  console.log(`EDU_TOKEN_ADDRESS=${eduToken.address}`);
  console.log(`EDU_CERTIFICATE_ADDRESS=${eduCertificate.address}`);
  console.log(`BLOCKCHAIN_NETWORK=${hre.network.name}`);
  console.log(`DEPLOYER_ADDRESS=${deployer.address}`);

  // Contract interaction examples
  console.log("\n📋 Next Steps:");
  console.log("1. Add backend wallet as authorized minter:");
  console.log(`   await eduToken.addMinter("YOUR_BACKEND_WALLET_ADDRESS")`);
  console.log("2. Add backend wallet as authorized issuer:");
  console.log(`   await eduCertificate.addIssuer("YOUR_BACKEND_WALLET_ADDRESS")`);
  console.log("3. Update your .env file with the contract addresses above");
  console.log("4. Fund your backend wallet with some ETH/MATIC for gas fees");

  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });