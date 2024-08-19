import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, TokenDataItemState } from '../../types'

const initialState: TokenDataItemState = {
  isRefreshUserData: false,
  minimumOrderSize: 0,
  orderStepSize: 0,
  openOrders: [],
}

const openOrdersSlice = createSlice({
  name: 'openOrders',
  initialState,
  reducers: {
    setIsRefreshUserData: (state) => {
      state.isRefreshUserData = !state.isRefreshUserData
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
  setIsRefreshUserData,
  setMinimumOrderSize,
  setOrderStepSize,
  setOpenOrders,
} = openOrdersSlice.actions

export default openOrdersSlice.reducer
