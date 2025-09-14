import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MintMySkill Token contract...");

  // Deploy the contract
  const MintMySkillToken = await hre.ethers.getContractFactory("MintMySkillToken");
  const token = await MintMySkillToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("MintMySkillToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });