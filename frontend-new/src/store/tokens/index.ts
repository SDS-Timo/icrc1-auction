import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  TokenMetadata,
  TokensState,
  Option,
  HeaderInformation,
} from '../../types'

const initialState: TokensState = {
  headerInformation: null,
  selectedSymbol: null,
  selectedQuote: {
    decimals: 6,
    fee: '',
    logo: '',
    name: 'USDC',
    symbol: 'USDC',
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
    setHeaderInformation: (
      state,
      action: PayloadAction<HeaderInformation | null>,
    ) => {
      state.headerInformation = action.payload
    },
  },
})

export const { setSelectedSymbol, setSelectedQuote, setHeaderInformation } =
  tokensSlice.actions

export default tokensSlice.reducer
