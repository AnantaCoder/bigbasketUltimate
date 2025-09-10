import React from 'react';
import Sidebar from '../components/Sidebar';

const SavedPayments = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Saved Payments</h1>
        <p>Manage your saved payment methods.</p>
      </div>
    </div>
  );
};

export default SavedPayments;
