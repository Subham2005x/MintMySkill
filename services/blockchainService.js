const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

class BlockchainService {
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
      if (process.env.PRIVATE_KEY) {
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
      console.log('✅ Blockchain service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Initialize the EduToken contract
   */
  async initializeContract() {
    try {
      // Load contract ABI (you'll need to add this)
      const contractABI = [
        // ERC20 standard functions
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function totalSupply() view returns (uint256)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        
        // Custom EduToken functions
        "function rewardTokens(address to, uint256 amount, string reason) returns (bool)",
        "function batchRewardTokens(address[] to, uint256[] amounts, string reason) returns (bool)",
        "function burnTokens(uint256 amount) returns (bool)",
        "function redeemTokens(uint256 amount, string option) returns (bool)",
        
        // Events
        "event TokensRewarded(address indexed to, uint256 amount, string reason)",
        "event TokensRedeemed(address indexed from, uint256 amount, string option)"
      ];

      this.eduTokenContract = new ethers.Contract(
        process.env.TOKEN_CONTRACT_ADDRESS,
        contractABI,
        this.signer || this.provider
      );

      // Test contract connection
      const name = await this.eduTokenContract.name();
      const symbol = await this.eduTokenContract.symbol();
      
      console.log(`🪙 Contract initialized: ${name} (${symbol})`);
      console.log(`📍 Contract address: ${process.env.TOKEN_CONTRACT_ADDRESS}`);
      
      return true;
    } catch (error) {
      console.error('❌ Contract initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Reward tokens to user for course completion
   */
  async rewardTokens(userAddress, amount, reason) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const amountWei = ethers.parseEther(amount.toString());
      const tx = await this.eduTokenContract.rewardTokens(userAddress, amountWei, reason);
      
      console.log(`🪙 Rewarding ${amount} EDU tokens to ${userAddress}`);
      console.log(`📝 Reason: ${reason}`);
      console.log(`🔗 Transaction: ${tx.hash}`);

      const receipt = await tx.wait();
      
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

  /**
   * Batch reward tokens to multiple users
   */
  async batchRewardTokens(rewards) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const addresses = rewards.map(r => r.address);
      const amounts = rewards.map(r => ethers.parseEther(r.amount.toString()));
      const reason = rewards[0]?.reason || 'Batch reward';

      const tx = await this.eduTokenContract.batchRewardTokens(addresses, amounts, reason);
      
      console.log(`🪙 Batch rewarding tokens to ${addresses.length} users`);
      console.log(`🔗 Transaction: ${tx.hash}`);

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Batch token reward failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Issue NFT certificate for course completion
   */
  async issueCertificate(certificateData) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const {
        studentAddress,
        courseId,
        courseName,
        score,
        grade,
        instructorName,
        metadataURI
      } = certificateData;

      const tx = await this.eduCertificate.issueCertificate(
        studentAddress,
        courseId,
        courseName,
        score,
        grade,
        instructorName,
        metadataURI
      );

      console.log(`🎓 Issuing certificate for course ${courseId} to ${studentAddress}`);
      console.log(`📊 Score: ${score}, Grade: ${grade}`);
      console.log(`🔗 Transaction: ${tx.hash}`);

      const receipt = await tx.wait();
      
      // Extract token ID from transaction logs
      const event = receipt.events?.find(e => e.event === 'CertificateIssued');
      const tokenId = event?.args?.tokenId?.toString();

      return {
        success: true,
        tokenId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Certificate issuance failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify certificate authenticity
   */
  async verifyCertificate(tokenId) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const result = await this.eduCertificate.verifyCertificate(tokenId);
      
      return {
        success: true,
        isValid: result.isValid,
        student: result.student,
        courseId: result.courseId,
        courseName: result.courseName,
        completionDate: new Date(result.completionDate.toNumber() * 1000),
        score: result.score.toNumber(),
        grade: result.grade
      };
    } catch (error) {
      console.error('❌ Certificate verification failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's token balance
   */
  async getTokenBalance(userAddress) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const balance = await this.eduTokenContract.balanceOf(userAddress);
      return {
        success: true,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('❌ Token balance query failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's certificates
   */
  async getUserCertificates(userAddress) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const tokenIds = await this.eduCertificate.getStudentCertificates(userAddress);
      const certificates = [];

      for (const tokenId of tokenIds) {
        const verification = await this.verifyCertificate(tokenId.toString());
        if (verification.success) {
          certificates.push({
            tokenId: tokenId.toString(),
            ...verification
          });
        }
      }

      return {
        success: true,
        certificates
      };
    } catch (error) {
      console.error('❌ User certificates query failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has certificate for specific course
   */
  async hasCertificate(userAddress, courseId) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const hasCert = await this.eduCertificate.hasCertificate(userAddress, courseId);
      return {
        success: true,
        hasCertificate: hasCert
      };
    } catch (error) {
      console.error('❌ Certificate check failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getGasPrice();

      return {
        success: true,
        network: network.name,
        chainId: network.chainId,
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei'
      };
    } catch (error) {
      console.error('❌ Network info query failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Estimate gas for token reward
   */
  async estimateRewardGas(userAddress, amount) {
    try {
      if (!this.isInitialized()) {
        throw new Error('Blockchain service not initialized');
      }

      const amountWei = ethers.parseEther(amount.toString());
      const gasEstimate = await this.eduTokenContract.estimateGas.rewardTokens(
        userAddress, 
        amountWei, 
        'Gas estimation'
      );

      const gasPrice = await this.provider.getGasPrice();
      const estimatedCost = gasEstimate * gasPrice;

      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
        estimatedCost: ethers.formatEther(estimatedCost) + ' ETH'
      };
    } catch (error) {
      console.error('❌ Gas estimation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;