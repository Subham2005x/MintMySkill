import { ethers } from 'ethers';
import { CourseTokenABI } from '../contracts/CourseToken';

class CourseTokenService {
    constructor() {
        this.contractAddress = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
        this.provider = null;
        this.contract = null;
    }

    async initialize() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
        }

        try {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await this.provider.getSigner();

            if (!this.contractAddress) {
                throw new Error('Contract address not configured. Please set VITE_TOKEN_CONTRACT_ADDRESS in your environment.');
            }

            // Validate contract address format
            if (!ethers.isAddress(this.contractAddress)) {
                throw new Error('Invalid contract address format');
            }

            // Check if contract exists at address
            const code = await this.provider.getCode(this.contractAddress);
            if (code === '0x') {
                throw new Error('No contract deployed at the specified address');
            }
            
            this.contract = new ethers.Contract(
                this.contractAddress,
                CourseTokenABI,
                signer
            );

            // Validate contract interface by calling name() function
            try {
                await this.contract.name();
            } catch (error) {
                throw new Error('Contract at address does not implement the expected interface');
            }
        } catch (error) {
            console.error('Failed to initialize contract:', error);
            throw error;
        }
    }

    async getBalance(address) {
        if (!this.contract) await this.initialize();
        const balance = await this.contract.balanceOf(address);
        return ethers.formatEther(balance);
    }

    async awardTokensForCompletion(studentAddress, courseId) {
        if (!this.contract) await this.initialize();
        try {
            const tx = await this.contract.awardTokens(studentAddress, courseId);
            await tx.wait();
            return {
                success: true,
                transaction: tx
            };
        } catch (error) {
            console.error('Error awarding tokens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getCompletedCourses(address) {
        if (!this.contract) await this.initialize();
        try {
            const courses = await this.contract.getCompletedCourses(address);
            return courses.map(course => course.toString());
        } catch (error) {
            console.error('Error getting completed courses:', error);
            return [];
        }
    }

    async hasCourseCompleted(address, courseId) {
        if (!this.contract) await this.initialize();
        try {
            return await this.contract.hasCourseCompleted(address, courseId);
        } catch (error) {
            console.error('Error checking course completion:', error);
            return false;
        }
    }
}

export const courseTokenService = new CourseTokenService();