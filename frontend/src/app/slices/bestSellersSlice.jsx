import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch best sellers
export const fetchBestSellers = createAsyncThunk(
  "bestSellers/fetchBestSellers",
  async ({ page = 2, pageSize = 10, ...params } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/store/new-items/", {
        params: {
          ...params,
          page,
          page_size: pageSize,
        },
      });

      const data = response.data;

      return {
        items: data.results || data || [],
        next: Boolean(data.next),
        page,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const bestSellersSlice = createSlice({
  name: "bestSellers",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearBestSellers(state) {
      state.items = [];
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBestSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBestSellers, clearError } = bestSellersSlice.actions;

// Selectors
export const selectBestSellers = (state) => state.bestSellers.items;
export const selectBestSellersLoading = (state) => state.bestSellers.loading;
export const selectBestSellersError = (state) => state.bestSellers.error;

export default bestSellersSlice.reducer;
