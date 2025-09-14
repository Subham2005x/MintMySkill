const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying EduToken to Avalanche C-Chain...");

  // Get the ContractFactory and Signers
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy EduToken
  const EduToken = await hre.ethers.getContractFactory("EduToken");
  const eduToken = await EduToken.deploy();

  await eduToken.deployed();

  console.log("✅ EduToken deployed to:", eduToken.address);
  console.log("📋 Contract details:");
  console.log("- Name:", await eduToken.name());
  console.log("- Symbol:", await eduToken.symbol());
  console.log("- Decimals:", await eduToken.decimals());
  console.log("- Total Supply:", (await eduToken.totalSupply()).toString());
  console.log("- Owner:", await eduToken.owner());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: eduToken.address,
    deployerAddress: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: eduToken.deployTransaction.hash,
    blockNumber: eduToken.deployTransaction.blockNumber
  };

  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contract on snowscan (if on mainnet/testnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await eduToken.deployTransaction.wait(5); // Wait for 5 confirmations

    try {
      console.log("🔍 Verifying contract on Snowscan...");
      await hre.run("verify:verify", {
        address: eduToken.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      console.log("❌ Contract verification failed:", error.message);
    }
  }

  return eduToken.address;
}

main()
  .then((address) => {
    console.log(`\n🎉 Deployment completed successfully!`);
    console.log(`Contract Address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });