import React from 'react';
import Sidebar from '../components/Sidebar';

const SmartBasket = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Smart Basket</h1>
        <p>Your smart basket recommendations.</p>
      </div>
    </div>
  );
};

export default SmartBasket;
