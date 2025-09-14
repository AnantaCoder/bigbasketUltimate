import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  fetchSavedForLater,
  removeItemFromCart,
  saveItemForLater,
  moveToCartFromSaved,
  removeFromSaved,
  selectCart,
  selectCartStatus,
} from "../app/slices/CartSlice";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLongLeft } from "react-icons/hi2";

const CartPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const status = useSelector(selectCartStatus);
  const savedForLater = useSelector((state) => state.cart.savedForLater);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCart());
      dispatch(fetchSavedForLater());
    }
  }, [status, dispatch]);

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

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-xl font-medium text-gray-700">
          Loading Your Cart...
        </p>
      </div>
    );
  }

  if (
    (!cart || !cart.items || cart.items.length === 0) &&
    (!savedForLater || savedForLater.length === 0)
  ) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white text-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-40 px-4 font-sans">
      <div className="max-w-4xl mx-auto pt-6">
        <div className="flex items-center gap-4 text-green-700 mb-4">
          <HiOutlineArrowLongLeft className="text-2xl" />
          <span
            className="font-semibold cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Back to Shopping
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Basket</h1>

        {/* Delivery and Product Count */}
        <div className="mb-4 flex justify-between items-center text-sm font-medium text-gray-600">
          <div className="flex items-center gap-1 text-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Delivery in</span>
            <span className="font-bold">6 mins</span>
          </div>
          <div>
            <span className="font-semibold">{cart?.items?.length || 0}</span>{" "}
            Product
          </div>
        </div>

        {/* Header row for cart items */}
        <div className="hidden sm:flex bg-gray-100 rounded-md p-4 mb-4 justify-between font-semibold text-gray-600">
          <div className="flex-1">Items</div>
          <div className="w-32 text-center">Quantity</div>
          <div className="w-32 text-right">Sub-total</div>
        </div>

        {/* Cart Items */}
        {cart?.items?.map((item) => {
          const savedAmount = item.mrp - item.price;
          return (
            <div
              key={item.id}
              className="border border-green-300 rounded-md p-4 mb-4 bg-green-50 flex flex-col sm:flex-row items-center sm:items-start gap-4"
            >
              <img
                src={item.image_urls?.[0] || "https://via.placeholder.com/100"}
                alt={item.item_name}
                className="h-24 w-24 rounded-md object-cover flex-shrink-0"
              />

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="font-semibold text-gray-900">
                  {item.item_name}
                </div>
                <div className="text-gray-500 line-through text-sm mt-1">
                  {item.mrp ? `₹${item.mrp}` : ""}
                </div>
                <div className="font-bold text-gray-900 text-lg mt-1">
                  ₹{item.price}
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
                <div className="flex items-center border border-gray-300 rounded-md bg-white">
                  <button
                    onClick={() => {}}
                    className="px-3 py-1 text-gray-700"
                  >
                    -
                  </button>
                  <div className="px-4 py-1 border-x border-gray-300">
                    {item.quantity || 1}
                  </div>
                  <button
                    onClick={() => {}}
                    className="px-3 py-1 text-gray-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-4 text-sm text-gray-600 mt-2 cursor-pointer">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleSaveForLater(item.id)}
                    className="hover:underline"
                  >
                    Save for later
                  </button>
                </div>
              </div>

              <div className="font-semibold text-gray-900 text-right w-full sm:w-auto mt-4 sm:mt-0">
                ₹{item.price * (item.quantity || 1)}
                {savedAmount > 0 && (
                  <div className="text-green-700 font-semibold text-sm mt-1">
                    Saved: ₹{savedAmount}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Saved For Later Section */}
        {savedForLater && savedForLater.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-6 text-gray-900">
              Saved For Later
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savedForLater.map((item) => {
                const savedAmount = item.mrp - item.price;
                const discount =
                  savedAmount > 0
                    ? ((savedAmount / item.mrp) * 100).toFixed(0)
                    : 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col"
                  >
                    {discount > 0 && (
                      <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 absolute top-2 left-2 rounded-full">
                        {discount}% OFF
                      </div>
                    )}
                    <img
                      src={
                        item.image_urls?.[0] ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item.item_name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {item.item_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-gray-900 text-lg">
                            ₹{item.price}
                          </span>
                          <span className="text-gray-500 line-through text-xs">
                            ₹{item.mrp}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => handleMoveToCart(item.id)}
                          className="w-full bg-green-500 text-white font-medium py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveFromSaved(item.id)}
                          className="w-full text-red-500 font-medium py-2 text-sm mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg px-4 py-4 z-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto">
            <div className="text-lg font-bold text-gray-900">
              Subtotal: ₹{subtotal}
            </div>
            <div className="text-sm text-green-700 font-medium">
              Savings: ₹69
            </div>
          </div>
          <div className="flex-end w-1x md:w-auto">
            <button
              onClick={() => navigate("/checkout")}
              className=" bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
