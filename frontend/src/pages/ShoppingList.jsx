import React from 'react';
import Sidebar from '../components/Sidebar';

const ShoppingList = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Shopping List</h1>
        <p>Your shopping list.</p>
      </div>
    </div>
  );
};

export default ShoppingList;
