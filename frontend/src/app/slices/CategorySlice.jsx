import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const params = { page, pageSize };
      const response = await api.get("/store/categories/", { params });

      const categoriesArray = response.data;

      // We create the payload object that the rest of our app expects.
      return {
        categories: categoriesArray,
        totalItems: categoriesArray.length, // Get count from the array itself
        page,
        pageSize,
      };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch categories.";
      return rejectWithValue({ message });
    }
  }
);

// NEW: Thunk for adding a new item
export const addItem = createAsyncThunk(
  "categories/addItem",
  async (itemFormData, { rejectWithValue }) => {
    try {
      // We must send file data using 'multipart/form-data'
      const response = await api.post("/store/items/", itemFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Failed to add item. Please check the form and try again.";
      return rejectWithValue({ message });
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    loading: false, // For fetching categories
    error: null,
    page: 1,
    totalPages: 1,
    // NEW state for adding an item
    itemLoading: false,
    itemError: null,
    itemAddSuccess: false,
  },
  reducers: {
    // NEW reducer to reset the success status after form reset
    resetItemAddStatus: (state) => {
      state.itemAddSuccess = false;
      state.itemError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetching categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.page = payload.page;
        state.categories = payload.categories;
        state.totalPages = Math.ceil(payload.totalItems / payload.pageSize);
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // NEW cases for adding an item
      .addCase(addItem.pending, (state) => {
        state.itemLoading = true;
        state.itemError = null;
        state.itemAddSuccess = false;
      })
      .addCase(addItem.fulfilled, (state) => {
        state.itemLoading = false;
        state.itemAddSuccess = true;
      })
      .addCase(addItem.rejected, (state, { payload }) => {
        state.itemLoading = false;
        state.itemError = payload.message;
      });
  },
});

export const { resetItemAddStatus } = categorySlice.actions;
export default categorySlice.reducer;