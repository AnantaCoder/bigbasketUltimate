import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShoppingCart,
  Package,
  Zap,
  Wallet,
  Phone,
  LogOut,
} from 'lucide-react';
import { logoutUser } from '../app/slices/authSlice';
import { selectCart } from '../app/slices/CartSlice';
import { motion } from 'framer-motion';

const UserDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cart = useSelector(selectCart);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    onClose();
    navigate('/'); // Redirect to login/signup page on logout
  };

  // Placeholder data - these would come from actual API/state
  const menuItems = [
    {
      icon: User,
      label: 'My Account',
      onClick: () => {
        navigate('/profile');
        onClose();
      },
    },
    {
      icon: ShoppingCart,
      label: `My Basket (${cart?.items?.length || 0})`,
      onClick: () => {
        navigate('/cart');
        onClose();
      },
    },
    {
      icon: Package,
      label: 'My Orders',
      onClick: () => {
        navigate('/my-orders');
        onClose();
      },
    },
    {
      icon: Zap,
      label: 'My Smart Basket',
      onClick: () => {
        navigate('/smart-basket');
        onClose();
      },
    },
    {
      icon: Wallet,
      label: 'My Wallet',
      onClick: () => {
        navigate('/wallet');
        onClose();
      },
    },
    {
      icon: Phone,
      label: 'Contact Us',
      onClick: () => {
        navigate('/customer-service');
        onClose();
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="absolute right-0 mt-125 w-100 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-md"
    >
      {/* User Info Header */}
      <div className="pb-3 mb-3 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Hi, {user?.first_name || user?.email}
            </p>
            <p className="text-xs text-gray-300">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-200 hover:bg-emerald-600/10 hover:text-emerald-400 rounded-lg transition-all duration-200"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Logout Button */}
        <div className="pt-2 mt-2 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserDropdown;
