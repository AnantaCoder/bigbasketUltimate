import React, { useEffect, useState } from "react";
import api from "../../services/api";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    products: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/auth/dashboard-stats/");
        setStats(res.data);
      } catch {
        setError("Failed to fetch dashboard stats");
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2>Superadmin Dashboard</h2>
      {loading && <div>Loading stats...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 32, marginTop: 32 }}>
          <div
            style={{
              background: "#f4f6f8",
              padding: 24,
              borderRadius: 8,
              minWidth: 160,
            }}
          >
            <h3 style={{ margin: 0 }}>Users</h3>
            <div style={{ fontSize: 32, fontWeight: "bold" }}>
              {stats.users}
            </div>
          </div>
          <div
            style={{
              background: "#f4f6f8",
              padding: 24,
              borderRadius: 8,
              minWidth: 160,
            }}
          >
            <h3 style={{ margin: 0 }}>Sellers</h3>
            <div style={{ fontSize: 32, fontWeight: "bold" }}>
              {stats.sellers}
            </div>
          </div>
          <div
            style={{
              background: "#f4f6f8",
              padding: 24,
              borderRadius: 8,
              minWidth: 160,
            }}
          >
            <h3 style={{ margin: 0 }}>Products</h3>
            <div style={{ fontSize: 32, fontWeight: "bold" }}>
              {stats.products}
            </div>
          </div>
          <div
            style={{
              background: "#f4f6f8",
              padding: 24,
              borderRadius: 8,
              minWidth: 160,
            }}
          >
            <h3 style={{ margin: 0 }}>Orders</h3>
            <div style={{ fontSize: 32, fontWeight: "bold" }}>
              {stats.orders}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
