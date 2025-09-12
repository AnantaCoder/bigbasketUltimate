import React, { useState } from "react";
import api from "../../services/api";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/accounts/login/", { email, password });
      const token = res.data.access_token || res.data.token || res.data.access;
      if (token) {
        localStorage.setItem("access_token", token);
        onLoginSuccess();
      } else {
        setError("Login failed: No token received");
      }
    } catch (err) {
      setError("Login failed: Invalid credentials or server error");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", padding: 20 }}>
      <h2>Admin Login</h2>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: 8, width: "100%" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
