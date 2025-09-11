// SellerOnlyAuthAndDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  registerUser,
  verifyOtp,
  logoutUser,
  clearError,
} from "../app/slices/authSlice"; // adjust path if needed
import api from "../services/api";
import { toast } from "react-toastify";

/* Minimal icons */
const EyeIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const EyeSlashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
);

/**
 * Seller-only auth page + dashboard with add-item capability.
 * - Uses your Redux thunks for auth
 * - Uses `api` for seller / items endpoints
 *
 * Adjust endpoints as required by your backend.
 */
export default function SellerOnlyAuthAndDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useSelector((s) => s.auth);

  // UI mode: login | signup | verify | dashboard
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Signup form (seller-only)
  const [signForm, setSignForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    is_seller: true, // forced seller flow
  });

  // Seller profile fields to create after OTP verification
  const [sellerProfile, setSellerProfile] = useState({
    shop_name: "",
    gst_number: "",
    address: "",
    seller_type: "individual",
  });

  // OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Dashboard items
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState(null);

  // Add item form
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });
  const [addingItem, setAddingItem] = useState(false);

  // Simple error renderer for DRF-style errors
  const renderError = () => {
    if (!error) return null;
    let errorMessage = "Something went wrong. Try again.";
    if (typeof error === "string") errorMessage = error;
    else if (error && typeof error === "object") {
      if (error.detail) errorMessage = error.detail;
      else {
        const keys = Object.keys(error);
        if (keys.length > 0) {
          const val = error[keys[0]];
          errorMessage = Array.isArray(val) ? `${keys[0]}: ${val[0]}` : val;
        }
      }
    }
    return <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{errorMessage}</div>;
  };

  // ---------- Auth handlers ----------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(loginForm)).unwrap();
      // after login we'll load dashboard (useEffect below)
      navigate("manage-items")
      toast.success("Logged in as seller (if account is seller).");
    } catch (err) {
      console.log("login failed", err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!signForm.email || !signForm.password || !signForm.first_name) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      await dispatch(registerUser(signForm)).unwrap();
      setOtpEmail(signForm.email);
      setMode("verify");
      toast.info("OTP sent. Check your email.");
    } catch (err) {
      console.log("register failed", err);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Enter OTP");
      return;
    }
    try {
      await dispatch(verifyOtp({ email: otpEmail, otp })).unwrap();
      toast.success("OTP verified — logged in.");

      // create seller profile if provided
      if (sellerProfile.shop_name) {
        try {
          const access = localStorage.getItem("access_token");
          if (!access) throw new Error("Missing access token");
          await api.post("/sellers/register/", sellerProfile, {
            headers: { Authorization: `Bearer ${access}` },
          });
          toast.success("Seller profile created.");
          navigate("seller/manage-items")
        } catch (sellerErr) {
          console.error("seller create failed", sellerErr);
          toast.warn("Seller creation failed — you can add profile later in dashboard.");
        }
      }

      setMode("dashboard");
    } catch (err) {
      console.log("otp verify failed", err);
    }
  };

  // logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (err) {
      console.log("logout err", err);
    } finally {
      setMode("login");
      setItems([]);
      setNewItem({ name: "", price: "", stock: "", description: "" });
      navigate("/seller");
    }
  };

  // ---------- Items / Dashboard API ----------
  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError(null);
    try {
      const access = localStorage.getItem("access_token");
      if (!access) throw new Error("Not authenticated");
      const res = await api.get("/seller/items/", {
        headers: { Authorization: `Bearer ${access}` },
      });
      setItems(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error("fetchItems err", err);
      setItemsError(err.response?.data || err.message || "Failed to load items");
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If user becomes authenticated, automatically open dashboard and fetch items
    if (isAuthenticated) {
      setMode("dashboard");
      fetchItems();
    }
  }, [isAuthenticated, fetchItems]);

  useEffect(() => {
    // clear errors on unmount
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      toast.error("Please provide item name and price.");
      return;
    }
    setAddingItem(true);
    try {
      const access = localStorage.getItem("access_token");
      if (!access) throw new Error("Not authenticated");
      const payload = {
        name: newItem.name,
        price: parseFloat(newItem.price),
        stock: parseInt(newItem.stock || "0", 10),
        description: newItem.description,
      };
      const res = await api.post("/seller/items/", payload, {
        headers: { Authorization: `Bearer ${access}` },
      });
      // Prepend new item to the list
      setItems((prev) => [res.data, ...prev]);
      setNewItem({ name: "", price: "", stock: "", description: "" });
      toast.success("Item added.");
    } catch (err) {
      console.error("add item err", err);
      toast.error(err.response?.data?.detail || "Failed to add item.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      const access = localStorage.getItem("access_token");
      await api.delete(`/seller/items/${itemId}/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      toast.success("Item deleted.");
    } catch (err) {
      console.error("delete item err", err);
      toast.error("Failed to delete item.");
    }
  };

  // ---------- Simple UI ----------
  // If on dashboard show seller UI
  if (mode === "dashboard" && isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
              <p className="text-sm text-slate-600">Welcome, {user?.first_name || user?.email}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchItems} className="px-3 py-2 bg-white rounded border">Refresh items</button>
              <button onClick={handleLogout} className="px-3 py-2 bg-red-600 text-white rounded">Logout</button>
            </div>
          </div>

          {/* Add Item */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="font-medium mb-3">Add Item</h2>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" className="p-2 border rounded md:col-span-1" />
              <input value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price" type="number" className="p-2 border rounded md:col-span-1" />
              <input value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} placeholder="Stock" type="number" className="p-2 border rounded md:col-span-1" />
              <div className="flex gap-2 md:col-span-1">
                <button type="submit" disabled={addingItem} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded">
                  {addingItem && <Spinner />} {addingItem ? "Adding..." : "Add"}
                </button>
                <button type="button" onClick={() => setNewItem({ name: "", price: "", stock: "", description: "" })} className="px-4 py-2 bg-gray-100 rounded">Clear</button>
              </div>
              <textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Short description" className="p-2 border rounded md:col-span-4" />
            </form>
          </div>

          {/* Items list */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Items</h3>
              {itemsLoading && <div className="text-sm text-slate-500">Loading...</div>}
            </div>

            {itemsError && <div className="text-red-600 p-2 bg-red-50 rounded">{String(itemsError)}</div>}

            {items.length === 0 && !itemsLoading ? (
              <div className="p-6 bg-white rounded text-center text-slate-600">No items yet. Add your first item above.</div>
            ) : (
              items.map((it) => (
                <div key={it.id || it.pk || it.name} className="bg-white p-4 rounded shadow flex justify-between items-start">
                  <div>
                    <div className="text-lg font-semibold">{it.name}</div>
                    <div className="text-sm text-slate-500">{it.description}</div>
                    <div className="text-sm text-slate-700 mt-2">Price: ₹{it.price} • Stock: {it.stock}</div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <button onClick={() => handleDeleteItem(it.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Auth UI (login | signup | verify) ----------
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-6 rounded-2xl shadow">
          {/* Tabs */}
          {mode !== "verify" && (
            <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
              <button onClick={() => setMode("login")} className={`w-full py-2 rounded-md ${mode === "login" ? "bg-white text-indigo-600 font-medium shadow" : "text-slate-500"}`}>Login</button>
              <button onClick={() => setMode("signup")} className={`w-full py-2 rounded-md ${mode === "signup" ? "bg-white text-indigo-600 font-medium shadow" : "text-slate-500"}`}>Sign up</button>
            </div>
          )}

          {/* Login */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Seller Login</h2>
              {renderError()}
              <div>
                <label className="text-sm">Email</label>
                <input type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full p-2 border rounded" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full p-2 border rounded" placeholder="••••••" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 px-3 text-slate-500">
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded flex items-center justify-center">
                {loading && <Spinner />} {loading ? "Logging in..." : "Log in"}
              </button>
              <div className="text-sm text-center">
                <span>Don't have an account? </span>
                <button type="button" onClick={() => setMode("signup")} className="text-indigo-600 font-medium">Sign up</button>
              </div>
            </form>
          )}

          {/* Sign up */}
          {mode === "signup" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Seller Sign up</h2>
              {renderError()}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input required placeholder="First name" value={signForm.first_name} onChange={(e) => setSignForm({ ...signForm, first_name: e.target.value })} className="p-2 border rounded" />
                <input placeholder="Last name" value={signForm.last_name} onChange={(e) => setSignForm({ ...signForm, last_name: e.target.value })} className="p-2 border rounded" />
              </div>
              <input required type="email" placeholder="Email" value={signForm.email} onChange={(e) => setSignForm({ ...signForm, email: e.target.value })} className="w-full p-2 border rounded" />
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} placeholder="Password" value={signForm.password} onChange={(e) => setSignForm({ ...signForm, password: e.target.value })} className="w-full p-2 border rounded" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute inset-y-0 right-0 px-3 text-slate-500">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>

              {/* Seller profile preview fields - optional initial data */}
              <div className="p-3 bg-slate-50 rounded border">
                <label className="block text-sm font-medium mb-1">Shop name</label>
                <input placeholder="Shop name (optional now)" value={sellerProfile.shop_name} onChange={(e) => setSellerProfile({ ...sellerProfile, shop_name: e.target.value })} className="w-full p-2 border rounded mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="GST (optional)" value={sellerProfile.gst_number} onChange={(e) => setSellerProfile({ ...sellerProfile, gst_number: e.target.value })} className="p-2 border rounded" />
                  <select value={sellerProfile.seller_type} onChange={(e) => setSellerProfile({ ...sellerProfile, seller_type: e.target.value })} className="p-2 border rounded">
                    <option value="individual">Individual</option>
                    <option value="wholesaler">Wholesaler</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <textarea placeholder="Address (optional)" value={sellerProfile.address} onChange={(e) => setSellerProfile({ ...sellerProfile, address: e.target.value })} className="w-full p-2 border rounded mt-2" rows={2} />
              </div>

              <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded flex items-center justify-center">
                {loading && <Spinner />} {loading ? "Creating account..." : "Create seller account"}
              </button>

              <div className="text-sm text-center">
                <span>Already have an account? </span>
                <button type="button" onClick={() => setMode("login")} className="text-indigo-600 font-medium">Log in</button>
              </div>
            </form>
          )}

          {/* Verify OTP */}
          {mode === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Verify OTP</h2>
              <p className="text-sm text-slate-600">We sent a code to <strong>{otpEmail}</strong></p>
              {renderError()}
              <input required placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-2 border rounded text-center" />
              <button type="submit" disabled={loading} className="w-full py-2 bg-indigo-600 text-white rounded">
                {loading ? "Verifying..." : "Verify & Complete"}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setMode("signup")} className="text-sm text-indigo-600">Back to signup</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
