import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { DataItem, PricesHistoryState, HeaderInformation } from '../../types'

const initialState: PricesHistoryState = {
  isRefreshPrices: false,
  headerInformation: null,
  pricesHistory: [],
}

const priceHistorySlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
    setIsRefreshPrices: (state) => {
      state.isRefreshPrices = !state.isRefreshPrices
    },
    setPricesHistory: (state, action: PayloadAction<DataItem[] | []>) => {
      state.pricesHistory = action.payload
    },
    setHeaderInformation: (
      state,
      action: PayloadAction<HeaderInformation | null>,
    ) => {
      state.headerInformation = action.payload
    },
  },
})

export const { setIsRefreshPrices, setPricesHistory, setHeaderInformation } =
  priceHistorySlice.actions

export default priceHistorySlice.reducer
