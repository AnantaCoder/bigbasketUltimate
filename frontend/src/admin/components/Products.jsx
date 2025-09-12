import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ item_name: "", price: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all products from API without pagination
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/store/items/");
      const data = res.data;
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && Array.isArray(data.results)) {
        setProducts(data.results);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditProduct(null);
    setForm({ item_name: "", price: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setForm({
      item_name: product.item_name,
      price: product.price,
      description: product.description,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editProduct) {
        await api.patch(`/store/items/${editProduct.id}/`, form);
      } else {
        await api.post("/store/items/", form);
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      setError("Failed to save product");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      setLoading(true);
      setError("");
      try {
        await api.delete(`/store/items/${id}/`);
        fetchProducts();
      } catch (err) {
        setError("Failed to delete product");
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Product Management</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 200, marginRight: 16 }}
          name="item_name"
        />
        <button onClick={openAddModal} style={{ padding: 8 }}>
          Add Product
        </button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Price</th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>
              Description
            </th>
            <th style={{ padding: 8, border: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {product.item_name}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {product.price}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  {product.description}
                </td>
                <td style={{ padding: 8, border: "1px solid #ddd" }}>
                  <button
                    onClick={() => openEditModal(product)}
                    style={{ marginRight: 8 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                No products found.
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
            <h3>{editProduct ? "Edit Product" : "Add Product"}</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Name:</label>
              <br />
              <input
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Price:</label>
              <br />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Description:</label>
              <br />
              <input
                name="description"
                value={form.description}
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
              <button type="submit">{editProduct ? "Update" : "Add"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;
