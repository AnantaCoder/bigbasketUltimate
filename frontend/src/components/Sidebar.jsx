import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  MapPin,
  Store,
  Wallet,
  CreditCard,
  ChevronDown,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'My Orders', icon: ShoppingBag, path: '/my-orders' },
  { label: 'Addresses', icon: MapPin, path: '/addresses' },
  {
    label: 'Shop from',
    icon: Store,
    path: '/shop-from',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Smart Basket', path: '/smart-basket' },
      { label: 'Shopping List', path: '/shopping-list' },
      { label: 'Past Orders', path: '/my-orders/past' },
    ],
  },
  { label: 'bbWallet', icon: Wallet, path: '/wallet' },
  { label: 'Saved Payments', icon: CreditCard, path: '/saved-payments' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleItemClick = (item) => {
    if (item.hasDropdown) {
      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else {
      navigate(item.path);
    }
  };

  return (
    <div className="w-64 bg-white p-4 border-r">
      <ul className="space-y-3">
        {sidebarItems.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => handleItemClick(item)}
              className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-left hover:bg-gray-100 transition ${
                currentPath === item.path ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </div>
              {item.hasDropdown && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openDropdown === item.label ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>
            {item.hasDropdown && openDropdown === item.label && (
              <ul className="ml-8 mt-2 space-y-2">
                {item.dropdownItems.map((subItem) => (
                  <li key={subItem.path}>
                    <button
                      onClick={() => navigate(subItem.path)}
                      className={`block w-full px-4 py-2 text-sm rounded-lg text-left hover:bg-gray-100 transition ${
                        currentPath === subItem.path ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
