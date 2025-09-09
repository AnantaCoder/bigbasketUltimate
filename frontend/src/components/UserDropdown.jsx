import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, ShoppingCart, Package, Zap, Wallet, Phone, LogOut } from 'lucide-react';
import { logoutUser } from '../app/slices/authSlice';
import { selectCart } from '../app/slices/CartSlice';

const UserDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const cart = useSelector(selectCart);

  const handleLogout = () => {
    dispatch(logoutUser());
    onClose();
  };

  // Placeholder data - these would come from actual API/state
  const walletBalance = 250.00; // Placeholder
  const ordersCount = 12; // Placeholder

  const menuItems = [
    {
      icon: User,
      label: 'My Account',
      onClick: () => {
        // Navigate to account page
        console.log('Navigate to My Account');
        onClose();
      }
    },
    {
      icon: ShoppingCart,
      label: `My Basket (${cart?.items?.length || 0} items)`,
      onClick: () => {
        // Navigate to basket/cart page
        console.log('Navigate to My Basket');
        onClose();
      }
    },
    {
      icon: Package,
      label: `My Orders `,
      onClick: () => {
        // Navigate to orders page
        console.log('Navigate to My Orders');
        onClose();
      }
    },
    {
      icon: Zap,
      label: 'My Smart Basket',
      onClick: () => {
        // Navigate to smart basket page
        console.log('Navigate to My Smart Basket');
        onClose();
      }
    },
    {
      icon: Wallet,
      label: `My Wallet `,
      onClick: () => {
        // Navigate to wallet page
        console.log('Navigate to My Wallet');
        onClose();
      }
    },
    {
      icon: Phone,
      label: 'Contact Us',
      onClick: () => {
        // Navigate to contact page
        console.log('Navigate to Contact Us');
        onClose();
      }
    }
  ];

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      {/* User Info Header */}
      <div className="pb-3 mb-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Hi, {user?.first_name || user?.email}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 rounded-md transition-colors duration-200"
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Logout Button */}
        <div className="pt-2 mt-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;
