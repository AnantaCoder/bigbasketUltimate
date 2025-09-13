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
  }, []);

  const filteredOrders = (orders || []).filter(
    (o) =>
      o.status?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
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

  return (
    <div>
      <h2>Seller Order Management</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search orders by status or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 250, marginRight: 16 }}
        />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Order ID</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Status</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Total</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Tracking</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {order.id}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {order.status}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {order.total_amount}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {order.tracking_number || "N/A"}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                <button
                  onClick={() => openEditModal(order)}
                  style={{ marginRight: 8 }}
                >
                  Update Status
                </button>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 16 }}>
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 300,
            }}
          >
            <h3>Update Order Status</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Status:</label>
              <br />
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8 }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Tracking Number:</label>
              <br />
              <input
                name="tracking_number"
                value={form.tracking_number}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Estimated Delivery:</label>
              <br />
              <input
                name="estimated_delivery"
                type="date"
                value={form.estimated_delivery}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeModal}
                style={{ marginRight: 8 }}
              >
                Cancel
              </button>
              <button type="submit">Update</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Orders;
