import React from 'react';
import Sidebar from '../components/Sidebar';

const Addresses = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Addresses</h1>
        <p>Manage your delivery addresses.</p>
      </div>
    </div>
  );
};

export default Addresses;
