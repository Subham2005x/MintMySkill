import React from 'react';

const TransactionNotification = ({ show, onClose, tokenAmount, txHash }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm w-full transform transition-transform duration-300 ease-in-out">
      <div className="flex items-start">
        {/* Success Icon */}
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="ml-3 w-0 flex-1">
          <div className="text-sm font-medium text-gray-900">
            Congratulations! Course Completed
          </div>
          <p className="mt-1 text-sm text-gray-500">
            You've earned {tokenAmount} tokens! The transaction has been confirmed.
          </p>
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-primary-600 hover:text-primary-500"
            >
              View transaction details →
            </a>
          )}
        </div>
        
        {/* Close Button */}
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionNotification;