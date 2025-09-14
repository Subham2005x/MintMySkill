const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

class AvalancheBlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.eduTokenContract = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🔗 Initializing Avalanche C-Chain connection...');
      
      // Get network configuration
      const network = process.env.BLOCKCHAIN_NETWORK || 'fuji';
      const rpcUrl = network === 'avalanche' 
        ? process.env.AVALANCHE_MAINNET_RPC_URL 
        : process.env.AVALANCHE_RPC_URL;
      
      if (!rpcUrl) {
        console.log('⚠️ No RPC URL configured, skipping blockchain initialization');
        return false;
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test connection
      const blockNumber = await this.provider.getBlockNumber();
      console.log(`✅ Connected to Avalanche ${network} network, block: ${blockNumber}`);

      // Initialize signer if private key is provided
      if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_wallet_private_key_for_token_distribution') {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        console.log(`💰 Wallet address: ${this.signer.address}`);
        
        // Check wallet balance
        const balance = await this.provider.getBalance(this.signer.address);
        console.log(`💳 Wallet balance: ${ethers.formatEther(balance)} AVAX`);
      }

      // Initialize contract if address is provided
      if (process.env.TOKEN_CONTRACT_ADDRESS && process.env.TOKEN_CONTRACT_ADDRESS !== '0x_your_deployed_edutoken_contract_address') {
        await this.initializeContract();
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      return false;
    }
  }

  async initializeContract() {
    try {
      // Load contract ABI
      const contractPath = path.join(__dirname, '../artifacts/contracts/EduToken.sol/EduToken.json');
      
      if (!fs.existsSync(contractPath)) {
        console.log('⚠️ Contract ABI not found, please compile contracts first');
        return false;
      }

      const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      
      this.eduTokenContract = new ethers.Contract(
        process.env.TOKEN_CONTRACT_ADDRESS,
        contractArtifact.abi,
        this.signer || this.provider
      );

      // Verify contract
      const name = await this.eduTokenContract.name();
      const symbol = await this.eduTokenContract.symbol();
      console.log(`🪙 Contract initialized: ${name} (${symbol})`);
      
      return true;
    } catch (error) {
      console.error('❌ Contract initialization failed:', error.message);
      return false;
    }
  }

  async rewardStudent(studentAddress, courseId, reason = 'Course completion') {
    try {
      if (!this.initialized || !this.eduTokenContract || !this.signer) {
        console.log('⚠️ Blockchain service not fully initialized, skipping token reward');
        return { success: false, error: 'Service not initialized' };
      }

      console.log(`🎁 Rewarding student ${studentAddress} for course ${courseId}`);

      // The smart contract will determine the amount based on courseId
      const tx = await this.eduTokenContract.rewardStudent(
        studentAddress,
        courseId,
        reason,
        {
          gasLimit: 200000,
        }
      );

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Token reward failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserTokenBalance(userAddress) {
    try {
      if (!this.initialized || !this.eduTokenContract) {
        return { balance: '0', earned: '0', redeemed: '0' };
      }

      const stats = await this.eduTokenContract.getUserStats(userAddress);
      
      return {
        balance: ethers.formatEther(stats.balance),
        earned: ethers.formatEther(stats.earned),
        redeemed: ethers.formatEther(stats.redeemed)
      };
    } catch (error) {
      console.error('❌ Failed to get user token balance:', error.message);
      return { balance: '0', earned: '0', redeemed: '0' };
    }
  }

  async setCourseReward(courseId, rewardAmount) {
    try {
      if (!this.initialized || !this.eduTokenContract || !this.signer) {
        return { success: false, error: 'Service not initialized' };
      }

      const amountInWei = ethers.parseEther(rewardAmount.toString());
      
      const tx = await this.eduTokenContract.setCourseReward(courseId, amountInWei);
      const receipt = await tx.wait();

      console.log(`✅ Course reward set: ${rewardAmount} EDU for course ${courseId}`);

      return {
        success: true,
        transactionHash: tx.hash,
        courseId,
        rewardAmount
      };
    } catch (error) {
      console.error('❌ Failed to set course reward:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility methods
  isInitialized() {
    return this.initialized;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  getContract() {
    return this.eduTokenContract;
  }

  formatTokenAmount(amount) {
    return ethers.formatEther(amount);
  }

  parseTokenAmount(amount) {
    return ethers.parseEther(amount.toString());
  }
}

module.exports = new AvalancheBlockchainService();