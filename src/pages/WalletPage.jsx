import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { walletAPI } from '../services/api';
import { mockUserData, mockTransactions } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import WalletConnect from '../components/WalletConnect';

const WalletPage = () => {
  const { user } = useAuth();
  const [connectedWallet, setConnectedWallet] = useState(mockUserData.walletAddress);

  // Fetch wallet balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['walletBalance', user?.id],
    queryFn: () => walletAPI.getBalance(user?.id),
    initialData: { balance: mockUserData.tokenBalance },
    enabled: !!user?.id,
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: walletAPI.getTransactions,
    initialData: mockTransactions,
  });

  const handleWalletConnected = async (address) => {
    setConnectedWallet(address);
    if (address) {
      try {
        // Connect wallet to backend
        // await walletAPI.connectWallet(address);
        console.log('Wallet connected:', address);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionIcon = (type) => {
    if (type === 'earned') {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your tokens and connect your MetaMask wallet
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Token Balance Card */}
        <div className="card">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Token Balance</h2>
            {balanceLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-primary-600 mb-4">
                {balanceData?.balance || 0} EDU
              </div>
            )}
            <p className="text-sm text-gray-600">
              Earn more tokens by completing courses and achieving milestones
            </p>
          </div>
        </div>

        {/* Wallet Connection Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">MetaMask Wallet</h2>
          
          {connectedWallet ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Connected</p>
                    <p className="text-sm text-green-600">{formatAddress(connectedWallet)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleWalletConnected(null)}
                  className="text-sm text-green-700 hover:text-green-800"
                >
                  Disconnect
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2">Your wallet is connected and ready to:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Receive token rewards</li>
                  <li>• Make redemption transactions</li>
                  <li>• Track your token history</li>
                </ul>
              </div>
            </div>
          ) : (
            <WalletConnect
              onWalletConnected={handleWalletConnected}
              connectedAddress={connectedWallet}
            />
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm">
            <option>All Transactions</option>
            <option>Earned</option>
            <option>Redeemed</option>
          </select>
        </div>

        {transactionsLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start learning to earn your first tokens!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earned' ? '+' : ''}{transaction.amount} EDU
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;