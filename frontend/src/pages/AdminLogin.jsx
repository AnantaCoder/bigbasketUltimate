import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Spinner = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 50 50"
    aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="31.415, 31.415"
      transform="rotate(0 25 25)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="0.9s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const emailRegex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;

    if (!email || !emailRegex.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login/", { email, password });
      const { access, refresh, user } = res.data || {};

      if (!user || !user.is_superuser) {
        setError("You are not a superadmin.");
        setLoading(false);
        return;
      }

      // Save tokens either in localStorage (remember) or sessionStorage
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("access_token", access);
      storage.setItem("refresh_token", refresh);
      storage.setItem("admin_user", JSON.stringify(user));

      // if remember is false, ensure localStorage doesn't have tokens
      if (!remember) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("admin_user");
      }

      navigate("/admin");
    } catch (err) {
      console.error(err);
      // try to show the server message if present
      const serverMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;
      setError(serverMsg || "Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, #f6f9ff 0%, #ffffff 35%, #f7fbff 100%)",
    padding: 20,
    fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 480,
    background: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 10px 30px rgba(16,24,40,0.08)",
    border: "1px solid rgba(16,24,40,0.04)",
  };

  const headingStyle = { margin: 0, marginBottom: 8, fontSize: 22, letterSpacing: "-0.2px" };
  const subtitleStyle = { margin: 0, marginBottom: 18, color: "#64748b", fontSize: 13 };

  const labelStyle = { display: "block", fontSize: 13, marginBottom: 6, color: "#102a43" };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e6eef8",
    boxSizing: "border-box",
    fontSize: 14,
    outline: "none",
  };
  const inputErrorStyle = { border: "1px solid #ff6b6b" };

  const smallError = { color: "#b02a37", fontSize: 13, marginTop: 6 };

  const actionRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 };

  const loginBtnStyle = {
    background: "linear-gradient(90deg,#0b74de,#0066cc)",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    minWidth: 120,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  };

  const ghostBtn = {
    background: "transparent",
    border: "1px solid #e6eef8",
    color: "#0f1724",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <form style={cardStyle} onSubmit={handleSubmit} noValidate aria-labelledby="login-heading">
        <h1 id="login-heading" style={headingStyle}>
          Superadmin Login
        </h1>
        <p style={subtitleStyle}>Sign in with your admin credentials to access the dashboard.</p>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email" style={labelStyle}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldError.email) setFieldError((p) => ({ ...p, email: undefined }));
              if (error) setError("");
            }}
            style={{
              ...inputStyle,
              ...(fieldError.email ? inputErrorStyle : {}),
            }}
            placeholder="you@company.com"
            autoComplete="username"
            aria-invalid={!!fieldError.email}
            aria-describedby={fieldError.email ? "email-error" : undefined}
            required
          />
          {fieldError.email && (
            <div id="email-error" style={smallError}>
              {fieldError.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 6 }}>
          <label htmlFor="password" style={labelStyle}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldError.password) setFieldError((p) => ({ ...p, password: undefined }));
                if (error) setError("");
              }}
              style={{
                ...inputStyle,
                paddingRight: 44,
                ...(fieldError.password ? inputErrorStyle : {}),
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={!!fieldError.password}
              aria-describedby={fieldError.password ? "password-error" : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                color: "#334155",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {fieldError.password && (
            <div id="password-error" style={smallError}>
              {fieldError.password}
            </div>
          )}
        </div>

        {/* Remember + Forgot */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              aria-checked={remember}
            />
            Remember me
          </label>

          <button
            type="button"
            onClick={() => alert("If you have forgotten your password, use the password reset flow.")} // placeholder
            style={{ background: "transparent", border: "none", color: "#0b74de", cursor: "pointer", fontSize: 13 }}
          >
            Forgot password?
          </button>
        </div>

        {/* Error */}
        {error && <div role="alert" style={{ ...smallError, marginTop: 12 }}>{error}</div>}

        {/* Actions */}
        <div style={actionRow}>
          <button type="button" style={ghostBtn} onClick={() => { setEmail(""); setPassword(""); setError(""); setFieldError({}); }}>
            Clear
          </button>

          <button type="submit" style={loginBtnStyle} disabled={loading} aria-disabled={loading}>
            {loading ? (
              <>
                <Spinner size={16} /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>

        {/* Footer small */}
        <div style={{ marginTop: 16, fontSize: 13, color: "#64748b", textAlign: "center" }}>
          Only superadmins can access this panel.
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
