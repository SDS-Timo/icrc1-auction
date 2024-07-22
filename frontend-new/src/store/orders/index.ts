import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenDataItem, TokenDataItemState } from '../../types'

const initialState: TokenDataItemState = {
  isRefreshOpenOrders: false,
  openOrders: [],
}

const openOrdersSlice = createSlice({
  name: 'openOrders',
  initialState,
  reducers: {
    setIsRefreshOpenOrders: (state) => {
      state.isRefreshOpenOrders = !state.isRefreshOpenOrders
    },
    setOpenOrders: (state, action: PayloadAction<TokenDataItem[] | []>) => {
      state.openOrders = action.payload
    },
  },
})

export const { setIsRefreshOpenOrders, setOpenOrders } = openOrdersSlice.actions

export default openOrdersSlice.reducer
