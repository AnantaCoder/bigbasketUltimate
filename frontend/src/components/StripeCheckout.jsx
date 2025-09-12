import React, { useState } from "react";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"); // from env

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const authToken = useSelector((state) => state.auth?.token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Defensive check: try to get token from localStorage if not in Redux
      const token = authToken || localStorage.getItem("access_token");
      if (!token) {
        throw new Error("User is not authenticated. Please login.");
      }
      // 1. Call backend to create PaymentIntent
      const { data } = await axios.post("/api/payments/create-payment-intent/", {
        amount: amount, // amount in dollars
        currency: "usd",
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const clientSecret = data.clientSecret;

      // 2. Confirm payment with Stripe.js
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        const errorMsg = result.error.message;
        setError(errorMsg);
        onError && onError(errorMsg);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          setSuccess(true);
          onSuccess && onSuccess(result.paymentIntent);
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setError(errorMsg);
      onError && onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check if Stripe is properly loaded
  if (!stripe) {
    return (
      <div className="p-4 border rounded">
        <p className="text-gray-500">Loading payment system...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <CardElement className="p-2 border mb-4" />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay $${amount}`}
      </button>
      {success && <p className="text-green-500 mt-2">Payment Successful 🎉</p>}
    </form>
  );
};

const StripeCheckout = ({ amount, onSuccess, onError }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
  </Elements>
);

export default StripeCheckout;
