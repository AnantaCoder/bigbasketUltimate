import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import itemsReducer from "./slices/itemsSlice";
import categoriesReducer from "./slices/CategorySlice";
import cartReducer from "./slices/CartSlice";
import bestSellersReducer from "./slices/bestSellersSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  items: itemsReducer,
  categories: categoriesReducer,
  cart: cartReducer,
  bestSellers: bestSellersReducer,
});

export default rootReducer;
