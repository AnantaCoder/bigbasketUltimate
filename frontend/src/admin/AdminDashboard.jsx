import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import DashboardHome from "./components/DashboardHome";
import Users from "./components/Users";
import Products from "./components/Products";
import Orders from "./components/Orders";
import Settings from "./components/Settings";

const AdminDashboard = () => (
  <div style={{ display: "flex", height: "100vh" }}>
    <Sidebar />
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, padding: "2rem", background: "#f4f6f8" }}>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default AdminDashboard;
