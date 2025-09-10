import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCart,
  removeItemFromCart,
  saveItemForLater,
  moveToCartFromSaved,
  removeFromSaved,
  selectCart,
  selectCartStatus
} from '../app/slices/CartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const status = useSelector(selectCartStatus);
  const savedForLater = useSelector(state => state.cart.savedForLater);
  const footerRef = useRef(null);

  const [showStickyBar, setShowStickyBar] = useState(true);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCart());
    }
  }, [status, dispatch]);

  // Sticky Bar hide/show based on footer visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!footerRef.current) return;
      const footerTop = footerRef.current.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;
      setShowStickyBar(footerTop > viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRemoveItem = (itemId) => {
    dispatch(removeItemFromCart(itemId));
  };

  const handleSaveForLater = (itemId) => {
    dispatch(saveItemForLater(itemId));
  };

  const handleMoveToCart = (itemId) => {
    dispatch(moveToCartFromSaved(itemId));
  };

  const handleRemoveFromSaved = (itemId) => {
    dispatch(removeFromSaved(itemId));
  };

  const subtotal = cart?.items?.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const totalSavings = cart?.items?.reduce(
    (sum, item) => sum + ((item.mrp - item.price) * (item.quantity || 1)),
    0
  );

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-xl font-medium text-gray-700">Loading Your Cart...</p>
      </div>
    );
  }

  if ((!cart || !cart.items || cart.items.length === 0) && (!savedForLater || savedForLater.length === 0)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white text-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-40 px-4">
      <div className="max-w-4xl mx-auto pt-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Basket</h1>

        <div className="mb-4 flex justify-between items-center">
          <div className="text-lg font-semibold text-green-800">
            Delivery in <span className="font-bold">22 mins</span>
          </div>
          <div className="font-semibold text-gray-700">{cart?.items?.length || 0} Product(s)</div>
        </div>

        {/* Header row */}
        <div className="bg-gray-100 rounded-md p-4 mb-4 flex justify-between font-semibold text-gray-600">
          <div>Items</div>
          <div>Quantity</div>
          <div>Sub-total</div>
        </div>

        {/* Cart Items */}
        {cart?.items?.map((item) => {
          const savedAmount = item.mrp - item.price;
          return (
            <div
              key={item.id}
              className="border border-green-300 rounded-md p-4 mb-4 bg-green-50 flex items-center gap-6"
            >
              <img
                src={item.image_urls?.[0] || 'https://via.placeholder.com/100'}
                alt={item.item_name}
                className="h-24 w-24 rounded-md object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold text-gray-900">{item.item_name}</div>
                <div className="text-gray-500 line-through text-sm">{item.mrp ? `₹${item.mrp}` : ''}</div>
                <div className="font-bold text-gray-900 text-lg mt-1">₹{item.price}</div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button className="px-3 py-1 text-gray-700">-</button>
                  <div className="px-4 py-1">{item.quantity || 1}</div>
                  <button className="px-3 py-1 text-gray-700">+</button>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 mt-1 cursor-pointer">
                  <button onClick={() => handleRemoveItem(item.id)} className="hover:underline">Delete</button>
                  <button onClick={() => handleSaveForLater(item.id)} className="hover:underline">Save for later</button>
                </div>
              </div>

              <div className="font-semibold text-gray-900 text-right">
                ₹{item.price * (item.quantity || 1)}
                {savedAmount > 0 && (
                  <div className="text-green-700 font-semibold text-sm mt-1">Saved: ₹{savedAmount}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Saved For Later Section */}
        {savedForLater && savedForLater.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900">Saved For Later</h2>
            {savedForLater.map((item) => {
              const savedAmount = item.mrp - item.price;
              return (
                <div
                  key={item.id}
                  className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 flex items-center gap-6"
                >
                  <img
                    src={item.image_urls?.[0] || 'https://via.placeholder.com/100'}
                    alt={item.item_name}
                    className="h-24 w-24 rounded-md object-cover"
                  />

                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.item_name}</div>
                    <div className="text-gray-500 line-through text-sm">{item.mrp ? `₹${item.mrp}` : ''}</div>
                    <div className="font-bold text-gray-900 text-lg mt-1">₹{item.price}</div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-4 text-sm text-gray-600 mt-1 cursor-pointer">
                      <button onClick={() => handleMoveToCart(item.id)} className="hover:underline">Move to Cart</button>
                      <button onClick={() => handleRemoveFromSaved(item.id)} className="hover:underline">Remove</button>
                    </div>
                  </div>

                  <div className="font-semibold text-gray-900 text-right">
                    ₹{item.price * (item.quantity || 1)}
                    {savedAmount > 0 && (
                      <div className="text-green-700 font-semibold text-sm mt-1">Saved: ₹{savedAmount}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Sticky Checkout Summary */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-xl px-4 py-4 z-50">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Subtotal: ₹{subtotal}</p>
                <p className="text-sm text-green-700">Savings: ₹{totalSavings}</p>
              </div>
            </div>

            <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* Footer reference to hide sticky bar when in view */}
      <div ref={footerRef} className="h-40 bg-gray-100 mt-10"></div>
    </div>
  );
};

export default CartPage;
