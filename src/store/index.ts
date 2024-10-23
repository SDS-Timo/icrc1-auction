import { configureStore } from '@reduxjs/toolkit'

import authReducer from './auth'
import balancesReducer from './balances'
import languageReducer from './language'
import ordersReducer from './orders'
import pricesReducer from './prices'
import tokensReducer from './tokens'
import uiSettings from './uiSettings'

const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
    tokens: tokensReducer,
    prices: pricesReducer,
    orders: ordersReducer,
    balances: balancesReducer,
    uiSettings: uiSettings,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
