import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../services/api"; // Your configured axios instance

const initialState = {
  cart: null,
  savedForLater: [], // Added savedForLater items array
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// ## Async Thunks for API Interaction

// Fetch the user's cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("User not authenticated");
      }

      // 2. Add headers to the request
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.get("/store/cart/", config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch cart");
    }
  }
);

// Add an item to the cart
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (itemId, { rejectWithValue }) => {
    const toastId = toast.loading("Adding to cart...");
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.update(toastId, {
          render: "Please log in first",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return rejectWithValue("User not authenticated");
      }

      // 2. Add headers to the request
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.post(
        "/store/cart/",
        { item_ids: [itemId] },
        config
      );
      toast.update(toastId, {
        render: "Item added to cart!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.detail || "Failed to add item",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

// Remove an item from the cart
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (itemId, { rejectWithValue }) => {
    const toastId = toast.loading("Removing item...");
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.update(toastId, {
          render: "Please log in first",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return rejectWithValue("User not authenticated");
      }

      // 2. Add headers to the request (for axios delete with body)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { item_ids: [itemId] },
      };

      await api.delete("/store/cart/", config);
      toast.update(toastId, {
        render: "Item removed from cart",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      return itemId;
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.detail || "Failed to remove item",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update item quantity in the cart
export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    const toastId = toast.loading("Updating quantity...");
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.update(toastId, {
          render: "Please log in first",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return rejectWithValue("User not authenticated");
      }

      // 2. Add headers to the request
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.patch(
        "/store/cart/",
        { item_id: itemId, quantity },
        config
      );
      toast.update(toastId, {
        render: "Quantity updated",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.detail || "Failed to update quantity",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update quantity in cart
export const updateQuantityInCart = createAsyncThunk(
  "cart/updateQuantity",
  async ({ itemId, quantity }) => {
    const response = await api.updateQuantity(itemId, quantity);
    return response.data;
  }
);

// Fetch saved for later items
export const fetchSavedForLater = createAsyncThunk(
  "cart/fetchSavedForLater",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("User not authenticated");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.get("/store/saved-for-later/", config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch saved for later"
      );
    }
  }
);

// Save item for later (remove from cart and add to saved)
export const saveItemForLater = createAsyncThunk(
  "cart/saveItemForLater",
  async (itemId, { rejectWithValue, dispatch }) => {
    const toastId = toast.loading("Saving for later...");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.update(toastId, {
          render: "Please log in first",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return rejectWithValue("User not authenticated");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // First, remove from cart
      await api.delete("/store/cart/", {
        ...config,
        data: { item_ids: [itemId] },
      });

      // Then, add to saved for later
      const response = await api.post(
        "/store/saved-for-later/",
        { item_id: itemId },
        config
      );

      toast.update(toastId, {
        render: "Item saved for later!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Refetch cart and saved for later
      dispatch(fetchCart());
      dispatch(fetchSavedForLater());

      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.detail || "Failed to save for later",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

// Remove from saved for later
export const removeFromSaved = createAsyncThunk(
  "cart/removeFromSaved",
  async (itemId, { rejectWithValue, dispatch }) => {
    const toastId = toast.loading("Removing from saved...");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.update(toastId, {
          render: "Please log in first",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return rejectWithValue("User not authenticated");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { item_id: itemId },
      };

      await api.delete("/store/saved-for-later/", config);

      toast.update(toastId, {
        render: "Item removed from saved",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Refetch saved for later
      dispatch(fetchSavedForLater());

      return itemId;
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.detail || "Failed to remove from saved",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

// Move to cart from saved (remove from saved and add to cart)
export const moveToCartFromSaved = createAsyncThunk(
  "cart/moveToCartFromSaved",
  async (itemId, { rejectWithValue, dispatch }) => {
    const toastId = toast.loading("Moving to cart...");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.update(toastId, {
          render: "Please log in first",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return rejectWithValue("User not authenticated");
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // First, remove from saved
      await api.delete("/store/saved-for-later/", {
        ...config,
        data: { item_id: itemId },
      });

      // Then, add to cart
      const response = await api.post(
        "/store/cart/",
        { item_ids: [itemId] },
        config
      );

      toast.update(toastId, {
        render: "Item moved to cart!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Refetch cart and saved for later
      dispatch(fetchCart());
      dispatch(fetchSavedForLater());

      return response.data;
    } catch (error) {
      toast.update(toastId, {
        render: error.response?.data?.detail || "Failed to move to cart",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return rejectWithValue(error.response?.data);
    }
  }
);

// ## Cart Slice Definition
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.savedForLater = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload;
        // Transform cart_items to items for frontend compatibility
        if (action.payload && action.payload.cart_items) {
          action.payload.items = action.payload.cart_items.map((cartItem) => ({
            ...cartItem.item,
            quantity: cartItem.quantity,
          }));
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add Item to Cart
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        // Transform cart_items to items for frontend compatibility
        if (action.payload && action.payload.cart_items) {
          action.payload.items = action.payload.cart_items.map((cartItem) => ({
            ...cartItem.item,
            quantity: cartItem.quantity,
          }));
        }
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Remove Item from Cart
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        const removedItemId = action.payload;
        if (state.cart && state.cart.items) {
          const removedItem = state.cart.items.find(
            (item) => item.id === removedItemId
          );
          if (removedItem) {
            state.cart.total_price = (
              parseFloat(state.cart.total_price) - parseFloat(removedItem.price)
            ).toFixed(2);
          }
          state.cart.items = state.cart.items.filter(
            (item) => item.id !== removedItemId
          );
        }
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Item Quantity
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
        // Transform cart_items to items for frontend compatibility
        if (action.payload && action.payload.cart_items) {
          action.payload.items = action.payload.cart_items.map((cartItem) => ({
            ...cartItem.item,
            quantity: cartItem.quantity,
          }));
        }
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Quantity in Cart
      .addCase(updateQuantityInCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateQuantityInCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch Saved For Later
      .addCase(fetchSavedForLater.fulfilled, (state, action) => {
        state.savedForLater = action.payload.map((savedItem) => ({
          ...savedItem.item,
          quantity: savedItem.quantity,
        }));
      })
      .addCase(fetchSavedForLater.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Save Item For Later
      .addCase(saveItemForLater.fulfilled, () => {
        // State is updated via refetch
      })
      .addCase(saveItemForLater.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Remove From Saved
      .addCase(removeFromSaved.fulfilled, () => {
        // State is updated via refetch
      })
      .addCase(removeFromSaved.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Move To Cart From Saved
      .addCase(moveToCartFromSaved.fulfilled, () => {
        // State is updated via refetch
      })
      .addCase(moveToCartFromSaved.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
