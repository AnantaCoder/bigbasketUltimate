import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../services/api";


export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async ({ page = 1, pageSize = 10, search, category, ...params } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/store/new-items/", {
        params: {
          ...params,
          ...(search ? { search } : {}),
          ...(category ? { category } : {}),
          page,
          page_size: pageSize,
        },
      });

      const data = response.data;

      return {
        results: data.results || [],
        next: Boolean(data.next),
        page,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);




export const fetchItem = createAsyncThunk(
  "items/fetchItem",
  async (id, { rejectWithValue }) => {
    const toastId = toast.loading("Loading item ..", { autoClose: false });
    try {
      const response = await api.get(`/store/items/${id}/`);
      toast.update(toastId, {
        render: "item loaded",
      });
      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render:
          error.response?.data.error ||
          error.response?.data.detail ||
          "failed to load item",
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createItem = createAsyncThunk(
  "items/createItem",
  async (itemData, { rejectWithValue }) => {
    const toastId = toast.loading("Creating item ..", { autoClose: false });

    try {
      const token = localStorage.getItem("access_token");

      // ✅ Always use a new FormData
      const formData = new FormData();

      formData.append("item_name", itemData.item_name);
      formData.append("item_type", itemData.item_type);
      formData.append("manufacturer", itemData.manufacturer);
      formData.append("category_id", itemData.category_id);
      formData.append("quantity", itemData.quantity);
      formData.append("price", itemData.price);
      formData.append("description", itemData.description || "");
      formData.append("sku", itemData.sku || "");
      formData.append("refers_token", itemData.refers_token || "");

      if (itemData.image && itemData.image.length > 0) {
  itemData.image.forEach((file) => {
    formData.append("image", file);  
  });
}

      // POST request
      const response = await api.post("/store/new-items/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.update(toastId, {
        render: "Item created successfully 🎉",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to create item ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });

      return rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);


export const updateItem = createAsyncThunk(
  "items/updateItem",
  async (itemData, { rejectWithValue }) => {
    const toastId = toast.loading("Updating item ..", { autoClose: false });

    try {
      const { id, ...data } = itemData;

      const response = await api.put(`/store/items/${id}/`, data);
      toast.update(toastId, {
        render: "Item updated ✅",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render:
          error.response?.data.error ||
          error.response?.data.detail ||
          "Failed to update item ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  "items/deleteItem",
  async (id, { rejectWithValue }) => {
    const toastId = toast.loading("Deleting item ..", { autoClose: false });
    try {
      await api.delete(`/store/items/${id}/`);
      toast.update(toastId, {
        render: "item deleted",
      });
      return id;
    } catch (error) {
      toast.update(toastId, {
        render:
          error.response?.data.error ||
          error.response?.data.detail ||
          "failed to delete item",
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const itemsSlice = createSlice({
  name: "items",
  initialState: {
    items: [],
    itemDetail: null,
    loading: false,
    detailLoading: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
  },
  reducers: {
    clearItems(state) {
      state.items = [];
      state.error = null;
    },
    clearItemDetail(state) {
      state.itemDetail = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setItems(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else if (action.payload && Array.isArray(action.payload.results)) {
          state.items = action.payload.results;
        } else {
          state.items = action.payload;
        }
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchItem.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchItem.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.itemDetail = action.payload;
      })
      .addCase(fetchItem.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(createItem.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
          state.itemDetail = action.payload;
        }
      })
      .addCase(createItem.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateItem.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.updating = false;
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((it) =>
            it.id === updated.id ? updated : it
          );
          if (state.itemDetail && state.itemDetail.id === updated.id) {
            state.itemDetail = updated;
          }
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteItem.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.deleting = false;
        const id = action.payload;
        state.items = state.items.filter((it) => it.id !== id);
        if (state.itemDetail && state.itemDetail.id === id) {
          state.itemDetail = null;
        }
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearItems, clearItemDetail, clearError, setItems } =
  itemsSlice.actions;
export const selectAllItems = (state) => state.items.items;
export const selectItemsLoading = (state) => state.items.loading;
export const selectItemDetail = (state) => state.items.itemDetail;
export const selectItemsError = (state) => state.items.error;
export default itemsSlice.reducer;
