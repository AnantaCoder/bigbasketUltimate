import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/store/orders/");
      const data = res.data;
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to fetch orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = (orders || []).filter(
    (o) =>
      o.status?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) ||
      o.order_user?.user?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Order Management</h2>
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
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
                    onClick={() => openDetailsModal(order)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
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

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Details - #{selectedOrder.id}</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p><strong>Customer:</strong> {getCustomerName(selectedOrder)}</p>
                <p><strong>Email:</strong> {selectedOrder.buyer_email}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Total Amount:</strong> ₹{selectedOrder.total_amount}</p>
              </div>
              <div>
                <p><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                <p><strong>Tracking Number:</strong> {selectedOrder.tracking_number || "N/A"}</p>
                <p><strong>Estimated Delivery:</strong> {selectedOrder.estimated_delivery ? formatDate(selectedOrder.estimated_delivery) : "N/A"}</p>
                <p><strong>Shipped At:</strong> {selectedOrder.shipped_at ? formatDate(selectedOrder.shipped_at) : "N/A"}</p>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Ordered Products</h4>
            <div className="space-y-3">
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price per unit: ₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{item.total_price}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items found in this order.</p>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
