import { ethers } from 'ethers';
import MintMySkillTokenABI from '../artifacts/MintMySkillToken.json'; // We'll need to generate this from the contract

class TokenService {
    constructor() {
        this.contractAddress = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
        this.provider = null;
        this.contract = null;
        this.signer = null;
    }

    async initialize() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
        }

        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(
            this.contractAddress,
            MintMySkillTokenABI,
            this.signer
        );
    }

    async getBalance(address) {
        if (!this.contract) await this.initialize();
        const balance = await this.contract.balanceOf(address);
        return ethers.formatEther(balance);
    }

    async awardCourseCompletion(courseId) {
        if (!this.contract) await this.initialize();
        try {
            const tx = await this.contract.awardCourseCompletion(
                await this.signer.getAddress(),
                courseId
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error awarding course completion:', error);
            throw error;
        }
    }

    async hasCourseCompleted(courseId) {
        if (!this.contract) await this.initialize();
        const address = await this.signer.getAddress();
        return await this.contract.hasCourseCompleted(address, courseId);
    }

    async burnTokens(amount) {
        if (!this.contract) await this.initialize();
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const tx = await this.contract.burn(amountInWei);
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error burning tokens:', error);
            throw error;
        }
    }

    async transferTokens(to, amount) {
        if (!this.contract) await this.initialize();
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const tx = await this.contract.transfer(to, amountInWei);
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Error transferring tokens:', error);
            throw error;
        }
    }
}

export const tokenService = new TokenService();