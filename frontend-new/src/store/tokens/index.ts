import { HttpAgent } from '@dfinity/agent'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Option } from 'bymax-react-select'

import useTokens from '../../hooks/useTokens'
import { TokenMetadata, TokensState } from '../../types'

const initialState: TokensState = {
  tokens: [],
  loading: false,
  error: null,
  selectedSymbol: null,
}

export const fetchTokens = createAsyncThunk<TokenMetadata[], HttpAgent>(
  'tokens/fetchTokens',
  async (userAgent, thunkAPI) => {
    try {
      const { getTokens } = useTokens()
      const tokens = await getTokens(userAgent)
      return tokens
    } catch (error) {
      console.error('Error fetching tokens:', error)
      return thunkAPI.rejectWithValue('Failed to fetch tokens')
    }
  },
)

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchTokens.fulfilled,
        (state, action: PayloadAction<TokenMetadata[]>) => {
          state.tokens = action.payload
          state.loading = false
        },
      )
      .addCase(fetchTokens.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedSymbol } = tokensSlice.actions

export default tokensSlice.reducer
