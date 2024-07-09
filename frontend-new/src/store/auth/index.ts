import { HttpAgent, AnonymousIdentity } from '@dfinity/agent'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Draft } from 'immer'

import { getAgent } from '../../utils/authUtils'

interface AuthState {
  userAgent: HttpAgent
  isAuthenticated: boolean
}

const anonymousIdentity = getAgent(new AnonymousIdentity())

const initialState: AuthState = {
  userAgent: anonymousIdentity,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAgent: (
      state: Draft<AuthState>,
      action: PayloadAction<HttpAgent>,
    ) => {
      state.userAgent = action.payload
    },
    setIsAuthenticated: (
      state: Draft<AuthState>,
      action: PayloadAction<boolean>,
    ) => {
      state.isAuthenticated = action.payload
    },
    logout: (state: Draft<AuthState>) => {
      state.userAgent = anonymousIdentity
      state.isAuthenticated = false
    },
  },
})

export const { setUserAgent, setIsAuthenticated, logout } = authSlice.actions
export default authSlice.reducer
