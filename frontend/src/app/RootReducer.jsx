import { combineReducers } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import itemsReducer from './slices/itemsSlice'

const rootReducer = combineReducers({
        auth:authReducer,
        items:itemsReducer,
})

export default rootReducer