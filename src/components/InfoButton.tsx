import { useState } from 'react';

export default function InfoButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Info Icon Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed top-20 right-4 z-10 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
        aria-label="Information about APIs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="mt-2">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">What is an API?</h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold">An API (Application Programming Interface)</span> is like a 
                  restaurant waiter who takes your order to the kitchen and brings back your food.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-bold mb-2">Simple Explanation:</h3>
                  <p>Imagine you're at a restaurant:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>You (the app) want food (data)</li>
                    <li>The waiter (API) takes your request to the kitchen (server)</li>
                    <li>The kitchen prepares your meal (processes the request)</li>
                    <li>The waiter brings back your food (returns the data)</li>
                  </ul>
                </div>
                
                <p>
                  APIs let different software talk to each other without needing to know how the other works internally.
                  Just like you don't need to know how to cook the meal - you just tell the waiter what you want!
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold mb-2">Real-World Examples:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Weather apps use APIs to get forecast data</li>
                    <li>Shopping sites use payment APIs to process credit cards</li>
                    <li>Social media apps use APIs to post updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 