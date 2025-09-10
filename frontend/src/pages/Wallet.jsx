import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Zap, CheckCircle, ClipboardList } from 'lucide-react';

const Wallet = () => {
  const [amount, setAmount] = useState('500');

  const presetAmounts = ['100', '500', '1000', '2000'];

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 px-6 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">bbWallet</h1>

        {/* Welcome Banner */}
        <div className="bg-green-100 border border-green-300 rounded-lg p-5 mb-6 relative">
          <h2 className="text-xl font-bold text-green-800 mb-3">Welcome to bbWallet!</h2>
          <div className="flex space-x-6 text-sm text-green-700">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>One-click payments for faster checkouts</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>100% success rate</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-4 h-4" />
              <span>Track transactions easily</span>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-black text-white rounded-xl p-6 mb-6 max-w-md">
          <p className="text-sm">Balance</p>
          <p className="text-3xl font-bold mt-2">₹0</p>
        </div>

        {/* Recharge Box */}
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-3">Recharge bbWallet</h2>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <div className="flex gap-2 mb-4">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`border rounded-md px-4 py-2 text-sm ${
                  amount === amt ? 'bg-blue-100 border-blue-500 text-blue-600 font-bold' : ''
                }`}
              >
                + ₹{amt} {amt === '500' ? <span className="text-xs ml-1 text-blue-500">POPULAR</span> : ''}
              </button>
            ))}
          </div>
          <button className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
            Add money
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
