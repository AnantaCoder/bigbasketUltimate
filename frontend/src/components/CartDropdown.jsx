import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { removeItemFromCart, updateItemQuantity, selectCart } from '../app/slices/CartSlice';

const CartDropdown = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector(selectCart);

  const handleRemoveItem = (itemId) => {
    dispatch(removeItemFromCart(itemId));
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
        <p className="text-center text-gray-700 dark:text-gray-300">Your cart is empty.</p>
      </div>
    );
  }

  const handleIncrement = (item) => {
    const newQuantity = item.quantity + 1;
    dispatch(updateItemQuantity({ itemId: item.id, quantity: newQuantity }));
  };

  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      dispatch(updateItemQuantity({ itemId: item.id, quantity: newQuantity }));
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Basket</h3>
      <div className="max-h-64 overflow-y-auto">
    
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between mb-3">
            <img
              src={item.image_urls}
              alt={item.item_name}
              className="h-12 w-12 rounded object-cover"
            />
            <div className="flex-1 mx-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.manufacturer}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDecrement(item)}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={`Decrease quantity of ${item.item_name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
              <button
                onClick={() => handleIncrement(item)}
                className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={`Increase quantity of ${item.item_name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white ml-4">₹{item.price}</p>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="ml-3 text-red-500 hover:text-red-600"
              aria-label={`Remove ${item.item_name}`}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between font-semibold text-gray-900 dark:text-white">
        <span>Subtotal</span>
        <span>₹{cart.total_price}</span>
      </div>
      <button
        onClick={() => {
          onClose();
          navigate('/checkout');
        }}
        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartDropdown;
