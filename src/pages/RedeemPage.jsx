import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { redeemAPI } from '../services/api';
import { mockRedeemItems, mockUserData } from '../data/mockData';
import RedeemItemCard from '../components/RedeemItemCard';

const RedeemPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('price_low');

  // Fetch redeem items
  const { data: redeemItems = [], isLoading } = useQuery({
    queryKey: ['redeemItems'],
    queryFn: redeemAPI.getRedeemItems,
    initialData: mockRedeemItems,
  });

  // User's token balance
  const userTokenBalance = mockUserData.tokenBalance;

  const handleRedeem = async (itemId) => {
    try {
      // For development: simulate redemption
      const item = redeemItems.find(item => item.id === itemId);
      if (userTokenBalance >= item.tokenCost) {
        alert(`Successfully redeemed ${item.name}! Check your email for delivery details.`);
      } else {
        alert(`Insufficient tokens. You need ${item.tokenCost - userTokenBalance} more tokens.`);
      }
      
      // Uncomment when backend is ready:
      // await redeemAPI.redeemItem(itemId);
      // Show success message and update balance
    } catch (error) {
      console.error('Redemption failed:', error);
      alert('Redemption failed. Please try again.');
    }
  };

  // Get unique categories
  const categories = [...new Set(redeemItems.map(item => item.category))];

  // Filter and sort items
  const filteredAndSortedItems = redeemItems
    .filter(item => !selectedCategory || item.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.tokenCost - b.tokenCost;
        case 'price_high':
          return b.tokenCost - a.tokenCost;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Redeem Rewards</h1>
        <p className="mt-1 text-sm text-gray-600">
          Use your earned tokens to get amazing rewards
        </p>
      </div>

      {/* Token Balance Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your Token Balance</h2>
            <p className="text-3xl font-bold">{userTokenBalance} EDU</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100">Total Earned</p>
            <p className="text-xl font-semibold">{mockUserData.totalTokensEarned} EDU</p>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {filteredAndSortedItems.length} item{filteredAndSortedItems.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(category => {
          const categoryItems = redeemItems.filter(item => item.category === category);
          const affordableItems = categoryItems.filter(item => item.tokenCost <= userTokenBalance);
          
          return (
            <div key={category} className="card text-center">
              <div className="text-lg font-semibold text-gray-900">{categoryItems.length}</div>
              <div className="text-sm text-gray-600">{category}</div>
              <div className="text-xs text-green-600">
                {affordableItems.length} affordable
              </div>
            </div>
          );
        })}
      </div>

      {/* Redeem Items Grid */}
      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map(item => (
            <RedeemItemCard
              key={item.id}
              item={item}
              userTokenBalance={userTokenBalance}
              onRedeem={handleRedeem}
            />
          ))}
        </div>
      )}

      {/* Earn More Tokens CTA */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Need More Tokens?
        </h3>
        <p className="text-gray-600 mb-4">
          Complete more courses and earn tokens to unlock amazing rewards
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/courses"
            className="btn-primary"
          >
            Browse Courses
          </a>
          <a
            href="/dashboard/courses"
            className="btn-outline"
          >
            Continue Learning
          </a>
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;