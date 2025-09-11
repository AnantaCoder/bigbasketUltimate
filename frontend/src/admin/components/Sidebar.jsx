import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <aside style={{ width: 220, background: "#222", color: "#fff", padding: "2rem 1rem", height: "100vh" }}>
    <h2>SuperAdmin</h2>
    <nav>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><NavLink to="" end style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Dashboard</NavLink></li>
        <li><NavLink to="users" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Users</NavLink></li>
        <li><NavLink to="products" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Products</NavLink></li>
        <li><NavLink to="orders" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Orders</NavLink></li>
        <li><NavLink to="settings" style={({ isActive }) => ({ color: isActive ? "#61dafb" : "#fff" })}>Settings</NavLink></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar; 