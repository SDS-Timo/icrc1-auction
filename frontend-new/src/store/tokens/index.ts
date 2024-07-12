import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TokenMetadata, TokensState, Option } from '../../types'

const initialState: TokensState = {
  selectedSymbol: null,
  selectedQuote: {
    decimals: 6,
    fee: '',
    logo: '',
    name: 'USDC',
    symbol: 'USDC',
    quote: 'USDC',
    base: 'USDC',
  },
}

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setSelectedSymbol: (
      state,
      action: PayloadAction<Option | Option[] | null>,
    ) => {
      state.selectedSymbol = action.payload
    },
    setSelectedQuote: (state, action: PayloadAction<TokenMetadata>) => {
      state.selectedQuote = action.payload
    },
  },
})

export const { setSelectedSymbol, setSelectedQuote } = tokensSlice.actions

export default tokensSlice.reducer
