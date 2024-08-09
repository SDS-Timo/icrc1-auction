import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, TokenDataItemState } from '../../types'

const initialState: TokenDataItemState = {
  isRefreshOpenOrders: false,
  minimumOrderSize: 0,
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
    setOpenOrders: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.openOrders = action.payload
    },
  },
})

export const { setIsRefreshOpenOrders, setMinimumOrderSize, setOpenOrders } =
  openOrdersSlice.actions

export default openOrdersSlice.reducer
