import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <aside style={{ width: 220, background: "#222", color: "#fff", padding: "2rem 1rem", height: "100vh" }}>
    <h2>SuperAdmin</h2>
    <nav>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><NavLink to="/admin" end style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Dashboard</NavLink></li>
        <li><NavLink to="/admin/users" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Users</NavLink></li>
        <li><NavLink to="/admin/products" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Products</NavLink></li>
        <li><NavLink to="/admin/orders" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Orders</NavLink></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar; 