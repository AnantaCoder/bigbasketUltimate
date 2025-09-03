import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../services/api";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    const toastId = toast.loading("Logging you in ⌛...", {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
    try {
      const response = await api.post("/auth/login/", { email, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      toast.update(toastId, {
        render: "Login Successful 🥳",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { access, refresh, user };
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data.detail || "Login failed 🥺",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { email, password, first_name, last_name, is_seller },
    { rejectWithValue }
  ) => {
    const toastId = toast.loading("Creating your account...", {
      position: "bottom-right",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
    try {
      const response = await api.post("/auth/register/", {
        email,
        first_name,
        last_name,
        password,
        password2: password,
        is_seller: is_seller || false,
      });

      toast.update(toastId, {
        render: "OTP sent! Please check your email 📧",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return response.data;
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data.detail || err.message || "Registration failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    const toastId = toast.loading("Verifying OTP ⌛...", {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
    try {
      const response = await api.post("/auth/verify-otp/", { email, otp });
      const { access, refresh, user } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      toast.update(toastId, {
        render: "OTP Verified ✅ You are logged in!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });

      return { access, refresh, user };
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data.detail || "OTP verification failed ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const response = await api.post("/auth/token/refresh/", {
        refresh: refreshToken,
      });

      const { access } = response.data;
      localStorage.setItem("access_token", access);

      return { access };
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return rejectWithValue(error.response?.data || "Token refresh failed");
    }
  }
);


export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    await api.post("/auth/logout/", { refresh: refreshToken });
  } catch (error) {
    console.log("logout section error :- ", error);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
  return {};
});

//
// 🔹 Local storage user parser
//
const getInitialState = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error("failed to parse user from local storage", err);
    return null;
  }
};

//
// 🔹 Slice
//
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getInitialState(),
    accessToken: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    },
    setTokensAndLogin: (state, action) => {
      const { access, refresh, user } = action.payload;
      state.accessToken = access;
      state.refreshToken = refresh;
      state.isAuthenticated = true;
      if (user) {
        state.user = user;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Refresh
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, clearAuth, setTokensAndLogin } = authSlice.actions;
export default authSlice.reducer;
