import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [form, setForm] = useState({ status: "", total_amount: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/store/seller-orders/");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to fetch orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = (orders || []).filter(
    (o) =>
      o.status?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) ||
      o.order_user?.user?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (order) => {
    setEditOrder(order);
    setForm({
      status: order.status,
      total_amount: order.total_amount,
      tracking_number: order.tracking_number || "",
      estimated_delivery: order.estimated_delivery || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditOrder(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.patch(`/store/orders/${editOrder.id}/`, form);
      closeModal();
      fetchOrders();
    } catch {
      setError("Failed to update order");
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getCustomerName = (order) => {
    return order.order_user?.user || order.buyer_email || "N/A";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Seller Order Management</h2>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search orders by status, ID, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full max-w-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getCustomerName(order)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{order.total_amount}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => openEditModal(order)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number:</label>
                <input
                  name="tracking_number"
                  value={form.tracking_number}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery:</label>
                <input
                  name="estimated_delivery"
                  type="date"
                  value={form.estimated_delivery}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
