import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import DashboardHome from "./components/DashboardHome";
import Users from "./components/Users";
import Products from "./components/Products";
import Orders from "./components/Orders";
import Settings from "./components/Settings";

// Simple stub for superadmin protection
const RequireSuperadmin = ({ children }) => {
  // Check for admin_user first (from AdminLogin), then user (from regular login)
  const adminUser = localStorage.getItem("admin_user");
  const regularUser = localStorage.getItem("user");
  let isSuperadmin = false;

  const checkUser = (userData) => {
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.is_superuser === true;
      } catch {
        return false;
      }
    }
    return false;
  };

  if (adminUser) {
    isSuperadmin = checkUser(adminUser);
  } else if (regularUser) {
    isSuperadmin = checkUser(regularUser);
  }

  return isSuperadmin ? children : <Navigate to="/admin/login" />;
};

const AdminRoutes = () => (
  <RequireSuperadmin>
    <AdminDashboard />
  </RequireSuperadmin>
);

export default AdminRoutes;
