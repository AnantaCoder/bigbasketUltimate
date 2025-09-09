import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCart, fetchCart, selectCartStatus } from "../app/slices/CartSlice";

function CheckoutPage() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const status = useSelector(selectCartStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCart());
    }
  }, [status, dispatch]);

  const totalAmountPayable = cart && cart.total_price !== undefined
    ? cart.total_price
    : cart && cart.items
      ? cart.items.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)
      : 0;

  // Assuming total savings is calculated as difference between some original price and current price
  // For now, setting to 0 or you can calculate if you have original prices
  const totalSavings = 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Bar */}
      <header className="bg-green-700 text-white p-4 flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <span className="material-icons">location_on</span>
          <div>
            <div className="font-semibold">Delivery Address</div>
            <div className="text-sm">- Select your delivery address from the list or add new address</div>
          </div>
        </div>
        <div className="border-t border-dotted border-white flex-grow"></div>
        <div className="flex items-center space-x-2">
          <span className="material-icons">payment</span>
          <div>
            <div className="font-semibold">Payment Options</div>
            <div className="text-sm">Pay Order amount by selecting any payment mode</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 flex space-x-6">
        {/* Left: Add new address */}
        <section className="flex-1 bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Add new address</h2>
          <div className="relative h-96 border rounded overflow-hidden">
            {/* Placeholder for map */}
            <iframe
              title="Delivery Location Map"
              src="https://maps.google.com/maps?q=Bengaluru&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen=""
              aria-hidden="false"
              tabIndex="0"
            ></iframe>
            <button className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded flex items-center space-x-1">
              <span className="material-icons">my_location</span>
              <span>Get current location</span>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">Delivery Location</div>
                <div>Choodasandra, Bengaluru, Karnataka, 560099</div>
              </div>
              <button className="bg-red-600 px-4 py-2 rounded text-white font-semibold hover:bg-red-700">
                Use this location
              </button>
            </div>
          </div>
        </section>

        {/* Right: Order Summary */}
        <aside className="w-96 bg-white rounded shadow p-6 flex flex-col space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Order Summary</h2>
          <div className="flex justify-between">
            <span>Total Amount Payable</span>
            <span className="font-semibold">₹{totalAmountPayable}</span>
          </div>
          <div className="flex justify-between bg-green-100 text-green-800 p-2 rounded">
            <span>Total Savings</span>
            <span className="font-semibold">₹{totalSavings} ▼</span>
          </div>
          <div className="bg-yellow-100 border border-yellow-400 p-3 rounded text-sm">
            Select your address and delivery slot to know accurate delivery charges. You can save more by applying a voucher!
          </div>
        </aside>
      </main>
    </div>
  );
}

export default CheckoutPage;
