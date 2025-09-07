import { combineReducers } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import itemsReducer from './slices/itemsSlice'
import categoriesReducer from './slices/CategorySlice'
import cartReducer from './slices/CartSlice'

const rootReducer = combineReducers({
        auth:authReducer,
        items:itemsReducer,
        categories:categoriesReducer,
        cart:cartReducer,
})

export default rootReducer