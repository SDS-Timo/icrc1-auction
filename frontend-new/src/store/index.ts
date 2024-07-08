import { configureStore } from '@reduxjs/toolkit'

import authReducer from './auth'
import languageReducer from './language'
import pricesReducer from './prices'
import tokensReducer from './tokens'

const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
    tokens: tokensReducer,
    prices: pricesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
