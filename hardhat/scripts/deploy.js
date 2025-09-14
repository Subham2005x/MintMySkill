require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const CourseToken = await ethers.getContractFactory("CourseToken");
  
  // Deploy the contract
  console.log("Deploying CourseToken...");
  const courseToken = await CourseToken.deploy();
  await courseToken.waitForDeployment();
  
  const deployedAddress = await courseToken.getAddress();
  console.log("CourseToken deployed to:", deployedAddress);
  
  // Verify on Etherscan (optional but recommended)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 6 block confirmations before verification...");
    await courseToken.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    await hre.run("verify:verify", {
      address: deployedAddress,
      constructorArguments: [],
    });
    console.log("Contract verified on Etherscan");
  }
  
  return deployedAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });