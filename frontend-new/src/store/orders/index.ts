import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, TokenDataItemState } from '../../types'

const initialState: TokenDataItemState = {
  isRefreshUserData: false,
  minimumOrderSize: 0,
  volumeStepSize: 0,
  openOrders: [],
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setIsRefreshUserData: (state) => {
      state.isRefreshUserData = !state.isRefreshUserData
    },
    setMinimumOrderSize: (state, action) => {
      state.minimumOrderSize = action.payload
    },
    setVolumeStepSize: (state, action) => {
      state.volumeStepSize = action.payload
    },
    setOpenOrders: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.openOrders = action.payload
    },
  },
})

export const {
  setIsRefreshUserData,
  setMinimumOrderSize,
  setVolumeStepSize,
  setOpenOrders,
} = ordersSlice.actions

export default ordersSlice.reducer
