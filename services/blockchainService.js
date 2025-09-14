const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract ABIs (will be generated after compilation)
const EDUTokenABI = require('../contracts/artifacts/EDUToken.sol/EDUToken.json').abi;
const EDUCertificateABI = require('../contracts/artifacts/EDUCertificate.sol/EDUCertificate.json').abi;

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.eduToken = null;
    this.eduCertificate = null;
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Setup provider
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Setup wallet
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('BLOCKCHAIN_PRIVATE_KEY not set in environment variables');
      }
      this.wallet = new ethers.Wallet(privateKey, this.provider);

      // Setup contracts
      const eduTokenAddress = process.env.EDU_TOKEN_ADDRESS;
      const eduCertificateAddress = process.env.EDU_CERTIFICATE_ADDRESS;

      if (!eduTokenAddress || !eduCertificateAddress) {
        throw new Error('Contract addresses not set in environment variables');
      }

      this.eduToken = new ethers.Contract(eduTokenAddress, EDUTokenABI, this.wallet);
      this.eduCertificate = new ethers.Contract(eduCertificateAddress, EDUCertificateABI, this.wallet);

      // Verify connection
      await this.provider.getBlockNumber();
      console.log('✅ Blockchain service initialized successfully');
      console.log(`📍 Network: ${process.env.BLOCKCHAIN_NETWORK || 'localhost'}`);
      console.log(`💰 Wallet: ${this.wallet.address}`);
      console.log(`🪙 EDU Token: ${eduTokenAddress}`);
      console.log(`🎓 Certificate: ${eduCertificateAddress}`);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      return false;
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

      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.eduToken.rewardTokens(userAddress, amountWei, reason);
      
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
      const amounts = rewards.map(r => ethers.utils.parseEther(r.amount.toString()));
      const reason = rewards[0]?.reason || 'Batch reward';

      const tx = await this.eduToken.batchRewardTokens(addresses, amounts, reason);
      
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

      const balance = await this.eduToken.balanceOf(userAddress);
      return {
        success: true,
        balance: ethers.utils.formatEther(balance),
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
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei'
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

      const amountWei = ethers.utils.parseEther(amount.toString());
      const gasEstimate = await this.eduToken.estimateGas.rewardTokens(
        userAddress, 
        amountWei, 
        'Gas estimation'
      );

      const gasPrice = await this.provider.getGasPrice();
      const estimatedCost = gasEstimate.mul(gasPrice);

      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
        estimatedCost: ethers.utils.formatEther(estimatedCost) + ' ETH'
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