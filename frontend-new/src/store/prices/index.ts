import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { DataItem, PricesHistoryState, HeaderInformation } from '../../types'

const initialState: PricesHistoryState = {
  headerInformation: null,
  pricesHistory: [],
}

const priceHistorySlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
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

export const { setPricesHistory, setHeaderInformation } =
  priceHistorySlice.actions

export default priceHistorySlice.reducer
