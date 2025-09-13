import React, { useState } from 'react';

const RedeemItemCard = ({ item, userTokenBalance, onRedeem }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  const {
    id,
    name,
    description,
    tokenCost,
    image,
    category,
    inStock,
    estimatedDelivery,
  } = item;

  const canAfford = userTokenBalance >= tokenCost;
  const canRedeem = canAfford && inStock;

  const handleRedeem = async () => {
    setIsRedeeming(true);
    try {
      await onRedeem(id);
    } catch (error) {
      console.error('Redeem failed:', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      {/* Item Image */}
      <div className="relative mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-sm font-medium">
          {tokenCost} tokens
        </div>
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-sm font-medium ${
          inStock 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* Item Info */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {category}
          </span>
          {!canAfford && (
            <span className="text-sm text-red-600 font-medium">
              Need {tokenCost - userTokenBalance} more tokens
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {name}
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Delivery: {estimatedDelivery}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRedeem}
          disabled={!canRedeem || isRedeeming}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            canRedeem
              ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRedeeming ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redeeming...
            </div>
          ) : !inStock ? (
            'Out of Stock'
          ) : !canAfford ? (
            `Need ${tokenCost - userTokenBalance} more tokens`
          ) : (
            `Redeem for ${tokenCost} tokens`
          )}
        </button>
      </div>
    </div>
  );
};

export default RedeemItemCard;