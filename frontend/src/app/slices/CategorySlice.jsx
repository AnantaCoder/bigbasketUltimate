import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Fetch all categories (with subcategories)
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ page = 1, pageSize = 50 }) => {
    const response = await api.get(
      `/store/categories/?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  }
);

// Fetch single category (with parent chain for breadcrumb)
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id) => {
    const response = await api.get(`/store/categories/${id}/breadcrumb/`);
    return response.data;
  }
);

// Fetch items by category id
export const fetchItemsByCategory = createAsyncThunk(
  "categories/fetchItemsByCategory",
  async ({ id, params = {} }) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/store/categories/${id}/items/?${query}`);
    return response.data;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    selectedCategory: null,
    categoryItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchItemsByCategory.fulfilled, (state, action) => {
        state.categoryItems = action.payload.results;
      });
  },
});

export default categorySlice.reducer;
