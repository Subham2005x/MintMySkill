import { mockUserData, mockTransactions } from '../data/mockData';

// Mock responses for wallet-related operations
export const mockWalletAPI = {
  getBalance: async (userId) => {
    return { balance: mockUserData.tokenBalance };
  },

  connectWallet: async (walletAddress) => {
    return { success: true, address: walletAddress };
  },

  getTransactions: async () => {
    return mockTransactions;
  }
};

// Simulated delay for mock responses
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));