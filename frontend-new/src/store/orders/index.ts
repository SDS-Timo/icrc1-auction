import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, TokenDataItemState } from '../../types'

const initialState: TokenDataItemState = {
  isRefreshOpenOrders: false,
  minimumOrderSize: 0,
  orderStepSize: 0,
  openOrders: [],
}

const openOrdersSlice = createSlice({
  name: 'openOrders',
  initialState,
  reducers: {
    setIsRefreshOpenOrders: (state) => {
      state.isRefreshOpenOrders = !state.isRefreshOpenOrders
    },
    setMinimumOrderSize: (state, action) => {
      state.minimumOrderSize = action.payload
    },
    setOrderStepSize: (state, action) => {
      state.orderStepSize = action.payload
    },
    setOpenOrders: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.openOrders = action.payload
    },
  },
})

export const {
  setIsRefreshOpenOrders,
  setMinimumOrderSize,
  setOrderStepSize,
  setOpenOrders,
} = openOrdersSlice.actions

export default openOrdersSlice.reducer
