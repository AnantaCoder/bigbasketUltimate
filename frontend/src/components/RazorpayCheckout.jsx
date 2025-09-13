import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

// Custom hook to load the Razorpay script
const useRazorpayScript = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = "razorpay-checkout-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Razorpay script failed to load.");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return scriptLoaded;
};

const RazorpayCheckout = ({ orderId, amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const authToken = useSelector((state) => state.auth?.accessToken);
  const scriptLoaded = useRazorpayScript(); // Use the custom hook

  const handlePayment = async () => {
    if (!scriptLoaded || !window.Razorpay) {
      setError("Razorpay script is not loaded yet. Please wait.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = authToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("User is not authenticated. Please login.");
      }

      const { data } = await axios.post(
        "/api/payments/razorpay-order/",
        {
          order_id: orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { order_id, amount: orderAmount, currency, key } = data;

      const options = {
        key: key,
        amount: orderAmount,
        currency: currency,
        name: "BigBasket Clone",
        description: "Order Payment",
        order_id: order_id,
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              "/api/payments/razorpay-verify/",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (verifyResponse.data.status === "success") {
              onSuccess && onSuccess(response);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (verifyError) {
            setError("Payment verification failed: " + verifyError.message);
            onError && onError(verifyError.message);
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      onError && onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handlePayment}
        disabled={loading || !orderId || !scriptLoaded}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ₹${amount}`}
      </button>
    </div>
  );
};

export default RazorpayCheckout;