import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <header
      style={{
        background: "#fff",
        padding: "1rem 2rem",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Admin Dashboard</h1>
        <div>
          <span>Superadmin</span>
          <button style={{ marginLeft: 16 }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
