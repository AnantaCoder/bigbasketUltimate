import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'; // Assuming you use React Router for navigation
import { fetchCart, removeItemFromCart, selectCart, selectCartStatus } from '../app/slices/CartSlice';
import { ShoppingCart, Trash2, LoaderCircle, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const status = useSelector(selectCartStatus);

  useEffect(() => {
    // Fetch the cart data when the component first loads
    if (status === 'idle') {
      dispatch(fetchCart());
    }
  }, [status, dispatch]);

  const handleRemoveItem = (itemId) => {
    dispatch(removeItemFromCart(itemId));
  };

  // 1. Loading State
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3 text-gray-500">
          <LoaderCircle className="h-8 w-8 animate-spin" />
          <p className="text-xl font-medium">Loading Your Cart...</p>
        </div>
      </div>
    );
  }

  // 2. Empty Cart State
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
        <ShoppingCart className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/home" // Link to your main products/home page
          className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-transform duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Continue Shopping
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    );
  }

  // 3. Cart with Items
  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-10 text-center">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-3">
          {/* Left Column: Cart Items */}
          <div className="space-y-6 lg:col-span-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-center gap-5 rounded-xl bg-white p-5 shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-gray-800">
                <img
                  src={item.image_urls?.[0] || 'https://avatars.githubusercontent.com/u/63280793?v=4'}
                  alt={item.item_name}
                  className="h-28 w-28 rounded-lg object-cover"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{item.item_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.manufacturer}</p>
                </div>
                <div className="flex items-center gap-6">
                   <p className="text-xl font-bold text-gray-900 dark:text-white">₹{item.price}</p>
                   <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-gray-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
                    aria-label={`Remove ${item.item_name}`}
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Order Summary */}
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="font-medium">₹{cart.total_price}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Shipping</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-4">
                <span>Taxes</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{cart.total_price}</span>
              </div>
            </div>
            <button className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white shadow-md transition-transform duration-200 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
