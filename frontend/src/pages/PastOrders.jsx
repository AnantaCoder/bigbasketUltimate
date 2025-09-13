import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

export default function PastOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/store/user-orders/?status=past");
        setOrders(response.data.results || response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load past orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 text-red-500">{error}</div>
      </div>
    );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-xl font-bold mb-4">Past Orders</h1>
        {orders.length === 0 ? (
          <p className="text-gray-500">You haven’t placed any orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">Order #{order.id}</h2>
                    <p className="text-sm text-gray-600">
                      Status: {order.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ₹{order.total_amount}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ordered on:{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    {order.delivered_at && (
                      <p className="text-sm text-gray-600">
                        Delivered on:{" "}
                        {new Date(order.delivered_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
