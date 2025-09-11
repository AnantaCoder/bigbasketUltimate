import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Settings = () => {
  const [sellers, setSellers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSeller, setEditSeller] = useState(null);
  const [form, setForm] = useState({
    shop_name: "",
    gst_number: "",
    address: "",
    seller_type: "individual",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch sellers from API
  const fetchSellers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/auth/sellers/");
      setSellers(res.data);
    } catch (err) {
      setError("Failed to fetch sellers");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const filteredSellers = sellers.filter(
    (s) =>
      s.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditSeller(null);
    setForm({
      shop_name: "",
      gst_number: "",
      address: "",
      seller_type: "individual",
    });
    setModalOpen(true);
  };

  const openEditModal = (seller) => {
    setEditSeller(seller);
    setForm({
      shop_name: seller.shop_name,
      gst_number: seller.gst_number,
      address: seller.address,
      seller_type: seller.seller_type,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditSeller(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editSeller) {
        await api.patch(`/auth/sellers/${editSeller.user_email}/`, form); // user_email as PK
      } else {
        await api.post("/auth/sellers/", form);
      }
      closeModal();
      fetchSellers();
    } catch (err) {
      setError("Failed to save seller");
    }
    setLoading(false);
  };

  const handleDelete = async (user_email) => {
    if (window.confirm("Delete this seller?")) {
      setLoading(true);
      setError("");
      try {
        await api.delete(`/auth/sellers/${user_email}/`);
        fetchSellers();
      } catch (err) {
        setError("Failed to delete seller");
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Seller Management</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search sellers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 200, marginRight: 16 }}
        />
        <button onClick={openAddModal} style={{ padding: 8 }}>
          Add Seller
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Shop Name</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>GST Number</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Address</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>
              Seller Type
            </th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>User Email</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSellers.map((seller) => (
            <tr key={seller.user_email}>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {seller.shop_name}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {seller.gst_number}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {seller.address}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {seller.seller_type}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                {seller.user_email}
              </td>
              <td style={{ padding: 8, border: "1px solid #ddd" }}>
                <button
                  onClick={() => openEditModal(seller)}
                  style={{ marginRight: 8 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(seller.user_email)}
                  style={{ color: "red" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredSellers.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                No sellers found.
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
            <h3>{editSeller ? "Edit Seller" : "Add Seller"}</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Shop Name:</label>
              <br />
              <input
                name="shop_name"
                value={form.shop_name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>GST Number:</label>
              <br />
              <input
                name="gst_number"
                value={form.gst_number}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Address:</label>
              <br />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Seller Type:</label>
              <br />
              <select
                name="seller_type"
                value={form.seller_type}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="individual">Individual</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeModal}
                style={{ marginRight: 8 }}
              >
                Cancel
              </button>
              <button type="submit">{editSeller ? "Update" : "Add"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;
