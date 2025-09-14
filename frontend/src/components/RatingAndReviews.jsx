import React from 'react';

const RatingAndReviews = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md  mx-auto my-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating and Reviews</h2>
      <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-1">Want to rate this product?</p>
        <p className="text-gray-500 text-sm">You can rate or review this product only after purchasing from bigbasket</p>
      </div>
    </div>
  );
};

export default RatingAndReviews;